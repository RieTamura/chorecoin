# テスト環境構築ガイド

## 概要

このプロジェクトでは、バックエンドとフロントエンドの両方に包括的なテストスイートを実装しています。

## バックエンドテスト環境

### セットアップ（バックエンド）

```bash
cd backend
npm install
```

### テストスクリプト（バックエンド）

```bash
# テスト実行
npm run test

# UIモード（ブラウザで結果表示）
npm run test:ui

# カバレッジレポート
npm run test:coverage

# 型チェック
npm run type-check
```

### テストフレームワーク（バックエンド）

- **Vitest**: ユニットテスト・統合テスト
- **Node環境**: バックエンド用テスト実行環境

### テスト対象

- エラーハンドリング (`errors.test.ts`)
- APIエンドポイント (`endpoints.test.ts`)
- ビジネスロジック

### テストの位置（バックエンド）

```text
backend/src/__tests__/
├── errors.test.ts         # エラーコード・メッセージの検証
└── endpoints.test.ts      # APIエンドポイント定義の検証
```

## フロントエンドテスト環境

### セットアップ（フロントエンド）

```bash
cd web
npm install
```

### テストスクリプト（フロントエンド）

```bash
# テスト実行
npm run test

# UIモード
npm run test:ui

# カバレッジレポート
npm run test:coverage

# 型チェック
npm run type-check
```

### テストフレームワーク（フロントエンド）

- **Vitest**: ユニットテスト・コンポーネントテスト
- **React Testing Library**: UIコンポーネントテスト
- **jsdom**: ブラウザ環境のシミュレーション

### テスト対象（フロントエンド）

- Reactコンポーネント (`.test.tsx`)
- ビジネスロジック (`.test.ts`)
- API呼び出し・エラーハンドリング

### テストの位置（フロントエンド）

```text
web/src/test/
├── setup.ts               # テスト全体のセットアップ
├── test-utils.tsx         # テストユーティリティ関数
├── App.test.tsx           # Appコンポーネント
├── AuthContext.test.ts    # 認証ロジック
├── api.test.ts            # APIサービス
└── components.test.tsx    # UIコンポーネント
```

## テスト実行例

### バックエンド

```bash
# すべてのテスト実行
npm run test

# 特定のテストファイルのみ実行
npm run test -- errors.test.ts

# ウォッチモードで実行（ファイル変更時に自動再実行）
npm run test -- --watch
```

### フロントエンド

```bash
# すべてのテスト実行
npm run test

# 特定のテストのみ実行
npm run test -- App.test.tsx

# ウォッチモード
npm run test -- --watch

# UIで結果確認
npm run test:ui
```

## テストカバレッジ

```bash
# バックエンド
cd backend
npm run test:coverage

# フロントエンド
cd web
npm run test:coverage
```

## ベストプラクティス

### テスト命名規則

- テストファイル：`*.test.ts`または`*.test.tsx`
- テスト関数：`describe()`で機能ごとに分類
- テストケース：`it()`で具体的な振る舞いを記述

### テスト構造（AAAパターン）

```typescript
it('should do something', () => {
  // Arrange: テストデータ準備
  const input = { name: 'Test' }

  // Act: 実行
  const result = processInput(input)

  // Assert: 結果確認
  expect(result).toBeDefined()
})
```

### UIテストのポイント

- ユーザーの視点でテスト（`getByRole`を使用）
- アクセシビリティを意識した記述
- `fireEvent`でユーザー操作をシミュレート

### 非同期処理のテスト

```typescript
it('should fetch data', async () => {
  const data = await fetchData()
  expect(data).toBeDefined()
})
```

## CI/CDとの統合

本番環境では、以下のコマンドを実行：

```bash
# バックエンド
cd backend && npm run type-check && npm run test

# フロントエンド
cd web && npm run type-check && npm run lint && npm run test
```

## トラブルシューティング

### モジュールが見つからないエラー

```text
Module 'vitest' or its type declaration not found
```

**解決策**：依存パッケージを再インストール

```bash
npm install
npm run test
```

### テストタイムアウト

テストが長い場合は、`vitest.config.ts`の`testTimeout`を増やす：

```typescript
test: {
  testTimeout: 30000  // 30秒
}
```

### ReactコンポーネントテストがUnsupported

jsdomを使用しているか確認：

```typescript
// vitest.config.ts
test: {
  environment: 'jsdom'
}
```

## 次のステップ

1. **テストカバレッジの向上**：全コンポーネント・ロジックのテスト実装
2. **E2Eテスト**：Playwrightなどを使用
3. **パフォーマンステスト**：Lighthouseなどの統合
4. **スナップショットテスト**：UI回帰検出

---

最終更新：2025年10月28日
