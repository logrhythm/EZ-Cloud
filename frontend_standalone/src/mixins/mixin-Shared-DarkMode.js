/**
 * Legacy Dark Mode Mixin - Wrapper around the new theme service
 * This mixin provides backward compatibility for components that use the old dark mode mixin
 */

import { themeService, THEME } from '../boot/theme-service'

export default {
  data () {
    return {
      darkMode: themeService.isDarkMode() // Use the theme service for initial state
    }
  },
  created () {
    // Update local state to match theme service
    this.darkMode = themeService.isDarkMode()

    // Subscribe to theme changes
    this._themeServiceListener = (isDarkMode) => {
      this.darkMode = isDarkMode
    }
    themeService.subscribe(this._themeServiceListener)
  },
  watch: {
    darkMode (val) {
      // When darkMode changes locally, update the theme service
      // This creates two-way binding between the mixin and the service
      themeService.setTheme(val ? THEME.DARK : THEME.LIGHT, this.$q)
    }
  },
  methods: {
    // Legacy method maintained for backward compatibility
    setCssVariables (isDarkModeOn) {
      // This is a no-op as the theme service now handles CSS variables
      // Kept for API compatibility only
      console.debug('setCssVariables called from legacy mixin - handled by theme service')
    },

    // Legacy method maintained for backward compatibility but delegates to the theme service
    switchModeOnKeyDownEvent (event) {
      // No longer handling keyboard events here
      console.debug('switchModeOnKeyDownEvent called from legacy mixin - now handled by theme service')
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
