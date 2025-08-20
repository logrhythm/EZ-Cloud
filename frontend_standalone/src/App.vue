<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
import { themeService } from './boot/theme-service'

export default {
  name: 'App',
  data () {
    return {
      themeChangeListener: null
    }
  },
  created () {
    // Enable theme transitions after initial render
    setTimeout(() => {
      document.documentElement.classList.add('theme-transitions-enabled')
    }, 300)
    
    // Debug function for theme testing
    this.$root.$on('test-theme-toggle', this.testThemeToggle)
  },
  mounted () {
    // Subscribe to theme changes
    this.themeChangeListener = themeService.subscribe((isDarkMode) => {
      // This is a callback that will run whenever theme changes
      console.log(`Theme changed to ${isDarkMode ? 'dark' : 'light'} mode`)
    })
    
    // Keyboard shortcut now handled centrally by theme-service.js
    // No need to add duplicate event listener here
  },
  beforeDestroy () {
    // Clean up listeners
    if (this.themeChangeListener) {
      themeService.unsubscribe(this.themeChangeListener)
    }
  },
  methods: {
    // Keyboard shortcuts are now handled centrally by theme-service
    // This method is kept for backward compatibility but not used directly
    handleKeyDown (event) {
      console.warn('App.handleKeyDown is deprecated, keyboard shortcuts are now handled by themeService')
    },

    // Method to toggle theme (exposed for components)
    toggleTheme () {
      return themeService.toggleTheme(this.$q)
    },

    // Method to set theme (exposed for components)
    setTheme (theme) {
      return themeService.setTheme(theme, this.$q)
    },
    
    // Test method for theme toggle behavior
    testThemeToggle () {
      console.log('Running theme toggle test...')
      const initialTheme = themeService.getCurrentTheme()
      const initialDarkMode = themeService.isDarkMode()
      console.log(`Initial theme: ${initialTheme}, isDarkMode: ${initialDarkMode}`)
      
      // Toggle theme
      const newDarkMode = this.toggleTheme()
      console.log(`After toggle, isDarkMode: ${newDarkMode}`)
      
      // Verify DOM state
      const hasNightClass = document.documentElement.classList.contains('Night')
      const hasDayClass = document.documentElement.classList.contains('Day')
      const hasBodyDarkClass = document.documentElement.classList.contains('body--dark')
      const dataThemeAttr = document.documentElement.getAttribute('data-theme')
      
      console.log('DOM state verification:')
      console.log(` - Night class: ${hasNightClass}`)
      console.log(` - Day class: ${hasDayClass}`)
      console.log(` - body--dark class: ${hasBodyDarkClass}`)
      console.log(` - data-theme: ${dataThemeAttr}`)
      
      // Test auto-restore on page reload
      const savedTheme = localStorage.getItem('app-theme-preference')
      console.log(`Saved theme preference: ${savedTheme}`)
      
      return {
        success: newDarkMode !== initialDarkMode && 
                ((newDarkMode && hasNightClass && hasBodyDarkClass && dataThemeAttr === 'dark') || 
                 (!newDarkMode && hasDayClass && !hasBodyDarkClass && dataThemeAttr === 'light')),
        initialTheme,
        newDarkMode,
        domState: { hasNightClass, hasDayClass, hasBodyDarkClass, dataThemeAttr },
        savedTheme
      }
    }
  }
}
</script>

<style lang="scss">
/* Apply initial styles to prevent flash of wrong theme */
html {
  /* Start with a neutral background color that works with both themes */
  background-color: #1a1a1a; /* Dark background as default */
  transition: none !important; /* Disable transitions initially */
}

/* Only enable transitions after initial rendering */
html.theme-transitions-enabled {
  transition: background-color var(--theme-transition-duration) var(--theme-transition-timing),
              color var(--theme-transition-duration) var(--theme-transition-timing) !important;
}
</style>
