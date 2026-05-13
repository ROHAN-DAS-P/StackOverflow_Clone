# Community Members Feature - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BROWSER (FRONTEND)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      Layout.jsx (Main Container)                      │   │
│  │                                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                     Sidebar Component                         │    │   │
│  │  │                                                               │    │   │
│  │  │  ┌────────────────────────────────────────────────────┐     │    │   │
│  │  │  │        SidebarPanel.jsx (Navigation)              │     │    │   │
│  │  │  │  ┌─────────────────────────────────────────────┐  │     │    │   │
│  │  │  │  │  Navigation Items (Home, Questions, etc.)  │  │     │    │   │
│  │  │  │  └─────────────────────────────────────────────┘  │     │    │   │
│  │  │  │                                                    │     │    │   │
│  │  │  │  ┌─────────────────────────────────────────────┐  │     │    │   │
│  │  │  │  │   COMMUNITY MEMBERS SECTION  ← NEW!        │  │     │    │   │
│  │  │  │  │  ┌───────────────────────────────────────┐ │  │     │    │   │
│  │  │  │  │  │ CommunityMembers.jsx (Component)     │ │  │     │    │   │
│  │  │  │  │  │                                       │ │  │     │    │   │
│  │  │  │  │  │ • Fetch members via service          │ │  │     │    │   │
│  │  │  │  │  │ • Sort buttons (Top/Helpers/Active)  │ │  │     │    │   │
│  │  │  │  │  │ • Display member cards                │ │  │     │    │   │
│  │  │  │  │  │ • Loading skeletons                   │ │  │     │    │   │
│  │  │  │  │  │ • Error handling                      │ │  │     │    │   │
│  │  │  │  │  └───────────────────────────────────────┘ │  │     │    │   │
│  │  │  │  │           │                                  │  │     │    │   │
│  │  │  │  │           └──→ [Member Cards]               │  │     │    │   │
│  │  │  │  │               - Avatar                       │  │     │    │   │
│  │  │  │  │               - Username (click → profile)   │  │     │    │   │
│  │  │  │  │               - Reputation                   │  │     │    │   │
│  │  │  │  │               - Contribution count           │  │     │    │   │
│  │  │  │  │               - Verified badge              │  │     │    │   │
│  │  │  │  └─────────────────────────────────────────────┘  │     │    │   │
│  │  │  │                                                    │     │    │   │
│  │  │  │  ┌─────────────────────────────────────────────┐  │     │    │   │
│  │  │  │  │   Trending Tags Section                    │  │     │    │   │
│  │  │  │  └─────────────────────────────────────────────┘  │     │    │   │
│  │  │  └────────────────────────────────────────────────────┘     │    │   │
│  │  │                                                               │    │   │
│  │  └───────────────────────────────────────────────────────────────┘    │   │
│  │                                                                        │   │
│  │  ┌──────────────────────────────────────────────────────────────┐    │   │
│  │  │              Main Content Area                               │    │   │
│  │  │  (Home, Questions, Search, etc.)                            │    │   │
│  │  └──────────────────────────────────────────────────────────────┘    │   │
│  │                                                                        │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │              Frontend Services Layer                                     │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │   │
│  │  │  communityMembersService.js  ← NEW!                             │  │   │
│  │  │  ┌────────────────────────────────────────────────────────────┐ │  │   │
│  │  │  │ Functions:                                                 │ │  │   │
│  │  │  │  • getActiveMembers(limit, sort)                          │ │  │   │
│  │  │  │  • invalidateCache()                                       │ │  │   │
│  │  │  │  • getMemberProfile(userId)                                │ │  │   │
│  │  │  │                                                            │ │  │   │
│  │  │  │ Features:                                                 │ │  │   │
│  │  │  │  • Smart request coalescing                               │ │  │   │
│  │  │  │  • Response caching (3 min TTL)                           │ │  │   │
│  │  │  │  • Rate limit backoff (60 sec)                            │ │  │   │
│  │  │  └────────────────────────────────────────────────────────────┘ │  │   │
│  │  │                          │                                       │  │   │
│  │  │                          └──→ apiClient (Axios)                  │  │   │
│  │  └──────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │   │
│  │  │  authService.js                                                 │  │   │
│  │  │  (Used for profile fetching)                                    │  │   │
│  │  └──────────────────────────────────────────────────────────────────┘  │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                   HTTP/HTTPS │ REST API Calls
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DJANGO BACKEND                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      URL Router                                           │   │
│  │  path('api/community-members/', CommunityMembersView.as_view())         │   │
│  │                                                      │                   │   │
│  │                                                      ▼                   │   │
│  │              ┌─────────────────────────────────────────────────────┐   │   │
│  │              │  CommunityMembersView (Controller/API)  ← NEW!     │   │   │
│  │              │  @permission_classes: AllowAny                     │   │   │
│  │              │  ┌─────────────────────────────────────────────┐  │   │   │
│  │              │  │ GET Request Handler:                        │  │   │   │
│  │              │  │ • Validate query params (limit, sort)       │  │   │   │
│  │              │  │ • Call CommunityMembersService              │  │   │   │
│  │              │  │ • Return JSON response                      │  │   │   │
│  │              │  └─────────────────────────────────────────────┘  │   │   │
│  │              │                    │                              │   │   │
│  │              │                    ▼                              │   │   │
│  │              │  ┌─────────────────────────────────────────────┐  │   │   │
│  │              │  │  CommunityMembersService  ← NEW!           │  │   │   │
│  │              │  │                                             │  │   │   │
│  │              │  │ Methods:                                    │  │   │   │
│  │              │  │  • get_active_contributors(limit, sort)    │  │   │   │
│  │              │  │  • get_member_profile(user_id)             │  │   │   │
│  │              │  │                                             │  │   │   │
│  │              │  │ Calls:                                      │  │   │   │
│  │              │  │  └→ CommunityMembersRepository              │  │   │   │
│  │              │  │  └→ Other services (auth, etc.)             │  │   │   │
│  │              │  └─────────────────────────────────────────────┘  │   │   │
│  │              │                    │                              │   │   │
│  │              │                    ▼                              │   │   │
│  │              │  ┌─────────────────────────────────────────────┐  │   │   │
│  │              │  │  CommunityMembersRepository  ← NEW!        │  │   │   │
│  │              │  │  (Base: BaseRepository)                     │  │   │   │
│  │              │  │                                             │  │   │   │
│  │              │  │ Methods:                                    │  │   │   │
│  │              │  │  • get_active_contributors()               │  │   │   │
│  │              │  │    └→ Count questions & answers per user    │  │   │   │
│  │              │  │    └→ Filter users with ≥1 contribution    │  │   │   │
│  │              │  │    └→ Sort by reputation & contributions   │  │   │   │
│  │              │  │                                             │  │   │   │
│  │              │  │  • get_contributors_by_reputation()        │  │   │   │
│  │              │  │  • get_recent_contributors()               │  │   │   │
│  │              │  │  • get_top_answerers()                     │  │   │   │
│  │              │  │  • get_member_stats()                      │  │   │   │
│  │              │  └─────────────────────────────────────────────┘  │   │   │
│  │              │                    │                              │   │   │
│  │              │                    ▼                              │   │   │
│  │              │         ┌───────────────────┐                     │   │   │
│  │              │         │     DATABASE      │                     │   │   │
│  │              │         │  (PostgreSQL/     │                     │   │   │
│  │              │         │   SQLite)         │                     │   │   │
│  │              │         │                   │                     │   │   │
│  │              │         │ Tables:           │                     │   │   │
│  │              │         │ • User            │                     │   │   │
│  │              │         │ • Question        │                     │   │   │
│  │              │         │ • Answer          │                     │   │   │
│  │              │         │ • Vote            │                     │   │   │
│  │              │         │ • etc.            │                     │   │   │
│  │              │         └───────────────────┘                     │   │   │
│  │              │                    │                              │   │   │
│  │              │                    ▼                              │   │   │
│  │              │         ┌───────────────────────────┐             │   │   │
│  │              │         │ Query Aggregation:        │             │   │   │
│  │              │         │ • Count('questions')      │             │   │   │
│  │              │         │ • Count('answers')        │             │   │   │
│  │              │         │ • Order by reputation     │             │   │   │
│  │              │         │ • Filter active users     │             │   │   │
│  │              │         └───────────────────────────┘             │   │   │
│  │              │                                                    │   │   │
│  │              └────────────────────────────────────────────────────┘   │   │
│  │                          │                                            │   │
│  │                          ▼                                            │   │
│  │              ┌──────────────────────────────────────┐                │   │
│  │              │  Serializers  ← NEW!                │                │   │
│  │              │  • CommunityMemberSerializer         │                │   │
│  │              │  • CommunityMembersListSerializer    │                │   │
│  │              │                                      │                │   │
│  │              │  Formats response data:              │                │   │
│  │              │  JSON → {id, username, avatar, ...} │                │   │
│  │              └──────────────────────────────────────┘                │   │
│  │                          │                                            │   │
│  │                          ▼                                            │   │
│  │               Response sent to Frontend                              │   │
│  │                                                                       │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
USER INTERACTION
      │
      ▼
