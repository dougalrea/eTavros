from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import TradingPair
from .serializers.common import TradingPairSerializer

class TradingPairIndexView(APIView):
    """Controller for get request to /coins endpoint"""

    def get(self, request):
        trading_pairs = TradingPair.objects.all()
        serialized_trading_pairs = TradingPairSerializer(trading_pairs, many=True)
        return Response(serialized_trading_pairs.data, status=status.HTTP_200_OK)
      