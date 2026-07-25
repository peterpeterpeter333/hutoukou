import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { getNotifications } from "@/lib/queries";
import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/site";
import { Avatar } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "通知",
  robots: { index: false, follow: false },
};

const ICONS: Record<string, string> = { answer: "💬", reply: "↩", vote: "💚", comment: "🗨" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="text-4xl" aria-hidden>🔔</div>
        <h1 className="mt-3 font-round text-xl font-bold">通知</h1>
        <p className="mt-2 text-[var(--muted)]">
          質問や投稿をすると、回答や返信がここに届きます。
        </p>
        <Link href="/ask" className="btn btn-primary mt-5">質問してみる</Link>
      </div>
    );
  }

  const notifications = await getNotifications(user.id);
  const unreadIds = new Set(notifications.filter((n) => !n.read).map((n) => n.id));

  // 表示したら既読にする（ベルの未読数は次の遷移で更新される）
  if (unreadIds.size > 0) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-round text-2xl font-bold">🔔 通知</h1>

      <div className="mt-5 grid gap-2">
        {notifications.length === 0 && (
          <p className="card p-8 text-center text-[var(--muted)]">
            まだ通知はありません。<br />
            質問や投稿をすると、回答や返信がここに届きます。
          </p>
        )}
        {notifications.map((n) => (
          <Link
            key={n.id}
            href={n.link}
            className={`card flex items-start gap-3 p-4 transition hover:shadow-sm ${
              unreadIds.has(n.id) ? "border-l-4 border-l-[var(--color-brand)] bg-[var(--color-brand-soft)]/40" : ""
            }`}
          >
            {n.actor ? (
              <Avatar name={n.actor.displayName} handle={n.actor.handle} size={40} />
            ) : (
              <span className="text-2xl" aria-hidden>{ICONS[n.type] ?? "🔔"}</span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                {n.actor && <span className="font-medium">{n.actor.displayName}</span>}
                {n.actor && "："}
                {n.message}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{timeAgo(n.createdAt)}</p>
            </div>
            {unreadIds.has(n.id) && (
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" aria-label="未読" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
