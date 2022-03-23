<template>
  <q-img
    v-if="safePngBase64" :src="safePngBase64"
    :style="`width: ${size}px; max-height: ${size}px`"
    contain
  />
</template>

<script>

export default {
  name: 'IconPicture',
  props: {
    pngBase64: {
      type: String,
      default: null
    },
    size: {
      type: Number,
      default: 40
    }
  },
  computed: {
    safePngBase64 () {
      // Need to sanitize this
      let sanitisedPngUrl = null
      if (this.pngBase64 && this.pngBase64.length) {
        try {
          // Decode / re-encode in Base64, to weed out malformatted/malencoded entries
          const sanitisedPngBase64 = btoa(atob(this.pngBase64))
          sanitisedPngUrl = `data:image/png;base64,${sanitisedPngBase64}`
        } catch (error) {
          // Fails silently
        }
      }
      return sanitisedPngUrl
    }
  }
}
</script>

<style>
</style>
