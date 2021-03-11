/* eslint-disable react/no-children-prop */
import React from 'react'

import useForm from '../utils/useForm'
import { loginUser } from '../../lib/api'
import { setToken } from '../../lib/auth'
import { 
  Button, 
  Divider, 
  FormControl, 
  FormHelperText,
  FormErrorMessage,
  Input, 
  InputGroup, 
  InputLeftElement, 
  Stack,
  useToast
} from '@chakra-ui/react'
import { EmailIcon, LockIcon } from '@chakra-ui/icons'

function FormLogin({ loggedIn }) {
  const [error, setError] = React.useState(false)
  const { formdata, handleChange } = useForm({
    credential: '',
    password: ''
  })

  const handleFocus = () => {
    setError(false)
  }

  const toast = useToast()

  const triggerToast = () => {
    toast({
      title: 'Welcome back',
      description: 'Happy trading!',
      status: 'success',
      duration: 5000,
      isClosable: true
    })
  }

  const handleLogin = async event => {
    event.preventDefault()
    try {
      await loginUser(formdata)
        .then(response => {
          if (response.status === 200) {
            console.log('log in successful', response.data)
            loggedIn()
            triggerToast()
            setToken(response.data.token)
          }
        })
    } catch (e) {
      setError('Login details are incorrect')
    }
  }

  return (
    <form action='submit' onSubmit={handleLogin}>
      <Stack spacing={2}>
        <FormControl isRequired>
          <FormHelperText textAlign='center' color={error && 'red.500'}>
            {error ? error : 'Log in and get trading!'}
            <br />
            <br />
          </FormHelperText>
          <InputGroup>
            <InputLeftElement children={<EmailIcon />} />
            <Input
              type='text'
              name='credential'
              onFocus={handleFocus}
              onChange={handleChange}
              value={formdata.credential}
              placeholder='Email or username' 
              aria-label='Email or username' 
            />
          </InputGroup>
          <FormErrorMessage>{error.name}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired>
          <InputGroup>
            <InputLeftElement children={<LockIcon />} />
            <Input 
              type='password'
              name='password'
              onFocus={handleFocus}
              onChange={handleChange}
              value={formdata.password}
              placeholder='Password' 
              aria-label='Password' />
          </InputGroup>
          <FormErrorMessage>{error.name}</FormErrorMessage>
        </FormControl>
        <Divider />
        <Button
          type='submit' 
          variant='solid' 
          bg='gray.700'
          color='gray.100'
          boxShadow='sm'
          _hover={{ boxShadow: 'md', bg: 'gray.800', color: 'white' }}
        >
            Log in!
        </Button>
      </Stack>
    </form>
  )
}

export default FormLogin