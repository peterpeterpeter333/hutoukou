import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { loginUser } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ログイン",
  description: "とびらにログインします。",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authed = await getAuthUser();
  if (authed) redirect(`/u/${authed.handle}`);

  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center">
        <div className="text-4xl" aria-hidden>🌱</div>
        <h1 className="mt-2 font-round text-2xl font-bold">おかえりなさい</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">とびらにログインします。</p>
      </div>

      {error === "invalid" && (
        <p className="mt-5 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
          メールアドレスまたはパスワードが正しくありません。
        </p>
      )}
      {error === "ratelimit" && (
        <p className="mt-5 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
          ログインの試行が多すぎます。安全のため、しばらく時間をおいてからお試しください。
        </p>
      )}

      <form action={loginUser} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">メールアドレス</span>
          <input type="email" name="email" required placeholder="you@example.com" className="field" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">パスワード</span>
          <input type="password" name="password" required placeholder="••••••••" className="field" />
        </label>
        <button type="submit" className="btn btn-primary w-full">ログイン</button>
      </form>

      <p className="mt-3 text-center text-sm">
        <Link href="/forgot" className="text-[var(--muted)] hover:underline">
          パスワードをお忘れですか？
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        はじめての方は{" "}
        <Link href="/register" className="font-medium text-[var(--color-brand-dark)] hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  );
}
