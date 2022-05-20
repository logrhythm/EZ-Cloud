<template>
  <q-page class="flex flex-center column q-gutter-lg">
      <div class="text-h2" style="opacity:.4">
        Logging you in
      </div>
      <div class="text-h6" style="opacity:.4">
        <q-spinner class="q-mr-sm" />
        Redirecting you to the multi-factor authentication page.
      </div>
      <q-btn label="Cancel" to="/" />
  </q-page>
</template>

<script>

export default {
  name: 'PageLogin',
  mixins: [
  ],
  methods: {
    async login () {
      this.$auth.signInWithRedirect()
    }
  }, // methods
  mounted () {
    this.login()
  }
}
</script>
