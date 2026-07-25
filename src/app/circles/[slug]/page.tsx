import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCircleBySlug, getCircleTimeline, getQuestions } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { timeAgo, absoluteUrl } from "@/lib/site";
import { Avatar, RoleBadge } from "@/components/ui";
import { QuestionCard } from "@/components/QuestionCard";
import { ModActions } from "@/components/ModActions";
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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const activeTab = tab === "questions" ? "questions" : "timeline";

  const c = await getCircleBySlug(slug);
  if (!c) notFound();

  const [timeline, questions, user] = await Promise.all([
    getCircleTimeline(c.id),
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
              👥 {c._count.members}人が参加 ・ 📝 {c._count.posts}件の投稿 ・ 💬 {c._count.questions}件の質問
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

      {/* タブ */}
      <div className="mt-6 flex gap-2 border-b">
        <Link
          href={`/circles/${c.slug}?tab=timeline`}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
            activeTab === "timeline"
              ? "border-[var(--color-brand)] text-[var(--color-brand-dark)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          💬 タイムライン
        </Link>
        <Link
          href={`/circles/${c.slug}?tab=questions`}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
            activeTab === "questions"
              ? "border-[var(--color-brand)] text-[var(--color-brand-dark)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"
          }`}
        >
          ❓ 質問（{c._count.questions}）
        </Link>
      </div>

      {/* タイムライン */}
      {activeTab === "timeline" && (
        <section id="posts" className="mt-5">
          {/* 投稿フォーム */}
          <form action={postToCircle} className="card p-4">
            <input type="hidden" name="circleId" value={c.id} />
            <input type="hidden" name="slug" value={c.slug} />
            <textarea
              name="body"
              required
              rows={3}
              placeholder="いまの気持ちや出来事を、気軽にシェア"
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
              <button type="submit" className="btn btn-primary !py-1.5 text-sm shrink-0">
                投稿
              </button>
            </div>
          </form>

          <div className="mt-4 grid gap-3">
            {timeline.length === 0 && (
              <p className="card p-6 text-center text-[var(--muted)]">
                まだ投稿がありません。最初のひとことを書いてみましょう。
              </p>
            )}
            {timeline.map((p) => (
              <article key={p.id} className="card p-4">
                {/* 投稿本体 */}
                <div className="flex items-center gap-2 text-sm">
                  <Avatar name={p.author.displayName} handle={p.author.handle} size={30} />
                  <Link href={`/u/${p.author.handle}`} className="font-medium hover:underline">
                    {p.author.displayName}
                  </Link>
                  <RoleBadge role={p.author.role} />
                  <span className="text-xs text-[var(--muted)]">・{timeAgo(p.createdAt)}</span>
                </div>
                <p className="prose-jp mt-2">{p.body}</p>

                {/* 返信一覧 */}
                {p.replies.length > 0 && (
                  <div className="mt-3 space-y-3 border-l-2 border-[var(--color-brand-soft)] pl-4">
                    {p.replies.map((r) => (
                      <div key={r.id}>
                        <div className="flex items-center gap-2 text-sm">
                          <Avatar name={r.author.displayName} handle={r.author.handle} size={24} />
                          <Link href={`/u/${r.author.handle}`} className="font-medium hover:underline">
                            {r.author.displayName}
                          </Link>
                          <RoleBadge role={r.author.role} />
                          <span className="text-xs text-[var(--muted)]">・{timeAgo(r.createdAt)}</span>
                        </div>
                        <p className="prose-jp mt-1 text-sm">{r.body}</p>
                        <div className="mt-1">
                          <ModActions
                            type="post"
                            id={r.id}
                            slug={c.slug}
                            from={`/circles/${c.slug}?tab=timeline`}
                            canDelete={!!user && (user.id === r.authorId || user.isAdmin)}
                            small
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 返信フォーム（開閉式） */}
                <details className="group mt-3">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-[var(--color-brand-dark)] hover:underline">
                    <span aria-hidden>↩</span>
                    返信する
                    {p._count.replies > 0 && (
                      <span className="text-[var(--muted)]">（{p._count.replies}）</span>
                    )}
                  </summary>
                  <form action={postToCircle} className="mt-2">
                    <input type="hidden" name="circleId" value={c.id} />
                    <input type="hidden" name="slug" value={c.slug} />
                    <input type="hidden" name="parentId" value={p.id} />
                    <textarea
                      name="body"
                      required
                      rows={2}
                      placeholder="やさしい気持ちで返信しましょう"
                      className="field resize-y text-sm"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        name="displayName"
                        defaultValue={user?.displayName ?? ""}
                        placeholder="ニックネーム（任意）"
                        maxLength={24}
                        className="field !py-1.5 text-sm"
                      />
                      <button type="submit" className="btn btn-soft !py-1.5 text-sm shrink-0">
                        返信
                      </button>
                    </div>
                  </form>
                </details>

                <div className="mt-2 flex justify-end">
                  <ModActions
                    type="post"
                    id={p.id}
                    slug={c.slug}
                    from={`/circles/${c.slug}?tab=timeline`}
                    canDelete={!!user && (user.id === p.authorId || user.isAdmin)}
                    small
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 質問 */}
      {activeTab === "questions" && (
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-round text-lg font-bold">このサークルの質問</h2>
            <Link href={`/ask?circle=${c.slug}`} className="btn btn-ghost !py-1.5 text-sm">
              ✏️ ここで質問する
            </Link>
          </div>
          <div className="grid gap-3">
            {questions.length === 0 ? (
              <p className="card p-6 text-center text-[var(--muted)]">まだ質問がありません。</p>
            ) : (
              questions.map((q) => <QuestionCard key={q.id} q={q} />)
            )}
          </div>
        </section>
      )}
    </div>
  );
}
