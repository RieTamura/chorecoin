import { Hono } from 'hono';
import { Env, Reward } from '../types';
import { authMiddleware } from '../middleware/auth';
import { AppError, ErrorCodes, ErrorMessages } from '../errors';

const rewards = new Hono<{ Bindings: Env }>();

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Apply auth middleware to all routes
rewards.use('/*', authMiddleware);

// Get all rewards for the authenticated user
rewards.get('/', async (c) => {
  try {
    const userId = c.get('userId');

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM rewards WHERE user_id = ? ORDER BY points ASC'
    ).bind(userId).all();

    return c.json(results || []);
  } catch (error) {
    console.error('Failed to fetch rewards:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Create a new reward
rewards.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { name, points } = body;

    // Validation
    if (!name || name.trim() === '') {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        'ご褒美の名前は必須です。'
      );
    }

    if (points === undefined || points === null) {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        'ポイントは必須です。'
      );
    }

    if (typeof points !== 'number' || points <= 0) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_INPUT,
        'ポイントは1以上の数値である必要があります。'
      );
    }

    const rewardId = generateUUID();
    
    await c.env.DB.prepare(
      'INSERT INTO rewards (id, user_id, name, points) VALUES (?, ?, ?, ?)'
    ).bind(rewardId, userId, name, points).run();

    const reward = await c.env.DB.prepare(
      'SELECT * FROM rewards WHERE id = ?'
    ).bind(rewardId).first();

    return c.json(reward, 201);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to create reward:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Update a reward
rewards.put('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const rewardId = c.req.param('id');
    const body = await c.req.json();
    const { name, points } = body;

    // Validation
    if (!name || name.trim() === '') {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        'ご褒美の名前は必須です。'
      );
    }

    if (points === undefined || points === null) {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        'ポイントは必須です。'
      );
    }

    if (typeof points !== 'number' || points <= 0) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_INPUT,
        'ポイントは1以上の数値である必要があります。'
      );
    }

    // Verify ownership
    const existingReward = await c.env.DB.prepare(
      'SELECT * FROM rewards WHERE id = ? AND user_id = ?'
    ).bind(rewardId, userId).first();

    if (!existingReward) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ご褒美が見つかりません。'
      );
    }

    await c.env.DB.prepare(
      'UPDATE rewards SET name = ?, points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, points, rewardId).run();

    const reward = await c.env.DB.prepare(
      'SELECT * FROM rewards WHERE id = ?'
    ).bind(rewardId).first();

    return c.json(reward);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to update reward:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Delete a reward
rewards.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const rewardId = c.req.param('id');

    // Verify ownership
    const existingReward = await c.env.DB.prepare(
      'SELECT * FROM rewards WHERE id = ? AND user_id = ?'
    ).bind(rewardId, userId).first();

    if (!existingReward) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ご褒美が見つかりません。'
      );
    }

    await c.env.DB.prepare(
      'DELETE FROM rewards WHERE id = ?'
    ).bind(rewardId).run();

    return c.json({ message: 'ご褒美が削除されました。' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to delete reward:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Claim a reward
rewards.post('/:id/claim', async (c) => {
  try {
    const userId = c.get('userId');
    const rewardId = c.req.param('id');

    // Get reward details
    const reward = await c.env.DB.prepare(
      'SELECT * FROM rewards WHERE id = ? AND user_id = ?'
    ).bind(rewardId, userId).first<Reward>();

    if (!reward) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'ご褒美が見つかりません。'
      );
    }

    // Calculate current points
    const result = await c.env.DB.prepare(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'earn' THEN points ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'claim' THEN points ELSE 0 END), 0) as total
      FROM history WHERE user_id = ?`
    ).bind(userId).first();

    const currentPoints = (result?.total as number) || 0;

    if (currentPoints < reward.points) {
      throw new AppError(
        400,
        ErrorCodes.INSUFFICIENT_POINTS,
        `ポイントが不足しています。現在: ${currentPoints}ポイント、必要: ${reward.points}ポイント`
      );
    }

    // Add to history
    const historyId = generateUUID();
    await c.env.DB.prepare(
      'INSERT INTO history (id, user_id, type, name, points) VALUES (?, ?, ?, ?, ?)'
    ).bind(historyId, userId, 'claim', reward.name, reward.points).run();

    // Calculate new total
    const newTotal = currentPoints - reward.points;

    return c.json({ 
      message: 'ご褒美が交換されました。',
      pointsUsed: reward.points,
      totalPoints: newTotal
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to claim reward:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

export default rewards;
