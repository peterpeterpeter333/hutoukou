import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { getEntryReports } from "@/lib/queries";
import { resolveEntryReport } from "@/lib/actions";
import { timeAgo } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "掲載情報の報告",
  robots: { index: false, follow: false },
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getAuthUser();
  if (!admin || !admin.isAdmin) notFound();

  const { status } = await searchParams;
  const filter = (["open", "resolved", "all"].includes(status ?? "") ? status : "open") as
    | "open"
    | "resolved"
    | "all";

  const reports = await getEntryReports(filter);

  const Tab = ({ value, label }: { value: string; label: string }) => (
    <Link
      href={`/reports?status=${value}`}
      className={`rounded-full px-3 py-1 text-sm ${
        filter === value
          ? "bg-[var(--color-brand)] text-white"
          : "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-round text-2xl font-bold">🚩 掲載情報の報告</h1>
        <Link href="/moderation" className="text-sm text-[var(--muted)] hover:underline">通報モデレーションへ →</Link>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        支援先一覧（/tools/shien）に寄せられた「間違いを報告」の一覧です。
        修正は <code>src/data/supports.json</code> を編集します。
      </p>

      <div className="mt-4 flex gap-2">
        <Tab value="open" label="未対応" />
        <Tab value="resolved" label="対応済み" />
        <Tab value="all" label="すべて" />
      </div>

      <div className="mt-5 grid gap-3">
        {reports.length === 0 && (
          <p className="card p-6 text-center text-sm text-[var(--muted)]">報告はありません。</p>
        )}
        {reports.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{timeAgo(r.createdAt)}</span>
              <span>
                {r.status === "resolved" ? "対応済み" : "未対応"}
              </span>
            </div>
            <div className="mt-1 font-round font-bold">{r.target}</div>
            <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--fg)]">{r.message}</p>
            {r.status !== "resolved" && (
              <form action={resolveEntryReport} className="mt-3 flex justify-end">
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="btn btn-soft !py-1.5 text-sm">対応済みにする</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
