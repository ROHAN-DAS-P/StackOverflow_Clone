"""
Error handling middleware
"""
import logging
import traceback
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework.exceptions import APIException

logger = logging.getLogger('app')


class ErrorHandlingMiddleware(MiddlewareMixin):
    """
    Middleware to handle errors and return structured error responses
    """
    
    def process_exception(self, request, exception):
        """
        Handle exceptions and return structured JSON response
        """
        request_id = getattr(request, 'request_id', 'N/A')
        
        # Log the exception
        logger.error(
            f"Exception occurred: {str(exception)}",
            exc_info=True,
            extra={'request_id': request_id}
        )
        
        # REST Framework exceptions
        if isinstance(exception, APIException):
            error_response = {
                'error': exception.detail if hasattr(exception, 'detail') else str(exception),
                'request_id': request_id,
            }
            return JsonResponse(error_response, status=exception.status_code)
        
        # Handle common exceptions
        if isinstance(exception, ValueError):
            return JsonResponse(
                {
                    'error': 'Invalid value',
                    'details': str(exception),
                    'request_id': request_id,
                },
                status=400
            )
        
        if isinstance(exception, KeyError):
            return JsonResponse(
                {
                    'error': 'Missing required field',
                    'details': str(exception),
                    'request_id': request_id,
                },
                status=400
            )
        
        # Generic 500 error
        return JsonResponse(
            {
                'error': 'Internal server error',
                'request_id': request_id,
            },
            status=500
        )


class ErrorResponseFormatter:
    """Utility class for standardized error responses"""
    
    @staticmethod
    def success(data, message='Success', status_code=200):
        """Format success response"""
        return JsonResponse(
            {
                'success': True,
                'message': message,
                'data': data,
            },
            status=status_code
        )
    
    @staticmethod
    def error(message, details=None, status_code=400, request_id='N/A'):
        """Format error response"""
        response = {
            'success': False,
            'error': message,
            'request_id': request_id,
        }
        
        if details:
            response['details'] = details
        
        return JsonResponse(response, status=status_code)
