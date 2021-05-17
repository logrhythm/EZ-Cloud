<template>
  <q-page class="q-pa-sm">
    <q-header elevated style="background: var(--q-color-dark);">
      <q-toolbar class="q-gutter-x-sm">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to List" :to="'/Pipelines'" />

        <q-toolbar-title style="opacity:.4" class="text-center">Pipeline Properties<span v-if="pipeline && pipeline.name && pipeline.name.length">:  {{ pipeline.name }}</span></q-toolbar-title>

      </q-toolbar>
    </q-header>
    <div class=" q-gutter-y-sm">
      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Collection
            </q-card-section>
            <q-card-section>
                <span class="text-bold">Collection Method: </span>{{ collectionMethod }}
            </q-card-section>
            <q-card-section>
              <!-- <div class="row">
                <div class="col-6">
                  Collection Params (JSON): <pre>{{ pipeline.collectionConfig }}</pre>
                </div>
                <div class="col-6">
                  Collection Params (YML): <pre>{{ collectionConfigYml }}</pre>
                </div>
              </div> -->
              <div class="">
                  <div class="text-bold">Collection Configuration:</div>
                  <div class="row q-my-sm">
                    <q-separator vertical size="2px" color="teal" />
                    <div class="q-ml-sm"><pre>{{ collectionConfigYml }}</pre></div>
                  </div>
              </div>
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
              <q-btn icon="download" disable>
                <q-tooltip content-style="font-size: 1rem;">
                  Download Filebeat input configuration as YML file
                </q-tooltip>
              </q-btn>
              <q-btn icon="highlight_off" disable>
                <q-tooltip content-style="font-size: 1rem;">
                  Stop collection
                </q-tooltip>
              </q-btn>
              <q-btn icon="delete" text-color="negative" @click="deleteCollectionPrompt()">
                <q-tooltip content-style="font-size: 1rem;">
                  Delete Collection Configuration
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Mapping
            </q-card-section>
            <q-card-section>
                <span class="text-bold">Fields detected: </span>{{ detectedFields }}
            </q-card-section>
            <q-card-section>
                <span class="text-bold">Fields mapped: </span>{{ mappedFields }}
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
              <q-btn icon="delete" text-color="negative" @click="deleteMappingPrompt()">
                <q-tooltip content-style="font-size: 1rem;">
                  Delete Mapping
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import { dump } from 'js-yaml'

export default {
  name: 'PagePipelineProperties',
  mixins: [
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ],
  data () {
    return {
      socket: this.$socket,
      // pipelineUid: '7dc7d568-a90e-11eb-bcbc-0242ac130002'
      pipelineUid: ''
    }
  },
  computed: {
    ...mapGetters('mainStore', ['openCollectors', 'pipelines']),
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
    detectedFields () {
      return (this.pipeline.fieldsMapping && Array.isArray(this.pipeline.fieldsMapping) ? this.pipeline.fieldsMapping.length : 0)
    },
    mappedFields () {
      return (this.pipeline.fieldsMapping && Array.isArray(this.pipeline.fieldsMapping) ? this.pipeline.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) : 0)
    },
    collectionMethod () {
      return (this.pipeline.collectionConfig && this.pipeline.collectionConfig.collectionMethod ? this.pipeline.collectionConfig.collectionMethod : 'N/A')
    },
    collectionConfigYml () {
      try {
        return dump(this.pipeline.collectionConfig)
      } catch (error) {
        return error
      }
    }
  },
  methods: {
    ...mapActions('mainStore', ['upsertPipeline']),
    editPipelineCollection () {
      this.$router.push({ path: '/Pipelines/' + this.pipelineUid + '/Collection/Edit' })
    }, // editPipelineCollection
    editPipelineMapping () {
      this.$router.push({ path: '/Pipelines/' + this.pipelineUid + '/Mapping/Edit' })
    }, // editPipelineMapping
    deleteMappingPrompt () {
      // ask to confirm
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you REALLY want to delete the Mapping information for this Pipeline?',
        ok: {
          push: true,
          color: 'negative'
        },
        cancel: {
          push: true,
          color: 'positive'
        },
        persistent: true
      }).onOk(() => {
        this.deleteMapping()
      }) // }).onOk(() => {
    }, // deleteMappingPrompt
    deleteMapping () {
      if (this.pipelineUid && this.pipelineUid.length) {
        // this.upsertPipeline({
        //   uid: this.pipelineUid,
        //   fieldsMapping: []
        // })
        this.upsertPipeline(
          {
            caller: this,
            pushToApi: true,
            pipeline:
            {
              uid: this.pipelineUid,
              fieldsMapping: []
            }
          }
        )
      }
    }, // deleteMapping
    deleteCollectionPrompt () {
      // ask to confirm
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you REALLY want to delete the Collection information for this Pipeline?',
        ok: {
          push: true,
          color: 'negative'
        },
        cancel: {
          push: true,
          color: 'positive'
        },
        persistent: true
      }).onOk(() => {
        this.deleteCollection()
      }) // }).onOk(() => {
    }, // deleteCollectionPrompt
    deleteCollection () {
      if (this.pipelineUid && this.pipelineUid.length) {
        // this.upsertPipeline({
        //   uid: this.pipelineUid,
        //   collectionConfig: { tony: 'aaa' }
        // })
        this.upsertPipeline(
          {
            caller: this,
            pushToApi: true,
            pipeline:
            {
              uid: this.pipelineUid,
              collectionConfig: { }
            }
          }
        )
      }
    } // deleteCollection
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
