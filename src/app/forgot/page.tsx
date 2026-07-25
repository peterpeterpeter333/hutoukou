import Link from "next/link";
import type { Metadata } from "next";
import { requestPasswordReset } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "パスワードを忘れた方",
  robots: { index: false, follow: false },
};

export default async function ForgotPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center">
        <div className="text-4xl" aria-hidden>🔑</div>
        <h1 className="mt-2 font-round text-2xl font-bold">パスワードの再設定</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          登録したメールアドレスに、再設定用のリンクをお送りします。
        </p>
      </div>

      {sent ? (
        <div className="mt-6 rounded-xl bg-[var(--color-brand-soft)] px-4 py-4 text-sm text-[var(--color-brand-dark)]">
          入力されたメールアドレスが登録されている場合、再設定リンクを送信しました。メールをご確認ください（迷惑メールフォルダもご確認を）。
        </div>
      ) : (
        <form action={requestPasswordReset} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">メールアドレス</span>
            <input type="email" name="email" required placeholder="you@example.com" className="field" />
          </label>
          <button type="submit" className="btn btn-primary w-full">再設定リンクを送る</button>
        </form>
      )}

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        <Link href="/login" className="font-medium text-[var(--color-brand-dark)] hover:underline">ログインに戻る</Link>
      </p>
    </div>
  );
}
