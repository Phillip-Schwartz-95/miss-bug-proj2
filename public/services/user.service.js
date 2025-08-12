// public/services/user.service.js
axios.defaults.withCredentials = true

const BASE_URL = '/api/auth/'

export const userService = {
  login,
  signup,
  logout,
  getLoggedinUser,
}

function login(credentials) {
  return axios.post(BASE_URL + 'login', credentials)
    .then(res => {
      sessionStorage.setItem('loggedinUser', JSON.stringify(res.data))
      return res.data
    })
}

function signup(credentials) {
  return axios.post(BASE_URL + 'signup', credentials)
    .then(res => {
      sessionStorage.setItem('loggedinUser', JSON.stringify(res.data))
      return res.data
    })
}

function logout() {
  return axios.post(BASE_URL + 'logout')
    .then(() => {
      sessionStorage.removeItem('loggedinUser')
    })
}

function getLoggedinUser() {
  return JSON.parse(sessionStorage.getItem('loggedinUser') || 'null')
}
