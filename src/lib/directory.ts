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
  ages?: string; // 対象（例：小〜高、18歳まで）
  url?: string; // 公式URL
  tel?: string; // 電話（tel:にも使う）
  note?: string; // 自分の言葉での一言（相手の紹介文をコピペしない）
  official?: boolean; // 公的機関か
  verify?: boolean; // 情報の確認が必要（※要確認タグ表示）
};

export const ENTRIES: DirectoryEntry[] = [
  // ── 全国の相談窓口（番号は確認済み。よりそいのみ要確認） ──
  {
    id: "sos",
    name: "24時間子供SOSダイヤル",
    type: "相談窓口",
    region: "全国",
    online: false,
    tel: "0120-0-78310",
    official: true,
    note: "文部科学省の窓口。24時間・無料。子ども本人も保護者も相談できます。",
  },
  {
    id: "childline",
    name: "チャイルドライン",
    type: "相談窓口",
    region: "全国",
    online: true,
    ages: "18歳まで",
    tel: "0120-99-7777",
    official: true,
    note: "名前を言わなくてもOK。チャット相談あり。毎日16:00〜21:00。",
  },
  {
    id: "jidou-189",
    name: "児童相談所虐待対応ダイヤル 189",
    type: "相談窓口",
    region: "全国",
    online: false,
    tel: "189",
    official: true,
    note: "「いちはやく」。子どもの安全が心配なときに。24時間・無料。",
  },
  {
    id: "yorisoi",
    name: "よりそいホットライン",
    type: "相談窓口",
    region: "全国",
    online: true,
    tel: "0120-279-338",
    official: true,
    verify: true,
    note: "どんな悩みでも受け止めてくれる窓口。24時間・無料。",
  },

  // ── ここから下に、地域の支援先を追加していく ──
  // 例）文科省「学びの多様化学校（不登校特例校）」の公式一覧から：
  // {
  //   id: "example-tokyo-1",
  //   name: "（学校名）",
  //   type: "学びの多様化学校",
  //   region: "東京都",
  //   online: false,
  //   url: "https://…",
  //   official: true,
  //   note: "（自分の言葉で一言）",
  // },
];
