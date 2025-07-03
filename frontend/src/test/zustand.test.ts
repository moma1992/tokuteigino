import { describe, it, expect } from 'vitest'
import { create } from 'zustand'
import { renderHook, act } from '@testing-library/react'

describe('Zustand State Management', () => {
  it('should have Zustand installed and importable', () => {
    expect(create).toBeDefined()
    expect(typeof create).toBe('function')
  })

  it('should create a basic store with TypeScript', () => {
    interface CounterState {
      count: number
      increment: () => void
      decrement: () => void
      reset: () => void
    }

    const useCounterStore = create<CounterState>((set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
      reset: () => set({ count: 0 }),
    }))

    const { result } = renderHook(() => useCounterStore())

    expect(result.current.count).toBe(0)

    act(() => {
      result.current.increment()
    })
    expect(result.current.count).toBe(1)

    act(() => {
      result.current.decrement()
    })
    expect(result.current.count).toBe(0)

    act(() => {
      result.current.reset()
    })
    expect(result.current.count).toBe(0)
  })

  it('should have proper auth store structure for TOKUTEI Learning', () => {
    interface User {
      id: string
      email: string
      role: 'student' | 'teacher'
      name: string
    }

    interface AuthState {
      user: User | null
      isAuthenticated: boolean
      isLoading: boolean
      login: (user: User) => void
      logout: () => void
      setLoading: (loading: boolean) => void
    }

    const useAuthStore = create<AuthState>((set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }))

    const { result } = renderHook(() => useAuthStore())

    // Initial state
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)

    // Login test
    const testUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'student',
      name: 'Test User',
    }

    act(() => {
      result.current.login(testUser)
    })

    expect(result.current.user).toEqual(testUser)
    expect(result.current.isAuthenticated).toBe(true)

    // Logout test
    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should have learning progress store for students', () => {
    interface LearningProgress {
      questionsAttempted: number
      correctAnswers: number
      streak: number
      lastPracticeDate: string | null
    }

    interface ProgressState extends LearningProgress {
      incrementAttempted: () => void
      recordCorrectAnswer: () => void
      recordIncorrectAnswer: () => void
      resetStreak: () => void
      updateLastPracticeDate: () => void
    }

    const useProgressStore = create<ProgressState>((set) => ({
      questionsAttempted: 0,
      correctAnswers: 0,
      streak: 0,
      lastPracticeDate: null,
      incrementAttempted: () => set((state) => ({ 
        questionsAttempted: state.questionsAttempted + 1 
      })),
      recordCorrectAnswer: () => set((state) => ({ 
        correctAnswers: state.correctAnswers + 1,
        streak: state.streak + 1,
        questionsAttempted: state.questionsAttempted + 1
      })),
      recordIncorrectAnswer: () => set((state) => ({ 
        streak: 0,
        questionsAttempted: state.questionsAttempted + 1
      })),
      resetStreak: () => set({ streak: 0 }),
      updateLastPracticeDate: () => set({ 
        lastPracticeDate: new Date().toISOString() 
      }),
    }))

    const { result } = renderHook(() => useProgressStore())

    // Initial state
    expect(result.current.questionsAttempted).toBe(0)
    expect(result.current.correctAnswers).toBe(0)
    expect(result.current.streak).toBe(0)

    // Record correct answers
    act(() => {
      result.current.recordCorrectAnswer()
      result.current.recordCorrectAnswer()
    })

    expect(result.current.questionsAttempted).toBe(2)
    expect(result.current.correctAnswers).toBe(2)
    expect(result.current.streak).toBe(2)

    // Record incorrect answer
    act(() => {
      result.current.recordIncorrectAnswer()
    })

    expect(result.current.questionsAttempted).toBe(3)
    expect(result.current.correctAnswers).toBe(2)
    expect(result.current.streak).toBe(0)
  })
})