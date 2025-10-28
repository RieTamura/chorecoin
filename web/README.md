# Webアプリケーション - Chore Coin

React+TypeScript+Vitで構築したWebアプリケーション。

## セットアップ

```bash
cd web
npm install
npm run dev
```

## スクリプト

- `npm run dev` - 開発サーバーを起動（ポート5173）
- `npm run build` - 本番用ビルド
- `npm run preview` - ビルド結果のプレビュー
- `npm run type-check` - TypeScriptの型チェック
- `npm run lint` - ESLintによるリント

## プロジェクト構造

```text
src/
├── components/     # 再利用可能なコンポーネント
├── pages/          # ページコンポーネント
├── contexts/       # React Context
├── services/       # APIサービス
├── hooks/          # カスタムフック
├── types/          # TypeScript型定義
├── utils/          # ユーティリティ関数
├── test/           # テスト設定
├── App.tsx         # ルートコンポーネント
├── main.tsx        # エントリーポイント
└── index.css       # グローバルスタイル
```

## 開発ガイドライン

- バックエンドAPIは`http://localhost:8787/api`で利用可能（Viteプロキシで自動フォワード）
- TypeScriptのstrictモードを有効に
- コンポーネントテストはReact Testing Libraryを使用
- 環境変数は`.env`ファイルに設定

## 環境変数

```bash
VITE_API_URL=http://localhost:8787
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
