import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { getUnreadNotificationCount, getOpenReportCount } from "@/lib/queries";
import { logoutUser } from "@/lib/actions";
import { SITE } from "@/lib/site";
import { Avatar } from "./ui";

export async function Header() {
  const user = await getAuthUser();
  const current = await getCurrentUser();
  const unread = current ? await getUnreadNotificationCount(current.id) : 0;
  const openReports = user?.isAdmin ? await getOpenReportCount() : 0;

  return (
    <header className="sticky top-0 z-40 border-b bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-round text-xl font-bold">
          <span aria-hidden>🌱</span>
          <span>{SITE.name}</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 text-sm sm:flex">
          <Link href="/questions" className="rounded-full px-3 py-1.5 hover:bg-[var(--color-brand-soft)]">
            みんなの質問
          </Link>
          <Link href="/circles" className="rounded-full px-3 py-1.5 hover:bg-[var(--color-brand-soft)]">
            サークル
          </Link>
          <Link href="/tools" className="rounded-full px-3 py-1.5 hover:bg-[var(--color-brand-soft)]">
            お役立ち
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form action="/search" className="hidden md:block">
            <input
              name="q"
              placeholder="キーワードで検索"
              aria-label="検索"
              className="field !w-52 !py-1.5 text-sm"
            />
          </form>
          <Link href="/ask" className="btn btn-primary !py-2 text-sm">
            <span aria-hidden>✏️</span>
            質問する
          </Link>

          {current && (
            <Link
              href="/notifications"
              className="relative rounded-full p-2 hover:bg-[var(--color-brand-soft)]"
              title="通知"
              aria-label={`通知${unread > 0 ? `（未読${unread}件）` : ""}`}
            >
              <span aria-hidden className="text-lg">🔔</span>
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[0.65rem] font-bold leading-[18px] text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}

          {user?.isAdmin && (
            <Link
              href="/moderation"
              className="relative rounded-full p-2 hover:bg-[var(--color-brand-soft)]"
              title="モデレーション"
              aria-label={`モデレーション${openReports > 0 ? `（未対応${openReports}件）` : ""}`}
            >
              <span aria-hidden className="text-lg">🛡</span>
              {openReports > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[0.65rem] font-bold leading-[18px] text-white">
                  {openReports > 9 ? "9+" : openReports}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-1.5">
              <Link href={`/u/${user.handle}`} title={user.displayName} className="flex items-center">
                <Avatar name={user.displayName} handle={user.handle} size={34} />
              </Link>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="rounded-full px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
                  title="ログアウト"
                >
                  ログアウト
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="btn btn-ghost !py-2 text-sm">
              ログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
