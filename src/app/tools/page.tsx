import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "お役立ち情報",
  description:
    "不登校の子ども・保護者のためのお役立ち情報。進路の見取り図、支援先探し、相談窓口の一覧など、困ったときに役立つ情報をまとめています。",
  alternates: { canonical: absoluteUrl("/tools") },
};

// ツール一覧（増えたらここに足すだけ）
const TOOLS = [
  {
    href: "/guide/shinro",
    emoji: "🧭",
    title: "中学卒業後の進路の見取り図",
    desc: "全日制・定時制・通信制・高卒認定・特例校…。違いを一望して、わが子に合う道を見つけられます。",
    ready: true,
  },
  {
    href: "/tools/shien",
    emoji: "🗺",
    title: "不登校の支援先を探す",
    desc: "フリースクール・教育支援センター・特例校・相談窓口を、地域や種類で絞り込んで探せます。",
    ready: true,
  },
  {
    href: "/tools/soudan",
    emoji: "📞",
    title: "不登校の相談窓口 一覧",
    desc: "今すぐ話せる全国の窓口、状況別の相談先をまとめました。",
    ready: true,
  },
];

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-round text-3xl font-bold">🧰 お役立ち情報</h1>
      <p className="mt-3 text-[var(--muted)]">
        不登校のことで困ったときに役立つ、進路ガイドや支援先・相談窓口をまとめています。少しずつ増やしていきます。
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
