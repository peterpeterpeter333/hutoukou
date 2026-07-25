import Link from "next/link";
import type { QuestionListItem } from "@/lib/queries";
import { timeAgo } from "@/lib/site";
import { Avatar, RoleBadge, Tag } from "./ui";

export function QuestionCard({ q }: { q: QuestionListItem }) {
  return (
    <article className="card p-5 transition hover:shadow-sm">
      <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
        {q.circle && (
          <Link
            href={`/circles/${q.circle.slug}`}
            className="inline-flex items-center gap-1 font-medium text-[var(--color-brand-dark)] hover:underline"
          >
            <span aria-hidden>{q.circle.emoji}</span>
            {q.circle.name}
          </Link>
        )}
        <span>・{timeAgo(q.createdAt)}</span>
      </div>

      <h2 className="mt-1.5 font-round text-lg font-bold leading-snug">
        <Link href={`/questions/${q.slug}`} className="hover:text-[var(--color-brand-dark)]">
          {q.title}
        </Link>
      </h2>

      <p className="mt-1.5 line-clamp-2 text-sm text-[var(--muted)]">{q.body}</p>

      {q.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {q.tags.map(({ tag }) => (
            <Tag key={tag.id} name={tag.name} slug={tag.slug} />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Avatar name={q.author.displayName} handle={q.author.handle} size={26} />
          <span className="font-medium text-[var(--fg)]">{q.author.displayName}</span>
          <RoleBadge role={q.author.role} />
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>💬</span>
            {q._count.answers}
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden>💚</span>
            {q._count.votes}
          </span>
        </div>
      </div>
    </article>
  );
}
