"""
Repository layer for database operations
Handles all CRUD operations and complex queries
"""
from django.db.models import Q, Count, Prefetch
from src.models import (
    User, Question, Answer, Article, CodeSnippet,
    Comment, Vote, Notification, SavedItem
)


class BaseRepository:
    """Base repository class with common operations"""
    
    def __init__(self, model):
        self.model = model
    
    def create(self, **kwargs):
        """Create and return a new instance"""
        instance = self.model(**kwargs)
        instance.save()
        return instance
    
    def update(self, instance, **kwargs):
        """Update instance with given fields"""
        for key, value in kwargs.items():
            setattr(instance, key, value)
        instance.save()
        return instance
    
    def delete(self, instance):
        """Delete instance"""
        instance.delete()
    
    def get_by_id(self, id):
        """Get instance by ID"""
        try:
            return self.model.objects.get(id=id)
        except self.model.DoesNotExist:
            return None
    
    def get_all(self, **filter_kwargs):
        """Get all instances with optional filters"""
        return self.model.objects.filter(**filter_kwargs)
    
    def get_paginated(self, page=1, page_size=20, **filter_kwargs):
        """Get paginated results"""
        queryset = self.get_all(**filter_kwargs)
        start = (page - 1) * page_size
        end = start + page_size
        return queryset[start:end]


class UserRepository(BaseRepository):
    """Repository for User operations"""
    
    def __init__(self):
        super().__init__(User)
    
    def get_by_username(self, username):
        """Get user by username"""
        try:
            return self.model.objects.get(username=username)
        except self.model.DoesNotExist:
            return None
    
    def get_by_email(self, email):
        """Get user by email"""
        try:
            return self.model.objects.get(email=email)
        except self.model.DoesNotExist:
            return None
    
    def get_top_contributors(self, limit=10):
        """Get top contributors by reputation"""
        return self.model.objects.all().order_by('-reputation')[:limit]
    
    def search_users(self, query):
        """Search users by username or email"""
        return self.model.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query)
        )


class QuestionRepository(BaseRepository):
    """Repository for Question operations"""
    
    def __init__(self):
        super().__init__(Question)
    
    def get_with_answers(self, question_id):
        """Get question with all answers and comments"""
        try:
            return self.model.objects.prefetch_related(
                Prefetch('answers__comments'),
                'comments'
            ).get(id=question_id)
        except self.model.DoesNotExist:
            return None
    
    def get_trending(self, limit=10):
        """Get trending questions (sorted by views and recent votes)"""
        return self.model.objects.annotate(
            answer_count=Count('answers')
        ).filter(is_closed=False).order_by('-views_count', '-votes_count')[:limit]
    
    def get_unanswered(self, limit=10):
        """Get unanswered questions"""
        return self.model.objects.annotate(
            answer_count=Count('answers')
        ).filter(answer_count=0, is_closed=False).order_by('-created_at')[:limit]
    
    def search(self, query):
        """Search questions by title or content"""
        return self.model.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query)
        )
    
    def get_by_tag(self, tag):
        """Get questions by tag"""
        return self.model.objects.filter(tags__contains=[tag])
    
    def get_by_author(self, author_id):
        """Get questions by author"""
        return self.model.objects.filter(author_id=author_id)
    
    def increment_views(self, question_id):
        """Increment view count"""
        question = self.get_by_id(question_id)
        if question:
            question.views_count += 1
            question.save(update_fields=['views_count'])


class AnswerRepository(BaseRepository):
    """Repository for Answer operations"""
    
    def __init__(self):
        super().__init__(Answer)
    
    def get_for_question(self, question_id):
        """Get all answers for a question"""
        return self.model.objects.filter(
            question_id=question_id
        ).order_by('-is_accepted', '-votes_count')
    
    def get_accepted_answer(self, question_id):
        """Get accepted answer for a question"""
        try:
            return self.model.objects.get(
                question_id=question_id,
                is_accepted=True
            )
        except self.model.DoesNotExist:
            return None
    
    def get_by_author(self, author_id):
        """Get all answers by author"""
        return self.model.objects.filter(author_id=author_id)
    
    def get_top_answers(self, limit=10):
        """Get top rated answers"""
        return self.model.objects.all().order_by('-votes_count')[:limit]


class ArticleRepository(BaseRepository):
    """Repository for Article operations"""
    
    def __init__(self):
        super().__init__(Article)
    
    def get_published(self):
        """Get all published articles"""
        return self.model.objects.filter(is_published=True)
    
    def get_by_category(self, category):
        """Get articles by category"""
        return self.model.objects.filter(
            category=category,
            is_published=True
        )
    
    def get_by_tag(self, tag):
        """Get articles by tag"""
        return self.model.objects.filter(
            tags__contains=[tag],
            is_published=True
        )
    
    def search(self, query):
        """Search articles"""
        return self.model.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query),
            is_published=True
        )
    
    def get_trending(self, limit=10):
        """Get trending articles"""
        return self.get_published().order_by('-views_count')[:limit]


