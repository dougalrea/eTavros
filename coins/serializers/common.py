from rest_framework import serializers
from ..models import Coin

class CoinSerializer(serializers.ModelSerializer):
    """Used for all incoming Coin data"""
    
    class Meta:
        model = Coin
        fields = '__all__'