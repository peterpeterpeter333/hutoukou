// 追加済みの新しい質問（末尾10件）の著者が偏っているのを、役割ごとにランダムに散らす。
//   実行: npm run db:fix-authors
//   - 対象は seed-data.ts の末尾10件（タイトルで特定）とその回答のみ
//   - 既存データは消えません（著者の付け替えだけ）
import { PrismaClient } from "@prisma/client";
import { QUESTIONS } from "./seed-data";

const prisma = new PrismaClient();

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // 役割ごとのユーザープール
  const pools: Record<string, string[]> = { member: [], parent: [], supporter: [] };
  for (const role of Object.keys(pools)) {
    const us = await prisma.user.findMany({ where: { role }, select: { id: true } });
    pools[role] = us.map((u) => u.id);
  }
  const poolFor = (role?: string) => {
    const p = pools[role ?? "member"];
    return p && p.length ? p : pools.member;
  };

  const targets = QUESTIONS.slice(-10); // 追加した10件
  let fixedQ = 0;
  let fixedA = 0;

  for (const q of targets) {
    const dbq = await prisma.question.findFirst({
      where: { title: q.title },
      include: { answers: { orderBy: { createdAt: "asc" } } },
    });
    if (!dbq) {
      console.log(`  ? 見つからない: ${q.title}`);
      continue;
    }

    // 質問の著者を役割内でランダムに
    await prisma.question.update({ where: { id: dbq.id }, data: { authorId: rand(poolFor(q.authorRole)) } });
    fixedQ++;

    // 回答の著者も、seedの回答の役割に合わせてランダムに（作成順で対応づけ）
    const seedAnswers = q.answers ?? [];
    for (let i = 0; i < dbq.answers.length; i++) {
      const role = seedAnswers[i]?.role ?? "member";
      await prisma.answer.update({ where: { id: dbq.answers[i].id }, data: { authorId: rand(poolFor(role)) } });
      fixedA++;
    }
    console.log(`  ✓ ${q.title}`);
  }

  console.log(`\n✅ 完了: 質問 ${fixedQ}件 / 回答 ${fixedA}件 の著者を散らしました`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