┌─────────────────────────┐
│ Component Mounts        │
│ CommunityMembers.jsx    │
└─────────────────────────┘
      │
      ▼
┌──────────────────────────────────┐
│ Call getActiveMembers()          │
│ from communityMembersService     │
└──────────────────────────────────┘
      │
      ├─── Check Cache ──┐
      │                  │
      │      HIT?        ▼ NO
      │      ▼      ┌─────────────────────────┐
      │   Return   │ Check Inflight Request  │
      │   Cached   │ (prevent duplicates)    │
      │   Data     └─────────────────────────┘
      │                  │
      │      YES?        ▼ NO
      │      ▼      ┌─────────────────────────┐
      │   Return   │ Make HTTP GET Request   │
      │   Inflight │ to /api/community-      │
      │   Promise  │ members/?limit=...      │
      │            └─────────────────────────┘
      │                  │
      │                  ▼
      │            ┌──────────────────┐
      │            │ Backend Process  │
      │            │ (see above)      │
      │            └──────────────────┘
      │                  │
      │                  ▼
      │            ┌──────────────────────┐
      │            │ API Response JSON    │
      │            └──────────────────────┘
      │                  │
      │                  ▼
      │            ┌──────────────────────┐
      │            │ Cache Response       │
      │            │ (3 min TTL)          │
      │            └──────────────────────┘
      │                  │
      ▼──────────────────▼
