import apiClient from "./api";

export const answersService = {
  getByQuestion: async (questionId) => {
    const response = await apiClient.get(`/answers/?question_id=${questionId}`);
    return response.data;
  },

  create: async (answerData) => {
    const response = await apiClient.post("/answers/", answerData);
    return response.data;
  },

  update: async (id, answerData) => {
    const response = await apiClient.put(`/answers/${id}/`, answerData);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/answers/${id}/`);
  },

  acceptBest: async (answerId) => {
    const response = await apiClient.post(`/answers/${answerId}/accept/`);
    return response.data;
  },
};
