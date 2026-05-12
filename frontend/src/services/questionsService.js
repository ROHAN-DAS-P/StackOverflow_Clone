import apiClient from "./api";

export const questionsService = {
  getAll: async (page = 1, search = "", tag = "") => {
    const params = new URLSearchParams();
    params.append("page", page);
    if (search) params.append("search", search);
    if (tag) params.append("tag", tag);

    const response = await apiClient.get(`/questions/?${params.toString()}`);
    return response.data;
  },

  getTrending: async () => {
    const response = await apiClient.get("/questions/trending/");
    return response.data;
  },

  getUnanswered: async (page = 1) => {
    const response = await apiClient.get(`/questions/unanswered/?page=${page}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/questions/${id}/`);
    return response.data;
  },

  create: async (questionData) => {
    const response = await apiClient.post("/questions/", questionData);
    return response.data;
  },

  update: async (id, questionData) => {
    const response = await apiClient.put(`/questions/${id}/`, questionData);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/questions/${id}/`);
  },

  search: async (query) => {
    const response = await apiClient.get(
      `/search/?q=${encodeURIComponent(query)}`,
    );
    return response.data;
  },

  vote: async (questionId, voteType) => {
    const response = await apiClient.post("/votes/", {
      question_id: questionId,
      vote_type: voteType, // 'upvote' or 'downvote'
    });
    return response.data;
  },

  suggestions: async (query, signal) => {
    if (!query || query.length < 2) return { questions: [] };
    const response = await apiClient.get(
      `/search/?q=${encodeURIComponent(query)}`,
      signal ? { signal } : undefined,
    );
    return response.data;
  },
};