┌──────────────────────────┐
│ Component State Updated  │
│ members = [...]          │
└──────────────────────────┘
      │
      ▼
┌──────────────────────────┐
│ Render Member Cards      │
│ Show avatars, names,     │
│ reputation, etc.         │
└──────────────────────────┘
      │
      ▼
┌──────────────────────────┐
│ User Interaction         │
│ • Sort (Top/Helpers/Active)
│ • Show More              │
│ • Click Member → Profile │
└──────────────────────────┘
```

---

## Component Hierarchy

```
Layout
  └── Sidebar
      └── SidebarPanel
          ├── Navigation Items
          │   ├── Home
          │   ├── All Questions
          │   ├── Recent
          │   └── Unanswered
          │
          ├── CommunityMembers ← NEW!
          │   ├── Section Header
          │   ├── Sort Buttons
          │   ├── Loading Skeleton (conditional)
          │   ├── Error Message (conditional)
          │   ├── Member Cards (mapped list)
          │   │   ├── Avatar
          │   │   ├── Username (Link)
          │   │   ├── Verified Badge (conditional)
          │   │   ├── Reputation
          │   │   ├── Contributions
          │   │   └── Hover Tooltip
          │   ├── Show More Button (conditional)
          │   └── Show Less Button (conditional)
          │
          ├── TrendingTags
          │   ├── Tag Items
          │   └── Tag Links
          │
          └── UserProfileSection / GuestFooter
              └── Profile/Login/Register
