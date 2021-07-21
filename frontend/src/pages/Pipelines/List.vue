<template>
  <q-page class="q-pa-md">
    <!-- <q-btn class="q-mt-sm" label="Open Editor" to="/Pipelines/b9f7c85a-a278-11eb-bcbc-0242ac130002/Edit" color="primary"/> -->
      <q-table
        title="Pipelines"
        :data="tableData"
        :columns="columns"
        row-key="uid"
        dense
        no-data-label="No Pipeline to display."
        :filter="searchFilter"
        :loading="tableLoading"
        rows-per-page-label="Pipelines per page:"
        :pagination.sync="pagination"
      >

        <template v-slot:top>
          <div class="full-width row wrap justify-between">
            <div class="q-table__title">
              Pipelines
            </div>
            <div class="row q-gutter-md">
              <div class="col" >
                <q-btn rounded dense color="primary" icon="add" label="Add New Pipeline" @click="doPromptForPipelineDetails()" style="min-width:12rem;">
                  <q-tooltip content-style="font-size: 1em">
                    Create a new Pipeline.
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
              <q-btn dense outline icon="refresh" @click="loadPipelines()">
                <q-tooltip content-style="font-size: 1em">
                  Reload the list of Pipelines.
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense icon="launch" @click="openPipeline(props.row)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Open this Pipeline') }}
              </q-tooltip>
            </q-btn>
            <q-btn flat dense icon="edit" @click="doPromptForPipelineDetails(props.row)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Edit Pipeline details') }}
              </q-tooltip>
            </q-btn>
            <q-btn flat dense icon="delete" color="negative" @click="deletePipelinePrompt(props.row)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Delete Pipeline') }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-icon name="arrow_circle_up" color="green" size="md" v-if="props.value === 'Ready'" />
            <q-icon name="construction" :color="(darkIsEnabled ? 'green-3' : 'green-10')" size="md" v-else-if ="props.value === 'Dev'" />
            <q-icon name="auto_awesome" size="md" v-else-if ="props.value === 'New'" />
            <q-icon name="help_center" color="grey" size="md" v-else />
            <q-tooltip content-style="font-size: 1em">
              {{ props.value }}
            </q-tooltip>
          </q-td>
        </template>
        <template v-slot:body-cell-collectionShipper="props">
          <q-td :props="props">
            <img v-if="props.row && props.row.collectionConfig && props.row.collectionConfig.collectionShipper && props.row.collectionConfig.collectionShipper.length" :src="'/shippers/' + collectionShipperDetails(props.row.collectionConfig.collectionShipper).icon + '.svg'" width="32px">
            <q-tooltip content-style="font-size: 1em">
              <span v-if="props.row && props.row.collectionConfig && props.row.collectionConfig.collectionShipper && props.row.collectionConfig.collectionShipper.length" >{{ collectionShipperDetails(props.row.collectionConfig.collectionShipper).label }}</span>
            </q-tooltip>
          </q-td>
        </template>
        <template v-slot:body-cell-collectionMethod="props">
          <q-td :props="props">
            <q-icon :name="collectionMethodDetails(props.row.collectionConfig.collectionShipper, props.row.collectionConfig.collectionMethod).icon" size="md" v-if="props.row && props.row.collectionConfig && props.row.collectionConfig.collectionShipper && props.row.collectionConfig.collectionShipper.length && props.row.collectionConfig.collectionMethod && props.row.collectionConfig.collectionMethod.length" />
            <q-tooltip content-style="font-size: 1em">
              <span v-if="props.row && props.row.collectionConfig && props.row.collectionConfig.collectionShipper && props.row.collectionConfig.collectionShipper.length && props.row.collectionConfig.collectionMethod && props.row.collectionConfig.collectionMethod.length" >{{ collectionMethodDetails(props.row.collectionConfig.collectionShipper, props.row.collectionConfig.collectionMethod).label }}</span>
            </q-tooltip>
          </q-td>
        </template>
        <template v-slot:body-cell-mappingStats="props">
          <q-td :props="props">
            <!-- {{props.value}} -->
            <div
              v-if="props.row.fieldsMapping && Array.isArray(props.row.fieldsMapping) && props.row.fieldsMapping.length"
            >
              <q-circular-progress
                :value="Math.round(props.value)"
                show-value
                :font-size="(props.value < 100 ? '0.5em' : '0.4em')"
                size="2.8em"
                :thickness="0.2"
                :color="(darkIsEnabled ? 'blue-3' : 'blue-10')"
                :track-color="(darkIsEnabled ? 'grey-9' : 'grey-3')"
              />
              <q-tooltip content-style="font-size: 1em">
                <span>Detected fields: {{ props.row.fieldsMapping.length }}</span><br>
                <span>Mapped fields: {{ props.row.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) }}</span>&nbsp;(<span class="text-bold">{{ Math.round(props.value * 100) / 100 }}%</span>)
              </q-tooltip>
            </div>
          </q-td>
        </template>
      </q-table>
      <pre>{{ tableData }}</pre>

      <q-dialog v-model="promptForNewPipelineDetails" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('New Pipeline Details') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="newPipelineName" autofocus label="Pipeline Name" @keyup.esc="promptForNewPipelineDetails = false" :rules="[val => !!val || $t('Pipeline name cannot be empty')]" />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select dense v-model="newPipelineOpenCollector" :options="openCollectorsOptions" label="Primary Open Collector" emit-value map-options />
          </q-card-section>

          <q-card-section class="q-pt-none" v-if="newPipelineStatus">
            <q-select dense v-model="newPipelineStatus" :options="statusOptions" label="Status" />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('Cancel')" v-close-popup />
            <q-btn flat :label="$t('Update Pipeline')" v-if="newPipelineUid && newPipelineUid.length" v-close-popup :disabled="!newPipelineName.length" @click="updatePipeline()" />
            <q-btn flat :label="$t('Add new Pipeline')" v-else v-close-popup :disabled="!newPipelineName.length" @click="updatePipeline()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'

