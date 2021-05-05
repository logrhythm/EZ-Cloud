<template>
  <q-page class="q-pa-sm q-gutter-y-sm">
    <div class="text-h2" style="opacity:.4">
      Pipeline Properties
    </div>
    <q-card>
      <q-card-section horizontal>
        <q-card-section class="col">
          <q-card-section class="text-h4">
              Collection
          </q-card-section>
          <q-card-section>
              ...
          </q-card-section>
        </q-card-section>

        <q-separator vertical />

        <q-card-actions vertical class="justify-around q-px-md">
            <!-- <q-btn label="Edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Collection/Edit'" /> -->
            <q-btn icon="edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Collection/Edit'" >
              <q-tooltip content-style="font-size: 1rem;">
                Edit Collection
              </q-tooltip>
            </q-btn>
            <q-btn icon="download">
              <q-tooltip content-style="font-size: 1rem;">
                Download Filebeat input configuration as YML file
              </q-tooltip>
            </q-btn>
            <q-btn icon="highlight_off">
              <q-tooltip content-style="font-size: 1rem;">
                Stop collection
              </q-tooltip>
            </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
    <q-card>
      <q-card-section horizontal>
        <q-card-section class="col">
          <q-card-section class="text-h4">
              Mapping
          </q-card-section>
          <q-card-section>
              ...
          </q-card-section>
        </q-card-section>

        <q-separator vertical />

        <q-card-actions vertical class="justify-around q-px-md">
            <!-- <q-btn label="Edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Mapping/Edit'" /> -->
            <q-btn icon="edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Mapping/Edit'" >
              <q-tooltip content-style="font-size: 1rem;">
                Edit Mapping
              </q-tooltip>
            </q-btn>
            <q-btn icon="download">
              <q-tooltip content-style="font-size: 1rem;">
                Download Mapping as JQ Pipeline
              </q-tooltip>
            </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
<!--
    <q-card class="q-pa-md q-ma-none">
      <q-card-section horizontal>
        <q-card-section class="col">
          <div class="text-h4">EZ Backend Base URLs</div>
          <q-input v-model="ezBackendBaseUrlWeb" label="Website" autofocus />
          <q-input v-model="ezBackendBaseUrlApi" label="API"  />
          <q-input v-model="ezBackendBaseUrlSocket" label="Socket"  />
        </q-card-section>

        <q-separator vertical />

        <q-card-actions>
          <q-btn glossy class="full-height" color="primary" icon="save" @click="saveSettings()" :loading="savingAction" >
            <q-tooltip content-style="font-size: 1em">
              {{ $t('Save settings to local web browser.') }}
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>
-->

  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PagePipelineProperties',
  data () {
    return {
      socket: this.$socket,
      // pipelineUid: '7dc7d568-a90e-11eb-bcbc-0242ac130002'
      pipelineUid: ''
    }
  },
  computed: {
    ...mapGetters('mainStore', ['openCollectors', 'pipelines'])
  },
  methods: {
    ...mapActions('mainStore', ['upsertPipeline']),
    editPipelineCollection () {
      this.$router.push({ path: '/Pipelines/' + this.pipelineUid + '/Collection/Edit' })
    }, // editPipelineCollection
    editPipelineMapping () {
      this.$router.push({ path: '/Pipelines/' + this.pipelineUid + '/Mapping/Edit' })
    } // editPipelineMapping
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
