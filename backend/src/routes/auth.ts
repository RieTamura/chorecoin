import { Hono } from 'hono';
import * as jose from 'jose';
import { Env, GoogleTokenPayload, User } from '../types';
import { AppError, ErrorCodes, ErrorMessages } from '../errors';
import { mapDbUserToResponse } from '../utils/user';

const auth = new Hono<{ Bindings: Env }>();

// Helper function to generate UUID (simple implementation)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

auth.post('/google', async (c) => {
  try {
    const body = await c.req.json();
    const { idToken } = body;

    if (!idToken) {
      throw new AppError(
        400,
        ErrorCodes.MISSING_FIELD,
        'idToken は必須です。'
      );
    }

    // Verify Google ID token
    const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
    
    let payload: jose.JWTPayload;
    try {
      const result = await jose.jwtVerify(idToken, JWKS, {
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: c.env.GOOGLE_CLIENT_ID,
      });
      payload = result.payload;
    } catch (verifyError) {
      const errorMessage = verifyError instanceof Error 
        ? verifyError.message 
        : 'Google token verification failed';
      console.error('Google token verification failed:', errorMessage);
      throw new AppError(
        401,
        ErrorCodes.INVALID_TOKEN,
        'Google ID トークンが無効です。'
      );
    }

    const googlePayload = payload as unknown as GoogleTokenPayload;

    // Validate Google payload
    if (!googlePayload.sub || !googlePayload.email) {
      throw new AppError(
        400,
        ErrorCodes.INVALID_INPUT,
        'Google トークンに必要な情報が含まれていません。'
      );
    }

    // Check if user exists
    const existingUser = await c.env.DB.prepare(
      'SELECT * FROM users WHERE google_id = ?'
    ).bind(googlePayload.sub).first<User>();

    let user: User;

    if (existingUser) {
      // Update user info
      await c.env.DB.prepare(
        'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE google_id = ?'
      ).bind(googlePayload.name, googlePayload.email, googlePayload.sub).run();
      
      user = {
        ...existingUser,
        name: googlePayload.name,
        email: googlePayload.email,
      };
    } else {
      // Create new user
      const userId = generateUUID();
      await c.env.DB.prepare(
        'INSERT INTO users (id, google_id, email, name, user_type) VALUES (?, ?, ?, ?, ?)'
      ).bind(userId, googlePayload.sub, googlePayload.email, googlePayload.name, 'child').run();

      user = {
        id: userId,
        google_id: googlePayload.sub,
        email: googlePayload.email,
        name: googlePayload.name,
        user_type: 'child',
        parent_passcode_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const jwt = await new jose.SignJWT({ userId: user.id, email: user.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    // Fetch the latest user state to include passcode info
    const latestUser = await c.env.DB.prepare(
      'SELECT id, email, name, user_type, created_at, updated_at, parent_passcode_hash FROM users WHERE id = ?'
    ).bind(user.id).first<User>();

    const responseUser = latestUser ? mapDbUserToResponse(latestUser) : mapDbUserToResponse(user);

    return c.json({
      token: jwt,
      user: responseUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Authentication error:', error);
    throw new AppError(
      500,
      ErrorCodes.INTERNAL_SERVER_ERROR,
      ErrorMessages[ErrorCodes.INTERNAL_SERVER_ERROR]
    );
  }
});

export default auth;
