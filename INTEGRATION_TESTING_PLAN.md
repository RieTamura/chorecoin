# 統合テスト・E2Eテスト計画

## 概要

本ドキュメントは、Chore Coinアプリケーションの統合テストとエンドツーエンド(E2E)テストの実装計画を定義します。

## 1. 統合テスト戦略

### 1.1 バックエンド統合テスト

統合テストは、複数のコンポーネント（middleware、routes、database）が正しく相互作用することを検証します。

#### 対象領域（認証フロー）

```text
1. Googleトークン検証 → JWTトークン発行
2. トークン検証middleware → 保護されたルートへアクセス
3. トークン更新・リフレッシュ
```

#### 対象領域（チョア管理フロー）

```text
1. ユーザーチョア一覧取得 (認証必須)
2. 新規チョア作成 (入力検証)
3. チョア完了 (ポイント加算、履歴記録)
4. チョア削除 (親ユーザーのみ)
```

#### 対象領域（ご褒美交換フロー）

```text
1. ご褒美一覧取得
2. ご褒美交換 (ポイント検証)
3. ポイント差引
4. 交換履歴記録
```

#### テスト実装例（バックエンド統合テスト）

```typescript
// backend/src/__tests__/integration/auth-flow.test.ts
import { describe, it, expect, beforeEach } from 'vitest'

describe('認証フロー統合テスト', () => {
  describe('Google OAuth から JWT発行までの流れ', () => {
    it('Google トークンを検証して JWT を発行', async () => {
      // 1. Google ID トークンを用意
      const googleToken = 'google-id-token'
      
      // 2. バックエンドに送信
      const response = await authenticateWithGoogle(googleToken)
      
      // 3. JWT トークンが返される
      expect(response.token).toBeTruthy()
      expect(response.token).toMatch(/^eyJ/)
    })

    it('発行された JWT で保護されたエンドポイントにアクセス可能', async () => {
      const token = 'valid-jwt-token'
      const response = await getMe(token)
      
      expect(response.status).toBe(200)
      expect(response.data.id).toBeTruthy()
    })

    it('無効な JWT でアクセスが拒否される', async () => {
      const invalidToken = 'invalid-token'
      const response = await getMe(invalidToken)
      
      expect(response.status).toBe(401)
      expect(response.error).toContain('Unauthorized')
    })
  })
})
```

### 1.2 フロントエンド統合テスト

フロントエンドの統合テストは、複数のコンポーネント・Context・サービスが連携することを検証します。

#### 対象領域

**ページ遷移:**
```
ログインページ → ホームページ → ご褒美ページ
```

**状態管理:**
```
ユーザー認証状態 → チョア一覧状態 → ポイント状態
```

**API連携:**
```
APIリクエスト → レスポンス処理 → UI更新
```

#### テスト実装例

```typescript
// web/src/test/integration/chore-flow.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

describe('チョア完了フロー統合テスト', () => {
  it('チョア完了からポイント加算まで', async () => {
    // 1. ホームページをレンダリング
    render(<HomePage />)
    
    // 2. チョアを表示
    const chores = screen.getAllByRole('button', { name: /完了/ })
    expect(chores.length).toBeGreaterThan(0)
    
    // 3. チョア完了ボタンをクリック
    fireEvent.click(chores[0])
    
    // 4. ポイントが更新される
    await waitFor(() => {
      expect(screen.getByText(/ポイント/)).toHaveTextContent('125')
    })
  })
})
```

## 2. E2Eテスト戦略

### 2.1 ツール選定

- **Playwright**: クロスブラウザ対応、安定した自動化
- **代替案**: Cypress（シンプルな記述）、Puppeteer（軽量）

### 2.2 テストシナリオ

#### シナリオ 1: ユーザー登録とログイン

```
1. アプリ起動
2. ログインページ表示
3. Googleログインボタンクリック
4. Google OAuth画面で認証
5. ホームページへリダイレクト
6. ユーザー情報表示確認
```

#### シナリオ 2: チョア完了とポイント獲得

```
1. ホームページでチョア一覧表示
2. チョア「掃除」を選択
3. 「完了」ボタンクリック
4. ポイント加算確認 (100 → 125)
5. 履歴に「掃除 +25」が記録される
```

