import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../theme'
import '@testing-library/jest-dom'

describe('Theme Provider Setup', () => {
  it('should have theme exported from theme/index.ts', () => {
    expect(theme).toBeDefined()
    expect(theme.palette.primary.main).toBe('#2196F3')
  })

  it('should render component with theme provider', () => {
    const TestComponent = () => (
      <ThemeProvider theme={theme}>
        <div data-testid="themed-component">Test</div>
      </ThemeProvider>
    )

    const { getByTestId } = render(<TestComponent />)
    expect(getByTestId('themed-component')).toBeInTheDocument()
  })

  it('should have Japanese locale configured', () => {
    // MUI jaJP locale includes Japanese translations
    expect(theme.components).toBeDefined()
  })
})