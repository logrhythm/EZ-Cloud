/**
 * Legacy Dark Mode Mixin - Wrapper around the new theme service
 * This mixin provides backward compatibility for components that use the old dark mode mixin
 */

import { themeService } from '../boot/theme-service'

export default {
  data () {
    return {
      darkMode: true // Always dark mode
    }
  },
  created () {
    // No need to subscribe to theme changes since we're always in dark mode
  },
  methods: {
    // Legacy method maintained for backward compatibility
    setCssVariables (isDarkModeOn) {
      // This is a no-op as the theme service now handles CSS variables
      // Kept for API compatibility only
    },

    // Legacy method maintained for backward compatibility but delegates to the theme service
    switchModeOnKeyDownEvent (event) {
      // No longer handling keyboard events here
    }
  },
  mounted () {
    // Explicitly disable component-level keyboard shortcut handling
    // to avoid duplicate events with the theme service
    if (this.$el && typeof this.$el.removeEventListener === 'function') {
      this.$el.removeEventListener('keydown', this.switchModeOnKeyDownEvent)
    }

    // Defer to centralized theme service for keyboard shortcuts
    themeService.setKeyboardShortcutEnabled(true)
  },
  beforeDestroy () {
    // Clean up subscription
    if (this._themeServiceListener) {
      themeService.unsubscribe(this._themeServiceListener)
    }
  }
}
