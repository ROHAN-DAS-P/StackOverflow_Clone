"""
Service layer for business logic
All business rules and validations go here
"""
import logging
from django.contrib.auth.hashers import make_password, check_password
from django.utils.timezone import now
from src.repositories import (
    UserRepository, QuestionRepository, AnswerRepository,
    ArticleRepository, CommentRepository, VoteRepository,
    NotificationRepository, SavedItemRepository
)
from src.middleware.auth import create_tokens
from src.config.settings import PASSWORD_MIN_LENGTH

logger = logging.getLogger('app')


class AuthService:
    """Authentication business logic"""
    
    def __init__(self):
        self.user_repo = UserRepository()
    
    def register(self, username, email, password, password_confirm, first_name='', last_name=''):
        """Register a new user"""
        
        # Validation
        if len(password) < PASSWORD_MIN_LENGTH:
            raise ValueError(f'Password must be at least {PASSWORD_MIN_LENGTH} characters')
        
        if password != password_confirm:
            raise ValueError('Passwords do not match')
        
        if self.user_repo.get_by_username(username):
            raise ValueError('Username already exists')
        
        if self.user_repo.get_by_email(email):
            raise ValueError('Email already registered')
        
        # Create user
        hashed_password = make_password(password)
        user = self.user_repo.create(
            username=username,
            email=email,
            password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )
        
        logger.info(f"User created: {username}")
        return user
    
    def login(self, username, password):
        """Authenticate user and return tokens"""
        
        user = self.user_repo.get_by_username(username)
        
        if not user or not check_password(password, user.password):
            raise ValueError('Invalid credentials')
        
        if not user.is_active:
            raise ValueError('Account is inactive')
        
        # Update last active
        user.last_active = now()
        user.save(update_fields=['last_active'])
        
        tokens = create_tokens(user.id)
        logger.info(f"User logged in: {username}")
        
        return user, tokens
    
    def validate_token(self, token):
        """Validate JWT token"""
        import jwt
        from src.config.settings import JWT_SECRET, JWT_ALGORITHM
        
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError('Token expired')
        except jwt.InvalidTokenError:
            raise ValueError('Invalid token')


class QuestionService:
    """Business logic for questions"""
    
    def __init__(self):
        self.question_repo = QuestionRepository()
        self.user_repo = UserRepository()
    
    def create_question(self, title, content, author_id, tags=None):
        """Create a new question"""
        
        if not title or len(title) < 10:
            raise ValueError('Title must be at least 10 characters')
        
        if not content or len(content) < 20:
            raise ValueError('Content must be at least 20 characters')
        
        tags = tags or []
        
        question = self.question_repo.create(
            title=title,
            content=content,
            author_id=author_id,
            tags=tags
        )
        
        logger.info(f"Question created: {question.id}")
        return question
    
    def update_question(self, question_id, **kwargs):
        """Update question"""
        question = self.question_repo.get_by_id(question_id)
        if not question:
            raise ValueError('Question not found')
        
        updated = self.question_repo.update(question, **kwargs)
        logger.info(f"Question updated: {question_id}")
        return updated
    
    def get_question(self, question_id):
        """Get question with increment view count"""
        question = self.question_repo.get_with_answers(question_id)
        if not question:
            raise ValueError('Question not found')
        
        self.question_repo.increment_views(question_id)
        return question
    
    def delete_question(self, question_id):
        """Delete question"""
        question = self.question_repo.get_by_id(question_id)
        if not question:
            raise ValueError('Question not found')
        
        self.question_repo.delete(question)
        logger.info(f"Question deleted: {question_id}")
    
    def search_questions(self, query):
        """Search questions"""
        return self.question_repo.search(query)
    
    def get_trending(self):
        """Get trending questions"""
        return self.question_repo.get_trending()
    
    def get_unanswered(self):
        """Get unanswered questions"""
        return self.question_repo.get_unanswered()


