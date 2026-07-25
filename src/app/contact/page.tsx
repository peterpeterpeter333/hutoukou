import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { submitContact } from "@/lib/actions";

export const metadata: Metadata = {
  title: "お問い合わせ",
  description: `${SITE.name}（${SITE.nameEn}）へのお問い合わせフォームです。`,
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  empty: "内容を5文字以上でご記入ください。",
  email: "メールアドレスの形式が正しくないようです。",
  limit: "送信が多すぎます。しばらくしてからお試しください。",
  send: "送信に失敗しました。時間をおいて再度お試しください。",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-round text-3xl font-bold">お問い合わせ</h1>
      <p className="mt-3 text-[var(--muted)]">
        {SITE.name}についてのご質問・ご要望、投稿の削除やアカウントに関するご相談、不具合の報告などを
        受け付けています。いただいた内容は運営（{SITE.operator}）が確認します。
      </p>

      <div className="mt-4 rounded-xl bg-[var(--color-accent-soft)] p-4 text-sm text-[#8a4632]">
        いのちや安全にかかわる緊急のときは、このフォームではなく公的な相談窓口をご利用ください。
        <br />24時間子供SOSダイヤル：0120-0-78310 ／ チャイルドライン：0120-99-7777
      </div>

      {sent && (
        <p className="mt-6 rounded-xl bg-[var(--color-brand-soft)] px-4 py-3 text-sm text-[var(--color-brand-dark)]">
          ✅ お問い合わせを受け付けました。ご連絡ありがとうございます。
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="mt-6 rounded-xl bg-[var(--color-accent-soft)] px-4 py-3 text-sm text-[#c15b3f]">
          {ERRORS[error]}
        </p>
      )}

      {!sent && (
        <form action={submitContact} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">お問い合わせの種類</label>
            <select name="category" className="field" defaultValue="ご質問・ご要望">
              <option>ご質問・ご要望</option>
              <option>投稿・アカウントについて</option>
              <option>不具合の報告</option>
              <option>個人情報の取り扱いについて</option>
              <option>その他</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              お名前・ペンネーム <span className="text-[var(--muted)]">（任意）</span>
            </label>
            <input name="name" maxLength={60} className="field" placeholder="ぴー" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              返信先メールアドレス <span className="text-[var(--muted)]">（返信が必要な場合）</span>
            </label>
            <input name="email" type="email" maxLength={200} className="field" placeholder="you@example.com" />
            <p className="mt-1 text-xs text-[var(--muted)]">
              入力いただいたメールアドレスは、返信のためだけに使用します。
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">お問い合わせ内容</label>
            <textarea
              name="message"
              required
              rows={7}
              maxLength={4000}
              className="field resize-y"
              placeholder="お問い合わせの内容をご記入ください。"
            />
          </div>

          {/* ハニーポット（人には見えない。botよけ） */}
          <div aria-hidden className="hidden">
            <label>
              ウェブサイト
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">
              送信により
              <Link href="/privacy" className="text-[var(--color-brand-dark)] hover:underline">プライバシーポリシー</Link>
              に同意したものとみなします。
            </p>
            <button type="submit" className="btn btn-primary">送信する</button>
          </div>
        </form>
      )}

      <div className="mt-10 flex gap-3">
        <Link href="/terms" className="btn btn-ghost">利用規約</Link>
        <Link href="/privacy" className="btn btn-ghost">プライバシーポリシー</Link>
      </div>
    </div>
  );
}
