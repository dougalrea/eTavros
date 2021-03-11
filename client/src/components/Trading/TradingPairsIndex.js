import { Avatar, Box, Center, ChakraProvider, Container, Flex, Spacer, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { getAllTradingPairs } from '../../lib/api'

function TradingPairsIndex() {

  const [tradingPairData, setTradingPairData] = React.useState(null)
  const [BTCLiveFeed, setBTCLiveFeed] = React.useState(null)
  const [ETHLiveFeed, setETHLiveFeed] = React.useState(null)

  React.useEffect( async () => {
    try {
      const { data } = await getAllTradingPairs()
      setTradingPairData(data)
      console.log('yeet')
    } catch (error) {
      console.log(error)
    }
  }, [])

  // `wss://stream.binance.com:9443/stream?streams=${tradingPairData[0].ticker.toString().toLowerCase()}@ticker/${tradingPairData[1].ticker.toString().toLowerCase()}@ticker/`

  const socketRef = React.useRef()

  React.useEffect(() => {
    const getLiveDataFeed = () => {
      socketRef.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${tradingPairData[0].ticker.toString().toLowerCase()}busd@ticker/${tradingPairData[1].ticker.toString().toLowerCase()}busd@ticker`)
      socketRef.current.onopen = e => {
        console.log('index websocket connected', e)
      }
      socketRef.current.onmessage = async (event) => {
        const message = JSON.parse(event?.data)
        console.log(message)
        if (message.data.s === 'BTCBUSD') {
          setBTCLiveFeed(message.data)
        } else if (message.data.s === 'ETHBUSD') {
          setETHLiveFeed(message.data)
        }
      }
    }
    if (tradingPairData) {
      getLiveDataFeed()
    }
  }, [tradingPairData])

  return (
    <ChakraProvider>
      <Container minW='full' minH='container.lg' pr={14} pl={14} overflow='scroll' bg='gray.400' borderColor='black' borderWidth='1px'>
        <Tabs variant='unstyled' color='gray.100' mt={4}>
          <TabList>
            <Spacer />
            <Tab minW='20' bg='gray.700' rounded='md' fontSize='md' fontWeight='semibold' _selected={{ color: 'gray.100', bg: 'gray.800', boxShadow: '2xl' }}>
              All
            </Tab>
            <Spacer />
            <Tab bg='gray.700' rounded='md' fontSize='md' fontWeight='semibold' _selected={{ color: 'gray.100', bg: 'gray.800', boxShadow: '2xl' }}>
              Favourites
            </Tab>
            <Spacer />
          </TabList>

          <TabPanels>
            <TabPanel>
              <Stack spacing={4} >
                {tradingPairData ? tradingPairData.map(tradingPair => {
                  return (
                    <Link key={tradingPair.id} to={`/markets/${tradingPair.name}`}>
                      <Box rounded='lg' bg='gray.700' color='gray.100' p={4} >
                        <Flex direction='row'>
                          <Avatar
                            size='md'
                            name={tradingPair.name}
                            src={tradingPair.symbol}
                            alt="coin symbol" 
                          /> 
                          <Center ml={6} fontSize='xl' fontWeight='semibold'>
                            {tradingPair.name.toUpperCase()}
                          </Center>
                          <Spacer />
                          <Center fontSize='lg'>
                            {tradingPair.ticker === 'BTC' && BTCLiveFeed ?
                              (
                                <Text>
                                  ${parseFloat(BTCLiveFeed.c).toFixed(2)}
                                </Text>
                              )
                              : 
                              tradingPair.ticker === 'ETH' && BTCLiveFeed ? 
                                (
                                  <Text>
                                    ${parseFloat(ETHLiveFeed.c).toFixed(2)}
                                  </Text>
                                ) : 'nothing'}
                          </Center>
                          <Spacer />
                        </Flex>
                      </Box>
                    </Link>
                  )
                }) : 'loading markets'}
              </Stack>
              
            </TabPanel>
            <TabPanel>
              <p>two!</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>


    </ChakraProvider>
  )
}

export default TradingPairsIndex