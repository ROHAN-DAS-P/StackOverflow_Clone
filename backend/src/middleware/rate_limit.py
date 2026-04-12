"""
Rate limiting middleware
"""
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.core.cache import cache
from src.config.settings import MAX_LOGIN_ATTEMPTS, LOGIN_ATTEMPT_WINDOW_MINUTES

logger = logging.getLogger('app')


class RateLimitMiddleware(MiddlewareMixin):
    """
    Middleware to implement rate limiting using Redis cache
    """
    
    # Routes exempt from rate limiting
    EXEMPT_ROUTES = ['/api/health/', '/api/metrics/']
    
    # Routes with stricter rate limits
    STRICT_LIMIT_ROUTES = ['/api/auth/login', '/api/auth/register']
    
    def process_request(self, request):
        """Check rate limits before processing request"""
        
        # Skip exempt routes
        if any(request.path.startswith(route) for route in self.EXEMPT_ROUTES):
            return None
        
        client_ip = self.get_client_ip(request)
        
        # Stricter limits for auth endpoints
        if any(request.path.startswith(route) for route in self.STRICT_LIMIT_ROUTES):
            return self._check_auth_rate_limit(request, client_ip)
        
        # General rate limiting
        return self._check_general_rate_limit(request, client_ip)
    
    def _check_auth_rate_limit(self, request, client_ip):
        """Check rate limit for authentication endpoints"""
        
        cache_key = f"auth_attempts:{client_ip}"
        attempts = cache.get(cache_key, 0)
        
        if attempts >= MAX_LOGIN_ATTEMPTS:
            logger.warning(f"Rate limit exceeded for auth from IP: {client_ip}")
            return JsonResponse(
                {
                    'error': 'Too many attempts. Please try again later.',
                    'retry_after': LOGIN_ATTEMPT_WINDOW_MINUTES * 60,
                },
                status=429
            )
        
        # Increment attempt counter
        cache.set(
            cache_key,
            attempts + 1,
            timeout=LOGIN_ATTEMPT_WINDOW_MINUTES * 60
        )
        
        return None
    
    def _check_general_rate_limit(self, request, client_ip):
        """Check general rate limit (per IP)"""
        
        cache_key = f"rate_limit:{client_ip}"
        request_count = cache.get(cache_key, 0)
        
        # 100 requests per minute per IP
        if request_count >= 100:
            logger.warning(f"General rate limit exceeded for IP: {client_ip}")
            return JsonResponse(
                {
                    'error': 'Rate limit exceeded',
                    'retry_after': 60,
                },
                status=429
            )
        
        # Increment request counter
        cache.set(cache_key, request_count + 1, timeout=60)
        
        return None
    
    @staticmethod
    def get_client_ip(request):
        """Get client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')
