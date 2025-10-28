import { Hono } from 'hono';
import { Env, Chore } from '../types';
import { authMiddleware } from '../middleware/auth';

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
  const userId = c.get('userId');

  const { results } = await c.env.DB.prepare(
    'SELECT * FROM chores WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all();

  return c.json({ chores: results });
});

// Create a new chore
chores.post('/', async (c) => {
  const userId = c.get('userId');
  const { name, points, recurring } = await c.req.json();

  if (!name || points === undefined) {
    return c.json({ error: 'Name and points are required' }, 400);
  }

  const choreId = generateUUID();
  
  await c.env.DB.prepare(
    'INSERT INTO chores (id, user_id, name, points, recurring) VALUES (?, ?, ?, ?, ?)'
  ).bind(choreId, userId, name, points, recurring ? 1 : 0).run();

  const chore = await c.env.DB.prepare(
    'SELECT * FROM chores WHERE id = ?'
  ).bind(choreId).first();

  return c.json({ chore }, 201);
});

// Update a chore
chores.put('/:id', async (c) => {
  const userId = c.get('userId');
  const choreId = c.req.param('id');
  const { name, points, recurring } = await c.req.json();

  // Verify ownership
  const existingChore = await c.env.DB.prepare(
    'SELECT * FROM chores WHERE id = ? AND user_id = ?'
  ).bind(choreId, userId).first();

  if (!existingChore) {
    return c.json({ error: 'Chore not found' }, 404);
  }

  await c.env.DB.prepare(
    'UPDATE chores SET name = ?, points = ?, recurring = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(name, points, recurring ? 1 : 0, choreId).run();

  const chore = await c.env.DB.prepare(
    'SELECT * FROM chores WHERE id = ?'
  ).bind(choreId).first();

  return c.json({ chore });
});

// Delete a chore
chores.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const choreId = c.req.param('id');

  // Verify ownership
  const existingChore = await c.env.DB.prepare(
    'SELECT * FROM chores WHERE id = ? AND user_id = ?'
  ).bind(choreId, userId).first();

  if (!existingChore) {
    return c.json({ error: 'Chore not found' }, 404);
  }

  await c.env.DB.prepare(
    'DELETE FROM chores WHERE id = ?'
  ).bind(choreId).run();

  return c.json({ message: 'Chore deleted successfully' });
});

// Complete a chore
chores.post('/:id/complete', async (c) => {
  const userId = c.get('userId');
  const choreId = c.req.param('id');

  // Get chore details
  const chore = await c.env.DB.prepare(
    'SELECT * FROM chores WHERE id = ? AND user_id = ?'
  ).bind(choreId, userId).first<Chore>();

  if (!chore) {
    return c.json({ error: 'Chore not found' }, 404);
  }

  // Add to history
  const historyId = generateUUID();
  await c.env.DB.prepare(
    'INSERT INTO history (id, user_id, type, name, points) VALUES (?, ?, ?, ?, ?)'
  ).bind(historyId, userId, 'earn', chore.name, chore.points).run();

  // If not recurring, delete the chore
  if (chore.recurring === 0) {
    await c.env.DB.prepare(
      'DELETE FROM chores WHERE id = ?'
    ).bind(choreId).run();
  }

  // Calculate total points
  const totalPoints = await c.env.DB.prepare(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'earn' THEN points ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN type = 'claim' THEN points ELSE 0 END), 0) as total
    FROM history WHERE user_id = ?`
  ).bind(userId).first();

  return c.json({ 
    message: 'Chore completed',
    pointsEarned: chore.points,
    totalPoints: totalPoints?.total || 0
  });
});

export default chores;
