import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  LoginCredentials,
  SignupCredentials,
  PasswordResetRequest,
  PasswordUpdate,
  AuthError,
} from '../types/auth';
import { Profile } from '../types/database';

export class AuthService {
  async signup(credentials: SignupCredentials) {
    try {
      const { email, password, fullName, role, organizationName } = credentials;

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            ...(role === 'teacher' && organizationName
              ? { organization_name: organizationName }
              : {}),
          },
        },
      });

      if (error) {
        return { user: null, profile: null, error };
      }

      // If teacher, update the profile with organization name
      if (data.user && role === 'teacher' && organizationName) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ organization_name: organizationName })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Failed to update teacher organization:', updateError);
        }
      }

      return { user: data.user, profile: null, error: null };
    } catch (error) {
      return {
        user: null,
        profile: null,
        error: { message: 'An unexpected error occurred during signup' } as AuthError,
      };
    }
  }

  async login(credentials: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) {
        return { user: null, profile: null, error };
      }

      // Fetch user profile
      let profile = null;
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profileData) {
          profile = profileData as Profile;
        }
      }

      return { user: data.user, profile, error: null };
    } catch (error) {
      return {
        user: null,
        profile: null,
        error: { message: 'An unexpected error occurred during login' } as AuthError,
      };
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return {
        error: { message: 'An unexpected error occurred during logout' } as AuthError,
      };
    }
  }

  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { data, error };
    } catch (error) {
      return {
        data: null,
        error: { message: 'An unexpected error occurred during password reset' } as AuthError,
      };
    }
  }

  async updatePassword(passwordUpdate: PasswordUpdate) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: passwordUpdate.newPassword,
      });

      return { data, error };
    } catch (error) {
      return {
        data: null,
        error: { message: 'An unexpected error occurred during password update' } as AuthError,
      };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return { user: null, profile: null, error };
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        user,
        profile: profileError ? null : profile as Profile,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        profile: null,
        error: { message: 'An unexpected error occurred while fetching user' } as AuthError,
      };
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return {
        profile: error ? null : data as Profile,
        error,
      };
    } catch (error) {
      return {
        profile: null,
        error: { message: 'An unexpected error occurred during profile update' } as AuthError,
      };
    }
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription.unsubscribe;
  }

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { session: data.session, error };
    } catch (error) {
      return {
        session: null,
        error: { message: 'An unexpected error occurred while fetching session' } as AuthError,
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();