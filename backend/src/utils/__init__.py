"""
Utility modules for pagination, caching, and search
"""
from rest_framework.pagination import PageNumberPagination


class CustomPagination(PageNumberPagination):
    """Custom pagination class"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CacheService:
    """Service for handling caching operations"""
    
    def __init__(self):
        from django.core.cache import cache
        self.cache = cache
    
    def get(self, key, default=None):
        """Get value from cache"""
        return self.cache.get(key, default)
    
    def set(self, key, value, timeout=300):
        """Set value in cache"""
        self.cache.set(key, value, timeout)
    
    def delete(self, key):
        """Delete key from cache"""
        self.cache.delete(key)
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()
    
    # Cache key templates
    @staticmethod
    def question_key(question_id):
        return f"question:{question_id}"
    
    @staticmethod
    def user_key(user_id):
        return f"user:{user_id}"
    
    @staticmethod
    def trending_questions_key():
        return "trending:questions"
    
    @staticmethod
    def search_results_key(query):
        return f"search:{query}"


class SearchService:
    """Service for handling search operations with Elasticsearch"""
    
    def __init__(self):
        from elasticsearch import Elasticsearch
        from src.config.settings import ELASTICSEARCH_HOSTS, ELASTICSEARCH_SCHEME
        
        # Format hosts with scheme for Elasticsearch 8+
        hosts_url = f"{ELASTICSEARCH_SCHEME}://{ELASTICSEARCH_HOSTS}"
        self.client = Elasticsearch(
            hosts=[hosts_url],
            verify_certs=False,
            ssl_show_warn=False
        )
        self.index_name = 'knowledge'
    
    def index_question(self, question):
        """Index a question in Elasticsearch"""
        body = {
            'title': question.title,
            'content': question.content,
            'author': question.author.username,
            'tags': question.tags,
            'created_at': question.created_at,
            'views_count': question.views_count,
            'votes_count': question.votes_count,
        }
        
        self.client.index(
            index=self.index_name,
            id=str(question.id),
            body=body
        )
    
    def search(self, query, index='all'):
        """Search across documents"""
        
        search_body = {
            'query': {
                'multi_match': {
                    'query': query,
                    'fields': ['title^2', 'content', 'tags']
                }
            },
            'size': 20
        }
        
        try:
            results = self.client.search(index=self.index_name, body=search_body)
            return results['hits']['hits']
        except Exception as e:
            from logging import getLogger
            logger = getLogger('app')
            logger.error(f"Search error: {str(e)}")
            return []
    
    def delete_document(self, doc_id):
        """Delete a document from index"""
        try:
            self.client.delete(index=self.index_name, id=str(doc_id))
        except Exception as e:
            from logging import getLogger
            logger = getLogger('app')
            logger.error(f"Delete error: {str(e)}")


class UtilService:
    """General utility service"""
    
    @staticmethod
    def format_response(data, message='Success', status_code=200):
        """Format successful response"""
        return {
            'success': True,
            'message': message,
            'data': data,
            'status': status_code,
        }
    
    @staticmethod
    def format_error(error_message, details=None, status_code=400):
        """Format error response"""
        return {
            'success': False,
            'error': error_message,
            'details': details,
            'status': status_code,
        }
