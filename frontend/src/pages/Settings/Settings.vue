<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <div class="text-h4 q-mb-md">EZ Backend Base URLs</div>
    <q-input dense v-model="ezBackendBaseUrlWeb" label="Website" autofocus />
    <q-input dense v-model="ezBackendBaseUrlApi" label="API" autofocus />
    <q-input dense v-model="ezBackendBaseUrlSocket" label="Socket" autofocus />

    <q-btn class="q-mx-sm" dense glossy color="primary" icon="save" @click="saveSettings()" :loading="savingAction" >
      <q-tooltip content-style="font-size: 1em">
        {{ $t('Save settings to local web browser.') }}
      </q-tooltip>
    </q-btn>

  </q-page>
</template>

<script>
export default {
  name: 'PageSettings',
  data () {
    return {
      savingAction: false,
      ezBackendBaseUrlWeb: '',
      ezBackendBaseUrlApi: '',
      ezBackendBaseUrlSocket: ''
    }
  }, // data
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
