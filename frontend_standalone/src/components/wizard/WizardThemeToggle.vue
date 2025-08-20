<template>
  <q-btn
    :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
    flat
    round
    size="md"
    class="theme-toggle-btn"
    @click="toggleTheme"
    :class="{ 'theme-changing': animating }"
  >
    <q-icon :name="isDarkMode ? 'dark_mode' : 'light_mode'" />
    <span class="sr-only">{{ isDarkMode ? 'Switch to light mode' : 'Switch to dark mode' }}</span>
  </q-btn>
</template>

<script>
import { themeService } from '../../boot/theme-service'
import themeEventBus, { THEME_EVENTS } from '../../boot/theme-event-bus'

export default {
  name: 'WizardThemeToggle',

  data () {
    return {
      isDarkMode: themeService.isDarkMode(),
      animating: false,
      // Track event listener for cleanup
      unsubscribeThemeChange: null
    }
  },

  created () {
    // Subscribe to theme changes
    this.unsubscribeThemeChange = themeEventBus.on(THEME_EVENTS.THEME_CHANGED, this.handleThemeChange)

    // Legacy compatibility for existing components
    this._themeListener = themeService.subscribe(this.handleThemeChange)
  },

  beforeDestroy () {
    // Clean up event listeners
    if (this.unsubscribeThemeChange) {
      this.unsubscribeThemeChange()
    }

    if (this._themeListener) {
      this._themeListener()
    }
  },

  methods: {
    toggleTheme () {
      // Start animation
      this.animating = true

      // Toggle theme
      themeService.toggleTheme(this.$q)

      // Reset animation after transition completes
      setTimeout(() => {
        this.animating = false
      }, 300)
    },

    handleThemeChange (data) {
      // Update state based on event data structure
      if (typeof data === 'boolean') {
        // Legacy format (direct boolean)
        this.isDarkMode = data
      } else if (data && typeof data.isDarkMode === 'boolean') {
        // New event bus format (object with isDarkMode property)
        this.isDarkMode = data.isDarkMode
      }
    }
  }
}
</script>

<style lang="scss">
/*
  Component-specific styles are in global stylesheet:
  src/css/components/theme-toggle.scss
*/

/* Screen reader only text - accessibility enhancement */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
