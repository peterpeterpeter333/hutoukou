import Link from "next/link";
import type { Metadata } from "next";
import { reportContent } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "通報する",
  robots: { index: false, follow: false },
};

const TARGET_LABEL: Record<string, string> = {
  question: "質問",
  answer: "回答",
  post: "タイムライン投稿",
};

const REASONS: { value: string; label: string; hint?: string }[] = [
  { value: "harassment", label: "誹謗中傷・いじめ・攻撃的な内容" },
  { value: "selfharm", label: "自傷・自殺をあおる／緊急性が高い内容" },
  { value: "inappropriate", label: "性的・暴力的など不適切な内容" },
  { value: "spam", label: "宣伝・スパム・無関係な投稿" },
  { value: "other", label: "その他" },
];

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; id?: string; from?: string }>;
}) {
  const { type = "", id = "", from = "/" } = await searchParams;
  const valid = ["question", "answer", "post"].includes(type) && !!id;

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-round text-2xl font-bold">⚑ 通報する</h1>
      {!valid ? (
        <p className="mt-4 card p-6 text-[var(--muted)]">
          通報対象が正しくありません。
          <Link href="/" className="ml-1 text-[var(--color-brand-dark)] hover:underline">ホームへ</Link>
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-[var(--muted)]">
            この{TARGET_LABEL[type]}を運営に報告します。あなたが通報したことは相手に通知されません。
          </p>

          <form action={reportContent} className="mt-6 space-y-4">
            <input type="hidden" name="targetType" value={type} />
            <input type="hidden" name="targetId" value={id} />
            <input type="hidden" name="from" value={from} />

            <fieldset className="space-y-2">
              <legend className="mb-1 text-sm font-medium">理由を選んでください</legend>
              {REASONS.map((r, i) => (
                <label key={r.value} className="flex items-start gap-2 rounded-xl border p-3 text-sm has-[:checked]:border-[var(--color-brand)] has-[:checked]:bg-[var(--color-brand-soft)]">
                  <input type="radio" name="reason" value={r.value} defaultChecked={i === 0} className="mt-1" />
                  <span>{r.label}</span>
                </label>
              ))}
            </fieldset>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">補足（任意）</span>
              <textarea name="detail" rows={3} maxLength={500} placeholder="状況をもう少し詳しく（任意）" className="field resize-y" />
            </label>

            <div className="flex items-center justify-between">
              <Link href={from} className="text-sm text-[var(--muted)] hover:underline">キャンセル</Link>
              <button type="submit" className="btn btn-primary">通報する</button>
            </div>
          </form>

          <div className="mt-6 rounded-xl bg-[var(--color-accent-soft)] p-4 text-xs text-[#8a4632]">
            いのちに関わる緊急のときは、通報だけでなく公的な窓口にもご連絡ください（24時間子供SOSダイヤル 0120-0-78310 / いのちの電話 0570-783-556）。
          </div>
        </>
      )}
    </div>
  );
}
