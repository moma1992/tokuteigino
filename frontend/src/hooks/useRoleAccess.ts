import { useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRole, Profile } from '../types/database';

interface AccessOptions {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  customCondition?: (profile: Profile | null) => boolean;
}

export const useRoleAccess = () => {
  const { profile, isAuthenticated } = useAuthStore();

  const role = useMemo(() => profile?.role || null, [profile]);
  const isStudent = useMemo(() => role === 'student', [role]);
  const isTeacher = useMemo(() => role === 'teacher', [role]);

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!profile || !isAuthenticated) return false;

      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(profile.role);
    },
    [profile, isAuthenticated]
  );

  const canAccess = useCallback(
    (options: AccessOptions): boolean => {
      if (!isAuthenticated) return false;

      const { requiredRole, allowedRoles, customCondition } = options;

      // Check required role
      if (requiredRole && !hasRole(requiredRole)) {
        return false;
      }

      // Check allowed roles
      if (allowedRoles && !hasRole(allowedRoles)) {
        return false;
      }

      // Check custom condition
      if (customCondition && !customCondition(profile)) {
        return false;
      }

      return true;
    },
    [isAuthenticated, profile, hasRole]
  );

  const requireRole = useCallback(
    (requiredRole: UserRole): void => {
      if (!hasRole(requiredRole)) {
        throw new Error(`Unauthorized: Required role: ${requiredRole}`);
      }
    },
    [hasRole]
  );

  return {
    role,
    isStudent,
    isTeacher,
    hasRole,
    canAccess,
    requireRole,
  };
};