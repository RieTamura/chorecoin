# Chore Coin Frontend

Expo+React Native+TypeScriptで構築されたお手伝いポイント管理アプリのフロントエンド。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境設定

`app.json` の `extra` セクションを編集：

```json
{
  "extra": {
    "apiUrl": "http://localhost:8787",
    "googleClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
  }
}
```

### 3. 開発サーバーの起動

```bash
npm start
```

Expo Goアプリでスキャンするか、iOS/Androidシミュレータで実行できます。

## ビルド

### EAS Buildのセットアップ

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### iOS/Androidビルド

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## 画面構成

- **ログイン画面** (`index.tsx`) - Google認証
- **ホーム** (`(tabs)/home.tsx`) - やることリスト、ポイント表示
- **ご褒美** (`(tabs)/rewards.tsx`) - ご褒美一覧と交換
- **履歴** (`(tabs)/history.tsx`) - ポイント獲得・使用履歴
- **管理** (`(tabs)/manage.tsx`) - お手伝い・ご褒美の管理、ログアウト

## 技術スタック

- **Expo** - React Nativeフレームワーク
- **Expo Router** - ファイルベースルーティング
- **TypeScript** - 型安全性
- **Axios** - HTTP通信
- **AsyncStorage** - ローカルストレージ
- **Google Auth** - OAuth 2.0認証

## ディレクトリ構造

```text
frontend/
├── app/              # 画面（Expo Router）
├── components/       # 再利用可能なコンポーネント
├── contexts/         # Reactコンテキスト
├── services/         # APIサービス
├── types/            # TypeScript型定義
└── assets/           # 画像、フォント等
```

## 開発のヒント

### バックエンドへの接続

- ローカル開発時は`app.json`の`apiUrl`を`http://localhost:8787`に設定
- 本番環境ではCloudflare WorkersのURLに変更

### デバッグ

```bash
# ログの確認
npm start -- --clear

# Reactotronなどのデバッグツールの使用も可能
```

## ライセンス

MIT
