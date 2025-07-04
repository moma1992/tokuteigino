import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '../lib/supabase';
import { AuthService } from './auth.service';
import { SignupCredentials, LoginCredentials } from '../types/auth';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('signup', () => {
    it('should sign up a student successfully', async () => {
      const credentials: SignupCredentials = {
        email: 'student@test.com',
        password: 'Test123456!',
        fullName: 'Test Student',
        role: 'student',
      };

      const mockUser = {
        id: 'user-123',
        email: credentials.email,
        user_metadata: { full_name: credentials.fullName, role: credentials.role },
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      const result = await authService.signup(credentials);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
            role: credentials.role,
          },
        },
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should sign up a teacher successfully with organization', async () => {
      const credentials: SignupCredentials = {
        email: 'teacher@test.com',
        password: 'Test123456!',
        fullName: 'Test Teacher',
        role: 'teacher',
        organizationName: 'Test School',
      };

      const mockUser = {
        id: 'user-456',
        email: credentials.email,
        user_metadata: {
          full_name: credentials.fullName,
          role: credentials.role,
          organization_name: credentials.organizationName,
        },
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
      } as any);

      const result = await authService.signup(credentials);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
            role: credentials.role,
            organization_name: credentials.organizationName,
          },
        },
      });

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle signup error', async () => {
      const credentials: SignupCredentials = {
        email: 'invalid@test.com',
        password: 'weak',
        fullName: 'Test User',
        role: 'student',
      };

      const mockError = {
        message: 'Password should be at least 8 characters',
        status: 400,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await authService.signup(credentials);

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const credentials: LoginCredentials = {
        email: 'user@test.com',
        password: 'Test123456!',
      };

      const mockUser = {
        id: 'user-123',
        email: credentials.email,
      };

      const mockProfile = {
        id: 'user-123',
        email: credentials.email,
        full_name: 'Test User',
        role: 'student',
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
      } as any);

      const result = await authService.login(credentials);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
      expect(result.user).toEqual(mockUser);
      expect(result.profile).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it('should handle login error', async () => {
      const credentials: LoginCredentials = {
        email: 'wrong@test.com',
        password: 'WrongPassword',
      };

      const mockError = {
        message: 'Invalid login credentials',
        status: 400,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await authService.login(credentials);

      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      const result = await authService.logout();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });

    it('should handle logout error', async () => {
      const mockError = {
        message: 'Failed to logout',
        status: 500,
      };

      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: mockError,
      });

      const result = await authService.logout();

      expect(result.error).toEqual(mockError);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      const email = 'user@test.com';

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const result = await authService.resetPassword(email);

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      expect(result.error).toBeNull();
    });

    it('should handle password reset error', async () => {
      const email = 'notfound@test.com';
      const mockError = {
        message: 'User not found',
        status: 404,
      };

      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      const result = await authService.resetPassword(email);

      expect(result.error).toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user with profile', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
      };

      const mockProfile = {
        id: 'user-123',
        email: 'user@test.com',
        full_name: 'Test User',
        role: 'student',
      };

      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockProfile, error: null }),
      } as any);

      const result = await authService.getCurrentUser();

      expect(result.user).toEqual(mockUser);
      expect(result.profile).toEqual(mockProfile);
      expect(result.error).toBeNull();
    });

    it('should return null when no user is authenticated', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const result = await authService.getCurrentUser();

      expect(result.user).toBeNull();
      expect(result.profile).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userId = 'user-123';
      const updates = {
        full_name: 'Updated Name',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const mockUpdatedProfile = {
        id: userId,
        email: 'user@test.com',
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        role: 'student',
      };

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: mockUpdatedProfile, error: null }),
      } as any);

      const result = await authService.updateProfile(userId, updates);

      expect(result.profile).toEqual(mockUpdatedProfile);
      expect(result.error).toBeNull();
    });

    it('should handle profile update error', async () => {
      const userId = 'user-123';
      const updates = { full_name: 'Updated Name' };
      const mockError = {
        message: 'Failed to update profile',
        status: 500,
      };

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValueOnce({ data: null, error: mockError }),
      } as any);

      const result = await authService.updateProfile(userId, updates);

      expect(result.profile).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValueOnce({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      } as any);

      const unsubscribe = authService.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
      expect(typeof unsubscribe).toBe('function');
    });
  });
});