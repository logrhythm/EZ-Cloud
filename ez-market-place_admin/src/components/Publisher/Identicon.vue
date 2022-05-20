<template>
  <div v-html="identiconAsSvg"></div>
</template>

<script>
import { toSvg } from 'jdenticon'

export default {
  name: 'Identicon',
  props: {
    identity: {
      type: String,
      // required: true,
      default: null
    }
  },
  computed: {
    identiconAsSvg () {
      return toSvg(this.identity, 50)
    }
  }
}
</script>

<style>
</style>
