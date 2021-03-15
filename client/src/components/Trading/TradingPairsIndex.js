import { Box, ChakraProvider, Container, Grid, GridItem, Stack, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from '@chakra-ui/react'
import React from 'react'
import { getAllTradingPairs } from '../../lib/api'
import IndexCard from './IndexCard'

function TradingPairsIndex() {

  const [tradingPairData, setTradingPairData] = React.useState(null)

  React.useEffect( async () => {
    try {
      const { data } = await getAllTradingPairs()
      setTradingPairData(data)
    } catch (error) {
      console.log(error)
    }
  }, [])

  return (
    <ChakraProvider>
      <Container minW='full' minH='container.lg' pr={14} pl={14} overflow='scroll' bg='gray.400' borderColor='black' borderWidth='1px'>
        <Tabs variant='unstyled' color='gray.100' mt={4}>
          <TabList>
            <Tab ml={4} minW='20' bg='gray.700' rounded='md' fontSize='md' fontWeight='semibold' _selected={{ color: 'gray.100', bg: 'gray.800', boxShadow: '2xl' }}>
              All
            </Tab>
            <Tab bg='gray.700' rounded='md' fontSize='md' fontWeight='semibold' _selected={{ color: 'gray.100', bg: 'gray.800', boxShadow: '2xl' }}>
              Favourites
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box pb={4} pl={4} pr={4}>
                <Grid templateColumns="repeat(20, 1fr)" gap={2} alignItems='center' color='gray.800'>
                  <GridItem colStart={4} colEnd={6}>
                    <Text fontSize='sm'>
                      Current Price
                    </Text>
                  </GridItem>
                  <GridItem colStart={6} colEnd={8}>
                    <Text fontSize='sm'>
                      24hr Change
                    </Text>
                  </GridItem>
                  <GridItem colStart={8} colEnd={10}>
                    <Text fontSize='sm'>
                      24hr High
                    </Text>
                  </GridItem>
                  <GridItem colStart={10} colEnd={12}>
                    <Text fontSize='sm'>
                      24hr Low
                    </Text>
                  </GridItem>
                  <GridItem colStart={12} colEnd={15}>
                    <Text fontSize='sm'>
                      Market Capitalisation
                    </Text>
                  </GridItem>
                  <GridItem colStart={15} colEnd={17}>
                    <Text fontSize='sm'>
                      24hr Volume
                    </Text>
                  </GridItem>
                </Grid>
              </Box>
              {tradingPairData ? 
                <Stack spacing={1} >
                  {tradingPairData.map(tradingPair => {
                    return (
                      <IndexCard key={tradingPair.id} tradingPair={tradingPair} ticker={tradingPair.ticker} />
                    )
                  }).sort(function(a, b) {
                    return a.key - b.key
                  })}
                </Stack>
                :
                'Loading markets'}
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