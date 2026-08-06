import { PREFECTURES } from "./soudan";

// ───────────────────────────────────────────────────────────
// 支援先ディレクトリ（フリースクール・教育支援センター・特例校・相談窓口・親の会）
//
// ★ データの足し方：下の ENTRIES 配列に1件ずつオブジェクトを足すだけ。
//   公式・準公式のリスト（文科省「学びの多様化学校」一覧／自治体の教育支援センター／
//   フリースクール全国ネットワーク等）から、事実（名前・地域・公式URL・電話）を転記。
//   相手サイトの紹介文はコピペせず、note は自分の言葉で短く。
//   情報が未確認のものは verify:true にすると画面に「※要確認」が付きます。
// ───────────────────────────────────────────────────────────

export const REGIONS = ["全国", ...PREFECTURES] as const;
export type Region = (typeof REGIONS)[number];

export const ENTRY_TYPES = [
  "相談窓口",
  "教育支援センター",
  "学びの多様化学校",
  "フリースクール",
  "親の会",
] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export type DirectoryEntry = {
  id: string;
  name: string;
  type: EntryType;
  region: Region;
  online: boolean; // オンライン対応の有無
  city?: string; // 市区町村
  ages?: string; // 対象（例：小〜高、18歳まで）
  url?: string; // 公式URL
  tel?: string; // 電話（tel:にも使う）
  note?: string; // 一言説明
  official?: boolean; // 公的機関か
  source?: string; // 出典URL（データの根拠）
  sourceName?: string; // 出典の名前
  verify?: boolean; // 情報の確認が必要（※要確認タグ表示）
};

// データは src/data/supports.json に集約（公開情報をもとに作成）。
// 追加・修正はそのJSONを編集する。
import raw from "@/data/supports.json";

export const ENTRIES: DirectoryEntry[] = raw as DirectoryEntry[];
