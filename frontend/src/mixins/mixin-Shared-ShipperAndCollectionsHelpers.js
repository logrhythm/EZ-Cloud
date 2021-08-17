// mixin-Shared-LoadCollectorsAndPipelines.js
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('mainStore', ['collectionShippersOptions', 'openCollectorBeats'])
  },
  methods: {
    collectionShipperDetails (shipperName) {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'unknown', outputFormat: 'json' }
      if (shipperName && shipperName.length) {
        const shipperNameLowerCase = shipperName.toLowerCase()
        return (
          this.collectionShippersOptions.find(cso => cso.value && cso.value.toLowerCase() === shipperNameLowerCase) ||
          this.collectionShippersOptions.find(cso => cso.label && cso.label.toLowerCase() === shipperNameLowerCase) ||
          this.openCollectorBeats.find(ocb => ocb.label && ocb.label.toLowerCase() === shipperNameLowerCase) ||
          fallbackValue
        )
      } else {
        return fallbackValue
      }
    }
  }
}
