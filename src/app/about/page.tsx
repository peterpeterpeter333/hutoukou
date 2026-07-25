import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "とびらについて",
  description: SITE.description,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-round text-3xl font-bold">🌱 とびらについて</h1>
      <p className="mt-4 text-lg text-[var(--muted)]">{SITE.tagline}</p>

      <div className="prose-jp mt-8 space-y-6 text-[var(--fg)]">
        <p>
          「学校に行きたくない」——その気持ちを、責められずに話せる場所がほしい。
          とびらは、不登校の子ども・保護者・支援者が、悩みを質問したり、
          自分の経験を分かち合ったりできるコミュニティです。
        </p>

        <div>
          <h2 className="font-round text-xl font-bold">とびらの約束</h2>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>否定しない、責めない。</li>
            <li>匿名でだいじょうぶ。</li>
            <li>「正しい答え」より「あなたの経験」を大切に。</li>
            <li>ここで見聞きしたことを、勝手に外へ持ち出さない。</li>
          </ul>
        </div>

        <div>
          <h2 className="font-round text-xl font-bold">3つの使い方</h2>
          <ul className="mt-3 space-y-2">
            <li>💬 <strong>質問する</strong>：小さな悩みでも大丈夫。同じ経験の人が答えてくれます。</li>
            <li>🫧 <strong>サークル</strong>：テーマ別に集まって、ゆるく交流できます。</li>
            <li>💚 <strong>回答する</strong>：あなたの経験が、いま迷っている誰かの支えになります。</li>
          </ul>
        </div>

        <div className="rounded-xl bg-[var(--color-accent-soft)] p-5 text-sm text-[#8a4632]">
          <strong>だいじなお願い</strong>
          <p className="mt-1">
            とびらは当事者どうしの体験共有の場で、医療・専門的助言の代わりにはなりません。
            いのちや安全にかかわる緊急のときは、下記の窓口にご連絡ください。
          </p>
          <ul className="mt-2 list-inside list-disc">
            <li>24時間子供SOSダイヤル：0120-0-78310</li>
            <li>チャイルドライン：0120-99-7777</li>
            <li>いのちの電話：0570-783-556</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/ask" className="btn btn-primary">質問してみる</Link>
        <Link href="/circles" className="btn btn-ghost">サークルを見る</Link>
      </div>
    </div>
  );
}
