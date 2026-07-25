// 日本語タイトルから URL 用スラッグを生成する。
// 日本語はローマ字化しないため、ベースは短いランダム接尾辞 + 英数字部分。
// 例: "学校に行きたくない気持ち" -> "q-8f3a2b1c"
//     "How to talk to school" -> "how-to-talk-to-school-8f3a2b1c"

function randomSuffix(len = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function slugify(title: string): string {
  const ascii = title
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9\s-]/g, " ") // 英数字以外（日本語含む）を除去
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .replace(/^-|-$/g, "");

  const suffix = randomSuffix();
  return ascii ? `${ascii}-${suffix}` : `q-${suffix}`;
}

export function circleSlugify(name: string): string {
  const ascii = name
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30)
    .replace(/^-|-$/g, "");
  return ascii || `circle-${randomSuffix()}`;
}
