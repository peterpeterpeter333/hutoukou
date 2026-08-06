"use client";

import { useState } from "react";
import { ROUTES, PRIORITIES, type Priority } from "@/lib/shinro";

export function ShinroGuide() {
  const [selected, setSelected] = useState<Set<Priority>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (p: Priority) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const active = selected.size > 0;
  const matches = (id: string) => {
    const r = ROUTES.find((x) => x.id === id)!;
    return [...selected].every((p) => r.tags.includes(p)); // 選んだ条件を"すべて"満たす
  };

  // マッチするものを先頭に並べる
  const sorted = [...ROUTES].sort((a, b) => {
    if (!active) return 0;
    return Number(matches(b.id)) - Number(matches(a.id));
  });

  return (
    <div>
      {/* 何を大事にしたい？ */}
      <div className="card p-5">
        <div className="text-sm font-semibold">何を大事にしたいですか？（複数選べます）</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRIORITIES.map((p) => {
            const on = selected.has(p.key);
            return (
              <button
                key={p.key}
                onClick={() => toggle(p.key)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  on
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white"
                    : "border-[var(--color-brand)]/30 bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] hover:border-[var(--color-brand)]"
                }`}
              >
                <span aria-hidden>{p.emoji}</span> {p.label}
              </button>
            );
          })}
        </div>
        {active && (
          <p className="mt-3 text-xs text-[var(--muted)]">
            条件に合う進路を明るく表示しています。合わないものも、状況が変われば選択肢になります。
          </p>
        )}
      </div>

      {/* 進路カード */}
      <div className="mt-4 grid gap-3">
        {sorted.map((r) => {
          const hit = active && matches(r.id);
          const dim = active && !hit;
          const open = openId === r.id;
          return (
            <div
              key={r.id}
              className={`card p-5 transition ${
                hit ? "ring-2 ring-[var(--color-brand)]/50" : ""
              } ${dim ? "opacity-55" : ""}`}
            >
              <button
                onClick={() => setOpenId(open ? null : r.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div>
                  <div className="font-round text-lg font-bold">{r.name}</div>
                  <div className="mt-0.5 text-sm text-[var(--muted)]">{r.tagline}</div>
                </div>
                <span className="mt-1 shrink-0 text-[var(--muted)]">{open ? "－" : "＋"}</span>
              </button>

              {/* かんたん属性 */}
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div className="rounded-lg bg-[var(--color-brand-soft)]/50 px-3 py-2">
                  <div className="text-xs text-[var(--muted)]">通学</div>
                  <div className="font-medium">{r.attend}</div>
                </div>
                <div className="rounded-lg bg-[var(--color-brand-soft)]/50 px-3 py-2">
                  <div className="text-xs text-[var(--muted)]">得られる資格</div>
                  <div className="font-medium">{r.shikaku}</div>
                </div>
                <div className="rounded-lg bg-[var(--color-brand-soft)]/50 px-3 py-2">
                  <div className="text-xs text-[var(--muted)]">費用の目安</div>
                  <div className="font-medium">{r.cost}</div>
                </div>
              </div>

              {open && (
                <div className="mt-3 border-t pt-3">
                  <p className="text-sm text-[var(--muted)]">
                    <span className="font-semibold text-[var(--fg)]">こんな人に：</span>
                    {r.fit}
                  </p>
                  <p className="prose-jp mt-2 text-sm text-[var(--fg)]">{r.detail}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
