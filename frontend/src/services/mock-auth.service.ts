// Mock authentication service for E2E testing
import { LoginCredentials, SignupCredentials, AuthError } from '../types/auth';
import { User } from '@supabase/supabase-js';
import { Profile } from '../types/database';

interface MockUser {
  id: string;
  email: string;
  password: string;
  confirmed: boolean;
  profile: Profile;
}

class MockAuthService {
  private users: MockUser[] = [];
  private currentSession: { user: User; profile: Profile } | null = null;

  constructor() {
    // Add some default test users
    this.users = [
      {
        id: '1',
        email: 'unconfirmed@example.com',
        password: 'password123',
        confirmed: false,
        profile: {
          id: '1',
          full_name: '未確認ユーザー',
          email: 'unconfirmed@example.com',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      },
      {
        id: '2', 
        email: 'confirmed@example.com',
        password: 'password123',
        confirmed: true,
        profile: {
          id: '2',
          full_name: '確認済みユーザー',
          email: 'confirmed@example.com',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    ];
  }

  async login(credentials: LoginCredentials): Promise<{
    user: User | null;
    profile: Profile | null;
    error: AuthError | null;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { email, password } = credentials;

    // Find user
    const mockUser = this.users.find(u => u.email === email);
    
    if (!mockUser || mockUser.password !== password) {
      return {
        user: null,
        profile: null,
        error: {
          message: 'メールアドレスまたはパスワードが正しくありません',
          status: 400
        }
      };
    }

    if (!mockUser.confirmed) {
      return {
        user: null,
        profile: null,
        error: {
          message: 'メールアドレスの確認が完了していません',
          status: 400
        }
      };
    }

    // Create user object
    const user: User = {
      id: mockUser.id,
      email: mockUser.email,
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      role: 'authenticated'
    };

    this.currentSession = { user, profile: mockUser.profile };

    return {
      user,
      profile: mockUser.profile,
      error: null
    };
  }

  async signup(credentials: SignupCredentials): Promise<{
    user: User | null;
    profile: Profile | null;
    error: AuthError | null;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const { email, password, fullName, role } = credentials;

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      return {
        user: null,
        profile: null,
        error: {
          message: 'このメールアドレスは既に登録されています',
          status: 400
        }
      };
    }

    // Create new user
    const newUser: MockUser = {
      id: (this.users.length + 1).toString(),
      email,
      password,
      confirmed: false,
      profile: {
        id: (this.users.length + 1).toString(),
        full_name: fullName,
        email,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    this.users.push(newUser);

    // For signup, we return user but don't set session (pending email confirmation)
    const user: User = {
      id: newUser.id,
      email: newUser.email,
      email_confirmed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      role: 'authenticated'
    };

    return {
      user,
      profile: newUser.profile,
      error: null
    };
  }

  async logout(): Promise<{ error: AuthError | null }> {
    this.currentSession = null;
    return { error: null };
  }

  async getCurrentUser(): Promise<{
    user: User | null;
    profile: Profile | null;
    error: AuthError | null;
  }> {
    if (this.currentSession) {
      return {
        user: this.currentSession.user,
        profile: this.currentSession.profile,
        error: null
      };
    }

    return {
      user: null,
      profile: null,
      error: null
    };
  }

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    // Simulate sending password reset email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = this.users.find(u => u.email === email);
    if (!user) {
      return {
        error: {
          message: 'このメールアドレスは登録されていません',
          status: 400
        }
      };
    }

    return { error: null };
  }

  async updateProfile(updates: Partial<Profile>): Promise<{
    profile: Profile | null;
    error: AuthError | null;
  }> {
    if (!this.currentSession) {
      return {
        profile: null,
        error: {
          message: 'ログインしていません',
          status: 401
        }
      };
    }

    // Update current session profile
    this.currentSession.profile = {
      ...this.currentSession.profile,
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Update stored user profile
    const userIndex = this.users.findIndex(u => u.id === this.currentSession!.user.id);
    if (userIndex !== -1) {
      this.users[userIndex].profile = this.currentSession.profile;
    }

    return {
      profile: this.currentSession.profile,
      error: null
    };
  }
}

export const mockAuthService = new MockAuthService();