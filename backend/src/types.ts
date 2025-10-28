export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
}

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  user_type: 'parent' | 'child';
  created_at: string;
  updated_at: string;
}

export interface Chore {
  id: string;
  user_id: string;
  name: string;
  points: number;
  recurring: number; // 0 or 1 (SQLite boolean)
  created_at: string;
  updated_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  name: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface History {
  id: string;
  user_id: string;
  type: 'earn' | 'claim';
  name: string;
  points: number;
  created_at: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  exp?: number;
}

export interface GoogleTokenPayload {
  iss: string;
  sub: string;
  email: string;
  name: string;
  aud: string;
  exp: number;
}
