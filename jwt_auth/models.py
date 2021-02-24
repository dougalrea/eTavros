from enum import unique
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields.related import ManyToManyField

class User(AbstractUser):
    email = models.CharField(max_length=80, unique=True)
    username = models.CharField(max_length=80, unique=True)
    profile_image = models.CharField(max_length=350, blank=True)
    bio = models.CharField(max_length=300, blank=True)
    cash_balance = models.DecimalField(max_digits=20, decimal_places=2, default=100000)
    bitcoin_balance = models.DecimalField(max_digits=20, decimal_places=8, default=0)
    ethereum_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0)
    