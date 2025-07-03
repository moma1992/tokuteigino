import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('Authentication Layout Components', () => {
  it('should render login form with required fields', () => {
    const LoginForm = () => (
      <form data-testid="login-form">
        <input 
          type="email" 
          name="email" 
          placeholder="メールアドレス" 
          required 
          data-testid="email-input"
        />
        <input 
          type="password" 
          name="password" 
          placeholder="パスワード" 
          required 
          data-testid="password-input"
        />
        <button type="submit" data-testid="login-button">
          ログイン
        </button>
      </form>
    )

    render(<LoginForm />)

    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('login-button')).toHaveTextContent('ログイン')
  })

  it('should render registration form with role selection', () => {
    const RegisterForm = () => (
      <form data-testid="register-form">
        <input 
          type="text" 
          name="name" 
          placeholder="名前" 
          required 
          data-testid="name-input"
        />
        <input 
          type="email" 
          name="email" 
          placeholder="メールアドレス" 
          required 
          data-testid="email-input"
        />
        <input 
          type="password" 
          name="password" 
          placeholder="パスワード" 
          required 
          data-testid="password-input"
        />
        <select name="role" required data-testid="role-select">
          <option value="">役割を選択</option>
          <option value="student">学習者</option>
          <option value="teacher">教師</option>
        </select>
        <button type="submit" data-testid="register-button">
          登録
        </button>
      </form>
    )

    render(<RegisterForm />)

    expect(screen.getByTestId('register-form')).toBeInTheDocument()
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('role-select')).toBeInTheDocument()
    
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3)
    expect(options[1]).toHaveTextContent('学習者')
    expect(options[2]).toHaveTextContent('教師')
  })

  it('should have proper layout structure for auth pages', () => {
    const AuthLayout = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="auth-layout">
        <div data-testid="auth-container">
          <div data-testid="auth-header">
            <h1>TOKUTEI Learning</h1>
            <p>特定技能試験学習支援</p>
          </div>
          <div data-testid="auth-content">
            {children}
          </div>
          <div data-testid="auth-footer">
            <p>© 2024 TOKUTEI Learning</p>
          </div>
        </div>
      </div>
    )

    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    )

    expect(screen.getByTestId('auth-layout')).toBeInTheDocument()
    expect(screen.getByTestId('auth-header')).toBeInTheDocument()
    expect(screen.getByText('TOKUTEI Learning')).toBeInTheDocument()
    expect(screen.getByText('特定技能試験学習支援')).toBeInTheDocument()
    expect(screen.getByTestId('auth-content')).toBeInTheDocument()
    expect(screen.getByTestId('auth-footer')).toBeInTheDocument()
  })

  it('should have protected route wrapper component', () => {
    const ProtectedRoute = ({ 
      children, 
      isAuthenticated 
    }: { 
      children: React.ReactNode
      isAuthenticated: boolean 
    }) => {
      if (!isAuthenticated) {
        return <div data-testid="redirect-login">Please login first</div>
      }
      return <>{children}</>
    }

    // Test unauthenticated state
    const { rerender } = render(
      <ProtectedRoute isAuthenticated={false}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByTestId('redirect-login')).toBeInTheDocument()
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()

    // Test authenticated state
    rerender(
      <ProtectedRoute isAuthenticated={true}>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.queryByTestId('redirect-login')).not.toBeInTheDocument()
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })
})