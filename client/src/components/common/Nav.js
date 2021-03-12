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
  Button
} from '@chakra-ui/react'
import React from 'react'
import FormRegister from './FormRegister'
import FormLogin from './FormLogin'
import  FocusLock from 'react-focus-lock'
import { Link } from 'react-router-dom'

function Nav() {

  const [isOpenLogin, setIsOpenLogin] = React.useState(false)
  const [isOpenRegister, setIsOpenRegister] = React.useState(false)

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

  const toggleIsOpenLogin = () => {
    console.log('trying')
    setIsOpenLogin(!isOpenLogin)
    console.log(isOpenLogin)
  }

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
                <FormLogin loggedIn={closeLogin} />
              </FocusLock>
            </PopoverContent>
          </Popover>
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
          </Popover>
        </Flex>
      </ChakraProvider>
    </>
  )
}

export default Nav