<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none" v-if="devMode">
      <q-card-section horizontal>
        <q-card-section class="col">
          <div class="text-h4">EZ Backend Base URLs</div>
          <q-input v-model="ezBackendBaseUrlWeb" label="Website" autofocus />
          <q-input v-model="ezBackendBaseUrlApi" label="API"  />
          <q-input v-model="ezBackendBaseUrlSocket" label="Socket"  />
        </q-card-section>

        <q-separator vertical />

        <q-card-actions>
          <q-btn glossy class="full-height" color="primary" icon="save" @click="saveSettings()" :loading="savingAction" >
            <q-tooltip content-style="font-size: 1em">
              {{ $t('Save settings to local web browser.') }}
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
    <q-card class="q-pa-md q-mx-none">
      <q-card-section class="col">
        <div class="text-h4">Theme</div>
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
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageSettings',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      savingAction: false,
      ezBackendBaseUrlWeb: '',
      ezBackendBaseUrlApi: '',
      ezBackendBaseUrlSocket: ''
    }
  }, // data
  computed: {
    devMode () {
      return !!(process.env.DEV)
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
