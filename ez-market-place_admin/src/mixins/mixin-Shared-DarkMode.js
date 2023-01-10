// mixin-Shared-DarkMode.js
import { useQuasar } from 'quasar'

export default {
  computed: {
    darkMode: {
      get () {
        const $q = useQuasar()
        return $q.dark.isActive
      },
      set (value) {
        const $q = useQuasar()
        $q.dark.set(value)
        localStorage.setItem('settings.darkMode', value)
      }
    }
  } // computed
}
