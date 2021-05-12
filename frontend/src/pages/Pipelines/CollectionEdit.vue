<template>
  <q-page class="q-pa-sm">
    <q-header elevated style="background: var(--q-color-dark);">
      <q-toolbar class="q-gutter-x-sm">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Properties" :to="'/Pipelines/' + this.pipelineUid + '/Properties'" />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="save" label="Save" color="primary" :disabled="!needsSaving" @click="save()" />
        <q-btn no-caps flat dense icon="restore" label="Reverse to last saved" @click="reverseToLastSaved()" />
        <!-- <q-separator vertical />
        <q-btn no-caps flat dense icon="play_circle_outline" label="Start Live Tail" color="secondary" @click="tailEnabled = true" v-if="!tailEnabled" />
        <q-btn no-caps flat dense icon="stop" label="Stop Live Tail" @click="tailEnabled = false" v-else /> -->
        <!-- <q-separator vertical />
        <q-btn no-caps flat dense icon="search" label="Start background processing" color="secondary" @click="processInBackground = true" v-if="!processInBackground" />
        <q-btn no-caps flat dense icon="search_off" label="Stop background processing" @click="processInBackground = false" v-else /> -->
        <!-- <q-separator vertical />
        <q-btn no-caps flat dense icon="file_download" label="Export JQ" />
        <q-btn no-caps flat dense icon="visibility" label="Show JQ" v-if="!showJqOutput" @click="buildJqFilter(); buildJqTransform(); showJqOutput = true" />
        <q-btn no-caps flat dense icon="visibility_off" label="Hide JQ output" v-else @click="showJqOutput = false" /> -->

        <q-toolbar-title style="opacity:.4" class="text-center">Collection Builder</q-toolbar-title>

        <!-- <q-btn no-caps flat dense icon="pending" label="Advanced">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Advanced</div>
                <q-toggle v-model="showExtraDetails" label="Show extra details" />
                <q-toggle v-model="showQueues" label="Show Queues" />
              </div>
            </div>
          </q-menu>
        </q-btn> -->
        <!-- <q-btn no-caps flat dense icon="settings" label="Settings">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-item class="q-pl-none" >
                <q-toggle v-model="showTypesInMainList" label="Show types in Fields list" />
                </q-item>
                <q-item class="q-pl-none" >
                <q-toggle v-model="showTypesInPopup" label="Show types in Value popups" />
                </q-item>
                <q-item class="q-pl-none" >
                <q-toggle v-model="wrapSingleStringLog" label="Accept and Wrap non-JSON logs" />
                </q-item>
                <q-item class="q-pl-none" >
                  <q-toggle v-model="extractMessageFieldOnly" label="Extract Filebeat '.message' only" />
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="speed" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="processInBackgroundMaxRate"
                      :min="1"
                      :max="10"
                      label
                      :label-value="'Background Process max: ' + processInBackgroundMaxRate + ' / second'"
                    />
                  </q-item-section>
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="download" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="queueInMaxSize"
                      :min="1"
                      :max="2000"
                      label
                      :label-value="'Max messages in Queue In: ' + queueInMaxSize"
                    />
                  </q-item-section>
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="download_for_offline" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="processedLogsMaxSize"
                      :min="1"
                      :max="1000"
                      label
                      :label-value="'Max messages in Processed Logs: ' + processedLogsMaxSize"
                    />
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </q-menu>
        </q-btn> -->
      </q-toolbar>
    </q-header>
    <div class="q-gutter-y-md">
      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h6">
                Collection Method
            </q-card-section>
            <q-separator />
            <q-card-section>
                <q-select
                  dense
                  standout="bg-blue-8 text-white"
                  v-model="collectionMethod"
                  :options="['Flat File', 'HTTP', 'Web Hook', 'Syslog']"
                  style="width: 20rem;"
                  class="q-mx-sm q-my-xs"
                />
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
            <q-btn glossy class="full-height" color="primary" icon="check_circle_outline" @click="switchCollectionMethod()" >
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Save settings to local web browser.') }}
              </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
      <q-card>
        <q-card-section class="text-h6">
            Collection Parameters
        </q-card-section>
        <q-separator />
        <q-card-section>
          ...
        </q-card-section>
      </q-card>
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
      collectionConfig: {},
      needsSaving: false,
      collectionMethod: ''
    }
  },

  methods: {
    reverseToLastSaved () {
      try {
        // Bring back mapping from the store
        const pipeline = this.pipelines.find(p => p.uid === this.pipelineUid)
        this.collectionConfig = (pipeline && pipeline.collectionConfig ? JSON.parse(JSON.stringify(pipeline.collectionConfig)) : [])

        // Flag down the need to Save as data is fresh from last save now
        this.needsSaving = false
      } catch {
        console.log('Can\'t parse JSON')
      }
    },
    switchCollectionMethod () {
      //
    }
  },

  mounted () {
    if (this.$route.params.pipelineUid && this.$route.params.pipelineUid.length) {
      if (this.pipelineUid !== this.$route.params.pipelineUid) {
        this.pipelineUid = this.$route.params.pipelineUid
      }
    }

    // Load the Mapping, if any
    this.reverseToLastSaved()
  }
}
</script>

<style>

</style>
