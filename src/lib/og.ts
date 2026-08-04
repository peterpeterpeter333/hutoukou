// OGP画像（next/og）用の共有ヘルパー。
// 日本語フォントは「実際に描画する文字ぶんだけ」Google Fonts から取得してサブセット化する
// （full フォントは数MBあるため。text= に含めた文字だけの軽量フォントが返る）。

const BRAND = {
  green: "#2f9e75",
  dark: "#257a5a",
  soft: "#eaf6ef",
  bg: "#f3faf6",
  fg: "#2b2a28",
  muted: "#6f6b64",
};

export { BRAND };

/**
 * Noto Sans JP を、描画に使う文字（text）ぶんだけ取得して ArrayBuffer で返す。
 * satori(next/og) は woff2 を扱えないため、truetype/opentype のURLを抜き出して取得する。
 */
export async function loadJPFont(
  text: string,
  weight: 400 | 500 | 700 = 700,
): Promise<ArrayBuffer> {
  const family = "Noto Sans JP";
  // 重複文字を除いて軽くする
  const uniq = Array.from(new Set(text.split(""))).join("");
  const url =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}` +
    `&text=${encodeURIComponent(uniq)}`;

  const cssRes = await fetch(url, {
    headers: {
      // 古めのUAにすると Google が truetype を返す（woff2 を避ける）
      "User-Agent":
        "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0",
    },
  });
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\((.+?)\)\s*format\('(?:opentype|truetype)'\)/);
  if (!match) throw new Error("OGフォントの取得に失敗しました");

  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}
