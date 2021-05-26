<template>
  <q-page class="flex flex-center">
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Sign in to EZ Cloud</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          dense
          v-model="username"
          autofocus
          hint="Username"
          :rules="[val => !!val || 'Username is required']"
          @keyup.enter="checkCredentials()"
        />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input dense v-model="password" type="password" hint="Password" @keyup.enter="checkCredentials()" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Login" @click="checkCredentials()" :loading="waitingOnServer" />
      </q-card-actions>

      <q-card-section class="q-pt-none text-negative row items-center" v-if="lastAttemptFailed">
        <q-icon name="block" size="md" />
        <dir class="col text-bold">
          Authentication failed.
        </dir>
        <q-icon name="block" size="md" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'PageLogin',
  data () {
    return {
      username: '',
      password: '',
      waitingOnServer: false,
      lastAttemptFailed: false
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['jwtToken'])
  }, // computed
  methods: {
    ...mapActions('mainStore', ['signIn', 'signOut']),
    checkCredentials () {
      this.signIn({
        loadingVariableName: 'waitingOnServer',
        caller: this,
        apiCallParams: {
          username: this.username,
          password: this.password
        },
        onSuccessCallBack: this.storeTokenAndMoveOn,
        onErrorCallBack: this.storeTokenAndMoveOn,
        debug: true
      })
    },
    storeTokenAndMoveOn () {
      if (this.jwtToken && this.jwtToken.length) {
        this.$router.push('/Welcome')
      } else {
        this.lastAttemptFailed = true
      }
    }
  }, // methods
  mounted () {
    // First remove any token from previous Login
    this.signOut()
  }
}
</script>
