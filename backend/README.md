# StackOverflow Backend - Production-Grade Platform

A comprehensive, scalable backend system for an AI-powered knowledge sharing platform combining StackOverflow's collaborative features with advanced knowledge management and search capabilities.

## 🎯 Project Overview

This backend demonstrates deep backend engineering principles including:

- **REST API Architecture** - Stateless, HTTP-based communication
- **Authentication & Authorization** - JWT-based token authentication with role-based access control
- **Database Design** - PostgreSQL with normalized schemas and strategic indexing
- **Caching Layer** - Redis for session management and response caching
- **Full-Text Search** - Elasticsearch for powerful knowledge discovery
- **Background Processing** - Celery workers for async task handling
- **Notification System** - Real-time notifications for user engagement
- **Logging & Observability** - Structured logging for debugging and monitoring
- **Security Best Practices** - Input validation, SQL injection prevention, rate limiting
- **Scalability** - Horizontally scalable architecture with load balancing support
- **Containerization** - Docker & Docker Compose for consistent deployment

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Web/Mobile)                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer / Reverse Proxy                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Django API  │  │  Django API  │  │  Django API  │
│  (Multiple   │  │  (Multiple   │  │  (Multiple   │
│  Instances)  │  │  Instances)  │  │  Instances)  │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
    ┌────────┐        ┌────────┐        ┌──────────┐
    │Database│        │ Cache  │        │ Search   │
    │ (PG)   │        │(Redis) │        │(ES)      │
    └────────┘        └────────┘        └──────────┘

┌──────────────────────────────────────────────────────────────────┐
│          Background Processing (Celery Tasks)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │Workers      │  │Tasks Queue   │  │Beat Scheduler│             │
│  │(Async Ops)  │  │(Redis)       │  │(Periodic)    │             │
│  └─────────────┘  └──────────────┘  └──────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

## 📊 Core Features

### 1. **Knowledge Sharing**

- Post questions with tags and descriptions
- Provide comprehensive answers
- Create knowledge base articles
- Save code snippets with syntax highlighting

### 2. **Community Engagement**

- Vote system (upvote/downvote)
- Comments on questions and answers
- Accept best answers
- User reputation system

### 3. **Discovery & Search**

- Full-text search across all content
- Tag-based filtering
- Trending questions and articles
- Search result ranking by relevance

### 4. **User Experience**

- User profiles with reputation
- Bookmark/save functionality
- Real-time notifications
- Activity history
- Follow topics/users

### 5. **Admin & Moderation**

- Content moderation tools
- User management
- Analytics dashboard
- Question closure/pinning

## 🚀 Tech Stack

### Backend Framework

- **Django 4.2** - Web framework
- **Django REST Framework** - API framework
- **Python 3.11** - Programming language

### Database

- **PostgreSQL 15** - Primary database
- **Redis 7** - Cache & message broker
- **Elasticsearch 8** - Search engine

### Background Processing

- **Celery** - Distributed task queue
- **Celery Beat** - Task scheduler

### DevOps

- **Docker** - Containerization
- **Gunicorn** - Application server
- **Docker Compose** - Orchestration

## 📁 Project Structure

```
backend/
├── src/
│   ├── models/              # Database models
│   ├── serializers/         # DRF serializers
│   ├── controllers/         # API views/viewsets
│   ├── services/            # Business logic
│   ├── repositories/        # Data access layer
│   ├── middleware/          # Request processing
│   │   ├── auth.py          # JWT authentication
│   │   ├── logging.py       # Request logging
│   │   ├── error.py         # Error handling
│   │   └── rate_limit.py    # Rate limiting
│   ├── routes/              # URL routing
│   ├── jobs/                # Celery tasks
│   ├── workers/             # Celery configuration
│   ├── utils/               # Utilities
│   ├── config/              # Configuration
│   ├── database/            # Database utilities
│   ├── conf.py              # Django settings
│   └── wsgi.py              # WSGI entry
├── manage.py                # Django management
├── requirements.txt         # Dependencies
├── Dockerfile               # Container image
├── docker-compose.yml       # Multi-container setup
├── .env.example             # Environment template
└── logs/                    # Application logs
```

## 🔧 Installation & Setup

### Prerequisites

- Docker & Docker Compose (recommended)
- Python 3.11+ (for local development)
- PostgreSQL (optional, included in Docker)

### Quick Start with Docker

