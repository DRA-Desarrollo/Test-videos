import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Question } from '../types/question';

interface TestState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: { [key: number]: number | null }; // { questionIndex: optionIndex }
  score: number;
  isCompleted: boolean;
  setQuestions: (questions: Question[]) => void;
  selectAnswer: (questionIndex: number, optionIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  resetTest: () => void;
  calculateScore: () => void;
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: {},
      score: 0,
      isCompleted: false,
      setQuestions: (questions) => set({ questions, currentQuestionIndex: 0, userAnswers: {}, score: 0, isCompleted: false }),
      selectAnswer: (questionIndex, optionIndex) => {
        set((state) => ({
          userAnswers: {
            ...state.userAnswers,
            [questionIndex]: optionIndex,
          },
        }));
      },
      nextQuestion: () => {
        set((state) => {
          const nextIndex = state.currentQuestionIndex + 1;
          if (nextIndex < state.questions.length) {
            return { currentQuestionIndex: nextIndex };
          }
          return {}; // No avanzar si ya es la última pregunta
        });
      },
      previousQuestion: () => {
        set((state) => {
          const prevIndex = state.currentQuestionIndex - 1;
          if (prevIndex >= 0) {
            return { currentQuestionIndex: prevIndex };
          }
          return {}; // No retroceder si ya es la primera pregunta
        });
      },
      resetTest: () => set({ questions: [], currentQuestionIndex: 0, userAnswers: {}, score: 0, isCompleted: false }),
      calculateScore: () => {
        const state = get();
        let correctCount = 0;
        state.questions.forEach((question, index) => {
          if (state.userAnswers[index] === question.correct_option_index) {
            correctCount++;
          }
        });
        const newScore = (correctCount / state.questions.length) * 100 || 0;
        set({ score: newScore, isCompleted: true });
      },
    }),
    {
      name: 'test-progress', // nombre para el localStorage
      storage: createJSONStorage(() => localStorage), // Usar createJSONStorage
      partialize: (state) => ({
        questions: state.questions,
        currentQuestionIndex: state.currentQuestionIndex,
        userAnswers: state.userAnswers,
        score: state.score,
        isCompleted: state.isCompleted,
      }),
    }
  )
);