class CommentRepository(BaseRepository):
    """Repository for Comment operations"""
    
    def __init__(self):
        super().__init__(Comment)
    
    def get_question_comments(self, question_id):
        """Get all comments on a question"""
        return self.model.objects.filter(question_id=question_id)
    
    def get_answer_comments(self, answer_id):
        """Get all comments on an answer"""
        return self.model.objects.filter(answer_id=answer_id)


class VoteRepository(BaseRepository):
    """Repository for Vote operations"""
    
    def __init__(self):
        super().__init__(Vote)
    
    def get_user_vote(self, voter_id, question_id=None, answer_id=None):
        """Get user's vote on a question or answer"""
        if question_id:
            try:
                return self.model.objects.get(
                    voter_id=voter_id,
                    question_id=question_id
                )
            except self.model.DoesNotExist:
                return None
        elif answer_id:
            try:
                return self.model.objects.get(
                    voter_id=voter_id,
                    answer_id=answer_id
                )
            except self.model.DoesNotExist:
                return None
    
    def get_votes_for_question(self, question_id):
        """Get all votes for a question"""
        return self.model.objects.filter(question_id=question_id)
    
    def get_votes_for_answer(self, answer_id):
        """Get all votes for an answer"""
        return self.model.objects.filter(answer_id=answer_id)


class NotificationRepository(BaseRepository):
    """Repository for Notification operations"""
    
    def __init__(self):
        super().__init__(Notification)
    
    def get_user_notifications(self, user_id, unread_only=False):
        """Get user's notifications"""
        query = self.model.objects.filter(recipient_id=user_id)
        if unread_only:
            query = query.filter(is_read=False)
        return query.order_by('-created_at')
    
    def mark_as_read(self, notification_id):
        """Mark notification as read"""
        notification = self.get_by_id(notification_id)
        if notification:
            from django.utils.timezone import now
            notification.is_read = True
            notification.read_at = now()
            notification.save()
    
    def get_unread_count(self, user_id):
        """Get count of unread notifications"""
        return self.model.objects.filter(
            recipient_id=user_id,
            is_read=False
        ).count()


class SavedItemRepository(BaseRepository):
    """Repository for SavedItem operations"""
    
    def __init__(self):
        super().__init__(SavedItem)
    
    def get_user_saved_items(self, user_id):
        """Get all saved items for a user"""
        return self.model.objects.filter(user_id=user_id)
    
    def is_saved(self, user_id, item_type, item_id):
        """Check if item is saved by user"""
        return self.model.objects.filter(
            user_id=user_id,
            item_type=item_type,
            item_id=item_id
        ).exists()


class CommunityMembersRepository(BaseRepository):
    """Repository for fetching active community members"""
    
    def __init__(self):
        super().__init__(User)
    
    def get_active_contributors(self, limit=10):
        """
        Get active community members sorted by reputation and contributions.
        Only includes users with at least one contribution (question or answer).
        """
        from datetime import timedelta
        from django.utils.timezone import now
        
        # Get users who have posted questions or answers
        active_users = User.objects.annotate(
            question_count=Count('questions', distinct=True),
            answer_count=Count('answers', distinct=True),
            total_contributions=Count('questions', distinct=True) + Count('answers', distinct=True)
        ).filter(
            # Only users with at least one contribution
            Q(question_count__gt=0) | Q(answer_count__gt=0)
        ).order_by(
            '-reputation',  # Sort by reputation (descending)
            '-total_contributions'  # Then by contribution count
        )
        
        return active_users[:limit]
    
    def get_contributors_by_reputation(self, limit=10, min_reputation=0):
        """Get community members sorted by reputation"""
        return User.objects.annotate(
            question_count=Count('questions', distinct=True),
            answer_count=Count('answers', distinct=True)
        ).filter(
            Q(question_count__gt=0) | Q(answer_count__gt=0),
            reputation__gte=min_reputation
        ).order_by('-reputation')[:limit]
    
    def get_recent_contributors(self, limit=10, days=30):
        """Get recently active contributors"""
        from datetime import timedelta
        from django.utils.timezone import now
        
        recent_date = now() - timedelta(days=days)
        
        return User.objects.annotate(
            question_count=Count('questions', distinct=True),
            answer_count=Count('answers', distinct=True)
        ).filter(
            Q(question_count__gt=0) | Q(answer_count__gt=0),
            last_active__gte=recent_date
        ).order_by('-last_active')[:limit]
    
    def get_top_answerers(self, limit=10):
        """Get users with most answers"""
        return User.objects.annotate(
            answer_count=Count('answers', distinct=True),
            question_count=Count('questions', distinct=True)
        ).filter(
            answer_count__gt=0
        ).order_by('-answer_count')[:limit]
    
    def get_member_stats(self, user_id):
        """Get detailed stats for a community member"""
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        question_count = user.questions.count()
        answer_count = user.answers.count()
        
        return {
            'id': user.id,
            'username': user.username,
            'profile_picture': user.profile_picture,
            'reputation': user.reputation,
            'questions': question_count,
            'answers': answer_count,
            'bio': user.bio,
            'is_verified': user.is_verified,
            'created_at': user.created_at,
            'last_active': user.last_active,
            'total_contributions': question_count + answer_count
        }
