import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { CRISIS_LINES, SITUATIONS, telHref, type Line } from "@/lib/soudan";
import { PrefectureFinder } from "@/components/PrefectureFinder";

export const metadata: Metadata = {
  title: "不登校の相談窓口 一覧・地域から探す",
  description:
    "不登校の子ども・保護者のための相談窓口をまとめました。今すぐ話せる全国の電話・チャット窓口、状況別の相談先、お住まいの地域の窓口の探し方まで。ひとりで抱え込まないでください。",
  alternates: { canonical: absoluteUrl("/tools/soudan") },
  openGraph: {
    type: "article",
    title: "不登校の相談窓口 一覧・地域から探す｜とびら",
    description:
      "今すぐ話せる全国の窓口、状況別の相談先、地域の窓口の探し方をまとめました。",
    url: absoluteUrl("/tools/soudan"),
  },
};

function VerifyTag() {
  return (
    <span className="ml-1 rounded bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[#c15b3f]">
      ※要確認
    </span>
  );
}

function LineCard({ line }: { line: Line }) {
  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="font-round font-bold">
          {line.name}
          {line.verify && <VerifyTag />}
        </div>
        {line.hours && <span className="text-xs text-[var(--muted)]">{line.hours}</span>}
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">{line.desc}</p>
      <a
        href={telHref(line.tel)}
        className="mt-2 inline-flex items-center gap-1 text-lg font-bold text-[var(--color-brand-dark)] hover:underline"
      >
        📞 {line.tel}
      </a>
    </div>
  );
}

export default function SoudanPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* パンくず */}
      <nav className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span> / </span>
        <Link href="/tools" className="hover:underline">お役立ちツール</Link>
      </nav>

      <h1 className="font-round text-3xl font-bold">不登校の相談窓口 一覧</h1>
      <p className="mt-3 text-[var(--muted)]">
        「どこに相談したらいいの？」——迷ったときのための窓口をまとめました。
        ひとりで、家庭だけで抱え込まないでくださいね。
      </p>

      {/* 今すぐ・つらいとき */}
      <section className="mt-8">
        <h2 className="mb-1 font-round text-xl font-bold">📞 今すぐ話したい・つらいとき</h2>
        <p className="mb-3 text-sm text-[var(--muted)]">
          いのちや安全にかかわる緊急のときは、迷わずここへ。無料で、名前を言わなくても大丈夫です。
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {CRISIS_LINES.map((line) => (
            <LineCard key={line.name} line={line} />
          ))}
        </div>
      </section>

      {/* 状況別 */}
      <section className="mt-10">
        <h2 className="mb-3 font-round text-xl font-bold">🧭 状況から相談先を探す</h2>
        <div className="grid gap-4">
          {SITUATIONS.map((s) => (
            <div key={s.title} className="card p-5">
              <div className="font-round text-lg font-bold">
                <span aria-hidden>{s.emoji}</span> {s.title}
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{s.body}</p>
              <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
                {s.places.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {s.line && (
                <div className="mt-3 rounded-xl bg-[var(--color-brand-soft)] p-3">
                  <div className="text-sm font-semibold text-[var(--color-brand-dark)]">
                    {s.line.name}
                    {s.line.verify && <VerifyTag />}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{s.line.desc}</p>
                  <a
                    href={telHref(s.line.tel)}
                    className="mt-1 inline-flex items-center gap-1 font-bold text-[var(--color-brand-dark)] hover:underline"
                  >
                    📞 {s.line.tel}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 地域から探す */}
      <section className="mt-10">
        <h2 className="mb-1 font-round text-xl font-bold">🗺 地域から探す</h2>
        <p className="mb-3 text-sm text-[var(--muted)]">
          フリースクールや特例校を含めて探すなら
          <Link href="/tools/shien" className="font-semibold text-[var(--color-brand-dark)] hover:underline">「支援先を探す」</Link>
          が便利です。ここでは、お住まいの都道府県から公的な窓口を検索できます。
        </p>
        <div className="card p-5">
          <PrefectureFinder />
        </div>
      </section>

      {/* とびらへの導線 */}
      <section className="mt-10">
        <div className="card bg-[var(--color-brand-soft)] p-6 text-center">
          <div className="font-round text-lg font-bold text-[var(--color-brand-dark)]">
            🤝 同じ経験の人と話したいときは
          </div>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--fg)]">
            専門の窓口とは別に、「わかるよ」と言い合える仲間がいると、心がふっと軽くなります。
            とびらは、不登校の子ども・保護者・支援者が匿名で悩みを話せるQ&A・交流コミュニティです。
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/" className="btn btn-primary">とびらをのぞいてみる</Link>
            <Link href="/ask" className="btn btn-soft">質問してみる</Link>
          </div>
        </div>
      </section>

      {/* 注意書き */}
      <p className="mt-8 text-xs text-[var(--muted)]">
        ※ 掲載の電話番号・受付時間・内容は変わることがあります。ご利用の際は各窓口の公式情報もあわせてご確認ください。
        とびらは当事者どうしの体験共有の場であり、医療・専門的助言の代わりにはなりません。
      </p>
    </div>
  );
}
