import { boot } from 'quasar/wrappers'
import OktaVue from '@okta/okta-vue'
import { OktaAuth } from '@okta/okta-auth-js'

export default boot(({ app }) => {
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

  app.use(OktaVue, { oktaAuth })
  app.provide('Auth', oktaAuth)
})
