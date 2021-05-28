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
        v{{ version }}
      </div>
    </div>
  </q-page>
</template>

<script>
import { version } from '../../package.json'

export default {
  name: 'PageIndex',
  data () {
    return {
      version: version
    }
  }
}
</script>
