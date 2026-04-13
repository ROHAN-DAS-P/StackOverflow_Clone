from django.contrib import admin
from .models import User, Question, Answer, Comment, Vote, SavedItem, Notification, CodeSnippet, Article

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'reputation', 'role', 'created_at')
    list_filter = ('role', 'created_at', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    fieldsets = (
        ('Personal info', {'fields': ('username', 'email', 'password', 'first_name', 'last_name')}),
        ('Profile', {'fields': ('bio', 'profile_picture', 'reputation', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('created_at', 'updated_at', 'last_active')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_active')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'votes_count', 'views_count', 'is_closed', 'created_at')
    list_filter = ('created_at', 'is_closed', 'is_pinned')
    search_fields = ('title', 'content', 'author__username')
    readonly_fields = ('created_at', 'updated_at', 'votes_count', 'views_count')

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('question', 'author', 'votes_count', 'is_accepted', 'created_at')
    list_filter = ('is_accepted', 'created_at')
    search_fields = ('content', 'author__username', 'question__title')
    readonly_fields = ('created_at', 'updated_at', 'votes_count')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'question', 'answer', 'votes_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'author__username')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ('voter', 'vote_type', 'question', 'answer', 'created_at')
    list_filter = ('vote_type', 'created_at')
    search_fields = ('voter__username',)
    readonly_fields = ('created_at',)

@admin.register(SavedItem)
class SavedItemAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username',)
    readonly_fields = ('created_at',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('recipient__username', 'message', 'title')
    actions = ['mark_as_read']
    readonly_fields = ('created_at',)

    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected as read"

@admin.register(CodeSnippet)
class CodeSnippetAdmin(admin.ModelAdmin):
    list_display = ('title', 'language', 'author', 'votes_count', 'is_public', 'created_at')
    list_filter = ('language', 'is_public', 'created_at')
    search_fields = ('title', 'code', 'author__username')
    readonly_fields = ('created_at', 'updated_at', 'votes_count', 'views_count')

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'is_published', 'votes_count', 'views_count', 'created_at')
    list_filter = ('is_published', 'category', 'created_at')
    search_fields = ('title', 'content', 'author__username')
    readonly_fields = ('created_at', 'updated_at', 'votes_count', 'views_count')
