import { createApp } from 'vue'

const app = createApp()

export function userIsLoggedIn (state) {
  console.log('userIsLoggedIn', !!app.config.globalProperties.$auth.isAuthenticated, state.jwtToken.length, !!state.jwtToken.length)
  // return !!app.config.globalProperties.$auth.isAuthenticated
  return !!state.jwtToken.length
}
