export const SITE = {
  name: "とびら",
  nameEn: "Tobira",
  tagline: "不登校の子ども・親のための、質問と交流のコミュニティ",
  description:
    "とびらは、不登校の子ども・保護者・支援者が、悩みを質問したり、経験を分かち合ったりできるQ&A・交流コミュニティです。ひとりで抱え込まず、同じ経験の仲間とつながれます。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tobira.example.com",
};

export function absoluteUrl(path = ""): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "たった今";
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}日前`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}ヶ月前`;
  return `${Math.floor(mo / 12)}年前`;
}
