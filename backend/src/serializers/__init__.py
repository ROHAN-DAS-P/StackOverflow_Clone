"""
DRF Serializers for API endpoints
"""
from rest_framework import serializers
from src.models import (
    User, Question, Answer, Article, CodeSnippet, 
    Comment, Vote, Notification, SavedItem
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    questions_count = serializers.SerializerMethodField()
    answers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'bio', 'profile_picture', 'reputation', 'is_verified',
            'role', 'created_at', 'last_active', 'questions_count', 'answers_count'
        ]
        read_only_fields = ['id', 'reputation', 'created_at', 'last_active', 'questions_count', 'answers_count']
    
    def get_questions_count(self, obj):
        return obj.questions.count()
    
    def get_answers_count(self, obj):
        return obj.answers.count()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 
                 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for Comment model"""
    
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'votes_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'votes_count', 'created_at', 'updated_at']


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for Vote model"""
    
    class Meta:
        model = Vote
        fields = ['id', 'vote_type', 'created_at']
        read_only_fields = ['id', 'created_at']


class AnswerSerializer(serializers.ModelSerializer):
    """Serializer for Answer model"""
    
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Answer
        fields = [
            'id', 'content', 'author', 'votes_count', 'is_accepted',
            'comments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'votes_count', 'created_at', 'updated_at']


class AnswerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing answers"""
    
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Answer
        fields = [
            'id', 'author', 'votes_count', 'is_accepted', 'created_at'
        ]


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model"""
    
    author = UserSerializer(read_only=True)
    answers = AnswerListSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'title', 'content', 'author', 'tags', 'views_count',
            'votes_count', 'is_closed', 'is_pinned', 'answers', 'comments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'views_count', 'votes_count', 'created_at', 'updated_at']


class QuestionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing questions"""
    
    author = UserSerializer(read_only=True)
    answers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'title', 'author', 'tags', 'views_count', 'votes_count',
            'answers_count', 'is_closed', 'created_at'
        ]
    
    def get_answers_count(self, obj):
        return obj.answers.count()


class ArticleSerializer(serializers.ModelSerializer):
    """Serializer for Article model"""
    
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'content', 'slug', 'author', 'category',
            'tags', 'views_count', 'votes_count', 'is_published',
            'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'slug', 'views_count', 'votes_count', 'created_at', 'updated_at']


class ArticleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing articles"""
    
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'author', 'category', 'tags',
            'views_count', 'votes_count', 'created_at'
        ]


class CodeSnippetSerializer(serializers.ModelSerializer):
    """Serializer for CodeSnippet model"""
    
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = CodeSnippet
        fields = [
            'id', 'title', 'code', 'language', 'description', 'author',
            'tags', 'views_count', 'votes_count', 'is_public',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'views_count', 'votes_count', 'created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'link',
            'is_read', 'read_at', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class SavedItemSerializer(serializers.ModelSerializer):
    """Serializer for SavedItem model"""
    
    class Meta:
        model = SavedItem
        fields = ['id', 'item_type', 'item_id', 'created_at']
        read_only_fields = ['id', 'created_at']
