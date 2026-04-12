# API Documentation

## Table of Contents

1. [Authentication](#authentication)
2. [Questions](#questions)
3. [Answers](#answers)
4. [Voting](#voting)
5. [Search](#search)
6. [Users](#users)
7. [Notifications](#notifications)
8. [Articles](#articles)
9. [Code Snippets](#code-snippets)
10. [Error Handling](#error-handling)

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register/`

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "reputation": 0,
    "is_verified": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "success": false,
  "error": "Username already exists",
  "status": 400
}
```

---

### Login User

Authenticate user and get JWT tokens.

**Endpoint:** `POST /api/auth/login/`

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "email": "john@example.com",
    "reputation": 42,
    "is_verified": true
  },
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Usage:**
Include the access token in the `Authorization` header for subsequent requests:

```
Authorization: Bearer <access_token>
```

---

### Get Current User Profile

Get the authenticated user's profile information.

**Endpoint:** `GET /api/users/profile/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Software engineer and knowledge enthusiast",
  "profile_picture": "https://api.example.com/media/profiles/john_doe.jpg",
  "reputation": 247,
  "is_verified": true,
  "role": "user",
  "created_at": "2024-01-15T10:30:00Z",
  "last_active": "2024-01-20T14:22:15Z"
}
```

---

## Questions

### Create Question

Post a new question to the platform.

**Endpoint:** `POST /api/questions/`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "How to implement async/await in Django?",
  "content": "I'm trying to implement asynchronous views in Django. Can anyone explain the best practices and provide examples?",
  "tags": ["django", "async", "python"]
}
```

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "How to implement async/await in Django?",
  "content": "I'm trying to implement asynchronous views in Django...",
  "author": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "reputation": 247
  },
  "tags": ["django", "async", "python"],
  "views_count": 0,
  "votes_count": 0,
  "is_closed": false,
  "is_pinned": false,
  "created_at": "2024-01-20T14:22:15Z",
  "updated_at": "2024-01-20T14:22:15Z",
  "answers": [],
  "comments": []
}
```

---

### List Questions

Retrieve a paginated list of questions.

**Endpoint:** `GET /api/questions/`

**Query Parameters:**

- `page` (integer, default: 1) - Page number
- `page_size` (integer, default: 20, max: 100) - Items per page
- `search` (string) - Search in title and content
- `tags` (string, comma-separated) - Filter by tags

**Example:**

```
GET /api/questions/?page=1&page_size=20&tags=django,python
```

**Response (200 OK):**

```json
{
  "count": 1547,
  "next": "http://api.example.com/api/questions/?page=2",
  "previous": null,
  "page_size": 20,
  "total_pages": 78,
  "current_page": 1,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "How to implement async/await in Django?",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "john_doe"
      },
      "tags": ["django", "async", "python"],
      "views_count": 347,
      "votes_count": 12,
      "answers_count": 3,
      "is_closed": false,
      "created_at": "2024-01-20T14:22:15Z"
    }
  ]
}
```

---

### Get Question Detail

Retrieve a specific question with all answers and comments.

**Endpoint:** `GET /api/questions/{question_id}/`

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "How to implement async/await in Django?",
  "content": "I'm trying to implement asynchronous views in Django...",
  "author": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "reputation": 247
  },
  "tags": ["django", "async", "python"],
  "views_count": 348,
  "votes_count": 12,
  "is_closed": false,
  "is_pinned": false,
  "created_at": "2024-01-20T14:22:15Z",
  "updated_at": "2024-01-20T14:22:15Z",
  "answers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "content": "You can use async views in Django 3.1+...",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "username": "jane_smith"
      },
      "votes_count": 8,
      "is_accepted": true,
      "comments": [],
      "created_at": "2024-01-20T15:10:00Z"
    }
  ],
  "comments": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "content": "Great question! I've been wondering this too.",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "username": "bob_johnson"
      },
      "votes_count": 2,
      "created_at": "2024-01-20T16:00:00Z"
    }
  ]
}
```

---

### Trending Questions

Get the most viewed and voted questions.

**Endpoint:** `GET /api/questions/trending/`

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "How to implement async/await in Django?",
    "author": {
      "username": "john_doe"
    },
    "tags": ["django", "async", "python"],
    "views_count": 3456,
    "votes_count": 98,
    "answers_count": 15,
    "is_closed": false,
    "created_at": "2024-01-15T14:22:15Z"
  }
]
```

---

### Unanswered Questions

Get questions with no answers.

**Endpoint:** `GET /api/questions/unanswered/`

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440050",
    "title": "How to use Celery with Django REST Framework?",
    "author": {
      "username": "alice_wonder"
    },
    "tags": ["django", "celery", "rest-framework"],
    "views_count": 128,
    "votes_count": 5,
    "answers_count": 0,
    "is_closed": false,
    "created_at": "2024-01-18T10:15:00Z"
  }
]
```

---

### Update Question

Update an existing question (author only or admin).

**Endpoint:** `PUT /api/questions/{question_id}/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "How to properly implement async/await in Django?",
  "content": "Updated content...",
  "tags": ["django", "async", "python", "coroutines"]
}
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "How to properly implement async/await in Django?",
  ...
}
```

---

### Delete Question

Delete a question (author or admin only).

**Endpoint:** `DELETE /api/questions/{question_id}/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

