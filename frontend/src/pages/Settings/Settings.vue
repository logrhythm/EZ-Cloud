<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" src="logrhythm_logo_wide.svg" alt="LogRhythm Open Collector">
      </q-toolbar>
    </q-header>
    <BreadCrumbs
      :crumbs="breadCrumbs"
      :pageTitle="$t('Settings')"
    />
    <div class="q-gutter-y-sm">
      <q-card class="" v-if="devMode">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4 q-gutter-x-md">
              <q-icon name="o_api" />
              <span>{{ $t('EZ Backend Base URLs') }}</span>
            </q-card-section>
            <q-card-section>
              <q-input v-model="ezBackendBaseUrlWeb" outlined :label="$t('Website')" autofocus />
            </q-card-section>
            <q-card-section>
              <q-input v-model="ezBackendBaseUrlApi" outlined :label="$t('API')"  />
            </q-card-section>
            <q-card-section>
              <q-input v-model="ezBackendBaseUrlSocket" outlined :label="$t('Socket')"  />
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <!-- <q-card-actions vertical class="justify-around q-px-md">
              <q-btn icon="edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Collection/Edit'" >
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Edit Collection') }}
                </q-tooltip>
              </q-btn> -->

          <q-card-actions vertical class="justify-around q-px-md">
            <q-btn color="primary" icon="save" @click="saveSettings()" :loading="savingAction" >
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Save settings to local web browser.') }}
              </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>

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
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  name: 'PageSettings',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { BreadCrumbs },
  data () {
    return {
      savingAction: false,
      ezBackendBaseUrlWeb: '',
      ezBackendBaseUrlApi: '',
      ezBackendBaseUrlSocket: '',
      selectedLanguage: this.$i18n.locale
      // langOptions: languageOptions // List of languages coming from `src/i18n/shared`
    }
  }, // data
  computed: {
    devMode () {
      return !!(process.env.DEV)
    },
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
    },
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('Settings')
        }
      ]
    }
  },
  methods: {
    saveSettings () {
      this.globalConstants.baseUrl.website = this.ezBackendBaseUrlWeb
      localStorage.setItem('settings.ezBackend.url.website', this.ezBackendBaseUrlWeb)
      this.globalConstants.baseUrl.api = this.ezBackendBaseUrlApi
      localStorage.setItem('settings.ezBackend.url.api', this.ezBackendBaseUrlApi)
      this.globalConstants.baseUrl.socket = this.ezBackendBaseUrlSocket
      localStorage.setItem('settings.ezBackend.url.socket', this.ezBackendBaseUrlSocket)
    },
    saveLanguageSettings () {
      switchLanguageTo(this, this.selectedLanguage)
    }
  },
  mounted () {
    this.ezBackendBaseUrlWeb = localStorage.getItem('settings.ezBackend.url.website')
    if ((this.ezBackendBaseUrlWeb === null) || (this.ezBackendBaseUrlWeb === '')) {
      this.ezBackendBaseUrlWeb = this.globalConstants.baseUrl.website
    }
    this.ezBackendBaseUrlApi = localStorage.getItem('settings.ezBackend.url.api')
    if ((this.ezBackendBaseUrlApi === null) || (this.ezBackendBaseUrlApi === '')) {
      this.ezBackendBaseUrlApi = this.globalConstants.baseUrl.api
    }
    this.ezBackendBaseUrlSocket = localStorage.getItem('settings.ezBackend.url.socket')
    if ((this.ezBackendBaseUrlSocket === null) || (this.ezBackendBaseUrlSocket === '')) {
      this.ezBackendBaseUrlSocket = this.globalConstants.baseUrl.socket
    }
  }
}
</script>
