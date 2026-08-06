import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { DirectoryBrowser } from "@/components/DirectoryBrowser";

export const metadata: Metadata = {
  title: "不登校の支援先を探す（フリースクール・相談窓口 一覧）",
  description:
    "不登校の子ども・保護者のための支援先一覧。フリースクール、教育支援センター、学びの多様化学校（特例校）、相談窓口などを、地域・種類・オンライン対応で絞り込んで探せます。",
  alternates: { canonical: absoluteUrl("/tools/shien") },
  openGraph: {
    type: "article",
    title: "不登校の支援先を探す（フリースクール・相談窓口 一覧）｜とびら",
    description: "地域・種類・オンライン対応で絞り込んで、支援先を探せます。",
    url: absoluteUrl("/tools/shien"),
  },
};

export default function ShienPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:underline">ホーム</Link>
        <span> / </span>
        <Link href="/tools" className="hover:underline">お役立ちツール</Link>
      </nav>

      <h1 className="font-round text-3xl font-bold">不登校の支援先を探す</h1>
      <p className="mt-3 text-[var(--muted)]">
        フリースクール、教育支援センター、学びの多様化学校（特例校）、相談窓口などを、
        地域・種類・オンライン対応で絞り込んで探せます。
      </p>

      <div className="mt-6">
        <DirectoryBrowser />
      </div>

      {/* とびらへの導線 */}
      <section className="mt-10">
        <div className="card bg-[var(--color-brand-soft)] p-6 text-center">
          <div className="font-round text-lg font-bold text-[var(--color-brand-dark)]">
            🤝 「うちの子に合う場所はどこ？」を相談したいときは
          </div>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--fg)]">
            実際に通っている人・通わせた人の声が、一番の参考になります。
            とびらで、同じ経験の仲間に気軽に聞いてみてください。
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/ask" className="btn btn-primary">質問してみる</Link>
            <Link href="/tools/soudan" className="btn btn-soft">相談窓口の一覧を見る</Link>
          </div>
        </div>
      </section>

      {/* 掲載についての注記（削除依頼の導線） */}
      <p className="mt-8 text-xs text-[var(--muted)]">
        ※ 掲載情報は変わることがあります。ご利用の際は各支援先の公式情報もご確認ください。
        掲載内容の修正・削除のご依頼、掲載希望は
        <Link href="/contact" className="text-[var(--color-brand-dark)] hover:underline">お問い合わせ</Link>
        からお願いします。
      </p>
    </div>
  );
}
