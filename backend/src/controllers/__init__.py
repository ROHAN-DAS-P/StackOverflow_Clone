"""
Controllers/Views for API endpoints
REST API view handlers
"""
import logging
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from src.models import (
    User, Question, Answer, Article, CodeSnippet,
    Comment, Vote, Notification, SavedItem
)
from src.serializers import (
    UserSerializer, UserRegistrationSerializer, QuestionSerializer, QuestionListSerializer,
    AnswerSerializer, AnswerListSerializer, ArticleSerializer, ArticleListSerializer,
    CodeSnippetSerializer, CommentSerializer, VoteSerializer, NotificationSerializer,
    SavedItemSerializer
)
from src.services import AuthService, QuestionService, AnswerService, VoteService, NotificationService
from src.middleware.error import ErrorResponseFormatter
from src.utils import CacheService, SearchService

logger = logging.getLogger('app')


class StatsView(generics.GenericAPIView):
    """Aggregate counts for public dashboard stats (single round-trip)."""

    permission_classes = [AllowAny]

    def get(self, request):
        UserModel = get_user_model()
        return Response(
            {
                'questions': Question.objects.count(),
                'answers': Answer.objects.count(),
                'members': UserModel.objects.count(),
            }
        )


class HealthCheckView(generics.GenericAPIView):
    """Health check endpoint"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'version': '1.0.0',
            'message': 'StackOverflow backend is running'
        })


class AuthController(generics.GenericAPIView):
    """Authentication controller"""
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    auth_service = AuthService()
    
    def post(self, request, action):
        if action == 'register':
            return self.register(request)
        elif action == 'login':
            return self.login(request)
        return Response({'error': 'Invalid action'}, status=400)
    
    def register(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = serializer.validated_data
            user = self.auth_service.register(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                password_confirm=data['password_confirm'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', '')
            )
            
            user_serializer = UserSerializer(user)
            return Response(
                {
                    'message': 'User registered successfully',
                    'user': user_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def login(self, request):
        """Login user and return tokens"""
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        
        if not identifier or not password:
            return Response(
                {'error': 'Username/email and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user, tokens = self.auth_service.login(identifier, password)
            user_serializer = UserSerializer(user)
            
            return Response(
                {
                    'message': 'Login successful',
                    'user': user_serializer.data,
                    'tokens': tokens
                },
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserViewSet(viewsets.ModelViewSet):
    """User viewset"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def profile(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Update current user profile"""
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Profile updated', 'data': serializer.data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionViewSet(viewsets.ModelViewSet):
    """Question viewset"""
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]
    question_service = QuestionService()
    cache_service = CacheService()

    def get_permissions(self):
        # Public read access for question discovery endpoints.
        if self.action in ['list', 'retrieve', 'trending', 'unanswered']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QuestionListSerializer
        return QuestionSerializer
    
    def list(self, request, *args, **kwargs):
        """List questions with caching"""
        cache_key = 'questions:list'
        cached = self.cache_service.get(cache_key)
        
        if cached:
            return Response(cached)
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        self.cache_service.set(cache_key, serializer.data, timeout=300)
        
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create a new question"""
        serializer = QuestionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            question = self.question_service.create_question(
                title=serializer.validated_data['title'],
                content=serializer.validated_data['content'],
                author_id=request.user.id,
                tags=serializer.validated_data.get('tags', [])
            )
            
            # Invalidate cache
            self.cache_service.delete('questions:list')
            
            response_serializer = QuestionSerializer(question)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, *args, **kwargs):
        """Get a specific question"""
        try:
            question = self.question_service.get_question(kwargs['pk'])
            serializer = QuestionSerializer(question)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending questions"""
        questions = self.question_service.get_trending()
        serializer = QuestionListSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unanswered(self, request):
        """Get unanswered questions"""
        questions = self.question_service.get_unanswered()
        serializer = QuestionListSerializer(questions, many=True)
        return Response(serializer.data)


class AnswerViewSet(viewsets.ModelViewSet):
    """Answer viewset"""
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticated]
    answer_service = AnswerService()
    notification_service = NotificationService()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """Filter answers by question_id if provided"""
        queryset = super().get_queryset()
        question_id = self.request.query_params.get('question_id')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        return queryset.order_by('-is_accepted', '-votes_count', '-created_at')
    
    def create(self, request, *args, **kwargs):
        """Create an answer to a question"""
        question_id = request.data.get('question_id')
        
        if not question_id:
            return Response(
                {'error': 'question_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AnswerSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            answer = self.answer_service.create_answer(
                question_id=question_id,
                content=serializer.validated_data['content'],
                author_id=request.user.id
            )
            
            # Notify question author
            question = Question.objects.get(id=question_id)
            self.notification_service.notify_new_answer(question, answer)
            
            response_serializer = AnswerSerializer(answer)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def accept(self, request):
        """Accept an answer"""
        answer_id = request.data.get('answer_id')
        question_id = request.data.get('question_id')
        
        if not answer_id or not question_id:
            return Response(
                {'error': 'answer_id and question_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            answer = self.answer_service.accept_answer(answer_id, question_id)
            serializer = AnswerSerializer(answer)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VoteController(generics.GenericAPIView):
    """Vote controller"""
    permission_classes = [IsAuthenticated]
    vote_service = VoteService()
    
    def post(self, request):
        """Vote on a question or answer"""
        vote_type = request.data.get('vote_type')
        question_id = request.data.get('question_id')
        answer_id = request.data.get('answer_id')
        
        if not vote_type or vote_type not in ['upvote', 'downvote']:
            return Response(
                {'error': 'Invalid vote_type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not question_id and not answer_id:
            return Response(
                {'error': 'question_id or answer_id required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            if question_id:
                result = self.vote_service.vote_question(
                    question_id, request.user.id, vote_type
                )
                return Response({
                    'message': 'Vote recorded',
                    'votes_count': result.votes_count
                })
            else:
                result = self.vote_service.vote_answer(
                    answer_id, request.user.id, vote_type
                )
                return Response({
                    'message': 'Vote recorded',
                    'votes_count': result.votes_count
                })
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SearchController(generics.GenericAPIView):
    """Search controller"""
    permission_classes = [AllowAny]
    search_service = SearchService()
    question_service = QuestionService()
    
    def get(self, request):
        """Search across questions and articles"""
        query = request.query_params.get('q', '')
        search_type = request.query_params.get('type', 'all')  # all, questions, articles
        
        if not query or len(query) < 2:
            return Response(
                {'error': 'Query must be at least 2 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = {
            'questions': [],
            'articles': [],
            'query': query
        }
        
        try:
            if search_type in ['all', 'questions']:
                # Search in database as fallback
                questions = self.question_service.search_questions(query)
                results['questions'] = QuestionListSerializer(questions[:10], many=True).data
            
            return Response(results)
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            return Response(
                {'error': 'Search failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Notification viewset"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    notification_service = NotificationService()
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = Notification.objects.filter(
            recipient=request.user,
            is_read=False
        )
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count"""
        count = self.notification_service.get_unread_count(request.user.id)
        return Response({'unread_count': count})
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        self.notification_service.mark_as_read(notification.id)
        return Response({'message': 'Marked as read'})
