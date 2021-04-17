import { Box, Center, Container } from '@chakra-ui/layout'
import React from 'react'

function LandingPage() {
  return (
    <Container 
      bg='gray.400'
      minW='100%' 
      minH='92vh' 
      p={0}>
      <Center h='60vh' >
        <Box borderWidth='1px' borderColor='red.500'>
          hello
        </Box>
      </Center>
    </Container>
  )
}

export default LandingPage