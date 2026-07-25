import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { SITE } from "@/lib/site";
import { Avatar } from "./ui";

export async function Header() {
  const user = await getCurrentUser();

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
          {user ? (
            <Link href={`/u/${user.handle}`} title={user.displayName}>
              <Avatar name={user.displayName} handle={user.handle} size={34} />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
