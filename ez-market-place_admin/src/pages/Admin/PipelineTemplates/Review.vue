<template>
  <div>
      <!--  -->
      <span class="text-bold">pipelineTemplateUid:</span> {{ pipelineTemplateUid }}
  </div>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageAdminPipelineTemplateReview',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      pipelineTemplateUid: ''
    }
  },
  mounted () {
    if (this.$route.params.pipelineTemplateUid && this.$route.params.pipelineTemplateUid.length) {
      if (this.pipelineTemplateUid !== this.$route.params.pipelineTemplateUid) {
        this.pipelineTemplateUid = this.$route.params.pipelineTemplateUid
      }
    }
  }
}
</script>

<style>

</style>
