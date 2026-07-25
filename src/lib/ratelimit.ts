import { headers } from "next/headers";
import { prisma } from "./db";

/** リクエスト元IPを推定（プロキシ/Vercel想定。無ければ unknown） */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

/** 現在ブロック状態か（ウィンドウ内で count>=limit）。カウントは増やさない。 */
export async function isBlocked(key: string, limit: number): Promise<boolean> {
  const rec = await prisma.rateLimit.findUnique({ where: { key } });
  if (!rec) return false;
  if (rec.windowEnd.getTime() < Date.now()) return false; // ウィンドウ切れ
  return rec.count >= limit;
}

/** 失敗を1件記録（ウィンドウ切れならリセットして開始） */
export async function bump(key: string, windowMs: number): Promise<void> {
  const now = Date.now();
  const rec = await prisma.rateLimit.findUnique({ where: { key } });
  if (!rec || rec.windowEnd.getTime() < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, windowEnd: new Date(now + windowMs) },
      update: { count: 1, windowEnd: new Date(now + windowMs) },
    });
    return;
  }
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
}

/** カウンタをリセット（ログイン成功時など） */
export async function resetLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } });
}
