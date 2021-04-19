/* eslint-disable react/no-children-prop */
import React from 'react'
// import * as SockJS from 'sockjs-client'
import { useParams } from 'react-router-dom'
import { getOneTradingPair, createComment, getUserProfile, favouriteCoin, unfavouriteCoin } from '../../lib/api'
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
  useToast,
  Avatar,
  Text,
  Spacer,
  Heading,
  Stack,
  FormControl,
  InputGroup,
  InputLeftElement,
  Textarea,
  Radio,
  RadioGroup,
  Icon
} from '@chakra-ui/react'
import { ChatIcon, ChevronDownIcon, EditIcon } from '@chakra-ui/icons'
import { BsStar, BsStarFill } from 'react-icons/bs'
import { getPayload, getToken } from '../../lib/auth'
import FormTrade from './FormTrade'
import Chart from './Chart'

function TradingPairShow() {
  const [tradingPair, setTradingPair] = React.useState(undefined)
  const [lastDayData, setLastDayData] = React.useState(undefined)
  const [interval, setInterval] = React.useState('2h')
  const [userData, setUserData] = React.useState(undefined)
  const [tradingPairDataFound, setTradingPairDataFound] = React.useState(false)
  
  const commentsEndRef = React.useRef()
  const { name } = useParams()
  const toast = useToast()
  const { formdata, handleChange, setFormdata } = useForm({
    text: ''
  })

  const token = getToken()

  const getUserData = async () => {
    try {
      const token = getToken()
      const { data } = await getUserProfile(token)
      setUserData(data)
    } catch (error) {
      console.log(error)
    }
  }

  const handleFavourite = async () => {
    try {
      const token = getToken()
      if (tradingPair.favourited_by.some(user => user.id === userData.id)) {
        await unfavouriteCoin(name, token)
        toast({
          title: 'Unfavourited!',
          description: 'Nevermind, plenty more blocks in the chain',
          status: 'warning',
          duration: 4200,
          isClosable: true
        })
      } else {
        await favouriteCoin(name, token)
        toast({
          title: 'Favourited!',
          description: 'Access this coin faster from your Favourites tab',
          status: 'success',
          duration: 4200,
          isClosable: true
        })
      }
      setTradingPairDataFound(false)
      
    } catch (error) {
      console.log('error favouriting coin: ', error)
    }
  }

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
      setTradingPairDataFound(false)
    } catch (err) {
      console.log(err)
    }
  }

  const thousandsSeparators = (num) => {
    const numParts = num.toString().split('.')
    numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return numParts.join('.')
  }

  const getTradingPairData = async () => {
    try {
      const { data } = await getOneTradingPair(name)
      setTradingPair(data)
    } catch (error) {
      console.log('Error retrieving trading pair data from django: ', error)
    }
  }

  React.useEffect(() => {
    const scrollToBottomComments = () => {
      commentsEndRef.current?.scrollIntoView({ behaviour: 'smooth' })
    }
    if (tradingPairDataFound && tradingPair) {
      scrollToBottomComments()
    }
  }, [tradingPairDataFound, tradingPair])

  React.useEffect(() => {
    getUserData()

    if (!tradingPairDataFound) {
      getTradingPairData()
      setTradingPairDataFound(true)
    }
  }, [tradingPairDataFound, token])

  return (
    <>
      <ChakraProvider>
        <Container maxW='100%' maxH='100%' p={0} >
          <Grid
            padding='10px'
            bg='gray.400'
            w='100%'
            maxH='92vh'
            templateRows="repeat(14, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={3}
          >
            <GridItem rowStart={1} rowEnd={3} colStart={1} colEnd={2} borderRadius='lg' bg='gray.400' boxShadow='dark-lg' rounded='lg' overflow='scroll'>
              <Box>
                {tradingPair ?
                  <>
                    <Heading fontSize='xl' color='gray.100' bg='gray.700' textAlign='center' fontWeight='medium' mb={2}>
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
                      {tradingPair.name.toUpperCase() + '  (' + tradingPair.ticker + ')'} 
                    </Heading>
                  </Center>
                  : 'data loading'}

                <Spacer />
                <Center>
                  <Text fontSize='lg'>
                  24h Trading Volume: {lastDayData && tradingPair ? thousandsSeparators(parseFloat(lastDayData?.volume).toFixed(2)) + ' ' + tradingPair.ticker : 'Loading...'}
                  </Text>
                </Center>
                <Spacer />
                <Center>
                  <Menu placement='right' flip>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg='gray.700' color='gray.100' _expanded={{ boxShadow: 'md', bg: 'gray.800', color: 'white' }} _hover={{ boxShadow: 'md', bg: 'gray.800', color: 'white' }}>
                      {interval === '2h' ? 'Interval' : interval}
                    </MenuButton>
                    <MenuList overflow='visible'>
                      <MenuOptionGroup title='Interval' type='radio'>
                        <MenuItemOption 
                          value='1m' 
                          onClick={() => {
                            setInterval('1m')
                          }}
                        >1 minute
                        </MenuItemOption>
                        <MenuItemOption 
                          value='5m'
                          onClick={() => {
                            setInterval('5m')
                          }}
                        >5 minutes
                        </MenuItemOption>
                        <MenuItemOption 
                          value='15m' 
                          onClick={() => {
                            setInterval('15m')
                          }}
                        >15 minutes
                        </MenuItemOption>
                        <MenuItemOption 
                          value='1h' 
                          onClick={() => {
                            setInterval('1h')
                          }}
                        >1 hour
                        </MenuItemOption>
                        <MenuItemOption 
                          value='4h'
                          onClick={() => {
                            setInterval('4h')
                          }}
                        >4 hours
                        </MenuItemOption>
                        <MenuItemOption 
                          value='8h'
                          onClick={() => {
                            setInterval('8h')
                          }}
                        >8 hours
                        </MenuItemOption>
                        <MenuItemOption 
                          value='1d'
                          onClick={() => {
                            setInterval('1d')
                          }}
                        >1 day
                        </MenuItemOption>
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                </Center>
              </Flex>     
            </GridItem>
            <GridItem rowStart={2} rowEnd={9} colStart={2} colEnd={4} borderRadius='lg' borderColor='gray.500' border='1px' overflow='hidden'>
              <Chart tradingPair={tradingPair} interval={interval} setLastDayData={setLastDayData} />
            </GridItem>
            <GridItem rowStart={1} rowEnd={3} colStart={4} colEnd={5} borderRadius='lg' bg='gray.400' boxShadow='dark-lg' rounded='lg' overflow='scroll'>
              <Box>
                <Heading fontSize='xl' color='gray.100' bg='gray.700' textAlign='center' fontWeight='medium' mb={5}>
                  Favourited By
                </Heading>
                <Stack direction='row'>
                  {userData && tradingPair && token ? 
                    <>
                      {tradingPair.favourited_by.some(user => user.id === userData.id) ? 
                        <Center 
                          borderRadius='md'
                          fontSize='xx-large'
                          ml={2}
                          p={2}
                          bg='gray.400'
                          color='gray.700'
                          boxShadow='sm'
                          _hover={{ boxShadow: 'md', bg: 'gray.500', color: 'gray.700' }}
                          onClick={() => handleFavourite()}>
                          <Icon as={BsStarFill}/> 
                        </Center>
                        : 
                        <Center 
                          borderRadius='md'
                          ml={2}
                          p={2}
                          fontSize='xx-large'
                          bg='gray.400'
                          color='gray.700'
                          boxShadow='sm'
                          _hover={{ boxShadow: 'md', bg: 'gray.500', color: 'gray.700' }}
                          onClick={() => handleFavourite()}>
                          <Icon as={BsStar}/> 
                        </Center>
                      }
                    </>
                    :
                    ''}
                  {tradingPair?.favourited_by?.length ?
                    <>
                      {tradingPair.favourited_by.map(user => {
                        return (
                          <Avatar ml={3} key={user.id} size='md' src={user.profile_image} />
                        )
                      })}
                    </>
                    : 'Nobody has favourited this coin yet... Sounds like a buying opportunity to me!'}
                </Stack>
              </Box>
            </GridItem>
            <GridItem rowStart={3} rowEnd={12} colStart={1} colEnd={2} borderRadius='lg' bg='gray.400' boxShadow='2xl' rounded='lg' overflow='scroll'>
              <Box>
                <Heading fontSize='xl' color='gray.100' bg='gray.700' textAlign='center' fontWeight='medium' mb={5}>
                  Sentiment
                </Heading>
                {tradingPair ? 
                  <Stack spacing={3}>
                    {tradingPair.comments?.map(comment => {
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
                    tradingPair={tradingPair}
                    setTradingPairDataFound={setTradingPairDataFound}
                    userData={userData}
                    setUserData={setUserData}
                    orderType='Buy'></FormTrade>
                </GridItem>
                <GridItem rowSpan={6} colSpan={1}>
                  <FormTrade 
                    tradingPair={tradingPair}
                    setTradingPairDataFound={setTradingPairDataFound}
                    setUserData={setUserData}
                    userData={userData} 
                    orderType='Sell'></FormTrade>
                </GridItem>           
              </Grid>
            </GridItem>
            <GridItem rowStart={3} rowEnd={15} colStart={4} colEnd={4} borderRadius='lg' borderColor='tomato' bg='gray.400' overflow='scroll'>
              <Box>
                <Heading fontSize='xl' color='gray.100' bg='gray.700' textAlign='center' fontWeight='medium' mb={5}>
                  Recent Trades
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