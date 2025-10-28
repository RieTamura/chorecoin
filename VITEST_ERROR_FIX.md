# Vitestエラー修正ガイド

## エラー内容

```plaintext
モジュール 'vitest' またはそれに対応する型宣言が見つかりません。
```

## 原因

Vitestパッケージと型定義がインストールされていないか、`package.json`に正しく記載されていません。

## 解決方法

### ステップ1: バックエンドの依存関係をインストール

```bash
cd backend
npm install
```

このコマンドで以下のパッケージがインストールされます：

- `vitest`: テストフレームワーク
- `@vitest/ui`: テストUI
- `@vitest/coverage-v8`: カバレッジ
- `@vitest/expect`: テストアサーション（期待値チェック）

### ステップ2: フロントエンドの依存関係もインストール

```bash
cd web
npm install
```

### ステップ3: キャッシュをクリア

VS Code側でキャッシュをクリアします：

```bash
# バックエンド
cd backend
npm run type-check

# フロントエンド
cd web
npm run type-check
```

またはVS Codeを再起動してください。

### ステップ4: テスト実行確認

```bash
# バックエンド
cd backend
npm run test

# フロントエンド
cd web
npm run test
```

## package.json の確認

### バックエンド (backend/package.json)

```json
{
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240117.0",
    "@types/node": "^20.10.0",
    "@vitest/ui": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0",
    "@vitest/expect": "^1.1.0",
    "wrangler": "^4.0.0",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0"
  }
}
```

### フロントエンド (web/package.json)

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/coverage-v8": "^1.1.0",
    "@vitest/ui": "^1.0.4",
    "jsdom": "^23.0.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vitest": "^1.0.4"
  }
}
```

## トラブルシューティング

### 問題: npm install後もエラーが続く

**解決策:**

```bash
# node_modules をクリア
rm -r node_modules package-lock.json

# 再インストール
npm install

# VS Code を再起動
```

### 問題: TypeScript サーバーがエラーを表示

**解決策:**

1. VS Codeのコマンドパレットを開く（Ctrl+Shift+P）
2. `TypeScript: Restart TS Server` を実行

### 問題: テスト実行時に「モジュールが見つからない」

**解決策:**

```bash
npm run type-check
```

で詳細なエラーを確認してください。

## インストール完了の確認

### バックエンド

```bash
cd backend
npm run test -- --version
```

出力例：

```plaintext
vitest 1.1.0
```

### フロントエンド

```bash
cd web
npm run test -- --version
```

出力例：

```plaintext
vitest 1.0.4
```

## 参考リソース

- [Vitest 公式ドキュメント](https://vitest.dev/)
- [npm install ガイド](https://docs.npmjs.com/cli/v10/commands/npm-install)

---

**最終更新**: 2025年10月28日
