"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { ensureUser, getCurrentUser } from "./session";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getAuthUser,
  isValidEmail,
  validatePassword,
  createToken,
  consumeToken,
} from "./auth";
import { getClientIp, isBlocked, bump, resetLimit } from "./ratelimit";
import { createNotification } from "./notify";
import { sendVerificationEmail, sendResetEmail, sendContactEmail } from "./email";
import { slugify, circleSlugify } from "./slug";

const HOUR = 60 * 60 * 1000;

// 確認メールを送る（失敗しても登録は妨げない）
async function dispatchVerification(userId: string, email: string): Promise<void> {
  try {
    const token = await createToken(userId, "verify", 24 * HOUR);
    await sendVerificationEmail(email, token);
  } catch (e) {
    console.error("[verify email]", e);
  }
}

const MIN = 60 * 1000;

// ADMIN_EMAILS（カンマ区切り）に一致するユーザーへ管理者権限を付与
async function applyAdminFlag(userId: string, email: string): Promise<void> {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (admins.includes(email.toLowerCase())) {
    await prisma.user.update({ where: { id: userId }, data: { isAdmin: true } });
  }
}

// コンテンツの非表示/復帰
async function setHidden(type: string, id: string, hidden: boolean): Promise<void> {
  if (type === "question") await prisma.question.update({ where: { id }, data: { hidden } });
  else if (type === "answer") await prisma.answer.update({ where: { id }, data: { hidden } });
  else if (type === "post") await prisma.circlePost.update({ where: { id }, data: { hidden } });
  else if (type === "comment") await prisma.comment.update({ where: { id }, data: { hidden } });
}

// 管理者のみ許可（そうでなければトップへ）
async function requireAdmin() {
  const u = await getAuthUser();
  if (!u || !u.isAdmin) redirect("/");
  return u;
}

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

  await applyAdminFlag(user.id, email);
  await dispatchVerification(user.id, email);
  await createSession(user.id);
  redirect(`/u/${user.handle}`);
}

// ---- 確認メールを再送 ----
export async function resendVerification() {
  const user = await getAuthUser();
  if (!user || !user.email || user.emailVerified) redirect("/");
  const ip = await getClientIp();
  if (await isBlocked(`verifysend:ip:${ip}`, 5)) redirect(`/u/${user.handle}?verify=limit`);
  await bump(`verifysend:ip:${ip}`, HOUR);
  await dispatchVerification(user.id, user.email);
  redirect(`/u/${user.handle}?verify=sent`);
}

// ---- メール確認（トークンを検証） ----
export async function confirmEmail(token: string): Promise<boolean> {
  const userId = await consumeToken(token, "verify");
  if (!userId) return false;
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  return true;
}

// ---- パスワード再設定メールを要求 ----
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const ip = await getClientIp();
  // 送信スパム対策
  if (!(await isBlocked(`resetreq:ip:${ip}`, 5))) {
    await bump(`resetreq:ip:${ip}`, HOUR);
    const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
    if (user && user.passwordHash) {
      try {
        const token = await createToken(user.id, "reset", HOUR);
        await sendResetEmail(email, token);
      } catch (e) {
        console.error("[reset email]", e);
      }
    }
  }
  // メールの存在有無を漏らさないため、常に同じ結果へ
  redirect("/forgot?sent=1");
}

// ---- パスワード再設定を実行 ----
export async function resetPassword(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  // パスワード検証はトークン消費より前に（弱いだけでトークンを無駄にしない）
  const pwError = validatePassword(password);
  if (pwError) redirect(`/reset?error=password&token=${encodeURIComponent(token)}`);

  const userId = await consumeToken(token, "reset");
  if (!userId) redirect("/reset?error=invalid");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/reset?error=invalid");

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, emailVerified: user.emailVerified ?? new Date() },
  });
  // 既存セッションを無効化（安全のため）してから新規ログイン
  await prisma.session.deleteMany({ where: { userId } });
  await createSession(userId);
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
  await applyAdminFlag(user.id, email);
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

// ===== 通報・モデレーション =====

const REPORT_REASONS = new Set(["spam", "harassment", "selfharm", "inappropriate", "other"]);
const AUTO_HIDE_THRESHOLD = 3; // この件数の通報で自動的に非表示（要確認）

