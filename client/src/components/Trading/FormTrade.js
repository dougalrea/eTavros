/* eslint-disable react/no-children-prop */
import { } from '@chakra-ui/icons'
import { 
  Button, 
  Divider, 
  FormControl, 
  FormErrorMessage, 
  FormHelperText, 
  InputGroup, 
  InputLeftAddon, 
  InputRightElement, 
  Stack, 
  useToast,
  Icon,
  Text,
  NumberInput,
  NumberInputField,
  Center
} from '@chakra-ui/react'
import { FaWallet } from 'react-icons/fa'
import React from 'react'
import { getToken } from '../../lib/auth'
import { createTradePost, get24HourData, getUserProfile, performTrade } from '../../lib/api'
import { useParams } from 'react-router-dom'


function FormTrade({ orderType, tradingPair, setTradingPairDataFound, userData, setUserData }) {
  const [balanceChangeTicker, setBalanceChangeTicker] = React.useState(false)
  const [lastPrice, setLastPrice] = React.useState(null)
  const [error, setError] = React.useState(false)
  const initialState = {
    'buy': '',
    'amount': '',
    'total': '',
    'tradingPairName': ''
  }
  const [formdata, setFormdata] = React.useState(initialState)
  const [errors, setErrors] = React.useState(initialState)

  const { name } = useParams()
  const token = getToken()

  const refreshLastPrice = async () => {
    try {
      const { data } = await get24HourData(name)
      setLastPrice(data.lastPrice)
      console.log('last price: ', data.lastPrice)
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
  // const getTradingPairData = async () => {
  //   try {
  //     const { data } = await getOneTradingPair(name)
  //     setTradingPair(data)
  //   } catch (error) {
  //     console.log('Error retrieving trading pair data from django: ', error)
  //   }
  // }

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

  React.useEffect(() => {
    refreshLastPrice()
    getUserData()
  }, [token])

  const handleFocus = (e) => {
    e.preventDefault()
    setError(false)
  }

  const toast = useToast()

  const triggerToast = () => {
    toast({
      title: 'Transaction successful!',
      description: 'Your wallet balances have been updated',
      status: 'success',
      duration: 4200,
      isClosable: true
    })
  }

  const thousandsSeparators = (num) => {
    if (num) {
      const numParts = num.toString().split('.')
      numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return numParts.join('.')  
    }
  }


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
        console.log('unsecpected error: ', error)
        setError('Something unexpected happened, sorry about that!')
      }
    }
    setTimeout(() => {
      setError(false)
    }, 2800)
    setBalanceChangeTicker(!balanceChangeTicker)
  }

  return (
    <form action='submit' onSubmit={handleTrade}>
      <Stack spacing={2} >
        <FormControl isRequired>
          
          <FormHelperText textAlign='center' color='gray.200'>
            {userData && tradingPair && token ? 
              <Center pb={3}>
                <Icon as={FaWallet} color='gray.200' mr={4} />
                {orderType === 'Buy' ? `$${thousandsSeparators(userData.cash_balance)}` : userData[`${tradingPair.name}_balance`] + ' ' + tradingPair.ticker}
              </Center> 
              :
              <Center pb={3}>
                {!token ? 
                  `Log in to view ${orderType === 'Buy' ? 'vUSD' : tradingPair?.ticker} balance` :
                  'loading'}
              </Center>
            }
          </FormHelperText>
          <InputGroup color='gray.200' bg='gray.500' borderRadius='md' borderColor='gray.500'>
            <InputLeftAddon children='Amount' bg='gray.500'/>
            <InputRightElement children={tradingPair?.ticker} />
            <NumberInput bg='gray.500' borderColor='gray.500' min={0.000001} value={formdata?.amount ? parseFloat(formdata.amount) : ''} precision={8} keepWithinRange={true}>
              <NumberInputField
                borderColor='gray.500'
                name='amount' 
                textAlign='right'
                color='gray.700'
                type='number'
                aria-label='Amount' 
                onFocus={handleFocus}
                onChange={handleChange}
              />
            </NumberInput>
          </InputGroup>
          <FormErrorMessage>{error.name}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired>
          <InputGroup color='gray.200' bg='gray.500' borderRadius='md'>
            <InputLeftAddon children='Total' pr={10} bg='gray.500' borderColor='gray.500'/>
            <InputRightElement children='vUSD' pr={2}/>
            <NumberInput min={0.000001} pr={12} value={formdata?.total ? parseFloat(formdata?.total) : ''} precision={2} keepWithinRange={true}>
              <NumberInputField
                borderColor='gray.500'
                name='total'
                textAlign='right'
                bg='gray.500'
                color='gray.700'
                type='number'
                onFocus={handleFocus}
                onChange={handleChange}
                aria-label='Total' 
              />
            </NumberInput>
          </InputGroup>
          <FormErrorMessage>{error.name}</FormErrorMessage>
        </FormControl>
        <Divider />
        <Text fontSize='sm' textAlign='center' color={error ? 'red.500' : 'gray.100'}>
          {error ? error : 'Based on ' + tradingPair?.ticker + ' = ' + parseFloat(lastPrice).toPrecision(7) + ' vUSD'}
        </Text>
        <Text fontSize='xs' textAlign='center' color='gray.100'>
          (Exchange rate at point of sale may vary)
        </Text>
        <Divider />
        <Button
          type='submit'
          variant='solid'
          fontSize='lg'
          bg={orderType === 'Buy' ? '#0dd410' : '#f02b42'}
          name={orderType}
          color='gray.100'
          boxShadow='sm'
          _hover={{ 
            boxShadow: 'md', 
            color: 'black' 
          }, 
          orderType === 'Buy' ? { 
            bg: '#1cf200', 
            color: 'gray.800' 
          } : { 
            bg: '#ff1919', 
            color: 'gray.800' 
          }}
        >
          {orderType} {tradingPair?.ticker}
        </Button>
      </Stack>
    </form>
  )
}

export default FormTrade