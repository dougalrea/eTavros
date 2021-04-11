import { Box, Center, Heading } from '@chakra-ui/layout'
import { createChart, CrosshairMode } from 'lightweight-charts'
import React from 'react'
import { useParams } from 'react-router'
import { get24HourData, getHistoricalData } from '../../lib/api'

function Chart({ interval, tradingPair, setLastDayData }) {
  const [candleSeries, setCandleSeries] = React.useState(undefined)
  const [chartHasGenerated, setChartHasGenerated] = React.useState(false)
  // const [historicalCandleDataHasBeenFetched, setHistoricalCandleDataHasBeenFetched] = React.useState(false)
  
  const ref = React.useRef()
  const socketRef = React.useRef()

  let chart = undefined
  let dayVolumeTicker = 0

  const { name } = useParams()

  const generateChart = async () => {
    chart = createChart(ref.current, {
      width: window.innerWidth / 2 - 16,
      height: ((window.innerHeight - 70) / 2.15),
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

  const getHistoricalKline = async () => {
    try {
      const { data } = await getHistoricalData(name, interval)
      candleSeries.setData(data)
    } catch (error) {
      console.log('Error retrieving candleSeries data from binance API: ', error)
    }
  }

  const getLiveCandlestickUpdates = () => {
    if (tradingPair && socketRef.current) {
      console.log('Closing the Web Socket... Bye!')
      socketRef.current.close()
    }
    socketRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${tradingPair.ticker.toString().toLowerCase()}busd@kline_${interval}`)
    socketRef.current.onopen = async e => {
      console.log('websocket connected', e)
    }
    socketRef.current.onmessage = async (event) => {
      const message = JSON.parse(event?.data)
      const candlestick = message.k
      if (candleSeries.ed.dd.H_[candleSeries.ed.dd.H_.length - 1] && candlestick.t / 1000 >= candleSeries.ed.dd.H_[candleSeries.ed.dd.H_.length - 1].P.Cs) {
        candleSeries.update({
          time: candlestick.t / 1000,
          open: candlestick.o,
          high: candlestick.h,
          low: candlestick.l,
          close: candlestick.c
        })
        if (dayVolumeTicker % 2 === 0) {
          try {
            const { data } = await get24HourData(name)
            setLastDayData(data)
            dayVolumeTicker ++
            console.log('24 hr data found: ', dayVolumeTicker)
          } catch (error) {
            console.log('Error retrieving 24 hr data: ', error)
          }
        } else {
          dayVolumeTicker ++
        }
      }
    }
  }


  React.useEffect(() => {

    if (!chartHasGenerated) {
      generateChart()
      console.log('chart has been generated')
      setChartHasGenerated(true)
    }

    if (candleSeries && tradingPair) {
      getHistoricalKline()
      console.log('historical candlestick data successfully set')
      console.log('trying to connect websocket')
      getLiveCandlestickUpdates()
    }

    console.log('new mount')

    return function cleaup() {
      if (socketRef.current) {
        console.log('Closing the Web Socket... Bye!')
        socketRef.current.close()
      }
    }

  }, [interval, candleSeries, tradingPair])

  return (
    <Heading>
      {ref ? 
        <Center>
          <Box ref={ref}></Box>
        </Center> : <p>loading chart</p>}
    </Heading>
  )
}

export default Chart