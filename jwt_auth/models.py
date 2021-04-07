from django.core.validators import MinValueValidator
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.CharField(max_length=80, unique=True)
    username = models.CharField(max_length=80, unique=True)
    profile_image = models.CharField(max_length=350, blank=True)
    bio = models.CharField(max_length=300, blank=True)
    cash_balance = models.DecimalField(max_digits=20, decimal_places=2, default=100000, validators=[MinValueValidator(0.01)])
    bitcoin_balance = models.DecimalField(max_digits=20, decimal_places=8, default=0, validators=[MinValueValidator(0.00000001)])
    ethereum_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    cardano_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    polkadot_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    litecoin_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    stellar_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    dogecoin_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    terra_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    veChain_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    monero_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    EOS_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    neo_balance = models.DecimalField(max_digits=20, decimal_places=5, default=0, validators=[MinValueValidator(0.00001)])
    