import type { Metadata } from "next";
import { getQuestions } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "検索",
  description: "不登校に関する質問を検索できます。",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await getQuestions({ query, take: 50 }) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-round text-2xl font-bold">検索</h1>

      <form action="/search" className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="キーワードを入力（例: 通信制、朝、ゲーム）"
          className="field"
          autoFocus
        />
        <button type="submit" className="btn btn-primary shrink-0">検索</button>
      </form>

      {query && (
        <p className="mt-5 text-sm text-[var(--muted)]">
          「{query}」の検索結果：{results.length}件
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {query && results.length === 0 && (
          <p className="card p-6 text-center text-[var(--muted)]">
            見つかりませんでした。別のキーワードでも試してみてください。
          </p>
        )}
        {results.map((q) => (
          <QuestionCard key={q.id} q={q} />
        ))}
      </div>
    </div>
  );
}
