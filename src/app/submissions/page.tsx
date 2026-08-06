import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { getSubmissions } from "@/lib/queries";
import { reviewSubmission } from "@/lib/actions";
import { timeAgo } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "支援先の投稿",
  robots: { index: false, follow: false },
};

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getAuthUser();
  if (!admin || !admin.isAdmin) notFound();

  const { status } = await searchParams;
  const filter = (["pending", "approved", "rejected", "all"].includes(status ?? "") ? status : "pending") as
    | "pending"
    | "approved"
    | "rejected"
    | "all";

  const subs = await getSubmissions(filter);

  const Tab = ({ value, label }: { value: string; label: string }) => (
    <Link
      href={`/submissions?status=${value}`}
      className={`rounded-full px-3 py-1 text-sm ${
        filter === value ? "bg-[var(--color-brand)] text-white" : "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-round text-2xl font-bold">📥 支援先の投稿</h1>
        <Link href="/reports" className="text-sm text-[var(--muted)] hover:underline">掲載情報の報告へ →</Link>
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        ユーザーから投稿された支援先です。「承認」すると一覧（/tools/shien）に自動で掲載されます。
      </p>

      <div className="mt-4 flex gap-2">
        <Tab value="pending" label="承認待ち" />
        <Tab value="approved" label="承認済み" />
        <Tab value="rejected" label="却下" />
        <Tab value="all" label="すべて" />
      </div>

      <div className="mt-5 grid gap-3">
        {subs.length === 0 && (
          <p className="card p-6 text-center text-sm text-[var(--muted)]">投稿はありません。</p>
        )}
        {subs.map((s) => (
          <div key={s.id} className="card p-4">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{s.type}・{s.region}{s.city ? ` ${s.city}` : ""}</span>
              <span>{timeAgo(s.createdAt)}・{s.status === "approved" ? "承認済み" : s.status === "rejected" ? "却下" : "承認待ち"}</span>
            </div>
            <div className="mt-1 font-round text-lg font-bold">{s.name}</div>
            {s.note && <p className="mt-1 text-sm text-[var(--muted)]">{s.note}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              {s.tel && <span className="text-[var(--color-brand-dark)]">📞 {s.tel}</span>}
              {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-dark)] hover:underline">🔗 {s.url}</a>}
              {s.online && <span className="text-xs text-[var(--muted)]">オンライン可</span>}
            </div>
            <div className="mt-1 text-xs text-[var(--muted)]">投稿者：{s.submittedByName ?? "（不明）"}</div>

            {s.status === "pending" && (
              <div className="mt-3 flex justify-end gap-2">
                <form action={reviewSubmission}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="action" value="reject" />
                  <button type="submit" className="btn btn-ghost !py-1.5 text-sm">却下</button>
                </form>
                <form action={reviewSubmission}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="action" value="approve" />
                  <button type="submit" className="btn btn-primary !py-1.5 text-sm">承認して掲載</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
