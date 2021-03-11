/* eslint-disable react/no-children-prop */
import React from 'react'

import useForm from '../utils/useForm'
import { registerUser } from '../../lib/api'
// import { setToken } from '../../lib/auth'
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
import { EmailIcon, LockIcon, AtSignIcon } from '@chakra-ui/icons'

function FormRegister({ registered }) {
  const [error, setError] = React.useState(false)
  const { formdata, handleChange } = useForm({
    email: '',
    username: '',
    password: '',
    password_confirmation: ''
  })

  const handleFocus = () => {
    setError(false)
  }

  const toast = useToast()

  const triggerToast = () => {
    toast({
      title: 'Registration successful',
      description: 'Please log in to your new account',
      status: 'success',
      duration: 5000,
      isClosable: true
    })
  }

  const handleRegister = async event => {
    event.preventDefault()
    try {
      await registerUser(formdata)
        .then(response => {
          if (response.status === 201) {
            console.log('registration successful')
            registered()
            triggerToast()
          }
        })
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.data.email) {
          return setError('An account under this email already exists')
        } else if (error.response.data.username) {
          return setError('This username is already taken')
        } else if (error.response.data.password_confirmation) {
          return setError('Password confirmation does not match')
        }
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        return console.log(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        return setError('An unexpected error occured, sorry about this! ', error.message)
      }
      return console.log(error.config)
    }
  }

  return (
    <form action='submit' onSubmit={handleRegister}>
      <Stack spacing={2}>
        <FormControl isRequired>
          <FormHelperText textAlign='center'>
          New to eTavros? Sign up!
            <br />
            <br />
          </FormHelperText>
          <InputGroup>
            <InputLeftElement children={<EmailIcon />} />
            <Input
              type='email'
              name='email'
              onFocus={handleFocus}
              onChange={handleChange}
              value={formdata.email}
              placeholder='Email' 
              aria-label='Email' 
            />
          </InputGroup>
          <FormErrorMessage>{error.name}</FormErrorMessage>
        </FormControl>
        <FormControl isRequired>
          <InputGroup>
            <InputLeftElement children={<AtSignIcon />} />
            <Input 
              type='text'
              name='username'
              onFocus={handleFocus}
              onChange={handleChange}
              value={formdata.username}
              placeholder='Username' 
              aria-label='username' />
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
        <FormControl isRequired>
          <InputGroup>
            <InputLeftElement children={<LockIcon />} />
            <Input 
              type='password'
              name='password_confirmation'
              onFocus={handleFocus}
              onChange={handleChange}
              value={formdata.password_confirmation}
              placeholder='Confirm Password' 
              aria-label='Password Confirmation' />
          </InputGroup>
          {error ? <FormHelperText textAlign='center' color='red.500'>
            {error}
          </FormHelperText> : <FormHelperText textAlign='center'>
            We will never share your data
          </FormHelperText>}
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
            Sign Up!
        </Button>
      </Stack>
    </form>

  )
}

export default FormRegister