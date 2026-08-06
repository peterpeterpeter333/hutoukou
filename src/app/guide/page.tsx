import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "不登校の進路・制度ガイド",
  description:
    "不登校の子ども・保護者のための進路・制度ガイド。中学卒業後の進路、通信制・定時制・高卒認定・特例校の違い、出席や制度の仕組みを、わかりやすく一望できます。",
  alternates: { canonical: absoluteUrl("/guide") },
};

const SECTIONS = [
  {
    href: "/guide/shinro",
    emoji: "🧭",
    title: "中学卒業後の進路の見取り図",
    desc: "全日制・定時制・通信制・高卒認定・特例校…。それぞれの違いを一望して、わが子に合う道を見つけられます。",
    ready: true,
  },
  {
    href: "#",
    emoji: "📄",
    title: "出席・制度のしくみ（準備中）",
    desc: "出席日数と進級、出席扱い制度、フリースクールとの連携など。",
    ready: false,
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-round text-3xl font-bold">不登校の進路・制度ガイド</h1>
      <p className="mt-3 text-[var(--muted)]">
        「この先、どんな道があるの？」——迷宮になりがちな進路や制度を、やさしく・一望できる形にまとめました。
        道は一つではありません。あせらず、わが子に合う選択肢を一緒に見ていきましょう。
      </p>

      <div className="mt-6 grid gap-3">
        {SECTIONS.map((s) =>
          s.ready ? (
            <Link key={s.title} href={s.href} className="card block p-5 hover:shadow-sm">
              <div className="font-round text-lg font-bold">
                <span aria-hidden>{s.emoji}</span> {s.title}
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{s.desc}</p>
            </Link>
          ) : (
            <div key={s.title} className="card p-5 opacity-60">
              <div className="font-round text-lg font-bold">
                <span aria-hidden>{s.emoji}</span> {s.title}
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{s.desc}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
