# Web アプリケーション - Chore Coin

React + TypeScript + Vite で構築した Web アプリケーション。

## セットアップ

```bash
cd web
npm install
npm run dev
```

## スクリプト

- `npm run dev` - 開発サーバーを起動（ポート 5173）
- `npm run build` - 本番用ビルド
- `npm run preview` - ビルド結果のプレビュー
- `npm run type-check` - TypeScript の型チェック
- `npm run lint` - ESLint によるリント

## プロジェクト構造

```
src/
├── components/     # 再利用可能なコンポーネント
├── pages/          # ページコンポーネント
├── contexts/       # React Context
├── services/       # API サービス
├── hooks/          # カスタムフック
├── types/          # TypeScript 型定義
├── utils/          # ユーティリティ関数
├── test/           # テスト設定
├── App.tsx         # ルートコンポーネント
├── main.tsx        # エントリーポイント
└── index.css       # グローバルスタイル
```

## 開発ガイドライン

- バックエンド API は `http://localhost:8787/api` で利用可能（Vite プロキシで自動フォワード）
- TypeScript の strict モードを有効に
- コンポーネントテストは React Testing Library を使用
- 環境変数は `.env` ファイルに設定

## 環境変数

```
VITE_API_URL=http://localhost:8787
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```
