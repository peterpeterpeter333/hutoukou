import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { getReports } from "@/lib/queries";
import { timeAgo } from "@/lib/site";
import { moderateHide, resolveReport } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "モデレーション",
  robots: { index: false, follow: false },
};

const REASON_LABEL: Record<string, string> = {
  harassment: "誹謗中傷・いじめ",
  selfharm: "自傷・緊急性",
  inappropriate: "不適切な内容",
  spam: "スパム",
  other: "その他",
};
const TARGET_LABEL: Record<string, string> = { question: "質問", answer: "回答", post: "投稿" };

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getAuthUser();
  if (!admin || !admin.isAdmin) notFound();

  const { status } = await searchParams;
  const filter = (["open", "resolved", "dismissed", "all"].includes(status ?? "") ? status : "open") as
    | "open"
    | "resolved"
    | "dismissed"
    | "all";

  const reports = await getReports(filter);

  const TABS = [
    { key: "open", label: "未対応" },
    { key: "resolved", label: "対応済み" },
    { key: "dismissed", label: "却下" },
    { key: "all", label: "すべて" },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-round text-2xl font-bold">🛡 モデレーション</h1>
        <span className="text-sm text-[var(--muted)]">管理者：{admin.displayName}</span>
      </div>

      <div className="mt-4 flex gap-2 border-b">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/moderation?status=${t.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition ${
              filter === t.key
                ? "border-[var(--color-brand)] text-[var(--color-brand-dark)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {reports.length === 0 && (
          <p className="card p-8 text-center text-[var(--muted)]">
            {filter === "open" ? "未対応の通報はありません。おつかれさまです 🌱" : "該当する通報はありません。"}
          </p>
        )}

        {reports.map((r) => (
          <article key={r.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 font-semibold text-[#c15b3f]">
                {REASON_LABEL[r.reason] ?? r.reason}
              </span>
              <span className="rounded-full bg-[var(--color-brand-soft)] px-2 py-0.5 text-[var(--color-brand-dark)]">
                {TARGET_LABEL[r.targetType] ?? r.targetType}
              </span>
              {r.preview?.hidden && (
                <span className="rounded-full bg-[#eee] px-2 py-0.5 text-[var(--muted)]">現在：非表示</span>
              )}
              <span className="text-[var(--muted)]">
                通報者：{r.reporter?.displayName ?? "匿名"} ・ {timeAgo(r.createdAt)} ・ 状態：{r.status}
              </span>
            </div>

            {r.detail && <p className="mt-2 text-sm text-[var(--muted)]">補足：{r.detail}</p>}

            {r.preview ? (
              <div className="mt-3 rounded-xl border bg-[color-mix(in_srgb,var(--fg)_3%,transparent)] p-3">
                <div className="text-xs text-[var(--muted)]">投稿者：{r.preview.author}</div>
                <p className="prose-jp mt-1 line-clamp-4 text-sm">{r.preview.text}</p>
                <Link href={r.preview.link} className="mt-2 inline-block text-xs text-[var(--color-brand-dark)] hover:underline">
                  実際のページを見る →
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--muted)]">対象は削除済みのようです。</p>
            )}

            {/* アクション */}
            <div className="mt-4 flex flex-wrap gap-2">
              {r.preview && !r.preview.hidden && (
                <form action={moderateHide}>
                  <input type="hidden" name="type" value={r.targetType} />
                  <input type="hidden" name="id" value={r.targetId} />
                  <input type="hidden" name="hidden" value="true" />
                  <button type="submit" className="btn btn-primary !py-1.5 text-sm">非表示にする</button>
                </form>
              )}
              {r.preview && r.preview.hidden && (
                <form action={moderateHide}>
                  <input type="hidden" name="type" value={r.targetType} />
                  <input type="hidden" name="id" value={r.targetId} />
                  <input type="hidden" name="hidden" value="false" />
                  <button type="submit" className="btn btn-soft !py-1.5 text-sm">表示に戻す</button>
                </form>
              )}
              {r.status === "open" && (
                <form action={resolveReport}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="dismissed" />
                  <button type="submit" className="btn btn-ghost !py-1.5 text-sm">問題なし（却下）</button>
                </form>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
