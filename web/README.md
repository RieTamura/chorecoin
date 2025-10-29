# Webアプリケーション - Chore Coin# Webアプリケーション - Chore Coin



React + TypeScript + Vite で構築した Chore Coin Web アプリケーション。React+TypeScript+Vitで構築したWebアプリケーション。



## 🚀 クイックスタート## セットアップ



### 1. 依存関係のインストール```bash

cd web

```bashnpm install

cd webnpm run dev

npm install```

```

## スクリプト

### 2. 環境変数の設定

- `npm run dev` - 開発サーバーを起動（ポート5173）

`.env.local` ファイルを作成し、以下の内容を記載してください：- `npm run build` - 本番用ビルド

- `npm run preview` - ビルド結果のプレビュー

```bash- `npm run type-check` - TypeScriptの型チェック

# Google OAuth 設定- `npm run lint` - ESLintによるリント

# https://console.cloud.google.com/ で取得したクライアント ID

VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com## プロジェクト構造



# バックエンド API URL```text

VITE_API_URL=http://localhost:8787src/

```├── components/     # 再利用可能なコンポーネント

├── pages/          # ページコンポーネント

> **注意**: Google Client ID を取得するには、Google Cloud Console でプロジェクトを作成し、OAuth 2.0 クライアント ID を設定してください。├── contexts/       # React Context

├── services/       # APIサービス

### 3. 開発サーバーの起動├── hooks/          # カスタムフック

├── types/          # TypeScript型定義

バックエンドも起動した状態で、以下を実行します：├── utils/          # ユーティリティ関数

├── test/           # テスト設定

```bash├── App.tsx         # ルートコンポーネント

# ターミナル1: バックエンドの起動├── main.tsx        # エントリーポイント

cd backend└── index.css       # グローバルスタイル

npm run dev```



# ターミナル2: Web アプリの起動## 開発ガイドライン

cd web

npm run dev- バックエンドAPIは`http://localhost:8787/api`で利用可能（Viteプロキシで自動フォワード）

```- TypeScriptのstrictモードを有効に

- コンポーネントテストはReact Testing Libraryを使用

Web アプリは **http://localhost:5173** でアクセス可能になります。- 環境変数は`.env`ファイルに設定



## 📚 スクリプト## 環境変数



| コマンド | 説明 |```bash

|---------|------|VITE_API_URL=http://localhost:8787

| `npm run dev` | 開発サーバーを起動（ホットリロード対応） |VITE_GOOGLE_CLIENT_ID=your_google_client_id

| `npm run build` | 本番用ビルド（tsc + vite build） |```

| `npm run preview` | ビルド結果のプレビュー |
| `npm run type-check` | TypeScript 型チェック |
| `npm run lint` | ESLint によるコード検査 |
| `npm run test` | Vitest でユニットテスト実行 |
| `npm run test:ui` | テスト UI で確認 |
| `npm run test:coverage` | カバレッジレポート生成 |

## 📁 プロジェクト構造

```text
src/
├── components/          # 再利用可能なコンポーネント
│   └── ProtectedRoute.tsx    # 認証保護ルート
├── pages/               # ページコンポーネント
│   ├── LoginPage.tsx         # ログイン画面
│   ├── LoginPage.css         # ログイン画面スタイル
│   ├── HomePage.tsx          # ホーム画面（メイン機能）
│   └── HomePage.css          # ホーム画面スタイル
├── contexts/            # React Context
│   └── AuthContext.tsx       # 認証コンテキスト
├── services/            # APIサービス層
│   └── api.ts                # Axios インスタンスと API メソッド
├── types/               # TypeScript 型定義
│   └── index.ts              # 全型定義
├── utils/               # ユーティリティ関数
│   └── calendar.ts           # カレンダー処理
├── test/                # テスト関連
│   ├── setup.ts              # テスト環境セットアップ
│   ├── test-utils.tsx        # テストユーティリティ
│   ├── App.test.tsx
│   ├── AuthContext.test.ts
│   ├── api.test.ts
│   ├── components.test.tsx
│   ├── calendar.test.ts
│   ├── pages.test.ts
│   └── models.test.ts
├── App.tsx              # ルートコンポーネント
├── main.tsx             # アプリケーションエントリーポイント
├── App.css              # グローバルスタイル
├── index.css            # ベーススタイル
└── vite-env.d.ts        # Vite 環境型定義
```

## 🔐 機能

### ✅ 実装済み

- **Google OAuth ログイン**: @react-oauth/google を使用した認証
- **ポイント管理**: 現在のポイント表示
- **お手伝い管理**: 
  - やることリスト表示
  - お手伝い完了（ポイント獲得）
  - 親による登録・編集・削除
  - 毎日のお手伝い設定
- **ご褒美交換**:
  - ご褒美一覧表示
  - ポイント不足時の表示
  - ご褒美の交換（ポイント消費）
  - 親による登録・編集・削除
- **履歴表示**:
  - カレンダー形式の月ビュー
  - 日ごとのポイント獲得・使用表示
  - 取引履歴の詳細表示
  - 月ナビゲーション
- **ユーザータイプ管理**:
  - 親と子のアカウント切り替え
  - ユーザータイプに応じた UI 表示
- **エラー・成功メッセージ**:
  - ユーザーフレンドリーなエラー表示
  - 自動消去される成功通知

## 🎨 UI/UX

- **レスポンシブデザイン**: モバイルデバイスに対応
- **タブナビゲーション**: ホーム、ご褒美、履歴、管理（親のみ）
- **ビジュアル通知**: エラー/成功メッセージの自動消去
- **ローディング状態**: 各操作の進行状況表示

## 🔧 開発ガイドライン

### API 通信

API サービス層（`src/services/api.ts`）を使用してください：

```typescript
import apiService from '../services/api'

