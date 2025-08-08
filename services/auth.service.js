import { userService } from './user.service.js'

export const authService = {
  checkLogin,
  getLoginToken,
  validateToken
}

function checkLogin({ username, password }) {
  return userService.getByUsername(username).then(user => {
    if (!user || user.password !== password) throw new Error('Invalid credentials')
    return user
  })
}

function getLoginToken(user) {
  return JSON.stringify({ _id: user._id, fullname: user.fullname, isAdmin: user.isAdmin })
}

function validateToken(token) {
  try {
    return JSON.parse(token)
  } catch {
    return null
  }
}
