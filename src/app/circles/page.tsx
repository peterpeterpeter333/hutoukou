import Link from "next/link";
import type { Metadata } from "next";
import { getCircles } from "@/lib/queries";
import { createCircle } from "@/lib/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "サークル",
  description: "テーマ別に集まって交流できるサークル。ゲームや趣味の話、当事者どうし・保護者どうしのつながりが見つかります。",
};

export default async function CirclesPage() {
  const circles = await getCircles();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-round text-2xl font-bold">🫧 サークル</h1>
      <p className="mt-2 text-[var(--muted)]">
        同じテーマの仲間があつまる場所。気になるサークルをのぞいてみましょう。
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {circles.map((c) => (
          <Link
            key={c.id}
            href={`/circles/${c.slug}`}
            className="card flex gap-3 p-5 transition hover:shadow-sm"
          >
            <div className="text-3xl" aria-hidden>{c.emoji}</div>
            <div className="min-w-0">
              <div className="font-round font-bold">{c.name}</div>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{c.description}</p>
              <div className="mt-2 text-xs text-[var(--muted)]">
                👥 {c._count.members}人 ・ 💬 {c._count.questions + c._count.posts}件の投稿
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* サークル作成 */}
      <section className="mt-10">
        <div className="card p-6">
          <h2 className="font-round text-lg font-bold">＋ 新しいサークルをつくる</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            話したいテーマがあれば、あなたが場をひらけます。
          </p>
          <form action={createCircle} className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">絵文字</span>
                <input name="emoji" defaultValue="🌱" maxLength={4} className="field text-center" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">サークル名</span>
                <input name="name" required minLength={2} maxLength={40} placeholder="例）お絵かきが好き" className="field" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">どんな場所か（任意）</span>
              <input name="description" maxLength={120} placeholder="例）絵を描くのが好きな人でゆるくつながる場所" className="field" />
            </label>
            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">つくる</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
