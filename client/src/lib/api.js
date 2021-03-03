import axios from 'axios'

const baseUrl = '/api'

export function getOneTradingPair(name) {
  return axios.get(`${baseUrl}/markets/${name}/`)
}

export function getHistoricalData(name, interval) {
  return axios.get(`${baseUrl}/markets/${name}/history/`, {
    headers: {
      interval: `${interval}`
    }
  })
}

export function registerUser(formdata) {
  return (
    axios.post(`${baseUrl}/auth/register/`, formdata)

  )
}

