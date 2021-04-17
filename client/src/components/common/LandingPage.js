import { Box, Center, Container, Divider, Flex, Heading, ListIcon, List, ListItem, Text, Button, ChakraProvider, extendTheme } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import React from 'react'

function LandingPage() {

  const theme = extendTheme({
    fonts: {
      heading: 'Electrolize'
    }
  })

  return (
    <ChakraProvider theme={theme}>
      <Container 
        bg='gray.400'
        minW='100%' 
        minH='92vh' 
        p={0}>
        <Center h='60vh' >
          <Box borderWidth='3px' borderColor='gray.800' maxW='60vw' p={5} boxShadow='dark-lg' borderRadius='xl' color='gray.800'>
            <Flex alignItems='center'>
              <Heading fontSize='8xl' mr={6}>
              eTavros
              </Heading>
              <Flex direction='column' textAlign='center'>
                <Heading fontSize='xl' fontWeight='semibold'>
                  Welcome to eTavros
                </Heading>
                <Text fontSize='lg' mb={4}>
                The virtual cryptocurrency trading platform
                </Text>
                <Divider />
                <List mt={4} mb={4} spacing={2} color='gray.800' textAlign='left' fontSize='sm'>
                  <ListItem>
                    <Flex alignItems='center'>
                      <ListIcon as={CheckCircleIcon} color="grey.800" />
                      <Text>
                        Browse, track, & trade the hottest cryptocurrencies on the market                  
                      </Text>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex alignItems='center'>
                      <ListIcon as={CheckCircleIcon} color="grey.800" />
                      <Text>
                        Immerse yourself in a streamlined trading experience with live, interactive candlestick charts
                      </Text>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex alignItems='center'>
                      <ListIcon as={CheckCircleIcon} color="grey.800" />
                      <Text>
                        View other users&apos; trades and ridicule their mistakes
                      </Text>
                    </Flex>
                  </ListItem>
                  <ListItem>
                    <Flex alignItems='center'>
                      <ListIcon as={CheckCircleIcon} color="grey.800" />
                      <Text>
                        Watch the value of your portfolio rise and fall with the tides of market sentiment
                      </Text>
                    </Flex>
                  </ListItem>
                </List>
                <Link to='/markets/' minW='full'>
                  <Button 
                    display={{ base: 'block', md: 'block' }}
                    flexBasis={{ base: '100%', md: 'auto' }} 
                    bg='gray.200' 
                    as='button'
                    w='full'>
              Show me the money
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Box>
        </Center>
      </Container>
    </ChakraProvider>
  )
}

export default LandingPage