// eslint-disable-next-line camelcase
import jwt_decode from 'jwt-decode'

// Authentication

export function updateJwtToken (state, payload) {
  if (payload) {
    state.jwtToken = payload.token
    try {
      const decodedToken = (payload.token && payload.token.length ? jwt_decode(payload.token) : null)
      state.loggedInUser = (decodedToken && decodedToken.username ? decodedToken.username : '')
      state.loggedInUserRoles = (decodedToken && decodedToken.roles && Array.isArray(decodedToken.roles) ? decodedToken.roles : [])
      state.loggedInUserIsPrivileged = !!(decodedToken && decodedToken.isPrivileged === true)
    } catch (err) {
      console.log('Authentication - Failed to decode received JWT Token. Reason:', err.message)
    }
    try {
      // Quick trick to save time while developping.
      // Avoids from having to login all the time when modifying the code
      if (process.env.DEV) {
        localStorage.setItem('jwtToken', payload.token)
      }
    } catch (err) {
      //
    }
  }
}

// User Accounts Management

export function getUserAccounts (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.userAccounts = payload
  }
}

export function getUserRoles (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.userRoles = payload
  }
}
