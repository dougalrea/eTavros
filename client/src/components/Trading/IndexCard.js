import { Avatar, Box, Text, Grid, GridItem, Button, Skeleton } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import React from 'react'


function IndexCard({ tradingPair, ticker }) {
  const [liveMarketData, setLiveMarketData] = React.useState(null)
  const socketRef = React.useRef()

  const thousandsSeparators = (num) => {
    const numParts = num.toString().split('.')
    numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return numParts.join('.')
  }

  React.useEffect(() => {
    const getLiveDataFeed = () => {
      socketRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${ticker.toString().toLowerCase()}busd@ticker`)
      socketRef.current.onopen = e => {
        console.log('index websocket connected', e)
      }
      socketRef.current.onmessage = async (event) => {
        const message = JSON.parse(event?.data)
        setLiveMarketData(message)
      }
    }
    if (tradingPair) {
      getLiveDataFeed()
    }

    return function cleanup() {
      if (socketRef.current) {
        console.log('cleaning up the index data streams')
        socketRef.current.close()
      }
    }
  }, [tradingPair])

  return (
    <Box rounded='lg' bg='gray.700' color='gray.100' p={4} >
      {tradingPair ? 
        <Grid templateColumns="repeat(20, 1fr)" gap={2} alignItems='center' fontSize='md'>
          <GridItem colSpan={1}>
            <Avatar
              size='sm'
              name={tradingPair.name}
              src={tradingPair.symbol}
              alt="coin symbol" 
            /> 
          </GridItem>
          <GridItem colSpan={2} >
            <Text fontSize='lg' fontWeight='semibold'>
              {tradingPair.name.toUpperCase()}
            </Text>
          </GridItem>
          <GridItem colSpan={2} >
            {liveMarketData ?
              <Text >
                ${thousandsSeparators(parseFloat(liveMarketData.c).toFixed(2))}
              </Text> 
              : 
              <Skeleton startColor="green.600" endColor="orange.600" height="20px"/>}
          </GridItem>
          <GridItem colSpan={2} >
            {liveMarketData ?
              <Text color={liveMarketData.P > 0 ? '#1cf200' : '#ff1919'}>
                {parseFloat(liveMarketData.P).toFixed(2)} %
              </Text>
              :
              <Skeleton startColor="green.600" endColor="orange.600" height="20px"/>}
          </GridItem>
          <GridItem colSpan={2} >
            {liveMarketData ?
              <Text>
                ${thousandsSeparators(parseFloat(liveMarketData.h).toFixed(2))}
              </Text>
              :
              <Skeleton startColor="green.600" endColor="orange.600" height="20px"/>}
          </GridItem>
          <GridItem colSpan={2}>
            {liveMarketData ?
              <Text>
                ${thousandsSeparators(parseFloat(liveMarketData.l).toFixed(2))}
              </Text>
              :
              <Skeleton startColor="green.600" endColor="orange.600" height="20px"/>}
          </GridItem>
          <GridItem colSpan={3}>
            {liveMarketData ?
              <Text>
                ${thousandsSeparators(parseFloat(liveMarketData.c * tradingPair.total_suppy).toFixed(0))}
              </Text>
              :
              <Skeleton startColor="green.600" endColor="orange.600" height="20px"/>}
          </GridItem>
          <GridItem colSpan={3}>
            {liveMarketData ?
              <Text>
                {thousandsSeparators(parseFloat(liveMarketData.v).toFixed(0)) + ' ' + ticker}
              </Text>
              :
              <Skeleton startColor="green.600" endColor="red.600" height="20px"/>}
          </GridItem>
          <GridItem colSpan={3}>
            <Link to={`/markets/${tradingPair.name}/`}>
              <Button bg='gray.200' color='gray.800' w='full'>
              Trade {tradingPair.ticker}/vUSD
              </Button>
            </Link>
          </GridItem>
        </Grid>
        : 'loading markets'}
    </Box>
  )
}

export default IndexCard