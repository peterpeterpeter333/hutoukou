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

  const where: Prisma.QuestionWhereInput = {};
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
      answers: {
        orderBy: [{ isAccepted: "desc" }, { votes: { _count: "desc" } }, { createdAt: "asc" }],
        include: {
          author: true,
          _count: { select: { votes: true } },
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
    where: { circleId, parentId: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: true,
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
      _count: { select: { replies: true } },
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
        orderBy: { createdAt: "desc" },
        include: listInclude,
      },
      answers: {
        orderBy: { createdAt: "desc" },
        include: { question: true, _count: { select: { votes: true } } },
      },
      _count: { select: { questions: true, answers: true } },
    },
  });
}
