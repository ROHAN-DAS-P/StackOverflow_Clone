# Generated migration for Google OAuth support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('src', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='auth_provider',
            field=models.CharField(
                choices=[('email', 'Email'), ('google', 'Google')],
                default='email',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.URLField(
                blank=True,
                null=True,
                help_text='Avatar URL from OAuth provider'
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='google_id',
            field=models.CharField(
                blank=True,
                db_index=True,
                max_length=255,
                null=True,
                unique=True
            ),
        ),
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(blank=True, max_length=254, unique=True),
        ),
    ]
