export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'child';
}

export interface Chore {
  id: string;
  user_id: string;
  name: string;
  points: number;
  recurring: number; // 0 or 1
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

export interface HistoryItem {
  id: string;
  user_id: string;
  type: 'earn' | 'claim';
  name: string;
  points: number;
  created_at: string;
}

export interface PointsSummary {
  totalPoints: number;
  earnedPoints: number;
  claimedPoints: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
