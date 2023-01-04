export function userIsLoggedIn (state) {
  console.log('userIsLoggedIn', state.jwtToken.length, !!state.jwtToken.length)
  // return !!app.config.globalProperties.$auth.isAuthenticated
  return !!state.jwtToken.length
}
