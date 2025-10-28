# ChoreCoin プロジェクト構造

このドキュメントでは、推奨されるプロジェクト構造を説明します。

## ディレクトリ構造（Web アプリケーション）

### オプション1: モノレポ構造（Turborepo/Nx）

```
chorecoin/
├── .github/
│   ├── workflows/           # GitHub Actions CI/CD
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── security.yml
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── apps/
│   ├── web/                # Webフロントエンド
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   │   ├── Button/
│   │   │   │   │   ├── Input/
│   │   │   │   │   └── Modal/
│   │   │   │   ├── chore/
│   │   │   │   │   ├── ChoreCard/
│   │   │   │   │   ├── ChoreList/
│   │   │   │   │   └── ChoreForm/
│   │   │   │   ├── reward/
│   │   │   │   └── user/
│   │   │   ├── pages/
│   │   │   │   ├── _app.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── chores/
│   │   │   │   ├── rewards/
│   │   │   │   └── profile/
│   │   │   ├── hooks/
│   │   │   │   ├── useChores.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useCoins.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── utils.ts
│   │   │   ├── types/
│   │   │   │   ├── chore.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── reward.ts
│   │   │   ├── styles/
│   │   │   └── config/
│   │   ├── public/
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── next.config.js
│   ├── api/                # バックエンドAPI
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   ├── choreController.ts
│   │   │   │   ├── userController.ts
│   │   │   │   └── rewardController.ts
│   │   │   ├── services/
│   │   │   │   ├── choreService.ts
│   │   │   │   ├── authService.ts
│   │   │   │   └── coinService.ts
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── Chore.ts
│   │   │   │   └── Reward.ts
│   │   │   ├── routes/
│   │   │   │   ├── index.ts
│   │   │   │   ├── choreRoutes.ts
│   │   │   │   └── authRoutes.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── crypto.ts
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   └── environment.ts
│   │   │   ├── types/
│   │   │   └── app.ts
│   │   ├── tests/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── mobile/             # モバイルアプリ（React Native/Flutter）
│   │   └── （将来追加予定）
├── packages/
│   ├── ui/                 # 共有UIコンポーネント
│   ├── config/             # 共有設定
│   ├── types/              # 共有型定義
│   └── utils/              # 共有ユーティリティ
├── docs/                   # ドキュメント
│   ├── api/
│   │   └── openapi.yaml
│   ├── architecture/
│   ├── guides/
│   └── tutorials/
├── scripts/                # ビルド・デプロイスクリプト
│   ├── setup.sh
│   └── deploy.sh
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── turbo.json             # Turborepo設定
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── ARCHITECTURE.md
└── SECURITY.md
```

### オプション2: シンプルな構造（小規模プロジェクト）

```
chorecoin/
├── client/                 # フロントエンド
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── server/                 # バックエンド
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── prisma/
│   └── package.json
├── shared/                 # 共有コード
│   └── types/
├── docs/
├── .github/
├── docker-compose.yml
└── README.md
```

## ファイル命名規則

### TypeScript/JavaScript
- **コンポーネント**: `PascalCase.tsx` (例: `ChoreCard.tsx`)
- **ユーティリティ**: `camelCase.ts` (例: `dateUtils.ts`)
- **型定義**: `camelCase.ts` または `types.ts`
- **テスト**: `*.test.ts` または `*.spec.ts`
- **設定**: `kebab-case.config.js` (例: `next.config.js`)

### CSS/スタイル
- **モジュールCSS**: `ComponentName.module.css`
- **グローバルCSS**: `global.css`
- **Tailwind**: `tailwind.config.js`

## 主要ファイルの役割

### フロントエンド

#### `src/components/`
再利用可能なUIコンポーネント
```typescript
// ChoreCard.tsx
export const ChoreCard: React.FC<ChoreCardProps> = ({ chore }) => {
  // コンポーネントロジック
};
```

#### `src/hooks/`
カスタムReact Hooks
```typescript
// useChores.ts
export function useChores(familyId: string) {
  const [chores, setChores] = useState<Chore[]>([]);
  // フックロジック
  return { chores, loading, error };
}
```

#### `src/lib/`
ユーティリティ関数とヘルパー
```typescript
// api.ts
export const api = {
  getChores: (familyId: string) => fetch(`/api/chores?family=${familyId}`),
  // その他のAPI呼び出し
};
```

### バックエンド

#### `src/controllers/`
リクエストハンドラ
```typescript
// choreController.ts
export const createChore = async (req: Request, res: Response) => {
  const chore = await choreService.create(req.body);
  res.json({ success: true, data: chore });
};
```