1. **Clone and navigate to project**

   ```bash
   cd backend
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and run with Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Run migrations**

   ```bash
   docker-compose exec backend python manage.py migrate
   ```

5. **Create superuser**

   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Access the API**
   - API: http://localhost:8000/api/
   - Health Check: http://localhost:8000/api/health/

### Local Development Setup

1. **Create virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables**

   ```bash
   cp .env.example .env
   # Edit with your local PostgreSQL/Redis URLs
   ```

4. **Run migrations**

   ```bash
   python manage.py migrate
   ```

5. **Create superuser**

   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server**

   ```bash
   python manage.py runserver
   ```

7. **In another terminal, run Celery worker**
   ```bash
   celery -A src.workers.celery worker -l info
   ```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Get access tokens
- `GET /api/auth/profile/` - Get current user profile

### Questions

- `POST /api/questions/` - Create question
- `GET /api/questions/` - List questions
- `GET /api/questions/{id}/` - Get question detail
- `PUT /api/questions/{id}/` - Update question
- `DELETE /api/questions/{id}/` - Delete question
- `GET /api/questions/trending/` - Trending questions
- `GET /api/questions/unanswered/` - Unanswered questions

### Answers

- `POST /api/answers/` - Create answer
- `GET /api/answers/{id}/` - Get answer
- `PUT /api/answers/{id}/` - Update answer
- `POST /api/answers/accept/` - Accept answer

### Voting

- `POST /api/votes/` - Vote on question/answer

### Search

- `GET /api/search/?q=query` - Search questions and articles

### Notifications

- `GET /api/notifications/` - List notifications
- `GET /api/notifications/unread/` - Get unread count
- `POST /api/notifications/{id}/mark_as_read/` - Mark as read

## 🔒 Security Features

### Authentication

- JWT token-based authentication
- Refresh token mechanism
- Token expiration handling

### Authorization

- Role-based access control (Admin, Moderator, User)
- Permission decorators on protected endpoints

### Input Validation

- Serializer-based validation
- Type checking on all inputs
- Length and format restrictions

### Data Protection

- Password hashing with bcrypt
- CSRF protection
- SQL injection prevention via ORM
- XSS protection headers

### Rate Limiting

- Per-IP rate limits (100 req/min)
- Auth endpoint protection (5 attempts per 15 min)
- Customizable limits per endpoint

## 📊 Database Schema

### Core Models

**User**

- id, username, email, password
- profile_picture, bio, reputation
- role (Admin/Moderator/User)
- is_verified, created_at, last_active

**Question**

- id, title, content, author_id
- tags, views_count, votes_count
- is_closed, is_pinned, created_at, updated_at

**Answer**

- id, question_id, author_id, content
- votes_count, is_accepted
- created_at, updated_at

**Article**

- id, title, content, slug
- author_id, category, tags
- views_count, votes_count
- is_published, published_at

**Comment**

- id, content, author_id
- question_id or answer_id
- votes_count, created_at

**Vote**

- id, voter_id, vote_type (upvote/downvote)
- question_id or answer_id
- created_at

**Notification**

- id, recipient_id, notification_type
- title, message, link
- is_read, read_at, created_at

**SavedItem**

- id, user_id, item_type, item_id
- created_at

## 🔄 Background Jobs

### Celery Tasks

1. **send_notification_email** - Send email notifications
2. **index_question_search** - Index content in Elasticsearch
3. **generate_ai_summary** - Generate AI summaries (optional)
4. **notify_answer_received** - Notify on new answers
5. **notify_mention** - Notify on mentions
6. **cleanup_expired_notifications** - Daily cleanup
7. **sync_reputation** - Sync user reputation (6-hourly)

### Scheduled Tasks

- Notification cleanup: Daily at 2 AM UTC
- Reputation sync: Every 6 hours

## 💾 Caching Strategy

### Cache Keys

- `question:{id}` - Individual question (5 min TTL)
- `user:{id}` - User profile (10 min TTL)
- `trending:questions` - Trending list (1 hour TTL)
- `search:{query}` - Search results (30 min TTL)

### invalidation

- Cache invalidated on CREATE/UPDATE/DELETE operations
- TTL-based cleanup for stale data

## 🔍 Search Implementation

### Elasticsearch Indexing

- Full-text search on title and content
- Tag-based filtering
- Relevance scoring with field boosting
- 20 results per page

### Query Types

- Multi-field search
- Tag filtering
- By category
- By author

## 🎯 Performance Optimization

### Database

- Strategic indexes on frequently queried fields
- Connection pooling (CONN_MAX_AGE=600)
- Query optimization with select_related/prefetch_related
- Pagination (20 items per page)

### Caching

- Redis for session cache
- Query result caching
- TTL-based automatic cleanup

### API

- Response compression
- HTTP/2 support via Gunicorn
- Async background jobs
- Worker pooling (4 workers)

### Scalability

- Stateless API design
- Load balancer compatible
- Horizontal scaling support
- Database connection pooling

## 📝 Logging & Monitoring

### Log Levels

- DEBUG/INFO: Regular operations
- WARNING: Recoverable issues
- ERROR: Unrecoverable errors

### Log Files

- `logs/app.log` - Application logs
- `logs/error.log` - Error logs

### Metrics

- Request latency tracking
- Response status distribution
- Error rates
- Worker queue depth

## 🚀 Deployment

### Docker Deployment

```bash
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Environment Variables

All configuration via `.env` file - see `.env.example` for full list

### Health Checks

- API health: `GET /api/health/`
- Database: Connection pooling health
- Redis: Ping check
- Elasticsearch: Cluster health

## 📈 Scaling Considerations

### Horizontal Scaling

- Add multiple backend instances behind load balancer
- Database connection pooling automatically scales
- Shared Redis/Elasticsearch across instances

### Database Scaling

- Read replicas for read-heavy queries
- Partitioning by date for questions/answers
- Archive old notifications

### Caching Scaling

- Redis cluster for high availability
- Replicated cache across nodes

## 🔗 API Documentation

### Request Format

```bash
curl -X GET http://localhost:8000/api/questions/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Response Format

```json
{
  "success": true,
  "message": "Success",
  "data": [...],
  "status": 200
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details",
  "status": 400
}
```

## 🧪 Testing

Run tests:

```bash
python manage.py test
```

With coverage:

```bash
coverage run --source='.' manage.py test
coverage report
```

## 📄 License

This project is provided for educational and demonstration purposes.

## 🤝 Contributing

To enhance this backend system:

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow PEP 8 style guidelines

## 📞 Support

For issues or questions about this backend system, please refer to the documentation or create an issue in the repository.

---

**Built with**❤️ **as a production-grade backend system demonstration**
