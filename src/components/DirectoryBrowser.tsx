"use client";

import { useMemo, useState } from "react";
import {
  ENTRY_TYPES,
  REGIONS,
  type DirectoryEntry,
  type EntryType,
  type Region,
} from "@/lib/directory";
import { telHref } from "@/lib/soudan";

const REGION_INDEX = new Map<string, number>(REGIONS.map((r, i) => [r, i]));

const TYPE_STYLE: Record<EntryType, string> = {
  相談窓口: "bg-[var(--color-accent-soft)] text-[#c15b3f]",
  教育支援センター: "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]",
  学びの多様化学校: "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]",
  フリースクール: "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]",
  親の会: "bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]",
};

export function DirectoryBrowser({ entries }: { entries: DirectoryEntry[] }) {
  const [type, setType] = useState<"すべて" | EntryType>("すべて");
  const [region, setRegion] = useState<"すべて" | Region>("すべて");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const kw = q.trim();
    return entries.filter((e) => {
      if (type !== "すべて" && e.type !== type) return false;
      // 地域で絞る場合、全国の窓口は常に含める（どこからでも使えるため）
      if (region !== "すべて" && e.region !== region && e.region !== "全国") return false;
      if (onlineOnly && !e.online) return false;
      if (kw && !(e.name.includes(kw) || (e.note ?? "").includes(kw))) return false;
      return true;
    }).sort((a, b) => {
      const ra = REGION_INDEX.get(a.region) ?? 999;
      const rb = REGION_INDEX.get(b.region) ?? 999;
      if (ra !== rb) return ra - rb; // 全国 → 都道府県順
      return a.name.localeCompare(b.name, "ja");
    });
  }, [entries, type, region, onlineOnly, q]);

  return (
    <div>
      {/* フィルタ */}
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">種類</label>
            <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="field">
              <option value="すべて">すべての種類</option>
              {ENTRY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">地域</label>
            <select value={region} onChange={(e) => setRegion(e.target.value as typeof region)} className="field">
              <option value="すべて">すべての地域</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} />
            オンライン対応のみ
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="キーワードで絞り込み"
            className="field flex-1 sm:max-w-xs"
          />
        </div>
      </div>

      {/* 件数 */}
      <p className="mt-4 text-sm text-[var(--muted)]">{results.length}件</p>

      {/* 一覧 */}
      <div className="mt-2 grid gap-3">
        {results.map((e) => (
          <div key={e.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_STYLE[e.type]}`}>{e.type}</span>
              <span className="text-xs text-[var(--muted)]">{e.region}{e.city ? ` ${e.city}` : ""}</span>
              {e.online && (
                <span className="rounded-full bg-[var(--color-brand-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--color-brand-dark)]">オンライン可</span>
              )}
              {e.official && <span className="text-xs text-[var(--muted)]">公的</span>}
              {e.community && (
                <span className="rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[#8a4632]">みんなの投稿</span>
              )}
              {e.verify && (
                <span className="rounded bg-[var(--color-accent-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[#c15b3f]">※要確認</span>
              )}
            </div>
            <div className="mt-1.5 font-round text-lg font-bold">{e.name}</div>
            {e.ages && <div className="text-xs text-[var(--muted)]">対象：{e.ages}</div>}
            {e.note && <p className="mt-1 text-sm text-[var(--muted)]">{e.note}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              {e.tel && (
                <a href={telHref(e.tel)} className="font-bold text-[var(--color-brand-dark)] hover:underline">📞 {e.tel}</a>
              )}
              {e.url ? (
                <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-dark)] hover:underline">🔗 公式サイト</a>
              ) : (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`${e.name} ${e.region}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-brand-dark)] hover:underline"
                >
                  🔍 Google検索
                </a>
              )}
              {e.source && (
                <a href={e.source} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--muted)] hover:underline">
                  出典{e.sourceName ? `：${e.sourceName}` : ""}
                </a>
              )}
              <a
                href={`/tools/shien/report?about=${encodeURIComponent(`${e.name}（${e.region}${e.city ? ` ${e.city}` : ""}）`)}`}
                className="ml-auto text-xs text-[var(--muted)] hover:text-[#c15b3f] hover:underline"
              >
                🚩 間違いを報告
              </a>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <p className="card p-6 text-center text-sm text-[var(--muted)]">
            条件に合う支援先がまだありません。地域や種類を変えてみてください。
            <br />（掲載データは順次追加していきます）
          </p>
        )}
      </div>
    </div>
  );
}
