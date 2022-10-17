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
        if (value) {
          colors.setBrand('primary', 'var(--primaryForDarkMode)') // Only working in Quasar v1
          colors.setBrand('textForPrimaryButton', 'var(--textForPrimaryButtonForDarkMode)') // Only working in Quasar v1
          // colors.setCssVar('primary', '__ the value here __') // For when we move to Quasar v2
        } else {
          colors.setBrand('primary', 'var(--primaryForLightMode)') // Only working in Quasar v1
          colors.setBrand('textForPrimaryButton', 'var(--textForPrimaryButtonForLightMode)') // Only working in Quasar v1
        }
        localStorage.setItem('settings.darkMode', value)
      }
    }
  } // computed
}
