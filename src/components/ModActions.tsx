import Link from "next/link";
import { deleteQuestion, deleteAnswer, deleteCirclePost, deleteComment } from "@/lib/actions";

// 通報リンク＋（本人/管理者なら）削除。質問・回答・投稿・コメントで共通利用。
export function ModActions({
  type,
  id,
  slug,
  from,
  canDelete = false,
  small = false,
}: {
  type: "question" | "answer" | "post" | "comment";
  id: string;
  slug?: string;
  from: string;
  canDelete?: boolean;
  small?: boolean;
}) {
  const cls = `text-[var(--muted)] hover:text-[var(--fg)] ${small ? "text-xs" : "text-sm"}`;

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/report?type=${type}&id=${id}&from=${encodeURIComponent(from)}`}
        className={cls}
        title="通報する"
      >
        ⚑ 通報
      </Link>

      {canDelete && (
        <details className="group relative">
          <summary className={`cursor-pointer list-none ${cls}`}>🗑 削除</summary>
          <div className="absolute right-0 z-10 mt-1 w-56 rounded-xl border bg-[var(--card)] p-3 shadow-lg">
            <p className="text-xs text-[var(--muted)]">本当に削除しますか？元に戻せません。</p>
            {type === "question" && (
              <form action={deleteQuestion} className="mt-2 flex justify-end">
                <input type="hidden" name="id" value={id} />
                <button type="submit" className="btn btn-primary !py-1 text-xs">削除する</button>
              </form>
            )}
            {type === "answer" && (
              <form action={deleteAnswer} className="mt-2 flex justify-end">
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="btn btn-primary !py-1 text-xs">削除する</button>
              </form>
            )}
            {type === "post" && (
              <form action={deleteCirclePost} className="mt-2 flex justify-end">
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="btn btn-primary !py-1 text-xs">削除する</button>
              </form>
            )}
            {type === "comment" && (
              <form action={deleteComment} className="mt-2 flex justify-end">
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="slug" value={slug} />
                <button type="submit" className="btn btn-primary !py-1 text-xs">削除する</button>
              </form>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
