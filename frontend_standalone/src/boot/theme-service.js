/**
 * Theme Service - Centralized Theme Management System
 *
 * This service provides a single source of truth for theme settings and standardized methods
 * for theme manipulation across the LogRhythm JSON Policy Builder application.
 *
 * IMPLEMENTATION GUIDELINES:
 *
 * 1. NEVER manipulate theme-related DOM classes or styles directly in components or Vuex store.
 *    Always use this service for theme changes.
 *
 * 2. To access current theme state in components:
 *    - Import themeService: import { themeService } from '../boot/theme-service'
 *    - Check if dark mode: themeService.isDarkMode()
 *    - Get current theme: themeService.getCurrentTheme() // Returns 'dark', 'light', or 'system'
 *
 * 3. To toggle theme in components:
 *    - Import: import { themeService } from '../boot/theme-service'
 *    - Toggle: themeService.toggleTheme(this.$q) // Pass $q if available
 *
 * 4. To listen for theme changes:
 *    - Subscribe: const unsubscribe = themeService.subscribe(callback)
 *    - Always unsubscribe when component is destroyed
 *    - Example: this._themeListener = themeService.subscribe(isDark => { // update UI })
 *    - For more advanced event handling, use the theme-event-bus:
 *      import themeEventBus, { THEME_EVENTS } from '../boot/theme-event-bus'
 *      themeEventBus.on(THEME_EVENTS.THEME_CHANGED, (data) => { // handle event })
 *
 * 5. For computed properties, use themeService directly:
 *    computed: {
 *      isDarkTheme() { return themeService.isDarkMode() }
 *    }
 *
 * 6. CSS Guidelines:
 *    - Use CSS variables defined in quasar.variables.scss
 *    - Use class selectors: .body--dark for dark-specific styles
 *    - Example: .body--dark .my-component { background: var(--card-bg-dark) }
 *
 * 7. Accessibility:
 *    - All UI elements should maintain sufficient contrast in both themes
 *    - Focus indicators must be visible in both themes
 *    - Interactive elements should have minimum touch targets of 44px on mobile
 */

import { colors } from 'quasar'
import themeEventBus, { THEME_EVENTS } from './theme-event-bus'

// Constants
// (Removed unused THEME_STORAGE_KEY and DEFAULT_THEME)

// CSS Variables (dark mode only)
const CSS_VARIABLES = {
  '--q-color-text': 'var(--text-color-dark)',
  '--q-color-text-secondary': 'var(--text-secondary-dark)',
  '--q-input-bg': 'var(--input-bg-dark)',
  '--q-input-border': 'var(--input-border-dark)',
  '--q-card-bg': 'var(--card-bg-dark)',
  '--q-panel-bg': 'var(--panel-bg-dark)',
  '--q-border': 'var(--border-dark)',
  '--q-focus-outline': 'var(--focus-outline-dark)'
}

// No need for media query since we're always in dark mode

// Theme Service Class
class ThemeService {
  constructor () {
    this._currentTheme = 'dark'
    this._listeners = []
  }

