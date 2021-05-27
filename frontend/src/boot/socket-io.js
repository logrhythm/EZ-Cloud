import io from 'socket.io-client'

// // "async" is optional;
// // more info on params: https://quasar.dev/quasar-cli/boot-files

export default async ({ Vue }) => {
  Vue.prototype.$socket = io(Vue.prototype.globalConstants.baseUrl.socket, {
    auth: {
      token: '' // The Token will be refreshed with the JWT Token once logged in, and a new connection will be attempted
    }
  })
}

// Now you can access your socket anywhere in your app with “this.$socket” and use its methods, I recommend you store it in the “data” of the component.

// data(){
//   return {
//     socket: this.$socket
//   }
// }
