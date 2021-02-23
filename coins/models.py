from django.db import models

class Coin(models.Model):
    name = models.CharField(max_length=30, unique=True)
    ticker = models.CharField(max_length=5, unique=True)
    symbol = models.CharField(max_length=400)
    description = models.CharField(max_length=500, blank=True)
    favourited_by = models.ManyToManyField(
        'jwt_auth.User',
        related_name='favourited_coins',
        blank=True
    )
    
    def __str__(self):
        return f"{self.name} - {self.ticker}"
      