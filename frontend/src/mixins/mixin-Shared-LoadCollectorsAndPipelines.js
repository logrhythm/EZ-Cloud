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
    updateRecentItems () {
      if (
        this.$route &&
        this.$route.params &&
        this.$route.params.pipelineUid &&
        this.$route.params.pipelineUid.length &&
        this.pipelines &&
        this.pipelines.length
      ) {
        // Record the page in Recent Items
        // We are visiting a Pipeline

        const itemName = (
          this.pipelines.find((p) => p.uid === this.$route.params.pipelineUid) || {}
        ).name

        const newItem = {
          name: itemName,
          type: 'pipeline',
          uid: this.$route.params.pipelineUid,
          link: `#${this.$route.fullPath}`,
          lastVisit: Date.now()
        }
        try {
          // Load current Recent Items
          let recentItems = []
          try {
            recentItems = JSON.parse(localStorage.getItem('landing.recentItems') || [])
          } catch (err) {
            //
          }
          const recentItemsArray = (
            recentItems && Array.isArray(recentItems)
              ? recentItems
              : []
          )
          // Update Recent Items with the new one
          const existingRecentItem = recentItemsArray.find((ri) => ri.uid === newItem.uid)
          if (existingRecentItem) {
            existingRecentItem.name = newItem.name
            existingRecentItem.type = newItem.type
            existingRecentItem.lastVisit = newItem.lastVisit
            existingRecentItem.link = newItem.link
          } else {
            recentItemsArray.push(newItem)
          }

          // Store them for posterity
          localStorage.setItem('landing.recentItems', JSON.stringify(recentItemsArray))
        } catch (error) {
          // Fails quietly
        }
      }
    },
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
          caller: this,
          onSuccessCallBack: this.updateRecentItems
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
