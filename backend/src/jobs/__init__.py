"""
Background job definitions using Celery
"""
import logging
from celery import shared_task
from django.utils.timezone import now
from src.models import Question, Answer, Notification, Article
from src.services import NotificationService

logger = logging.getLogger('app')


@shared_task(bind=True, max_retries=3)
def send_notification_email(self, notification_id):
    """Send notification email to user"""
    try:
        notification = Notification.objects.get(id=notification_id)
        
        # TODO: Implement email sending logic
        logger.info(f"Email sent for notification {notification_id}")
        
        return {'status': 'sent', 'notification_id': str(notification_id)}
    except Notification.DoesNotExist:
        logger.error(f"Notification {notification_id} not found")
        return {'status': 'failed', 'reason': 'not_found'}
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def index_question_search(self, question_id):
    """Index question in Elasticsearch"""
    try:
        from src.utils import SearchService
        
        question = Question.objects.get(id=question_id)
        search_service = SearchService()
        search_service.index_question(question)
        
        logger.info(f"Question {question_id} indexed in search")
        return {'status': 'indexed', 'question_id': str(question_id)}
    except Question.DoesNotExist:
        logger.error(f"Question {question_id} not found")
        return {'status': 'failed', 'reason': 'not_found'}
    except Exception as e:
        logger.error(f"Error indexing question: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def generate_ai_summary(self, question_id):
    """Generate AI summary for a question"""
    try:
        from src.config.settings import USE_AI_SUMMARIES, AI_SERVICE_URL, AI_SERVICE_API_KEY
        
        if not USE_AI_SUMMARIES:
            logger.info("AI summaries disabled")
            return {'status': 'skipped', 'reason': 'disabled'}
        
        question = Question.objects.get(id=question_id)
        
        # TODO: Call AI service and store summary
        logger.info(f"AI summary generated for question {question_id}")
        
        return {'status': 'generated', 'question_id': str(question_id)}
    except Question.DoesNotExist:
        logger.error(f"Question {question_id} not found")
        return {'status': 'failed', 'reason': 'not_found'}
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def notify_answer_received(self, question_id, answer_id):
    """Notify question author that an answer was posted"""
    try:
        notification_service = NotificationService()
        question = Question.objects.get(id=question_id)
        answer = Answer.objects.get(id=answer_id)
        
        notification_service.notify_new_answer(question, answer)
        
        logger.info(f"Notification sent for answer {answer_id}")
        return {'status': 'sent', 'answer_id': str(answer_id)}
    except (Question.DoesNotExist, Answer.DoesNotExist) as e:
        logger.error(f"Question or Answer not found: {str(e)}")
        return {'status': 'failed', 'reason': 'not_found'}
    except Exception as e:
        logger.error(f"Error notifying answer: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def notify_mention(self, user_id, mentioned_by_user_id, content_type, content_id):
    """Notify user when mentioned"""
    try:
        from src.models import User
        
        notification_service = NotificationService()
        mentioned_user = User.objects.get(id=user_id)
        mentioner = User.objects.get(id=mentioned_by_user_id)
        
        notification_service.create_notification(
            recipient_id=user_id,
            notification_type='mention',
            title=f"{mentioner.username} mentioned you",
            message=f"You were mentioned in a {content_type}",
            link=f"/{content_type}/{content_id}"
        )
        
        logger.info(f"Mention notification sent to user {user_id}")
        return {'status': 'sent', 'user_id': str(user_id)}
    except User.DoesNotExist:
        logger.error(f"User not found")
        return {'status': 'failed', 'reason': 'not_found'}
    except Exception as e:
        logger.error(f"Error notifying mention: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task
def cleanup_expired_notifications():
    """Clean up old notifications (older than 30 days)"""
    from datetime import timedelta
    
    cutoff_date = now() - timedelta(days=30)
    deleted_count, _ = Notification.objects.filter(created_at__lt=cutoff_date).delete()
    
    logger.info(f"Cleaned up {deleted_count} expired notifications")
    return {'status': 'completed', 'deleted': deleted_count}


@shared_task
def sync_reputation():
    """Sync user reputation based on votes"""
    from src.models import User, Vote
    
    try:
        # For each user, sum their upvotes from answers
        users = User.objects.all()
        
        for user in users:
            # Count upvotes on user's answers
            upvotes = Vote.objects.filter(
                answer__author=user,
                vote_type='upvote'
            ).count()
            
            # Count downvotes on user's answers
            downvotes = Vote.objects.filter(
                answer__author=user,
                vote_type='downvote'
            ).count()
            
            reputation = (upvotes * 5) - downvotes
            user.reputation = max(0, reputation)  # Reputation can't be negative
            user.save(update_fields=['reputation'])
        
        logger.info(f"Reputation synced for {users.count()} users")
        return {'status': 'completed', 'users_updated': users.count()}
    except Exception as e:
        logger.error(f"Error syncing reputation: {str(e)}")
        return {'status': 'failed', 'error': str(e)}