// 例: お手伝い一覧を取得
const chores = await apiService.getChores()

// 例: お手伝いを完了
const result = await apiService.completeChore(choreId)
```

### エラーハンドリング

API エラーは自動的に整形されます：

```typescript
try {
  await apiService.createChore(name, points, recurring)
  setSuccess('お手伝いを追加しました！')
} catch (error) {
  // エラーメッセージは自動的に生成されています
  setError(error instanceof Error ? error.message : 'エラーが発生しました')
}
```

### TypeScript

Strict mode を有効にしています。型安全性を確保してください：

```typescript
// ❌ 避ける
const user: any = response.data

// ✅ 推奨
import { User } from '../types'
const user: User = response.data
```

### テスト

React Testing Library を使用してテストを記述：

```bash
# テスト実行
npm run test

# ウォッチモード
npm run test -- --watch

# カバレッジ表示
npm run test:coverage
```

## 📋 環境変数テンプレート

`.env.example` ファイルを参照してください。本番環境では以下を設定してください：

```bash
# 本番環境の例
VITE_GOOGLE_CLIENT_ID=prod_client_id.apps.googleusercontent.com
VITE_API_URL=https://api.example.com
```

## 🐛 トラブルシューティング

### Google ログインボタンが表示されない

- `VITE_GOOGLE_CLIENT_ID` が `.env.local` に正しく設定されているか確認
- ブラウザの開発者ツール（F12）でコンソールエラーを確認

### API に接続できない

- バックエンドが起動しているか確認（`http://localhost:8787`）
- `VITE_API_URL` が正しく設定されているか確認
- ネットワークタブでリクエストが送信されているか確認

### ホット リロード が機能しない

- Vite 開発サーバーが正常に起動しているか確認
- キャッシュをクリア: `rm -rf .vite`
- 開発サーバーを再起動

### テストが失敗する

```bash
# キャッシュをクリアして再実行
npm run test -- --clearCache
```

## 📦 依存関係

主要なパッケージ：

- **React 18.2**: UI フレームワーク
- **React Router 6.20**: クライアント側ルーティング
- **Axios 1.6**: HTTP クライアント
- **@react-oauth/google 0.12**: Google OAuth 認証
- **Vite 5.0**: ビルドツール
- **TypeScript 5.3**: 型安全な開発
- **Vitest 1.0**: ユニットテストフレームワーク
- **React Testing Library 14.1**: コンポーネントテストライブラリ

## 🚢 デプロイ

本番環境へのデプロイ手順：

```bash
# 1. ビルド
npm run build

# 2. ビルド結果を確認
npm run preview

# 3. dist/ ディレクトリを本番サーバーにデプロイ
# （例：Vercel, Netlify, AWS S3 等）
```

## 📄 ライセンス

MIT
