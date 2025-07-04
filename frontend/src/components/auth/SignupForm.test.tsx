import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SignupForm } from './SignupForm';
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

describe('SignupForm', () => {
  const mockSignup = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      signup: mockSignup,
      isLoading: false,
      error: null,
    } as any);
  });

  const renderSignupForm = () => {
    return render(
      <BrowserRouter>
        <SignupForm />
      </BrowserRouter>
    );
  };

  it('should render signup form with all fields', () => {
    renderSignupForm();

    expect(screen.getByText('アカウント作成')).toBeInTheDocument();
    expect(screen.getByLabelText('氏名')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
    expect(screen.getByLabelText('学習者')).toBeInTheDocument();
    expect(screen.getByLabelText('教師')).toBeInTheDocument();
  });

  describe('form validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const submitButton = screen.getByRole('button', { name: 'アカウントを作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('氏名を入力してください')).toBeInTheDocument();
        expect(screen.getByText('メールアドレスを入力してください')).toBeInTheDocument();
        expect(screen.getByText('パスワードは8文字以上で入力してください')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const emailInput = screen.getByLabelText('メールアドレス');
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
      });
    });

    it('should validate password match', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      const passwordInput = screen.getByLabelText('パスワード');
      const confirmPasswordInput = screen.getByLabelText('パスワード（確認）');

      await user.type(passwordInput, 'Test123456!');
      await user.type(confirmPasswordInput, 'Different123!');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();
      });
    });

    it('should require organization name for teachers', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      // Select teacher role
      const teacherRadio = screen.getByLabelText('教師');
      await user.click(teacherRadio);

      // Should show organization field
      expect(screen.getByLabelText('組織名')).toBeInTheDocument();

      // Try to submit without organization
      const submitButton = screen.getByRole('button', { name: 'アカウントを作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('組織名を入力してください')).toBeInTheDocument();
      });
    });
  });

  describe('role selection', () => {
    it('should default to student role', () => {
      renderSignupForm();

      const studentRadio = screen.getByLabelText('学習者') as HTMLInputElement;
      const teacherRadio = screen.getByLabelText('教師') as HTMLInputElement;

      expect(studentRadio.checked).toBe(true);
      expect(teacherRadio.checked).toBe(false);
    });

    it('should show organization field when teacher is selected', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      // Initially no organization field
      expect(screen.queryByLabelText('組織名')).not.toBeInTheDocument();

      // Select teacher role
      const teacherRadio = screen.getByLabelText('教師');
      await user.click(teacherRadio);

      // Should show organization field
      expect(screen.getByLabelText('組織名')).toBeInTheDocument();
    });

    it('should hide organization field when switching back to student', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      // Select teacher role
      const teacherRadio = screen.getByLabelText('教師');
      await user.click(teacherRadio);
      expect(screen.getByLabelText('組織名')).toBeInTheDocument();

      // Switch back to student
      const studentRadio = screen.getByLabelText('学習者');
      await user.click(studentRadio);
      expect(screen.queryByLabelText('組織名')).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should submit student signup successfully', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      await user.type(screen.getByLabelText('氏名'), 'Test Student');
      await user.type(screen.getByLabelText('メールアドレス'), 'student@test.com');
      await user.type(screen.getByLabelText('パスワード'), 'Test123456!');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'Test123456!');

      const submitButton = screen.getByRole('button', { name: 'アカウントを作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          email: 'student@test.com',
          password: 'Test123456!',
          fullName: 'Test Student',
          role: 'student',
        });
      });
    });

    it('should submit teacher signup successfully', async () => {
      const user = userEvent.setup();
      renderSignupForm();

      await user.click(screen.getByLabelText('教師'));
      await user.type(screen.getByLabelText('氏名'), 'Test Teacher');
      await user.type(screen.getByLabelText('メールアドレス'), 'teacher@test.com');
      await user.type(screen.getByLabelText('パスワード'), 'Test123456!');
      await user.type(screen.getByLabelText('パスワード（確認）'), 'Test123456!');
      await user.type(screen.getByLabelText('組織名'), 'Test School');

      const submitButton = screen.getByRole('button', { name: 'アカウントを作成' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith({
          email: 'teacher@test.com',
          password: 'Test123456!',
          fullName: 'Test Teacher',
          role: 'teacher',
          organizationName: 'Test School',
        });
      });
    });
  });

  it('should show loading state during signup', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      signup: mockSignup,
      isLoading: true,
      error: null,
    } as any);

    renderSignupForm();

    const submitButton = screen.getByRole('button', { name: '作成中...' });
    expect(submitButton).toBeDisabled();
  });

  it('should display error message on signup failure', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      signup: mockSignup,
      isLoading: false,
      error: { message: 'このメールアドレスは既に使用されています' },
    } as any);

    renderSignupForm();

    expect(screen.getByText('このメールアドレスは既に使用されています')).toBeInTheDocument();
  });

  it('should navigate to login page', async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const loginLink = screen.getByText('ログインする');
    await user.click(loginLink);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    renderSignupForm();

    const passwordInput = screen.getByLabelText('パスワード') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('パスワード（確認）') as HTMLInputElement;
    
    // Find visibility toggle buttons
    const toggleButtons = screen.getAllByRole('button', { name: /パスワードを表示/ });

    expect(passwordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');

    // Toggle first password field
    await user.click(toggleButtons[0]);
    expect(passwordInput.type).toBe('text');

    // Toggle second password field
    await user.click(toggleButtons[1]);
    expect(confirmPasswordInput.type).toBe('text');
  });
});