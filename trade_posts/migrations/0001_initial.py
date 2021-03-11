# Generated by Django 3.1.7 on 2021-03-10 13:14

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('trading_pairs', '0002_tradingpair_web_socket_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='Trade_post',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('bought_or_sold', models.BooleanField()),
                ('amount', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('total', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posted_trades', to=settings.AUTH_USER_MODEL)),
                ('trading_pair', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trade_posts', to='trading_pairs.tradingpair')),
            ],
        ),
    ]
