<template>
  <q-page class="flex flex-center">
    <!-- <img
      alt="EZ Cloud"
      src="~assets/ez-cloud-logo.svg"
    > -->
    <div>
      <div class="text-h2" style="opacity:.4">
        EZ Cloud Client
      </div>
      <div class="text-h6 text-right" style="opacity:.3">
        <q-tooltip content-style="font-size: 1em">
          <span class="text-bold">EZ Client version:</span> v{{version}}<br>
          <span class="text-bold">EZ Server version:</span> v{{serverVersion}}
        </q-tooltip>
        v{{ version }}
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import { version } from '../../package.json'

export default {
  name: 'PageIndex',
  data () {
    return {
      version: version
    }
  },
  computed: {
    ...mapState('mainStore', ['deployment']),
    serverVersion () {
      return (this.deployment && this.deployment.version ? this.deployment.version : '?.?.?')
    }
  }
}
</script>
