export function setToken(token) {
  console.log(token)
  window.localStorage.setItem('token', token)
}