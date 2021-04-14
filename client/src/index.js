import React from 'react'
import ReactDOM from 'react-dom'
import './styles/main.scss'
import App from './App'

import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: 'Zen Dots'
  }
})

export default theme

ReactDOM.render(
  <ChakraProvider>
    <App />
  </ChakraProvider>,
  document.getElementById('root'))