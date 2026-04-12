# Backend Architecture & Engineering Principles

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Design Patterns](#design-patterns)
3. [Scalability Strategies](#scalability-strategies)
4. [Performance Optimization](#performance-optimization)
5. [Security Approach](#security-approach)
6. [Reliability & Fault Tolerance](#reliability--fault-tolerance)
7. [Deployment Strategy](#deployment-strategy)

---

## System Architecture

### Layered Architecture

The backend follows a **strict layered architecture pattern**:

```
┌─────────────────────────────────────────┐
│   Controllers (Views)                   │
│   - HTTP Request Handlers               │
│   - Input Validation                    │
│   - Response Formatting                 │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Services (Business Logic)             │
│   - Business Rules                      │
│   - Validation Logic                    │
│   - Cross-layer Operations              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Repositories (Data Access)            │
│   - Database Queries                    │
│   - Query Optimization                  │
│   - Data Transformation                 │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Models (Data Layer)                   │
│   - Database Schema                     │
│   - Relationships                       │
│   - Constraints                         │
└─────────────────────────────────────────┘
```

### Separation of Concerns

Each layer has a specific responsibility:

1. **Controllers** - Handle HTTP protocol only
2. **Services** - Contain all business logic
3. **Repositories** - Abstract database operations
4. **Models** - Define data structure

This separation ensures:

- Easy testing (mock dependencies)
- Clear responsibility boundaries
- Easier maintenance and refactoring
- Reusable business logic

---

## Design Patterns

### 1. Repository Pattern

**Purpose:** Abstract data access layer from business logic

```python
# Repository abstracts database operations
class QuestionRepository:
    def get_by_id(self, id):
        return Question.objects.get(id=id)

    def search(self, query):
        return Question.objects.filter(
            Q(title__icontains=query) |
            Q(content__icontains=query)
        )

# Service uses the repository
class QuestionService:
    def __init__(self):
        self.repo = QuestionRepository()

    def get_question(self, question_id):
        question = self.repo.get_by_id(question_id)
        # Business logic here
        return question
```

**Benefits:**

- Easy to swap database implementations
- Simplified testing with mock repositories
- Centralized query logic

---

### 2. Service Pattern

**Purpose:** Encapsulate business logic

```python
class AuthService:
    def register(self, username, email, password):
        # Validation
        if len(password) < 8:
            raise ValueError('Password too short')

        # Business logic
        user = User.objects.create(
            username=username,
            email=email,
            password=hash_password(password)
        )
        return user
```

**Benefits:**

- Business logic is testable and reusable
- Can be called from controllers or other services
- Easy to add logging and monitoring

---

### 3. Dependency Injection

**Purpose:** Manage dependencies loosely

```python
class QuestionService:
    def __init__(self, repository=None):
        self.repo = repository or QuestionRepository()

# Easy to test with mock repository
class MockRepository:
    def get_by_id(self, id):
        return MockQuestion()

service = QuestionService(MockRepository())
```

---

### 4. Observer Pattern (for Notifications)

**Purpose:** Decouple event producers from consumers

```python
# When answer is created, trigger notification
@task
def notify_answer_received(question_id, answer_id):
    # Send notification asynchronously
    pass

# Controller creates answer and queues notification
answer = self.answer_service.create_answer(...)
notify_answer_received.delay(question_id, answer.id)
```

---

### 5. Caching Strategy

**Purpose:** Reduce database load

```python
class CacheService:
    def get_question(self, question_id):
        # Try cache first
        cached = cache.get(f"question:{question_id}")
        if cached:
            return cached

        # Query database if not cached
        question = Question.objects.get(id=question_id)

        # Store in cache
        cache.set(f"question:{question_id}", question, timeout=300)
        return question
```

---

## Scalability Strategies

### 1. Horizontal Scaling

**Multiple Backend Instances:**

```yaml
Backend Server 1 ──┐
Backend Server 2 ──┼──> Load Balancer ──> Database (Shared)
Backend Server 3 ──┘
```

**Implementation:**

- Stateless API design
- Shared Redis cache
- Shared PostgreSQL database
- Load balancer distributes traffic

---

### 2. Database Scaling

**Read Replicas:**

```
Primary Database ──> Replica 1 (Read-only)
                 └─> Replica 2 (Read-only)
```

**Benefits:**

- Read queries distributed across replicas
- Write operations go to primary
- Improved read performance

**Django Configuration:**

```python
DATABASES = {
    'default': {
        # Write operations
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': 'primary.db.example.com',
    },
    'replica': {
        # Read operations
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': 'replica.db.example.com',
    }
}

# Route queries
question = Question.objects.using('replica').get(id=id)
question.save()  # Uses 'default' (write)
```

---

### 3. Cache Layer Scaling

**Redis Cluster:**

```
Node 1 (Master)  ──┐
Node 2 (Master)  ──┼──> Shared Cache Cluster
Node 3 (Master)  ──┘
```

**Benefits:**

- Cache distributed across nodes
- Automatic failover
- Increased capacity

---

### 4. Queue Management

**Celery with Redis:**

```
Task Producer ──> Redis Queue ──> Worker 1
                              ┌─> Worker 2
                              └─> Worker 3
```

**Scaling:**

- Add more workers as load increases
- Redis handles queue distribution
- Workers process tasks in parallel

---

### 5. Search Engine Scaling

**Elasticsearch Cluster:**

```
Node 1  ──┐
Node 2  ──┼──> Cluster
Node 3  ──┘
```

**Benefits:**

- Distributed indexing
- Fault tolerance
- Horizontal search scaling

---

## Performance Optimization

### 1. Database Query Optimization

**N+1 Query Prevention:**

```python
# Before (N+1 queries)
questions = Question.objects.all()
for question in questions:
    print(question.author.username)  # Extra query per question

# After (optimized with select_related/prefetch_related)
questions = Question.objects.select_related('author').all()
# Only 2 queries total
```

---

### 2. Indexing Strategy

**Indexes on frequently queried fields:**

```python
class Question(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    votes_count = models.IntegerField(default=0)
    is_closed = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['is_closed']),
            models.Index(fields=['created_at']),
            models.Index(fields=['votes_count']),
        ]
```

**Benefits:**

- Fast lookups on indexed fields
- Improved sorting performance
- Reduced full table scans

---

### 3. Caching Layers

**Multi-level Caching:**

```
API Request
   ↓
L1: Redis Cache (session, query results)
   ↓ (miss)
L2: Database Query
   ↓
Database
```

**TTL Strategy:**

- User data: 10 minutes
- Questions: 5 minutes
- Search results: 30 minutes
- Trending: 1 hour

---

### 4. Connection Pooling

```python
# Django settings
DATABASES = {
    'default': {
        'CONN_MAX_AGE': 600,  # Connection kept 10 minutes
        'ATOMIC_REQUESTS': True,
    }
}
```

**Benefits:**

- Reuse database connections
- Reduced connection overhead
- Better resource utilization

---

### 5. Pagination

```python
# Prevent loading entire tables
class CustomPagination(PageNumberPagination):
    page_size = 20
    max_page_size = 100

# Results: 20 items per page instead of potentially 1000s
```

---

## Security Approach

### 1. Authentication

**JWT Token-Based:**

```python
def login(username, password):
    user = authenticate(username, password)
    tokens = create_tokens(user.id)
    return tokens

# Client includes token in requests
Authorization: Bearer <access_token>
```

**Token Expiration:**

- Access token: 24 hours
- Refresh token: 7 days
- Automatic expiration prevents indefinite access

---

### 2. Authorization

**Role-Based Access Control (RBAC):**

```python
class User(models.Model):
    role = models.CharField(
        choices=[
            ('admin', 'Administrator'),
            ('moderator', 'Moderator'),
            ('user', 'Regular User'),
        ]
    )

# Permission checking
@require_permission('moderate')
def close_question(request, question_id):
    # Only admins/moderators
    pass
```

---

### 3. Input Validation

**Multi-layer Validation:**

```python
# Layer 1: Serializer validation
class QuestionSerializer(ModelSerializer):
    def validate_title(self, value):
        if len(value) < 10:
            raise ValidationError("Title too short")
        return value

# Layer 2: Service validation
class QuestionService:
    def create_question(self, title, content):
        if len(content) < 20:
            raise ValueError("Content too short")

# Layer 3: Database constraints
class Question(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()  # Unlimited but validated above
```

---

### 4. SQL Injection Prevention

**ORM Protection:**

```python
# Safe - ORM parameterizes queries
questions = Question.objects.filter(title__icontains=user_input)

# Never do this!
# questions = Question.objects.raw(f"SELECT * FROM WHERE title LIKE '{user_input}'")
```

---

### 5. Rate Limiting

```python
class RateLimitMiddleware:
    def check_rate_limit(self, client_ip):
        cache_key = f"rate_limit:{client_ip}"
        request_count = cache.get(cache_key, 0)

        if request_count >= 100:
            raise RateLimitException()

        cache.set(cache_key, request_count + 1, timeout=60)
```

**Benefits:**

- Prevents brute force attacks
- DDoS mitigation
- Fair resource allocation

---

### 6. Password Security

```python
# Hashing
from django.contrib.auth.hashers import make_password, check_password

hashed = make_password(password)  # PBKDF2 by default
is_valid = check_password(password, hashed)

# Never store plaintext passwords
```

---

## Reliability & Fault Tolerance

### 1. Error Handling

**Centralized Error Handling:**

```python
class ErrorHandlingMiddleware:
    def process_exception(self, request, exception):
        if isinstance(exception, ValidationError):
            return JsonResponse(
                {'error': str(exception)},
                status=400
            )

        if isinstance(exception, NotFoundException):
            return JsonResponse(
                {'error': 'Not found'},
                status=404
            )

        # Log and return 500 for unexpected errors
        logger.error(str(exception), exc_info=True)
        return JsonResponse(
            {'error': 'Internal server error'},
            status=500
        )
```

---

### 2. Retry Logic

**Celery Task Retries:**

```python
@shared_task(bind=True, max_retries=3)
def send_notification(self, notification_id):
    try:
        # Send email
        send_email(notification_id)
    except EmailException as exc:
        # Retry with exponential backoff
        raise self.retry(
            exc=exc,
            countdown=60 * (2 ** self.request.retries)
        )
```

---

### 3. Circuit Breaker Pattern

**For External API Calls:**

```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.last_failure_time = None

    def call(self, func, *args, **kwargs):
        if self.is_open():
            raise CircuitBreakerOpenException()

        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise

# Usage
breaker = CircuitBreaker()
try:
    result = breaker.call(external_api_call)
except CircuitBreakerOpenException:
    # Use cached response or fallback
    pass
```

---

### 4. Health Checks

```python
# Health endpoint
GET /api/health/

Response:
{
    "status": "healthy",
    "timestamp": "2024-01-20T15:30:00Z",
    "checks": {
        "database": "connected",
        "redis": "connected",
        "elasticsearch": "connected"
    }
}
```

---

### 5. Graceful Degradation

```python
class SearchService:
    def search(self, query):
        try:
            # Try Elasticsearch first
            return self.elasticsearch_search(query)
        except Exception as e:
            logger.warning(f"ES failed, falling back to DB: {e}")
            # Fallback to database
            return self.database_search(query)
```

---

## Deployment Strategy

### Local Development

```bash
# With virtual environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver
```

---

### Docker Development

```bash
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

---

### Production Deployment

**With Gunicorn:**

```bash
gunicorn \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --worker-class sync \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - \
  src.wsgi:application
```

---

### Environment-Based Configuration

```python
# Development
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Staging
DEBUG = False
SECURE_SSL_REDIRECT = False

# Production
DEBUG = False
SECURE_SSL_REDIRECT = True
SECURE_BROWSER_XSS_FILTER = True
```

---

## Monitoring & Observability

### Structured Logging

```python
logger.info(
    "Question created",
    extra={
        'user_id': user.id,
        'question_id': question.id,
        'timestamp': now(),
    }
)
```

### Metrics Collection

```python
# Request latency
request_start = time.time()
# ... process request
duration = time.time() - request_start
logger.info(f"Request duration: {duration}ms")
```

### Distributed Tracing

```python
# Add request ID to all logs
request_id = uuid.uuid4()
logger.info("Starting request", extra={'request_id': request_id})
```

---

## Conclusion

This backend demonstrates:

✅ **Clean Architecture** - Layered, with clear separation of concerns
✅ **Scalability** - Horizontal scaling, read replicas, caching
✅ **Performance** - Optimized queries, caching, indexing
✅ **Security** - Authentication, authorization, input validation
✅ **Reliability** - Error handling, retries, graceful degradation
✅ **Maintainability** - Design patterns, code organization, documentation

This foundation supports growing from MVP to production-grade platform serving millions of users.
