import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-[var(--muted)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-sm">
            <div className="font-round text-lg font-bold text-[var(--fg)]">🌱 {SITE.name}</div>
            <p className="mt-2">{SITE.tagline}</p>
          </div>
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2">
            <Link href="/questions" className="hover:underline">みんなの質問</Link>
            <Link href="/circles" className="hover:underline">サークル</Link>
            <Link href="/ask" className="hover:underline">質問する</Link>
            <Link href="/guide/shinro" className="hover:underline">進路の見取り図</Link>
            <Link href="/tools/soudan" className="hover:underline">相談窓口一覧</Link>
            <Link href="/about" className="hover:underline">とびらについて</Link>
            <Link href="/terms" className="hover:underline">利用規約</Link>
            <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
            <Link href="/contact" className="hover:underline">お問い合わせ</Link>
          </nav>
        </div>
        <div className="mt-8 border-t pt-6 text-xs">
          <p>
            ※ このサイトは当事者どうしの体験共有の場です。緊急のときや専門的な助けが必要なときは、
            公的な相談窓口（24時間子供SOSダイヤル 0120-0-78310 など）もご利用ください。
          </p>
          <p className="mt-3">© {new Date().getFullYear()} {SITE.name}（{SITE.nameEn}）・運営：{SITE.operator}</p>
        </div>
      </div>
    </footer>
  );
}
