/* eslint-disable react/no-children-prop */
import React from 'react'
// import * as SockJS from 'sockjs-client'
import { createChart, CrosshairMode } from 'lightweight-charts'
import { useParams } from 'react-router-dom'
import { getOneTradingPair, getHistoricalData, get24HourData, createComment, getUserProfile } from '../../lib/api'
import useForm from '../utils/useForm'
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
  Avatar,
  WrapItem,
  Wrap,
  Text,
  Spacer,
  Heading,
  Stack,
  FormControl,
  InputGroup,
  InputLeftElement,
  Textarea,
  Radio,
  RadioGroup
} from '@chakra-ui/react'
import { ChatIcon, ChevronDownIcon, EditIcon } from '@chakra-ui/icons'
import { getPayload, getToken } from '../../lib/auth'
import FormTrade from './FormTrade'

function TradingPairShow() {
  const [tradingPair, setTradingPair] = React.useState(undefined)
  const [lastDayData, setLastDayData] = React.useState(undefined)
  const [interval, setInterval] = React.useState('5m')
  const [commentTicker, setCommentTicker] = React.useState(false)
  const [userData, setUserData] = React.useState(undefined)

  const [chartHasGenerated, setChartHasGenerated] = React.useState(false)
  const [historicalCandleDataHasBeenFetched, setHistoricalCandleDataHasBeenFetched] = React.useState(false)
  const [webSocketHasBeenAssigned, setWebSocketHasBeenAssigned] = React.useState(false)

  let chart = undefined
  let dayVolumeTicker = true
  const [candleSeries, setCandleSeries] = React.useState(undefined)

  const { name } = useParams()
  
  const socketRef = React.useRef()
  const ref = React.useRef()
  const commentsEndRef = React.useRef()

  React.useEffect(() => {
    const scrollToBottomComments = () => {
      commentsEndRef.current?.scrollIntoView({ behaviour: 'smooth' })
    }
    scrollToBottomComments()
  }, [tradingPair])

  const { formdata, handleChange, setFormdata } = useForm({
    text: ''
  })

  const handleComment = async (e) => {
    e.preventDefault()
    try {
      const token = getToken()
      formdata.trading_pair = tradingPair.id
      await createComment(formdata, token)
      setFormdata(
        {
          'text': '',
          'bull_or_bear': '',
          'trading_pair': tradingPair.id
        }
      )
      setCommentTicker(!commentTicker)
    } catch (err) {
      console.log(err)
    }
  }

  const thousandsSeparators = (num) => {
    const numParts = num.toString().split('.')
    numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return numParts.join('.')
  }

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
    const token = getToken()
    const getUserData = async () => {
      try {
        const { data } = await getUserProfile(token)
        setUserData(data)
      } catch (error) {
        console.log(error)
      }
    }
    getUserData()
    getTradingPairData()
  }, [name, commentTicker])

  React.useEffect(() => {

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
          if (dayVolumeTicker) {
            try {
              const { data } = await get24HourData(name)
              setLastDayData(data)
              dayVolumeTicker = !dayVolumeTicker
              console.log('24 hr data found')
            } catch (error) {
              console.log('Error retrieving 24 hr data: ', error)
            }
          } else {
            dayVolumeTicker = !dayVolumeTicker
          }
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
        <Container maxW='100%' maxH='91vh' p={0} >
          <Grid
            padding='10px'
            bg='gray.400'
            w='100%'
            maxH='91vh'
            templateRows="repeat(14, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            <GridItem rowStart={1} rowEnd={3} colStart={1} colEnd={2} p={2} pt={0} bg='gray.400' overflow='scroll' boxShadow='dark-lg' rounded='lg'>
              <Box>
                {tradingPair ?
                  <>
                    <Heading fontSize='xl' color='gray.800' fontWeight='medium'>
                      About {tradingPair.name}
                    </Heading>
                    <Text fontSize='sm' color='gray.800'>
                      {tradingPair.description}
                    </Text>
                  </>
                  : 'data loading'}
              </Box>
            </GridItem>
            <GridItem rowSpan={1} colSpan={2} color='gray.800'>
              <Flex borderRadius='lg'>
                {tradingPair ? 
                  <Center>
                    <Avatar
                      size='md'
                      name={tradingPair.name}
                      src={tradingPair.symbol}
                      alt="coin symbol" 
                    /> 
                    <Heading fontSize='xl' ml={3} fontWeight='medium'>
                      {tradingPair.name.toUpperCase() + ', ' + tradingPair.ticker} 
                    </Heading>
                  </Center>
                  : 'data loading'}

                <Spacer />
                <Center>
                  <Text fontSize='lg'>
                  24hr Trading Volume: {lastDayData && tradingPair ? thousandsSeparators(parseFloat(lastDayData?.volume).toFixed(2)) + ' ' + tradingPair.ticker : 'Loading...'}
                  </Text>
                </Center>
                <Spacer />
                <Center>
                  <Menu placement='right' flip>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg='gray.700' color='gray.100' _expanded={{ boxShadow: 'md', bg: 'gray.800', color: 'white' }} _hover={{ boxShadow: 'md', bg: 'gray.800', color: 'white' }}>
                      {interval === '5m' ? 'Interval' : interval}
                    </MenuButton>
                    <MenuList overflow='visible'>
                      <MenuOptionGroup title='Interval' type='radio'>
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
                </Center>
              </Flex>     
            </GridItem>
            <GridItem rowStart={2} rowEnd={9} colStart={2} colEnd={4} borderRadius='lg' borderColor='gray.500' border='1px' overflow='hidden'>
              {ref ? 
                <Center>
                  <Box ref={ref}></Box>
                </Center> : <p>loading chart</p>}
            </GridItem>
            <GridItem rowStart={1} rowEnd={3} colStart={4} colEnd={5} p={2} pt={0} bg='gray.400' overflow='scroll' boxShadow='dark-lg' rounded='lg'>
              <Box>
                <Heading fontSize='xl' color='gray.800' textAlign='center' fontWeight='medium' mb={5}>
                  Favourited By:
                </Heading>
                {tradingPair ? 
                  <Wrap >
                    {tradingPair.favourited_by.map(user => {
                      return (
                        <WrapItem mt={0} key={user.id}>
                          <Avatar size='md' src={user.profile_image} />
                        </WrapItem>
                      )
                    })}
                  </Wrap>
                  : 'data loading'}
              </Box>
            </GridItem>
            <GridItem rowStart={3} rowEnd={12} colStart={1} colEnd={2} borderRadius='lg' bg='gray.400' boxShadow='2xl' rounded='lg' overflow='scroll'>
              <Box>
                <Heading fontSize='xl' color='gray.800' textAlign='center' fontWeight='medium' mb={5}>
                  Sentiment:
                </Heading>
                {tradingPair ? 
                  <Stack spacing={3}>
                    {tradingPair.comments.map(comment => {
                      return (
                        <Flex key={comment.id}>
                          {comment.owner.id === getPayload().sub ?
                            <>
                              <Spacer />
                              <Flex direction='column' bg='gray.700' rounded='md' boxShadow='inner' alignSelf='flex-end' p={2} minW='50%'>
                                <Flex>
                                  <Heading fontSize="xl" mb={0}>{comment.bull_or_bear ? '🐮' : '🐻'} </Heading>
                                  <Spacer />
                                  <Heading color='gray.100' fontSize="md" mb={0}>{comment.owner.username}</Heading>
                                </Flex>
                                <Text mt={1} fontSize='sm' color='gray.100'>{comment.text}</Text>
                              </Flex>
                              <Avatar size='sm' name={comment.owner.username} src={comment.owner.profile_image} ml={1}/>
                            </>
                            :
                            <>
                              <Avatar size='sm' name={comment.owner.username} src={comment.owner.profile_image} mr={1}/>
                              <Flex direction='column' bg='gray.700' rounded='md' boxShadow='inner' p={2} minW='50%'>
                                <Flex>
                                  <Heading color='gray.100' fontSize="md" mb={0}>{comment.owner.username}</Heading>
                                  <Spacer />
                                  <Heading fontSize="xl" mb={0}>{comment.bull_or_bear ? '🐮' : '🐻'} </Heading>
                                </Flex>
                                <Text mt={1} fontSize='sm' color='gray.100'>{comment.text}</Text>
                              </Flex>
                            </>
                          }
                          
                        </Flex>
                      )
                    })}
                    <div ref={commentsEndRef} />
                  </Stack>
                  : 'data loading'}
              </Box>
            </GridItem>
            <GridItem rowStart={12} rowEnd={15} colStart={1} colEnd={2} bg='gray.400' boxShadow='dark-lg' rounded='lg'>
              <form action='submit' onSubmit={handleComment} >
                <Flex>
                  <RadioGroup
                    spacing={2} 
                    mt={2} 
                    name='rating' 
                    value={formdata.bull_or_bear}>
                    <Stack direction="row" color='gray.800'>
                      <Radio 
                        ml={3}
                        isRequired 
                        isChecked={false} 
                        name='bull_or_bear' 
                        value='true' 
                        onChange={handleChange}
                      >Bull 🐮
                      </Radio>
                      <Radio 
                        // isDisabled={error} 
                        isChecked={false} 
                        name='bull_or_bear' value='false' 
                        onChange={handleChange}
                      >Bear 🐻
                      </Radio>
                    </Stack>
                  </RadioGroup>
                  <Spacer />
                  <Button
                    type='submit'
                    alignSelf='center'
                    align='right'
                    variant='solid' 
                    bg='gray.700'
                    color='gray.100'
                    boxShadow='sm'
                    _hover={{ boxShadow: 'md', bg: 'gray.800', color: 'white' }}
                  >
                    <EditIcon mr={3}/>Post
                  </Button>                         
                </Flex>                                        
                <FormControl isRequired>
                  <InputGroup>
                    <InputLeftElement color='gray.100'  children={<ChatIcon />}/>
                    <Textarea
                      type='text'
                      pl={8}
                      size='lg'
                      name='text'
                      bg='gray.700'
                      color='gray.200'
                      minH={window.innerHeight / 9}
                      // onFocus={handleFocus}
                      onChange={handleChange}
                      value={formdata.text}
                      placeholder={'Join the conversation'}
                      aria-label='description'
                    />
                  </InputGroup>
                </FormControl>
              </form>
            </GridItem>
            <GridItem rowStart={9} rowEnd={15} colSpan={2} borderRadius='lg'>
              <Grid
                padding='10px'
                bg='gray.700'
                w='full'
                h='full'
                templateRows="repeat(4, 1fr)"
                templateColumns="repeat(2, 1fr)"
                gap={2}
                borderRadius='lg'>
                <GridItem rowSpan={6} colSpan={1}>
                  <FormTrade 
                    setTradingPair={setTradingPair}
                    userData={userData}
                    setUserData={setUserData}
                    tradingPair={tradingPair} 
                    orderType='Buy'></FormTrade>
                </GridItem>
                <GridItem rowSpan={6} colSpan={1}>
                  <FormTrade 
                    setTradingPair={setTradingPair}
                    setUserData={setUserData}
                    userData={userData} 
                    tradingPair={tradingPair} 
                    orderType='Sell'></FormTrade>
                </GridItem>           
              </Grid>
            </GridItem>
            <GridItem rowStart={3} rowEnd={15} colStart={4} colEnd={4} borderRadius='lg' borderColor='tomato' bg='gray.400' overflow='scroll'>
              <Box>
                <Heading fontSize='xl' color='gray.800' textAlign='center' fontWeight='medium' mb={5}>
                  Recent trades:
                </Heading>
                <Stack spacing={3}>
                  {tradingPair?.trade_posts.map(post => {
                    return (
                      <Flex key={post.id} direction='column' bg='gray.700' borderRadius='md' p={2} minW='50%' color='gray.200'>
                        <Flex>
                          <Text fontWeight='bold' color={post.bought_or_sold ? '#0dd410' : '#ff1919'}>
                            {post.bought_or_sold ? 'BUY' : 'SELL'}
                          </Text>
                          <Spacer />
                          <Text textAlign='right' fontSize='sm'>
                            {new Date(post.created_at).toLocaleDateString('en-GB') + ' '}
                            at
                            {' ' + new Date(post.created_at).toLocaleTimeString('en-GB')}
                          </Text>
                        </Flex>
                        <Flex color={post.bought_or_sold ? '#0dd410' : '#ff1919'}>
                          <Text>
                            {thousandsSeparators(post.amount.toPrecision(3))}
                          </Text>
                          <Spacer />
                          <Text>
                            at
                          </Text>
                          <Spacer />
                          <Text>
                            ${thousandsSeparators((post.total / post.amount).toFixed(2))}
                          </Text>
                          <Spacer />
                          <Text>
                            /
                          </Text>
                          <Spacer />
                          <Text>
                            {tradingPair.ticker}
                          </Text>
                          <Spacer />
                          <Spacer />
                          <Spacer />
                          <Text color='gray.200' fontWeight='semibold'>
                            - {post.owner.username}
                          </Text>
                        </Flex>
                      </Flex>
                    )
                  }).reverse()}
                </Stack>
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </ChakraProvider>
    </>
  )
}

export default TradingPairShow