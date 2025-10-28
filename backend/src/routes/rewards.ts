import { Hono } from 'hono';
import { Env, Reward } from '../types';
import { authMiddleware } from '../middleware/auth';

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
  const userId = c.get('userId');

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM rewards WHERE user_id = ? ORDER BY points ASC'
  ).bind(userId).all();

  return c.json({ rewards: results });
});

// Create a new reward
rewards.post('/', async (c) => {
  const userId = c.get('userId');
  const { name, points } = await c.req.json();

  if (!name || points === undefined) {
    return c.json({ error: 'Name and points are required' }, 400);
  }

  const rewardId = generateUUID();
  
  await c.env.DB.prepare(
    'INSERT INTO rewards (id, user_id, name, points) VALUES (?, ?, ?, ?)'
  ).bind(rewardId, userId, name, points).run();

  const reward = await c.env.DB.prepare(
    'SELECT * FROM rewards WHERE id = ?'
  ).bind(rewardId).first();

  return c.json({ reward }, 201);
});

// Update a reward
rewards.put('/:id', async (c) => {
  const userId = c.get('userId');
  const rewardId = c.req.param('id');
  const { name, points } = await c.req.json();

  // Verify ownership
  const existingReward = await c.env.DB.prepare(
    'SELECT * FROM rewards WHERE id = ? AND user_id = ?'
  ).bind(rewardId, userId).first();

  if (!existingReward) {
    return c.json({ error: 'Reward not found' }, 404);
  }

  await c.env.DB.prepare(
    'UPDATE rewards SET name = ?, points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(name, points, rewardId).run();

  const reward = await c.env.DB.prepare(
    'SELECT * FROM rewards WHERE id = ?'
  ).bind(rewardId).first();

  return c.json({ reward });
});

// Delete a reward
rewards.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const rewardId = c.req.param('id');

  // Verify ownership
  const existingReward = await c.env.DB.prepare(
    'SELECT * FROM rewards WHERE id = ? AND user_id = ?'
  ).bind(rewardId, userId).first();

  if (!existingReward) {
    return c.json({ error: 'Reward not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM rewards WHERE id = ?'
  ).bind(rewardId).run();

  return c.json({ message: 'Reward deleted successfully' });
});

// Claim a reward
rewards.post('/:id/claim', async (c) => {
  const userId = c.get('userId');
  const rewardId = c.req.param('id');

  // Get reward details
  const reward = await c.env.DB.prepare(
    'SELECT * FROM rewards WHERE id = ? AND user_id = ?'
  ).bind(rewardId, userId).first<Reward>();

  if (!reward) {
    return c.json({ error: 'Reward not found' }, 404);
  }

  // Calculate current points
  const result = await c.env.DB.prepare(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'earn' THEN points ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN type = 'claim' THEN points ELSE 0 END), 0) as total
    FROM history WHERE user_id = ?`
  ).bind(userId).first();

  const currentPoints = result?.total || 0;

  if (currentPoints < reward.points) {
    return c.json({ 
      error: 'Insufficient points',
      currentPoints,
      requiredPoints: reward.points
    }, 400);
  }

  // Add to history
  const historyId = generateUUID();
  await c.env.DB.prepare(
    'INSERT INTO history (id, user_id, type, name, points) VALUES (?, ?, ?, ?, ?)'
  ).bind(historyId, userId, 'claim', reward.name, reward.points).run();

  // Calculate new total
  const newTotal = currentPoints - reward.points;

  return c.json({ 
    message: 'Reward claimed successfully',
    pointsUsed: reward.points,
    totalPoints: newTotal
  });
});

export default rewards;
