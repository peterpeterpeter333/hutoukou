# 🌱 とびら（Tobira）

**不登校の子ども・保護者・支援者のための、Q&A・交流コミュニティ**

「学校に行きたくない」——その気持ちを、責められずに話せる場所。
知恵袋 / Quora のような Q&A に、Yay のようなサークル（交流コミュニティ）機能を組み合わせ、
**検索流入（SEO）で広がり、SNS的に育てていく**ことを目指したサービスです。

---

## ✨ 主な機能（MVP）

- **Q&A**：質問の投稿・回答・「役に立った💚」投票・ベストアンサー
- **コメント**：質問・回答に短いコメントを付けて対話できる（通報・削除・通知に対応）
- **サークル**：テーマ別コミュニティ。「タイムライン（返信＝スレッド可）」と「質問」をタブで分離、参加、サークル作成
- **タグ / 検索**：タグ別一覧、キーワード検索
- **匿名（ペンネーム）投稿**：会員登録なしでも投稿できる（cookieベースの軽量アイデンティティ）
- **本人認証**：メール＋パスワード（bcrypt）＋セッショントークン。匿名で書いた投稿は登録時に引き継ぎ
  - 総当たり対策（ログイン/登録のレート制限）・弱いパスワードの拒否を実装済み
- **通知**：自分の質問に回答／自分の投稿に返信 が届く（ヘッダーに未読バッジ）
- **通報・モデレーション**：質問/回答/投稿を理由付きで通報（匿名可）。一定数で自動非表示。
  管理者用モデレーション画面で非表示/復帰・対応管理。自分の投稿は自分で削除可能
- **立場バッジ**：当事者 / 保護者 / 支援者
- **プロフィールページ**：投稿した質問・回答の一覧
- **SEO最適化**：
  - 1質問=1URL（`/questions/[slug]`）でサーバーレンダリング
  - 構造化データ **QAPage / Question / Answer**（検索結果でのリッチ表示）
  - `sitemap.xml` / `robots.txt` / OpenGraph / 適切な `<title>`・description
  - 検索意図に沿った**初期質問100件**を投入済み（`prisma/seed-data.ts` に追記して増やせます）

## 🧱 技術スタック

| 領域 | 採用 |
| --- | --- |
| フレームワーク | **Next.js 16（App Router）** / React 19 |
| 言語 | TypeScript |
| スタイル | Tailwind CSS v4 |
| DB / ORM | **Prisma 6** + **PostgreSQL**（開発・本番とも。Neon 等の無料枠でOK） |
| データ更新 | React Server Actions（JSなしでも動作するフォーム） |
| フォント | Noto Sans JP / Zen Maru Gothic |

## 🚀 セットアップ（ローカル開発）

データベースは **PostgreSQL** を使います。無料の **Neon**（https://neon.tech）でDBを1つ作り、接続文字列を控えておきます。

```bash
# 1. 依存をインストール
npm install

# 2. 環境変数（.env）を用意し、DATABASE_URL に Neon の接続文字列を設定
cp .env.example .env
#   .env を開いて DATABASE_URL="postgresql://..." を貼り付け

# 3. スキーマ反映 & 初期データ投入
npm run db:push
npm run db:seed

# 4. 開発サーバー起動
npm run dev
# → http://localhost:3000
```

### npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド（Prisma生成込み） |
| `npm run db:push` | スキーマをDBに反映 |
| `npm run db:seed` | 初期データ投入 |
| `npm run db:reset` | DBリセット＋再シード |
| `npm run db:studio` | Prisma Studio（DB GUI） |

## 🗂 データモデル（概要）

`User`（利用者）/ `Question`（質問）/ `Answer`（回答）/ `Vote`（投票）/
`Tag`・`TagOnQuestion`（タグ）/ `Circle`（サークル）/ `CircleMember`（参加）/ `CirclePost`（つぶやき）

詳細は [`prisma/schema.prisma`](./prisma/schema.prisma) を参照。

## 📁 ディレクトリ

```
src/
  app/                 # ページ（App Router）
    page.tsx           # ホーム（フィード）
    questions/         # 質問一覧・詳細（SEOの中心）
    circles/           # サークル一覧・詳細
    tags/[slug]/       # タグ別
    ask/               # 質問投稿
    search/            # 検索
    u/[handle]/        # プロフィール
    about/             # とびらについて
    sitemap.ts / robots.ts
  components/          # UIコンポーネント
  lib/
    db.ts              # Prismaクライアント
    queries.ts         # データ取得
    actions.ts         # Server Actions（投稿・投票など）
    session.ts         # 匿名ユーザー（cookie）
    site.ts / slug.ts
prisma/
  schema.prisma
  seed-data.ts         # ← 初期質問はここに追記して増やせます
  seed.ts
```

