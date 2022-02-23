import Vue from 'vue'

export function userIsLoggedIn (state) {
  console.log('userIsLoggedIn', !!Vue.prototype.$auth.isAuthenticated, state.jwtToken.length, !!state.jwtToken.length)
  // return !!Vue.prototype.$auth.isAuthenticated
  return !!state.jwtToken.length
}
