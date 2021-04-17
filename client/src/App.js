import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'

import TradingPairsIndex from './components/Trading/TradingPairsIndex'
import TradingPairShow from './components/Trading/TradingPairShow'
import Nav from './components/common/Nav'
import LandingPage from './components/common/LandingPage.js'

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/markets/:name" component={TradingPairShow} />
        <Route path="/markets" component={TradingPairsIndex} />
      </Switch>
    </BrowserRouter>
  )
}

export default App
