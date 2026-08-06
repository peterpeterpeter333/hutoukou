import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { ShinroGuide } from "@/components/ShinroGuide";

export const metadata: Metadata = {
  title: "中学卒業後の進路の見取り図（不登校からの選択肢）",
  description:
    "不登校からの進路を一望できる見取り図。全日制・定時制・通信制・サポート校・高卒認定・学びの多様化学校（特例校）・高等専修学校・フリースクールの違いと、向いている人をわかりやすく比較できます。",
  alternates: { canonical: absoluteUrl("/guide/shinro") },
  openGraph: {
    type: "article",
    title: "中学卒業後の進路の見取り図（不登校からの選択肢）｜とびら",
    description: "不登校からの進路を、一望して比べられる見取り図です。",
    url: absoluteUrl("/guide/shinro"),
  },
};

export default function ShinroPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span> / </span>
        <Link href="/guide" className="hover:underline">進路・制度ガイド</Link>
      </nav>

      <h1 className="font-round text-3xl font-bold">中学卒業後の進路の見取り図</h1>
      <p className="mt-3 text-[var(--muted)]">
        不登校からの進路は、一つではありません。「毎日通う高校」だけが道ではなく、
        自分のペースで高卒を目指す道も、通わずに大学を目指す道もあります。
        まずは全体を一望して、わが子に合いそうなものから見ていきましょう。
      </p>

      <div className="mt-6">
        <ShinroGuide />
      </div>

      {/* とびらへの導線 */}
      <section className="mt-10">
        <div className="card bg-[var(--color-brand-soft)] p-6 text-center">
          <div className="font-round text-lg font-bold text-[var(--color-brand-dark)]">
            🤝 「実際どうだった？」を、経験者に聞けます
          </div>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--fg)]">
            通信制ってどんな感じ？高認から大学に行けた？——
            制度の説明だけでは分からない"リアル"は、実際に通った人・通わせた人の声が一番です。
            とびらで気軽に聞いてみてください。
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/ask" className="btn btn-primary">経験者に質問する</Link>
            <Link href="/tools/shien" className="btn btn-soft">支援先を探す</Link>
          </div>
        </div>
      </section>

      <p className="mt-8 text-xs text-[var(--muted)]">
        ※ 各進路の名称・仕組みは一般的な説明です。入学条件・費用・単位や資格の扱いは学校や自治体によって異なります。
        具体的な内容は各校・各自治体の公式情報でご確認ください（参考：文部科学省ほか）。
      </p>
    </div>
  );
}
