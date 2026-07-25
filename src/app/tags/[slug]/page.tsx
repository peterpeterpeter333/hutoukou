import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuestions, getTagBySlug } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "タグが見つかりません" };
  return {
    title: `「${tag.name}」の質問`,
    description: `不登校に関する「${tag.name}」の質問と回答をまとめました。`,
    alternates: { canonical: absoluteUrl(`/tags/${tag.slug}`) },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const questions = await getQuestions({ tagSlug: slug, take: 50 });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-round text-2xl font-bold">
        <span className="text-[var(--color-brand)]">#</span>
        {tag.name}
      </h1>
      <p className="mt-2 text-[var(--muted)]">{questions.length}件の質問</p>

      <div className="mt-5 grid gap-3">
        {questions.length === 0 ? (
          <p className="card p-6 text-center text-[var(--muted)]">このタグの質問はまだありません。</p>
        ) : (
          questions.map((q) => <QuestionCard key={q.id} q={q} />)
        )}
      </div>
    </div>
  );
}
