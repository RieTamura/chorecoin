import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import { AppError, formatErrorResponse, ErrorCodes, ErrorMessages } from './errors';
import auth from './routes/auth';
import chores from './routes/chores';
import rewards from './routes/rewards';
import history from './routes/history';
import users from './routes/users';

const app = new Hono<{ Bindings: Env }>();

// CORS configuration - only for API routes
app.use('/api/*', cors({
  origin: '*', // In production, set this to your Expo app's origin
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));

// Health check
app.get('/', (c) => {
  return c.json({ message: 'Chore Coin API is running!' });
});

// Mount API routes
app.route('/api/auth', auth);
app.route('/api/chores', chores);
app.route('/api/rewards', rewards);
app.route('/api/history', history);
app.route('/api/users', users);

// 404 handler for API
app.notFound(async (c) => {
  // Check if it's an API request
  if (c.req.path.startsWith('/api/')) {
    const error = new AppError(
      404,
      ErrorCodes.NOT_FOUND,
      ErrorMessages[ErrorCodes.NOT_FOUND]
    );
    const response = formatErrorResponse(error);
    return c.json(response, 404);
  }
  
  // For non-API routes, delegate to the static assets binding when available.
  // not_found_handling="single-page-application" ensures index.html is returned
  // so React Router can perform client-side routing.
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }

  return new Response('Not found', { status: 404 });
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    const response = formatErrorResponse(err);
    return c.json(response, err.statusCode as any);
  }

  const errorResponse = formatErrorResponse(err);
  return c.json(errorResponse, 500);
});

export default app;
