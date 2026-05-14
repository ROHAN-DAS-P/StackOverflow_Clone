"""
URL routing configuration
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from src.controllers import (
    HealthCheckView, StatsView, AuthController, UserViewSet, QuestionViewSet,
    AnswerViewSet, VoteController, SearchController, NotificationViewSet,
    CommunityMembersView
)

# Create router for viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'answers', AnswerViewSet, basename='answer')
router.register(r'notifications', NotificationViewSet, basename='notification')

api_urlpatterns = [
    # Health check
    path('health/', HealthCheckView.as_view(), name='health'),
    path('stats/', StatsView.as_view(), name='stats'),
    
    # Authentication
    path('auth/register/', AuthController.as_view(), {'action': 'register'}, name='register'),
    path('auth/login/', AuthController.as_view(), {'action': 'login'}, name='login'),
    
    # ViewSet routes
    path('', include(router.urls)),
    
    # Community members
    path('community-members/', CommunityMembersView.as_view(), name='community-members'),
    
    # Voting
    path('votes/', VoteController.as_view(), name='vote'),
    
    # Search
    path('search/', SearchController.as_view(), name='search'),
]

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),
    
    # API routes
    path('api/', include(api_urlpatterns)),
]
