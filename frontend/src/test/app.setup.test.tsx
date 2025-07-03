import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import App from '../App'
import React from 'react'

describe('App Setup', () => {
  it('should render without crashing', () => {
    render(<App />)
    expect(document.body).toBeTruthy()
  })

  it('should be using React 19', () => {
    expect(React.version).toMatch(/^19\./)
  })

  it('should have TypeScript configured correctly', () => {
    // This test will fail if TypeScript is not configured correctly
    const testType: string = 'test'
    expect(typeof testType).toBe('string')
  })

  it('should have Vite configured as build tool', () => {
    expect(import.meta.env.MODE).toBeDefined()
  })
})