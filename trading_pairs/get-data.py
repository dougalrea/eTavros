
import secrets
from trading_pairs.models import TradingPair
# import json
from binance.client import Client

client = Client(secrets.API_KEY, secrets.API_SECRET)

# def history():
  
#     candlesticks = client.get_historical_klines(
#         "BTCUSDT",
#         Client.KLINE_INTERVAL_5MINUTE, 
#         "1 Feb, 2021", "25 Feb, 2021"
#         )
    
#     print(json.dumps(candlesticks))
  
# history()
