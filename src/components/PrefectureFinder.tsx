"use client";

import { useState } from "react";
import { PREFECTURES } from "@/lib/soudan";

// 都道府県を選ぶと、その地域の公的な相談窓口をGoogle検索で探せる。
// （番号・URLを持たないので、常に最新・確認不要・安全）
export function PrefectureFinder() {
  const [pref, setPref] = useState("");

  const search = (q: string) =>
    `https://www.google.com/search?q=${encodeURIComponent(q)}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm font-medium">お住まいの地域：</label>
        <select
          value={pref}
          onChange={(e) => setPref(e.target.value)}
          className="field sm:w-48"
        >
          <option value="">選んでください</option>
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {pref && (
        <div className="mt-4 grid gap-2">
          <p className="text-sm text-[var(--muted)]">
            {pref}の窓口を探すリンクです（Google検索が開きます）：
          </p>
          <a
            className="btn btn-soft justify-start !py-2 text-sm"
            href={search(`${pref} 教育相談 不登校`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            🏫 {pref}の「教育相談」窓口を探す
          </a>
          <a
            className="btn btn-soft justify-start !py-2 text-sm"
            href={search(`${pref} 教育支援センター 適応指導教室`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            🌱 {pref}の「教育支援センター（適応指導教室）」を探す
          </a>
          <a
            className="btn btn-soft justify-start !py-2 text-sm"
            href={search(`${pref} フリースクール 不登校`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            🏠 {pref}の「フリースクール」を探す
          </a>
          <a
            className="btn btn-soft justify-start !py-2 text-sm"
            href={search(`${pref} 児童相談所`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            📞 {pref}の「児童相談所」を探す
          </a>
        </div>
      )}
    </div>
  );
}
