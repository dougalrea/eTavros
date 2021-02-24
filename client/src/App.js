import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import SignUpLogIn from './components/SignUpLogin.js'
import TradingPairsIndex from './components/Trading/TradingPairsIndex'
import TradingPairShow from './components/Trading/TradingPairShow'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={SignUpLogIn} />
        <Route path="/markets/:name" component={TradingPairShow} />
        <Route path="/markets" component={TradingPairsIndex} />
      </Switch>
    </BrowserRouter>
  )
}

export default App
