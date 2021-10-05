export function getToken() {
  return localStorage.getItem('_token')
}

export function setToken(token) {
  localStorage.setItem('_token', token)
}

export function removeToken() {
  localStorage.setItem('_token', '')
}
