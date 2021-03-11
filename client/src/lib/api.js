import axios from 'axios'

const baseUrl = '/api'

export function getOneTradingPair(name) {
  return axios.get(`${baseUrl}/markets/${name}/`)
}

export function getAllTradingPairs() {
  return axios.get(`${baseUrl}/markets/`)
}

export function get24HourData(name) {
  return axios.get(`${baseUrl}/markets/${name}/history/day/`)
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

export function loginUser(formdata) {
  return axios.post(`${baseUrl}/auth/login/`, formdata)
}

export function getUserProfile(token) {
  return axios.get(`${baseUrl}/auth/profile/`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export function performTrade(formdata, token) {
  return axios.put(`${baseUrl}/auth/profile/`, formdata, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export function createTradePost(postData, token) {
  return axios.post(`${baseUrl}/tradeposts/`, postData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

export function createComment(formdata, token) {
  return axios.post(`${baseUrl}/comments/`, formdata, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}

