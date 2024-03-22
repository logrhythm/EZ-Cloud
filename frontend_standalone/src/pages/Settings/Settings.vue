<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" :src="(darkMode ? 'logrhythm_logo_darkmode_wide.svg' : 'logrhythm_logo_lightmode_wide.svg')" alt="LogRhythm Open Collector">
      </q-toolbar>
    </q-header>
    <div class="q-gutter-y-sm">

      <q-card class="q-pa-md q-mx-none">
        <q-card-section class="col">
          <div class="text-h4 q-gutter-x-md">
            <q-icon name="o_brightness_medium" />
            <span>{{ $t('Theme') }}</span>
          </div>
          <q-toggle
            v-model="darkMode"
            checked-icon="dark_mode"
            unchecked-icon="light_mode"
            color="grey"
            size="4rem"
            keep-color
          >
            <q-tooltip content-style="font-size: 1em">
              {{ $t('Switch between Light and Dark mode') }}
            </q-tooltip>
          </q-toggle>
        </q-card-section>
      </q-card>

      <q-card>
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
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import { languageOptions, switchLanguageTo } from 'src/i18n/shared'

export default {
  name: 'PageSettings',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
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
