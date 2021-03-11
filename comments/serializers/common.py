from rest_framework import serializers
from ..models import Comment

class CommentSerializer(serializers.ModelSerializer):
    """Used for all incoming Comment data"""
    
    class Meta:
        model = Comment
        fields = '__all__'
        