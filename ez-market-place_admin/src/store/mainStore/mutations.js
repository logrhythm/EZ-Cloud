// eslint-disable-next-line camelcase
// import jwt_decode from 'jwt-decode'

// Authentication

export function updateJwtToken (state, payload) {
  console.log('COMMIT - updateJwtToken')
  if (payload) {
    state.jwtToken = payload.token
    try {
      // Save token to local storate
      localStorage.setItem('ezMarketAdminJwtToken', payload.token)
    } catch (err) {
      //
    }
  }
}

export function updateUserDetails (state, payload) {
  console.log('COMMIT - updateUserDetails')
  // userDetails:
  //   email: "tony.masse@logrhythm.com"
  //   email_verified: true
  //   family_name: "Masse"
  //   given_name: "Tony"
  //   locale: "en_US"
  //   name: "Tony Masse"
  //   preferred_username: "tony.masse@logrhythm.com"
  //   sub: "00u1pt73dvQUV2plj357"
  //   updated_at: 1645568819
  //   zoneinfo: "America/Los_Angeles"
  if (payload) {
    state.loggedInUser = (payload.userDetails && payload.userDetails.name ? payload.userDetails.name : '')
    try {
      // Save token to local storate
      localStorage.setItem('ezMarketAdminLoggedInUser', state.loggedInUser)
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

// Statuses

export function getStatuses (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.ezMarketStatuses = payload
  }
}

// Notifications

export function getNotifications (state, payload) {
  if (payload && Array.isArray(payload)) {
    state.ezMarketNotifications = payload
  }
}