#### `src/services/`
ビジネスロジック
```typescript
// choreService.ts
export const choreService = {
  create: async (data: ChoreCreateDto) => {
    // ビジネスロジック
    return await db.chore.create({ data });
  },
};
```

#### `src/models/`
データモデル（Prisma使用時はスキーマ定義）
```prisma
// prisma/schema.prisma
model Chore {
  id          String   @id @default(uuid())
  title       String
  description String?
  coinReward  Int
  familyId    String
  family      Family   @relation(fields: [familyId], references: [id])
  createdAt   DateTime @default(now())
}
```

## データベーススキーマ設計

### Prisma スキーマ例

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  role          Role
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  familyMembers FamilyMember[]
  verifications ChoreCompletion[] @relation("Verifier")
}

enum Role {
  PARENT
  CHILD
}

model Family {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  
  // Relations
  members   FamilyMember[]
  chores    Chore[]
  rewards   Reward[]
}

model FamilyMember {
  id         String   @id @default(uuid())
  userId     String
  familyId   String
  role       FamilyRole
  coinBalance Int      @default(0)
  
  user       User     @relation(fields: [userId], references: [id])
  family     Family   @relation(fields: [familyId], references: [id])
  
  completions     ChoreCompletion[]
  redemptions     RewardRedemption[]
  
  @@unique([userId, familyId])
}

enum FamilyRole {
  PARENT
  CHILD
}

model Chore {
  id          String   @id @default(uuid())
  title       String
  description String?
  coinReward  Int
  status      ChoreStatus @default(ACTIVE)
  familyId    String
  createdAt   DateTime @default(now())
  
  family      Family   @relation(fields: [familyId], references: [id])
  completions ChoreCompletion[]
}

enum ChoreStatus {
  ACTIVE
  INACTIVE
}

model ChoreCompletion {
  id           String    @id @default(uuid())
  choreId      String
  childId      String
  completedAt  DateTime  @default(now())
  verifiedBy   String?
  verifiedAt   DateTime?
  coinsEarned  Int
  
  chore        Chore         @relation(fields: [choreId], references: [id])
  child        FamilyMember  @relation(fields: [childId], references: [id])
  verifier     User?         @relation("Verifier", fields: [verifiedBy], references: [id])
}

model Reward {
  id          String   @id @default(uuid())
  title       String
  description String?
  coinCost    Int
  status      RewardStatus @default(ACTIVE)
  familyId    String
  createdAt   DateTime @default(now())
  
  family      Family   @relation(fields: [familyId], references: [id])
  redemptions RewardRedemption[]
}

enum RewardStatus {
  ACTIVE
  INACTIVE
}

model RewardRedemption {
  id          String    @id @default(uuid())
  rewardId    String
  childId     String
  coinsSpent  Int
  redeemedAt  DateTime  @default(now())
  fulfilledAt DateTime?
  
  reward      Reward       @relation(fields: [rewardId], references: [id])
  child       FamilyMember @relation(fields: [childId], references: [id])
}
```

## API エンドポイント設計

### RESTful API 構造

```
/api/v1
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   └── POST   /refresh
├── /families
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   ├── DELETE /:id
│   ├── GET    /:id/members
│   └── POST   /:id/members
├── /chores
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   ├── DELETE /:id
│   └── POST   /:id/complete
├── /rewards
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PUT    /:id
│   ├── DELETE /:id
│   └── POST   /:id/redeem
└── /users
    ├── GET    /me
    ├── PUT    /me
    └── GET    /me/history
```

## テスト構造

```
tests/
├── unit/
│   ├── services/
│   │   ├── choreService.test.ts
│   │   └── authService.test.ts
│   ├── utils/
│   └── validators/
├── integration/
│   ├── api/
│   │   ├── chores.test.ts
│   │   └── auth.test.ts
│   └── database/
└── e2e/
    ├── chore-flow.spec.ts
    └── reward-flow.spec.ts
```

## モバイルアプリ構造（React Native の場合）

```
mobile/
├── src/
│   ├── components/
│   ├── screens/
│   │   ├── Home/
│   │   ├── Chores/
│   │   ├── Rewards/
│   │   └── Profile/
│   ├── navigation/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── android/
├── ios/
├── __tests__/
└── package.json
```

## まとめ

この構造は推奨事項です。プロジェクトの規模や要件に応じて、
適切にカスタマイズしてください。重要なのは：

1. **明確な責任分離**: コンポーネント、サービス、ユーティリティを分離
2. **スケーラビリティ**: プロジェクトの成長に対応できる構造
3. **保守性**: 新しいメンバーが理解しやすい構造
4. **一貫性**: 命名規則とパターンの統一
