import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateDailyQA } from "@/lib/ai-generate";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercelの関数タイムアウト（秒）

// Vercel Cron から毎日呼ばれる。CRON_SECRET で保護。
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await generateDailyQA();
    revalidatePath("/");
    revalidatePath("/questions");
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[cron/generate]", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
