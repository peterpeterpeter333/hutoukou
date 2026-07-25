import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "./db";
import { slugify } from "./slug";

// モデルは環境変数で変更可能。
// 既定は速度・コストのバランスが良い Sonnet 5（Vercel Hobby の60秒制限に収まりやすい）。
// より高品質を求めるなら AI_MODEL=claude-opus-5、より安価なら claude-haiku-4-5。
const AI_MODEL = process.env.AI_MODEL || "claude-sonnet-5";
const DAILY_COUNT = Math.max(1, Math.min(20, Number(process.env.AI_DAILY_COUNT) || 6));

const CRISIS_NOTE =
  "※この回答はAIアシスタントによる一般的な情報提供です。個別の状況は専門機関にご相談ください。いのちや安全にかかわる緊急時は、24時間子供SOSダイヤル（0120-0-78310）やいのちの電話（0570-783-556）へ。";

// 生成物の型
type GeneratedQA = {
  title: string;
  body: string;
  answer: string;
  tags: string[];
  circle?: string;
};

const CIRCLE_SLUGS = ["school-refusal", "parents", "study-career", "home-life", "hobby", "alt-school", "kokoro"];

const SYSTEM_PROMPT = `あなたは、不登校の子ども・保護者・支援者のためのQ&Aコミュニティ「とびら」の編集アシスタントです。
検索から訪れる人の役に立つ、Q&A形式の記事を作成します。

【厳守事項（安全ガードレール）】
- 温かく、否定せず、当事者や保護者を追い詰めない語り口にする。
- 医療・診断・投薬の断定はしない。専門的判断が必要な話題は「専門機関・医療機関に相談を」と促す。
- 自傷・自殺・虐待・いじめの深刻な被害・緊急事態については、対処法を細かく指南せず、必ず公的な相談窓口・専門家につなぐ内容にする。危険を助長する表現は禁止。
- 実在の人物の体験談を捏造して、あたかも本物の投稿のように見せてはいけない。あくまで「編集部による一般的な情報提供」として書く。
- 誇張・不確実な統計・断定的な「必ず治る」等の表現は避ける。
- 差別的・攻撃的な表現は使わない。

【作成する内容】
- title: 実際に検索されそうな、具体的な質問文（例：「中学生の子どもが朝起きられません。起立性調節障害でしょうか？」）
- body: その質問の背景や状況を2〜4文で。
- answer: 300〜500字程度の、やさしく実用的な回答。断定を避け、必要なら専門機関への相談を促す。
- tags: 日本語のタグを2〜4個（例：中学生, 起立性調節障害, 保護者）。
- circle: 次のいずれかのslugから最も適切なもの1つ（任意）：${CIRCLE_SLUGS.join(", ")}

必ず指定されたJSONスキーマで出力してください。`;

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          answer: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          circle: { type: "string" },
        },
        required: ["title", "body", "answer", "tags"],
      },
    },
  },
  required: ["items"],
} as const;

async function tagIdFor(name: string): Promise<string> {
  const existing = await prisma.tag.findFirst({ where: { name } });
  if (existing) return existing.id;
  const slug =
    name.toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    `t-${Math.random().toString(36).slice(2, 7)}`;
  const t = await prisma.tag.create({ data: { name, slug } });
  return t.id;
}

// AI編集部アカウントを用意（AI生成であることが分かる表示名）
async function getAiUser() {
  const handle = "tobira-ai";
  const existing = await prisma.user.findUnique({ where: { handle } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      handle,
      displayName: "とびら編集部（AI）",
      role: "supporter",
      bio: "AIによる一般的な情報提供アカウントです。個別の相談は専門機関へ。",
    },
  });
}

/** 毎日の自動生成。生成→DB投入まで行い、件数を返す。 */
export async function generateDailyQA(): Promise<{ created: number; model: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY が設定されていません。");
  }
  const client = new Anthropic();

  // 重複を避けるため、既存の質問タイトルを渡す
  const recent = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { title: true },
  });
  const avoid = recent.map((q) => `- ${q.title}`).join("\n");

  const userPrompt = `不登校の子ども・保護者が検索しそうな新しいQ&Aを${DAILY_COUNT}件つくってください。
以下はすでにサイトにある質問です。これらと重複しない、別のテーマにしてください：
${avoid || "（まだありません）"}`;

  const message = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
    // 構造化出力で確実にJSONを得る
    output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
  } as Anthropic.MessageCreateParamsNonStreaming);

  // 応答テキストを取り出してパース
  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
  let parsed: { items?: GeneratedQA[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AIの応答をJSONとして解析できませんでした。");
  }
  const items = (parsed.items ?? []).filter((it) => it.title && it.answer);

  const ai = await getAiUser();
  let created = 0;

  for (const it of items) {
    const circleSlug = it.circle && CIRCLE_SLUGS.includes(it.circle) ? it.circle : undefined;
    const circle = circleSlug
      ? await prisma.circle.findUnique({ where: { slug: circleSlug } })
      : null;

    const tagIds: string[] = [];
    for (const name of (it.tags ?? []).slice(0, 4)) {
      if (name?.trim()) tagIds.push(await tagIdFor(name.trim()));
    }

    const q = await prisma.question.create({
      data: {
        slug: slugify(it.title),
        title: it.title.slice(0, 140),
        body: it.body?.slice(0, 2000) || it.title,
        authorId: ai.id,
        circleId: circle?.id ?? null,
        tags: { create: tagIds.map((id) => ({ tag: { connect: { id } } })) },
      },
    });

    await prisma.answer.create({
      data: {
        body: `${it.answer.slice(0, 3000)}\n\n${CRISIS_NOTE}`,
        questionId: q.id,
        authorId: ai.id,
        isAccepted: true,
      },
    });
    created++;
  }

  return { created, model: AI_MODEL };
}
