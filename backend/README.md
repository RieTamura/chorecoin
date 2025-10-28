# Chore Coin Backend API

Hono + Cloudflare Workers + D1 を使用したお手伝いポイント管理アプリのバックエンドAPI。

## セットアップ

### 1. 依存関係のインストール

```bash
cd backend
npm install
```

### 2. Cloudflare D1 データベースの作成

```bash
npm run db:create
```

実行後、出力されたデータベースIDを `wrangler.toml` の `database_id` に設定してください。

### 3. データベースマイグレーション

ローカル開発用:
```bash
npm run db:migrate
```

本番環境用:
```bash
npm run db:migrate:prod
```

### 4. 環境変数の設定

`wrangler.toml` を編集して以下の変数を設定:

- `JWT_SECRET`: JWT トークンの署名に使用するシークレット（本番環境では強力なランダム文字列に変更）
- `GOOGLE_CLIENT_ID`: Google OAuth 2.0 クライアントID

本番環境のシークレットは以下のコマンドで設定:
```bash
wrangler secret put JWT_SECRET
wrangler secret put GOOGLE_CLIENT_ID
```

### 5. ローカル開発サーバーの起動

```bash
npm run dev
```

http://localhost:8787 でアクセス可能になります。

## デプロイ

```bash
npm run deploy
```

## API エンドポイント

### 認証
- `POST /api/auth/google` - Google トークンを検証し、JWT を発行

### お手伝い
- `GET /api/chores` - お手伝い一覧を取得
- `POST /api/chores` - お手伝いを登録
- `PUT /api/chores/:id` - お手伝いを編集
- `DELETE /api/chores/:id` - お手伝いを削除
- `POST /api/chores/:id/complete` - お手伝いを完了

### ご褒美
- `GET /api/rewards` - ご褒美一覧を取得
- `POST /api/rewards` - ご褒美を登録
- `PUT /api/rewards/:id` - ご褒美を編集
- `DELETE /api/rewards/:id` - ご褒美を削除
- `POST /api/rewards/:id/claim` - ご褒美を交換

### 履歴
- `GET /api/history` - 履歴を取得（クエリパラメータ: startDate, endDate）
- `GET /api/history/points` - 現在のポイント数を取得

### ユーザー
- `GET /api/users/me` - 現在のユーザー情報を取得
- `PATCH /api/users/me` - ユーザータイプを更新（parent/child）

## 技術スタック

- **フレームワーク**: Hono
- **ランタイム**: Cloudflare Workers
- **データベース**: Cloudflare D1 (SQLite)
- **認証**: Google OAuth 2.0 + JWT
- **言語**: TypeScript

## データベーススキーマ

### users
- id (TEXT, PRIMARY KEY)
- google_id (TEXT, UNIQUE)
- email (TEXT)
- name (TEXT)
- user_type (TEXT) - 'parent' または 'child'
- created_at (DATETIME)
- updated_at (DATETIME)

### chores
- id (TEXT, PRIMARY KEY)
- user_id (TEXT, FOREIGN KEY)
- name (TEXT)
- points (INTEGER)
- recurring (INTEGER) - 0: その日だけ, 1: 毎日
- created_at (DATETIME)
- updated_at (DATETIME)

### rewards
- id (TEXT, PRIMARY KEY)
- user_id (TEXT, FOREIGN KEY)
- name (TEXT)
- points (INTEGER)
- created_at (DATETIME)
- updated_at (DATETIME)

### history
- id (TEXT, PRIMARY KEY)
- user_id (TEXT, FOREIGN KEY)
- type (TEXT) - 'earn' または 'claim'
- name (TEXT)
- points (INTEGER)
- created_at (DATETIME)

## セキュリティ

- すべての保護されたエンドポイントはJWT認証が必要
- Google ID トークンの署名検証を実施
- CORS設定により許可されたオリジンからのみアクセス可能
- SQLインジェクション対策としてプリペアドステートメントを使用

## ライセンス

MIT
