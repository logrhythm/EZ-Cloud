<template>
  <q-page class="flex flex-center column q-gutter-lg">
      <div class="text-h2" style="opacity:.4">
        Bye bye
      </div>
      <div class="text-h6" style="opacity:.4">
        You have successfuly logged out.
      </div>
      <q-btn label="Log Back In" to="/Login" color="primary" />
  </q-page>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'PageLogin',
  methods: {
    ...mapActions('mainStore', ['signOut'])
  }, // methods
  mounted () {
    // First remove any token from previous Login
    this.signOut()
  }
}
</script>
