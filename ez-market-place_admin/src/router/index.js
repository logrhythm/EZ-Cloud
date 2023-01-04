import { createApp } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import OktaVue from '@okta/okta-vue'
import { OktaAuth } from '@okta/okta-auth-js'

import { routes, updateTitle, updateUser } from './routes'

const oktaAuth = new OktaAuth({
  issuer: (
    process.env.DEV
      ? 'https://dev-409406.okta.com/oauth2/default' // Dev
      // : 'https://logrhythm.okta.com/oauth2/default' // Production
      : 'https://dev-409406.okta.com/oauth2/default' // Production - To work around AuthApiError - XXXX
  ),

  clientId: (
    process.env.DEV
      ? '0oag7kq6jiQNJ7o6c357' // Dev
      // : '0oaf2smx7rYpOteFy2p7' // Production
      : '0oag7kq6jiQNJ7o6c357' // Production - To work around AuthApiError - XXXX
  ),

  redirectUri: window.location.origin + '/EZ/mfa',
  postLogoutRedirectUri: window.location.origin + '/EZ/Loggedout',
  scopes: ['openid', 'profile', 'email']
})

const app = createApp({})
app.use(OktaVue, { oktaAuth })

export default function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.config.js instead!
    // quasar.config.js -> build -> vueRouterMode
    // quasar.config.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Update the Tab title on page change
  Router.beforeEach(updateTitle)
  Router.afterEach(updateUser)

  return Router
}
