"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { ensureUser } from "./session";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getAuthUser,
  isValidEmail,
  validatePassword,
} from "./auth";
import { getClientIp, isBlocked, bump, resetLimit } from "./ratelimit";
import { createNotification } from "./notify";
import { slugify, circleSlugify } from "./slug";

const MIN = 60 * 1000;

function tagNameToSlug(name: string): string {
  const ascii = name
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || `t-${Math.random().toString(36).slice(2, 7)}`;
}

async function connectOrCreateTags(names: string[]) {
  const clean = [...new Set(names.map((n) => n.trim()).filter(Boolean))].slice(0, 5);
  const tagIds: string[] = [];
  for (const name of clean) {
    const existing = await prisma.tag.findFirst({ where: { name } });
    const tag = existing ?? (await prisma.tag.create({ data: { name, slug: tagNameToSlug(name) } }));
    tagIds.push(tag.id);
  }
  return tagIds;
}

// ---- 質問を投稿 ----
export async function askQuestion(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const circleSlug = String(formData.get("circle") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");

  if (title.length < 4 || body.length < 4) {
    redirect("/ask?error=short");
  }

  const user = await ensureUser({ displayName, role });
  const tagNames = tagsRaw.split(/[,、\s]+/).filter(Boolean);
  const tagIds = await connectOrCreateTags(tagNames);

  const circle = circleSlug
    ? await prisma.circle.findUnique({ where: { slug: circleSlug } })
    : null;

  const q = await prisma.question.create({
    data: {
      slug: slugify(title),
      title,
      body,
      authorId: user.id,
      circleId: circle?.id ?? null,
      tags: { create: tagIds.map((id) => ({ tag: { connect: { id } } })) },
    },
  });

  revalidatePath("/");
  redirect(`/questions/${q.slug}`);
}

// ---- 回答を投稿 ----
export async function postAnswer(formData: FormData) {
  const questionId = String(formData.get("questionId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!questionId || body.length < 2) redirect(`/questions/${slug}#answer`);

  const user = await ensureUser({ displayName, role });
  await prisma.answer.create({ data: { body, questionId, authorId: user.id } });

  // 質問の投稿者に通知
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { authorId: true, title: true },
  });
  if (question) {
    await createNotification({
      userId: question.authorId,
      actorId: user.id,
      type: "answer",
      message: `あなたの質問「${question.title.slice(0, 24)}」に回答がつきました`,
      link: `/questions/${slug}#answers`,
    });
  }

  revalidatePath(`/questions/${slug}`);
  redirect(`/questions/${slug}#answers`);
}

// ---- 投票（役に立った）トグル ----
export async function toggleVote(formData: FormData) {
  const questionId = String(formData.get("questionId") ?? "") || null;
  const answerId = String(formData.get("answerId") ?? "") || null;
  const slug = String(formData.get("slug") ?? "");

  const user = await ensureUser();

  const existing = await prisma.vote.findFirst({
    where: {
      userId: user.id,
      ...(questionId ? { questionId } : {}),
      ...(answerId ? { answerId } : {}),
    },
  });

  if (existing) {
    await prisma.vote.delete({ where: { id: existing.id } });
  } else {
    await prisma.vote.create({
      data: { userId: user.id, questionId, answerId },
    });
  }

  if (slug) revalidatePath(`/questions/${slug}`);
  else revalidatePath("/");
}

// ---- サークル参加／退会トグル ----
export async function toggleJoinCircle(formData: FormData) {
  const circleId = String(formData.get("circleId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!circleId) return;

  const user = await ensureUser();
  const existing = await prisma.circleMember.findUnique({
    where: { circleId_userId: { circleId, userId: user.id } },
  });
  if (existing) {
    await prisma.circleMember.delete({ where: { id: existing.id } });
  } else {
    await prisma.circleMember.create({ data: { circleId, userId: user.id } });
  }
  revalidatePath(`/circles/${slug}`);
  revalidatePath("/circles");
}

// ---- タイムラインへの投稿 / 返信 ----
export async function postToCircle(formData: FormData) {
  const circleId = String(formData.get("circleId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "") || null;
  if (!circleId || body.length < 1) redirect(`/circles/${slug}?tab=timeline`);

  const user = await ensureUser({ displayName });
  // 投稿者は自動的にメンバーにする
  await prisma.circleMember.upsert({
    where: { circleId_userId: { circleId, userId: user.id } },
    create: { circleId, userId: user.id },
    update: {},
  });
  await prisma.circlePost.create({ data: { body, circleId, authorId: user.id, parentId } });

  // 返信のときは親投稿の投稿者に通知
  if (parentId) {
    const parent = await prisma.circlePost.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });
    if (parent) {
      await createNotification({
        userId: parent.authorId,
        actorId: user.id,
        type: "reply",
        message: "あなたのタイムライン投稿に返信がつきました",
        link: `/circles/${slug}?tab=timeline#posts`,
      });
    }
  }

  revalidatePath(`/circles/${slug}`);
  redirect(`/circles/${slug}?tab=timeline#posts`);
}

// ---- 新しいサークルを作成 ----
export async function createCircle(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "🌱").trim() || "🌱";
  if (name.length < 2) redirect("/circles?error=short");

  const user = await ensureUser();
  const circle = await prisma.circle.create({
    data: {
      name,
      description: description || "みんなで話せる場所です。",
      emoji,
      slug: `${circleSlugify(name)}-${Math.random().toString(36).slice(2, 6)}`,
      members: { create: { userId: user.id } },
    },
  });
  revalidatePath("/circles");
  redirect(`/circles/${circle.slug}`);
}

// ---- プロフィール（ニックネーム・役割）を設定 ----
export async function saveProfile(formData: FormData) {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  await ensureUser({ displayName, role });
  revalidatePath("/");
}

// ---- 新規登録（メール＋パスワード） ----
// 匿名で使っていた場合は、その投稿を引き継いでアカウント化する。
export async function registerUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "member").trim();

  // スパム登録対策：同一IPからの登録回数を制限（1時間に5回まで）
  const ip = await getClientIp();
  if (await isBlocked(`register:ip:${ip}`, 5)) redirect("/register?error=ratelimit");

  if (!isValidEmail(email)) redirect("/register?error=email");

  const pwError = validatePassword(password, email);
  if (pwError) redirect("/register?error=password");

  await bump(`register:ip:${ip}`, 60 * MIN);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/register?error=taken");

  const passwordHash = await hashPassword(password);

  // 匿名cookieユーザーがいれば昇格（投稿を引き継ぐ）、いなければ新規作成
  const jar = await cookies();
  const anonId = jar.get("tobira_uid")?.value;
  const anon = anonId ? await prisma.user.findUnique({ where: { id: anonId } }) : null;

  let user;
  if (anon && !anon.email) {
    user = await prisma.user.update({
      where: { id: anon.id },
      data: {
        email,
        passwordHash,
        ...(displayName ? { displayName } : {}),
        ...(role ? { role } : {}),
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        handle: `tobira-${Math.random().toString(36).slice(2, 8)}`,
        displayName: displayName || "とびらユーザー",
        role: role || "member",
        email,
        passwordHash,
      },
    });
  }

  await createSession(user.id);
  redirect(`/u/${user.handle}`);
}

