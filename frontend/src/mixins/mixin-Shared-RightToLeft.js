// mixin-Shared-RighToLeft.js

export default {
  computed: {
    areWeInLTR () {
      return !this.$q.lang.rtl
    },
    areWeInRTL () {
      return this.$q.lang.rtl
    }
  } // computed
}
