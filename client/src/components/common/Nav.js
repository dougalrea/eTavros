// import { EditIcon } from '@chakra-ui/icons'
import { 
  ChakraProvider,
  Flex,
  Box,
  Spacer,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  Popover,
  useDisclosure,
  Button
  // Popover,
  // PopoverTrigger,
  // PopoverContent,
  // PopoverHeader,
  // PopoverBody,
  // PopoverFooter,
  // PopoverArrow,
  // PopoverCloseButton
} from '@chakra-ui/react'
import React from 'react'
import FormRegister from './FormRegister'
import  FocusLock from 'react-focus-lock'

function Nav() {
  const { onOpen, onClose, isOpen } = useDisclosure()

  return (
    <>
      <ChakraProvider>
        <Flex
          as='nav'
          align="center"
          justify="space-between"
          wrap="wrap"
          w="100%"
          p={5}
          bg='gray.700'
        >
          <Box display={{ base: 'block', md: 'block' }}
            flexBasis={{ base: '100%', md: 'auto' }} bg='gray.200'>
            this is here
          </Box>
          <Spacer />
          <Popover
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            placement="left"
            closeOnBlur={true}
            bg='grey.200'
          >
            <PopoverTrigger>
              <Button bg='gray.200'>
                Register
              </Button>
            </PopoverTrigger>
            <PopoverContent p={5}>
              <FocusLock returnFocus persistentFocus={false}>
                <PopoverArrow />
                <PopoverCloseButton bg='gray.700' color='gray.100' _hover={{ boxShadow: 'md', bg: 'pink.700' }}/>
                <FormRegister registered={onClose} />
              </FocusLock>
            </PopoverContent>
          </Popover>
        </Flex>
      </ChakraProvider>
    </>
  )
}

export default Nav