import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../../store/authStore';
import { Profile } from '../../types/database';

// Mock auth store
vi.mock('../../store/authStore');

// Mock components
const PublicPage = () => <div>Public Page</div>;
const ProtectedPage = () => <div>Protected Page</div>;
const TeacherOnlyPage = () => <div>Teacher Only Page</div>;
const StudentOnlyPage = () => <div>Student Only Page</div>;
const LoginPage = () => <div>Login Page</div>;
const UnauthorizedPage = () => <div>Unauthorized Page</div>;

describe('ProtectedRoute', () => {
  const createMockProfile = (role: 'student' | 'teacher'): Profile => ({
    id: 'user-123',
    email: 'user@test.com',
    full_name: 'Test User',
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/" element={<PublicPage />} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <ProtectedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-only"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherOnlyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-only"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentOnlyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/any-role"
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher']}>
                <ProtectedPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('authentication check', () => {
    it('should redirect to login when user is not authenticated', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        checkAuth: vi.fn(),
      } as any);

      renderWithRouter('/protected');

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('should show protected content when user is authenticated', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        profile: createMockProfile('student'),
        checkAuth: vi.fn(),
      } as any);

      renderWithRouter('/protected');

      await waitFor(() => {
        expect(screen.getByText('Protected Page')).toBeInTheDocument();
      });
    });

    it('should show loading state while checking auth', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        checkAuth: vi.fn(),
      } as any);

      renderWithRouter('/protected');

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('role-based access', () => {
    it('should allow access when user has required role', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        profile: createMockProfile('teacher'),
        checkAuth: vi.fn(),
      } as any);

      renderWithRouter('/teacher-only');

      await waitFor(() => {
        expect(screen.getByText('Teacher Only Page')).toBeInTheDocument();
      });
    });

    it('should redirect to unauthorized when user lacks required role', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        profile: createMockProfile('student'),
        checkAuth: vi.fn(),
      } as any);

      renderWithRouter('/teacher-only');

      await waitFor(() => {
        expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
      });
    });

    it('should allow access when user has one of the allowed roles', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        profile: createMockProfile('student'),
        checkAuth: vi.fn(),
      } as any);

      renderWithRouter('/any-role');

      await waitFor(() => {
        expect(screen.getByText('Protected Page')).toBeInTheDocument();
      });
    });
  });

  describe('redirect behavior', () => {
    it('should redirect to custom login path when provided', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        checkAuth: vi.fn(),
      } as any);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/custom-login" element={<div>Custom Login</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute redirectTo="/custom-login">
                  <ProtectedPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Login')).toBeInTheDocument();
      });
    });

    it('should redirect to custom unauthorized path when provided', async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        profile: createMockProfile('student'),
        checkAuth: vi.fn(),
      } as any);

      render(
        <MemoryRouter initialEntries={['/teacher-only']}>
          <Routes>
            <Route path="/custom-unauthorized" element={<div>Custom Unauthorized</div>} />
            <Route
              path="/teacher-only"
              element={
                <ProtectedRoute
                  requiredRole="teacher"
                  unauthorizedRedirect="/custom-unauthorized"
                >
                  <TeacherOnlyPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Custom Unauthorized')).toBeInTheDocument();
      });
    });
  });

  describe('custom loading component', () => {
    it('should show custom loading component when provided', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        checkAuth: vi.fn(),
      } as any);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute loadingComponent={<div>Custom Loading...</div>}>
                  <ProtectedPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    });
  });

  describe('checkAuth on mount', () => {
    it('should call checkAuth when component mounts', () => {
      const mockCheckAuth = vi.fn();
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        profile: createMockProfile('student'),
        checkAuth: mockCheckAuth,
      } as any);

      renderWithRouter('/protected');

      expect(mockCheckAuth).toHaveBeenCalledTimes(1);
    });
  });
});