import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { authService } from '../services/auth.service';
import { LoginCredentials, SignupCredentials, AuthError } from '../types/auth';
import { Profile } from '../types/database';

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
        
        const { user, profile, error } = await authService.login(credentials);
        
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
        
        const { user, profile, error } = await authService.signup(credentials);
        
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

      logout: async () => {
        set({ isLoading: true });
        
        const { error } = await authService.logout();
        
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
        
        const { error } = await authService.resetPassword(email);
        
        if (error) {
          set({ error: error as AuthError, isLoading: false });
          return;
        }
        
        set({ isLoading: false, error: null });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
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
        
        const { profile, error } = await authService.updateProfile(user.id, updates);
        
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

      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile: Profile | null) => set({ profile }),
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