from rest_framework import serializers
from ..models import TradingPair

class TradingPairSerializer(serializers.ModelSerializer):
    """Used for all incoming Trading Pair data"""
    
    class Meta:
        model = TradingPair
        fields = '__all__'
        