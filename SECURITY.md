# セキュリティポリシー

## サポートされているバージョン

現在、以下のバージョンに対してセキュリティアップデートを提供しています。

| バージョン | サポート状況 |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 脆弱性の報告

ChoreCoinのセキュリティ問題を発見した場合は、以下の手順で報告してください。

### 報告方法

**公開のIssueとして報告しないでください。**

セキュリティ脆弱性を発見した場合は、以下のいずれかの方法で報告してください：

1. **GitHub Security Advisories（推奨）**
   - リポジトリの「Security」タブから「Report a vulnerability」を選択
   - プライベートな報告が可能です

2. **メール**
   - security@chorecoin.example.com（仮）まで送信
   - 件名に [SECURITY] を含めてください

### 報告に含めるべき情報

脆弱性を迅速に対処するため、以下の情報を提供してください：

- **脆弱性の種類**（例：SQLインジェクション、XSS、認証バイパス）
- **影響範囲**（影響を受けるファイル、コンポーネント）
- **再現手順**（可能な限り詳細に）
- **悪用例**（概念実証コード、ただし実際の攻撃はしないでください）
- **影響度の評価**（CVSSスコアなど）
- **推奨される修正方法**（もしあれば）

### レスポンスタイムライン

- **初回応答**: 48時間以内
- **初期評価**: 7日以内
- **修正計画**: 14日以内（重大度に応じて）
- **パッチリリース**: 30日以内（重大度に応じて）

## セキュリティ更新の通知

セキュリティ更新は以下の方法で通知されます：

1. GitHub Security Advisories
2. リリースノート
3. READMEの更新情報

## セキュリティベストプラクティス

### 開発者向け

#### 認証・認可
- パスワードは必ずbcryptまたはArgon2でハッシュ化
- JWT トークンには短い有効期限を設定（1時間推奨）
- リフレッシュトークンの使用
- 多要素認証（MFA）の実装を検討

#### データ保護
- ユーザー入力は必ず検証・サニタイズ
- SQLインジェクション対策（ORMの使用、パラメータ化クエリ）
- XSS対策（出力エスケープ、CSP設定）
- CSRF対策（トークン使用）

#### API セキュリティ
- HTTPS必須
- レート制限の実装
- 適切なCORS設定
- APIキーの適切な管理

#### 依存関係管理
```bash
# 定期的な脆弱性チェック
npm audit

# 自動セキュリティアップデート（Dependabot）
# .github/dependabot.yml で設定
```

#### 機密情報管理
- 環境変数で管理（`.env`ファイル）
- `.gitignore`に機密ファイルを追加
- シークレットスキャンの有効化

### ユーザー向け

#### アカウントセキュリティ
- 強固なパスワードの使用（12文字以上、英数字記号混在）
- 同じパスワードの使い回しを避ける
- 定期的なパスワード変更
- 多要素認証の有効化（実装時）

#### データプライバシー
- 個人情報の最小化
- 不要になったアカウントの削除
- プライバシー設定の確認

## セキュリティチェックリスト

### コードレビュー時
- [ ] ユーザー入力の検証がされているか
- [ ] SQLインジェクション対策がされているか
- [ ] XSS対策がされているか
- [ ] 認証・認可チェックが適切か
- [ ] 機密情報がハードコードされていないか
- [ ] エラーメッセージに機密情報が含まれていないか
- [ ] ログに機密情報が出力されていないか

### デプロイ前
- [ ] 環境変数が正しく設定されているか
- [ ] HTTPSが有効化されているか
- [ ] セキュリティヘッダーが設定されているか
- [ ] 依存関係の脆弱性がないか（`npm audit`）
- [ ] 不要なデバッグコードが削除されているか
- [ ] エラーハンドリングが適切か

## 既知の脅威と対策

### SQLインジェクション
**対策**: ORMの使用、パラメータ化クエリ
```typescript
// 良い例（Prisma使用）
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// 悪い例（生のSQL）
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### XSS（クロスサイトスクリプティング）
**対策**: 適切なエスケープ、CSP設定
```typescript
// React は自動的にエスケープ
<div>{userInput}</div>

// dangerouslySetInnerHTML は避ける
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // 危険
```

### CSRF（クロスサイトリクエストフォージェリ）
**対策**: CSRFトークンの使用
```typescript
// Express + csurf
const csrf = require('csurf');
app.use(csrf({ cookie: true }));
```

### 認証バイパス
**対策**: 適切な権限チェック
```typescript
// ミドルウェアで認証チェック
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ルートに適用
app.get('/api/chores', requireAuth, getChores);
```

## セキュリティツール

### 推奨ツール
- **npm audit**: 依存関係の脆弱性チェック
- **Snyk**: セキュリティ脆弱性の継続的監視
- **ESLint Security Plugin**: コード静的解析
- **OWASP ZAP**: Webアプリケーション脆弱性スキャナ
- **SonarQube**: コード品質・セキュリティ分析

### GitHub Actions統合
```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run npm audit
        run: npm audit --audit-level=high
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

## インシデント対応

### インシデント発生時の手順

1. **検出と確認**
   - 脆弱性の影響範囲を特定
   - 攻撃の兆候を確認

2. **封じ込め**
   - 該当機能の一時停止（必要に応じて）
   - アクセス制限

3. **調査**
   - ログの分析
   - 影響を受けたユーザーの特定

4. **修正**
   - パッチ開発
   - セキュリティテスト

5. **復旧**
   - パッチデプロイ
   - サービス再開

6. **事後対応**
   - ユーザーへの通知
   - インシデントレポート作成
   - 再発防止策の実施

## コンプライアンス

### GDPR（一般データ保護規則）
- ユーザーデータの削除要求に対応
- データポータビリティの提供
- プライバシーポリシーの明示
- 保護者の同意取得（子供のデータ）

### 個人情報保護法（日本）
- 個人情報の適切な管理
- 第三者提供の制限
- セキュリティ対策の実施

## 参考リソース

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## 連絡先

セキュリティに関する質問や懸念がある場合：
- Email: security@chorecoin.example.com（仮）
- GitHub Security Advisory

---

最終更新: 2025年10月28日
