# ChoreCoin（お手伝いコイン）

> 子供たちがお手伝いを楽しく学べるコイン報酬システム

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 📖 概要

ChoreCoin（お手伝いコイン）は、子供たちが家事のお手伝いをすることで仮想コインを獲得し、それを使って報酬と交換できるアプリケーションです。楽しみながら責任感と金銭管理の基礎を学ぶことができます。

### 主な機能

- 🏠 **家族グループ管理**: 複数の家族メンバーを管理
- ✅ **お手伝いタスク**: カスタマイズ可能なタスクと報酬設定
- 💰 **コインシステム**: お手伝い完了でコインを獲得
- 🎁 **報酬交換**: 貯めたコインで報酬と交換
- 👨‍👩‍👧‍👦 **保護者承認**: タスク完了の確認機能
- 📊 **進捗追跡**: お手伝い履歴とコイン残高の確認

## 🚀 技術スタック

### 現在
- **フロントエンド**: （検討中: React/Next.js または Vue.js/Nuxt.js）
- **バックエンド**: （検討中: Node.js/Express または Python/FastAPI）
- **データベース**: （検討中: PostgreSQL）
- **認証**: （検討中: JWT）

### 今後の予定
- 📱 **iOS アプリ**: ネイティブまたはクロスプラットフォーム
- 🤖 **Android アプリ**: ネイティブまたはクロスプラットフォーム

## 📋 ドキュメント

- [アーキテクチャ設計](./ARCHITECTURE.md) - システム設計と技術選定
- [開発ガイドライン](./DEVELOPMENT_GUIDELINES.md) - コーディング規約とベストプラクティス
- [コードレビューガイドライン](./CODE_REVIEW_GUIDELINES.md) - レビューの観点とプロセス
- [セキュリティポリシー](./SECURITY.md) - セキュリティ対策とインシデント報告
- [コントリビューション](./CONTRIBUTING.md) - プロジェクトへの貢献方法

## 🛠️ セットアップ（予定）

### 前提条件

- Node.js 18.x 以上
- npm または yarn
- Docker & Docker Compose（推奨）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/RieTamura/chorecoin.git
cd chorecoin

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env ファイルを編集

# データベースをセットアップ
npm run db:migrate

# 開発サーバーを起動
npm run dev
```

### Docker を使用する場合

```bash
# コンテナを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

## 🧪 テスト

```bash
# 全テストを実行
npm test

# テストカバレッジ
npm test -- --coverage

# E2Eテスト
npm run test:e2e

# リンター
npm run lint

# 型チェック
npm run type-check
```

## 📱 使用方法（予定）

### 保護者として

1. アカウントを作成
2. 家族グループを作成
3. 子供のアカウントを追加
4. お手伝いタスクと報酬を設定
5. 子供の完了報告を承認

### 子供として

1. 保護者に追加してもらう
2. 利用可能なお手伝いを確認
3. お手伝いを完了して報告
4. コインを獲得
5. 貯めたコインで報酬と交換

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。

### 貢献の方法

- 🐛 バグ報告
- 💡 機能提案
- 📝 ドキュメント改善
- 🔧 コード修正
- 🌍 翻訳

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](./LICENSE) ファイルをご覧ください。

## 🔒 セキュリティ

セキュリティ脆弱性を発見した場合は、[SECURITY.md](./SECURITY.md) の手順に従って報告してください。

## 📞 お問い合わせ

- **Issues**: [GitHub Issues](https://github.com/RieTamura/chorecoin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RieTamura/chorecoin/discussions)

## 🙏 謝辞

このプロジェクトに貢献してくださった全ての方に感謝します。

## 📊 プロジェクト状態

現在、プロジェクトは初期段階にあり、アーキテクチャ設計とドキュメント整備を行っています。

### ロードマップ

- [ ] 技術スタックの最終決定
- [ ] データベーススキーマ設計
- [ ] API設計
- [ ] 認証システム実装
- [ ] フロントエンド開発
- [ ] バックエンド開発
- [ ] テスト実装
- [ ] デプロイメント設定
- [ ] モバイルアプリ開発（iOS/Android）

---

**注意**: このプロジェクトは開発中です。APIや機能は予告なく変更される可能性があります。
