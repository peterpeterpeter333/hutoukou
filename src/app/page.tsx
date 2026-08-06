import Link from "next/link";
import { getQuestions, getCircles, getPopularTags, getStats } from "@/lib/queries";
import { QuestionCard } from "@/components/QuestionCard";
import { Stat, Tag } from "@/components/ui";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [stats, popular, recent, circles, tags] = await Promise.all([
    getStats(),
    getQuestions({ sort: "popular", take: 4 }),
    getQuestions({ sort: "recent", take: 6 }),
    getCircles(),
    getPopularTags(20),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: absoluteUrl("/"),
    description: SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ヒーロー */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-brand-soft)] to-transparent" />
        <div className="mx-auto max-w-5xl px-4 pb-8 pt-14 text-center">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--card)] px-3 py-1 text-sm text-[var(--color-brand-dark)] shadow-sm">
            🌱 ひとりじゃないよ
          </p>
          <h1 className="font-round text-3xl font-bold leading-tight sm:text-4xl">
            学校に行けないとき、<br className="sm:hidden" />
            <span className="text-[var(--color-brand)]">聞ける・話せる</span>場所。
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">
            不登校の子ども・保護者・支援者があつまるQ&Aと交流のコミュニティ。
            匿名でだいじょうぶ。同じ経験をした人の言葉が、きっと見つかります。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/ask" className="btn btn-primary">
              ✏️ 質問してみる
            </Link>
            <Link href="/questions" className="btn btn-ghost">
              みんなの質問を見る
            </Link>
          </div>
          <div className="mx-auto mt-8 flex max-w-md items-center justify-around rounded-2xl bg-[var(--card)] py-4 shadow-sm">
            <Stat value={stats.questions} label="質問" />
            <Stat value={stats.answers} label="回答" />
            <Stat value={stats.circles} label="サークル" />
            <Stat value={stats.users} label="なかま" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* サークル */}
        <section className="mt-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-round text-xl font-bold">🫧 サークルでつながる</h2>
            <Link href="/circles" className="text-sm text-[var(--color-brand-dark)] hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {circles.map((c) => (
              <Link
                key={c.id}
                href={`/circles/${c.slug}`}
                className="card min-w-[220px] max-w-[240px] shrink-0 p-4 transition hover:shadow-sm"
              >
                <div className="text-2xl" aria-hidden>{c.emoji}</div>
                <div className="mt-1 font-round font-bold">{c.name}</div>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{c.description}</p>
                <div className="mt-2 text-xs text-[var(--muted)]">
                  👥 {c._count.members}人 ・ 💬 {c._count.questions + c._count.posts}件
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* お役立ち情報 */}
        <section className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-round text-xl font-bold">🧭 お役立ち情報</h2>
            <Link href="/tools" className="text-sm text-[var(--color-brand-dark)] hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/guide/shinro" className="card p-4 transition hover:shadow-sm">
              <div className="text-2xl" aria-hidden>🧭</div>
              <div className="mt-1 font-round font-bold">進路の見取り図</div>
              <p className="mt-1 text-xs text-[var(--muted)]">通信制・定時制・高認・特例校…違いを一望</p>
            </Link>
            <Link href="/tools/shien" className="card p-4 transition hover:shadow-sm">
              <div className="text-2xl" aria-hidden>🗺</div>
              <div className="mt-1 font-round font-bold">支援先を探す</div>
              <p className="mt-1 text-xs text-[var(--muted)]">フリースクール・特例校などを地域で検索</p>
            </Link>
            <Link href="/tools/soudan" className="card p-4 transition hover:shadow-sm">
              <div className="text-2xl" aria-hidden>📞</div>
              <div className="mt-1 font-round font-bold">相談窓口 一覧</div>
              <p className="mt-1 text-xs text-[var(--muted)]">今すぐ話せる窓口・状況別の相談先</p>
            </Link>
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_260px]">
          <div>
            {/* 注目の質問 */}
            <section>
              <h2 className="mb-3 font-round text-xl font-bold">🔥 よく読まれている質問</h2>
              <div className="grid gap-3">
                {popular.map((q) => (
                  <QuestionCard key={q.id} q={q} />
                ))}
              </div>
            </section>

            {/* 新着 */}
            <section className="mt-10">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-round text-xl font-bold">🆕 新着の質問</h2>
                <Link href="/questions" className="text-sm text-[var(--color-brand-dark)] hover:underline">
                  もっと見る →
                </Link>
              </div>
              <div className="grid gap-3">
                {recent.map((q) => (
                  <QuestionCard key={q.id} q={q} />
                ))}
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="font-round font-bold">💚 とびらの約束</h3>
              <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                <li>・否定しない、責めない</li>
                <li>・匿名で気軽に話せる</li>
                <li>・「正解」より「あなたの経験」</li>
              </ul>
              <Link href="/about" className="mt-3 inline-block text-sm text-[var(--color-brand-dark)] hover:underline">
                とびらについて →
              </Link>
            </div>

            <div className="card p-5">
              <h3 className="font-round font-bold">🏷 よく検索されるタグ</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Tag key={t.id} name={t.name} slug={t.slug} />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
