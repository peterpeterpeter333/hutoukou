import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCircleBySlug, getQuestions } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { timeAgo, absoluteUrl } from "@/lib/site";
import { Avatar, RoleBadge } from "@/components/ui";
import { QuestionCard } from "@/components/QuestionCard";
import { toggleJoinCircle, postToCircle } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCircleBySlug(slug);
  if (!c) return { title: "サークルが見つかりません" };
  return {
    title: `${c.name}（サークル）`,
    description: c.description,
    alternates: { canonical: absoluteUrl(`/circles/${c.slug}`) },
  };
}

export default async function CirclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCircleBySlug(slug);
  if (!c) notFound();

  const [questions, user] = await Promise.all([
    getQuestions({ circleSlug: slug, take: 20 }),
    getCurrentUser(),
  ]);
  const joined = user
    ? !!(await prisma.circleMember.findUnique({
        where: { circleId_userId: { circleId: c.id, userId: user.id } },
      }))
    : false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* ヘッダー */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl" aria-hidden>{c.emoji}</div>
          <div className="min-w-0 flex-1">
            <h1 className="font-round text-2xl font-bold">{c.name}</h1>
            <p className="mt-1 text-[var(--muted)]">{c.description}</p>
            <div className="mt-2 text-sm text-[var(--muted)]">
              👥 {c._count.members}人が参加 ・ 💬 {c._count.questions + c._count.posts}件の投稿
            </div>
          </div>
          <form action={toggleJoinCircle}>
            <input type="hidden" name="circleId" value={c.id} />
            <input type="hidden" name="slug" value={c.slug} />
            <button type="submit" className={joined ? "btn btn-soft" : "btn btn-primary"}>
              {joined ? "参加中 ✓" : "参加する"}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-round text-lg font-bold">このサークルの質問</h2>
        <Link href={`/ask?circle=${c.slug}`} className="btn btn-ghost !py-1.5 text-sm">
          ✏️ ここで質問する
        </Link>
      </div>
      <div className="mt-3 grid gap-3">
        {questions.length === 0 ? (
          <p className="card p-6 text-center text-[var(--muted)]">まだ質問がありません。</p>
        ) : (
          questions.map((q) => <QuestionCard key={q.id} q={q} />)
        )}
      </div>

      {/* つぶやき */}
      <section id="posts" className="mt-10">
        <h2 className="font-round text-lg font-bold">みんなのつぶやき</h2>
        <form action={postToCircle} className="mt-3 card p-4">
          <input type="hidden" name="circleId" value={c.id} />
          <input type="hidden" name="slug" value={c.slug} />
          <textarea
            name="body"
            required
            rows={2}
            placeholder="いまの気持ちを、ひとことどうぞ"
            className="field resize-y"
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              name="displayName"
              defaultValue={user?.displayName ?? ""}
              placeholder="ニックネーム（任意）"
              maxLength={24}
              className="field !py-1.5 text-sm"
            />
            <button type="submit" className="btn btn-primary !py-1.5 text-sm shrink-0">投稿</button>
          </div>
        </form>

        <div className="mt-4 grid gap-3">
          {c.posts.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-center gap-2 text-sm">
                <Avatar name={p.author.displayName} handle={p.author.handle} size={26} />
                <span className="font-medium">{p.author.displayName}</span>
                <RoleBadge role={p.author.role} />
                <span className="text-xs text-[var(--muted)]">・{timeAgo(p.createdAt)}</span>
              </div>
              <p className="prose-jp mt-2 text-sm">{p.body}</p>
            </div>
          ))}
          {c.posts.length === 0 && (
            <p className="text-sm text-[var(--muted)]">最初のつぶやきを投稿してみましょう。</p>
          )}
        </div>
      </section>
    </div>
  );
}
