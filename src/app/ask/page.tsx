import type { Metadata } from "next";
import { getCircles } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { askQuestion } from "@/lib/actions";
import { IdentityFields } from "@/components/IdentityFields";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "質問する",
  description: "不登校に関する悩みや疑問を、匿名で気軽に質問できます。",
};

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; circle?: string }>;
}) {
  const { error, circle } = await searchParams;
  const [circles, user] = await Promise.all([getCircles(), getCurrentUser()]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-round text-2xl font-bold">質問する</h1>
      <p className="mt-2 text-[var(--muted)]">
        どんな小さなことでも大丈夫です。匿名で投稿できます。
      </p>

      {error === "short" && (
        <p className="mt-4 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
          タイトルと本文をもう少し詳しく書いてください。
        </p>
      )}

      <form action={askQuestion} className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">タイトル（質問の要点）</span>
          <input
            name="title"
            required
            minLength={4}
            maxLength={120}
            placeholder="例）中学生の子が学校に行きたくないと言い出しました。まず何をすれば？"
            className="field"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">くわしい内容</span>
          <textarea
            name="body"
            required
            minLength={4}
            rows={7}
            placeholder="状況や気持ち、聞きたいことを書いてみましょう。"
            className="field resize-y"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">サークル（任意）</span>
            <select name="circle" defaultValue={circle ?? ""} className="field">
              <option value="">選ばない</option>
              {circles.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">タグ（任意・カンマ区切り）</span>
            <input
              name="tags"
              placeholder="中学生, 進路, 母親"
              className="field"
            />
          </label>
        </div>

        <div className="border-t pt-5">
          <IdentityFields
            defaultName={user?.displayName ?? ""}
            defaultRole={user?.role ?? "member"}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button type="submit" className="btn btn-primary">質問を投稿する</button>
        </div>
      </form>
    </div>
  );
}
