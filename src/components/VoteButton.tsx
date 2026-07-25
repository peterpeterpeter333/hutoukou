import { toggleVote } from "@/lib/actions";

// 「役に立った」ボタン。サーバーアクションのフォームなのでJSなしでも動作する。
export function VoteButton({
  count,
  questionId,
  answerId,
  slug,
  voted,
  label = "役に立った",
}: {
  count: number;
  questionId?: string;
  answerId?: string;
  slug: string;
  voted?: boolean;
  label?: string;
}) {
  return (
    <form action={toggleVote}>
      {questionId && <input type="hidden" name="questionId" value={questionId} />}
      {answerId && <input type="hidden" name="answerId" value={answerId} />}
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        aria-pressed={voted}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
          voted
            ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]"
            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand-dark)]"
        }`}
      >
        <span aria-hidden>💚</span>
        <span>{label}</span>
        <span className="tabular-nums">{count}</span>
      </button>
    </form>
  );
}
