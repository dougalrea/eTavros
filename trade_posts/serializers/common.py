from rest_framework import serializers
from ..models import Trade_post

class TradePostSerializer(serializers.ModelSerializer):
    """Used for all incoming Trade Post data"""
    
    class Meta:
        model = Trade_post
        fields = '__all__'
        