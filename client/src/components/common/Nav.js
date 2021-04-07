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
  Divider
} from '@chakra-ui/react'
import React from 'react'
import FormRegister from './FormRegister'
import FormLogin from './FormLogin'
import FocusLock from 'react-focus-lock'
import { FaWallet } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { getToken, logoutUser } from '../../lib/auth'
import { getUserProfile } from '../../lib/api'

function Nav() {

  const [isOpenLogin, setIsOpenLogin] = React.useState(false)
  const [isOpenRegister, setIsOpenRegister] = React.useState(false)
  const [isOpenWallet, setIsOpenWallet] = React.useState(false)

  const [userData, setUserData] = React.useState(undefined)

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

  const toast = useToast()

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
    console.log('trying')
    setIsOpenLogin(!isOpenLogin)
    console.log(isOpenLogin)
  }

  const handleLogout = () => {
    logoutUser()
    setUserData(undefined)
    triggerToast()
  }

  React.useEffect(() => {
    getUserData()
  }, [])

  return (
    <>
      <ChakraProvider>
        <Flex
          as='nav'
          align="center"
          justify="space-between"
          wrap="wrap"
          w="100%"
          p={4}
          bg='gray.700'
        >
          <Link to='/markets/'>
            <Button display={{ base: 'block', md: 'block' }}
              flexBasis={{ base: '100%', md: 'auto' }} bg='gray.200' as='button'>
            Markets
            </Button>
          </Link>
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
                    <Flex justify='space-between'>
                      <Text>
                        Virtual USD
                      </Text>
                      <Text>
                        ${thousandsSeparators(userData.cash_balance)}
                      </Text>
                    </Flex>
                    <Divider p={4}/>
                    <Flex justify='space-between'>
                      <Text>
                        Bitcoin
                      </Text>
                      <Text>
                        {parseFloat(userData.bitcoin_balance) ? userData.bitcoin_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Ethereum
                      </Text>
                      <Text>
                        {parseFloat(userData.ethereum_balance) ? userData.ethereum_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Cardano
                      </Text>
                      <Text>
                        {parseFloat(userData.cardano_balance) ? userData.cardano_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Polkadot
                      </Text>
                      <Text>
                        {parseFloat(userData.polkadot_balance) ? userData.polkadot_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Litecoin
                      </Text>
                      <Text>
                        {parseFloat(userData.litecoin_balance) ? userData.litecoin_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Stellar
                      </Text>
                      <Text>
                        {parseFloat(userData.stellar_balance) ? userData.stellar_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Dogecoin
                      </Text>
                      <Text>
                        {parseFloat(userData.dogecoin_balance) ? userData.dogecoin_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Terra
                      </Text>
                      <Text>
                        {parseFloat(userData.terra_balance) ? userData.terra_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        VeChain
                      </Text>
                      <Text>
                        {parseFloat(userData.veChain_balance) ? userData.veChain_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Monero
                      </Text>
                      <Text>
                        {parseFloat(userData.monero_balance) ? userData.monero_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        EOS
                      </Text>
                      <Text>
                        {parseFloat(userData.EOS_balance) ? userData.EOS_balance : '-'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text>
                        Neo
                      </Text>
                      <Text>
                        {parseFloat(userData.neo_balance) ? userData.neo_balance : '-'}
                      </Text>
                    </Flex>
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