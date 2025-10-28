import { Context, Next } from 'hono';
import * as jose from 'jose';
import { Env, JWTPayload } from '../types';

// Extend Context to include userId
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
  }
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    const jwtPayload = payload as unknown as JWTPayload;
    c.set('userId', jwtPayload.userId);
    
    await next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}
