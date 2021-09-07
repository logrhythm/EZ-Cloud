<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
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

      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Deployments
            </q-card-section>
            <q-card-section>
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="uid"
                dense
                no-data-label="No Deployment to display."
                :filter="searchFilter"
                :loading="dataLoading"
                rows-per-page-label="Deployments per page:"
                :pagination.sync="pagination"
              >
                <template v-slot:top>
                  <div class="full-width row wrap justify-between">
                    <div class="q-table__title">
                      Current Deployments
                    </div>
                    <div class="row q-gutter-md">
                      <div class="col" >
                        <q-btn rounded dense color="primary" icon="add" label="Add New Deployment" style="min-width:14rem;" @click="addNewDeployment()" >
                          <q-tooltip content-style="font-size: 1em">
                            Create a new Deployment.
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <div class="row q-gutter-md">
                      <div style="width:300px;">
                        <q-input outlined dense debounce="300" v-model="searchFilter" placeholder="Search">
                          <template v-slot:append>
                            <q-btn v-if="searchFilter.length" dense flat icon="close" @click="searchFilter=''" />
                            <q-icon name="search" />
                          </template>
                        </q-input>
                      </div>
                      <!-- <q-separator vertical dark color="orange" /> -->
                      <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadOpenCollectorsAndPipelines()">
                        <q-tooltip content-style="font-size: 1em">
                          Reload the list of Pipelines.
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense icon="edit" @click="doPromptForDeploymentDetails(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Edit Deployment details') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn flat dense icon="delete" color="negative" @click="deleteDeploymentPrompt(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Delete Deployment') }}
                      </q-tooltip>
                    </q-btn>
                  </q-td>
                </template>

                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-icon name="arrow_circle_up" color="green" size="md" v-if="props.value === true" />
                    <q-icon name="arrow_circle_down" color="red" size="md" v-else-if ="props.value === false" />
                    <q-icon name="help_center" color="grey" size="md" v-else />
                    <q-tooltip content-style="font-size: 1em">
                      <span v-if="props.value === true">Enabled</span>
                      <span v-else-if ="props.value === false">Disabled</span>
                      <span v-else>{{ props.value }}</span>
                    </q-tooltip>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
            <!-- <q-card-section>
                <span class="text-bold">Table Data: </span>
                <pre>{{ tableData }}</pre>
            </q-card-section> -->
            <!-- <q-card-section>
                <span class="text-bold">Deployments: </span>
                <pre>{{ deployments }}</pre>
            </q-card-section> -->
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <!-- <q-btn icon="add" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Deployments/Edit'" > -->
              <q-btn icon="add" color="primary" @click="addNewDeployment()" >
                <q-tooltip content-style="font-size: 1rem;">
                  Add Deployment
                </q-tooltip>
              </q-btn>
              <q-btn icon="refresh" :loading="dataLoading" @click="loadOpenCollectorsAndPipelines()">
                <q-tooltip content-style="font-size: 1rem;">
                  Reload
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
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedShipperAndCollectionsHelpers from 'src/mixins/mixin-Shared-ShipperAndCollectionsHelpers'
// import { dump } from 'js-yaml'
import { exportFile, copyToClipboard } from 'quasar'

export default {
  name: 'PagePipelineProperties',
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedSocket, // Shared function and state to access the Socket.io
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedShipperAndCollectionsHelpers // Shared funtion to provide info (icon, names, etc...) for Shippers and Collections methods
  ],
  data () {
    return {
      // pipelineUid: '7dc7d568-a90e-11eb-bcbc-0242ac130002'
      pipelineUid: '',
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: 'Status', field: 'enabled', sortable: true },
        { name: 'openCollector', align: 'center', label: 'Open Collector', field: 'openCollectorHost', sortable: true }
      ],
      pagination: {
        sortBy: 'status',
        descending: true,
        rowsPerPage: 25
      }
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
            // Calling collectionConfigOutputFor from Mixin mixin-Shared-ShipperAndCollectionsHelpers
            output = this.collectionConfigOutputFor(this.collectionShipperOption.outputFormat, this.pipeline.collectionConfig)
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
    },
    deployments () {
      const deployments = []
      this.openCollectors.forEach((oc) => {
        if (oc.pipelines && Array.isArray(oc.pipelines)) {
          oc.pipelines.forEach((pipeline) => {
            if (pipeline.uid === this.pipelineUid) {
              deployments.push({
                pipelineUid: pipeline.uid,
                openCollector: oc,
                enabled: pipeline.enabled
              })
            }
          })
        }
      })
      return deployments
    },
    tableData () {
      const list = []
      this.deployments.forEach(deployment => {
        const deploymentOpenCollector = this.openCollectors.find(oc => deployment.openCollector && oc.uid === deployment.openCollector.uid)
        list.push(Object.assign({}, deployment, {
          openCollectorHost: (deploymentOpenCollector && deploymentOpenCollector.name && deploymentOpenCollector.hostname ? deploymentOpenCollector.name + ' (' + deploymentOpenCollector.hostname + ')' : null)
        }))
      })
      return list
    }
  },
  methods: {
    ...mapActions('mainStore', ['upsertPipeline', 'deleteDeployment']),
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
    },
    addNewDeployment () {
      this.$router.push('/Pipelines/' + this.pipelineUid + '/Deployments/Edit')
    },
    doPromptForDeploymentDetails (row) {
      if (row && row.openCollector && row.openCollector.uid && row.openCollector.uid.length) {
        this.$router.push('/Pipelines/' + this.pipelineUid + '/Deployments/' + row.openCollector.uid + '/Edit')
      }
    }, // doPromptForDeploymentDetails
    deleteDeploymentPrompt (row) {
      if (typeof row !== 'undefined') {
        // ask to confirm
        this.$q.dialog({
          title: 'Confirm',
          message: 'Do you REALLY want to delete this Deployment?',
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
          this.deleteDeployment({
            pushToApi: true,
            caller: this,
            pipelineUid: row.pipelineUid,
            openCollector: row.openCollector
          })
        }) // }).onOk(() => {
      }
    } // deleteDeploymentPrompt
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
