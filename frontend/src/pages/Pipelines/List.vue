<template>
  <q-page class="q-pa-md">
    <!-- <q-btn class="q-mt-sm" label="Open Editor" to="/Pipelines/b9f7c85a-a278-11eb-bcbc-0242ac130002/Edit" color="primary"/> -->
      <q-table
        :title="$t('Pipelines')"
        :data="tableData"
        :columns="columns"
        row-key="uid"
        dense
        :no-data-label="$t('No Pipeline to display.')"
        :filter="searchFilter"
        :loading="tableLoading"
        :rows-per-page-label="$t('Pipelines per page:')"
        :pagination.sync="pagination"
      >

        <template v-slot:top>
          <div class="full-width row wrap justify-between">
            <div class="q-table__title">
              {{ $t('Pipelines') }}
            </div>
            <div class="row q-gutter-md">
              <div class="col" >
                <q-btn no-caps dense color="primary" icon="add" :label="$t('Add New Pipeline')" @click="doPromptForPipelineDetails()" style="min-width:12rem;">
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Create a new Pipeline.') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
            <div class="row q-gutter-md">
              <div style="width:300px;">
                <q-input outlined dense debounce="300" v-model="searchFilter" :placeholder="$t('Search')">
                  <template v-slot:append>
                    <q-btn v-if="searchFilter.length" dense flat icon="close" @click="searchFilter=''" />
                    <q-icon name="o_search" />
                  </template>
                </q-input>
              </div>
              <!-- <q-separator vertical dark color="orange" /> -->
              <q-btn dense outline icon="refresh" @click="loadPipelines()">
                <q-tooltip content-style="font-size: 1em">
                  {{ $t('Reload the list of Pipelines.') }}
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
            <q-icon name="o_arrow_circle_up" color="green" size="md" v-if="props.value === 'Ready'" />
            <q-icon name="o_construction" :color="(darkIsEnabled ? 'green-3' : 'green-10')" size="md" v-else-if ="props.value === 'Dev'" />
            <q-icon name="o_auto_awesome" size="md" v-else-if ="props.value === 'New'" />
            <q-icon name="o_help_center" color="grey" size="md" v-else />
            <q-tooltip content-style="font-size: 1em">
              {{ $t(props.value) }}
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
                <span>{{ $t('Detected fields:') }} {{ props.row.fieldsMapping.length }}</span><br>
                <span>{{ $t('Mapped fields:') }} {{ props.row.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) }}</span>&nbsp;(<span class="text-bold">{{ Math.round(props.value * 100) / 100 }}%</span>)
              </q-tooltip>
            </div>
          </q-td>
        </template>
      </q-table>

      <q-dialog v-model="promptForNewPipelineDetails" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row justify-between">
            <div class="text-h6">{{ $t('Pipeline Details') }}</div>
            <q-btn dense flat icon="close" color="grey-5" v-close-popup />
          </q-card-section>

          <q-separator />

          <q-card-section class="">
            <q-input
              dense
              outlined
              autofocus
              v-model="newPipelineName"
              :label="$t('Pipeline Name')"
              @keyup.esc="promptForNewPipelineDetails = false"
              :rules="[val => !!val || $t('Pipeline name cannot be empty')]"
            />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select
              dense
              outlined
              v-model="newPipelineOpenCollector"
              :options="openCollectorsOptions"
              :label="$t('Primary OpenCollector')"
              emit-value
              map-options
            />
          </q-card-section>

          <q-card-section class="q-pt-none q-mt-md" v-if="newPipelineStatus">
            <q-select
              dense
              outlined
              v-model="newPipelineStatus"
              :options="statusOptions"
              :label="$t('Status')"
              emit-value
              map-options
            />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="text-primary ">
            <q-btn outline no-caps :label="$t('Cancel')" v-close-popup />
            <q-btn color="primary" no-caps class="text-textForPrimaryButton" :label="$t('Update Pipeline')" v-if="newPipelineUid && newPipelineUid.length" v-close-popup :disabled="!newPipelineName.length" @click="updatePipeline()" />
            <q-btn color="primary" no-caps class="text-textForPrimaryButton" :label="$t('Add new Pipeline')" v-else v-close-popup :disabled="!newPipelineName.length" @click="updatePipeline()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import mixinSharedRightToLeft from 'src/mixins/mixin-Shared-RightToLeft'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedShipperAndCollectionsHelpers from 'src/mixins/mixin-Shared-ShipperAndCollectionsHelpers'
import ConfirmDialog from 'components/Dialogs/ConfirmDialog.vue'

export default {
  name: 'PagePipelinesList',
  mixins: [
    mixinSharedRightToLeft, // Shared functions to deal with LTR/RTL languages
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedShipperAndCollectionsHelpers // Shared funtion to provide info (icon, names, etc...) for Shippers and Collections methods
  ],
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: this.$t('Actions'), field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: this.$t('Status'), field: 'status', sortable: true, sort: (a, b, rowA, rowB) => this.statusTextToId(a) - this.statusTextToId(b) },
        { name: 'name', align: 'center', label: this.$t('Pipeline Name'), field: 'name', sortable: true },
        { name: 'openCollector', align: 'center', label: this.$t('Primary OpenCollector'), field: 'openCollector', sortable: true },
        { name: 'collectionShipper', align: 'center', label: this.$t('Collecting Shipper'), field: row => row.collectionConfig.collectionShipper, sortable: true },
        { name: 'collectionMethod', align: 'center', label: this.$t('Collection Method'), field: row => row.collectionConfig.collectionMethod, sortable: true },
        { name: 'mappingStats', align: 'center', label: this.$t('Fields Mapped (%)'), field: row => (row.fieldsMapping && Array.isArray(row.fieldsMapping) && row.fieldsMapping.length > 0 ? row.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) / row.fieldsMapping.length * 100 : null), sortable: true }
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
      statusOptions: [ // Using the label/value due to translation. Do not revert back to simple list.
        {
          label: this.$t('New'),
          value: 'New'
        },
        {
          label: this.$t('Dev'),
          value: 'Dev'
        },
        {
          label: this.$t('Ready'),
          value: 'Ready'
        }
      ]
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
          component: ConfirmDialog,
          parent: this,
          title: this.$t('Confirm'),
          message: this.$t('Do you REALLY want to delete this Pipeline?'),
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
    collectionMethodDetails (shipperId, methodId) {
      // console.log('collectionMethodDetails: ', methodId)
      const fallbackValue = { value: 'unknown', label: this.$t('Unknown or not set'), icon: 'help_center' }
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