class AnswerService:
    """Business logic for answers"""
    
    def __init__(self):
        self.answer_repo = AnswerRepository()
        self.question_repo = QuestionRepository()
    
    def create_answer(self, question_id, content, author_id):
        """Create a new answer"""
        
        if not content or len(content) < 20:
            raise ValueError('Answer must be at least 20 characters')
        
        question = self.question_repo.get_by_id(question_id)
        if not question:
            raise ValueError('Question not found')
        
        if question.is_closed:
            raise ValueError('Question is closed')
        
        answer = self.answer_repo.create(
            question_id=question_id,
            content=content,
            author_id=author_id
        )
        
        logger.info(f"Answer created: {answer.id}")
        return answer
    
    def accept_answer(self, answer_id, question_id):
        """Mark an answer as accepted"""
        
        # Make sure only one answer is accepted
        current_accepted = self.answer_repo.get_accepted_answer(question_id)
        if current_accepted:
            self.answer_repo.update(current_accepted, is_accepted=False)
        
        answer = self.answer_repo.get_by_id(answer_id)
        if not answer:
            raise ValueError('Answer not found')
        
        updated = self.answer_repo.update(answer, is_accepted=True)
        logger.info(f"Answer accepted: {answer_id}")
        return updated


class VoteService:
    """Business logic for voting"""
    
    def __init__(self):
        self.vote_repo = VoteRepository()
        self.question_repo = QuestionRepository()
        self.answer_repo = AnswerRepository()
    
    def vote_question(self, question_id, voter_id, vote_type):
        """Vote on a question"""
        
        question = self.question_repo.get_by_id(question_id)
        if not question:
            raise ValueError('Question not found')
        
        # Check if user already voted
        existing_vote = self.vote_repo.get_user_vote(voter_id, question_id=question_id)
        
        if existing_vote:
            # Remove or update existing vote
            if existing_vote.vote_type == vote_type:
                # Same vote type - remove vote
                self.vote_repo.delete(existing_vote)
                # Update vote count
                if vote_type == 'upvote':
                    question.votes_count -= 1
                else:
                    question.votes_count += 1
            else:
                # Different vote type - update
                self.vote_repo.update(existing_vote, vote_type=vote_type)
                # Update vote count (+ or - 2)
                if vote_type == 'upvote':
                    question.votes_count += 2
                else:
                    question.votes_count -= 2
        else:
            # Create new vote
            self.vote_repo.create(
                question_id=question_id,
                voter_id=voter_id,
                vote_type=vote_type
            )
            # Update vote count
            if vote_type == 'upvote':
                question.votes_count += 1
            else:
                question.votes_count -= 1
        
        question.save(update_fields=['votes_count'])
        logger.info(f"Vote cast on question {question_id}")
        return question
    
    def vote_answer(self, answer_id, voter_id, vote_type):
        """Vote on an answer"""
        
        answer = self.answer_repo.get_by_id(answer_id)
        if not answer:
            raise ValueError('Answer not found')
        
        # Check if user already voted
        existing_vote = self.vote_repo.get_user_vote(voter_id, answer_id=answer_id)
        
        if existing_vote:
            if existing_vote.vote_type == vote_type:
                self.vote_repo.delete(existing_vote)
                if vote_type == 'upvote':
                    answer.votes_count -= 1
                else:
                    answer.votes_count += 1
            else:
                self.vote_repo.update(existing_vote, vote_type=vote_type)
                if vote_type == 'upvote':
                    answer.votes_count += 2
                else:
                    answer.votes_count -= 2
        else:
            self.vote_repo.create(
                answer_id=answer_id,
                voter_id=voter_id,
                vote_type=vote_type
            )
            if vote_type == 'upvote':
                answer.votes_count += 1
            else:
                answer.votes_count -= 1
        
        answer.save(update_fields=['votes_count'])
        logger.info(f"Vote cast on answer {answer_id}")
        return answer


class NotificationService:
    """Business logic for notifications"""
    
    def __init__(self):
        self.notification_repo = NotificationRepository()
    
    def create_notification(self, recipient_id, notification_type, title, message, link):
        """Create a notification"""
        
        notification = self.notification_repo.create(
            recipient_id=recipient_id,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link
        )
        
        logger.info(f"Notification created for user {recipient_id}")
        return notification
    
    def notify_new_answer(self, question, answer):
        """Notify question author of new answer"""
        
        title = f"New answer to '{question.title}'"
        message = f"{answer.author.username} answered your question"
        link = f"/questions/{question.id}"
        
        self.create_notification(
            recipient_id=question.author_id,
            notification_type='new_answer',
            title=title,
            message=message,
            link=link
        )
    
    def mark_as_read(self, notification_id):
        """Mark notification as read"""
        self.notification_repo.mark_as_read(notification_id)
