from datetime import datetime, timedelta
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from binance.client import Client
from .secrets import API_KEY, API_SECRET
from .models import TradingPair
from .serializers.common import TradingPairSerializer
from .serializers.populated import PopulatedTradingPairSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

class TradingPairIndexView(APIView):
    """Controller for get request to /markets endpoint"""

    permission_classes = (IsAuthenticatedOrReadOnly, )

    def get(self, request):
        trading_pairs = TradingPair.objects.all()
        serialized_trading_pair = TradingPairSerializer(trading_pairs, many=True)
        return Response(serialized_trading_pair.data, status=status.HTTP_200_OK)
      
class TradingPairDetailView(APIView):
    """Controller for get request to /markets/name endpoint"""
    
    permission_classes = (IsAuthenticatedOrReadOnly, )
    
    def get_trading_pair(self, name):
        """ returns pokemon from db by its name or responds 404 not found """
        try:
            return TradingPair.objects.get(name=name)
        except TradingPair.DoesNotExist:
            raise NotFound()
    
    def get(self, _request, name):
        trading_pair = self.get_trading_pair(name=name)
        serialized_trading_pair = PopulatedTradingPairSerializer(trading_pair)
        return Response(serialized_trading_pair.data, status=status.HTTP_200_OK)
      
class TradingPairHistoricalData(APIView):
    """ Controller for get request to /markets/name/history endpoint"""
    
    def get_trading_pair(self, name):
        """ returns trading pair from db by its name or responds 404 not found """
        try:
            return TradingPair.objects.get(name=name)
        except TradingPair.DoesNotExist:
            raise NotFound()
        
    def get(self, request, name):

        client = Client(API_KEY, API_SECRET)

        trading_pair = self.get_trading_pair(name=name)

        now = datetime.now() + timedelta(days=1)
        historic = datetime.now() - timedelta(days=1)

        now_month = now.strftime("%b")       
        now_day = now.strftime("%d")
        now_year = now.strftime("%Y")
        
        historic_month = historic.strftime("%b")       
        historic_day = historic.strftime("%d")
        historic_year = historic.strftime("%Y")
        
        time_frame = request.headers['interval']
        
        def kline_arg(time_frame):
            switcher={
                    "1m":Client.KLINE_INTERVAL_1MINUTE,
                    "3m":Client.KLINE_INTERVAL_3MINUTE,
                    "5m":Client.KLINE_INTERVAL_5MINUTE,
                    "15m":Client.KLINE_INTERVAL_15MINUTE,
                    "30m":Client.KLINE_INTERVAL_30MINUTE,
                    "1h":Client.KLINE_INTERVAL_1HOUR,
                    "2h":Client.KLINE_INTERVAL_2HOUR,
                    "4h":Client.KLINE_INTERVAL_4HOUR,
                    "6h":Client.KLINE_INTERVAL_6HOUR,
                    "8h":Client.KLINE_INTERVAL_8HOUR,
                    "12h":Client.KLINE_INTERVAL_12HOUR,
                    "1d":Client.KLINE_INTERVAL_1DAY,
                    "3d":Client.KLINE_INTERVAL_3DAY,
                    "1w":Client.KLINE_INTERVAL_1WEEK,
                    "1M":Client.KLINE_INTERVAL_1MONTH
                }
            return switcher.get(time_frame, "Invalid header")
          
        candlesticks = client.get_historical_klines(
            f'{trading_pair.ticker}USDT',
            kline_arg(time_frame), 
            f'{historic_day, historic_month}, {historic_year}', f'{now_day, now_month}, {now_year}'
          )

        processed_candlesticks = []
        for data in candlesticks:
            candlestick = {
                "time": data[0] / 1000, 
                "open": data[1], 
                "high": data[2], 
                "low": data[3], 
                "close": data[4]
            }
            processed_candlesticks.append(candlestick)
        
        return JsonResponse(processed_candlesticks, safe=False)

class TradingPair24hrData(APIView):
    """Controller for get requests to /markets/name/history/day endpoint"""
    
    def get_trading_pair(self, name):
        """ returns trading pair from db by its name or responds 404 not found """
        try:
            return TradingPair.objects.get(name=name)
        except TradingPair.DoesNotExist:
            raise NotFound()
        
    def get(self, _request, name):

        client = Client(API_KEY, API_SECRET)

        trading_pair = self.get_trading_pair(name=name)
        
        lastDayData = client.get_ticker(symbol=f'{trading_pair.ticker}USDT')
        
        return JsonResponse(lastDayData, safe=False)
      
class TradingPairFavourite(TradingPairDetailView):
    """Constroller for requests to the /markets/name/favourite/ endpoint"""
    
    def post(self, request, name):
        trading_pair_in_question = self.get_trading_pair(name=name)
        trading_pair_in_question.favourited_by.add(request.user.id)
        trading_pair_in_question.save()
        serialized_favourited_trading_pair = PopulatedTradingPairSerializer(trading_pair_in_question)
        return Response(serialized_favourited_trading_pair.data, status=status.HTTP_201_CREATED)
      
    def put(self, request, name):
        trading_pair_in_question = self.get_trading_pair(name=name)
        trading_pair_in_question.favourited_by.remove(request.user.id)
        trading_pair_in_question.save()
        serialized_unfavourited_trading_pair = PopulatedTradingPairSerializer(trading_pair_in_question)
        return Response(serialized_unfavourited_trading_pair.data, status=status.HTTP_204_NO_CONTENT)