// ---- コンテンツを通報 ----
export async function reportContent(formData: FormData) {
  const targetType = String(formData.get("targetType") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const reason = String(formData.get("reason") ?? "other");
  const detail = String(formData.get("detail") ?? "").trim().slice(0, 500);
  const from = String(formData.get("from") ?? "/");

  if (!["question", "answer", "post", "comment"].includes(targetType) || !targetId) redirect(from);
  const safeReason = REPORT_REASONS.has(reason) ? reason : "other";

  // 通報スパム対策（同一IPで1時間に20件まで）
  const ip = await getClientIp();
  if (await isBlocked(`report:ip:${ip}`, 20)) redirect(`${from}?reported=limit`);
  await bump(`report:ip:${ip}`, 60 * MIN);

  const user = await ensureUser();

  // 同じ人が同じ対象を重複通報しない
  const dup = await prisma.report.findFirst({
    where: { reporterId: user.id, targetId, status: "open" },
  });
  if (dup) redirect(`${from}?reported=1`);

  await prisma.report.create({
    data: {
      reporterId: user.id,
      targetType,
      targetId,
      reason: safeReason,
      detail: detail || null,
    },
  });

  // 一定数の通報が集まったら自動的に非表示（モデレーターの確認待ち）
  const openCount = await prisma.report.count({ where: { targetId, status: "open" } });
  if (openCount >= AUTO_HIDE_THRESHOLD) {
    await setHidden(targetType, targetId, true);
  }

  redirect(`${from}?reported=1`);
}

// ---- 質問・回答へのコメントを投稿 ----
export async function postComment(formData: FormData) {
  const questionId = String(formData.get("questionId") ?? "") || null;
  const answerId = String(formData.get("answerId") ?? "") || null;
  const slug = String(formData.get("slug") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 500);
  const displayName = String(formData.get("displayName") ?? "").trim();
  if ((!questionId && !answerId) || body.length < 1) redirect(`/questions/${slug}`);

  const user = await ensureUser({ displayName });
  await prisma.comment.create({ data: { body, questionId, answerId, authorId: user.id } });

  // コメント先の投稿者に通知
  let recipientId: string | null = null;
  if (answerId) {
    const a = await prisma.answer.findUnique({ where: { id: answerId }, select: { authorId: true } });
    recipientId = a?.authorId ?? null;
  } else if (questionId) {
    const q = await prisma.question.findUnique({ where: { id: questionId }, select: { authorId: true } });
    recipientId = q?.authorId ?? null;
  }
  if (recipientId) {
    await createNotification({
      userId: recipientId,
      actorId: user.id,
      type: "comment",
      message: answerId ? "あなたの回答にコメントがつきました" : "あなたの質問にコメントがつきました",
      link: `/questions/${slug}#answers`,
    });
  }

  revalidatePath(`/questions/${slug}`);
  redirect(`/questions/${slug}#answers`);
}

// ---- コメントを削除（本人または管理者） ----
export async function deleteComment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const user = await getCurrentUser();
  const c = await prisma.comment.findUnique({ where: { id }, select: { authorId: true } });
  if (!user || !c) redirect(`/questions/${slug}`);
  if (c.authorId !== user.id && !user.isAdmin) redirect(`/questions/${slug}`);
  await prisma.comment.delete({ where: { id } });
  revalidatePath(`/questions/${slug}`);
  redirect(`/questions/${slug}#answers`);
}

// ---- 自分の投稿を削除（本人または管理者） ----
export async function deleteQuestion(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const user = await getCurrentUser();
  const q = await prisma.question.findUnique({ where: { id }, select: { authorId: true } });
  if (!user || !q) redirect("/");
  if (q.authorId !== user.id && !user.isAdmin) redirect("/");
  await prisma.question.delete({ where: { id } });
  revalidatePath("/");
  redirect("/questions");
}

export async function deleteAnswer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const user = await getCurrentUser();
  const a = await prisma.answer.findUnique({ where: { id }, select: { authorId: true } });
  if (!user || !a) redirect(`/questions/${slug}`);
  if (a.authorId !== user.id && !user.isAdmin) redirect(`/questions/${slug}`);
  await prisma.answer.delete({ where: { id } });
  revalidatePath(`/questions/${slug}`);
  redirect(`/questions/${slug}#answers`);
}

export async function deleteCirclePost(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const user = await getCurrentUser();
  const p = await prisma.circlePost.findUnique({ where: { id }, select: { authorId: true } });
  if (!user || !p) redirect(`/circles/${slug}`);
  if (p.authorId !== user.id && !user.isAdmin) redirect(`/circles/${slug}`);
  await prisma.circlePost.delete({ where: { id } });
  revalidatePath(`/circles/${slug}`);
  redirect(`/circles/${slug}?tab=timeline`);
}