export default {
  name: 'PagePipelinesList',
  mixins: [
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ],
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true, sort: (a, b, rowA, rowB) => this.statusTextToId(a) - this.statusTextToId(b) },
        { name: 'name', align: 'center', label: 'Pipeline Name', field: 'name', sortable: true },
        { name: 'openCollector', align: 'center', label: 'Primary Open Collector', field: 'openCollector', sortable: true },
        { name: 'collectionShipper', align: 'center', label: 'Collecting Shipper', field: row => row.collectionConfig.collectionShipper, sortable: true },
        { name: 'collectionMethod', align: 'center', label: 'Collection Method', field: row => row.collectionConfig.collectionMethod, sortable: true },
        { name: 'mappingStats', align: 'center', label: 'Fields Mapped (%)', field: row => (row.fieldsMapping && Array.isArray(row.fieldsMapping) && row.fieldsMapping.length > 0 ? row.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) / row.fieldsMapping.length * 100 : null), sortable: true }
      ],
      pagination: {
        sortBy: 'status',
        descending: true,
        rowsPerPage: 25
      },
      // pipelinesLoading: false,
      // collectorsLoading: false,
      promptForNewPipelineDetails: false,
      newPipelineName: '',
      newPipelineOpenCollector: null,
      newPipelineUid: '',
      newPipelineStatus: null,
      statusOptions: ['New', 'Dev', 'Ready']
    } // return
  },
  computed: {
    ...mapState('mainStore', ['collectionMethodsOptions', 'collectionShippersOptions']),
    ...mapGetters('mainStore', ['openCollectors', 'pipelines']),
    tableData () {
      const list = []
      this.pipelines.forEach(pipeline => {
        const pipelineOpenCollector = this.openCollectors.find(oc => oc.uid === pipeline.primaryOpenCollector)
        list.push(Object.assign({}, pipeline, {
          openCollector: (pipelineOpenCollector && pipelineOpenCollector.name && pipelineOpenCollector.hostname ? pipelineOpenCollector.name + ' (' + pipelineOpenCollector.hostname + ')' : null)
        }))
      })
      return list
    },
    openCollectorsOptions () {
      const options = []
      this.openCollectors.forEach(oc => {
        options.push(
          {
            value: oc.uid,
            label: oc.name + ' (' + oc.hostname + ')'
          }
        )
      })
      return options
    },
    tableLoading () {
      return this.dataLoading // Coming from the Mixin: mixinSharedLoadCollectorsAndPipelines
    },
    darkIsEnabled () {
      return this.$q.dark.isActive
    }
  },
  methods: {
    ...mapActions('mainStore', ['upsertPipeline', 'deletePipeline', 'getPipelines', 'getOpenCollectors']),
    openPipeline (row) {
      this.$router.push({ path: '/Pipelines/' + row.uid + '/Properties' })
    }, // openPipeline
    deletePipelinePrompt (row) {
      if (typeof row !== 'undefined') {
        // ask to confirm
        this.$q.dialog({
          title: 'Confirm',
          message: 'Do you REALLY want to delete this Pipeline?',
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
          this.deletePipeline({
            pushToApi: true,
            caller: this,
            pipeline: row
          })
        }) // }).onOk(() => {
      }
    }, // deletePipelinePrompt
    doPromptForPipelineDetails (existing) {
      this.newPipelineUid = (existing && existing.uid ? existing.uid : null)
      this.newPipelineName = (existing && existing.name ? existing.name : '')
      this.newPipelineOpenCollector = (existing && existing.primaryOpenCollector ? existing.primaryOpenCollector : null)
      this.newPipelineStatus = (existing && existing.status ? existing.status : null)

      // this.newPipelineName = ''
      // this.newPipelineOpenCollector = null
      this.promptForNewPipelineDetails = true
    }, // doPromptForPipelineDetails
    updatePipeline () {
      this.promptForNewPipelineDetails = false
      this.upsertPipeline(
        {
          pushToApi: true,
          caller: this,
          pipeline:
          {
            uid: this.newPipelineUid,
            name: this.newPipelineName,
            status: (this.newPipelineStatus && this.newPipelineStatus.length ? this.newPipelineStatus : 'New'),
            primaryOpenCollector: (this.newPipelineOpenCollector && this.newPipelineOpenCollector.length ? this.newPipelineOpenCollector : null)
          }
        }
      )
    },
    collectionShipperDetails (shipperId) {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'unknown', outputFormat: 'json' }
      if (shipperId && shipperId.length) {
        return this.collectionShippersOptions.find(cso => cso.value && cso.value === shipperId) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionMethodDetails (shipperId, methodId) {
      // console.log('collectionMethodDetails: ', methodId)
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'help_center' }
      if (shipperId && shipperId.length && methodId && methodId.length) {
        // console.log(JSON.stringify(this.collectionMethodsOptions.find(cmo => cmo.shipper && cmo.shipper === shipperId && cmo.value && cmo.value === methodId) || fallbackValue))
        return this.collectionMethodsOptions.find(cmo => cmo.shipper && cmo.shipper === shipperId && cmo.value && cmo.value === methodId) || fallbackValue
      } else {
        // return fallbackValue
        return methodId
      }
    },
    statusIdToText (statusId) {
      let status = ''
      if (statusId >= 3) {
        status = 'Ready'
      }
      if (statusId === 2) {
        status = 'Dev'
      }
      if (statusId === 1) {
        status = 'New'
      }
      return status
    },
    statusTextToId (statusName) {
      let status = 0
      if (statusName === 'Ready') {
        status = 3
      }
      if (statusName === 'Dev') {
        status = 2
      }
      if (statusName === 'New') {
        status = 1
      }
      return status
    }
    // loadPipelines () {
    //   this.getPipelines(
    //     {
    //       loadingVariableName: 'pipelinesLoading',
    //       caller: this
    //     }
    //   )
    // },
    // loadOpenCollectors () {
    //   this.getOpenCollectors(
    //     {
    //       loadingVariableName: 'collectorsLoading',
    //       caller: this
    //     }
    //   )
    // } // loadOpenCollectors
  }, // mehtods
  mounted () {
  //   if (this.pipelines && this.pipelines.length === 0) {
  //     this.loadPipelines()
  //   }
  //   if (this.openCollectors.length === 0) {
  //     this.loadOpenCollectors()
  //   }
  }

}
</script>