---

## Answers

### Create Answer

Post an answer to a question.

**Endpoint:** `POST /api/answers/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "question_id": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Django 3.1+ supports async views using async def. Here's how to implement it..."
}
```

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "content": "Django 3.1+ supports async views using async def...",
  "author": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "jane_smith",
    "reputation": 542
  },
  "votes_count": 0,
  "is_accepted": false,
  "comments": [],
  "created_at": "2024-01-20T15:10:00Z",
  "updated_at": "2024-01-20T15:10:00Z"
}
```

---

### Accept Answer

Mark an answer as the correct/best answer (question author only).

**Endpoint:** `POST /api/answers/accept/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "answer_id": "550e8400-e29b-41d4-a716-446655440010",
  "question_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "content": "Django 3.1+ supports async views...",
  "author": {
    "username": "jane_smith"
  },
  "votes_count": 0,
  "is_accepted": true,
  "created_at": "2024-01-20T15:10:00Z"
}
```

---

## Voting

### Vote on Content

Vote (upvote/downvote) on a question or answer.

**Endpoint:** `POST /api/votes/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body (for Question):**

```json
{
  "vote_type": "upvote",
  "question_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Request Body (for Answer):**

```json
{
  "vote_type": "upvote",
  "answer_id": "550e8400-e29b-41d4-a716-446655440010"
}
```

**Response (200 OK):**

```json
{
  "message": "Vote recorded",
  "votes_count": 13
}
```

**Notes:**

- Voting with the same vote_type removes the vote (toggle behavior)
- Changing vote type updates the vote count accordingly
- Only one vote per user per item

---

## Search

### Search Knowledge Base

Search across questions, articles, and snippets.

**Endpoint:** `GET /api/search/`

**Query Parameters:**

- `q` (string, required) - Search query (minimum 2 characters)
- `type` (string, optional) - Filter by type: "all", "questions", "articles", "snippets"

**Example:**

```
GET /api/search/?q=django+rest+framework&type=questions
```

**Response (200 OK):**

```json
{
  "query": "django rest framework",
  "questions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Best practices for Django REST Framework serializers",
      "author": {
        "username": "john_doe"
      },
      "tags": ["django", "rest-framework"],
      "views_count": 1234,
      "votes_count": 45,
      "answers_count": 5,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "articles": []
}
```

**Error Response (400 Bad Request):**

```json
{
  "error": "Query must be at least 2 characters",
  "status": 400
}
```

---

## Users

### Get User Profile

Retrieve a specific user's profile.

**Endpoint:** `GET /api/users/{user_id}/`

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Software engineer and knowledge enthusiast",
  "profile_picture": "https://api.example.com/media/profiles/john_doe.jpg",
  "reputation": 247,
  "is_verified": true,
  "role": "user",
  "created_at": "2024-01-15T10:30:00Z",
  "last_active": "2024-01-20T14:22:15Z"
}
```

---

### Update User Profile

Update the authenticated user's profile information.

**Endpoint:** `POST /api/users/update_profile/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "bio": "Updated bio",
  "first_name": "Jonathan",
  "last_name": "Doe"
}
```

**Response (200 OK):**

```json
{
  "message": "Profile updated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "john_doe",
    "first_name": "Jonathan",
    "bio": "Updated bio",
    ...
  }
}
```

---

## Notifications

### Get Notifications

Retrieve all notifications for the authenticated user.

**Endpoint:** `GET /api/notifications/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `page` (integer, default: 1)
- `page_size` (integer, default: 20)

**Response (200 OK):**

```json
{
  "count": 42,
  "next": "http://api.example.com/api/notifications/?page=2",
  "previous": null,
  "page_size": 20,
  "total_pages": 3,
  "current_page": 1,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "notification_type": "new_answer",
      "title": "New answer to 'How to implement async/await in Django?'",
      "message": "jane_smith answered your question",
      "link": "/questions/550e8400-e29b-41d4-a716-446655440001",
      "is_read": false,
      "read_at": null,
      "created_at": "2024-01-20T15:15:00Z"
    }
  ]
}
```

---

### Get Unread Notifications Count

Get the count of unread notifications.

**Endpoint:** `GET /api/notifications/unread/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "unread_count": 3
}
```

---

### Get Unread Notifications

Retrieve only unread notifications.

**Endpoint:** `GET /api/notifications/unread/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "count": 3,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "notification_type": "new_answer",
      "title": "New answer to 'How to implement async/await in Django?'",
      "message": "jane_smith answered your question",
      "link": "/questions/550e8400-e29b-41d4-a716-446655440001",
      "is_read": false,
      "created_at": "2024-01-20T15:15:00Z"
    }
  ]
}
```

---

### Mark Notification as Read

Mark a specific notification as read.

**Endpoint:** `POST /api/notifications/{notification_id}/mark_as_read/`

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "message": "Marked as read"
}
```

