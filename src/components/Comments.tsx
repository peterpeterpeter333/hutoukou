import Link from "next/link";
import { timeAgo } from "@/lib/site";
import { Avatar } from "./ui";
import { ModActions } from "./ModActions";
import { postComment } from "@/lib/actions";

type CommentItem = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  author: { displayName: string; handle: string; role: string };
};

// 質問または回答に紐づくコメント欄。target で対象を指定。
export function Comments({
  comments,
  target,
  targetId,
  slug,
  currentUserId,
  isAdmin = false,
  defaultName = "",
}: {
  comments: CommentItem[];
  target: "question" | "answer";
  targetId: string;
  slug: string;
  currentUserId?: string;
  isAdmin?: boolean;
  defaultName?: string;
}) {
  const here = `/questions/${slug}`;
  const fieldName = target === "question" ? "questionId" : "answerId";

  return (
    <div className="mt-3 border-t pt-3">
      {comments.length > 0 && (
        <ul className="space-y-2.5">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              <Avatar name={c.author.displayName} handle={c.author.handle} size={22} />
              <div className="min-w-0 flex-1">
                <span className="text-xs text-[var(--muted)]">
                  <Link href={`/u/${c.author.handle}`} className="font-medium text-[var(--fg)] hover:underline">
                    {c.author.displayName}
                  </Link>
                  ・{timeAgo(c.createdAt)}
                </span>
                <p className="prose-jp text-sm">{c.body}</p>
                <div className="mt-0.5">
                  <ModActions
                    type="comment"
                    id={c.id}
                    slug={slug}
                    from={here}
                    canDelete={!!currentUserId && (currentUserId === c.authorId || isAdmin)}
                    small
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <details className="group mt-2">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-[var(--color-brand-dark)] hover:underline">
          💬 コメントする
          {comments.length > 0 && <span className="text-[var(--muted)]">（{comments.length}）</span>}
        </summary>
        <form action={postComment} className="mt-2">
          <input type="hidden" name={fieldName} value={targetId} />
          <input type="hidden" name="slug" value={slug} />
          <textarea
            name="body"
            required
            rows={2}
            maxLength={500}
            placeholder="短いコメントを書く（補足・お礼・質問など）"
            className="field resize-y text-sm"
          />
          <div className="mt-1.5 flex items-center gap-2">
            <input
              name="displayName"
              defaultValue={defaultName}
              placeholder="ニックネーム（任意）"
              maxLength={24}
              className="field !py-1.5 text-sm"
            />
            <button type="submit" className="btn btn-soft !py-1.5 text-sm shrink-0">送信</button>
          </div>
        </form>
      </details>
    </div>
  );
}
