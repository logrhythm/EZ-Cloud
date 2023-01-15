<template>
  <router-view />
</template>
<script>
import { defineComponent } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'App',
  mounted () {
    // set to Dark Mode
    let settingsDarkMode = localStorage.getItem('settings.darkMode')
    // First, check for any string value saying "true"
    if (settingsDarkMode !== undefined && typeof settingsDarkMode === 'string' && settingsDarkMode.toLowerCase() === 'true') {
      settingsDarkMode = true
    }
    // If still undef, then pass it to True, as this is the default mode
    if (settingsDarkMode === undefined) {
      settingsDarkMode = true
    }
    // If by now it's not True, then let's pass it to False
    if (settingsDarkMode !== true) {
      settingsDarkMode = false
    }
    // And assign!
    const $q = useQuasar()
    $q.dark.set(
      settingsDarkMode
    )
  }
})
</script>
