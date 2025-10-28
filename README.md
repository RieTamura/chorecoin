# 🪙 Chore Coin - お手伝いコイン

> お手伝いコインアプリ

子どもが実施したお手伝いをポイント制で管理し、貯まったポイントでご褒美と交換できるモバイルアプリケーション。

## 📱 プロジェクト概要

- **フロントエンド**：Expo + React Native + TypeScript
- **バックエンド**：Hono + Cloudflare Workers
- **データベース**：Cloudflare D1
- **認証**：Google OAuth 2.0

## 🏗️ プロジェクト構造

```text
chorecoin/
├── backend/          # Honoバックエンド (Cloudflare Workers)
│   ├── src/
│   │   ├── routes/   # APIルート
│   │   ├── middleware/   # 認証ミドルウェア
│   │   ├── db/       # データベース関連
│   │   └── index.ts  # エントリーポイント
│   ├── migrations/   # D1マイグレーション
│   ├── package.json
│   ├── wrangler.toml
│   └── README.md
│
└── frontend/         # Expo React Nativeアプリ
    ├── app/          # Expo Router画面
    │   ├── (tabs)/   # タブナビゲーション
    │   ├── _layout.tsx
    │   └── index.tsx # ログイン画面
    ├── components/   # 再利用可能なコンポーネント
    ├── contexts/     # Reactコンテキスト
    ├── services/     # APIサービス
    ├── types/        # TypeScript型定義
    ├── package.json
    ├── app.json
    └── tsconfig.json
```

## 🚀 セットアップ

### 前提条件

- Node.js18以上
- npmまたはyarn
- Cloudflareアカウント
- Google Cloud Platformアカウント（OAuth設定用）

### 1. バックエンドのセットアップ

```bash
cd backend
npm install

# Cloudflare D1データベースの作成
npm run db:create

# wrangler.tomlのdatabase_idを更新

# データベースマイグレーション
npm run db:migrate

# ローカル開発サーバーの起動
npm run dev
```

詳細は [backend/README.md](backend/README.md) を参照してください。

### 2. フロントエンドのセットアップ

```bash
cd frontend
npm install

# app.jsonのextra.googleClientIdを更新

# 開発サーバーの起動
npm start
```

### 3. Google OAuth設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. OAuth 2.0クライアントIDを作成（iOS/Android用）
3. クライアントIDを取得
4. バックエンドの`wrangler.toml`とフロントエンドの`app.json`に設定

## 🎯 主な機能

### ユーザー向け機能

- ✅ Googleアカウントでログイン
- 🏠 ホーム画面：やることリストとポイント表示
- ✨ お手伝い完了でポイント獲得
- 🎁 ご褒美画面：ポイントで交換
- 📅 履歴画面：獲得・使用履歴をカレンダー表示

### 管理者（親）向け機能

- ➕ お手伝いの登録・編集・削除
- 🎯 ご褒美の登録・編集・削除
- 🔄 毎日繰り返すお手伝いの設定
- 📊 子どもの進捗確認

## 📖 APIエンドポイント

### 認証

- `POST /api/auth/google` - Google認証

### お手伝い

- `GET /api/chores` - 一覧取得
- `POST /api/chores` - 登録
- `PUT /api/chores/:id` - 編集
- `DELETE /api/chores/:id` - 削除
- `POST /api/chores/:id/complete` - 完了

### ご褒美

- `GET /api/rewards` - 一覧取得
- `POST /api/rewards` - 登録
- `PUT /api/rewards/:id` - 編集
- `DELETE /api/rewards/:id` - 削除
- `POST /api/rewards/:id/claim` - 交換

### 履歴

- `GET /api/history` - 履歴取得
- `GET /api/history/points` - 現在のポイント取得

### ユーザー

- `GET /api/users/me` - ユーザー情報取得
- `PATCH /api/users/me` - ユーザータイプ更新

## 🧪 開発

### バックエンドのデプロイ

```bash
cd backend
npm run deploy
```

### フロントエンドのビルド（EAS Build）

```bash
cd frontend
npx eas build --platform ios
npx eas build --platform android
```

## 🔒 セキュリティ

- Google IDトークンの署名検証
- JWT認証
- CORS設定
- プリペアドステートメント（SQLインジェクション対策）

## 📄 ライセンス

MIT

## 👥 開発者

Chore Coin開発チーム