```

---

## State Management

### CommunityMembers Component Local State

```javascript
{
  members: Array,           // Fetched member list
  loading: Boolean,         // API call in progress
  error: String|null,       // Error message
  sortBy: String,           // 'reputation'|'answers'|'recent'
  showAll: Boolean          // Expand/collapse list
}
```

### communityMembersService Cache

```javascript
{
  membersCache: Array|null,        // Cached response
  membersExpiresAt: Number,        // Cache expiry timestamp
  membersInflight: Promise|null,   // Pending request
  membersBackoffUntil: Number      // Rate limit backoff time
}
```

---

## Database Query Optimization

### Query Structure for get_active_contributors()

```sql
SELECT
  u.id, u.username, u.profile_picture, u.reputation, u.bio, u.is_verified, u.created_at, u.last_active,
  COUNT(DISTINCT q.id) as question_count,
  COUNT(DISTINCT a.id) as answer_count
FROM users u
LEFT JOIN questions q ON u.id = q.author_id
LEFT JOIN answers a ON u.id = a.author_id
WHERE (q.id IS NOT NULL OR a.id IS NOT NULL)  -- At least 1 contribution
GROUP BY u.id
ORDER BY u.reputation DESC, (COUNT(DISTINCT q.id) + COUNT(DISTINCT a.id)) DESC
LIMIT 10;
```

### Indexes Used

- `users.reputation` (indexed)
- `questions.author_id` (indexed via FK)
- `answers.author_id` (indexed via FK)

---

## API Request/Response Cycle

### Request

```
GET /api/community-members/?limit=10&sort=reputation HTTP/1.1
Host: localhost:8000
Accept: application/json
Authorization: Bearer {token} (optional)
```

### Backend Processing

1. Parse query parameters
2. Validate: limit (1-100), sort (reputation|answers|recent)
3. Call CommunityMembersService.get_active_contributors()
4. Service calls CommunityMembersRepository
5. Repository executes database query
6. Service formats response with all user details
7. Serializer converts to JSON
8. Controller returns Response

### Response

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "uuid",
      "username": "user1",
      "avatar": null,
      "reputation": 150,
      "questions": 8,
      "answers": 22,
      "lastActive": "2026-05-13T10:30:00Z",
      "bio": "...",
      "is_verified": false,
      "createdAt": "2026-01-15T00:00:00Z"
    },
    ...
  ]
}
```

---

## Caching Strategy

```
TIME ──────────────────────────────────────────────────>

│  Request 1
│  GET /api/...
│  ├─ Cache MISS
│  └─ Fetch from API (100ms)
│     Store in cache
│     Set expiry = now + 3min
│
├─ TTL: 3 minutes
│
│  Request 2 (within 3 min)
│  GET /api/...
│  ├─ Cache HIT
│  └─ Return cached data (0ms)
│
├─ TTL expires
│
│  Request 3 (after 3 min)
│  GET /api/...
│  ├─ Cache EXPIRED
│  └─ Fetch from API (100ms)
│     Update cache
│
│  Parallel Requests (same exact time)
│  ├─ Request A: GET /api/...
│  │  └─ Coalesced: Returns same Promise
│  ├─ Request B: GET /api/...
│  │  └─ Coalesced: Returns same Promise
│  └─ Single API call, multiple consumers

│  Rate Limit Response (429)
│  ├─ Set backoff timer = now + 60sec
│  ├─ Return cached data (or empty)
│  ├─ Backoff: 60 seconds
│  └─ Request after 60sec: Try again
```

---

**Architecture Status**: ✅ Production Ready
