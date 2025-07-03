import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Button, CssBaseline } from '@mui/material'
import '@testing-library/jest-dom'

describe('Material-UI Integration', () => {
  it('should have MUI installed and importable', () => {
    expect(ThemeProvider).toBeDefined()
    expect(createTheme).toBeDefined()
    expect(Button).toBeDefined()
    expect(CssBaseline).toBeDefined()
  })

  it('should render MUI Button component', () => {
    render(
      <Button data-testid="mui-button">Test Button</Button>
    )
    
    const button = screen.getByTestId('mui-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Test Button')
  })

  it('should apply custom theme correctly', () => {
    const theme = createTheme({
      palette: {
        primary: {
          main: '#1976d2',
        },
        secondary: {
          main: '#dc004e',
        },
      },
    })

    render(
      <ThemeProvider theme={theme}>
        <Button color="primary" data-testid="themed-button">
          Themed Button
        </Button>
      </ThemeProvider>
    )

    const button = screen.getByTestId('themed-button')
    expect(button).toBeInTheDocument()
  })

  it('should have correct theme structure for TOKUTEI Learning', () => {
    const theme = createTheme({
      palette: {
        mode: 'light',
        primary: {
          main: '#2196F3', // Blue for learning
        },
        secondary: {
          main: '#FF5722', // Orange for actions
        },
        success: {
          main: '#4CAF50', // Green for correct answers
        },
        error: {
          main: '#F44336', // Red for incorrect answers
        },
      },
      typography: {
        fontFamily: [
          'Noto Sans JP',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
      },
    })

    expect(theme.palette.primary.main).toBe('#2196F3')
    expect(theme.palette.secondary.main).toBe('#FF5722')
    expect(theme.palette.success.main).toBe('#4CAF50')
    expect(theme.palette.error.main).toBe('#F44336')
    expect(theme.typography.fontFamily).toContain('Noto Sans JP')
  })
})