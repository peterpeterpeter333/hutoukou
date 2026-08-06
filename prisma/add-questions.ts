// 既存データを消さずに「まだ無い質問だけ」を追加するスクリプト。
//   実行: npm run db:add
//   - タイトルが既にDBにある質問はスキップ（重複しない・何度実行しても安全）
//   - db:reset と違い、ユーザー・既存の質問・投稿は一切消えません
import { PrismaClient } from "@prisma/client";
import { CIRCLES, QUESTIONS } from "./seed-data";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

function tagSlug(name: string, i: number): string {
  const ascii = name.toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return ascii || `tag-x-${i}`;
}

async function pickAuthor(role: string): Promise<string> {
  const existing = await prisma.user.findFirst({ where: { role } });
  if (existing) return existing.id;
  const u = await prisma.user.create({
    data: { handle: `tobira-x-${role}-${Math.random().toString(36).slice(2, 7)}`, displayName: "とびらの仲間", role },
  });
  return u.id;
}

async function ensureCircle(slug: string): Promise<string | null> {
  const c = await prisma.circle.findUnique({ where: { slug } });
  if (c) return c.id;
  const def = CIRCLES.find((x) => x.slug === slug);
  if (!def) return null;
  const created = await prisma.circle.create({
    data: { slug: def.slug, name: def.name, emoji: def.emoji, description: def.description },
  });
  return created.id;
}

async function ensureTag(name: string, i: number): Promise<string> {
  const existing = await prisma.tag.findFirst({ where: { name } });
  if (existing) return existing.id;
  const t = await prisma.tag.create({ data: { name, slug: tagSlug(name, i) } });
  return t.id;
}

async function main() {
  let added = 0;
  let skipped = 0;
  let i = 0;

  for (const q of QUESTIONS) {
    i++;
    const exists = await prisma.question.findFirst({ where: { title: q.title } });
    if (exists) {
      skipped++;
      continue;
    }

    const authorId = await pickAuthor(q.authorRole ?? "member");
    const circleId = q.circle ? await ensureCircle(q.circle) : null;
    const tagIds: string[] = [];
    for (const name of q.tags) tagIds.push(await ensureTag(name, i));

    const created = await prisma.question.create({
      data: {
        slug: slugify(q.title),
        title: q.title,
        body: q.body,
        authorId,
        circleId,
        views: 5,
        tags: { create: tagIds.map((id) => ({ tag: { connect: { id } } })) },
      },
    });

    for (const a of q.answers ?? []) {
      const aAuthorId = await pickAuthor(a.role ?? "member");
      await prisma.answer.create({
        data: { body: a.body, questionId: created.id, authorId: aAuthorId, isAccepted: a.accepted ?? false },
      });
    }
    added++;
    console.log(`  + 追加: ${q.title}`);
  }

  console.log(`\n✅ 完了: 追加 ${added}件 / スキップ(既存) ${skipped}件 / 合計 ${QUESTIONS.length}件`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
