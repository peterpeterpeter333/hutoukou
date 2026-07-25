import { PrismaClient } from "@prisma/client";
import { CIRCLES, QUESTIONS } from "./seed-data";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

// タグ名 -> slug（英数字化できないものは連番）
function tagSlug(name: string, i: number): string {
  const ascii = name
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return ascii || `tag-${i}`;
}

// 疑似ユーザーのプール（役割別）
const NAMES = {
  member: ["なぎさん", "あおの人", "ほしびより", "しずくノート", "つきねこ", "こもれびさん", "ゆきぐも"],
  parent: ["ぽかぽか母", "そっと見守る父", "みどりの日々", "ことりの母", "あんず"],
  supporter: ["相談員ほのか", "支援スタッフK", "スクールソーシャルワーカー"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

async function main() {
  console.log("🌱 seeding...");

  // 既存データをクリア（再実行できるように）
  await prisma.vote.deleteMany();
  await prisma.circlePost.deleteMany();
  await prisma.circleMember.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.tagOnQuestion.deleteMany();
  await prisma.question.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.circle.deleteMany();
  await prisma.user.deleteMany();

  // ユーザー作成
  const users: Record<string, string[]> = { member: [], parent: [], supporter: [] };
  let uCount = 0;
  for (const role of ["member", "parent", "supporter"] as const) {
    for (const name of NAMES[role]) {
      const u = await prisma.user.create({
        data: {
          handle: `tobira-${(uCount++).toString().padStart(4, "0")}`,
          displayName: name,
          role,
        },
      });
      users[role].push(u.id);
    }
  }
  const allUserIds = [...users.member, ...users.parent, ...users.supporter];

  // サークル作成
  const circleBySlug: Record<string, string> = {};
  for (const c of CIRCLES) {
    const created = await prisma.circle.create({
      data: { slug: c.slug, name: c.name, emoji: c.emoji, description: c.description },
    });
    circleBySlug[c.slug] = created.id;
    // 各サークルに数人のメンバーを入れておく
    const members = allUserIds.slice(0, 5 + (created.id.length % 4));
    for (const uid of members) {
      await prisma.circleMember.create({
        data: { circleId: created.id, userId: uid },
      });
    }
  }

  // タグ収集
  const tagIdByName: Record<string, string> = {};
  let tagIdx = 0;
  const allTagNames = new Set<string>();
  QUESTIONS.forEach((q) => q.tags.forEach((t) => allTagNames.add(t)));
  for (const name of allTagNames) {
    const t = await prisma.tag.create({
      data: { name, slug: tagSlug(name, tagIdx++) },
    });
    tagIdByName[name] = t.id;
  }

  // 質問・回答
  let qIndex = 0;
  for (const q of QUESTIONS) {
    const authorRole = (q.authorRole ?? "member") as keyof typeof users;
    const authorId = pick(users[authorRole], qIndex * 3 + 1);

    const created = await prisma.question.create({
      data: {
        slug: slugify(q.title),
        title: q.title,
        body: q.body,
        authorId,
        circleId: q.circle ? circleBySlug[q.circle] : null,
        views: 30 + ((qIndex * 37) % 500),
        tags: {
          create: q.tags.map((name) => ({ tag: { connect: { id: tagIdByName[name] } } })),
        },
      },
    });

    // 質問への「役に立った」を数件
    const qVoters = allUserIds.slice(0, 2 + (qIndex % 6));
    for (const uid of qVoters) {
      await prisma.vote.create({ data: { userId: uid, questionId: created.id } });
    }

    // 回答
    let aIndex = 0;
    for (const a of q.answers ?? []) {
      const aRole = (a.role ?? "member") as keyof typeof users;
      const aAuthorId = pick(users[aRole], qIndex + aIndex + 2);
      const answer = await prisma.answer.create({
        data: {
          body: a.body,
          questionId: created.id,
          authorId: aAuthorId,
          isAccepted: a.accepted ?? false,
        },
      });
      // 回答への「役に立った」
      const aVoters = allUserIds.slice(0, a.accepted ? 4 + (qIndex % 8) : 1 + (qIndex % 4));
      for (const uid of aVoters) {
        await prisma.vote.create({ data: { userId: uid, answerId: answer.id } });
      }
      aIndex++;
    }
    qIndex++;
  }

  // サークルのつぶやきを少し
  const circlePosts: { slug: string; body: string; role: keyof typeof users }[] = [
    { slug: "hobby", body: "最近やってるゲーム、同じ人いたら一緒にやりたい〜", role: "member" },
    { slug: "hobby", body: "絵を描くのが好きな人、作品見せ合いませんか？", role: "member" },
    { slug: "school-refusal", body: "今日は少し外を散歩できた。小さな一歩だけどうれしい。", role: "member" },
    { slug: "parents", body: "今日も一日おつかれさまでした。みんな頑張りすぎないで。", role: "parent" },
    { slug: "kokoro", body: "しんどい日はここに来て『わかる』って言ってもらえるだけで救われます。", role: "member" },
  ];
  const createdPosts: Record<string, string> = {}; // slug -> 最初の投稿id（返信サンプル用）
  for (const p of circlePosts) {
    const created = await prisma.circlePost.create({
      data: {
        body: p.body,
        circleId: circleBySlug[p.slug],
        authorId: pick(users[p.role], p.body.length),
      },
    });
    if (!createdPosts[p.slug]) createdPosts[p.slug] = created.id;
  }

  // タイムラインの返信サンプル
  const replies: { slug: string; body: string; role: keyof typeof users }[] = [
    { slug: "school-refusal", body: "その一歩、すごく大きいと思う。えらいよ🌱", role: "supporter" },
    { slug: "school-refusal", body: "わかる…外の空気って、それだけで少し気持ちが動くよね。", role: "member" },
    { slug: "hobby", body: "私も絵描くの好きです！ぜひ見せ合いたい〜", role: "member" },
    { slug: "parents", body: "その言葉に救われました。今日もありがとうございます。", role: "parent" },
  ];
  for (const r of replies) {
    const parentId = createdPosts[r.slug];
    if (!parentId) continue;
    await prisma.circlePost.create({
      data: {
        body: r.body,
        circleId: circleBySlug[r.slug],
        authorId: pick(users[r.role], r.body.length + 1),
        parentId,
      },
    });
  }

  // 回答へのサンプルコメント
  const sampleAnswers = await prisma.answer.findMany({ take: 4, orderBy: { createdAt: "asc" } });
  const commentTexts = [
    "この言葉に救われました。ありがとうございます。",
    "うちも同じ状況なので、とても参考になります。",
    "具体的で助かります。少しずつ試してみます。",
    "そう言ってもらえるだけで、気持ちが軽くなりました。",
  ];
  for (let i = 0; i < sampleAnswers.length; i++) {
    await prisma.comment.create({
      data: {
        body: commentTexts[i % commentTexts.length],
        answerId: sampleAnswers[i].id,
        authorId: pick(allUserIds, i + 5),
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    circles: await prisma.circle.count(),
    tags: await prisma.tag.count(),
    questions: await prisma.question.count(),
    answers: await prisma.answer.count(),
  };
  console.log("✅ done:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
