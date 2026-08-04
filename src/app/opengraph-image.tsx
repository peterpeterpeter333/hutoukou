import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";
import { BRAND, loadJPFont } from "@/lib/og";

export const runtime = "nodejs";
// ビルド時ではなくアクセス時に生成する（ビルドがフォント取得に依存しないように）
export const dynamic = "force-dynamic";
export const alt = `${SITE.name}｜${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const title = SITE.name; // とびら
  const tagline = SITE.tagline;
  const url = "hutoukou.vercel.app";
  const text = title + tagline + url + "とQ&A・交流コミュニティ不登校の子ども保護者支援者";

  const [bold, medium] = await Promise.all([
    loadJPFont(text + title, 700),
    loadJPFont(text, 500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: BRAND.bg,
          color: BRAND.fg,
          fontFamily: "NotoJP",
          position: "relative",
        }}
      >
        {/* 左の飾り帯 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 20,
            background: BRAND.green,
            display: "flex",
          }}
        />

        {/* ロゴマーク＋名前 */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 24,
              background: BRAND.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 48,
              fontWeight: 700,
            }}
          >
            と
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: BRAND.dark }}>
            {title}
          </div>
        </div>

        {/* キャッチ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.35,
            maxWidth: 940,
          }}
        >
          <div style={{ display: "flex" }}>不登校の子ども・親のための、</div>
          <div style={{ display: "flex" }}>質問と交流のコミュニティ</div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            fontWeight: 500,
            color: BRAND.muted,
          }}
        >
          {tagline}
        </div>

        {/* 下部URL */}
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 56,
            display: "flex",
            fontSize: 28,
            fontWeight: 500,
            color: BRAND.dark,
          }}
        >
          {url}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "NotoJP", data: bold, weight: 700, style: "normal" },
        { name: "NotoJP", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
