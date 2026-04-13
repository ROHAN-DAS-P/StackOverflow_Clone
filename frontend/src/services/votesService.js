import apiClient from "./api";

export const votesService = {
  vote: async (targetId, targetType, voteType) => {
    const response = await apiClient.post("/votes/", {
      target_id: targetId,
      target_type: targetType, // 'question' or 'answer'
      vote_type: voteType, // 'upvote' or 'downvote'
    });
    return response.data;
  },

  removeVote: async (voteId) => {
    await apiClient.delete(`/votes/${voteId}/`);
  },
};
