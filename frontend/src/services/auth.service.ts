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
      const { email, password, fullName, role } = credentials;

      console.log('Starting Supabase signup process for:', email);

      // Use Supabase standard signup with email confirmation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      console.log('Supabase signup result:', { data, error });

      if (error) {
        console.error('Supabase signup error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return {
          user: null,
          profile: null,
          error: {
            message: this.getSignupErrorMessage(error),
            code: error.code,
            status: error.status,
            ...error
          }
        };
      }

      // Check if email confirmation is required
      if (!data.user) {
        console.log('Signup successful, confirmation email sent');
        return {
          user: null,
          profile: null,
          error: { 
            message: 'メールアドレスに確認リンクを送信しました。確認後にログインしてください。',
            type: 'email_confirmation_required'
          } as AuthError
        };
      }

      // Check if user email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but email not confirmed yet');
        return {
          user: null,
          profile: null,
          error: { 
            message: 'メールアドレスに確認リンクを送信しました。確認後にログインしてください。',
            type: 'email_confirmation_required'
          } as AuthError
        };
      }

      // If user is immediately confirmed (local dev), fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return {
          user: data.user,
          profile: null,
          error: null // User is created, profile might be created by trigger
        };
      }

      console.log('User and profile created successfully');
      return { user: data.user, profile: profileData, error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return {
        user: null,
        profile: null,
        error: { message: 'アカウント作成中に予期しないエラーが発生しました' } as AuthError,
      };
    }
  }

  private getSignupErrorMessage(error: any): string {
    console.log('Processing signup error:', error);
    
    if (error.message?.includes('User already registered')) {
      return 'このメールアドレスは既に登録されています';
    }
    if (error.message?.includes('Password should be at least')) {
      return 'パスワードは6文字以上で入力してください';
    }
    if (error.message?.includes('Unable to validate email address')) {
      return 'メールアドレスの形式が正しくありません';
    }
    if (error.message?.includes('signup is disabled')) {
      return 'ユーザー登録は現在無効になっています';
    }
    if (error.message?.includes('Database error')) {
      return `データベースエラー: ${error.message}`;
    }
    
    // デバッグ用：元のエラーメッセージも含める
    const baseMessage = error.message || 'アカウント作成に失敗しました';
    return `${baseMessage} (コード: ${error.code || 'unknown'})`;
  }

  async login(credentials: LoginCredentials) {
    try {
      const { email, password } = credentials;
      
      console.log('Starting Supabase login process for:', email);

      // Use Supabase standard login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Supabase login result:', { data, error });

      if (error) {
        console.error('Supabase login error:', error);
        return {
          user: null,
          profile: null,
          error: { message: this.getLoginErrorMessage(error) } as AuthError
        };
      }

      if (!data.user) {
        console.error('No user returned from login');
        return {
          user: null,
          profile: null,
          error: { message: 'ログインに失敗しました' } as AuthError
        };
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return {
          user: data.user,
          profile: null,
          error: null // User is authenticated, profile might be missing
        };
      }

      console.log('Login successful for:', email);
      return { user: data.user, profile: profileData, error: null };
    } catch (error) {
      console.error('Unexpected login error:', error);
      return {
        user: null,
        profile: null,
        error: { message: 'ログイン中に予期しないエラーが発生しました' } as AuthError,
      };
    }
  }

  private getLoginErrorMessage(error: any): string {
    if (error.message?.includes('Email not confirmed')) {
      return 'メールアドレスの確認が完了していません。確認メールをご確認ください。';
    }
    if (error.message?.includes('Invalid login credentials')) {
      return 'メールアドレスまたはパスワードが正しくありません。';
    }
    return error.message || 'ログインに失敗しました';
  }

  async logout() {
    try {
      console.log('Starting Supabase logout process');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase logout error:', error);
        return {
          error: { message: 'ログアウト中にエラーが発生しました' } as AuthError,
        };
      }
      
      console.log('Logout successful');
      return { error: null };
    } catch (error) {
      console.error('Unexpected logout error:', error);
      return {
        error: { message: 'ログアウト中に予期しないエラーが発生しました' } as AuthError,
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
        error: { message: 'ユーザー情報の取得中にエラーが発生しました' } as AuthError,
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