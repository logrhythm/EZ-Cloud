<template>
  <q-page class="flex flex-center column q-gutter-lg">
      <div class="text-h2" style="opacity:.4">
        Bye bye
      </div>
      <div class="text-h6" style="opacity:.4">
        <q-spinner class="q-mr-sm" />
        Logging you out.
      </div>
      <q-btn label="Log Back In" @click="login" color="primary" disabled />
      <q-btn label="Go to the public pages" to="/" disabled />
  </q-page>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'PageLogout',
  mixins: [
  ],
  methods: {
    ...mapActions('mainStore', ['signOut']),
    async login () {
      this.$auth.signInWithRedirect()
    }
  }, // methods
  mounted () {
    // First remove any token from previous Login
    this.signOut({
      signOutOkta: !!this.$auth.isAuthenticated
    })
  }
}
</script>