## 🌐 本番デプロイ（Vercel + Neon）

### 1. Neon で Postgres を用意
1. https://neon.tech に登録 → プロジェクト作成（無料枠）
2. 接続文字列（`postgresql://...?sslmode=require`）をコピー

### 2. Neon にスキーマ・初期データを投入（ローカルから一度だけ）
```bash
# .env の DATABASE_URL を Neon の接続文字列にして
npm run db:push
npm run db:seed
```

### 3. Vercel でデプロイ
1. https://vercel.com に GitHub で登録
2. 「New Project」→ `peterpeterpeter333/hutoukou` を Import
3. **Environment Variables** に以下を設定：
   | 変数 | 値 |
   | --- | --- |
   | `DATABASE_URL` | Neon の接続文字列 |
   | `NEXT_PUBLIC_SITE_URL` | 発行される Vercel の URL（例 `https://hutoukou.vercel.app`） |
   | `ADMIN_EMAILS` | 管理者にするメール |
4. Deploy

### 4. 公開後
- Google Search Console にサイトを登録し、`https://<あなたのドメイン>/sitemap.xml` を送信
- 独自ドメインを使う場合は Vercel の Domains で設定し、`NEXT_PUBLIC_SITE_URL` を更新
- **公開前後に足すべき**：メール認証・パスワード再設定（メール送信サービスが必要）

## 🛣 ロードマップ（今後の育て方）

- [x] 本人認証（メール＋パスワード）＋レート制限・パスワード強度チェック
- [x] 通知（回答・返信）
- [x] 通報・モデレーション（自動非表示・管理画面・自分の投稿の削除）
- [x] 本番デプロイ（Vercel + Neon Postgres）
- [x] AI自動投稿（Vercel Cron で毎日 Q&A を生成・公開。安全ガードレール付き）
- [x] メール認証・パスワード再設定（Resend）＋ X/LINE シェアボタン
- [x] 利用規約・プライバシーポリシー・お問い合わせフォーム（ドラフト。公開前に専門家確認を推奨）
- [x] **初期質問を100件まで拡充**（検索流入の土台。`seed-data.ts` に追記）
- [ ] フォロー / 全体タイムライン（SNS化）・回答へのコメント
- [ ] 画像投稿・リッチテキスト
- [ ] Postgres + 全文検索（pg_trgm など）への移行、本番デプロイ
- [ ] OGP画像の自動生成（検索・SNSでのクリック率向上）

## 🔒 セキュリティ状況（自前認証）

- **実装済み**：bcryptハッシュ / 256bitセッショントークン / httpOnly・sameSite・secure(本番) cookie /
  ログイン・登録のレート制限 / 弱いパスワードの拒否 / Server Actions標準のCSRF対策 /
  Prismaによるインジェクション対策 / Reactの自動XSSエスケープ
- **メール認証・パスワード再設定**：実装済み（Resend）。`RESEND_API_KEY` と `EMAIL_FROM` を設定すると有効化。
  未設定でも動作はし、メール内容はサーバーログに出力（開発用）

### モデレーター（管理者）になる方法
`.env` に管理者にしたいメールアドレスを設定し、そのメールで登録／ログインします。

```bash
ADMIN_EMAILS="you@example.com"   # カンマ区切りで複数可
```

管理者はヘッダーの 🛡 からモデレーション画面（`/moderation`）に入れます。
通報が3件たまると対象は自動で非表示になり、管理者が確認・復帰できます。

---

## 🤖 AI自動投稿（Vercel Cron）

毎日 `/api/cron/generate` が実行され、Claude API で不登校テーマの Q&A を生成して公開します。

- 投稿は「**とびら編集部（AI）**」名義で、回答末尾に相談窓口の注記を付ける（AI生成であることを明示）
- 安全ガードレール：医療断定を避ける／自傷・緊急事態は専門窓口へ誘導／体験談の捏造をしない
- 必要な環境変数（Vercel に設定）：`ANTHROPIC_API_KEY`、`CRON_SECRET`。任意で `AI_MODEL`（既定 `claude-sonnet-5`）・`AI_DAILY_COUNT`（既定 6）
- スケジュール：`vercel.json` の cron（既定 06:00 JST）。Vercel Hobby プランは1日1回まで
- 手動テスト：`curl -H "Authorization: Bearer <CRON_SECRET>" https://<本番URL>/api/cron/generate`

> ※ とびらは当事者どうしの体験共有の場であり、医療・専門的助言の代わりにはなりません。
> 緊急時は公的な相談窓口（24時間子供SOSダイヤル 0120-0-78310 など）をご利用ください。
