# お手伝いポイント管理アプリ - 要件定義書

## 1. プロジェクト概要

子どもが実施したお手伝いをポイント制で管理し、貯まったポイントでご褒美と交換できるモバイルアプリケーション。

**プロジェクト名**: Chore Coion - やることコイン -
**対象ユーザー**: 親（監督者）と子ども  
**提供形式**: iOSアプリ（将来的にはAndroid対応も検討）

---

## 2. 技術スタック

| レイヤー | 技術選定 |
|---------|---------|
| **フロントエンド（モバイル）** | Expo + React Native + TypeScript |
| **バックエンド** | Hono + Cloudflare Workers |
| **データベース** | Cloudflare D1 |
| **認証** | Google OAuth 2.0（Cloudflareで検証） |
| **ビルド・デプロイ** | EAS Build（Expo公式サービス） |

---

## 3. 機能要件

### 3.1 認証・ユーザー管理

- **Google認証による登録・ログイン**
  - Expoアプリ側でGoogle SDKを使用してトークンを取得
  - Honoバックエンドでトークンの署名を検証
  - ユーザー情報をCloudflare D1に保存
  - JWTトークンを発行し、以後のAPI通信で使用

- **ユーザータイプ**
  - 親（管理者）：お手伝いの設定、ご褒美の設定、子どもの進捗確認
  - 子ども：お手伝いの完了報告、ご褒美の交換

---

### 3.2 お手伝い管理

- **お手伝いの登録**
  - 名前、ポイント数を入力
  - 「毎日」or「その日だけ」を選択
  - 親が登録・編集・削除可能

- **お手伝いの完了報告**
  - 子どもが「完了」ボタンを押すとポイント獲得
  - その日だけのお手伝いはリストから消去
  - 毎日のお手伝いはリストに残る

- **履歴表示**
  - カレンダー形式で月ごとに表示
  - 各日付に獲得ポイントと使用ポイントを表示
  - 前月・翌月への移動が可能

---

### 3.3 ご褒美管理

- **ご褒美の登録**
  - 名前、必要ポイント数を入力
  - 親が登録・編集・削除可能

- **ご褒美の交換**
  - ポイント数が足りていれば「交換」ボタンが有効
  - 交換時にポイントが消費される
  - 交換履歴が記録される

---

### 3.4 ポイント表示

- **現在のポイント数を常時表示**
  - ホーム画面に大きく表示
  - リアルタイム更新

---

### 3.5 データ同期

- すべての操作はCloudflare Workers経由でクラウドに保存
- 複数デバイスからアクセスした場合もデータが同期される

---

## 4. 非機能要件

### 4.1 セキュリティ

- Google IDトークンの署名検証を実装
- JWTトークンは十分な有効期限を設定（例：1時間）
- リフレッシュトークンで更新機能を実装
- CORS設定をExpoアプリのみに限定
- 環境変数にシークレット情報を保管（Cloudflare環境変数）

### 4.2 パフォーマンス

- Cloudflare Workersによるエッジ実行で低レイテンシーを実現
- Cloudflare D1による高速なデータアクセス

### 4.3 スケーラビリティ

- Cloudflare Workersは自動スケーリング対応
- 将来的なユーザー増加に対応可能

### 4.4 可用性

- 24時間365日稼働を想定
- エラーハンドリングとフォールバック機能

---

## 5. データベーススキーマ（概要）

### テーブル: users

```sql
- id: UUID (Primary Key)
- google_id: String (Google固有ID)
- email: String
- name: String
- created_at: DateTime
- updated_at: DateTime
```

### テーブル: chores

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users)
- name: String
- points: Integer
- recurring: Boolean (毎日 = true、その日だけ = false)
- created_at: DateTime
- updated_at: DateTime
```

### テーブル: rewards

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users)
- name: String
- points: Integer
- created_at: DateTime
- updated_at: DateTime
```

### テーブル: history

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users)
- type: String (earn = ポイント獲得、claim = ご褒美交換)
- name: String (お手伝い名またはご褒美名)
- points: Integer
- created_at: DateTime
```

---

## 6. APIエンドポイント（概要）

### 認証

- `POST /api/auth/google` - Googleトークンを検証し、JWTを発行

### お手伝い

- `POST /api/chores` - お手伝いを登録
- `GET /api/chores` - お手伝い一覧を取得
- `PUT /api/chores/:id` - お手伝いを編集
- `DELETE /api/chores/:id` - お手伝いを削除
- `POST /api/chores/:id/complete` - お手伝いを完了

### ご褒美

- `POST /api/rewards` - ご褒美を登録
- `GET /api/rewards` - ご褒美一覧を取得
- `PUT /api/rewards/:id` - ご褒美を編集
- `DELETE /api/rewards/:id` - ご褒美を削除
- `POST /api/rewards/:id/claim` - ご褒美を交換

### 履歴

- `GET /api/history` - 履歴を取得（日付でフィルタ可能）

### ユーザー

- `GET /api/users/me` - 現在のユーザー情報を取得

---

## 7. 画面・UI要件

### 7.1 ログイン画面

- Googleログインボタン
- 初回登録フロー

### 7.2 ホーム画面

- 現在のポイント数表示
- やることリスト（毎日のお手伝い、その日だけのお手伝い）
- 完了ボタン

### 7.3 ご褒美画面

- ご褒美一覧
- 交換可能な状態を視覚的に表示（ポイント不足時はボタン非表示）
- 交換ボタン

### 7.4 履歴（カレンダー）画面

- 月ごとのカレンダー表示
- 各日付に獲得・使用ポイントを表示
- 前月・翌月ボタン

### 7.5 管理画面（親用）

- お手伝い、ご褒美の登録・編集・削除
- 子どもの進捗確認

---

## 8. 開発スケジュール（参考）

| フェーズ | 内容 | 期間 |
|---------|------|------|
| **Phase 1** | 要件定義、設計 | - |
| **Phase 2** | Honoバックエンド実装、Google認証実装 | - |
| **Phase 3** | Cloudflare D1セットアップ、API実装 | - |
| **Phase 4** | Expoアプリ実装、API連携 | - |
| **Phase 5** | テスト、デバッグ | - |
| **Phase 6** | EAS Buildでビルド、TestFlightで配布 | - |
| **Phase 7** | App Store リリース | - |

---

## 9. 制約事項

- iOS 13以上対応
- インターネット接続が必須
- Googleアカウントでのログインが必須
- 複数ユーザー対応（各ユーザーは独立したデータ）

---

## 10. 今後の拡張可能性

- Androidアプリのリリース
- 複数の子ども管理（親が複数の子どもを管理）
- データのエクスポート機能
- 通知機能（ご褒美交換時のアラートなど）
- SNS連携
- 多言語対応
