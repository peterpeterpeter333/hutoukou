import Link from "next/link";
import type { Metadata } from "next";
import { confirmEmail } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "メール確認",
  robots: { index: false, follow: false },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const ok = await confirmEmail(token);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="text-5xl" aria-hidden>{ok ? "✅" : "⚠️"}</div>
      <h1 className="mt-4 font-round text-2xl font-bold">
        {ok ? "メールを確認できました" : "確認できませんでした"}
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        {ok
          ? "ありがとうございます。アカウントのメールアドレスが確認されました。"
          : "リンクの有効期限が切れているか、すでに使用済みの可能性があります。プロフィールから再送できます。"}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn btn-primary">ホームへ</Link>
        <Link href="/questions" className="btn btn-ghost">質問を見る</Link>
      </div>
    </div>
  );
}
