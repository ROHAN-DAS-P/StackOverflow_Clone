"""
Configuration management using environment variables
"""
import os
from decouple import config, Csv

# Database
DB_ENGINE = config('DB_ENGINE', default='django.db.backends.postgresql')
DB_NAME = config('DB_NAME', default='stackoverlow_db')
DB_USER = config('DB_USER', default='postgres')
DB_PASSWORD = config('DB_PASSWORD', default='postgres')
DB_HOST = config('DB_HOST', default='localhost')
DB_PORT = config('DB_PORT', default='5432')

# Django
DEBUG = config('DEBUG', default=False, cast=bool)
SECRET_KEY = config('SECRET_KEY', default='dev-secret-key-not-for-production')
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())
ENVIRONMENT = config('ENVIRONMENT', default='development')

# Redis
REDIS_URL = config('REDIS_URL', default='redis://localhost:6379/0')
REDIS_CACHE_URL = config('REDIS_CACHE_URL', default='redis://localhost:6379/1')
REDIS_QUEUE_URL = config('REDIS_QUEUE_URL', default='redis://localhost:6379/2')

# Elasticsearch
ELASTICSEARCH_HOSTS = config('ELASTICSEARCH_HOSTS', default='localhost:9200')
ELASTICSEARCH_SCHEME = config('ELASTICSEARCH_SCHEME', default='http')

# JWT
JWT_SECRET = config('JWT_SECRET', default='dev-jwt-secret-not-for-production')
JWT_ALGORITHM = config('JWT_ALGORITHM', default='HS256')
JWT_EXPIRATION_HOURS = config('JWT_EXPIRATION_HOURS', default=24, cast=int)
JWT_REFRESH_EXPIRATION_DAYS = config('JWT_REFRESH_EXPIRATION_DAYS', default=7, cast=int)

# Logging
LOG_LEVEL = config('LOG_LEVEL', default='INFO')
LOG_DIR = os.path.join(os.path.dirname(__file__), '../..', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

# CORS
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', 
                               default='http://localhost:3000,http://localhost:8000', 
                               cast=Csv())

# Celery
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/2')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/2')
CELERY_TASK_TIME_LIMIT = config('CELERY_TASK_TIME_LIMIT', default=3600, cast=int)

# Security
PASSWORD_MIN_LENGTH = config('PASSWORD_MIN_LENGTH', default=8, cast=int)
MAX_LOGIN_ATTEMPTS = config('MAX_LOGIN_ATTEMPTS', default=5, cast=int)
LOGIN_ATTEMPT_WINDOW_MINUTES = config('LOGIN_ATTEMPT_WINDOW_MINUTES', default=15, cast=int)

# AI Service
USE_AI_SUMMARIES = config('USE_AI_SUMMARIES', default=False, cast=bool)
AI_SERVICE_URL = config('AI_SERVICE_URL', default='http://localhost:5000')
AI_SERVICE_API_KEY = config('AI_SERVICE_API_KEY', default='')
