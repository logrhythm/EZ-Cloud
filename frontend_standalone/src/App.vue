<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>

export default {
  name: 'App',
  data () {
    return {}
  },
  created () {
    // Enable theme transitions after initial render
    setTimeout(() => {
      document.documentElement.classList.add('theme-transitions-enabled')
    }, 300)
  },
  mounted () {
    // No need to subscribe to theme changes - always dark mode
  },
  methods: {}

}
</script>

<style lang="scss">
/* Apply initial styles to prevent flash of wrong theme */
html {
  /* Start with a neutral background color that works with both themes */
  background-color: #1a1a1a; /* Dark background as default */
  transition: none !important; /* Disable transitions initially */
}

/* Only enable transitions after initial rendering */
html.theme-transitions-enabled {
  transition: background-color var(--theme-transition-duration) var(--theme-transition-timing),
              color var(--theme-transition-duration) var(--theme-transition-timing) !important;
}
</style>
