import Link from "next/link";
import type { Metadata } from "next";
import { reportEntry } from "@/lib/actions";

export const metadata: Metadata = {
  title: "掲載情報の報告",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  empty: "内容を3文字以上でご記入ください。",
  limit: "報告が多すぎます。しばらくしてからお試しください。",
};

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ about?: string; sent?: string; error?: string }>;
}) {
  const { about, sent, error } = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <nav className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/tools/shien" className="hover:underline">← 支援先を探す に戻る</Link>
      </nav>

      <h1 className="font-round text-2xl font-bold">掲載情報の報告</h1>

      {sent ? (
        <div className="mt-6 rounded-xl bg-[var(--color-brand-soft)] p-5 text-sm text-[var(--color-brand-dark)]">
          🙏 ご報告ありがとうございました。運営が確認して対応します。
          <div className="mt-3">
            <Link href="/tools/shien" className="btn btn-soft">一覧に戻る</Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-[var(--muted)]">
            掲載内容に誤り（電話番号・URLが違う、閉鎖済み など）があれば教えてください。
            正確な情報づくりにご協力いただけると助かります。
          </p>

          {error && ERRORS[error] && (
            <p className="mt-4 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
              {ERRORS[error]}
            </p>
          )}

          <form action={reportEntry} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">対象</label>
              <input
                name="target"
                defaultValue={about ?? ""}
                readOnly={!!about}
                required
                className="field bg-[var(--color-brand-soft)]/40"
                placeholder="（支援先の名前）"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">どこが違いますか？</label>
              <textarea
                name="message"
                required
                rows={5}
                maxLength={2000}
                className="field resize-y"
                placeholder="例）電話番号が変わっています。正しくは 000-0000-0000 です。／このフリースクールは閉鎖しました。など"
              />
            </div>

            {/* ハニーポット */}
            <div aria-hidden className="hidden">
              <label>ウェブサイト<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">報告を送る</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
