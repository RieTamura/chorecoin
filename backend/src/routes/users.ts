import { Hono } from 'hono';
import { Env, User } from '../types';
import { authMiddleware } from '../middleware/auth';
import { AppError, ErrorCodes, ErrorMessages } from '../errors';

const users = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
users.use('/*', authMiddleware);

// Get current user info
users.get('/me', async (c) => {
  try {
    const userId = c.get('userId');

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, created_at FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!user) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ユーザーが見つかりません。'
      );
    }

    return c.json(user);
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
    const { userType } = body;

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

    await c.env.DB.prepare(
      'UPDATE users SET user_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(userType, userId).run();

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, created_at FROM users WHERE id = ?'
    ).bind(userId).first<User>();

    if (!user) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ユーザーが見つかりません。'
      );
    }

    return c.json(user);
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

export default users;
