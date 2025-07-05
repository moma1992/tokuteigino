import { User } from '@supabase/supabase-js';
import { Profile } from './database';

export interface AuthUser extends User {
  profile?: Profile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
  role: 'student' | 'teacher';
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdate {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
  type?: string;
}