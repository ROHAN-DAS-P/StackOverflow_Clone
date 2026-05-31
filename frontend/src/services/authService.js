import apiClient from "./api";

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post("/auth/register/", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/auth/login/", credentials);

    // Extract access token from the tokens object
    const accessToken =
      response.data.tokens?.access_token || response.data.access;

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return {
      access: accessToken,
      user: response.data.user,
      ...response.data,
    };
  },

  googleLogin: async (token) => {
    const response = await apiClient.post("/auth/google/", { token });

    // Extract access token from the tokens object
    const accessToken =
      response.data.tokens?.access_token || response.data.access;

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return {
      access: accessToken,
      user: response.data.user,
      ...response.data,
    };
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
