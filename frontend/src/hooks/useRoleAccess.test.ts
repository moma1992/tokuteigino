import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRoleAccess } from './useRoleAccess';
import { useAuthStore } from '../store/authStore';
import { Profile, UserRole } from '../types/database';

// Mock auth store
vi.mock('../store/authStore');

describe('useRoleAccess', () => {
  const createMockProfile = (role: UserRole): Profile => ({
    id: 'user-123',
    email: 'user@test.com',
    full_name: 'Test User',
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  describe('role checks', () => {
    it('should identify student role correctly', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('student'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.isStudent).toBe(true);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.role).toBe('student');
    });

    it('should identify teacher role correctly', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('teacher'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.isStudent).toBe(false);
      expect(result.current.isTeacher).toBe(true);
      expect(result.current.role).toBe('teacher');
    });

    it('should handle no profile', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: null,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.isStudent).toBe(false);
      expect(result.current.isTeacher).toBe(false);
      expect(result.current.role).toBeNull();
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the specified role', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('teacher'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.hasRole('teacher')).toBe(true);
      expect(result.current.hasRole('student')).toBe(false);
    });

    it('should return true when user has one of the specified roles', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('student'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.hasRole(['student', 'teacher'])).toBe(true);
    });

    it('should return false when user has none of the specified roles', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('student'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.hasRole('teacher')).toBe(false);
      expect(result.current.hasRole(['teacher'])).toBe(false);
    });

    it('should return false when no profile exists', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: null,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.hasRole('student')).toBe(false);
      expect(result.current.hasRole(['student', 'teacher'])).toBe(false);
    });
  });

  describe('canAccess', () => {
    it('should allow access when user has required role', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('teacher'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.canAccess({ requiredRole: 'teacher' })).toBe(true);
      expect(result.current.canAccess({ requiredRole: 'student' })).toBe(false);
    });

    it('should allow access when user has one of the allowed roles', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('student'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.canAccess({ allowedRoles: ['student', 'teacher'] })).toBe(true);
      expect(result.current.canAccess({ allowedRoles: ['teacher'] })).toBe(false);
    });

    it('should deny access when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: null,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(result.current.canAccess({ requiredRole: 'student' })).toBe(false);
      expect(result.current.canAccess({ allowedRoles: ['student', 'teacher'] })).toBe(false);
    });

    it('should handle complex access rules', () => {
      const teacherProfile = createMockProfile('teacher');
      teacherProfile.subscription_plan = 'pro';
      
      vi.mocked(useAuthStore).mockReturnValue({
        profile: teacherProfile,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      // Custom condition function
      const canAccessPremiumFeature = result.current.canAccess({
        requiredRole: 'teacher',
        customCondition: (profile) => profile?.subscription_plan === 'pro',
      });

      expect(canAccessPremiumFeature).toBe(true);

      // Should fail if subscription is not pro
      teacherProfile.subscription_plan = 'free';
      const cannotAccessPremiumFeature = result.current.canAccess({
        requiredRole: 'teacher',
        customCondition: (profile) => profile?.subscription_plan === 'pro',
      });

      expect(cannotAccessPremiumFeature).toBe(false);
    });
  });

  describe('requireRole', () => {
    it('should not throw when user has required role', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('teacher'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(() => result.current.requireRole('teacher')).not.toThrow();
    });

    it('should throw when user does not have required role', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: createMockProfile('student'),
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(() => result.current.requireRole('teacher')).toThrow('Unauthorized: Required role: teacher');
    });

    it('should throw when user is not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        profile: null,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useRoleAccess());

      expect(() => result.current.requireRole('student')).toThrow('Unauthorized: Required role: student');
    });
  });
});