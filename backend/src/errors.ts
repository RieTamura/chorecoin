/**
 * カスタムエラークラスとエラーハンドリング定義
 */

export interface ApiError {
  error: string
  message: string
  statusCode: number
  code?: string
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

// エラーコードの定義
export const ErrorCodes = {
  // 認証エラー
  INVALID_TOKEN: 'INVALID_TOKEN',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  MISSING_TOKEN: 'MISSING_TOKEN',

  // バリデーションエラー
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',

  // リソースエラー
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',

  // ビジネスロジックエラー
  INSUFFICIENT_POINTS: 'INSUFFICIENT_POINTS',
  INVALID_OPERATION: 'INVALID_OPERATION',

  // サーバーエラー
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
}

// エラーメッセージのマッピング
export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.INVALID_TOKEN]: '無効なトークンです。もう一度ログインしてください。',
  [ErrorCodes.EXPIRED_TOKEN]: 'トークンの有効期限が切れています。もう一度ログインしてください。',
  [ErrorCodes.UNAUTHORIZED]: '認証が必要です。ログインしてください。',
  [ErrorCodes.MISSING_TOKEN]: 'トークンがありません。ログインしてください。',

  [ErrorCodes.INVALID_INPUT]: '入力値が無効です。',
  [ErrorCodes.MISSING_FIELD]: '必須フィールドが不足しています。',
  [ErrorCodes.INVALID_EMAIL]: 'メールアドレスが無効です。',

  [ErrorCodes.NOT_FOUND]: 'リソースが見つかりません。',
  [ErrorCodes.FORBIDDEN]: 'このリソースにアクセスする権限がありません。',
  [ErrorCodes.CONFLICT]: 'リソースが既に存在します。',

  [ErrorCodes.INSUFFICIENT_POINTS]: 'ポイントが不足しています。',
  [ErrorCodes.INVALID_OPERATION]: '無効な操作です。',

  [ErrorCodes.DATABASE_ERROR]: 'データベースエラーが発生しました。',
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'サーバーエラーが発生しました。',
}

// エラーをレスポンス形式に変換
export function formatErrorResponse(error: unknown): ApiError {
  if (error instanceof AppError) {
    return {
      error: error.code,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    }
  }

  if (error instanceof Error) {
    // 本番環境ではジェネリックなエラーメッセージを返す
    // 開発環境のみ実際のエラーメッセージを含める
    const isDevelopment = process.env.NODE_ENV === 'development'
    const errorMessage = isDevelopment
      ? `${ErrorMessages[ErrorCodes.INTERNAL_SERVER_ERROR]} (Details: ${error.message})`
      : ErrorMessages[ErrorCodes.INTERNAL_SERVER_ERROR]

    return {
      error: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: errorMessage,
      statusCode: 500,
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
    }
  }

  return {
    error: ErrorCodes.INTERNAL_SERVER_ERROR,
    message: ErrorMessages[ErrorCodes.INTERNAL_SERVER_ERROR],
    statusCode: 500,
    code: ErrorCodes.INTERNAL_SERVER_ERROR,
  }
}
