// mixin-Shared-Socket.js
import { mapState } from 'vuex'

export default {
  data () {
    return {
      socket: this.$socket
    }
  },
  computed: {
    ...mapState('mainStore', ['jwtToken'])
  },
  methods: {
    connectSocket () {
      // Disconnect first, if needed
      if (this.socket && this.socket.connected) {
        this.socket.disconnect()
      }

      // Refresh Auth token with JWT token, and connect
      this.socket.auth.token = this.jwtToken
      this.socket.connect()
    },
    disconnectSocket () {
      if (this.socket && this.socket.connected) {
        this.socket.disconnect()
      }
    }
  }
}