// ---- ログイン ----
export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // 総当たり対策：IP・メールごとに失敗回数を制限
  const ip = await getClientIp();
  const ipKey = `login:ip:${ip}`;
  const emailKey = `login:email:${email}`;
  if ((await isBlocked(ipKey, 10)) || (await isBlocked(emailKey, 5))) {
    redirect("/login?error=ratelimit");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    // 失敗のみカウント（10分ウィンドウ）
    await bump(ipKey, 10 * MIN);
    await bump(emailKey, 10 * MIN);
    redirect("/login?error=invalid");
  }

  // 成功したらメールの失敗カウンタをリセット
  await resetLimit(emailKey);
  await createSession(user.id);
  redirect(`/u/${user.handle}`);
}

// ---- ログアウト ----
export async function logoutUser() {
  await destroySession();
  revalidatePath("/");
  redirect("/");
}

// ---- 通知を既読にする（現在ユーザーの未読をすべて） ----
export async function markNotificationsRead() {
  const user = await ensureUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  revalidatePath("/notifications");
}

// ---- プロフィール詳細を更新（bio含む・本登録者向け） ----
export async function updateAccount(formData: FormData) {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(displayName ? { displayName } : {}),
      ...(role ? { role } : {}),
      bio: bio || null,
    },
  });
  revalidatePath(`/u/${user.handle}`);
}
