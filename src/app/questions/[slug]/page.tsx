import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getQuestionBySlug, incrementViews } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { timeAgo, absoluteUrl, SITE } from "@/lib/site";
import { Avatar, RoleBadge, Tag } from "@/components/ui";
import { VoteButton } from "@/components/VoteButton";
import { IdentityFields } from "@/components/IdentityFields";
import { ModActions } from "@/components/ModActions";
import { Comments } from "@/components/Comments";
import { ShareButtons } from "@/components/ShareButtons";
import { postAnswer } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const q = await getQuestionBySlug(slug);
  if (!q) return { title: "質問が見つかりません" };
  if (q.hidden) return { title: "質問", robots: { index: false, follow: false } };
  const desc = q.body.replace(/\s+/g, " ").slice(0, 110);
  return {
    title: q.title,
    description: desc,
    alternates: { canonical: absoluteUrl(`/questions/${q.slug}`) },
    openGraph: {
      type: "article",
      title: q.title,
      description: desc,
      url: absoluteUrl(`/questions/${q.slug}`),
    },
  };
}

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reported?: string }>;
}) {
  const { slug } = await params;
  const { reported } = await searchParams;
  const q = await getQuestionBySlug(slug);
  if (!q) notFound();

  const user = await getCurrentUser();

  // 非表示（モデレーション済み）の質問は、本人・管理者以外には見せない
  if (q.hidden && !(user && (user.id === q.authorId || user.isAdmin))) notFound();

  // 閲覧数（エラーは無視）
  incrementViews(q.id).catch(() => {});

  const here = `/questions/${q.slug}`;
  const answerIds = q.answers.map((a) => a.id);
  const myVotes = user
    ? await prisma.vote.findMany({
        where: {
          userId: user.id,
          OR: [{ questionId: q.id }, { answerId: { in: answerIds } }],
        },
        select: { questionId: true, answerId: true },
      })
    : [];
  const votedQuestion = myVotes.some((v) => v.questionId === q.id);
  const votedAnswers = new Set(myVotes.map((v) => v.answerId).filter(Boolean) as string[]);

  // 構造化データ（QAPage）— 検索結果でリッチに表示されるように
  const top = q.answers[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: q.title,
      text: q.body,
      answerCount: q.answers.length,
      dateCreated: q.createdAt.toISOString(),
      author: { "@type": "Person", name: q.author.displayName },
      ...(top
        ? {
            acceptedAnswer: {
              "@type": "Answer",
              text: top.body,
              upvoteCount: top._count.votes,
              dateCreated: top.createdAt.toISOString(),
              author: { "@type": "Person", name: top.author.displayName },
              url: absoluteUrl(`/questions/${q.slug}#answers`),
            },
          }
        : {}),
      suggestedAnswer: q.answers.slice(top ? 1 : 0).map((a) => ({
        "@type": "Answer",
        text: a.body,
        upvoteCount: a._count.votes,
        dateCreated: a.createdAt.toISOString(),
        author: { "@type": "Person", name: a.author.displayName },
        url: absoluteUrl(`/questions/${q.slug}#answers`),
      })),
    },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* パンくず */}
      <nav className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span> / </span>
        <Link href="/questions" className="hover:underline">質問</Link>
      </nav>

      {reported && (
        <p className="mb-4 rounded-xl bg-[var(--color-brand-soft)] px-4 py-3 text-sm text-[var(--color-brand-dark)]">
          {reported === "limit"
            ? "通報が多すぎます。しばらくしてからお試しください。"
            : "通報を受け付けました。ご協力ありがとうございます。運営が確認します。"}
        </p>
      )}

      {q.hidden && (
        <p className="mb-4 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
          この質問は通報により現在非表示です（本人・管理者のみ表示）。
        </p>
      )}

      {/* 質問 */}
      <article className="card p-6">
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          {q.circle && (
            <Link href={`/circles/${q.circle.slug}`} className="inline-flex items-center gap-1 font-medium text-[var(--color-brand-dark)] hover:underline">
              <span aria-hidden>{q.circle.emoji}</span>
              {q.circle.name}
            </Link>
          )}
          <span>・{timeAgo(q.createdAt)}・{q.views}回閲覧</span>
        </div>

        <h1 className="mt-2 font-round text-2xl font-bold leading-snug">{q.title}</h1>

        <p className="prose-jp mt-4 text-[var(--fg)]">{q.body}</p>

        {q.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {q.tags.map(({ tag }) => (
              <Tag key={tag.id} name={tag.name} slug={tag.slug} />
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Avatar name={q.author.displayName} handle={q.author.handle} size={30} />
            <Link href={`/u/${q.author.handle}`} className="font-medium hover:underline">
              {q.author.displayName}
            </Link>
            <RoleBadge role={q.author.role} />
          </div>
          <VoteButton
            count={q._count.votes}
            questionId={q.id}
            slug={q.slug}
            voted={votedQuestion}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <ShareButtons path={`/questions/${q.slug}`} title={q.title} />
          <ModActions
            type="question"
            id={q.id}
            from={here}
            canDelete={!!user && (user.id === q.authorId || user.isAdmin)}
          />
        </div>

        <Comments
          comments={q.comments}
          target="question"
          targetId={q.id}
          slug={q.slug}
          currentUserId={user?.id}
          isAdmin={!!user?.isAdmin}
          defaultName={user?.displayName ?? ""}
        />
      </article>

      {/* 回答 */}
      <section id="answers" className="mt-8">
        <h2 className="mb-3 font-round text-xl font-bold">
          {q.answers.length}件の回答
        </h2>
        <div className="grid gap-3">
          {q.answers.map((a) => (
            <article
              key={a.id}
              className={`card p-5 ${a.isAccepted ? "ring-2 ring-[var(--color-brand)]/40" : ""}`}
            >
              {a.isAccepted && (
                <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-soft)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-brand-dark)]">
                  ✅ ベストアンサー
                </div>
              )}
              <p className="prose-jp text-[var(--fg)]">{a.body}</p>
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Avatar name={a.author.displayName} handle={a.author.handle} size={28} />
                  <Link href={`/u/${a.author.handle}`} className="font-medium hover:underline">
                    {a.author.displayName}
                  </Link>
                  <RoleBadge role={a.author.role} />
                  <span className="text-xs text-[var(--muted)]">・{timeAgo(a.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ModActions
                    type="answer"
                    id={a.id}
                    slug={q.slug}
                    from={here}
                    canDelete={!!user && (user.id === a.authorId || user.isAdmin)}
                    small
                  />
                  <VoteButton
                    count={a._count.votes}
                    answerId={a.id}
                    slug={q.slug}
                    voted={votedAnswers.has(a.id)}
                  />
                </div>
              </div>

              <Comments
                comments={a.comments}
                target="answer"
                targetId={a.id}
                slug={q.slug}
                currentUserId={user?.id}
                isAdmin={!!user?.isAdmin}
                defaultName={user?.displayName ?? ""}
              />
            </article>
          ))}
          {q.answers.length === 0 && (
            <p className="card p-6 text-center text-[var(--muted)]">
              まだ回答がありません。あなたの経験や言葉が、質問した人の力になります。
            </p>
          )}
        </div>
      </section>

      {/* 回答フォーム */}
      <section id="answer" className="mt-8">
        <div className="card p-6">
          <h2 className="font-round text-lg font-bold">回答する</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            正解でなくて大丈夫。あなたの経験や「わかるよ」の一言が支えになります。
          </p>
          <form action={postAnswer} className="mt-4 space-y-3">
            <input type="hidden" name="questionId" value={q.id} />
            <input type="hidden" name="slug" value={q.slug} />
            <textarea
              name="body"
              required
              rows={5}
              placeholder="あなたの経験や思いを書いてみましょう"
              className="field resize-y"
            />
            <IdentityFields
              defaultName={user?.displayName ?? ""}
              defaultRole={user?.role ?? "member"}
            />
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">回答を投稿</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
