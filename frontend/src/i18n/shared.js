const languageOptions = [
  { value: 'en-gb', label: 'English', nativeLabel: 'English' },
  { value: 'fr', label: 'French', nativeLabel: 'Français' },
  { value: 'ar', label: 'Arabic', nativeLabel: 'عربى' }
]

function switchLanguageTo (self, selectedNewLanguage) {
  try {
    if (self && selectedNewLanguage && selectedNewLanguage.length) {
      // Switch translated sentences
      // - At root level
      if (self.$root && self.$root.$i18n) {
        console.log('💬 Switching translated sentences. At root level. To:', selectedNewLanguage)
        self.$root.$i18n.locale = selectedNewLanguage
      }
      // - And at component level
      if (self.$i18n) {
        console.log('💬 Switching translated sentences. At component level. To:', selectedNewLanguage)
        self.$i18n.locale = selectedNewLanguage
      }

      // Save choice
      localStorage.setItem('settings.selectedLanguage', selectedNewLanguage)

      // Switch Quasar language pack
      console.log('💬 Switching Quasar language pack. To:', selectedNewLanguage)
      if (self.$q && self.$q.lang) {
        if (selectedNewLanguage === 'ar') {
          import('quasar/lang/ar')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else if (selectedNewLanguage === 'fr') {
          import('quasar/lang/fr')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else {
          import('quasar/lang/en-gb')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        }
      }
    }
  } catch (error) {
    console.log('💬🔴 Failed to switch language. Details:', error.message)
  }
}

export {
  languageOptions,
  switchLanguageTo
}
