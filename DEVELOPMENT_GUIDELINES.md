# ChoreCoin 開発ガイドライン

## はじめに

このドキュメントは、ChoreCoinプロジェクトの開発者向けガイドラインです。
コードの品質、一貫性、保守性を保つために、これらのガイドラインに従ってください。

## 目次
1. [コーディング規約](#コーディング規約)
2. [Git ワークフロー](#gitワークフロー)
3. [ブランチ戦略](#ブランチ戦略)
4. [コミットメッセージ](#コミットメッセージ)
5. [プルリクエスト](#プルリクエスト)
6. [開発環境セットアップ](#開発環境セットアップ)
7. [テスト](#テスト)

## コーディング規約

### 全般

#### 命名規則
- **変数・関数**: camelCase
  ```javascript
  const userName = 'John';
  function calculateTotalCoins() { }
  ```

- **クラス・コンポーネント**: PascalCase
  ```javascript
  class ChoreManager { }
  const UserProfile = () => { };
  ```

- **定数**: UPPER_SNAKE_CASE
  ```javascript
  const MAX_COIN_REWARD = 100;
  const API_BASE_URL = 'https://api.chorecoin.com';
  ```

- **ファイル名**: 
  - コンポーネント: PascalCase.tsx (例: UserProfile.tsx)
  - ユーティリティ: camelCase.ts (例: dateUtils.ts)
  - テスト: *.test.ts または *.spec.ts

#### コメント
```javascript
// 良い例: 複雑なロジックの説明
// ユーザーのコイン残高を計算
// 完了したお手伝いの報酬 - 交換した報酬のコスト
const balance = earnedCoins - spentCoins;

// 悪い例: 自明なコメント
// 変数に値を代入
const x = 5;
```

#### 関数設計
```javascript
// 良い例: 単一責任
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sendEmail(to, subject, body) {
  // メール送信ロジック
}

// 悪い例: 複数の責任
function validateAndSendEmail(email, subject, body) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email');
  }
  // メール送信ロジック
}
```

### TypeScript

#### 型定義
```typescript
// 良い例: 明示的な型定義
interface User {
  id: string;
  email: string;
  role: 'parent' | 'child';
  createdAt: Date;
}

function getUser(id: string): Promise<User> {
  // 実装
}

// 型の再利用
type UserId = string;
type UserRole = 'parent' | 'child';

// 悪い例: any型の使用
function processData(data: any): any {
  // 型安全性が失われる
}
```

#### 列挙型
```typescript
// 良い例
enum ChoreStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
}

// または
const ChoreStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  VERIFIED: 'verified',
} as const;

type ChoreStatusType = typeof ChoreStatus[keyof typeof ChoreStatus];
```

### React

#### コンポーネント設計
```typescript
// 良い例: 関数コンポーネント + TypeScript
interface ChoreCardProps {
  chore: Chore;
  onComplete: (choreId: string) => void;
  isLoading?: boolean;
}

export const ChoreCard: React.FC<ChoreCardProps> = ({ 
  chore, 
  onComplete, 
  isLoading = false 
}) => {
  return (
    <div className="chore-card">
      <h3>{chore.title}</h3>
      <p>{chore.description}</p>
      <button 
        onClick={() => onComplete(chore.id)}
        disabled={isLoading}
      >
        完了
      </button>
    </div>
  );
};
```

#### Hooks
```typescript
// カスタムフックの作成
function useChoreList(familyId: string) {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchChores = async () => {
      try {
        setLoading(true);
        const data = await api.getChores(familyId);
        setChores(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchChores();
  }, [familyId]);

  return { chores, loading, error };
}
```

#### パフォーマンス最適化
```typescript
// メモ化の活用
const MemoizedComponent = React.memo(ExpensiveComponent);

// useMemo
const expensiveCalculation = useMemo(() => {
  return chores.reduce((sum, chore) => sum + chore.coinReward, 0);
}, [chores]);

// useCallback
const handleComplete = useCallback((choreId: string) => {
  completeChore(choreId);
}, [completeChore]);
```

### バックエンド（Node.js/Express）

#### エラーハンドリング
```typescript
// カスタムエラークラス
class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// エラーハンドリングミドルウェア
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = (err as any).statusCode || 500;
  
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});
```

#### 非同期処理
```typescript
// async/awaitの使用
async function getChoreById(id: string): Promise<Chore> {
  try {
    const chore = await db.chore.findUnique({ where: { id } });
    if (!chore) {
      throw new NotFoundError(`Chore with id ${id} not found`);
    }
    return chore;
  } catch (error) {
    logger.error('Error fetching chore:', error);
    throw error;
  }
}

// Promise.allの活用（並列処理）
async function getUserData(userId: string) {
  const [user, chores, rewards] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.chore.findMany({ where: { userId } }),
    db.reward.findMany({ where: { userId } }),
  ]);
  
  return { user, chores, rewards };
}
```

## Git ワークフロー

### ブランチ戦略

```
main
├── develop
│   ├── feature/add-chore-creation
│   ├── feature/implement-coin-system
│   └── bugfix/fix-login-validation
├── release/v1.0.0
└── hotfix/critical-security-patch
```

#### ブランチタイプ
- **main**: 本番環境のコード
- **develop**: 開発中の統合ブランチ
- **feature/**: 新機能開発
- **bugfix/**: バグ修正
- **hotfix/**: 本番環境の緊急修正
- **release/**: リリース準備

### ブランチ命名規則
```bash
feature/short-description
bugfix/issue-123-description
hotfix/critical-issue
release/v1.2.0
```

## コミットメッセージ

### Conventional Commits形式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### タイプ
- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメント変更
- **style**: フォーマット、セミコロン等（機能変更なし）
- **refactor**: リファクタリング
- **test**: テスト追加・修正
- **chore**: ビルドプロセス、補助ツール等
- **perf**: パフォーマンス改善

#### 例
```bash
feat(chore): お手伝い作成機能を追加

- お手伝いタイトル、説明、報酬コインを設定可能
- バリデーション機能を実装
- APIエンドポイント POST /api/v1/chores を追加

Closes #42
```

```bash
fix(auth): ログイン時のセッション期限切れを修正

ユーザーがログインしたままでもセッションが
24時間後に期限切れになる問題を修正

Fixes #123
```

```bash
docs(readme): セットアップ手順を更新

開発環境のセットアップ手順を詳細化し、
トラブルシューティングセクションを追加
```

## プルリクエスト

### PRテンプレート

```markdown
## 概要
このPRの目的を簡潔に説明してください。

## 変更内容
- [ ] 機能A を追加
- [ ] バグB を修正
- [ ] ドキュメントを更新

## 関連Issue
Closes #123

## スクリーンショット
（UI変更がある場合）

## テスト
- [ ] ユニットテスト追加
- [ ] 統合テスト追加
- [ ] 手動テスト実施

## チェックリスト
- [ ] コードをセルフレビューした
- [ ] テストが全て成功する
- [ ] リンターエラーがない
- [ ] ドキュメントを更新した
- [ ] 破壊的変更がない（または文書化した）
```

### PR作成ルール
1. **サイズを小さく**: 200-400行以内
2. **単一の目的**: 1つのPRには1つの機能/修正
3. **説明を明確に**: 何を、なぜ、どのように
4. **レビュアーを指定**: 適切なレビュアーをアサイン
5. **ラベル付け**: priority, type等のラベル使用

## 開発環境セットアップ

### 必要なツール
- Node.js 18.x以上
- npm または yarn
- Git
- Docker & Docker Compose（推奨）
- VSCode（推奨エディタ）

### VSCode推奨拡張機能
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### ローカル開発
```bash
# リポジトリクローン
git clone https://github.com/RieTamura/chorecoin.git
cd chorecoin

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env
# .env ファイルを編集

# データベースセットアップ
npm run db:migrate

# 開発サーバー起動
npm run dev
```

## テスト

### テストの種類
1. **ユニットテスト**: 個別の関数・コンポーネント
2. **統合テスト**: 複数モジュールの連携
3. **E2Eテスト**: ユーザーフローの全体

### テスト実行
```bash
# 全テスト実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ
npm test -- --coverage

# E2Eテスト
npm run test:e2e
```

### テスト作成例
```typescript
describe('ChoreService', () => {
  describe('createChore', () => {
    it('should create a new chore with valid data', async () => {
      const choreData = {
        title: 'お皿洗い',
        description: '夕食後のお皿を洗う',
        coinReward: 10,
        familyId: 'family-123',
      };

      const result = await choreService.createChore(choreData);

      expect(result).toMatchObject({
        id: expect.any(String),
        title: choreData.title,
        coinReward: choreData.coinReward,
      });
    });

    it('should throw error when coin reward is negative', async () => {
      const choreData = {
        title: 'テスト',
        coinReward: -5,
        familyId: 'family-123',
      };

      await expect(choreService.createChore(choreData))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

## セキュリティ

### 機密情報の取り扱い
```bash
# .gitignore に追加
.env
.env.local
.env.*.local
*.key
*.pem
secrets/
```

### 環境変数の使用
```typescript
// 良い例
const apiKey = process.env.API_KEY;

// 悪い例
const apiKey = 'sk_live_abc123def456'; // ハードコード禁止
```

### 依存関係のセキュリティ
```bash
# 脆弱性チェック
npm audit

# 自動修正
npm audit fix

# 定期的な更新
npm outdated
npm update
```

## パフォーマンス

### 計測
```typescript
// パフォーマンス計測
console.time('fetchChores');
const chores = await fetchChores();
console.timeEnd('fetchChores');

// React DevToolsでレンダリング計測
```

### 最適化チェックリスト
- [ ] 画像最適化（WebP、適切なサイズ）
- [ ] コード分割（React.lazy）
- [ ] 不要な再レンダリング防止（React.memo、useMemo）
- [ ] データベースクエリ最適化（インデックス）
- [ ] キャッシュ戦略（Redis、SWR）

## まとめ

このガイドラインは、チーム全体のコード品質と生産性を向上させるためのものです。
不明点や改善提案があれば、遠慮なくチームに共有してください。

良いコードを書いて、良いプロダクトを作りましょう！🚀
