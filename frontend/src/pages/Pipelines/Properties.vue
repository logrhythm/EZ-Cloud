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
            <q-card-section class="row items-center">
                <span class="text-bold">Shipper and Method: </span>
                <div class="q-ml-md text-center">
                  <img v-if="collectionShipperOption.icon && collectionShipperOption.icon.length" :src="'/shippers/' + collectionShipperOption.icon + '.svg'" width="64px">
                  <div>{{ collectionShipperOption.label }}</div>
                </div>
                <div class="q-ml-xl text-center">
                  <q-icon :name="collectionMethodOption.icon" size="64px" />
                  <div>{{ collectionMethodOption.label }}</div>
                </div>
            </q-card-section>
            <q-card-section>
              <!-- <div class="row">
                <div class="col-6">
                  Collection Params (JSON): <pre>{{ pipeline.collectionConfig }}</pre>
                </div>
                <div class="col-6">
                  Collection Params (YML): <pre>{{ collectionConfigOutput }}</pre>
                </div>
              </div> -->
              <div class="">
                  <div class="text-bold">Collection Configuration:</div>
                  <div class="row q-my-sm">
                    <q-separator vertical size="2px" color="teal" />
                    <div class="q-ml-sm"><pre>{{ collectionConfigOutput }}</pre></div>
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
              <q-btn icon="download" @click="downloadCollectionAsShipperConfigFile()">
                <q-tooltip content-style="font-size: 1rem;">
                  Download Collection configuration as a Shipper configuration file
                </q-tooltip>
              </q-btn>
              <q-btn icon="content_copy" @click="copyCollectionConfigAsShipperFileToClipboard()">
                <q-tooltip content-style="font-size: 1rem;">
                  Copy Collection configuration in Shipper's format to Clipboard
                </q-tooltip>
              </q-btn>
              <!-- <q-btn icon="highlight_off" disable>
                <q-tooltip content-style="font-size: 1rem;">
                  Stop collection
                </q-tooltip>
              </q-btn> -->
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
              <q-btn icon="download" disable>
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
import { mapState, mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
// import { dump } from 'js-yaml'
import { exportFile, copyToClipboard } from 'quasar'
import { collectionConfigToYml } from 'src/pages/Pipelines/collectionConfigToYml'
import { collectionConfigToJson } from 'src/pages/Pipelines/collectionConfigToJson'

export default {
  name: 'PagePipelineProperties',
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedSocket // Shared function and state to access the Socket.io
  ],
  data () {
    return {
      // pipelineUid: '7dc7d568-a90e-11eb-bcbc-0242ac130002'
      pipelineUid: ''
    }
  },
  computed: {
    ...mapGetters('mainStore', ['openCollectors', 'pipelines']),
    ...mapState('mainStore', ['collectionMethodsOptions', 'collectionShippersOptions']),
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
      return (this.pipeline.collectionConfig && this.pipeline.collectionConfig.collectionMethod ? this.pipeline.collectionConfig.collectionMethod : '')
    },
    collectionShipper () {
      return (this.pipeline.collectionConfig && this.pipeline.collectionConfig.collectionShipper ? this.pipeline.collectionConfig.collectionShipper : '')
    },
    collectionMethodOption () {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'help_center' }
      if (this.collectionMethod && this.collectionMethod.length) {
        return this.collectionMethodsOptions.find(cmo => cmo.value && cmo.value === this.collectionMethod) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionShipperOption () {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'unknown', outputFormat: 'json' }
      if (this.collectionShipper && this.collectionShipper.length) {
        return this.collectionShippersOptions.find(cso => cso.value && cso.value === this.collectionShipper) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionConfigOutput () {
      let output = ''
      // Transform the JSON config into Yaml
      if (this.collectionShipper && this.collectionShipper.length) {
        if (this.collectionShipperOption && this.collectionShipperOption.outputFormat && this.collectionShipperOption.outputFormat.length) {
          if (this.collectionMethod && this.collectionMethod.length) {
            if (this.collectionShipperOption.outputFormat === 'yaml' || this.collectionShipperOption.outputFormat === 'yml') {
              output = collectionConfigToYml(this.pipeline.collectionConfig)
            } else if (this.collectionShipperOption.outputFormat === 'json') {
              output = collectionConfigToJson(this.pipeline.collectionConfig)
            }
          } else {
            output = '# No Collection Method configured.'
          }
        } else {
          output = '# Unknown output format.'
        }
      } else {
        output = '# No Collecting Shipper configured.'
      }
      return output
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
    }, // deleteCollection
    downloadCollectionAsShipperConfigFile () {
      // Fallback file extension and Mime type (if not possible to assign a better one based on Shipper)
      let fileExtension = '.txt'
      let fileMimeType = 'text/plain'

      // Set the file extension and Mime type based on teh outputFormat of the Shipper
      if (this.collectionShipperOption && this.collectionShipperOption.outputFormat && this.collectionShipperOption.outputFormat.length) {
        if (this.collectionShipperOption.outputFormat === 'yaml' || this.collectionShipperOption.outputFormat === 'yml') {
          fileExtension = '.yml'
          fileMimeType = 'text/yaml'
        } else if (this.collectionShipperOption.outputFormat === 'json') {
          fileExtension = '.json'
          fileMimeType = 'application/json'
        }
      }

      const fileName = 'input.' + this.pipeline.name + '_' + this.pipeline.uid + fileExtension

      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading Collection Configuration file...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Push file out
      const status = exportFile(fileName, this.collectionConfigOutput, fileMimeType)

      if (status === true) {
        notificationPopupId({
          type: 'positive',
          color: 'positive',
          icon: 'check',
          message: this.$t('Collection Configuration file downloaded'),
          caption: fileName
        })
      } else {
        notificationPopupId({
          type: 'negative',
          color: 'negative',
          icon: 'report_problem',
          message: this.$t('Problem while downloading Collection Configuration file:'),
          caption: status
        })
        console.log('Error: ' + status)
      }
    },
    copyCollectionConfigAsShipperFileToClipboard () {
      copyToClipboard(this.collectionConfigOutput)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            color: 'positive',
            icon: 'check',
            message: this.$t('Collection Configuration copied to Clipboard')
          })
        })
        .catch(() => {
          this.$q.notify({
            type: 'negative',
            color: 'negative',
            icon: 'report_problem',
            message: this.$t('Problem while copying Collection Configuration file to Clipboard')
          })
        })
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