// ---- モデレーション（管理者のみ）：非表示/復帰 ----
export async function moderateHide(formData: FormData) {
  await requireAdmin();
  const type = String(formData.get("type") ?? "");
  const id = String(formData.get("id") ?? "");
  const hidden = String(formData.get("hidden") ?? "true") === "true";
  const reportId = String(formData.get("reportId") ?? "");
  await setHidden(type, id, hidden);
  // 対象の通報を対応済みにする
  await prisma.report.updateMany({
    where: { targetId: id, status: "open" },
    data: { status: "resolved", resolvedAt: new Date() },
  });
  if (reportId) revalidatePath("/moderation");
  revalidatePath("/moderation");
}

// ---- モデレーション（管理者のみ）：通報を対応済み/却下 ----
export async function resolveReport(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "dismissed");
  const safe = ["resolved", "dismissed"].includes(status) ? status : "dismissed";
  await prisma.report.update({
    where: { id },
    data: { status: safe, resolvedAt: new Date() },
  });
  revalidatePath("/moderation");
}

// ---- お問い合わせ（メアド非公開・IPレート制限つき） ----
export async function submitContact(formData: FormData) {
  const category = String(formData.get("category") ?? "その他").slice(0, 40);
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);

  // ハニーポット（bot対策）：埋まっていたら成功したふりをして無視
  if (String(formData.get("website") ?? "")) redirect("/contact?sent=1");

  if (message.length < 5) redirect("/contact?error=empty");
  if (email && !isValidEmail(email)) redirect("/contact?error=email");

  // IPごとに1時間5件まで
  const ip = await getClientIp();
  const key = `contact:${ip}`;
  if (await isBlocked(key, 5)) redirect("/contact?error=limit");
  await bump(key, HOUR);

  try {
    await sendContactEmail({ category, name, email, message });
  } catch (e) {
    console.error("[contact] 送信失敗", e);
    redirect("/contact?error=send");
  }
  redirect("/contact?sent=1");
}

// ---- 支援先一覧「間違いを報告」→ DBに保存（IPレート制限つき） ----
export async function reportEntry(formData: FormData) {
  const target = String(formData.get("target") ?? "").trim().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim().slice(0, 2000);

  if (String(formData.get("website") ?? "")) redirect("/tools/shien/report?sent=1"); // ハニーポット
  if (!target || message.length < 3) redirect(`/tools/shien/report?about=${encodeURIComponent(target)}&error=empty`);

  const ip = await getClientIp();
  const key = `entryreport:${ip}`;
  if (await isBlocked(key, 10)) redirect(`/tools/shien/report?about=${encodeURIComponent(target)}&error=limit`);
  await bump(key, HOUR);

  await prisma.entryReport.create({ data: { target, message } });
  redirect("/tools/shien/report?sent=1");
}

// ---- 報告を対応済みにする（管理者のみ） ----
export async function resolveEntryReport(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.entryReport.update({ where: { id }, data: { status: "resolved", resolvedAt: new Date() } });
  revalidatePath("/reports");
}

// ---- 支援先を投稿（ログインユーザーのみ・承認待ちで保存） ----
export async function submitEntry(formData: FormData) {
  const user = await getAuthUser();
  if (!user) redirect("/login?next=/tools/shien/add");

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const type = String(formData.get("type") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim().slice(0, 60) || null;
  const online = String(formData.get("online") ?? "") === "on";
  const url = String(formData.get("url") ?? "").trim().slice(0, 300) || null;
  const tel = String(formData.get("tel") ?? "").trim().slice(0, 40) || null;
  const note = String(formData.get("note") ?? "").trim().slice(0, 500) || null;

  const TYPES = ["相談窓口", "教育支援センター", "学びの多様化学校", "フリースクール", "親の会"];
  if (String(formData.get("website") ?? "")) redirect("/tools/shien/add?sent=1"); // ハニーポット
  if (name.length < 2 || !TYPES.includes(type) || !region) redirect("/tools/shien/add?error=empty");

  const ip = await getClientIp();
  const key = `submitentry:${user.id}:${ip}`;
  if (await isBlocked(key, 20)) redirect("/tools/shien/add?error=limit");
  await bump(key, 24 * HOUR);

  await prisma.entrySubmission.create({
    data: { name, type, region, city, online, url, tel, note, submittedById: user.id, submittedByName: user.displayName },
  });
  redirect("/tools/shien/add?sent=1");
}

// ---- 投稿の承認 / 却下（管理者のみ） ----
export async function reviewSubmission(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  const status = action === "approve" ? "approved" : "rejected";
  if (id) await prisma.entrySubmission.update({ where: { id }, data: { status, reviewedAt: new Date() } });
  revalidatePath("/submissions");
  revalidatePath("/tools/shien");
}
