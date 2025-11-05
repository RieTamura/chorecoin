import { Hono } from 'hono';
import { Env, User } from '../types';
import { authMiddleware } from '../middleware/auth';
import { AppError, ErrorCodes, ErrorMessages } from '../errors';
import { hashPasscode, verifyPasscode } from '../utils/passcode';
import { mapDbUserToResponse } from '../utils/user';

const users = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
users.use('/*', authMiddleware);

// Get current user info
users.get('/me', async (c) => {
  try {
    const userId = c.get('userId');

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, created_at, updated_at, parent_passcode_hash FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!user) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ユーザーが見つかりません。'
      );
    }

    return c.json(mapDbUserToResponse(user));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to fetch user:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Update user type (parent/child)
users.patch('/me', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { userType, passcode } = body as { userType?: string; passcode?: string };

    if (!userType) {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        'userType は必須です。'
      );
    }

    if (!['parent', 'child'].includes(userType)) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_INPUT,
        'userType は「parent」または「child」である必要があります。'
      );
    }

    const existingUser = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, created_at, updated_at, parent_passcode_hash FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!existingUser) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ユーザーが見つかりません。'
      );
    }

    if (userType === 'parent') {
      if (!existingUser.parent_passcode_hash) {
        throw new AppError(
          400,
          ErrorCodes.INVALID_OPERATION,
          '親パスコードが設定されていません。まずパスコードを設定してください。'
        );
      }

      if (!passcode) {
        throw new AppError(
          400,
          ErrorCodes.MISSING_FIELD,
          '親パスコードを入力してください。'
        );
      }

      const isValid = await verifyPasscode(passcode, existingUser.parent_passcode_hash);
      if (!isValid) {
        throw new AppError(
          403,
          ErrorCodes.FORBIDDEN,
          '親パスコードが正しくありません。'
        );
      }
    }

    await c.env.DB.prepare(
      'UPDATE users SET user_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(userType, userId).run();

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, created_at, updated_at, parent_passcode_hash FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!user) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ユーザーが見つかりません。'
      );
    }

    return c.json(mapDbUserToResponse(user));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to update user:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Set or update parent passcode
users.post('/passcode', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { passcode, currentPasscode } = body as { passcode?: string; currentPasscode?: string };

    if (!passcode || typeof passcode !== 'string') {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        '新しい親パスコードを入力してください。'
      );
    }

    if (passcode.length < 4) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_INPUT,
        '親パスコードは4文字以上で入力してください。'
      );
    }

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, created_at, updated_at, parent_passcode_hash FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!user) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ユーザーが見つかりません。'
      );
    }

    if (user.parent_passcode_hash) {
      if (!currentPasscode) {
        throw new AppError(
          400,
          ErrorCodes.MISSING_FIELD,
          '現在の親パスコードを入力してください。'
        );
      }

      const isValid = await verifyPasscode(currentPasscode, user.parent_passcode_hash);
      if (!isValid) {
        throw new AppError(
          403,
          ErrorCodes.FORBIDDEN,
          '現在の親パスコードが正しくありません。'
        );
      }
    }

    const hashed = await hashPasscode(passcode);

    await c.env.DB.prepare(
      'UPDATE users SET parent_passcode_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(hashed, userId).run();

    const updatedUser = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, created_at, updated_at, parent_passcode_hash FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!updatedUser) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ユーザーが見つかりません。'
      );
    }

    return c.json(mapDbUserToResponse(updatedUser));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to set parent passcode:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

export default users;
