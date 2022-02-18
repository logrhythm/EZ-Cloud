import Vue from 'vue'

Vue.prototype.globalConstants = {
  baseUrl: {
    website: '/EZ',
    api: '/EZ/API/v1'
  }
}

if (process.env.DEV) {
  Vue.prototype.globalConstants.baseUrl.website = 'http://localhost:8442/EZ'
  Vue.prototype.globalConstants.baseUrl.api = 'http://localhost:8442/EZ/API/v1'
}

// Load from locally stored values
Vue.prototype.globalConstants.baseUrl.website = (localStorage.getItem('settings.ezMarketBackend.url.website') || Vue.prototype.globalConstants.baseUrl.website)
Vue.prototype.globalConstants.baseUrl.api = (localStorage.getItem('settings.ezMarketBackend.url.api') || Vue.prototype.globalConstants.baseUrl.api)

if (process.env.DEV) {
  console.log('Global Constants:')
  console.log(Vue.prototype.globalConstants)
}
