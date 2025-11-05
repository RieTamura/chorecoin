import { User } from '../types';

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  userType: 'parent' | 'child';
  createdAt: string;
  updatedAt: string;
  hasPasscode: boolean;
}

export function mapDbUserToResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.user_type,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    hasPasscode: Boolean(user.parent_passcode_hash),
  };
}
