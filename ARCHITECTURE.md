# ChoreCoin アーキテクチャドキュメント

## 概要
ChoreCoin（お手伝いコイン）は、子供たちがお手伝いをすることでコインを獲得し、それを使って報酬を得るシステムを提供するアプリケーションです。

## システム構成

### 現在の構成
- **Webアプリケーション**: 主要なプラットフォーム

### 将来の構成
- **iOSアプリ**: ネイティブモバイル体験
- **Androidアプリ**: ネイティブモバイル体験

## 推奨技術スタック

### バックエンド
- **言語**: TypeScript/Node.js または Python
- **フレームワーク**: Express.js/Fastify または FastAPI/Django
- **データベース**: PostgreSQL (リレーショナル) + Redis (キャッシュ)
- **認証**: JWT + OAuth2.0
- **API設計**: RESTful API または GraphQL

### フロントエンド（Web）
- **フレームワーク**: React/Next.js または Vue.js/Nuxt.js
- **状態管理**: Redux/Zustand または Pinia
- **スタイリング**: Tailwind CSS または Material-UI
- **型安全性**: TypeScript必須

### モバイルアプリ

#### オプション1: ネイティブ開発
- **iOS**: Swift + SwiftUI
- **Android**: Kotlin + Jetpack Compose

#### オプション2: クロスプラットフォーム（推奨）
- **React Native**: JavaScriptの知識を活用
- **Flutter**: 高性能なクロスプラットフォーム開発

### インフラストラクチャ
- **ホスティング**: AWS/GCP/Azure
- **CI/CD**: GitHub Actions
- **コンテナ化**: Docker + Docker Compose
- **モニタリング**: Sentry (エラー追跡) + Datadog/New Relic

## データモデル設計

### 主要エンティティ

#### User（ユーザー）
- id (UUID)
- email (string)
- password_hash (string)
- role (enum: parent, child)
- created_at (timestamp)
- updated_at (timestamp)

#### Family（家族グループ）
- id (UUID)
- name (string)
- created_at (timestamp)

#### Child（子供）
- id (UUID)
- family_id (foreign key)
- user_id (foreign key)
- name (string)
- coin_balance (integer)
- created_at (timestamp)

#### Chore（お手伝いタスク）
- id (UUID)
- family_id (foreign key)
- title (string)
- description (text)
- coin_reward (integer)
- status (enum: active, inactive)
- created_at (timestamp)

#### ChoreCompletion（完了記録）
- id (UUID)
- chore_id (foreign key)
- child_id (foreign key)
- completed_at (timestamp)
- verified_by (foreign key to User)
- verified_at (timestamp)
- coins_earned (integer)

#### Reward（報酬）
- id (UUID)
- family_id (foreign key)
- title (string)
- description (text)
- coin_cost (integer)
- status (enum: active, inactive)
- created_at (timestamp)

#### RewardRedemption（報酬交換）
- id (UUID)
- reward_id (foreign key)
- child_id (foreign key)
- coins_spent (integer)
- redeemed_at (timestamp)
- fulfilled_at (timestamp)

## セキュリティ考慮事項

### 認証・認可
- パスワードは必ずbcryptまたはArgon2でハッシュ化
- セッション管理にはHTTPOnly、Secureフラグ付きのCookieを使用
- CSRF保護を実装
- レート制限を実装してブルートフォース攻撃を防ぐ

### データ保護
- 個人情報の暗号化（保存時・転送時）
- HTTPS必須
- 環境変数で機密情報を管理（.envファイル、GitHubにはコミットしない）
- SQLインジェクション対策（ORMの使用、パラメータ化クエリ）

### GDPR/個人情報保護
- ユーザーデータの削除機能
- プライバシーポリシーの明示
- 保護者の同意取得（子供のアカウント作成時）

## API設計原則

### RESTful API設計
```
GET    /api/v1/families/:familyId/chores       # お手伝い一覧取得
POST   /api/v1/families/:familyId/chores       # お手伝い作成
GET    /api/v1/families/:familyId/chores/:id   # お手伝い詳細取得
PUT    /api/v1/families/:familyId/chores/:id   # お手伝い更新
DELETE /api/v1/families/:familyId/chores/:id   # お手伝い削除

POST   /api/v1/chores/:id/complete              # お手伝い完了
POST   /api/v1/chores/:id/verify                # 完了確認（親）

GET    /api/v1/children/:id/balance             # コイン残高取得
GET    /api/v1/children/:id/history             # 履歴取得

GET    /api/v1/families/:familyId/rewards       # 報酬一覧取得
POST   /api/v1/rewards/:id/redeem               # 報酬交換
```

### レスポンス形式
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2025-10-28T02:51:58Z"
}
```

## スケーラビリティ

### 初期段階
- モノリシックアーキテクチャでOK
- 単一データベースインスタンス

### 成長段階
- マイクロサービスアーキテクチャへの移行を検討
- データベースの読み取りレプリカ追加
- CDN導入（静的コンテンツ配信）
- キャッシュ層の強化

## テスト戦略

### バックエンド
- **単体テスト**: Jest, Mocha, PyTest
- **統合テスト**: Supertest, PyTest
- **E2Eテスト**: Playwright
- カバレッジ目標: 80%以上

### フロントエンド
- **単体テスト**: Jest + React Testing Library
- **コンポーネントテスト**: Storybook
- **E2Eテスト**: Playwright/Cypress

### モバイル
- **iOS**: XCTest
- **Android**: JUnit + Espresso
- **クロスプラットフォーム**: Jest + Detox

## モニタリング・ロギング

### メトリクス
- API応答時間
- エラーレート
- ユーザーアクティビティ
- データベースクエリパフォーマンス

### ロギング
- 構造化ログ（JSON形式）
- ログレベル: ERROR, WARN, INFO, DEBUG
- センシティブ情報のマスキング

## デプロイメント戦略

### 環境
- **開発**: ローカル開発環境
- **ステージング**: 本番環境のミラー
- **本番**: プロダクション環境

### CI/CD
1. コードプッシュ
2. 自動テスト実行
3. セキュリティスキャン
4. ビルド
5. ステージング環境へデプロイ
6. 自動E2Eテスト
7. 本番環境へデプロイ（承認後）

### ロールバック戦略
- ブルーグリーンデプロイメント
- カナリアリリース
- 即座にロールバック可能な設定

## パフォーマンス最適化

### フロントエンド
- 画像の最適化（WebP, lazy loading）
- コード分割（code splitting）
- ツリーシェイキング
- キャッシュ戦略

### バックエンド
- データベースインデックス最適化
- N+1クエリ問題の回避
- コネクションプーリング
- 非同期処理の活用

## アクセシビリティ

### Web
- WCAG 2.1 AAレベル準拠
- キーボードナビゲーション
- スクリーンリーダー対応
- 適切なARIAラベル

### モバイル
- iOS VoiceOver対応
- Android TalkBack対応
- 大きなタッチターゲット（最小44x44pt）

## 国際化（i18n）

### 対応言語
- 日本語（デフォルト）
- 英語（将来的に）

### 実装
- i18next (Web)
- ローカライゼーション対応の日付・数値フォーマット
- 右から左への言語対応の準備

## ドキュメンテーション

### 必須ドキュメント
- README.md: プロジェクト概要とセットアップ
- CONTRIBUTING.md: 貢献ガイドライン
- API.md: API仕様書
- DEPLOYMENT.md: デプロイ手順
- SECURITY.md: セキュリティポリシー

### コードドキュメント
- JSDoc/TSDoc/Docstringsの使用
- 複雑なロジックにはコメント追加
- ADR（Architecture Decision Records）の記録
