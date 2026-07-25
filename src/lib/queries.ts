import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

const listInclude = {
  author: true,
  circle: true,
  tags: { include: { tag: true } },
  _count: { select: { answers: true, votes: true } },
} satisfies Prisma.QuestionInclude;

export type QuestionListItem = Prisma.QuestionGetPayload<{
  include: typeof listInclude;
}>;

export async function getQuestions(opts: {
  sort?: "recent" | "popular" | "unanswered";
  take?: number;
  skip?: number;
  tagSlug?: string;
  circleSlug?: string;
  query?: string;
} = {}): Promise<QuestionListItem[]> {
  const { sort = "recent", take = 20, skip = 0, tagSlug, circleSlug, query } = opts;

  const where: Prisma.QuestionWhereInput = { hidden: false };
  if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };
  if (circleSlug) where.circle = { slug: circleSlug };
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { body: { contains: query } },
    ];
  }
  if (sort === "unanswered") where.answers = { none: {} };

  const orderBy: Prisma.QuestionOrderByWithRelationInput =
    sort === "popular"
      ? { votes: { _count: "desc" } }
      : { createdAt: "desc" };

  return prisma.question.findMany({ where, include: listInclude, orderBy, take, skip });
}

export async function countQuestions(): Promise<number> {
  return prisma.question.count();
}

export async function getQuestionBySlug(slug: string) {
  return prisma.question.findUnique({
    where: { slug },
    include: {
      author: true,
      circle: true,
      tags: { include: { tag: true } },
      _count: { select: { votes: true } },
      comments: {
        where: { hidden: false },
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
      answers: {
        where: { hidden: false },
        orderBy: [{ isAccepted: "desc" }, { votes: { _count: "desc" } }, { createdAt: "asc" }],
        include: {
          author: true,
          _count: { select: { votes: true } },
          comments: {
            where: { hidden: false },
            orderBy: { createdAt: "asc" },
            include: { author: true },
          },
        },
      },
    },
  });
}

export async function incrementViews(id: string): Promise<void> {
  await prisma.question.update({ where: { id }, data: { views: { increment: 1 } } });
}

export async function getAllQuestionSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
  return prisma.question.findMany({ select: { slug: true, updatedAt: true } });
}

export async function getCircles() {
  return prisma.circle.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { members: true, questions: true, posts: true } } },
  });
}

export async function getCircleBySlug(slug: string) {
  return prisma.circle.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true, questions: true, posts: true } },
    },
  });
}

// タイムライン（トップレベル投稿＋返信）を取得
export async function getCircleTimeline(circleId: string) {
  return prisma.circlePost.findMany({
    where: { circleId, parentId: null, hidden: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: true,
      replies: {
        where: { hidden: false },
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
      _count: { select: { replies: { where: { hidden: false } } } },
    },
  });
}

export async function getPopularTags(take = 24) {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { questions: { _count: "desc" } },
    take,
  });
  return tags.filter((t) => t._count.questions > 0);
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

export async function getStats() {
  const [questions, answers, users, circles] = await Promise.all([
    prisma.question.count(),
    prisma.answer.count(),
    prisma.user.count(),
    prisma.circle.count(),
  ]);
  return { questions, answers, users, circles };
}

// ---- モデレーション ----

export async function getReports(status: "open" | "resolved" | "dismissed" | "all" = "open") {
  const reports = await prisma.report.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { reporter: true },
  });

  // 通報対象の中身を取得して添える
  const withTargets = await Promise.all(
    reports.map(async (r) => {
      let preview: { text: string; author: string; hidden: boolean; link: string } | null = null;
      if (r.targetType === "question") {
        const q = await prisma.question.findUnique({
          where: { id: r.targetId },
          include: { author: true },
        });
        if (q) preview = { text: `${q.title}\n${q.body}`, author: q.author.displayName, hidden: q.hidden, link: `/questions/${q.slug}` };
      } else if (r.targetType === "answer") {
        const a = await prisma.answer.findUnique({
          where: { id: r.targetId },
          include: { author: true, question: true },
        });
        if (a) preview = { text: a.body, author: a.author.displayName, hidden: a.hidden, link: `/questions/${a.question.slug}#answers` };
      } else if (r.targetType === "post") {
        const p = await prisma.circlePost.findUnique({
          where: { id: r.targetId },
          include: { author: true, circle: true },
        });
        if (p) preview = { text: p.body, author: p.author.displayName, hidden: p.hidden, link: `/circles/${p.circle.slug}?tab=timeline` };
      } else if (r.targetType === "comment") {
        const cm = await prisma.comment.findUnique({
          where: { id: r.targetId },
          include: { author: true, question: true, answer: { include: { question: true } } },
        });
        if (cm) {
          const qSlug = cm.question?.slug ?? cm.answer?.question.slug;
          preview = { text: cm.body, author: cm.author.displayName, hidden: cm.hidden, link: qSlug ? `/questions/${qSlug}` : "/" };
        }
      }
      return { ...r, preview };
    })
  );
  return withTargets;
}

export async function getOpenReportCount(): Promise<number> {
  return prisma.report.count({ where: { status: "open" } });
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: true },
  });
}

export async function getUserByHandle(handle: string) {
  return prisma.user.findUnique({
    where: { handle },
    include: {
      questions: {
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        include: listInclude,
      },
      answers: {
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        include: { question: true, _count: { select: { votes: true } } },
      },
      _count: { select: { questions: true, answers: true } },
    },
  });
}
