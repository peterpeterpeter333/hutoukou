import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";
import { BRAND, loadJPFont } from "@/lib/og";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = SITE.name;

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const q = await prisma.question
    .findUnique({ where: { slug }, select: { title: true, hidden: true } })
    .catch(() => null);

  const rawTitle = q && !q.hidden ? q.title : SITE.tagline;
  // レイアウト崩れ防止に長すぎるタイトルは丸める
  const title = rawTitle.length > 58 ? rawTitle.slice(0, 57) + "…" : rawTitle;

  const label = "とびら ・ 不登校のQ&A";
  const url = "hutoukou.vercel.app";
  const text = title + label + url + "と質問回答";

  const [bold, medium] = await Promise.all([
    loadJPFont(text, 700),
    loadJPFont(text, 500),
  ]);

  // 文字数に応じてサイズを調整
  const titleSize = title.length > 40 ? 52 : title.length > 26 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: BRAND.bg,
          color: BRAND.fg,
          fontFamily: "NotoJP",
          position: "relative",
        }}
      >
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

        {/* 上部ラベル */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: BRAND.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            と
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: BRAND.dark }}>
            {label}
          </div>
        </div>

        {/* 質問タイトル */}
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.35,
            color: BRAND.fg,
          }}
        >
          {title}
        </div>

        {/* 下部 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 28,
            fontWeight: 500,
            color: BRAND.muted,
          }}
        >
          <div style={{ display: "flex", color: BRAND.dark, fontWeight: 700 }}>{SITE.name}</div>
          <div style={{ display: "flex" }}>{url}</div>
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
