import { create } from "zustand";

export const useQuestionsStore = create((set) => ({
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
  totalCount: 0,
  page: 1,

  setQuestions: (questions, totalCount) => set({ questions, totalCount }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setPage: (page) => set({ page }),

  addQuestion: (question) =>
    set((state) => ({
      questions: [question, ...state.questions],
      totalCount: state.totalCount + 1,
    })),

  updateQuestion: (updatedQuestion) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === updatedQuestion.id ? updatedQuestion : q,
      ),
      currentQuestion:
        state.currentQuestion?.id === updatedQuestion.id
          ? updatedQuestion
          : state.currentQuestion,
    })),

  deleteQuestion: (questionId) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== questionId),
      totalCount: state.totalCount - 1,
    })),
}));