---

## Articles

### List Articles

Retrieve published articles.

**Endpoint:** `GET /api/articles/`

**Query Parameters:**

- `page` (integer, default: 1)
- `page_size` (integer, default: 20)
- `category` (string) - Filter by category
- `search` (string) - Search in title and content

**Response (200 OK):**

```json
{
  "count": 156,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440200",
      "title": "Complete Guide to Django ORM Optimization",
      "slug": "complete-guide-django-orm-optimization",
      "author": {
        "username": "expert_dev"
      },
      "category": "Performance",
      "tags": ["django", "orm", "optimization"],
      "views_count": 5432,
      "votes_count": 123,
      "created_at": "2024-01-10T08:00:00Z"
    }
  ]
}
```

---

## Code Snippets

### Create Code Snippet

Save a code snippet to the platform.

**Endpoint:** `POST /api/code-snippets/`

**Headers:**

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Django async view example",
  "code": "import asyncio\nfrom django.http import HttpResponse\n\nasync def my_view(request):\n    await asyncio.sleep(1)\n    return HttpResponse('Hello')",
  "language": "python",
  "description": "Example of an async view in Django",
  "tags": ["django", "async", "example"],
  "is_public": true
}
```

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440300",
  "title": "Django async view example",
  "code": "import asyncio\n...",
  "language": "python",
  "description": "Example of an async view in Django",
  "author": {
    "username": "john_doe"
  },
  "tags": ["django", "async", "example"],
  "views_count": 0,
  "votes_count": 0,
  "is_public": true,
  "created_at": "2024-01-20T16:30:00Z"
}
```

---

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes

| Status | Meaning                                                        |
| ------ | -------------------------------------------------------------- |
| 200    | OK - Request successful                                        |
| 201    | Created - Resource created successfully                        |
| 204    | No Content - Request successful, no response body              |
| 400    | Bad Request - Invalid input or parameters                      |
| 401    | Unauthorized - Missing or invalid authentication token         |
| 403    | Forbidden - Authenticated but not authorized for this resource |
| 404    | Not Found - Resource does not exist                            |
| 409    | Conflict - Resource conflict (e.g., duplicate entry)           |
| 429    | Too Many Requests - Rate limit exceeded                        |
| 500    | Internal Server Error - Server error                           |

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API:** 100 requests per minute per IP
- **Auth Endpoints:** 5 attempts per 15 minutes per IP

When rate limited, you'll receive:

```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

HTTP Status: `429 Too Many Requests`

---

## Authentication Best Practices

1. **Always use HTTPS** in production
2. **Keep tokens secure** - Never expose access tokens in client-side code
3. **Rotate tokens periodically** - Use refresh tokens for long-lived sessions
4. **Implement token expiration** - Tokens automatically expire after 24 hours
5. **Handle 401 responses** - Prompt users to re-authenticate

---

## Rate Limiting Best Practices

1. **Implement exponential backoff** when retrying failed requests
2. **Cache responses** to minimize API calls
3. **Batch operations** when possible
4. **Monitor retry-after headers** for rate limit recovery time
5. **Implement request queuing** for high-volume scenarios

---

## Pagination

All list endpoints support pagination:

- Default page size: 20 items
- Maximum page size: 100 items
- Use `?page=n&page_size=m` to paginate results

Example:

```
GET /api/questions/?page=2&page_size=50
```

---

## Filtering & Sorting

Most list endpoints support filtering and sorting:

- `?search=query` - Search for items
- `?tags=tag1,tag2` - Filter by tags
- `?category=category` - Filter by category
- `?ordering=field` - Sort by field (prefix with `-` for descending)

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@",
    "password_confirm": "Test123!@"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@"
  }'

# Get questions (with auth token)
curl -X GET "http://localhost:8000/api/questions/" \
  -H "Authorization: Bearer <your_access_token>"
```

### Using Postman

1. Import the API collection
2. Set up environment variables for `base_url` and `access_token`
3. Test endpoints in the collection

### Using Python Requests

```python
import requests

BASE_URL = "http://localhost:8000/api"

# Register
response = requests.post(
    f"{BASE_URL}/auth/register/",
    json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "Test123!@",
        "password_confirm": "Test123!@"
    }
)
print(response.json())

# Login
response = requests.post(
    f"{BASE_URL}/auth/login/",
    json={
        "username": "testuser",
        "password": "Test123!@"
    }
)
tokens = response.json()["tokens"]
access_token = tokens["access_token"]

# Get questions
response = requests.get(
    f"{BASE_URL}/questions/",
    headers={"Authorization": f"Bearer {access_token}"}
)
print(response.json())
```

---

## Support

For API issues or questions, please:

1. Check this documentation
2. Review the error message and `request_id`
3. Check server logs for detailed error information
4. Contact the development team

---

**Last Updated:** January 2024
**API Version:** 1.0
