import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LearningProgress {
  questionsAttempted: number
  correctAnswers: number
  streak: number
  lastPracticeDate: string | null
  dailyQuestionCount: number
  dailyQuestionLimit: number
}

interface ProgressState extends LearningProgress {
  incrementAttempted: () => void
  recordCorrectAnswer: () => void
  recordIncorrectAnswer: () => void
  resetStreak: () => void
  updateLastPracticeDate: () => void
  resetDailyCount: () => void
  setDailyLimit: (limit: number) => void
  canPracticeToday: () => boolean
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      questionsAttempted: 0,
      correctAnswers: 0,
      streak: 0,
      lastPracticeDate: null,
      dailyQuestionCount: 0,
      dailyQuestionLimit: 10, // Free plan default
      
      incrementAttempted: () => set((state) => ({ 
        questionsAttempted: state.questionsAttempted + 1,
        dailyQuestionCount: state.dailyQuestionCount + 1
      })),
      
      recordCorrectAnswer: () => set((state) => ({ 
        correctAnswers: state.correctAnswers + 1,
        streak: state.streak + 1,
        questionsAttempted: state.questionsAttempted + 1,
        dailyQuestionCount: state.dailyQuestionCount + 1
      })),
      
      recordIncorrectAnswer: () => set((state) => ({ 
        streak: 0,
        questionsAttempted: state.questionsAttempted + 1,
        dailyQuestionCount: state.dailyQuestionCount + 1
      })),
      
      resetStreak: () => set({ streak: 0 }),
      
      updateLastPracticeDate: () => {
        const today = new Date().toISOString().split('T')[0]
        const state = get()
        
        // Reset daily count if it's a new day
        if (state.lastPracticeDate !== today) {
          set({ 
            lastPracticeDate: today,
            dailyQuestionCount: 0
          })
        } else {
          set({ lastPracticeDate: today })
        }
      },
      
      resetDailyCount: () => set({ dailyQuestionCount: 0 }),
      
      setDailyLimit: (limit) => set({ dailyQuestionLimit: limit }),
      
      canPracticeToday: () => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]
        
        // Reset count if it's a new day
        if (state.lastPracticeDate !== today) {
          return true
        }
        
        return state.dailyQuestionCount < state.dailyQuestionLimit
      },
    }),
    {
      name: 'progress-storage',
    }
  )
)