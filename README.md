# eTavros - The virtual cryptocurrency trading platform

## Overview 

eTavros is an online cryptocurrency trading platform I built on a Python/Django back end with a React front end. Similar to eToro™ (but arguably better) it allows users to:

- view and interact with realtime candlestick charts, 
- buy and sell a variety of cryptocurrencies with virtual money, 
- track the rise and fall of their portfolio value, 
- view the trade history of each coin & witness third party trades as they happen,
- interpret & contribute to live market sentiment with coin-favouriting and Bullish/Bearish commenting functionality.

eTavros juggles multiple live websocket data streams with interactive trading chart generation, first and third party api requests, a range of third party libraries and (mostly) fool proof error handling all under the sleek hood of a single page application. Seriously, you should go **[check it out](https://etavros.herokuapp.com)**. Alternatively, feel free to clone this repo and run the app locally.

![It was a great day for Ethereum!](/resources/trading_page_screenshot.jpg "It was a great day for Ethereum!")

## Brief

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

### Chart

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
                    "5m":Client.KLINE_INTERVAL_5MINUTE,
                    "15m":Client.KLINE_INTERVAL_15MINUTE,
                    "1h":Client.KLINE_INTERVAL_1HOUR,
                    "2h":Client.KLINE_INTERVAL_2HOUR,
                    "4h":Client.KLINE_INTERVAL_4HOUR,
                    "8h":Client.KLINE_INTERVAL_8HOUR,
                    "1d":Client.KLINE_INTERVAL_1DAY,
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

What came next was perhaps the most challenging part of the whole project. Now that the historical data was on the chart, showing the price history of bitcoin in the past day, hour, week etc, I then needed to attach a new candle to the right hand edge of the chart to reflect the current price. Since demand for bitcoin is always fluctuating, so too it its value. This means the latest candle on the chart needs to grow and shrink to reflect the rise and fall of bitcoins price during that candle's time interval. This really brings the chart to life and gives the user a sense of involvement and opportunity.

I spent about a day and a half banging my head against the the wall, at first, and then the floor, until eventually realising that websocket connection URLs are case sensitive. Since when are URLs case sensitive?? I was outraged, but also relieved, because it finally allowed the following function to breath life into my project:

        const getLiveCandlestickUpdates = () => {
          if (tradingPair && socketRef.current) {
            console.log('Closing the Web Socket... Bye!')
            socketRef.current.close()
          }
          socketRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${tradingPair.ticker.toString().toLowerCase()}busd@kline_${interval}`)
          socketRef.current.onmessage = async (event) => {
            const message = JSON.parse(event?.data)
            const candlestick = message.k
            if (
              candleSeries.ed.dd.H_[candleSeries.ed.dd.H_.length - 1] 
              && 
              candlestick.t / 1000 >= candleSeries.ed.dd.H_[candleSeries.ed.dd.H_.length - 1].P.Cs
            ) {
              candleSeries.update({
                time: candlestick.t / 1000,
                open: candlestick.o,
                high: candlestick.h,
                low: candlestick.l,
                close: candlestick.c
              })
              if (dayVolumeTicker % 2 === 0) {
                getLastDayData()
              } else {
                dayVolumeTicker ++
              }
            }
          }
        }

Lets break this function down, because there are a few things which look unneccassary but can be explained in the context of the whole project. `tradingPair` is the data retrieved from my Django back end, and provides the name (eg Bitcoin), the trating ticker (eg BTC), along with relationship data such as who has favouritied it, which comments are associated to it, and what buying & selling orders have been made on it. `socketRef` is defined at the top of the `Chart()` React component as `const socketRef = React.useRef()`. 

- The `if` clause at the top prevents the same websocket from being connected to multiple times, which is what started happening when I switched back and forth between different trading pages in the browser. 

- The tradingPair's name, ticker, and the time interval selected are all referenced in the websocket url itself, making the function versatile and applicable to a wide range of user input options.

- The `socketRef.current.onmessage` defines what should be performed when the websocket sends a message. Now you may be looking at the `candleSeries.ed.dd.H_[candleSeries.ed.dd.H_.length - 1] && candlestick.t / 1000 >= candleSeries.ed.dd.H_[candleSeries.ed.dd.H_.length - 1].P.Cs` in the if clause and thinking "Wow what a horrific and unreadable line, what kind of psychopath would assign key-value pairs in an object names like `ed`, `H_`, and `Cs`?" I quite agree. It's carnage. But I didn't choose these names, these are just part of the Charting Library's `candleSeries`, which holds obscene amount of data for every candle.

- Basically, the if clause with the unreadable line performs one final check that the time signature of the current price data in the websocket message is *later* than the time signature of the most recent candle already in the chart. It's a very rare scenario but does sometimes happen when the websocket connects before the chart has finished being generated. You can think of it as preventing the chart from going backwards.

- The juicy bits of the websocket message, namely the current time, the price of the crypto when that time interval began (`open`), and ended (`close`), as well as the highest and lowest price recorded during that time interval, are then assigned to the newest candle on the chart.

- Finally, a request is made to to Binance's API to retreive the total trading volume in the last 24 hrs. I was worried that my app would get blocked by Binance for excessive requests, so I only allowed requests to be sent on every second message from the websocket.

### Buying & Selling
#### Back End

The second most important feature I wanted to incorporate was the ability to (virtually) buy and sell different cryptocurrencies. Actually, this is probably the *most* important feature of a crytpo trading platform, but in my imagination this functionality was less foreign than getting the live candlestick chart on the page. 

Since everyone's cyrpto balances are only relevant to their own account, I structured the user model in Django to bear the data of portfolio holdings. By default, all enw users are given $100,000 of virtual money. All buying and selling performed by the user corresponds to a put request to their User Object, adjusting their account balances as calculated. Here's what that looks like in Python:

- First, the user's permission classes and User Object are identified with

        permission_classes = (IsAuthenticated, )

        def get(self, request):
            user = User.objects.get(pk=request.user.id)
            serialized_user = PopulatedUserSerializer(user)
            return Response(serialized_user.data, status=status.HTTP_200_OK)

- Then the put def is defined. The new balances are calculated from the formData submitted from the front end like this:

        def put(self, request):       
            user_to_update = User.objects.get(pk=request.user.id)
            asset_to_update = str(f'{request.data["tradingPairName"]}_balance')

            new_balance_buy = getattr(user_to_update, asset_to_update) + Decimal(f"{request.data['amount']}")
            new_balance_sell = getattr(user_to_update, asset_to_update) - Decimal(f"{request.data['amount']}")

- If the amount of crypto the user is buying or selling is more than they can afford or more than they have respectively, Django sends the response to tell the user they have insufficient balances to cover their trade. Otherwise, their wallet balances are added to & subtracted from accordingly:

        if request.data['buy']:
            if user_to_update.cash_balance - Decimal(request.data['total']) < 0:
                return Response('Insufficient balance in account', status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            user_to_update.cash_balance -= Decimal(request.data['total'])
            setattr(user_to_update, asset_to_update, new_balance_buy)
        else:
            if new_balance_sell < 0:
                return Response('Insufficient balance in account', status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            user_to_update.cash_balance += Decimal(request.data['total'])
            setattr(user_to_update, asset_to_update, new_balance_sell)

- The user's User object is then saved, and a 202 response is sent:

        essential_data = {
            'username': user_to_update.username, 
            'password': user_to_update.password, 
            'email': user_to_update.email
            }

        updated_user = UserSerializerForTrading(user_to_update, data=essential_data)
            
        if updated_user.is_valid():
            updated_user.save()
            return Response(updated_user.data, status=status.HTTP_202_ACCEPTED)
        return Response(updated_user.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

#### Front End

On the front end, I built a single, versatile React component to deliver both the buying and the selling forms. Work harder, not longer. I think the "work smarter, not harder" phrase doesn't really account for how intangible working smarter can be in practice. I feel that we instinctively work as 'smart' as we can, but this doesn't quite cut the mustard sometimes. And to think to oneself, "right, I need to pull myself together and work *smarter* today" is about as much use as saying, "Believe in yourself, and you can achieve anything." 

Working *harder*, however, feels more accessible somehow, and working *longer* is definitely to be avoided. In some ways, I guess working *smarter* is working *harder*. Perhaps I should just advocate for "work smarter, not longer", and ditch 'harder' entirely. Either way, The FormTrade.js React component I built works wonders and I'm proud of it.

The component begins by defining the trade request's empty state, and the default state of form & submission errors:

        const initialState = {
          'buy': '',
          'amount': '',
          'total': '',
          'tradingPairName': ''
        }
        const [formdata, setFormdata] = React.useState(initialState)
        const [errors, setErrors] = React.useState(initialState)

Two essential pieces of data are required at this point: the user's account information and the latest price of the cryptocurrency (the specific crypto being traded is handed down to the FormTrade component as a prop from its parent)

          const { name } = useParams()
          const token = getToken()

          const refreshLastPrice = async () => {
            try {
              const { data } = await get24HourData(name)
              setLastPrice(data.lastPrice)
            } catch (error) {
              console.log('Error retrieving latest price data: ', error)
            }
          }

          const getUserData = async () => {
            try {
              const token = getToken()
              const { data } = await getUserProfile(token)
              setUserData(data)
            } catch (error) {
              console.log('failed getting user data')
              console.log(error)
            }
          }

These are packaged up neatly in a React useEffect:

          React.useEffect(() => {
            refreshLastPrice()
            getUserData()
          }, [token])

The `refreshLastPrice()` function is called before every trade, so the user is always trading at the most recent price, not just the price at the time of page load.

The trading form has two fields: the amount of cryptocurrency and the amount of USD. Lets say the user wants to buy Ethereum. I wanted the user to be able to chose whether to input how much USD they want to spend, eg "I want to buy $5,000 worth of Ethereum" or how much ethereum they awnt to buy, eg "I want to buy 2.5 Ethereum." In each case, I wanted the user to see what the corresponding amount in the opposite currency was. This is exactly the kind of inessential, beyond mvp, I-wonder-if-I-can-do-that type of rabbit hole I love exploring. Similar to how I allowed the login process to accept both the account username and email in the same field - FREEDOM TO THE USER!!

Back to the point, this requires the value of the opposite field to be calculated and presented on every keypress of the user's input. Here's how that works:

        const handleChange = (event) => {
          if (event.target.name === 'amount') {
            const amountValue = event.target.value
            const totalValue = amountValue * lastPrice
            const nextState = { ...formdata, 'amount': amountValue, 'total': totalValue }
            setFormdata(nextState)
            setErrors({ ...errors, [event.target.name]: '' })
          }
          if (event.target.name === 'total') {
            const totalValue = event.target.value
            const amountValue = (totalValue / lastPrice)
            const nextState = { ...formdata, 'amount': amountValue, 'total': totalValue }
            setFormdata(nextState)
            setErrors({ ...errors, [event.target.name]: '' })
          }
        }

This is nice, but there is room for improvement. The calculated equivalent in the opposite currency is a little too exact, and gives as many decimal places as necessary. While this isn't game-breaking, it's not particularly easy to read if you're trading in a hurry. Unfortunatly there isn't an easy way to separate what the user sees in the input bar from what is actually sent with the API request, so a compromise has to be made. Either the numbers are shown to a few significant figures, and the values submitted with upon trade execution are inaccurate, or the values are perfectly accurate, but the non-inputted value looks messy and sometimes has 24 decimal places. I went with the latter. Sue me.

Here is the full handeTrade function from the front end:

        const handleTrade = async event => {
          event.preventDefault()
          try {
            formdata.amount = formdata.total / lastPrice
            formdata.tradingPairName = tradingPair.name
            formdata.buy = orderType === 'Buy'
            const token = getToken()
            await refreshLastPrice()
            await performTrade(formdata, token)
            await createTradePost({
              'bought_or_sold': formdata.buy,
              'amount': formdata.amount,
              'total': formdata.total,
              'trading_pair': tradingPair.id
            }, token)
            triggerToast()
            getUserData()
            setTradingPairDataFound(false)
            setError(false)
            setFormdata(initialState)
          } catch (error) {
            if (!token) {
              setError('You must be logged in to make trades!')
            } else if (
              (
                orderType === 'Buy' 
                && 
                parseFloat(userData?.cash_balance) < parseFloat(formdata?.total)
              ) 
              || 
              (
                orderType === 'Sell' 
                && 
                parseFloat(userData[`${tradingPair?.name}_balance`]) < parseFloat(formdata?.amount)
              )
              ||
              (
                formdata?.total < 0
              )
              ||
              (
                formdata?.amount < 0
              )
            ) {
              setError('Insufficient balance!')
            } else {
              console.log('unexpected error: ', error)
              setError('Something unexpected happened, sorry about that!')
            }
          }
          setTimeout(() => {
            setError(false)
          }, 2800)
          setBalanceChangeTicker(!balanceChangeTicker)
        }

Upon execution of every trade, the user will instantly see their balances updated on the page (thank you, `balanceChangeTicker`!) and a new trade post added to the feed of recent trades. Embedded in every trade request is another request: a POST to the '/tradeposts' endpoint. This is called by the following function:

        await createTradePost({
          'bought_or_sold': formdata.buy,
          'amount': formdata.amount,
          'total': formdata.total,
          'trading_pair': tradingPair.id
        }, token)

A trade post records how much of which currency was bought or sold by who at what time, and at what price. 

The feed of all trade posts is publicly visible to the right of the trading chart, and allows all eTavros users to view the full trade history of each coin on the platform. This can (perhaps) help inform trade decisions, and allows users to track certain user's trading activity.

### Relationships

Who needs 'em, right? Wrong. eTavros needs them. Before delving into Django and establishing many-to-many & one-to-many relationships in each app's models.py, I spent a few hours planning the architecture of the back end database on QuickDBD. Here's the result:

![eTavros Django relationships](/resources/QuickDBD.png "eTavros Relationships")

I established a many-to-many relationship between Users and Coins(TradingPair) to enable favouriting functionality. Here's the Django model for each Crypto:

        class TradingPair(models.Model):
            name = models.CharField(max_length=30, unique=True)
            ticker = models.CharField(max_length=5, unique=True)
            symbol = models.CharField(max_length=400)
            description = models.CharField(max_length=500, blank=True)
            favourited_by = models.ManyToManyField(
                'jwt_auth.User',
                related_name='favourited_coins',
                blank=True
            )
            total_suppy = models.BigIntegerField(blank=True)
            
            def __str__(self):
                return f"{self.name} - {self.ticker}"

The one-to-many relationships necessary for commenting and trade posts lie within the models.py of each app. Here is that of trade_posts:

        class Trade_post(models.Model):
            created_at = models.DateTimeField(auto_now_add=True)
            trading_pair = models.ForeignKey(
              "trading_pairs.TradingPair",
              related_name="trade_posts",
              on_delete=models.CASCADE
            )
            owner = models.ForeignKey(
              "jwt_auth.User",
              related_name="posted_trades",
              on_delete=models.CASCADE
            )
            bought_or_sold = models.BooleanField(blank=False)
            amount = models.FloatField(validators=[MinValueValidator(0)])
            total = models.FloatField(validators=[MinValueValidator(0)])

            def __str__(self):
                return f"{self.amount} of {self.trading_pair} {self.bought_or_sold} by {self.owner} for {self.total}"

Each trade post must be attributed only to:
- one User, since it corresponds to one trade by one account (the 'owner') 
- one cryptocurrency(trading_pair), since only one crypto can be traded at a time. 

However, a single crypto currency is expected to have many trade_posts related to it. A one-to-many relationship is therefore required to both users and trading_pairs.

Not everything from my QuickDBD diagram made it through to the current version of eTavros, such as the many-to-many relationship enabling users to 'follow' other users, but this diagram neatly demostrates further areas for development.

## Bugs

eTavros appears to operate seamlessly when run from a local environment, rather than accessed via the herokuapp URL. If you are interested in fully exploring the depth of eTavros's functionality and/or don't believe it can be as bug-free as I claim it is, please fork the repo on GitHub, build the environment locally from the pipfile, and run `python manage.py runserver` from a pip shell. 

The **[online version](https://etavros.herokuapp.com)** unfortunately doesn't work as smoothly, since the free herokuapp deployment server can't seem to keep up with the high volume of requests and websockets in operation. The following bugs *occasionally* occur:

- The 'View Wallet' feature is therefore rendered particularly buggy, as it initiates 12 simultaneous requests to the Binance API. These often return a 501 internal server error.

- The nav bar in general sometimes appears to forget that the user is logged in, and shows the 'Log in' and 'Register' buttons instead of the 'View Wallet' and 'Log Out' buttons, even though all other account features like trading and commenting are still available.

Please note these bugs do not occur when running the application locally.