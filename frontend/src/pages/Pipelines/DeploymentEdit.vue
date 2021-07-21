<template>
  <q-page class="q-pa-sm">
    <q-header elevated style="background: var(--q-color-dark);">
      <q-toolbar class="q-gutter-x-sm">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Properties" :to="'/Pipelines/' + this.pipelineUid + '/Properties'" />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="save" label="Save" color="primary" :disabled="!needsSaving" @click="save()" />
        <!-- <q-btn no-caps flat dense icon="restore" label="Reverse to last saved" @click="reverseToLastSavedPrompt()" /> -->
        <q-toolbar-title style="opacity:.4" class="text-center">Edit Deployment<span v-if="pipeline && pipeline.name && pipeline.name.length">:  {{ pipeline.name }}</span></q-toolbar-title>
      </q-toolbar>
    </q-header>
    <div class=" q-gutter-y-sm">
      a
    </div>
  </q-page>

</template>

<script>
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'

export default {
  mixins: [
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ],
  data () {
    return {
      pipelineUid: '',
      needsSaving: false
    }
  },

  computed: {
    pipeline () {
      const pipeline = this.pipelines.find(p => p.uid === this.pipelineUid)
      return (pipeline || {
        uid: '',
        name: '',
        status: 'New', // New, Dev, Ready
        primaryOpenCollector: '', // UID of the main OC
        fieldsMapping: [],
        collectionConfig: {}
      })
    },
    deployments () {
      return this.openCollectors.filter((oc) => oc.pipelines)
    }
  },

  methods: {
    save () {
      //
    }
  },

  mounted () {
    if (this.$route.params.pipelineUid && this.$route.params.pipelineUid.length) {
      if (this.pipelineUid !== this.$route.params.pipelineUid) {
        this.pipelineUid = this.$route.params.pipelineUid
      }
    }
  }
}
</script>

<style>

</style>
