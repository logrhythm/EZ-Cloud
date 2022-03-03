import Vue from 'vue'
import VueRouter from 'vue-router'
import OktaVue from '@okta/okta-vue'
import { OktaAuth } from '@okta/okta-auth-js'

import { routes, updateTitle, updateUser } from './routes'

Vue.use(VueRouter)

const oktaAuth = new OktaAuth({
  // Production
  // issuer: 'https://logrhythm.okta.com/oauth2/default',
  // clientId: '0oaf2smx7rYpOteFy2p7',

  // DEV
  issuer: 'https://dev-409406.okta.com/oauth2/default',
  clientId: '0oag7kq6jiQNJ7o6c357',

  redirectUri: window.location.origin + '/EZ/mfa',
  postLogoutRedirectUri: window.location.origin + '/EZ/Loggedout',
  scopes: ['openid', 'profile', 'email']
})

Vue.use(OktaVue, { oktaAuth })

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  // Update the Tab title on page change
  Router.beforeEach(updateTitle)
  Router.afterEach(updateUser)

  return Router
}
