import apiClient from "./api";

export const votesService = {
  vote: async (targetId, targetType, voteType) => {
    const payload = {
      vote_type: voteType, // 'upvote' or 'downvote'
    };
    // Set the appropriate field based on target type
    if (targetType === "question") {
      payload.question_id = targetId;
    } else if (targetType === "answer") {
      payload.answer_id = targetId;
    }
    const response = await apiClient.post("/votes/", payload);
    return response.data;
  },

  removeVote: async (voteId) => {
    await apiClient.delete(`/votes/${voteId}/`);
  },
};
