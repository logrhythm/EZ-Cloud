// eslint-disable-next-line camelcase
// import jwt_decode from 'jwt-decode'

// Authentication

export function updateJwtToken (state, payload) {
  if (payload) {
    state.jwtToken = payload.token
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

export function updateUserDetails (state, payload) {
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
    state.loggedInUser = (payload && payload.userDetails && payload.userDetails.name ? payload.userDetails.name : '')
    state.loggedInUserRoles = (payload && payload.userDetails && payload.userDetails.preferred_username && payload.userDetails.preferred_username.length ? ['admin'] : [])
    state.loggedInUserIsPrivileged = (!!(payload && payload.userDetails && payload.userDetails.preferred_username && payload.userDetails.preferred_username.length))
    console.log('state.loggedInUserIsPrivileged', state.loggedInUserIsPrivileged)
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
