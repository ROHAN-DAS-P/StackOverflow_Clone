import apiClient from './api'

export const statsService = {
  get: async () => {
    const response = await apiClient.get('/stats/')
    return response.data
  },
}
