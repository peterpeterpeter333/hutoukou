import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { registerUser } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "新規登録",
  description: "とびらのアカウントを作成します。",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  email: "メールアドレスの形式が正しくありません。",
  password: "パスワードは8文字以上で、英字と数字を組み合わせてください（推測されやすいものは不可）。",
  taken: "このメールアドレスは既に登録されています。ログインしてください。",
  ratelimit: "登録の試行が多すぎます。しばらく時間をおいてからお試しください。",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authed = await getAuthUser();
  if (authed) redirect(`/u/${authed.handle}`);

  const { error } = await searchParams;
  // 匿名で使っていた場合、その名前・立場を初期値に
  const anon = await getCurrentUser();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="text-center">
        <div className="text-4xl" aria-hidden>🌱</div>
        <h1 className="mt-2 font-round text-2xl font-bold">とびらに登録</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          登録すると、投稿の管理や続きからの利用ができます。<br />
          いま匿名で書いた内容も、そのまま引き継がれます。
        </p>
      </div>

      {error && ERRORS[error] && (
        <p className="mt-5 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
          {ERRORS[error]}
        </p>
      )}

      <form action={registerUser} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">メールアドレス</span>
          <input type="email" name="email" required placeholder="you@example.com" className="field" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">パスワード（8文字以上）</span>
          <input type="password" name="password" required minLength={8} placeholder="••••••••" className="field" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">ニックネーム</span>
          <input
            name="displayName"
            defaultValue={anon?.displayName ?? ""}
            maxLength={24}
            placeholder="表示される名前（匿名でOK）"
            className="field"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">あなたの立場</span>
          <select name="role" defaultValue={anon?.role ?? "member"} className="field">
            <option value="member">当事者（学校に行きづらい本人）</option>
            <option value="parent">保護者</option>
            <option value="supporter">支援者・その他</option>
          </select>
        </label>

        <button type="submit" className="btn btn-primary w-full">アカウントを作成</button>
      </form>

      <p className="mt-5 text-center text-sm text-[var(--muted)]">
        すでに登録済みの方は{" "}
        <Link href="/login" className="font-medium text-[var(--color-brand-dark)] hover:underline">
          ログイン
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        メールアドレスは本人確認・ログインのみに使用します。プロフィールには公開されません。
      </p>
    </div>
  );
}
