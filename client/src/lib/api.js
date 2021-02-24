import axios from 'axios'

const baseUrl = '/api'

export function getOneTradingPair(name) {
  return axios.get(`${baseUrl}/markets/${name}`)
}