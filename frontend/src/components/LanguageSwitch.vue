<template>
  <!-- ...... -->
  <q-select
    v-model="lang"
    :options="langOptions"
    label="Quasar Language"
    dense
    borderless
    emit-value
    map-options
    options-dense
    style="min-width: 150px"
  />
  <!-- ...... -->
</template>

<script>
export default {
  name: 'LanguageSwitch',
  data () {
    return {
      lang: this.$i18n.locale,
      langOptions: [
        { value: 'en-gb', label: 'English' },
        { value: 'fr', label: 'French' },
        { value: 'ar', label: 'Arabic' },
        { value: 'de', label: 'German' }
      ]
    }
  },
  watch: {
    lang (lang) {
      this.$i18n.locale = lang
    }
  }
}
</script>
