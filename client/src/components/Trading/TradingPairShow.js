import React from 'react'
// import * as SockJS from 'sockjs-client'
import { createChart, CrosshairMode } from 'lightweight-charts'
import { useParams } from 'react-router-dom'
import { getOneTradingPair, getHistoricalData } from '../../lib/api'
import { 
  ChakraProvider, 
  Menu,
  MenuButton,
  MenuList,
  MenuItemOption,
  MenuOptionGroup,
  Button,
  Grid, 
  GridItem,
  Box,
  Container,
  Center,
  Flex,
  Avatar
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'


function TradingPairShow() {
  const [tradingPair, setTradingPair] = React.useState(null)
  const [interval, setInterval] = React.useState('5m')

  const [chartHasGenerated, setChartHasGenerated] = React.useState(false)
  const [historicalCandleDataHasBeenFetched, setHistoricalCandleDataHasBeenFetched] = React.useState(false)
  const [webSocketHasBeenAssigned, setWebSocketHasBeenAssigned] = React.useState(false)

  let chart = undefined
  const [candleSeries, setCandleSeries] = React.useState(undefined)

  const { name } = useParams()
  
  const socketRef = React.useRef()
  const ref = React.useRef()

  React.useEffect(() => {

    const getTradingPairData = async () => {
      try {
        const { data } = await getOneTradingPair(name)
        setTradingPair(data)
        console.log('trading pair data found')
      } catch (error) {
        console.log('Error retrieving trading pair data from django: ', error)
      }
    }
    if (!tradingPair) {
      getTradingPairData()
    }
  }, [name])

  React.useEffect(() => {

    const generateChart = async () => {
      chart = createChart(ref.current, {
        width: 600,
        height: 300,
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
        upColor: '#00ff00',
        downColor: '#ff0000',
        borderDownColor: 'rgba(255, 144, 0, 1)',
        borderUpColor: 'rgba(255, 144, 0, 1)',
        wickDownColor: 'rgba(255, 144, 0, 1)',
        wickUpColor: 'rgba(255, 144, 0, 1)'
      }))
      console.log('chart has been generated')
    }

    const getHistoricalKline = async () => {
      try {
        const { data } = await getHistoricalData(name, interval)
        candleSeries.setData(data)
        console.log('historical candlestick data successfully set')
      } catch (error) {
        console.log('Error retrieving candleSeries data from binance API: ', error)
      }
    }

    const getLiveCandlestickUpdates = () => {
      socketRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${tradingPair.ticker.toString().toLowerCase()}busd@kline_${interval}`)
      socketRef.current.onopen = e => {
        console.log('websocket connected', e)
      }
      socketRef.current.onmessage = (event) => {
        const message = JSON.parse(event.data)
        const candlestick = message.k
        if (candlestick.t / 1000 >= candleSeries.ed.dd.H_[candleSeries.ed.dd.H_.length - 1].P.Cs) {
          candleSeries.update({
            time: candlestick.t / 1000,
            open: candlestick.o,
            high: candlestick.h,
            low: candlestick.l,
            close: candlestick.c
          })
        }
      }
    }

    if (!chartHasGenerated) {
      generateChart()
      return setChartHasGenerated(true)
    }

    if (chartHasGenerated && candleSeries && !historicalCandleDataHasBeenFetched) {
      getHistoricalKline()
      return setHistoricalCandleDataHasBeenFetched(true)
    }

    if (historicalCandleDataHasBeenFetched && tradingPair && !webSocketHasBeenAssigned) {
      getLiveCandlestickUpdates()
      return setWebSocketHasBeenAssigned(true)
    }

  }, [interval, tradingPair, chartHasGenerated, historicalCandleDataHasBeenFetched, webSocketHasBeenAssigned])

  return (
    <>
      <ChakraProvider>
        <Container maxW='100%' maxH='90vh' borderRadius='lg' p={0}>
          <Grid
            bg='white'
            padding='10px'
            borderWidth='1px' 
            borderRadius='lg'
            borderColor='gray.500'
            w='100%'
            maxH='90vh'
            templateRows="repeat(14, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            <GridItem rowStart={1} rowEnd={3} colStart={1} colEnd={2} borderRadius='lg' borderColor='gray.500' border='1px' overflow='hidden'>
              <Box borderRadius='lg' borderColor='gray.500' fontSize='sm'>
                {tradingPair ? tradingPair.description : 'data loading'}
              </Box>
            </GridItem>
            <GridItem rowSpan={1} colSpan={2}>
              {tradingPair ? 
                <Flex borderRadius='lg' borderColor='gray.500'>
                  <Avatar
                    size="sm"
                    name={tradingPair.name}
                    src={tradingPair.symbol}
                    alt="coin symbol" 
                  />
                  <Box>
                    {tradingPair.ticker} 
                  </Box>
                </Flex>
                : 'data loading'}
              
            </GridItem>
            <GridItem rowSpan={1} colSpan={2}>
              <Menu placement='right'>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />} >
                  {interval === '5m' ? 'Interval' : interval}
                </MenuButton>
                <MenuList>
                  <MenuOptionGroup title="Interval" type="radio">
                    <MenuItemOption 
                      value='1m' 
                      onClick={() => {
                        setInterval('1m')
                        setHistoricalCandleDataHasBeenFetched(false)
                        setWebSocketHasBeenAssigned(false)
                      }}
                    >1 minute
                    </MenuItemOption>
                    <MenuItemOption 
                      value='15m' 
                      onClick={() => {
                        setInterval('15m')
                        setHistoricalCandleDataHasBeenFetched(false)
                        setWebSocketHasBeenAssigned(false)
                      }}
                    >15 minutes
                    </MenuItemOption>
                    <MenuItemOption 
                      value='30m' 
                      onClick={() => {
                        setInterval('30m')
                        setHistoricalCandleDataHasBeenFetched(false)
                        setWebSocketHasBeenAssigned(false)
                      }}
                    >30 minutes
                    </MenuItemOption>
                    <MenuItemOption 
                      value='1h' 
                      onClick={() => {
                        setInterval('1h')
                        setHistoricalCandleDataHasBeenFetched(false)
                        setWebSocketHasBeenAssigned(false)
                      }}
                    >1 hour
                    </MenuItemOption>
                    <MenuItemOption 
                      value='4h'
                      onClick={() => {
                        setInterval('4h')
                        setHistoricalCandleDataHasBeenFetched(false)
                        setWebSocketHasBeenAssigned(false)
                      }}
                    >4 hours
                    </MenuItemOption>
                  </MenuOptionGroup>
                </MenuList>
              </Menu>
            </GridItem>
            <>
              <GridItem rowStart={3} rowEnd={10} colStart={2} colEnd={4} borderRadius='lg' borderColor='gray.500'>
                {ref ? 
                  <Center>
                    <Box ref={ref}></Box>
                  </Center> : <p>loading chart</p>}
              </GridItem>
            </>
          </Grid>
        </Container>
      </ChakraProvider>
    </>
  )
}

export default TradingPairShow