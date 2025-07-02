import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />)
    
    // Check if the app renders some content
    expect(container).toBeTruthy()
  })

  it('renders app component', () => {
    const { container } = render(<App />)
    
    // Basic test that the component renders
    expect(container.firstChild).toBeTruthy()
  })
})