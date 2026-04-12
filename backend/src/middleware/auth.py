"""
Authentication middleware with JWT support
"""
import jwt
import logging
from functools import wraps
from django.http import JsonResponse
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from src.config.settings import JWT_SECRET, JWT_ALGORITHM
from src.models import User

logger = logging.getLogger('app')


class JWTAuthentication(BaseAuthentication):
    """
    JWT Token Authentication for DRF
    """
    keyword = 'Bearer'
    
    def authenticate(self, request):
        # Get authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '').split()
        
        if not auth_header or auth_header[0].lower() != self.keyword.lower():
            return None
        
        if len(auth_header) == 1:
            raise AuthenticationFailed('Invalid token header')
        
        if len(auth_header) > 2:
            raise AuthenticationFailed('Invalid token header')
        
        try:
            token = auth_header[1]
        except IndexError:
            raise AuthenticationFailed('Invalid token')
        
        return self.authenticate_credentials(token)
    
    def authenticate_credentials(self, key):
        try:
            payload = jwt.decode(key, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        
        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')
        
        if not user.is_active:
            raise AuthenticationFailed('User inactive')
        
        return (user, key)


def token_required(view_func):
    """Decorator for protecting views with token authentication"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse(
                {'error': 'Unauthorized'},
                status=401
            )
        
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user = User.objects.get(id=payload['user_id'])
            request.user = user
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return JsonResponse(
                {'error': 'Invalid token'},
                status=401
            )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


def create_access_token(user_id):
    """Create JWT access token"""
    import datetime
    from src.config.settings import JWT_EXPIRATION_HOURS
    
    payload = {
        'user_id': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.datetime.utcnow(),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def create_tokens(user_id):
    """Create both access and refresh tokens"""
    import datetime
    from src.config.settings import JWT_EXPIRATION_HOURS, JWT_REFRESH_EXPIRATION_DAYS
    
    access_payload = {
        'user_id': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.datetime.utcnow(),
        'type': 'access',
    }
    
    refresh_payload = {
        'user_id': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=JWT_REFRESH_EXPIRATION_DAYS),
        'iat': datetime.datetime.utcnow(),
        'type': 'refresh',
    }
    
    access_token = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
    }
