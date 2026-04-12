"""
Celery configuration
"""
import os
from celery import Celery
from src.config.settings import (
    CELERY_BROKER_URL, CELERY_RESULT_BACKEND, CELERY_TASK_TIME_LIMIT
)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.conf')

app = Celery('stackoverlow')

# Load configuration
app.conf.update(
    broker_url=CELERY_BROKER_URL,
    result_backend=CELERY_RESULT_BACKEND,
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    task_time_limit=CELERY_TASK_TIME_LIMIT,
    task_always_eager=False,
    task_eager_propagates=True,
)

# Auto-discover tasks
app.autodiscover_tasks(['src.jobs'])

# Celery Beat Schedule
from celery.schedules import crontab

app.conf.beat_schedule = {
    'cleanup-notifications': {
        'task': 'src.jobs.cleanup_expired_notifications',
        'schedule': crontab(hour=2, minute=0),  # Run daily at 2 AM
    },
    'sync-reputation': {
        'task': 'src.jobs.sync_reputation',
        'schedule': crontab(hour='0,6,12,18'),  # Run every 6 hours at 0, 6, 12, 18
    },
}
