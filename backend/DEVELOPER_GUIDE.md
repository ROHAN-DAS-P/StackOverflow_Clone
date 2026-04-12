# Developer Quick Reference Guide

## 🚀 Quick Start

### Docker (Recommended)

```bash
cd backend
cp .env.example .env
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Local Development

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# In another terminal
celery -A src.workers.celery worker -l info
```

---

## 📋 Common Commands

### Django Management

```bash
# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Create superuser
python manage.py createsuperuser

# Start shell
python manage.py shell

# Collect static files
python manage.py collectstatic

# Run tests
python manage.py test
```

### Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service]

# Run command in container
docker-compose exec backend python manage.py migrate

# Remove volumes (careful!)
docker-compose down -v
```

### Celery

```bash
# Start worker
celery -A src.workers.celery worker -l info

# Start beat scheduler
celery -A src.workers.celery beat -l info

# Monitor tasks
celery -A src.workers.celery events
```

---

## 🗂️ File Organization

### Adding a New Feature

#### 1. Create Model

```python
# src/models/__init__.py
class NewModel(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### 2. Create Serializer

```python
# src/serializers/__init__.py
class NewModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewModel
        fields = ['id', 'name', 'created_at']
```

#### 3. Create Repository

```python
# src/repositories/__init__.py
class NewModelRepository(BaseRepository):
    def __init__(self):
        super().__init__(NewModel)
```

#### 4. Create Service

```python
# src/services/__init__.py
class NewModelService:
    def __init__(self):
        self.repo = NewModelRepository()

    def create(self, name):
        return self.repo.create(name=name)
```

#### 5. Create Controller/ViewSet

```python
# src/controllers/__init__.py
class NewModelViewSet(viewsets.ModelViewSet):
    queryset = NewModel.objects.all()
    serializer_class = NewModelSerializer
    permission_classes = [IsAuthenticated]
```

#### 6. Add Routes

```python
# src/routes/urls.py
router.register(r'newmodels', NewModelViewSet, basename='newmodel')
```

#### 7. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 🔐 Authentication in Controllers

```python
# Public endpoint
@permission_classes([AllowAny])
def public_view(request):
    pass

# Authenticated only
@permission_classes([IsAuthenticated])
def protected_view(request):
    user = request.user
    pass

# Specific roles
@permission_classes([IsAuthenticated])
def admin_view(request):
    if request.user.role != 'admin':
        raise PermissionDenied()
    pass
```

---

## 💾 Database Operations

### Basic Queries

```python
# Create
user = User.objects.create(username='john', email='john@example.com')

# Read
user = User.objects.get(username='john')
users = User.objects.filter(role='admin')
users = User.objects.all()

# Update
user.email = 'newemail@example.com'
user.save()

# Delete
user.delete()

# Count
count = User.objects.filter(role='admin').count()

# Exists
exists = User.objects.filter(username='john').exists()
```

### Optimized Queries

```python
# Include related data
questions = Question.objects.select_related('author').all()
questions = Question.objects.prefetch_related('answers', 'comments').all()

# Filter and order
questions = Question.objects.filter(is_closed=False).order_by('-created_at')

# Pagination
page = (page_num - 1) * page_size
results = Model.objects.all()[page:page + page_size]
```

---

## 🧪 Testing

### Run Tests

```bash
python manage.py test

# Specific test
python manage.py test src.tests.TestClassName

# With coverage
coverage run --source='src' manage.py test
coverage report
coverage html
```

### Writing Tests

```python
from django.test import TestCase
from src.models import Question
from src.services import QuestionService

class QuestionServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(username='testuser')
        self.service = QuestionService()

    def test_create_question(self):
        question = self.service.create_question(
            title='Test Question',
            content='This is a test question',
            author_id=self.user.id
        )
        self.assertEqual(question.title, 'Test Question')
```

---

## 🔍 Debugging

### Django Shell

```bash
python manage.py shell

# Then in shell
from src.models import User
users = User.objects.all()
user = users.first()
print(user.username)
```

### Print Debugging

```python
print(f"Debug: {variable}")
import pdb; pdb.set_trace()  # Breakpoint
```

### Logging

```python
import logging
logger = logging.getLogger('app')

logger.info(f"Creating question: {title}")
logger.warning(f"User not found: {user_id}")
logger.error(f"Database error: {str(e)}")
```

---

## 🔗 Using Cache

### Cache Operations

```python
from src.utils import CacheService

cache = CacheService()

# Get
value = cache.get('key', default=None)

# Set
cache.set('key', value, timeout=300)

# Delete
cache.delete('key')

# Clear all
cache.clear()

# Using cache keys
cache.set(cache.question_key(question_id), question)
cached = cache.get(cache.question_key(question_id))
```

---

## 🔎 Using Search

### Search Operations

```python
from src.utils import SearchService

search = SearchService()

# Index document
search.index_question(question)

# Search
results = search.search('query string')

# Delete
search.delete_document(doc_id)
```

---

## 📨 Using Background Jobs

### Creating Tasks

```python
from src.jobs import send_notification_email

# Queue task
send_notification_email.delay(notification_id)

# Schedule for later
send_notification_email.apply_async(
    args=(notification_id,),
    countdown=3600  # 1 hour
)

# Retry configuration
@shared_task(bind=True, max_retries=3)
def my_task(self):
    try:
        # Do something
        pass
    except Exception as e:
        raise self.retry(exc=e, countdown=60)
```

---

## 🔄 Caching Data

### Caching Patterns

```python
# Check cache first
cached = cache.get(cache_key)
if cached:
    return cached

# Query database
data = Model.objects.filter(...)

# Store in cache
cache.set(cache_key, data, timeout=300)

# Invalidate on update
cache.delete(cache_key)
```

---

## 📊 API Response Format

### Success Response

```python
return Response({
    'success': True,
    'message': 'Operation successful',
    'data': serializer.data
}, status=status.HTTP_200_OK)
```

### Error Response

```python
return Response({
    'success': False,
    'error': 'Error message',
    'details': 'Additional details'
}, status=status.HTTP_400_BAD_REQUEST)
```

---

## 🛠️ Common Patterns

### Pagination

```python
from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
```

### Filtering

```python
from django_filters import rest_framework as filters

class QuestionFilter(filters.FilterSet):
    class Meta:
        model = Question
        fields = ['author', 'is_closed', 'tags']
```

### Serializer Validation

```python
class QuestionSerializer(serializers.ModelSerializer):
    def validate_title(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Title too short")
        return value
```

---

## 🚨 Error Handling

### Common Exceptions

```python
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError

# Handle not found
try:
    user = User.objects.get(id=user_id)
except User.DoesNotExist:
    raise ValidationError("User not found")

# Handle validation
if not email:
    raise ValidationError("Email required")

# Handle database errors
try:
    user.save()
except Exception as e:
    logger.error(f"Save error: {str(e)}")
    raise ValidationError("Could not save user")
```

---

## 📝 Configuration

### Environment Variables

```bash
# Database
DB_NAME=stackoverlow_db
DB_USER=postgres
DB_PASSWORD=postgres

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION_HOURS=24

# Debug
DEBUG=True
LOG_LEVEL=INFO
```

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL
psql -U postgres -d stackoverlow_db

# Reset migrations
python manage.py migrate zero [app]
```

### Redis Connection Issues

```bash
# Check Redis
redis-cli ping

# Clear Redis
redis-cli FLUSHALL
```

### Import Errors

```bash
# Verify imports
python -c "from src.models import User; print('OK')"

# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📚 Resources

### Django

- Docs: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/

### PostgreSQL

- Docs: https://www.postgresql.org/docs/

### Redis

- Docs: https://redis.io/documentation

### Celery

- Docs: https://docs.celeryproject.io/

### Elasticsearch

- Docs: https://www.elastic.co/guide/en/elasticsearch/reference/

---

## 🎯 Deployment Checklist

- [ ] Update .env with production values
- [ ] Set DEBUG=False
- [ ] Run migrations
- [ ] Collect static files
- [ ] Create superuser
- [ ] Test health endpoint
- [ ] Verify logging works
- [ ] Configure backups
- [ ] Set up monitoring
- [ ] Enable HTTPS

---

## 💡 Best Practices

### Code Quality

- Use type hints
- Write docstrings
- Follow PEP 8
- Use linters (pylint, flake8)
- Write tests

### Performance

- Use select_related/prefetch_related
- Index frequently queried fields
- Cache expensive operations
- Batch operations
- Monitor query performance

### Security

- Validate all inputs
- Use ORM to prevent SQL injection
- Hash passwords
- Implement rate limiting
- Use HTTPS in production

### Maintainability

- Write clean code
- Document complex logic
- Use meaningful names
- Keep functions small
- Follow DRY principle

---

## 🔗 Quick Links

- API Docs: See API_DOCUMENTATION.md
- Architecture: See ARCHITECTURE.md
- Setup: See README.md
- Source: /src directory

---

**Last Updated:** January 2024  
**Version:** 1.0
