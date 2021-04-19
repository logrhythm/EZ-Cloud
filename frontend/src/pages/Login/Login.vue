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
        <q-btn flat label="Login" @click="checkCredentials()" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
export default {
  name: 'PageLogin',
  data () {
    return {
      prompt: true,
      username: '',
      password: ''
    }
  }, // data
  methods: {
    checkCredentials () {
      this.$router.push('/Welcome')
    }
  }
}
</script>
