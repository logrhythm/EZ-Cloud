import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from 'src/i18n'

Vue.use(VueI18n)

/**
 * Detect default language of browser
 * @returns Lower case of browser language (for example 'en-gb')
 */
function detectLanguage () {
  const lng = window.navigator.userLanguage || window.navigator.language
  return (lng && lng.length ? String(lng).toLowerCase() : null)
}

const i18n = new VueI18n({
  locale:
    localStorage.getItem('settings.selectedLanguage') ||
    detectLanguage() ||
    process.env.VUE_APP_I18N_LOCALE ||
    'en-gb',
  fallbackLocale:
    process.env.VUE_APP_I18N_FALLBACK_LOCALE ||
    'en-gb',
  messages
})

export default ({ app }) => {
  // Set i18n instance on app
  app.i18n = i18n
}

export { i18n }
