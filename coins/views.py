from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Coin
from .serializers.populated import PopulatedCoinSerializer

class CoinIndexView(APIView):
    """Controller for get request to /coins endpoint"""

    def get(self, request):
        coins = Coin.objects.all()
        serialized_coin = PopulatedCoinSerializer(coins, many=True)
        return Response(serialized_coin.data, status=status.HTTP_200_OK)
      