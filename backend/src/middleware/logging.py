"""
Request logging middleware
"""
import logging
import uuid
import time
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpRequest

logger = logging.getLogger('app')


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log all incoming requests with structured information
    """
    
    def process_request(self, request):
        """
        Log request details at the start of request processing
        """
        # Add request ID for tracking
        request_id = request.META.get('HTTP_X_REQUEST_ID', str(uuid.uuid4()))
        request.request_id = request_id
        request._start_time = time.time()
        
        log_data = {
            'request_id': request_id,
            'method': request.method,
            'path': request.path,
            'remote_addr': self.get_client_ip(request),
            'user': getattr(request.user, 'username', 'Anonymous'),
        }
        
        logger.info(f"Incoming request: {log_data}")
        
        return None
    
    def process_response(self, request, response):
        """
        Log response details at the end of request processing
        """
        if hasattr(request, '_start_time'):
            duration = time.time() - request._start_time
        else:
            duration = 0
        
        log_data = {
            'request_id': getattr(request, 'request_id', 'N/A'),
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'duration_ms': round(duration * 1000, 2),
            'remote_addr': self.get_client_ip(request),
            'user': getattr(request.user, 'username', 'Anonymous'),
        }
        
        # Log based on status code
        if response.status_code >= 500:
            logger.error(f"Response: {log_data}")
        elif response.status_code >= 400:
            logger.warning(f"Response: {log_data}")
        else:
            logger.info(f"Response: {log_data}")
        
        return response
    
    @staticmethod
    def get_client_ip(request):
        """Get client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
