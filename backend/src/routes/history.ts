import { Hono } from 'hono';
import { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const history = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
history.use('/*', authMiddleware);

// Get history for the authenticated user
history.get('/', async (c) => {
  const userId = c.get('userId');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');

  let query = 'SELECT * FROM history WHERE user_id = ?';
  const params: any[] = [userId];

  if (startDate && endDate) {
    query += ' AND date(created_at) BETWEEN date(?) AND date(?)';
    params.push(startDate, endDate);
  } else if (startDate) {
    query += ' AND date(created_at) >= date(?)';
    params.push(startDate);
  } else if (endDate) {
    query += ' AND date(created_at) <= date(?)';
    params.push(endDate);
  }

  query += ' ORDER BY created_at DESC';

  const stmt = c.env.DB.prepare(query);
  const { results } = await stmt.bind(...params).all();

  return c.json({ history: results });
});

// Get current points total
history.get('/points', async (c) => {
  const userId = c.get('userId');

  const result = await c.env.DB.prepare(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'earn' THEN points ELSE 0 END), 0) as earned,
      COALESCE(SUM(CASE WHEN type = 'claim' THEN points ELSE 0 END), 0) as claimed
    FROM history WHERE user_id = ?`
  ).bind(userId).first();

  const earned = result?.earned || 0;
  const claimed = result?.claimed || 0;
  const total = earned - claimed;

  return c.json({ 
    totalPoints: total,
    earnedPoints: earned,
    claimedPoints: claimed
  });
});

export default history;
