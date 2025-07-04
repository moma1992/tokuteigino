import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { useAuthStore } from '../../store/authStore';

// Mock auth store
vi.mock('../../store/authStore');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
    } as any);
  });

  const renderLoginForm = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );
  };

  it('should render login form with all fields', () => {
    renderLoginForm();

    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByText('パスワードを忘れた方')).toBeInTheDocument();
    expect(screen.getByText('アカウントをお持ちでない方')).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText('メールアドレス');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    // Invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    });
  });

  it('should validate password requirements', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('パスワードは8文字以上で入力してください')).toBeInTheDocument();
    });
  });

  it('should submit form with valid credentials', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Test123456!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Test123456!',
      });
    });
  });

  it('should show loading state during login', async () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
    } as any);

    renderLoginForm();

    const submitButton = screen.getByRole('button', { name: 'ログイン中...' });
    expect(submitButton).toBeDisabled();
  });

  it('should display error message on login failure', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: { message: 'メールアドレスまたはパスワードが間違っています' },
    } as any);

    renderLoginForm();

    expect(screen.getByText('メールアドレスまたはパスワードが間違っています')).toBeInTheDocument();
  });

  it('should navigate to home on successful login', async () => {
    const user = userEvent.setup();
    
    mockLogin.mockImplementation(async () => {
      vi.mocked(useAuthStore).mockReturnValue({
        login: mockLogin,
        isLoading: false,
        error: null,
        isAuthenticated: true,
      } as any);
    });

    renderLoginForm();

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Test123456!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const passwordInput = screen.getByLabelText('パスワード') as HTMLInputElement;
    const visibilityToggle = screen.getByRole('button', { name: /パスワードを表示/ });

    expect(passwordInput.type).toBe('password');

    await user.click(visibilityToggle);
    expect(passwordInput.type).toBe('text');

    await user.click(visibilityToggle);
    expect(passwordInput.type).toBe('password');
  });

  it('should navigate to signup page', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const signupLink = screen.getByText('アカウントを作成');
    await user.click(signupLink);

    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('should navigate to password reset page', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    const resetLink = screen.getByText('パスワードを忘れた方');
    await user.click(resetLink);

    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });
});