#### シナリオ 3: ご褒美交換

```
1. 「ご褒美」タブをクリック
2. ご褒美一覧表示
3. 「アイスクリーム (100P)」を選択
4. 「交換」ボタンクリック
5. ポイント減少確認 (125 → 25)
6. ご褒美交換確認ダイアログ表示
7. 確定
```

#### シナリオ 4: 親ユーザーのチョア管理

```
1. ユーザータイプを「親」に切り替え
2. 「管理」タブをクリック
3. 「チョア追加」ボタンクリック
4. チョア情報を入力
5. 「保存」ボタンクリック
6. チョア一覧に追加される
```

### 2.3 テスト実装例

```typescript
// e2e/tests/user-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('ユーザーフロー E2Eテスト', () => {
  test('ログインからチョア完了まで', async ({ page }) => {
    // 1. アプリを開く
    await page.goto('http://localhost:5173')
    
    // 2. ログインページが表示される
    expect(await page.title()).toContain('Chore Coin')
    
    // 3. Googleログインボタンをクリック
    await page.click('button:has-text("Googleでログイン")')
    
    // 4. Google認証ページで認証（テストアカウント使用）
    await page.waitForNavigation()
    
    // 5. ホームページにリダイレクト
    expect(page.url()).toContain('/home')
    
    // 6. チョア一覧が表示される
    const chores = await page.locator('li').count()
    expect(chores).toBeGreaterThan(0)
    
    // 7. 最初のチョアの完了ボタンをクリック
    await page.click('button:has-text("完了")', { force: true })
    
    // 8. ポイントが更新される
    await page.waitForSelector('text=/ポイント.*[0-9]+/')
  })
})
```

## 3. テスト実行環境構築

### 3.1 バックエンド統合テスト

```bash
cd backend

# 必要なパッケージをインストール
npm install --save-dev vitest @vitest/ui

# 統合テストを実行
npm run test -- src/__tests__/integration/

# カバレッジ付きで実行
npm run test:coverage
```

### 3.2 フロントエンド統合テスト

```bash
cd web

# 必要なパッケージをインストール
npm install --save-dev vitest @testing-library/react @testing-library/user-event

# 統合テストを実行
npm run test -- src/test/integration/

# UIで確認
npm run test:ui
```

### 3.3 E2Eテスト

```bash
cd e2e

# Playwrightをインストール
npm install -D @playwright/test

# テストを実行
npx playwright test

# UIモードで実行
npx playwright test --ui

# レポートを表示
npx playwright show-report
```

## 4. CI/CD パイプラインへの統合

### 4.1 GitHub Actions 設定例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # バックエンドテスト
      - name: Backend Tests
        run: |
          cd backend
          npm install
          npm run type-check
          npm run test
      
      # フロントエンドテスト
      - name: Frontend Tests
        run: |
          cd web
          npm install
          npm run type-check
          npm run test
      
      # E2E テスト
      - name: E2E Tests
        run: |
          cd e2e
          npm install
          npx playwright install
          npx playwright test
      
      # カバレッジレポート
      - name: Coverage Report
        run: |
          cd web
          npm run test:coverage
```

## 5. テストガイドラインとベストプラクティス

### 5.1 テスト命名規則

- ファイル：`*.integration.test.ts`、`*.spec.ts`
- テスト関数：`should + 期待される動作`

### 5.2 テストデータ管理

- テストデータを `fixtures/` に集約
- 本番データベースと分離したテスト用DB使用
- テスト終了後はデータをクリーンアップ

### 5.3 非同期テストの処理

```typescript
it('should handle async operations', async () => {
  const result = await fetchData()
  expect(result).toBeDefined()
})
```

### 5.4 モックとスタブの活用

```typescript
// API呼び出しのモック
vi.mock('../api', () => ({
  fetchChores: vi.fn(() => Promise.resolve([
    { id: '1', name: 'Chore 1' }
  ]))
}))
```

## 6. 次のステップ

1. ✅ ユニットテスト基盤整備
2. 📋 統合テストスイート構築
3. 🌐 E2Eテストツール導入（Playwright）
4. 🔄 CI/CDパイプラインへの統合
5. 📊 カバレッジ目標設定（80%以上）

---

最終更新：2025年10月28日
