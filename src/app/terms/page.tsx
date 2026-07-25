import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "利用規約",
  description: `${SITE.name}（${SITE.nameEn}）の利用規約です。`,
  robots: { index: true, follow: true },
};

// 最終更新日（内容を変えたら手動で更新してください）
const UPDATED = "2026年7月25日";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-round text-3xl font-bold">利用規約</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">最終更新日：{UPDATED}</p>

      <div className="mt-6 rounded-xl bg-[var(--color-accent-soft)] p-4 text-sm text-[#8a4632]">
        <strong>はじめに（ドラフト）</strong>
        <p className="mt-1">
          この利用規約は、{SITE.name} を安心して使っていただくための土台となる下書きです。
          正式に公開・運営される際は、弁護士など専門家の確認を受けたうえでご利用ください。
        </p>
      </div>

      <div className="prose-jp mt-8 space-y-8 text-[var(--fg)]">
        <p>
          この利用規約（以下「本規約」）は、{SITE.operator}（以下「運営者」）が提供する
          {SITE.name}（{SITE.nameEn}、以下「本サービス」）の利用条件を定めるものです。
          本サービスを利用する方（以下「利用者」）は、本規約に同意したうえでご利用いただきます。
        </p>

        <section>
          <h2 className="font-round text-xl font-bold">第1条（本サービスの目的）</h2>
          <p className="mt-2">
            本サービスは、不登校の子ども・保護者・支援者などが、悩みを質問したり、経験を分かち合ったり
            できる Q&amp;A・交流コミュニティです。当事者どうしの体験共有の場であり、医療・心理・法律などの
            専門的な助言を提供するものではありません。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第2条（利用について・未成年の方へ）</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>本サービスは、匿名（ペンネーム）でも、メールアドレスでの登録でもご利用いただけます。</li>
            <li>
              未成年の方も利用できますが、個人が特定される情報（本名・学校名・住所・電話番号・顔写真など）は
              書き込まないでください。心配ごとがあるときは、保護者や信頼できる大人にも相談することをおすすめします。
            </li>
            <li>
              いのちや安全にかかわる緊急のときは、本サービスではなく公的な相談窓口
              （24時間子供SOSダイヤル 0120-0-78310 など）をご利用ください。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第3条（アカウントの管理）</h2>
          <p className="mt-2">
            登録された方は、パスワードを適切に管理する責任を負います。第三者による利用や不正アクセスに
            気づいた場合は、速やかにパスワードを変更するなどの対応をお願いします。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第4条（禁止事項）</h2>
          <p className="mt-2">利用者は、次の行為をしてはなりません。</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>他の利用者や第三者を誹謗中傷し、差別し、又は傷つける行為</li>
            <li>他人の個人情報・プライバシーを、本人の同意なく書き込む行為</li>
            <li>自傷・自殺・危険な行為を助長・誘発する内容の投稿</li>
            <li>わいせつ・暴力的な表現、その他公序良俗に反する投稿</li>
            <li>宗教・投資・商品などの勧誘、スパム、広告目的の投稿</li>
            <li>虚偽の情報や、他者になりすます行為</li>
            <li>法令に違反する行為、又は犯罪行為に結びつく行為</li>
            <li>本サービスの運営を妨害する行為、不正アクセス、過度な負荷をかける行為</li>
          </ul>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第5条（投稿内容の取り扱い）</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>投稿した文章などの内容についての責任は、投稿した利用者に帰属します。</li>
            <li>
              運営者は、本サービスの提供・改善・紹介のために、投稿内容を必要な範囲で利用（表示・複製・
              検索エンジンへの掲載など）できるものとします。
            </li>
            <li>
              本規約に違反する投稿、又は違反のおそれがある投稿は、運営者の判断で非表示・削除できるものとします。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第6条（AIによる投稿について）</h2>
          <p className="mt-2">
            本サービスには、話題のきっかけづくりのため、AIが生成した Q&amp;A が含まれることがあります。
            これらは「とびら編集部（AI）」名義で表示され、AIによる生成であることを明示します。
            AIの回答は参考情報であり、正確性・完全性を保証するものではありません。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第7条（免責事項）</h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              本サービスは、投稿内容の正確性・有用性・安全性について保証しません。投稿を参考にするかどうかは、
              利用者ご自身の判断と責任でお願いします。
            </li>
            <li>
              本サービスは医療・心理・法律などの専門的助言に代わるものではありません。専門的な支援が必要な
              ときは、医療機関や公的な相談窓口をご利用ください。
            </li>
            <li>
              運営者は、通信環境やメンテナンス等により、本サービスを予告なく変更・中断・終了することがあります。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第8条（利用の停止）</h2>
          <p className="mt-2">
            運営者は、利用者が本規約に違反した場合、事前の通知なく、投稿の削除や利用の停止などの措置を
            とることができるものとします。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第9条（規約の変更）</h2>
          <p className="mt-2">
            運営者は、必要に応じて本規約を変更できるものとします。変更後の規約は、本ページに掲載した時点から
            効力を生じます。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第10条（準拠法・管轄）</h2>
          <p className="mt-2">
            本規約は日本法に準拠します。本サービスに関して紛争が生じた場合は、運営者の所在地を管轄する
            裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>

        <section>
          <h2 className="font-round text-xl font-bold">第11条（お問い合わせ）</h2>
          <p className="mt-2">
            本規約に関するお問い合わせは、
            <Link href="/contact" className="text-[var(--color-brand-dark)] hover:underline">お問い合わせフォーム</Link>
            よりお願いします。
          </p>
        </section>

        <p className="text-sm text-[var(--muted)]">
          個人情報の取り扱いについては、
          <Link href="/privacy" className="text-[var(--color-brand-dark)] hover:underline">プライバシーポリシー</Link>
          をご覧ください。
        </p>
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/privacy" className="btn btn-ghost">プライバシーポリシー</Link>
        <Link href="/contact" className="btn btn-ghost">お問い合わせ</Link>
      </div>
    </div>
  );
}
