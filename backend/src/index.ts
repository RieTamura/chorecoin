import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import auth from './routes/auth';
import chores from './routes/chores';
import rewards from './routes/rewards';
import history from './routes/history';
import users from './routes/users';

const app = new Hono<{ Bindings: Env }>();

// CORS configuration
app.use('/*', cors({
  origin: '*', // In production, set this to your Expo app's origin
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));

// Health check
app.get('/', (c) => {
  return c.json({ message: 'Chore Coin API is running!' });
});

// Mount routes
app.route('/api/auth', auth);
app.route('/api/chores', chores);
app.route('/api/rewards', rewards);
app.route('/api/history', history);
app.route('/api/users', users);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
