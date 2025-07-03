import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'

describe('React Query Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  it('should have React Query installed and importable', () => {
    expect(QueryClient).toBeDefined()
    expect(QueryClientProvider).toBeDefined()
    expect(useQuery).toBeDefined()
    expect(useMutation).toBeDefined()
  })

  it('should create QueryClient instance', () => {
    const client = new QueryClient()
    expect(client).toBeInstanceOf(QueryClient)
  })

  it('should fetch data using useQuery', async () => {
    const mockData = { id: 1, name: 'Test Question' }
    const queryFn = vi.fn().mockResolvedValue(mockData)

    const TestComponent = () => {
      const { data, isLoading, isError } = useQuery({
        queryKey: ['test'],
        queryFn,
      })

      if (isLoading) return <div>Loading...</div>
      if (isError) return <div>Error</div>
      
      return <div data-testid="data">{data?.name}</div>
    }

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('Test Question')
    })

    expect(queryFn).toHaveBeenCalledTimes(1)
  })

  it('should handle mutations with useMutation', async () => {
    const mockMutationFn = vi.fn().mockResolvedValue({ success: true })
    
    const TestComponent = () => {
      const mutation = useMutation({
        mutationFn: mockMutationFn,
      })

      return (
        <div>
          <button onClick={() => mutation.mutate({ answer: 'test' })}>
            Submit Answer
          </button>
          {mutation.isPending && <div>Submitting...</div>}
          {mutation.isSuccess && <div>Success!</div>}
          {mutation.isError && <div>Error!</div>}
        </div>
      )
    }

    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    )

    const button = getByText('Submit Answer')
    button.click()

    await waitFor(() => {
      expect(getByText('Success!')).toBeInTheDocument()
    })

    expect(mockMutationFn).toHaveBeenCalledWith({ answer: 'test' })
  })

  it('should have proper query structure for TOKUTEI Learning API', async () => {
    // Mock API endpoints
    const mockQuestions = [
      { id: 1, text: 'What is 特定技能?', answer: 'Specified Skilled Worker' },
      { id: 2, text: 'What is 在留資格?', answer: 'Status of Residence' },
    ]

    const mockUserProgress = {
      questionsAttempted: 50,
      correctAnswers: 40,
      accuracy: 0.8,
    }

    // Test questions query
    const useQuestions = () => {
      return useQuery({
        queryKey: ['questions'],
        queryFn: async () => mockQuestions,
      })
    }

    // Test user progress query
    const useUserProgress = () => {
      return useQuery({
        queryKey: ['user', 'progress'],
        queryFn: async () => mockUserProgress,
      })
    }

    // Test submit answer mutation
    // const useSubmitAnswer = () => {
    //   return useMutation({
    //     mutationFn: async (data: { questionId: number; answer: string }) => {
    //       return { correct: true, explanation: 'Good job!' }
    //     },
    //     onSuccess: () => {
    //       // Invalidate progress query on success
    //       queryClient.invalidateQueries({ queryKey: ['user', 'progress'] })
    //     },
    //   })
    // }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    // Test questions hook
    const { result: questionsResult } = renderHook(() => useQuestions(), { wrapper })
    
    await waitFor(() => {
      expect(questionsResult.current.isSuccess).toBe(true)
    })
    
    expect(questionsResult.current.data).toEqual(mockQuestions)

    // Test progress hook
    const { result: progressResult } = renderHook(() => useUserProgress(), { wrapper })
    
    await waitFor(() => {
      expect(progressResult.current.isSuccess).toBe(true)
    })
    
    expect(progressResult.current.data).toEqual(mockUserProgress)
  })
})