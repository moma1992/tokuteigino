import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './authStore';
import { authService } from '../services/auth.service';
import { LoginCredentials, SignupCredentials } from '../types/auth';

// Mock auth service
vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.reset();
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully and update state', async () => {
      const { result } = renderHook(() => useAuthStore());

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
        role: 'student' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(authService.login).mockResolvedValueOnce({
        user: mockUser as any,
        profile: mockProfile,
        error: null,
      });

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle login error', async () => {
      const { result } = renderHook(() => useAuthStore());

      const credentials: LoginCredentials = {
        email: 'wrong@test.com',
        password: 'WrongPassword',
      };

      const mockError = {
        message: 'Invalid login credentials',
        status: 400,
      };

      vi.mocked(authService.login).mockResolvedValueOnce({
        user: null,
        profile: null,
        error: mockError as any,
      });

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      const credentials: SignupCredentials = {
        email: 'newuser@test.com',
        password: 'Test123456!',
        fullName: 'New User',
        role: 'student',
      };

      const mockUser = {
        id: 'user-456',
        email: credentials.email,
      };

      vi.mocked(authService.signup).mockResolvedValueOnce({
        user: mockUser as any,
        profile: null,
        error: null,
      });

      await act(async () => {
        await result.current.signup(credentials);
      });

      expect(authService.signup).toHaveBeenCalledWith(credentials);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle signup error', async () => {
      const { result } = renderHook(() => useAuthStore());

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

      vi.mocked(authService.signup).mockResolvedValueOnce({
        user: null,
        profile: null,
        error: mockError as any,
      });

      await act(async () => {
        await result.current.signup(credentials);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First, set up authenticated state
      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'user@test.com',
        } as any);
        result.current.setProfile({
          id: 'user-123',
          email: 'user@test.com',
          full_name: 'Test User',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      expect(result.current.isAuthenticated).toBe(true);

      vi.mocked(authService.logout).mockResolvedValueOnce({
        error: null,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const { result } = renderHook(() => useAuthStore());
      const email = 'user@test.com';

      vi.mocked(authService.resetPassword).mockResolvedValueOnce({
        data: {},
        error: null,
      });

      await act(async () => {
        await result.current.resetPassword(email);
      });

      expect(authService.resetPassword).toHaveBeenCalledWith(email);
      expect(result.current.error).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('should check and set authenticated user', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
      };

      const mockProfile = {
        id: 'user-123',
        email: 'user@test.com',
        full_name: 'Test User',
        role: 'student' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vi.mocked(authService.getCurrentUser).mockResolvedValueOnce({
        user: mockUser as any,
        profile: mockProfile,
        error: null,
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle no authenticated user', async () => {
      const { result } = renderHook(() => useAuthStore());

      vi.mocked(authService.getCurrentUser).mockResolvedValueOnce({
        user: null,
        profile: null,
        error: null,
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set initial state
      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'user@test.com',
        } as any);
        result.current.setProfile({
          id: 'user-123',
          email: 'user@test.com',
          full_name: 'Old Name',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      const updates = {
        full_name: 'New Name',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const mockUpdatedProfile = {
        ...result.current.profile,
        ...updates,
      };

      vi.mocked(authService.updateProfile).mockResolvedValueOnce({
        profile: mockUpdatedProfile,
        error: null,
      });

      await act(async () => {
        await result.current.updateProfile(updates);
      });

      expect(authService.updateProfile).toHaveBeenCalledWith('user-123', updates);
      expect(result.current.profile).toEqual(mockUpdatedProfile);
    });

    it('should handle profile update error', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set initial state
      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'user@test.com',
        } as any);
      });

      const updates = { full_name: 'New Name' };
      const mockError = {
        message: 'Failed to update profile',
        status: 500,
      };

      vi.mocked(authService.updateProfile).mockResolvedValueOnce({
        profile: null,
        error: mockError as any,
      });

      await act(async () => {
        await result.current.updateProfile(updates);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });
});