import Vue from 'vue'

Vue.prototype.globalConstants = {
  baseUrl: {
    website: '',
    api: '/API/v1',
    socket: '',
    shippersUrls: 'https://raw.githubusercontent.com/TonyMasse/EZ-Cloud/main/resources/shippers_url.json'
  }
}

if (process.env.DEV) {
  Vue.prototype.globalConstants.baseUrl.website = 'https://localhost:8400'
  Vue.prototype.globalConstants.baseUrl.api = 'https://localhost:8400/API/v1'
  Vue.prototype.globalConstants.baseUrl.socket = 'https://localhost:8400'
}

// Load from locally stored values
Vue.prototype.globalConstants.baseUrl.website = (localStorage.getItem('settings.ezBackend.url.website') || Vue.prototype.globalConstants.baseUrl.website)
Vue.prototype.globalConstants.baseUrl.api = (localStorage.getItem('settings.ezBackend.url.api') || Vue.prototype.globalConstants.baseUrl.api)
Vue.prototype.globalConstants.baseUrl.socket = (localStorage.getItem('settings.ezBackend.url.socket') || Vue.prototype.globalConstants.baseUrl.socket)

if (process.env.DEV) {
  console.log('Global Constants:')
  console.log(Vue.prototype.globalConstants)
}
