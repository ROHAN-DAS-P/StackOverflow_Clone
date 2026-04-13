import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  loadTokenFromStorage: () => {
    const token = localStorage.getItem("access_token");
    const user = localStorage.getItem("user");
    if (token && user) {
      set({ token, user: JSON.parse(user) });
    }
  },

  setToken: (token, user) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
