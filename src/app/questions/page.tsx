import Link from "next/link";
import type { Metadata } from "next";
import { getQuestions } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "みんなの質問",
  description: "不登校に関する質問と回答の一覧。学校に行きたくない気持ち、進路、保護者の悩みなど、みんなの相談が集まっています。",
};

const TABS = [
  { key: "recent", label: "新着" },
  { key: "popular", label: "人気" },
  { key: "unanswered", label: "回答募集中" },
] as const;

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const { sort } = await searchParams;
  const active = (TABS.find((t) => t.key === sort)?.key ?? "recent") as
    | "recent"
    | "popular"
    | "unanswered";

  const questions = await getQuestions({ sort: active, take: 50 });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-round text-2xl font-bold">みんなの質問</h1>
        <Link href="/ask" className="btn btn-primary !py-2 text-sm">✏️ 質問する</Link>
      </div>

      <div className="mt-4 flex gap-2 border-b">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "recent" ? "/questions" : `/questions?sort=${t.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition ${
              active === t.key
                ? "border-[var(--color-brand)] text-[var(--color-brand-dark)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {questions.length === 0 ? (
          <p className="card p-8 text-center text-[var(--muted)]">
            まだ質問がありません。最初の質問をしてみませんか？
          </p>
        ) : (
          questions.map((q) => <QuestionCard key={q.id} q={q} />)
        )}
      </div>
    </div>
  );
}
