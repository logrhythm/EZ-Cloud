<template>
  <q-page class="flex flex-center">
    <form>
      <q-card style="min-width: 350px" :class="(shakyClass ? 'computerSaysNo' : '')">
        <q-card-section>
          <div class="text-h6">{{ $t('Sign in to EZ Cloud') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="username"
            autofocus
            :hint="$t('Username')"
            :rules="[val => !!val || $t('Username is required')]"
            @keyup.enter="checkCredentials()"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="password" type="password" :hint="$t('Password')" @keyup.enter="checkCredentials()" />
        </q-card-section>

        <q-card-actions align="stretch">
          <q-toggle
            v-model="darkMode"
            checked-icon="dark_mode"
            unchecked-icon="light_mode"
            color="grey"
            keep-color
            class="q-my-sm"
          >
            <q-tooltip content-style="font-size: 1em">
              {{ $t('Switch between Light and Dark mode') }}
            </q-tooltip>
          </q-toggle>
            <!-- size="4rem" -->
          <dir class="col text-bold text-negative fadeOut" v-show="lastAttemptFailed">
            {{ $t('Authentication failed.') }}
          </dir>
          <q-space />
          <q-btn flat class="q-my-sm" :label="$t('Login')" color="primary" @click="checkCredentials()" :loading="waitingOnServer" />
        </q-card-actions>
      </q-card>
    </form>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageLogin',
  mixins: [
    mixinSharedSocket, // Shared function and state to access the Socket.io
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      username: '',
      password: '',
      waitingOnServer: false,
      lastAttemptFailed: false,
      shakyClass: false,
      lastAttemptFailedTimer: null,
      shakyClassTime: null
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['jwtToken'])
  }, // computed
  methods: {
    ...mapActions('mainStore', ['signIn', 'signOut', 'reloadEzMarketNotifications']),
    checkCredentials () {
      if (this.lastAttemptFailedTimer) {
        clearTimeout(this.lastAttemptFailedTimer)
      }
      if (this.shakyClassTime) {
        clearTimeout(this.shakyClassTime)
      }
      this.shakyClass = false
      this.lastAttemptFailed = false
      this.signIn({
        loadingVariableName: 'waitingOnServer',
        caller: this,
        apiCallParams: {
          username: this.username,
          password: this.password
        },
        onSuccessCallBack: this.checkTokenAndMoveOn,
        onErrorCallBack: this.checkTokenAndMoveOn,
        debug: false
      })
    },
    checkTokenAndMoveOn () {
      if (this.jwtToken && this.jwtToken.length) {
        // Connect Socket.io
        this.connectSocket()
        // Check for Notifications on EZ Cloud Market
        this.reloadEzMarketNotifications()
        // And move to Welcome page
        this.$router.push('/Welcome')
      } else {
        this.lastAttemptFailed = true
        this.shakyClass = true
        this.shakyClassTimer = setTimeout(() => {
          this.shakyClass = false
        }, 1000)
        this.lastAttemptFailedTimer = setTimeout(() => {
          this.lastAttemptFailed = false
        }, 4800)
      }
    }
  }, // methods
  mounted () {
    // First remove any token from previous Login
    this.signOut()
  }
}
</script>

<style>
.computerSaysNo {
  position: relative;
  animation-name: shakeLogin;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  animation-timing-function: cubic-bezier(.36, .07, .19, .97);
}

@keyframes shakeLogin {
  0% {left: 0}
  2% {left: -6px}
  4% {left: 10px}
  6% {left: -16px}
  8% {left: 16px}
  10% {left: -10px}
  10% {left: 6px}
  14% {left: 0}
}

.fadeOut {
  animation-name: fadeOut;
  animation-duration: 5s;
  animation-iteration-count: infinite;
}

@keyframes fadeOut {
   0% {opacity: 1;}
   40% {opacity: 1;}
   90% {opacity: 0;}
   100% {opacity: 0;}
}
</style>
