import io from 'socket.io-client'

// // "async" is optional;
// // more info on params: https://quasar.dev/quasar-cli/boot-files

export default async ({ Vue }) => {
  Vue.prototype.$socket = await io(Vue.prototype.globalConstants.baseUrl.socket)
  // polling-xhr.js?2307:203 GET https://169.254.109.150:8400/socket.io/?EIO=4&transport=polling&t=NZ_0sKt net::ERR_CERT_AUTHORITY_INVALID

  // Vue.prototype.$socket = await io(Vue.prototype.globalConstants.baseUrl.socket, { rejectUnauthorized: false })
  // polling-xhr.js?2307:203 GET https://169.254.109.150:8400/socket.io/?EIO=4&transport=polling&t=NZ_0_Ki net::ERR_CERT_AUTHORITY_INVALID

  // Vue.prototype.$socket = await io(Vue.prototype.globalConstants.baseUrl.socket, { transports: ['websocket'], rejectUnauthorized: false })
  // websocket.js?5f0f:87 WebSocket connection to 'wss://169.254.109.150:8400/socket.io/?EIO=4&transport=websocket' failed:

  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  // Vue.prototype.$socket = await io(Vue.prototype.globalConstants.baseUrl.socket)
  // polling-xhr.js?2307:203 GET https://169.254.109.150:8400/socket.io/?EIO=4&transport=polling&t=NZ_1rS9 net::ERR_CERT_AUTHORITY_INVALID

  // // eslint-disable-next-line prefer-const
  // Vue.prototype.$https = require('https')
  // console.log('Vue.prototype.$https:')
  // console.log(Vue.prototype.$https)
  // console.log('Vue.prototype.$https.globalAgent:')
  // console.log(Vue.prototype.$https.globalAgent)
  // Vue.prototype.$https.globalAgent.options.rejectUnauthorized = false
  // Vue.prototype.$socket = await io(Vue.prototype.globalConstants.baseUrl.socket, { agent: Vue.prototype.$https.globalAgent })
  // Vue.prototype.$socket.on('connect', function () { console.log('Socket.io - connected') })
  // client-entry.js?2f39:107 [Quasar] boot error: TypeError: Cannot set property 'rejectUnauthorized' of undefined

  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0
  // Vue.prototype.$socket = await io(Vue.prototype.globalConstants.baseUrl.socket)
  // GET https://169.254.109.150:8400/socket.io/?EIO=4&transport=polling&t=NZ_58Y4 net::ERR_CERT_AUTHORITY_INVALID

  // Vue.prototype.$socket = await io.connect(Vue.prototype.globalConstants.baseUrl.socket, { secure: true, rejectUnauthorized: false })
  // Vue.prototype.$socket = await io.connect(Vue.prototype.globalConstants.baseUrl.socket, { rejectUnauthorized: false })
  // polling-xhr.js?2307:203 GET https://169.254.109.150:8400/socket.io/?EIO=4&transport=polling&t=NZ_5VNz net::ERR_CERT_AUTHORITY_INVALID
}

// Now you can access your socket anywhere in your app with “this.$socket” and use its methods, I recommend you store it in the “data” of the component.

// data(){
//   return {
//     socket: this.$socket
//   }
// }
