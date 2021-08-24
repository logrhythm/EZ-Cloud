// mixin-Shared-DarkMode.js

export default {
  computed: {
    darkMode: {
      get () {
        return this.$q.dark.isActive
      },
      set (value) {
        this.$q.dark.set(value)
        localStorage.setItem('settings.darkMode', value)
      }
    }
  } // computed
}
