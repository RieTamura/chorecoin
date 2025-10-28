import { Hono } from 'hono';
import { Env, Chore } from '../types';
import { authMiddleware } from '../middleware/auth';
import { AppError, ErrorCodes, ErrorMessages } from '../errors';

const chores = new Hono<{ Bindings: Env }>();

// Helper function to generate UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Apply auth middleware to all routes
chores.use('/*', authMiddleware);

// Get all chores for the authenticated user
chores.get('/', async (c) => {
  try {
    const userId = c.get('userId');

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM chores WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(userId).all();

    return c.json(results || []);
  } catch (error) {
    console.error('Failed to fetch chores:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Create a new chore
chores.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { name, points, recurring } = body;

    // Validation
    if (!name || name.trim() === '') {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        'お手伝いの名前は必須です。'
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

    const choreId = generateUUID();
    
    await c.env.DB.prepare(
      'INSERT INTO chores (id, user_id, name, points, recurring) VALUES (?, ?, ?, ?, ?)'
    ).bind(choreId, userId, name, points, recurring ? 1 : 0).run();

    const chore = await c.env.DB.prepare(
      'SELECT * FROM chores WHERE id = ?'
    ).bind(choreId).first();

    return c.json(chore, 201);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to create chore:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Update a chore
chores.put('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const choreId = c.req.param('id');
    const body = await c.req.json();
    const { name, points, recurring } = body;

    // Validation
    if (!name || name.trim() === '') {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        'お手伝いの名前は必須です。'
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
    const existingChore = await c.env.DB.prepare(
      'SELECT * FROM chores WHERE id = ? AND user_id = ?'
    ).bind(choreId, userId).first();

    if (!existingChore) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'お手伝いが見つかりません。'
      );
    }

    await c.env.DB.prepare(
      'UPDATE chores SET name = ?, points = ?, recurring = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, points, recurring ? 1 : 0, choreId).run();

    const chore = await c.env.DB.prepare(
      'SELECT * FROM chores WHERE id = ?'
    ).bind(choreId).first();

    return c.json(chore);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to update chore:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Delete a chore
chores.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const choreId = c.req.param('id');

    // Verify ownership
    const existingChore = await c.env.DB.prepare(
      'SELECT * FROM chores WHERE id = ? AND user_id = ?'
    ).bind(choreId, userId).first();

    if (!existingChore) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'お手伝いが見つかりません。'
      );
    }

    await c.env.DB.prepare(
      'DELETE FROM chores WHERE id = ?'
    ).bind(choreId).run();

    return c.json({ message: 'お手伝いが削除されました。' });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to delete chore:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

// Complete a chore
chores.post('/:id/complete', async (c) => {
  try {
    const userId = c.get('userId');
    const choreId = c.req.param('id');

    // Get chore details
    const chore = await c.env.DB.prepare(
      'SELECT * FROM chores WHERE id = ? AND user_id = ?'
    ).bind(choreId, userId).first<Chore>();

    if (!chore) {
      throw new AppError(
        404,
        ErrorCodes.NOT_FOUND,
        'お手伝いが見つかりません。'
      );
    }

    // Use batch for atomic operations
    const historyId = generateUUID();
    const statements = [
      c.env.DB.prepare(
        'INSERT INTO history (id, user_id, type, name, points) VALUES (?, ?, ?, ?, ?)'
      ).bind(historyId, userId, 'earn', chore.name, chore.points)
    ];

    if (chore.recurring === 0) {
      statements.push(
        c.env.DB.prepare('DELETE FROM chores WHERE id = ?').bind(choreId)
      );
    }

    await c.env.DB.batch(statements);

    // Calculate total points after batch completes
    const totalPoints = await c.env.DB.prepare(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'earn' THEN points ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'claim' THEN points ELSE 0 END), 0) as total
      FROM history WHERE user_id = ?`
    ).bind(userId).first();

    return c.json({ 
      message: 'お手伝いが完了しました。',
      pointsEarned: chore.points,
      totalPoints: totalPoints?.total || 0
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Failed to complete chore:', error);
    throw new AppError(
      500,
      ErrorCodes.DATABASE_ERROR,
      ErrorMessages[ErrorCodes.DATABASE_ERROR]
    );
  }
});

export default chores;
