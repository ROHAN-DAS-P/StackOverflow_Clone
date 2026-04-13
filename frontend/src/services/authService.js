import apiClient from "./api";

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post("/auth/register/", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/auth/login/", credentials);
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  getProfile: async (userId) => {
    const response = await apiClient.get(`/users/${userId}/`);
    return response.data;
  },

  updateProfile: async (userId, data) => {
    const response = await apiClient.put(`/users/${userId}/`, data);
    return response.data;
  },
};