  // Initialize theme on app startup
  init (app) {
    // Disable transitions initially to prevent flash
    document.documentElement.classList.add('theme-transition-disabled')

    try {
      // Always use dark mode
      const isDarkMode = true

      // Apply the theme classes before first paint
      this._applyThemeClasses(isDarkMode)
      this._applyCssVariables()

      // Set color-scheme property immediately
      document.documentElement.style.colorScheme = 'dark'

      // Set up Quasar theme if available
      if (app && app.config && app.config.globalProperties && app.config.globalProperties.$q) {
        app.config.globalProperties.$q.dark.set(true)
      } else if (window.$q) {
        window.$q.dark.set(true)
      }

      // Export to global instance for components to use
      if (app && app.config && app.config.globalProperties) {
        app.config.globalProperties.$themeService = this
      }

      // Setup transitions after initial theme is applied
      this._setupThemeTransitions()

      // Notify listeners after setup is complete
      setTimeout(() => {
        this._notifyListeners(true)
        // Emit theme ready event
        themeEventBus.emit(THEME_EVENTS.THEME_READY, { isDarkMode: true, theme: 'dark' })
      }, 0)
    } catch (error) {
      console.error('Error during theme initialization:', error)

      // Re-enable transitions
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition-disabled')
      }, 50)
    }
  }

  // Get current theme mode
  getCurrentTheme () {
    return 'dark'
  }

  // Always return true for dark mode
  isDarkMode () {
    return true
  }

  // Always set to dark theme - no-op but kept for compatibility
  setTheme (theme, app = null) {
    // Apply to Quasar if app instance is provided
    if (app && app.config && app.config.globalProperties && app.config.globalProperties.$q) {
      app.config.globalProperties.$q.dark.set(true)
    }

    return true
  }

  // No-op for toggle - always returns true for backward compatibility
  toggleTheme (app = null) {
    return true
  }

  // Register a component to be notified of theme changes
  subscribe (callback) {
    if (typeof callback === 'function' && !this._listeners.includes(callback)) {
      this._listeners.push(callback)
    }
    return () => this.unsubscribe(callback) // Return unsubscribe function
  }

  // Remove a theme change listener
  unsubscribe (callback) {
    this._listeners = this._listeners.filter(cb => cb !== callback)
  }

  // No-op for keyboard shortcuts
  setKeyboardShortcutEnabled (enabled) {
    // Do nothing
  }

  // Cleanup theme change listeners
  cleanup () {
    // Clear all theme change listeners
    this._listeners = []
  }

  // Private methods

  // Apply theme consistently - always dark mode
  _applyTheme () {
    // Temporarily disable transitions
    document.documentElement.classList.add('theme-transition-disabled')

    try {
      // Update Quasar framework if available
      if (window.$q) {
        window.$q.dark.set(true)
      }

      // Apply theme changes in order
      // 1. First update CSS variables
      this._applyCssVariables()

      // 2. Update document level color-scheme property
      document.documentElement.style.colorScheme = 'dark'

      // 3. Update brand colors for Quasar components
      this._setBrandColors()

      // 4. Apply theme classes
      this._applyThemeClasses(true)

      // 5. Force immediate application to nested shadow DOM components
      this._forceNestedComponentsUpdate()

      // Notify listeners
      this._notifyListeners(true)

      // Notify via theme event bus
      themeEventBus.emit(THEME_EVENTS.THEME_CHANGED, { isDarkMode: true })
    } catch (error) {
      console.error('Error applying theme:', error)
    } finally {
      // Re-enable transitions after a short delay
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition-disabled')
      }, 50)
    }
  }

  // Set up CSS transitions for smooth theme changes
  _setupThemeTransitions () {
    // We use CSS classes defined in app.scss for transitions

    // Ensure transitions are disabled initially
    document.documentElement.classList.remove('theme-transitions-enabled')
    document.documentElement.classList.add('theme-transition-disabled')

    // Enable transitions after initial render and theme application
    // Use requestAnimationFrame to ensure this happens after browser painting
    requestAnimationFrame(() => {
      // Use another RAF to ensure we're in the next frame
      requestAnimationFrame(() => {
        // Now it's safe to enable transitions
        document.documentElement.classList.remove('theme-transition-disabled')
        document.documentElement.classList.add('theme-transitions-enabled')
      })
    })
  }

  // Apply dark theme classes to document
  _applyThemeClasses () {
    const html = document.documentElement
    const body = document.body

    // Apply dark theme classes
    html.classList.remove('Day')
    html.classList.add('Night')

    // Body classes
    body.classList.add('body--dark')
    body.classList.remove('body--light')

    // Data attribute for CSS targeting
    html.setAttribute('data-theme', 'dark')

    // Support for Quasar framework
    if (typeof document.querySelector === 'function') {
      const appRoot = document.querySelector('#q-app') || body
      if (appRoot && !appRoot.classList.contains('body--dark')) {
        appRoot.classList.add('body--dark')
        appRoot.classList.remove('body--light')
      }
    }
  }

  // Apply dark mode CSS variables
  _applyCssVariables () {
    Object.entries(CSS_VARIABLES).forEach(([cssVar, value]) => {
      document.documentElement.style.setProperty(cssVar, value)
    })
  }

  // Set Quasar brand colors for dark mode
  _setBrandColors () {
    colors.setBrand('primary', 'var(--primaryForDarkMode)')
    colors.setBrand('textForPrimaryButton', 'var(--textForPrimaryButtonForDarkMode)')
  }

  // No need for preferences - always dark mode

  // Notify listeners of theme changes
  _notifyListeners (isDarkMode) {
    this._listeners.forEach(callback => {
      try {
        callback(isDarkMode)
      } catch (e) {
        console.error('Error in theme change listener:', e)
      }
    })
  }

  // Force immediate theme update on nested components
  _forceNestedComponentsUpdate () {
    try {
      // Force update on shadow DOM components (if any)
      document.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) {
          // Apply dark theme to shadow root
          el.shadowRoot.classList.add('body--dark')
          el.shadowRoot.classList.remove('body--light')
        }
      })

      // Dispatch a custom event that components can listen for
      const themeEvent = new CustomEvent('theme-changed', {
        detail: { isDarkMode: true },
        bubbles: true,
        composed: true // Ensures it passes through shadow DOM boundaries
      })
      document.documentElement.dispatchEvent(themeEvent)
    } catch (error) {
      console.warn('Error in nested component theme update:', error)
    }
  }
}

// Create singleton instance
const themeService = new ThemeService()

// Export service only (THEME removed, only dark mode supported)
export { themeService }

// Default export for Vue plugin usage
export default ({ app }) => {
  themeService.init(app)
}
