// mixin-Shared-LoadCollectorsAndPipelines.js
import { mapGetters, mapActions } from 'vuex'

export default {
  data () {
    return {
      pipelinesLoading: false,
      collectorsLoading: false
    }
  },
  computed: {
    ...mapGetters('mainStore', ['openCollectors', 'pipelines']),
    dataLoading () {
      return this.collectorsLoading || this.pipelinesLoading
    }
  },
  methods: {
    ...mapActions('mainStore', ['getOpenCollectors', 'getPipelines']),
    loadOpenCollectors () {
      this.getOpenCollectors(
        {
          loadingVariableName: 'collectorsLoading',
          caller: this
        }
      )
    },
    loadPipelines () {
      this.getPipelines(
        {
          loadingVariableName: 'pipelinesLoading',
          caller: this
        }
      )
    },
    loadOpenCollectorsAndPipelines () {
      this.loadOpenCollectors()
      this.loadPipelines()
    }
  },
  mounted () {
    if (this.openCollectors.length === 0) {
      this.loadOpenCollectors()
    }
    if (this.pipelines && this.pipelines.length === 0) {
      this.loadPipelines()
    }
  }
}
