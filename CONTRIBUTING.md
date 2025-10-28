# Contributing to ChoreCoin

ChoreCoin（お手伝いコイン）へのコントリビューションに興味を持っていただき、ありがとうございます！
このドキュメントでは、プロジェクトに貢献する方法を説明します。

## 目次
1. [行動規範](#行動規範)
2. [はじめ方](#はじめ方)
3. [開発プロセス](#開発プロセス)
4. [プルリクエストの作成](#プルリクエストの作成)
5. [コーディング規約](#コーディング規約)
6. [コミットメッセージ](#コミットメッセージ)
7. [Issue の作成](#issueの作成)

## 行動規範

### 私たちの約束

包括的で歓迎される環境を作るため、コントリビューター及びメンテナーとして、
年齢、体型、障碍、民族性、性別、経験レベル、国籍、外見、人種、宗教、
性的同一性、性的指向に関わらず、全ての人にとってハラスメントのない
参加を約束します。

### 期待される行動

- 他者を尊重し、歓迎的で包括的な言葉を使う
- 異なる視点や経験を尊重する
- 建設的な批判を受け入れる
- コミュニティにとって最善なことに焦点を当てる
- 他のコミュニティメンバーに共感を示す

### 許容されない行動

- 性的な言葉や画像の使用、望まれない性的関心
- トローリング、侮辱的・軽蔑的なコメント、個人攻撃または政治的攻撃
- 公的または私的なハラスメント
- 他者の個人情報（住所、メールアドレス等）の許可なき公開
- 職業的な場において不適切と考えられるその他の行為

## はじめ方

### 必要な準備

1. **GitHubアカウント**: [github.com](https://github.com)で作成
2. **開発環境**: 
   - Node.js 18.x以上
   - Git
   - テキストエディタ（VSCode推奨）

### リポジトリのセットアップ

```bash
# 1. リポジトリをフォーク
# GitHubのWebUI上で「Fork」ボタンをクリック

# 2. フォークしたリポジトリをクローン
git clone https://github.com/YOUR_USERNAME/chorecoin.git
cd chorecoin

# 3. アップストリームリポジトリを追加
git remote add upstream https://github.com/RieTamura/chorecoin.git

# 4. 依存関係をインストール
npm install

# 5. 開発サーバーを起動
npm run dev
```

## 開発プロセス

### 1. Issue の確認

貢献を始める前に、[Issues](https://github.com/RieTamura/chorecoin/issues)を確認してください。

- **good first issue**: 初心者向けのタスク
- **help wanted**: コントリビューター募集中
- **bug**: バグ報告
- **enhancement**: 新機能提案

### 2. ブランチの作成

```bash
# 最新のdevelopブランチを取得
git checkout develop
git pull upstream develop

# 新しいブランチを作成
git checkout -b feature/your-feature-name

# または
git checkout -b bugfix/issue-number-description
```

### 3. 変更を加える

- **小さく、焦点を絞った変更**を心がける
- **テスト**を書く
- **コーディング規約**に従う
- **コメント**を適切に追加

### 4. テストの実行

```bash
# 全テスト実行
npm test

# リンター実行
npm run lint

# 型チェック（TypeScript）
npm run type-check

# ビルド確認
npm run build
```

### 5. コミット

```bash
# ステージング
git add .

# コミット（Conventional Commits形式）
git commit -m "feat: お手伝い作成機能を追加"
```

### 6. プッシュ

```bash
git push origin feature/your-feature-name
```

## プルリクエストの作成

### PR作成前チェックリスト

- [ ] コードをセルフレビューした
- [ ] テストが全て成功する
- [ ] リンターエラーがない
- [ ] ビルドが成功する
- [ ] コミットメッセージが規約に準拠
- [ ] ドキュメントを更新した（必要な場合）

### PRの説明

```markdown
## 概要
このPRの目的を簡潔に説明

## 変更内容
- お手伝い作成APIエンドポイントを追加
- バリデーション機能を実装
- ユニットテストを追加

## 関連Issue
Closes #42

## スクリーンショット
（UI変更がある場合）

## テスト方法
1. サーバーを起動: `npm run dev`
2. `/chores/new` にアクセス
3. フォームに入力して送信
4. 新しいお手伝いが作成されることを確認

## チェックリスト
- [x] コードをセルフレビューした
- [x] テストが全て成功する
- [x] リンターエラーがない
- [x] ドキュメントを更新した
```

### レビュープロセス

1. **自動チェック**: CI/CDが自動実行
2. **コードレビュー**: メンテナーがレビュー
3. **修正**: フィードバックに基づき修正
4. **承認**: レビュアーが承認
5. **マージ**: メンテナーがマージ

## コーディング規約

詳細は [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md) を参照してください。

### 要点

- **TypeScript**: 型安全性を重視
- **ESLint**: リンターに従う
- **Prettier**: コードフォーマッターを使用
- **命名規則**: 
  - 変数・関数: camelCase
  - クラス・コンポーネント: PascalCase
  - 定数: UPPER_SNAKE_CASE

## コミットメッセージ

### Conventional Commits形式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### タイプ

- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメント
- **style**: フォーマット
- **refactor**: リファクタリング
- **test**: テスト
- **chore**: その他

### 例

```bash
feat(chore): お手伝い作成機能を追加

- タイトル、説明、報酬コインを設定可能
- バリデーション機能を実装
- APIエンドポイントを追加

Closes #42
```

## Issue の作成

### バグ報告

```markdown
**バグの説明**
何が起こっているか簡潔に説明

**再現手順**
1. '...'に移動
2. '....'をクリック
3. ページを下にスクロール
4. エラーを確認

**期待される動作**
何が起こるべきだったか

**スクリーンショット**
（該当する場合）

**環境**
- OS: [例: iOS, Windows]
- ブラウザ: [例: Chrome, Safari]
- バージョン: [例: 22]

**追加情報**
その他の関連情報
```

### 機能リクエスト

```markdown
**機能の説明**
追加したい機能を明確に説明

**問題の説明**
この機能がどの問題を解決するか

**代替案**
検討した代替ソリューション

**追加情報**
その他の関連情報、スクリーンショット等
```

## テスト

### テストの書き方

```typescript
describe('ChoreService', () => {
  describe('createChore', () => {
    it('should create a new chore with valid data', async () => {
      // Arrange
      const choreData = {
        title: 'お皿洗い',
        coinReward: 10,
      };

      // Act
      const result = await choreService.createChore(choreData);

      // Assert
      expect(result).toMatchObject({
        title: choreData.title,
        coinReward: choreData.coinReward,
      });
    });
  });
});
```

## ドキュメント

コードだけでなく、ドキュメントの改善も歓迎します！

- README.md の改善
- APIドキュメントの追加
- チュートリアルの作成
- 翻訳の追加

## 質問がある場合

- **一般的な質問**: [Discussions](https://github.com/RieTamura/chorecoin/discussions)
- **バグ報告**: [Issues](https://github.com/RieTamura/chorecoin/issues)
- **機能提案**: [Issues](https://github.com/RieTamura/chorecoin/issues)

## ライセンス

このプロジェクトに貢献することで、あなたのコントリビューションが
プロジェクトと同じライセンス（MITライセンス）の下でライセンスされることに
同意したものとみなされます。

## 謝辞

あなたの時間とコントリビューションに感謝します！
コミュニティの皆様がChoreCoinをより良いものにしています。 🙏

---

ハッピーコーディング！ 🚀
