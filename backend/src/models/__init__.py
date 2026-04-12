"""
Database models for the StackOverflow-like platform
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
from django.utils.timezone import now
import uuid


class User(AbstractUser):
    """Extended User model with additional fields"""
    
    class UserRole(models.TextChoices):
        ADMIN = 'admin', 'Administrator'
        MODERATOR = 'moderator', 'Moderator'
        USER = 'user', 'Regular User'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.USER)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    reputation = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(default=now)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['reputation']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.role})"


class Question(models.Model):
    """Question model for knowledge sharing"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='questions')
    tags = models.JSONField(default=list)  # Stored as JSON array
    views_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    votes_count = models.IntegerField(default=0)
    is_closed = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['is_closed']),
            models.Index(fields=['created_at']),
            models.Index(fields=['votes_count']),
            models.Index(fields=['views_count']),
        ]
    
    def __str__(self):
        return self.title


class Answer(models.Model):
    """Answer model for responses to questions"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    votes_count = models.IntegerField(default=0)
    is_accepted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_accepted', '-votes_count', '-created_at']
        indexes = [
            models.Index(fields=['question']),
            models.Index(fields=['author']),
            models.Index(fields=['is_accepted']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Answer to {self.question.title}"


class Article(models.Model):
    """Article model for knowledge bases"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    slug = models.SlugField(unique=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='articles')
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list)
    views_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    votes_count = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['category']),
            models.Index(fields=['is_published']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.title


class CodeSnippet(models.Model):
    """Code snippet model for saved code"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    code = models.TextField()
    language = models.CharField(max_length=50)  # python, javascript, etc.
    description = models.TextField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='snippets')
    tags = models.JSONField(default=list)
    views_count = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    votes_count = models.IntegerField(default=0)
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['language']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return self.title


class Comment(models.Model):
    """Comment model for discussions"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    
    # Can be on Question or Answer
    question = models.ForeignKey(Question, on_delete=models.CASCADE, 
                                related_name='comments', null=True, blank=True)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, 
                              related_name='comments', null=True, blank=True)
    
    votes_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['author']),
            models.Index(fields=['question']),
            models.Index(fields=['answer']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author}"


class Vote(models.Model):
    """Vote model for voting on questions, answers, etc"""
    
    class VoteType(models.TextChoices):
        UPVOTE = 'upvote', 'Upvote'
        DOWNVOTE = 'downvote', 'Downvote'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    voter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    vote_type = models.CharField(max_length=10, choices=VoteType.choices)
    
    # Can vote on Question or Answer
    question = models.ForeignKey(Question, on_delete=models.CASCADE, 
                                related_name='voter_votes', null=True, blank=True)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, 
                              related_name='voter_votes', null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['voter']),
            models.Index(fields=['vote_type']),
        ]
        # Ensure one vote per user per object
        unique_together = (
            ('voter', 'question'),
            ('voter', 'answer'),
        )
    
    def __str__(self):
        return f"{self.voter} {self.vote_type}"


class Notification(models.Model):
    """Notification model for user notifications"""
    
    class NotificationType(models.TextChoices):
        NEW_ANSWER = 'new_answer', 'New Answer'
        NEW_COMMENT = 'new_comment', 'New Comment'
        ANSWER_ACCEPTED = 'answer_accepted', 'Answer Accepted'
        UPVOTE = 'upvote', 'Upvote'
        MENTION = 'mention', 'Mention'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=500)  # Link to the related object
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient']),
            models.Index(fields=['is_read']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        return f"Notification for {self.recipient}"


class SavedItem(models.Model):
    """Saved items model for bookmarking"""
    
    class ItemType(models.TextChoices):
        QUESTION = 'question', 'Question'
        ANSWER = 'answer', 'Answer'
        ARTICLE = 'article', 'Article'
        SNIPPET = 'snippet', 'Code Snippet'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_items')
    item_type = models.CharField(max_length=50, choices=ItemType.choices)
    item_id = models.UUIDField()  # Reference to Question, Answer, Article, or Snippet
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['item_type']),
        ]
        unique_together = ('user', 'item_type', 'item_id')
    
    def __str__(self):
        return f"{self.user} saved {self.item_type}"
