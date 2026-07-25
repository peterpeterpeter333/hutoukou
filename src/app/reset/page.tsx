import Link from "next/link";
import type { Metadata } from "next";
import { resetPassword } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "パスワード再設定",
  robots: { index: false, follow: false },
};

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token = "", error } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="text-4xl" aria-hidden>⚠️</div>
        <h1 className="mt-3 font-round text-xl font-bold">リンクが正しくありません</h1>
        <p className="mt-2 text-[var(--muted)]">
          もう一度、パスワード再設定をやり直してください。
        </p>
        <Link href="/forgot" className="btn btn-primary mt-5">再設定をやり直す</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center">
        <div className="text-4xl" aria-hidden>🔑</div>
        <h1 className="mt-2 font-round text-2xl font-bold">新しいパスワード</h1>
      </div>

      {error === "invalid" && (
        <p className="mt-5 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
          リンクの有効期限が切れているか、使用済みです。お手数ですが再度お試しください。
        </p>
      )}
      {error === "password" && (
        <p className="mt-5 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
          パスワードは8文字以上で、英字と数字を組み合わせてください。
        </p>
      )}

      <form action={resetPassword} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">新しいパスワード（8文字以上）</span>
          <input type="password" name="password" required minLength={8} placeholder="••••••••" className="field" />
        </label>
        <button type="submit" className="btn btn-primary w-full">パスワードを変更する</button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        {error === "invalid" && (
          <Link href="/forgot" className="font-medium text-[var(--color-brand-dark)] hover:underline">
            再設定をやり直す
          </Link>
        )}
      </p>
    </div>
  );
}
