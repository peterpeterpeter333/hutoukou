import { prisma } from "./db";

/** 通知を作成する。受信者=起こした本人 の場合は作らない（自分の操作は通知しない）。 */
export async function createNotification(opts: {
  userId: string; // 受け取る人
  actorId?: string | null; // 起こした人
  type: "answer" | "reply" | "vote";
  message: string;
  link: string;
}): Promise<void> {
  if (opts.actorId && opts.actorId === opts.userId) return;
  await prisma.notification.create({
    data: {
      userId: opts.userId,
      actorId: opts.actorId ?? null,
      type: opts.type,
      message: opts.message,
      link: opts.link,
    },
  });
}
