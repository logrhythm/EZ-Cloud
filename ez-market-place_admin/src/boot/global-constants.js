import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  app.config.globalProperties = {
    baseUrl: {
      website: '/EZ',
      api: '/EZ/API/v1'
    }
  }

  if (process.env.DEV) {
    app.config.globalProperties.baseUrl.website = 'http://localhost:8442/EZ'
    app.config.globalProperties.baseUrl.api = 'http://localhost:8442/API/v1'
  }

  // Load from locally stored values
  app.config.globalProperties.baseUrl.website = (localStorage.getItem('settings.ezMarketBackend.url.website') || app.config.globalProperties.baseUrl.website)
  app.config.globalProperties.baseUrl.api = (localStorage.getItem('settings.ezMarketBackend.url.api') || app.config.globalProperties.baseUrl.api)

  if (process.env.DEV) {
    console.log('Global Constants:')
    console.log(app.config.globalProperties)
  }
})
