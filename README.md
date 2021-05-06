# eTavros - The virtual cryptocurrency trading platform

## Overview 

eTavros is an online cryptocurrency trading platform I built on a Python/Django back end with a React front end. Similar to eToro™ (but arguably better) it allows users to:

- view and interact with realtime candlestick charts, 
- buy and sell a variety of cryptocurrencies with virtual money, 
- track the rise and fall of their portfolio value, 
- view the trade history of each coin & witness third party trades as they happen,
- interpret & contribute to live market sentiment with coin-favouriting and Bullish/Bearish commenting functionality.

eTavros juggles multiple live websocket data streams with interactive trading chart generation, first and third party api requests, a range of third party libraries and (mostly) fool proof error handling all under the sleek hood of a single page application. Seriously, you should go **[check it out](https://etavros.herokuapp.com)**. Alternatively, feel free to clone this repo and run the app locally.

![It was a great day for Ethereum!](/resources/IMG_0367.jpg "It was a good day for Ethereum")

## Brief

### Project Brief

- Build a full-stack application by making your own backend and your own front-end.
- Use a Python Django API using Django REST Framework to serve your data from a Postgres database.
- Consume your API with a separate front-end built with React.
- Be a complete product which most likely means multiple relationships and CRUD functionality for at least a couple of models.
- Implement thoughtful user stories/wireframes that are significant enough to help you know which features are core MVP and which you can cut.
- Have a visually impressive design to kick your portfolio up a notch and have something to wow future clients & employers.
- Be deployed online so it’s publicly accessible.

eTavros exceeds the requirements of the project brief because I was keen to work with new technologies in the process, besides Django and React which I already felt comfortable with. I was drawn to the idea of building an application which feels somewhat like a game, and can hopefully be enjoyable even without a large userbase. Writing a full stack cryptocurrency trading platform offered plenty of new challenges and it became an incredibly addictive project.

## Technologies Used

### Back End:

- Python
- Django
- Django REST Framework

### Database:

- PostgreSQL

### Front End:

- React.js
- JavaScript (ES6)
- HTML5
- Semantic UI React Framework
- Yarn
- Axios
- CSS5 and SASS (Styled with Chakra-UI)
- Cloudinary
- Dependencies installed: 
    - react-router-dom 
    - react-select
    - requests
    - websockets
    - python-dateutil
    - python-binance
    - lightweight-charts

### Dev Tools:

- Git & GitHub
- Insomnia
- TablePlus
- VSCode & Eslint
- Heroku

## Approach

The most important aspect of the application for me was the trading chart. This was the most challenging part (specifically the real-time aspect), and I figured if I couldn't get a live updating candestick trading chart in my application, I'd do something else. So once I had set up a basic Django back end and React front, I dug into the Lightweight Financial Charting library from Tradingview UK.

Generating the Chart itself proved fairly straightforward, and was achieved with the following:

      const generateChart = async () => {
        chart = createChart(ref.current, {
          width: window.innerWidth / 2 - 16,
          height: (7 * (window.innerHeight / 14) - 56),
          layout: {
            backgroundColor: '#2D3748',
            textColor: '#EDF2F7'
          },
          grid: {
            vertLines: {
              color: 'rgba(197, 203, 206, 0.5)'
            },
            horzLines: {
              color: 'rgba(197, 203, 206, 0.5)'
            }
          },
          crosshair: {
            mode: CrosshairMode.Normal
          },
          rightPriceScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)'
          },
          timeScale: {
            borderColor: 'rgba(197, 203, 206, 0.8)'
          }
        })
        setCandleSeries(chart.addCandlestickSeries({
          upColor: '#0dd410',
          downColor: '#de283d',
          borderDownColor: '#de283d',
          borderUpColor: '#0dd410',
          wickDownColor: '#de283d',
          wickUpColor: '#0dd410'
        }))
      }

So that defines the appearance of the chart itself, but now it needs to be populated with data. First, I needed to fill the chart with price data from the past hour, day, week etc, depending on the users 'interval' input. To retrieve historical price data of cryptocurriencies, I needed to bring in Binance's API. The following makes the request to Django and sets the candledata as the response:

      const getHistoricalKline = async () => {
        try {
          const { data } = await getHistoricalData(name, interval)
          candleSeries.setData(data)
        } catch (error) {
          console.log('Error retrieving candleSeries data from binance API: ', error)
        }
      }

The request to Binance depends on two variables, namely the cryptocurrency in question (name) and the time interval which each candle should represent (interval). A generic def for identifying the relevant cryptocurrency will prove useful for all of other requests, so this is separated out as `def get_trading_pair(self, name):`. This is where things get interesting (for me at least). The desired time interval is sent to Django in the headers of the request from the front end, and manipulated into a compatible request to Binance as shown:

    def get(self, request, name):

        client = Client(API_KEY, API_SECRET)

        trading_pair = self.get_trading_pair(name=name)

        time_frame = request.headers['interval']
        
        def back_in_time(time_frame):
            switcher={
                "2h":timedelta(days=85),
                "1m":timedelta(days=1),
                "5m":timedelta(days=2),
                "15m":timedelta(days=12),
                "1h":timedelta(days=55),
                "4h":timedelta(days=200),
                "8h":timedelta(days=800),
                "1d":timedelta(days=2000)
            }
            return switcher.get(time_frame, timedelta(days=1))
        
        now = datetime.now() + timedelta(days=1)
        historic = datetime.now() - back_in_time(time_frame)
        
        now_month = now.strftime("%b")       
        now_day = now.strftime("%d")
        now_year = now.strftime("%Y")
        
        historic_month = historic.strftime("%b")       
        historic_day = historic.strftime("%d")
        historic_year = historic.strftime("%Y")
        
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

The request to Binance's API must provide the trading pair ticker, which is retrieved from my Postgres database, along with the time interval for each candlestick, and a begin & end time. For example, to retrieve bitcoin's price data from the last month of 2020 where each candle represents 5 minutes, the request would be `client.get_historcal_klines('BTCUSDT', Client.KLINE_INTERVAL_5MINUTE, "1 Dec, 2020", "1 Jan, 2021")`. The first argument gives the trading pair: BTC is bitcoin's ticker, and USDT (US Dollar Tether) is the ticker of a cryptocurrency tethered to the value of $1. All coins on eTavros are therefore traded against the US dollar.

The time window of historical data to retrieve (i.e December 2020) needs to be adjusted according to the `time_frame` of each candlestick. Since retrieving more candlesticks takes more time, the window of historical data is adjusted such that only enough candlesticks to fill the chart area are requested. This minimises the user's wait time which is important beacause (quite literally in this case) time is money.

The response is then processed into the `processed_candlesticks` format to be easily interpreted at the front end.


