import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: `${SITE.name}（${SITE.nameEn}）のプライバシーポリシー（個人情報の取り扱い）です。`,
  robots: { index: true, follow: true },
};

// 最終更新日（内容を変えたら手動で更新してください）
const UPDATED = "2026年7月25日";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-round text-3xl font-bold">プライバシーポリシー</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">最終更新日：{UPDATED}</p>

      <div className="mt-6 rounded-xl bg-[var(--color-accent-soft)] p-4 text-sm text-[#8a4632]">
        <strong>はじめに（ドラフト）</strong>
        <p className="mt-1">
          このプライバシーポリシーは下書きです。正式に公開・運営される際は、実際の運用に合わせて内容を
          見直し、専門家の確認を受けたうえでご利用ください。
        </p>
      </div>

      <div className="prose-jp mt-8 space-y-8 text-[var(--fg)]">
        <p>
          {SITE.operator}（以下「運営者」）は、{SITE.name}（{SITE.nameEn}、以下「本サービス」）における
          利用者の個人情報を、以下のとおり取り扱います。
        </p>

        <section>
          <h2 className="font-round text-xl font-bold">1. 取得する情報</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>登録情報</strong>：メールアドレス、パスワード（暗号化して保存し、元の文字列は保持しません）、
              表示名（ペンネーム）、立場（当事者／保護者／支援者）など、ご自身で入力された情報。
            </li>
            <li>
              <strong>投稿内容</strong>：質問・回答・コメント・サークルへの投稿など、本サービス上に書き込んだ内容。
            </li>
            <li>
              <strong>技術的な情報</strong>：cookie（ログイン状態や匿名の識別に使用）、IPアドレス、
              アクセス日時、ブラウザの種類などの利用ログ。
            </li>
          </ul>
          <p className="mt-2 text-sm text-[var(--muted)]">
            ※ 本名・学校名・住所・電話番号などの、個人が特定される情報の入力は求めていません。
            投稿欄にこれらを書き込まないようお願いします。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">2. 利用目的</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>本サービスの提供・表示・本人確認・ログイン状態の維持のため</li>
            <li>メールアドレスの確認、パスワード再設定、重要なお知らせの通知のため</li>
            <li>不正利用・スパム・いやがらせの防止（レート制限など）のため</li>
            <li>お問い合わせへの対応のため</li>
            <li>本サービスの品質向上・不具合対応のため</li>
          </ul>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">3. 外部サービスの利用</h2>
          <p className="mt-2">
            本サービスは、運営のために次の外部サービスを利用しています。これらのサービスには、提供に必要な
            範囲で情報が保存・処理されることがあります。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Vercel</strong>（ホスティング・アクセスログ）</li>
            <li><strong>Neon</strong>（データベース。登録情報・投稿内容の保存）</li>
            <li><strong>Resend</strong>（確認・再設定などのメール送信）</li>
            <li><strong>Anthropic（Claude）</strong>（AIによる話題づくりの Q&amp;A 生成。利用者個人の情報は送信しません）</li>
          </ul>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">4. 第三者への提供</h2>
          <p className="mt-2">
            運営者は、次の場合を除き、本人の同意なく個人情報を第三者に提供しません。
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護のために必要で、本人の同意を得ることが困難な場合</li>
            <li>上記「外部サービスの利用」に記載の、サービス提供に必要な範囲での委託</li>
          </ul>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">5. cookie（クッキー）について</h2>
          <p className="mt-2">
            本サービスは、ログイン状態の保持や、会員登録なしでも投稿できる匿名の識別のために cookie を
            使用します。ブラウザの設定で cookie を無効にすると、一部の機能が使えなくなることがあります。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">6. お子さまの個人情報</h2>
          <p className="mt-2">
            本サービスは未成年の方も利用できます。お子さまが個人を特定される情報を投稿しないよう配慮する
            とともに、保護者の方は必要に応じて利用状況を見守っていただくようお願いします。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">7. 保存期間・削除</h2>
          <p className="mt-2">
            投稿やアカウントは、削除機能により利用者ご自身で消すことができます。アカウントの削除や
            自分の情報の確認・訂正を希望される場合は、お問い合わせフォームよりご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">8. 安全管理</h2>
          <p className="mt-2">
            パスワードは暗号化して保存し、通信はSSL/TLSで暗号化しています。運営者は、個人情報の漏えい・
            改ざん・不正アクセスの防止に努めます。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">9. ポリシーの変更</h2>
          <p className="mt-2">
            運営者は、必要に応じて本ポリシーを変更できるものとします。変更後の内容は、本ページに掲載した
            時点から効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">10. お問い合わせ窓口</h2>
          <p className="mt-2">
            個人情報の取り扱いに関するお問い合わせは、
            <Link href="/contact" className="text-[var(--color-brand-dark)] hover:underline">お問い合わせフォーム</Link>
            よりお願いします。
          </p>
        </section>
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/terms" className="btn btn-ghost">利用規約</Link>
        <Link href="/contact" className="btn btn-ghost">お問い合わせ</Link>
      </div>
    </div>
  );
}
