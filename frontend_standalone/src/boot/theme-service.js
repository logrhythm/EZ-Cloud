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
 */

import { colors } from 'quasar'

// Constants
const THEME_STORAGE_KEY = 'app-theme-preference'
const THEME_TRANSITION_DURATION = '0.3s'

// Theme types
const THEME = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system' // Follow system preference
}

// Default theme
const DEFAULT_THEME = THEME.DARK

// CSS Variable mappings between theme modes
const CSS_VARIABLE_MAPPINGS = {
  // Text colors
  '--q-color-text': {
    [THEME.DARK]: 'var(--text-color-dark)',
    [THEME.LIGHT]: 'var(--text-color-light)'
  },
  '--q-color-text-secondary': {
    [THEME.DARK]: 'var(--text-secondary-dark)',
    [THEME.LIGHT]: 'var(--text-secondary-light)'
  },
  // Input colors
  '--q-input-bg': {
    [THEME.DARK]: 'var(--input-bg-dark)',
    [THEME.LIGHT]: 'var(--input-bg-light)'
  },
  '--q-input-border': {
    [THEME.DARK]: 'var(--input-border-dark)',
    [THEME.LIGHT]: 'var(--input-border-light)'
  },
  // Card and panel colors
  '--q-card-bg': {
    [THEME.DARK]: 'var(--card-bg-dark)',
    [THEME.LIGHT]: 'var(--card-bg-light)'
  },
  '--q-panel-bg': {
    [THEME.DARK]: 'var(--panel-bg-dark)',
    [THEME.LIGHT]: 'var(--panel-bg-light)'
  },
  // Border colors
  '--q-border': {
    [THEME.DARK]: 'var(--border-dark)',
    [THEME.LIGHT]: 'var(--border-light)'
  },
  // Focus indicators
  '--q-focus-outline': {
    [THEME.DARK]: 'var(--focus-outline-dark)',
    [THEME.LIGHT]: 'var(--focus-outline-light)'
  }
  // Additional variables can be added here
}

// Initialize the media query for system preference detection
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')

// Theme Service Class
class ThemeService {
  constructor () {
    this._currentTheme = null
    this._systemPrefersDark = prefersDarkScheme.matches
    this._listeners = []
    this._keyboardShortcutEnabled = true
    this._boundKeyboardShortcutHandler = this._handleKeyboardShortcut.bind(this)

    // Add event listener for system preference changes
    prefersDarkScheme.addEventListener('change', this._handleSystemPreferenceChange.bind(this))
    
    // Add global keyboard shortcut listener
    window.addEventListener('keydown', this._boundKeyboardShortcutHandler)
  }

