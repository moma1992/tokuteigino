import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Test component to verify navigation
const NavigationTest = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  return (
    <div>
      <p data-testid="current-path">{location.pathname}</p>
      <button onClick={() => navigate('/practice')}>Go to Practice</button>
    </div>
  )
}

describe('React Router v6 Integration', () => {
  it('should have React Router v6 installed and importable', () => {
    expect(BrowserRouter).toBeDefined()
    expect(Routes).toBeDefined()
    expect(Route).toBeDefined()
    expect(Link).toBeDefined()
    expect(useNavigate).toBeDefined()
    expect(useLocation).toBeDefined()
  })

  it('should render routes correctly', () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/practice" element={<div>Practice Page</div>} />
          <Route path="/study" element={<div>Study Page</div>} />
          <Route path="/profile" element={<div>Profile Page</div>} />
        </Routes>
      </BrowserRouter>
    )

    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })

  it('should navigate between routes using Link component', async () => {
    const user = userEvent.setup()
    
    render(
      <BrowserRouter>
        <div>
          <Link to="/practice">Practice Link</Link>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/practice" element={<div>Practice Page</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    )

    expect(screen.getByText('Home Page')).toBeInTheDocument()
    
    await user.click(screen.getByText('Practice Link'))
    
    expect(screen.getByText('Practice Page')).toBeInTheDocument()
  })

  it('should navigate programmatically using useNavigate', async () => {
    const user = userEvent.setup()
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NavigationTest />} />
          <Route path="/practice" element={<div>Practice Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('current-path')).toHaveTextContent('/')
    
    await user.click(screen.getByText('Go to Practice'))
    
    expect(screen.getByText('Practice Page')).toBeInTheDocument()
  })

  it('should have proper route structure for TOKUTEI Learning', () => {
    const routes = [
      { path: '/', name: 'Home' },
      { path: '/login', name: 'Login' },
      { path: '/register', name: 'Register' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/practice', name: 'Practice' },
      { path: '/study', name: 'Study' },
      { path: '/progress', name: 'Progress' },
      { path: '/profile', name: 'Profile' },
      { path: '/teacher', name: 'Teacher Dashboard' },
      { path: '/teacher/students', name: 'Student Management' },
      { path: '/teacher/materials', name: 'Material Management' },
      { path: '/subscription', name: 'Subscription' },
    ]

    // Test that routes can be defined without errors
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          {routes.map(route => (
            <Route 
              key={route.path} 
              path={route.path} 
              element={<div data-testid={`route-${route.path}`}>{route.name}</div>} 
            />
          ))}
        </Routes>
      </MemoryRouter>
    )
    
    // Verify the default route renders
    expect(screen.getByTestId('route-/')).toHaveTextContent('Home')
  })
})