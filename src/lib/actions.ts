"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { ensureUser } from "./session";
import { slugify, circleSlugify } from "./slug";

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
