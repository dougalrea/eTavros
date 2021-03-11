import { Box, ChakraProvider, Container, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import React from 'react'
import { getAllTradingPairs } from '../../lib/api'

function TradingPairsIndex() {

  const [tradingPairData, setTradingPairData] = React.useState(null)

  React.useEffect( async () => {
    try {
      const { data } = await getAllTradingPairs()
      setTradingPairData(data)
    } catch (error) {
      console.log(error)
    }
  })


  return (
    <ChakraProvider>
      <Container maxW='80%' maxH='91vh' pr={0} overflow='scroll' bg='gray.400' mt={6} borderColor='black' borderWidth='1px'>

        <Tabs color='gray.100'>
          <TabList >
            <Tab bg='gray.700' rounded='md' fontSize='lg'>
          All markets
            </Tab>
            <Tab bg='gray.700' rounded='md'>
          Favourites
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {tradingPairData ? tradingPairData.map(tradingPair => {
                return (
                  <Box key={tradingPair.id} bg='gray.700' color='gray.100'>
                    {tradingPair.name}
                  </Box>
                )
              }) : 'loading markets'}
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