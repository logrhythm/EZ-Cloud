// mixin-Shared-DarkMode.js
import { colors } from 'quasar'

export default {
  computed: {
    darkMode: {
      get () {
        return this.$q.dark.isActive
      },
      set (value) {
        this.$q.dark.set(value)
        localStorage.setItem('settings.darkMode', value)
        this.setCssVariables(value)
      }
    }
  }, // computed
  methods: {
    setCssVariables (isDarkModeOn) {
      if (isDarkModeOn) {
        colors.setBrand('primary', 'var(--primaryForDarkMode)') // Only working in Quasar v1
        colors.setBrand('textForPrimaryButton', 'var(--textForPrimaryButtonForDarkMode)') // Only working in Quasar v1
        // colors.setCssVar('primary', '__ the value here __') // For when we move to Quasar v2
      } else {
        colors.setBrand('primary', 'var(--primaryForLightMode)') // Only working in Quasar v1
        colors.setBrand('textForPrimaryButton', 'var(--textForPrimaryButtonForLightMode)') // Only working in Quasar v1
      }
    },
    switchModeOnKeyDownEvent (event) {
      // Only trigger if [CTRL]+[M] was pressed
      // Ignore repeat triggers
      if (!event.repeat && event.ctrlKey && event.key === 'm') {
        this.darkMode = !this.darkMode
      }
    }
  },
  mounted () {
    // Force to run it at loading time, so the CSS variables are always set correctly
    this.setCssVariables(this.darkMode)

    // Allow for quick dark/day mode switch while in Dev mode, with [CTRL]+[M]
    if (process.env.DEV) {
      window.removeEventListener('keydown', this.switchModeOnKeyDownEvent)
      window.addEventListener('keydown', this.switchModeOnKeyDownEvent)
    }
  },
  beforeDestroy () {
    if (process.env.DEV) {
      window.removeEventListener('keydown', this.switchModeOnKeyDownEvent)
    }
  }
}
