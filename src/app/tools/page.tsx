import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "お役立ちツール",
  description:
    "不登校の子ども・保護者のためのお役立ちツール集。相談窓口の一覧など、困ったときに使える道具をまとめています。",
  alternates: { canonical: absoluteUrl("/tools") },
};

// ツール一覧（増えたらここに足すだけ）
const TOOLS = [
  {
    href: "/tools/soudan",
    emoji: "📞",
    title: "不登校の相談窓口 一覧",
    desc: "今すぐ話せる全国の窓口、状況別の相談先、地域の窓口の探し方をまとめました。",
    ready: true,
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-round text-3xl font-bold">🧰 お役立ちツール</h1>
      <p className="mt-3 text-[var(--muted)]">
        不登校のことで困ったときに使える道具をまとめています。少しずつ増やしていきます。
      </p>

      <div className="mt-6 grid gap-3">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="card block p-5 hover:shadow-sm">
            <div className="font-round text-lg font-bold">
              <span aria-hidden>{t.emoji}</span> {t.title}
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
