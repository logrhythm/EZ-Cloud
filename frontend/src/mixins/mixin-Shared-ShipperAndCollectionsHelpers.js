// mixin-Shared-ShipperAndCollectionsHelpers.js

import { mapState } from 'vuex'
import { collectionConfigToYml } from 'src/pages/Pipelines/collectionConfigToYml'
import { collectionConfigToJson } from 'src/pages/Pipelines/collectionConfigToJson'

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
    },

    // Return the Collection Configuration (in Yaml or JSON) for a given method and config
    collectionConfigOutputFor (shipperConfigFormat, pipelineCollectionConfig) {
      if (shipperConfigFormat === 'yaml' || shipperConfigFormat === 'yml') {
        return collectionConfigToYml(pipelineCollectionConfig)
      } else if (shipperConfigFormat === 'json') {
        return collectionConfigToJson(pipelineCollectionConfig)
      } else {
        return ''
      }
    }
  }
}
