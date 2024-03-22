const languageOptions = [
  { value: 'en-gb', label: 'English', nativeLabel: 'English' },
  { value: 'fr', label: 'French', nativeLabel: 'Français' },
  { value: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { value: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { value: 'pt-pt', label: 'Portuguese', nativeLabel: 'Português' },
  { value: 'ar', label: 'Arabic', nativeLabel: 'عربى' },
  { value: 'it', label: 'Italian', nativeLabel: 'Italiano' },
  { value: 'iw', label: 'Hebrew', nativeLabel: 'עִברִית' },
  { value: 'ja', label: 'Japanese', nativeLabel: '日本' },
  { value: 'ko', label: 'Korean', nativeLabel: '한국인' },
  { value: 'zh-cn', label: 'Simplified Chinese', nativeLabel: '简体中文' }
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
        } else if (selectedNewLanguage === 'es') {
          import('quasar/lang/es')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else if (selectedNewLanguage === 'de') {
          import('quasar/lang/de')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else if (selectedNewLanguage === 'pt-pt') {
          import('quasar/lang/pt')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else if (selectedNewLanguage === 'it') {
          import('quasar/lang/it')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else if (selectedNewLanguage === 'iw' || selectedNewLanguage === 'he') {
          import('quasar/lang/he')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else if (selectedNewLanguage === 'ja') {
          import('quasar/lang/ja')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else if (selectedNewLanguage === 'ko' || selectedNewLanguage === 'ko-kr') {
          import('quasar/lang/ko-kr')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else if (selectedNewLanguage === 'zh-cn') {
          import('quasar/lang/zh-hans')
            .then(({ default: messages }) => {
              self.$q.lang.set(messages)
            })
        } else {
          console.log('💬 🟠 Fail safe to en-gb.')
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