  // Initialize theme on app startup
  init (app) {
    // Disable transitions initially to prevent flash
    document.documentElement.classList.add('theme-transition-disabled')
    
    try {
      // Get saved preference or use default
      const savedPreference = this._getSavedThemePreference()

      // Migrate legacy theme settings
      this._migrateLegacySettings()

      // Set initial theme synchronously without transitions
      // This needs to happen before the first paint to prevent flash
      const effectiveTheme = savedPreference || DEFAULT_THEME
      
      // Pre-calculate effective dark mode status
      const isDarkMode = effectiveTheme === THEME.SYSTEM 
        ? this._systemPrefersDark 
        : effectiveTheme === THEME.DARK
      
      // Apply the theme classes before first paint
      this._applyThemeClasses(isDarkMode)
      this._applyCssVariables(isDarkMode)
      
      // Store the theme preference after initialization
      this._currentTheme = effectiveTheme
      
      // Set up Quasar theme if available
      if (app && app.config && app.config.globalProperties && app.config.globalProperties.$q) {
        app.config.globalProperties.$q.dark.set(isDarkMode)
      } else if (window.$q) {
        window.$q.dark.set(isDarkMode)
      }

      // Export to global instance for components to use
      if (app && app.config && app.config.globalProperties) {
        app.config.globalProperties.$themeService = this
      }
      
      // Setup transitions after initial theme is applied
      this._setupThemeTransitions()
      
      // Log successful initialization
      console.info(`Theme service initialized with ${effectiveTheme} theme (dark mode: ${isDarkMode})`)
      
      // Notify listeners after setup is complete
      setTimeout(() => {
        this._notifyListeners(isDarkMode)
      }, 0)
    } catch (error) {
      console.error('Error during theme initialization:', error)
      
      // Fallback to default theme if initialization fails
      this._applyThemeClasses(DEFAULT_THEME === THEME.DARK)
      
      // Re-enable transitions
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition-disabled')
      }, 50)
    }
  }

  // Get current theme mode
  getCurrentTheme () {
    return this._currentTheme
  }

  // Check if dark mode is currently active
  isDarkMode () {
    if (this._currentTheme === THEME.SYSTEM) {
      return this._systemPrefersDark
    }
    return this._currentTheme === THEME.DARK
  }

  // Set theme with optional app instance for Quasar integration
  setTheme (theme, app = null) {
    // Validate theme value
    if (!Object.values(THEME).includes(theme)) {
      console.warn(`Invalid theme: ${theme}. Using default.`)
      theme = DEFAULT_THEME
    }

    // Store the theme preference
    this._currentTheme = theme
    this._saveThemePreference(theme)

    // Calculate effective theme (accounting for system preference)
    const isDarkMode = this.isDarkMode()
    console.info(`Setting theme to ${theme}, effective mode: ${isDarkMode ? 'dark' : 'light'}`)

    // Apply to Quasar if app instance is provided
    if (app && app.config && app.config.globalProperties && app.config.globalProperties.$q) {
      app.config.globalProperties.$q.dark.set(isDarkMode)
    }

    // Apply theme using our consolidated helper method
    this._applyTheme(isDarkMode)

    return isDarkMode
  }

  // Toggle between light and dark themes
  toggleTheme (app = null) {
    const currentIsDark = this.isDarkMode()
    const newTheme = currentIsDark ? THEME.LIGHT : THEME.DARK

    return this.setTheme(newTheme, app)
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
  
  // Enable or disable the keyboard shortcut
  setKeyboardShortcutEnabled(enabled) {
    this._keyboardShortcutEnabled = !!enabled
  }
  
  // Cleanup all event listeners - important for preventing memory leaks
  cleanup() {
    // Remove system preference change listener
    prefersDarkScheme.removeEventListener('change', this._handleSystemPreferenceChange)
    
    // Remove keyboard shortcut listener
    window.removeEventListener('keydown', this._boundKeyboardShortcutHandler)
    
    // Clear all theme change listeners
    this._listeners = []
    
    console.info('Theme service cleanup completed')
  }

  // Private methods

  // Handle system preference changes
  _handleSystemPreferenceChange (event) {
    this._systemPrefersDark = event.matches
    console.info(`System color scheme preference changed: ${event.matches ? 'dark' : 'light'}`)

    // Only update theme if we're following system preference
    if (this._currentTheme === THEME.SYSTEM) {
      const isDarkMode = this._systemPrefersDark

      console.info(`Applying ${isDarkMode ? 'dark' : 'light'} theme based on system preference`)

      // Apply the theme changes in a consistent way
      this._applyTheme(isDarkMode)
    }
  }

  // Apply theme consistently across all contexts
  _applyTheme (isDarkMode) {
    // Temporarily disable transitions when switching themes programmatically
    document.documentElement.classList.add('theme-transition-disabled')

    try {
      // Update Quasar framework if available
      if (window.$q) {
        window.$q.dark.set(isDarkMode)
      }

      // Apply theme classes and CSS variables in a specific order
      // 1. First update CSS variables for immediate property changes
      this._applyCssVariables(isDarkMode)
      
      // 2. Then update brand colors for Quasar components
      this._setBrandColors(isDarkMode)
      
      // 3. Finally apply theme classes which trigger broader style changes
      this._applyThemeClasses(isDarkMode)
      
      // Notify listeners only after all visual changes are applied
      this._notifyListeners(isDarkMode)

      console.info(`Applied ${isDarkMode ? 'dark' : 'light'} theme successfully`)
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
        
        console.info('Theme transitions enabled')
      })
    })
  }

  // Apply theme classes to document
  _applyThemeClasses (isDarkMode) {
    const html = document.documentElement
    const body = document.body
    
    // Apply theme classes in a specific order
    if (isDarkMode) {
      // Add dark mode classes
      html.classList.remove('Day')
      html.classList.add('Night')
      
      // Body classes
      document.body.classList.add('body--dark')
      document.body.classList.remove('body--light')
      
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
    } else {
      // Add light mode classes
      html.classList.add('Day')
      html.classList.remove('Night')
      
      // Body classes
      document.body.classList.remove('body--dark')
      document.body.classList.add('body--light')
      
      // Data attribute for CSS targeting
      html.setAttribute('data-theme', 'light')
      
      // Support for Quasar framework
      if (typeof document.querySelector === 'function') {
        const appRoot = document.querySelector('#q-app') || body
        if (appRoot && !appRoot.classList.contains('body--light')) {
          appRoot.classList.add('body--light')
          appRoot.classList.remove('body--dark')
        }
      }
    }
  }

  // Apply CSS variables based on theme
  _applyCssVariables (isDarkMode) {
    Object.entries(CSS_VARIABLE_MAPPINGS).forEach(([cssVar, values]) => {
      const value = isDarkMode ? values[THEME.DARK] : values[THEME.LIGHT]
      document.documentElement.style.setProperty(cssVar, value)
    })
  }

  // Set Quasar brand colors
  _setBrandColors (isDarkMode) {
    if (isDarkMode) {
      colors.setBrand('primary', 'var(--primaryForDarkMode)')
      colors.setBrand('textForPrimaryButton', 'var(--textForPrimaryButtonForDarkMode)')
    } else {
      colors.setBrand('primary', 'var(--primaryForLightMode)')
      colors.setBrand('textForPrimaryButton', 'var(--textForPrimaryButtonForLightMode)')
    }
  }

  // Get saved theme preference
  _getSavedThemePreference () {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY)
    } catch (e) {
      console.error('Error reading theme preference:', e)
      return null
    }
  }

  // Save theme preference
  _saveThemePreference (theme) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (e) {
      console.error('Error saving theme preference:', e)
    }
  }

  // Migrate legacy theme settings to the new format
  _migrateLegacySettings () {
    try {
      const legacySettingsDarkMode = localStorage.getItem('settings.darkMode')
      const legacyWizardTheme = localStorage.getItem('wizard-theme')

      // If we have legacy settings but no new setting
      if ((legacySettingsDarkMode || legacyWizardTheme) && !localStorage.getItem(THEME_STORAGE_KEY)) {
        let theme = DEFAULT_THEME

        // Convert legacy settings to new format
        if (legacySettingsDarkMode === 'false' || legacyWizardTheme === 'light') {
          theme = THEME.LIGHT
        } else if (legacySettingsDarkMode === 'true' || legacyWizardTheme === 'dark') {
          theme = THEME.DARK
        }

        // Save in new format
        this._saveThemePreference(theme)

        // Optionally remove legacy settings
        // Keeping them for now for backward compatibility
        // localStorage.removeItem('settings.darkMode')
        // localStorage.removeItem('wizard-theme')
      }
    } catch (e) {
      console.error('Error migrating legacy theme settings:', e)
    }
  }

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
  
  // Handle keyboard shortcuts for theme toggle
  _handleKeyboardShortcut (event) {
    // Only process if keyboard shortcuts are enabled
    if (!this._keyboardShortcutEnabled) return
    
    // Toggle theme on Ctrl+M
    if (!event.repeat && event.ctrlKey && event.key === 'm') {
      event.preventDefault() // Prevent default browser behavior
      
      console.info('Theme toggle keyboard shortcut detected (Ctrl+M)')
      this.toggleTheme()
    }
  }
}

// Create singleton instance
const themeService = new ThemeService()

// Export constants and service
export { THEME, themeService }

// Default export for Vue plugin usage
export default ({ app }) => {
  themeService.init(app)
}
