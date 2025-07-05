import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { mockAuthService } from '../services/mock-auth.service';
import { LoginCredentials, SignupCredentials, AuthError } from '../types/auth';
import { Profile } from '../types/database';

// Check if we're in test mode
const isTestMode = () => {
  return window.location.search.includes('test=true') || 
         window.localStorage.getItem('e2e-test-mode') === 'true' ||
         process.env.NODE_ENV === 'test';
};

// Get appropriate auth service
const getAuthService = () => {
  return isTestMode() ? mockAuthService : authService;
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  
  // State setters
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AuthError | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        const { user, profile, error } = await getAuthService().login(credentials);
        
        if (error) {
          set({ error, isLoading: false });
          return;
        }
        
        set({
          user,
          profile,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });
      },

      signup: async (credentials: SignupCredentials) => {
        set({ isLoading: true, error: null });
        
        const { user, profile, error } = await getAuthService().signup(credentials);
        
        if (error) {
          set({ error, isLoading: false });
          // Don't return here if it's email confirmation required
          if (error.type === 'email_confirmation_required') {
            return;
          }
          return;
        }
        
        set({
          user,
          profile,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });
      },

      logout: async () => {
        set({ isLoading: true });
        
        const { error } = await getAuthService().logout();
        
        if (error) {
          set({ error, isLoading: false });
          return;
        }
        
        set({
          ...initialState,
          isLoading: false,
        });
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        const { error } = await getAuthService().resetPassword(email);
        
        if (error) {
          set({ error: error as AuthError, isLoading: false });
          return;
        }
        
        set({ isLoading: false, error: null });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
        const currentAuthService = getAuthService();
        
        // In test mode, use mock service directly
        if (isTestMode()) {
          const { user, profile, error } = await currentAuthService.getCurrentUser();
          set({
            user,
            profile,
            isAuthenticated: !!user,
            isLoading: false,
            error,
          });
          return;
        }
        
        // Set up auth state listener for real auth service
        authService.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            // Fetch profile when user signs in
            authService.getCurrentUser().then(({ user, profile }) => {
              set({
                user,
                profile,
                isAuthenticated: !!user,
                isLoading: false,
                error: null,
              });
            });
          } else if (event === 'SIGNED_OUT') {
            set({
              ...initialState,
              isLoading: false,
            });
          }
        });
        
        const { user, profile, error } = await authService.getCurrentUser();
        
        if (error) {
          set({ ...initialState, isLoading: false });
          return;
        }
        
        set({
          user,
          profile,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get();
        
        if (!user) {
          set({ error: { message: 'User not authenticated' } });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        const { profile, error } = await getAuthService().updateProfile(user.id, updates);
        
        if (error) {
          set({ error: error as AuthError, isLoading: false });
          return;
        }
        
        set({
          profile,
          isLoading: false,
          error: null,
        });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
      setProfile: (profile: Profile | null) => {
        set({ profile });
      },
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: AuthError | null) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);