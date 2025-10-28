import { Hono } from 'hono';
import { Env, User } from '../types';
import { authMiddleware } from '../middleware/auth';

const users = new Hono<{ Bindings: Env }>();

// Apply auth middleware to all routes
users.use('/*', authMiddleware);

// Get current user info
users.get('/me', async (c) => {
  const userId = c.get('userId');

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, user_type, created_at FROM users WHERE id = ?'
  ).bind(userId).first<User>();

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user });
});

// Update user type (parent/child)
users.patch('/me', async (c) => {
  const userId = c.get('userId');
  const { userType } = await c.req.json();

  if (!userType || !['parent', 'child'].includes(userType)) {
    return c.json({ error: 'Invalid user type' }, 400);
  }

  await c.env.DB.prepare(
    'UPDATE users SET user_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(userType, userId).run();

  const user = await c.env.DB.prepare(
    'SELECT id, email, name, user_type, created_at FROM users WHERE id = ?'
  ).bind(userId).first<User>();

  return c.json({ user });
});

export default users;
