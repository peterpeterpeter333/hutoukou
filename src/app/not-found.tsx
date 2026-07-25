import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="text-5xl" aria-hidden>🌱</div>
      <h1 className="mt-4 font-round text-2xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-[var(--muted)]">
        お探しのページは移動したか、削除された可能性があります。
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn btn-primary">ホームへ</Link>
        <Link href="/questions" className="btn btn-ghost">質問を見る</Link>
      </div>
    </div>
  );
}
