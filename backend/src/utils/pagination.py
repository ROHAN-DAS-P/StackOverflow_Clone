"""
Pagination utilities
"""
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPagination(PageNumberPagination):
    """Custom pagination class for all list endpoints"""
    page_size = 20
    page_size_query_param = 'page_size'
    page_size_query_description = 'Number of results per page'
    max_page_size = 100
    page_query_param = 'page'
    page_query_description = 'Page number'
    
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'page_size': self.page_size,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'results': data
        })
