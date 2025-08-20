<template>
  <q-page class="q-pa-sm">
    <q-header bordered style="background: var(--q-color-dark);">
      <q-toolbar class="q-gutter-x-sm">
        <img class="q-mr-md" src="logrhythm_logo_darkmode_wide.svg" alt="LogRhythm Open Collector">
      </q-toolbar>
    </q-header>
    <div class="q-gutter-y-sm">

      <q-card class="q-pa-md q-mx-none bg-grey-8">
        <q-card-section class="col">
          <div class="text-h4 q-gutter-x-md">
            <q-icon name="o_brightness_medium" />
            <span>{{ $t('Theme') }}</span>
          </div>
          <!-- Theme toggle removed: only dark mode supported -->
        </q-card-section>
      </q-card>

      <q-card class="bg-grey-8">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4 q-gutter-x-md">
              <q-icon name="o_translate" />
              <span>{{ $t('Language') }}</span>
            </q-card-section>
            <q-card-section>
              <q-select
                v-model="selectedLanguage"
                :options="langOptions"
                outlined
                emit-value
                map-options
                style="min-width: 150px"
              />
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
            <q-btn color="primary" icon="save" @click="saveLanguageSettings()" :loading="savingAction" >
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Save settings to local web browser.') }}
              </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </div>

  </q-page>
</template>

<script>
import { languageOptions, switchLanguageTo } from 'src/i18n/shared'

export default {
  name: 'PageSettings',
  data () {
    return {
      savingAction: false,
      selectedLanguage: this.$i18n.locale
      // langOptions: languageOptions // List of languages coming from `src/i18n/shared`
    }
  }, // data
  computed: {
    langOptions () {
      return (
        languageOptions && Array.isArray(languageOptions)
          ? languageOptions.reduce(
            (accumulatedLangages, language) => {
              accumulatedLangages.push(
                {
                  ...language,
                  label: (language.value !== this.$i18n.locale
                    ? `${this.$t(language.label)} - ${language.nativeLabel}`
                    : language.nativeLabel
                  )
                }
              )
              return accumulatedLangages
            }, []
          )
          : languageOptions
      )
    }
  },
  methods: {
    saveLanguageSettings () {
      switchLanguageTo(this, this.selectedLanguage)
    }
  }
}
</script>
