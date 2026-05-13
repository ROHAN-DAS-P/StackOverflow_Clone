import apiClient from "./api";

/** Coalesce parallel/StrictMode trending calls; cache successes to reduce 429 rate limits. */
let membersInflight = null;
let membersCache = null;
let membersExpiresAt = 0;
let membersBackoffUntil = 0;
const MEMBERS_CACHE_MS = 180_000; // 3 minutes
const MEMBERS_BACKOFF_MS = 60_000;

export const communityMembersService = {
  /**
   * Get list of active community members
   * @param {number} limit - Number of members to fetch (default: 10)
   * @param {string} sort - Sort order: 'reputation', 'recent', or 'answers' (default: 'reputation')
   * @returns {Promise} Response with community members data
   */
  getActiveMembers: async (limit = 10, sort = "reputation") => {
    const now = Date.now();

    // Check backoff period
    if (now < membersBackoffUntil) {
      return membersCache ?? { success: false, data: [] };
    }

    // Check cache
    if (membersCache && now < membersExpiresAt) {
      return membersCache;
    }

    // Return existing inflight request
    if (membersInflight) {
      return membersInflight;
    }

    // Make new request
    membersInflight = apiClient
      .get("/community-members/", {
        params: {
          limit: Math.min(Math.max(limit, 1), 100),
          sort: sort,
        },
      })
      .then((response) => {
        membersCache = response.data;
        membersExpiresAt = Date.now() + MEMBERS_CACHE_MS;
        membersBackoffUntil = 0;
        return membersCache;
      })
      .catch((err) => {
        if (err?.response?.status === 429) {
          membersBackoffUntil = Date.now() + MEMBERS_BACKOFF_MS;
        }
        console.error("Failed to fetch community members:", err);
        return membersCache ?? { success: false, data: [] };
      })
      .finally(() => {
        membersInflight = null;
      });

    return membersInflight;
  },

  /**
   * Invalidate the members cache
   */
  invalidateCache: () => {
    membersCache = null;
    membersExpiresAt = 0;
  },

  /**
   * Get member profile details
   * @param {string} userId - User ID
   * @returns {Promise} User profile data
   */
  getMemberProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch member profile for ${userId}:`, error);
      throw error;
    }
  },
};
