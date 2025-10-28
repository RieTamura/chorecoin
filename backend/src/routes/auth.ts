import { Hono } from 'hono';
import * as jose from 'jose';
import { Env, GoogleTokenPayload, User } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
    const { idToken } = await c.req.json();

    if (!idToken) {
      return c.json({ error: 'ID token is required' }, 400);
    }

    // Verify Google ID token
    const JWKS = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
    
    const { payload } = await jose.jwtVerify(idToken, JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: c.env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = payload as unknown as GoogleTokenPayload;

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
      
      user = existingUser;
      user.name = googlePayload.name;
      user.email = googlePayload.email;
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

    return c.json({
      token: jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

export default auth;
