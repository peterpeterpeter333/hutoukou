import Link from "next/link";
import type { Metadata } from "next";
import { getAuthUser } from "@/lib/auth";
import { submitEntry } from "@/lib/actions";
import { ENTRY_TYPES, REGIONS } from "@/lib/directory";

export const metadata: Metadata = {
  title: "支援先を追加する",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  empty: "名前・種類・地域は必須です。",
  limit: "投稿が多すぎます。しばらくしてからお試しください。",
};

export default async function AddEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const user = await getAuthUser();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <nav className="mb-4 text-sm text-[var(--muted)]">
        <Link href="/tools/shien" className="hover:underline">← 支援先を探す に戻る</Link>
      </nav>

      <h1 className="font-round text-2xl font-bold">支援先を追加する</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        知っているフリースクール・親の会・相談窓口などを教えてください。
        いただいた情報は運営が確認してから掲載します（すぐには公開されません）。
      </p>

      {!user ? (
        <div className="mt-6 rounded-xl bg-[var(--color-brand-soft)] p-5 text-sm text-[var(--color-brand-dark)]">
          投稿にはログインが必要です。
          <div className="mt-3 flex gap-2">
            <Link href="/login?next=/tools/shien/add" className="btn btn-primary !py-1.5 text-sm">ログイン</Link>
            <Link href="/register?next=/tools/shien/add" className="btn btn-soft !py-1.5 text-sm">新規登録</Link>
          </div>
        </div>
      ) : sent ? (
        <div className="mt-6 rounded-xl bg-[var(--color-brand-soft)] p-5 text-sm text-[var(--color-brand-dark)]">
          🙏 ありがとうございます！運営が確認して、問題なければ一覧に掲載します。
          <div className="mt-3">
            <Link href="/tools/shien" className="btn btn-soft">一覧に戻る</Link>
          </div>
        </div>
      ) : (
        <>
          {error && ERRORS[error] && (
            <p className="mt-4 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">{ERRORS[error]}</p>
          )}

          <form action={submitEntry} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">名前 <span className="text-[#c15b3f]">*</span></label>
              <input name="name" required maxLength={120} className="field" placeholder="○○フリースクール" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">種類 <span className="text-[#c15b3f]">*</span></label>
                <select name="type" required className="field" defaultValue="フリースクール">
                  {ENTRY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">地域 <span className="text-[#c15b3f]">*</span></label>
                <select name="region" required className="field" defaultValue="">
                  <option value="" disabled>選んでください</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">市区町村 <span className="text-[var(--muted)]">（任意）</span></label>
              <input name="city" maxLength={60} className="field" placeholder="○○市" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="online" /> オンライン対応がある
            </label>

            <div>
              <label className="mb-1 block text-sm font-medium">公式サイトURL <span className="text-[var(--muted)]">（任意）</span></label>
              <input name="url" type="url" maxLength={300} className="field" placeholder="https://…" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">電話番号 <span className="text-[var(--muted)]">（任意）</span></label>
              <input name="tel" maxLength={40} className="field" placeholder="00-0000-0000" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">一言メモ <span className="text-[var(--muted)]">（任意）</span></label>
              <textarea name="note" rows={3} maxLength={500} className="field resize-y" placeholder="どんな場所か、対象年齢など（相手の紹介文のコピペはお控えください）" />
            </div>

            <div aria-hidden className="hidden">
              <label>ウェブサイト<input name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">投稿する（確認後に掲載）</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
