<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App',
  mounted () {
    // set to Dark Mode
    this.$q.dark.set(true)
  }
}
</script>
