// import { EditIcon } from '@chakra-ui/icons'
import { 
  ChakraProvider,
  Flex,
  Spacer,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  Popover,
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Icon,
  Text,
  useToast,
  Divider,
  Box,
  extendTheme,
  Heading
} from '@chakra-ui/react'
import React from 'react'
import FormRegister from './FormRegister'
import FormLogin from './FormLogin'
import FocusLock from 'react-focus-lock'
import { FaWallet } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { getToken, logoutUser } from '../../lib/auth'
import { get24HourData, getAllTradingPairs, getUserProfile } from '../../lib/api'
import '@fontsource/electrolize' 


function Nav() {

  const theme = extendTheme({
    fonts: {
      heading: 'Electrolize'
    }
  })

  const [isOpenLogin, setIsOpenLogin] = React.useState(false)
  const [isOpenRegister, setIsOpenRegister] = React.useState(false)
  const [isOpenWallet, setIsOpenWallet] = React.useState(false)

  const [userData, setUserData] = React.useState(undefined)
  const [tradingPairsArray, setTradingPairsArray] = React.useState([])
  const [totalPortfolioValue, setTotalPortfolioValue] = React.useState(undefined)

  let dollarValuesArray = []
  let walletBalancesArray = []

  const toast = useToast()

  const closeRegister = () => {
    setIsOpenRegister(false)
  }
  const openRegister = () => {
    setIsOpenRegister(true)
  }

  const closeLogin = () => {
    setIsOpenLogin(false)
  }
  const openLogin = () => {
    setIsOpenLogin(true)
  }

  const closeWallet = () => {
    setIsOpenWallet(false)
  }
  const openWallet = () => {
    getUserData()
    setIsOpenWallet(true)
  }

  const getTradingPairsArray = async () => {
    try {
      const { data } = await getAllTradingPairs()
      setTradingPairsArray(data)
    } catch (error) {
      console.log('Error retrieving trading pairs array: ', error)
    }
  }

  const getLastPrice = async (coin) => {
    try {
      const { data } = await get24HourData(coin)
      dollarValuesArray.push({
        ticker: data.symbol.split('BUSD').join('').toUpperCase(),
        lastPrice: parseFloat(data.lastPrice)
      })
      if (dollarValuesArray.length === tradingPairsArray.length) {
        dollarValuesArray.map(lastPriceObject => {
          return multiplyLastPriceAndBalance(lastPriceObject)
        })
      }
    } catch (error) {
      console.log('Error retrieving latest price data: ', error)
    }
  }

  const multiplyLastPriceAndBalance = (lastPriceObject) => {
    const relevantCoin = tradingPairsArray.find(tradingPair => tradingPair.ticker.toUpperCase() === lastPriceObject.ticker).name
    if (walletBalancesArray.length < 1) {
      walletBalancesArray.push(parseFloat(userData.cash_balance))
    }
    walletBalancesArray.push(lastPriceObject.lastPrice * parseFloat(userData[`${relevantCoin}_balance`]))
    setTotalPortfolioValue(walletBalancesArray.reduce((acc, curr) => acc + curr))
  }

  const triggerToast = () => {
    toast({
      title: 'You are now looged out',
      description: 'Account functions have been disabled',
      status: 'warning',
      duration: 4000,
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

  const getUserData = async () => {
    try {
      const token = getToken()
      const { data } = await getUserProfile(token)
      setUserData(data)  
    } catch (error) {
      console.log('failed getting user data: ', error)
    }
  }

  const toggleIsOpenLogin = () => {
    setIsOpenLogin(!isOpenLogin)
  }

  const handleLogout = () => {
    logoutUser()
    setUserData(undefined)
    triggerToast()
  }

  React.useEffect(() => {
    getUserData()
    getTradingPairsArray()
  }, [])

  React.useEffect(() => {

    dollarValuesArray = []
    walletBalancesArray = []

    if (userData && tradingPairsArray) {
      tradingPairsArray.map(tradingPair => {
        return getLastPrice(tradingPair.name)
      })  
    }
    
  }, [tradingPairsArray, userData])

  return (
    <>
      <ChakraProvider theme={theme}>
        <Flex
          as='nav'
          align="center"
          justify="space-between"
          wrap="wrap"
          w="100%"
          pl={4}
          pr={4}
          h='8vh'
          bg='gray.700'
        >
          <Link to='/markets/'>
            <Button display={{ base: 'block', md: 'block' }}
              flexBasis={{ base: '100%', md: 'auto' }} bg='gray.200' as='button'>
              Markets
            </Button>
          </Link>
          <Spacer />
          
          <Box>
            <Heading color='gray.300'>
              eTavros
            </Heading>
              
          </Box>
          <Spacer />
          {userData ?
            <>
              <Button onClick={openWallet}>View Wallet</Button>
              <Drawer placement="right" onClose={closeWallet} isOpen={isOpenWallet}>
                <DrawerOverlay />
                <DrawerContent>
                  <DrawerHeader borderBottomWidth="1px" bg='gray.700' color='gray.200' as='nav'>
                    <Flex justify='space-between'>
                      
                      <Text>
                        <Icon as={FaWallet} color='gray.200' mr={4} />
                          My Wallet
                      </Text>
                      <Text>{userData.username}</Text>

                    </Flex>
                  </DrawerHeader>
                  <DrawerBody fontSize='xl' color='gray.800'>
                    {totalPortfolioValue && userData ?
                      <Flex justify='space-between'>
                        <Text>
                        Total value ($)
                        </Text>
                        <Text>
                          {
                            thousandsSeparators(totalPortfolioValue.toFixed(2))
                          }
                        </Text>
                      </Flex>
                      :
                      ''
                    }
                    <Divider mb={4} mt={4}/>
                    <Flex justify='space-between'>
                      <Text>
                        Virtual USD
                      </Text>
                      <Text>
                        ${thousandsSeparators(userData.cash_balance)}
                      </Text>
                    </Flex>
                    <Divider mb={4} mt={4}/>
                    {tradingPairsArray ?
                      tradingPairsArray.sort(function(a, b) {
                        return a.id - b.id
                      }).map(tradingPair => {
                        return (
                          <Flex justify='space-between' key={tradingPair.id}>
                            <Text>
                              {tradingPair.name.split('')[0].toUpperCase()}{tradingPair.name.slice(1)}
                            </Text>
                            <Text>
                              {parseFloat(userData[`${tradingPair?.name}_balance`]) ? 
                                thousandsSeparators(userData[`${tradingPair?.name}_balance`])
                                :
                                '-'
                              }
                            </Text>
                          </Flex>
                        )
                      })
                      :
                      ''}
                    <Spacer />
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </>
            :
            <Popover
              isOpen={isOpenLogin}
              onOpen={openLogin}
              onClose={closeLogin}
              placement="left"
              closeOnBlur={true}
              bg='grey.200'
            >
              <PopoverTrigger>
                <Button bg='gray.200' color='gray.800' onClick={toggleIsOpenLogin}
                >
                Log in
                </Button>
              </PopoverTrigger>
              <PopoverContent p={5}>
                <FocusLock returnFocus persistentFocus={false}>
                  <PopoverArrow />
                  <PopoverCloseButton bg='gray.700' color='gray.100' _hover={{ boxShadow: 'md', bg: 'pink.700' }}/>
                  <FormLogin loggedIn={closeLogin} getUserData={getUserData}/>
                </FocusLock>
              </PopoverContent>
            </Popover>}
          {userData ?
            <Button bg='gray.200' ml={4} color='gray.800' onClick={handleLogout}>
                Log out
            </Button>
            :
            <Popover
              isOpen={isOpenRegister}
              onOpen={openRegister}
              onClose={closeRegister}
              placement="left"
              closeOnBlur={true}
              bg='grey.200'
            >
              <PopoverTrigger>
                <Button bg='gray.200' ml={4} color='gray.800'>
                Register
                </Button>
              </PopoverTrigger>
              <PopoverContent p={5}>
                <FocusLock returnFocus persistentFocus={false}>
                  <PopoverArrow />
                  <PopoverCloseButton bg='gray.700' color='gray.100' _hover={{ boxShadow: 'md', bg: 'pink.700' }}/>
                  <FormRegister registered={closeRegister} />
                </FocusLock>
              </PopoverContent>
            </Popover>}
        </Flex>
      </ChakraProvider>
    </>
  )
}

export default Nav