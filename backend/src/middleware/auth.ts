import { Context, Next } from 'hono';
import * as jose from 'jose';
import { Env, JWTPayload } from '../types';
import { AppError, ErrorCodes, ErrorMessages } from '../errors';

// Extend Context to include userId
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
  }
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    throw new AppError(
      401,
      ErrorCodes.MISSING_TOKEN,
      ErrorMessages[ErrorCodes.MISSING_TOKEN]
    );
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new AppError(
      401,
      ErrorCodes.INVALID_TOKEN,
      ErrorMessages[ErrorCodes.INVALID_TOKEN]
    );
  }

  const token = authHeader.substring(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    
    const jwtPayload = payload as unknown as JWTPayload;
    
    if (!jwtPayload.userId) {
      throw new AppError(
        401,
        ErrorCodes.INVALID_TOKEN,
        ErrorMessages[ErrorCodes.INVALID_TOKEN]
      );
    }

    c.set('userId', jwtPayload.userId);
    await next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof jose.errors.JWTExpired) {
      throw new AppError(
        401,
        ErrorCodes.EXPIRED_TOKEN,
        ErrorMessages[ErrorCodes.EXPIRED_TOKEN]
      );
    }

    if (error instanceof Error) {
      console.error('JWT verification failed:', error.message);
      throw new AppError(
        401,
        ErrorCodes.INVALID_TOKEN,
        ErrorMessages[ErrorCodes.INVALID_TOKEN]
      );
    }

    throw error;
  }
}
