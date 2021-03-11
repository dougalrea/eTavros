from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from trade_posts.models import Trade_post
from .serializers.common import TradePostSerializer

class TradePostListView(APIView):
    """Controller for post requests to /tradeposts endpoint"""
    
    permission_classes = (IsAuthenticatedOrReadOnly, )
    
    def post(self, request):
        request.data["owner"] = request.user.id
        trade_post_to_create = TradePostSerializer(data=request.data)
        if trade_post_to_create.is_valid():
            trade_post_to_create.save()
            return Response(trade_post_to_create.data, status=status.HTTP_201_CREATED)
        return Response(trade_post_to_create.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
      