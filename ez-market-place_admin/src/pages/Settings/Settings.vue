<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none" v-if="devMode">
      <q-card-section horizontal>
        <q-card-section class="col">
          <div class="text-h4">EZ Backend Base URLs</div>
          <q-input v-model="ezMarketBackendBaseUrlWeb" label="Website" autofocus />
          <q-input v-model="ezMarketBackendBaseUrlApi" label="API"  />
          <q-input v-model="ezMarketBackendBaseUrlSocket" label="Socket"  />
        </q-card-section>

        <q-separator vertical />

        <q-card-actions>
          <q-btn glossy class="full-height" color="primary" icon="save" @click="saveSettings()" :loading="savingAction" >
            <q-tooltip style="font-size: 1em">
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
          <q-tooltip style="font-size: 1em">
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
      ezMarketBackendBaseUrlWeb: '',
      ezMarketBackendBaseUrlApi: '',
      ezMarketBackendBaseUrlSocket: ''
    }
  }, // data
  computed: {
    devMode () {
      return !!(process.env.DEV)
    }
  },
  methods: {
    saveSettings () {
      this.globalConstants.baseUrl.website = this.ezMarketBackendBaseUrlWeb
      localStorage.setItem('settings.ezMarketBackend.url.website', this.ezMarketBackendBaseUrlWeb)
      this.globalConstants.baseUrl.api = this.ezMarketBackendBaseUrlApi
      localStorage.setItem('settings.ezMarketBackend.url.api', this.ezMarketBackendBaseUrlApi)
      // this.globalConstants.baseUrl.socket = this.ezMarketBackendBaseUrlSocket
      // localStorage.setItem('settings.ezMarketBackend.url.socket', this.ezMarketBackendBaseUrlSocket)
    }
  },
  mounted () {
    this.ezMarketBackendBaseUrlWeb = localStorage.getItem('settings.ezMarketBackend.url.website')
    if ((this.ezMarketBackendBaseUrlWeb === null) || (this.ezMarketBackendBaseUrlWeb === '')) {
      this.ezMarketBackendBaseUrlWeb = this.globalConstants.baseUrl.website
    }
    this.ezMarketBackendBaseUrlApi = localStorage.getItem('settings.ezMarketBackend.url.api')
    if ((this.ezMarketBackendBaseUrlApi === null) || (this.ezMarketBackendBaseUrlApi === '')) {
      this.ezMarketBackendBaseUrlApi = this.globalConstants.baseUrl.api
    }
    // this.ezMarketBackendBaseUrlSocket = localStorage.getItem('settings.ezMarketBackend.url.socket')
    // if ((this.ezMarketBackendBaseUrlSocket === null) || (this.ezMarketBackendBaseUrlSocket === '')) {
    //   this.ezMarketBackendBaseUrlSocket = this.globalConstants.baseUrl.socket
    // }
  }
}
</script>
