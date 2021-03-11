from django.db import models
from django.core.validators import MinValueValidator

class Trade_post(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    trading_pair = models.ForeignKey(
      "trading_pairs.TradingPair",
      related_name="trade_posts",
      on_delete=models.CASCADE
    )
    owner = models.ForeignKey(
      "jwt_auth.User",
      related_name="posted_trades",
      on_delete=models.CASCADE
    )
    bought_or_sold = models.BooleanField(blank=False)
    amount = models.FloatField(validators=[MinValueValidator(0)])
    total = models.FloatField(validators=[MinValueValidator(0)])

    def __str__(self):
        return f"{self.amount} of {self.trading_pair} {self.bought_or_sold} by {self.owner} for {self.total}"
      
