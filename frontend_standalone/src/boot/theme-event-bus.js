/**
 * Theme Event Bus
 *
 * Provides a lightweight event system for theme-related events
 * This helps components react to theme changes in real-time
 */

// Event names
export const THEME_EVENTS = {
  THEME_CHANGED: 'theme-changed',
  THEME_READY: 'theme-ready'
}

// Simple event emitter for theme events
class ThemeEventBus {
  constructor () {
    this._listeners = {}

    // Listen for DOM-based theme events and rebroadcast
    document.documentElement.addEventListener(THEME_EVENTS.THEME_CHANGED, (e) => {
      this.emit(THEME_EVENTS.THEME_CHANGED, e.detail)
    })
  }

  /**
   * Subscribe to theme events
   *
   * @param {string} event - Event name from THEME_EVENTS
   * @param {Function} callback - Callback to execute
   * @return {Function} Unsubscribe function
   */
  on (event, callback) {
    if (!this._listeners[event]) {
      this._listeners[event] = []
    }

    this._listeners[event].push(callback)

    // Return unsubscribe function
    return () => this.off(event, callback)
  }

  /**
   * Unsubscribe from theme events
   *
   * @param {string} event - Event name from THEME_EVENTS
   * @param {Function} callback - Callback to remove
   */
  off (event, callback) {
    if (!this._listeners[event]) return

    this._listeners[event] = this._listeners[event].filter(
      cb => cb !== callback
    )
  }

  /**
   * Emit a theme event
   *
   * @param {string} event - Event name from THEME_EVENTS
   * @param {any} data - Event data
   */
  emit (event, data) {
    if (!this._listeners[event]) return

    this._listeners[event].forEach(callback => {
      try {
        callback(data)
      } catch (err) {
        console.error(`Error in theme event listener for ${event}:`, err)
      }
    })
  }

  /**
   * Get current system preference - always returns true for dark mode
   *
   * @return {boolean} Always true
   */
  getSystemPreference () {
    return true
  }
}

// Create singleton instance
const themeEventBus = new ThemeEventBus()

// Export the singleton
export default themeEventBus
