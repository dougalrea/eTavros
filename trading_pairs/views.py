from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.exceptions import NotFound
from .models import TradingPair
from .serializers.common import TradingPairSerializer

class TradingPairIndexView(APIView):
    """Controller for get request to /markets endpoint"""

    def get(self, request):
        trading_pairs = TradingPair.objects.all()
        serialized_trading_pair = TradingPairSerializer(trading_pairs, many=True)
        return Response(serialized_trading_pair.data, status=status.HTTP_200_OK)
      
class TradingPairDetailView(APIView):
    """Controller for get request to /markets/name endpoint"""
    
    def get_trading_pair(self, name):
        """ returns pokemon from db by its name or responds 404 not found """
        try:
            return TradingPair.objects.get(name=name)
        except TradingPair.DoesNotExist:
            raise NotFound()
    
    def get(self, _request, name):
        trading_pair = self.get_trading_pair(name=name)
        serialized_trading_pair = TradingPairSerializer(trading_pair)
        return Response(serialized_trading_pair.data, status=status.HTTP_200_OK)
      