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
      <q-card>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              Select a Suitable Open Collector
          </q-card-section>
          <q-card-section>
            <q-table
              :data="tableData"
              :columns="columns"
              row-key="uid"
              dense
              no-data-label="No Open Collector to display."
              :filter="searchFilter"
              :loading="dataLoading || collectorLogSourcesLoading"
              rows-per-page-label="Open Collectors per page:"
              :pagination.sync="pagination"
            >
              <template v-slot:top>
                <div class="full-width row wrap justify-between">
                  <div class="q-table__title">
                    Available Open Collectors
                  </div>
                  <!-- <div class="row q-gutter-md">
                    <div class="col" >
                      <q-btn rounded dense color="primary" icon="add" label="Add New Deployment" style="min-width:14rem;" @click="addNewDeployment()" >
                        <q-tooltip content-style="font-size: 1em">
                          Create a new Deployment.
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div> -->
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
                    <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadOpenCollectorsPipelinesAndLogSources()">
                      <q-tooltip content-style="font-size: 1em">
                        Reload the list of Pipelines.
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense icon="add_circle_outline" :disable="!props.row.suitable" @click="selectOpenCollector(props.row)">
                    <q-tooltip content-style="font-size: 1em">
                      {{ $t('Deploy') }}
                    </q-tooltip>
                  </q-btn>
                  <!-- <q-btn flat dense icon="remove_circle" color="negative" @click="deleteDeploymentPrompt(props.row)">
                    <q-tooltip content-style="font-size: 1em">
                      {{ $t('Un-deploy') }}
                    </q-tooltip>
                  </q-btn> -->
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-icon name="thumb_up" color="green" size="md" v-if="props.value === true" />
                  <q-icon name="thumb_down" color="red" size="md" v-else-if ="props.value === false" style="opacity: .6" />
                  <q-icon name="thumb_down_off_alt" color="orange" size="md" v-else style="opacity: .6" />
                  <q-tooltip content-style="font-size: 1em">
                    <span v-if="props.value === true">Suitable</span>
                    <span v-else-if ="props.value === false">Unsuitable</span>
                    <span v-else>Unknown. Likely unsuitable ({{ props.value }})</span>
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
          <!-- <q-card-section>
              <span class="text-bold">openCollectorLogSources: </span>
              <pre>{{ openCollectorLogSources }}</pre>
          </q-card-section> -->
        </q-card-section>
      </q-card>
    </div>
    <!-- <div class="">
      <hr>
      pipelineUid: {{ pipelineUid }} <br>
      openCollectorUid: {{ openCollectorUid }}
      <ul>
        <li>[ ] Get list of OC Log Sources from Backend</li>
        <li>[ ] Try to map EZ OCs with OC Log Sources</li>
        <li>[ ] Flag EZ OCs that do not have the right Shipper for the Pipeline</li>
        <li>[ ] Capture user selection of OC Log Source</li>
      </ul>
      <ul>
        <li>Process of onboarding a LS from JQ</li>
        <ul>
          <li>New Log Source</li>
          <ul>
            <li>New Log Source</li>
            <li>Exisiting Log Source / Update of field mapping</li>
            <li>Drop Beat configuration in right location</li>
            <li>Import JQ to OC</li>
            <li>Create LS Type</li>
            <li>Create MPE Rule</li>
            <li>Create MPE Sub-Rule(s)</li>
            <ul>
              <li>Based on Field Mapping / Sub Rules ID</li>
            </ul>
            <li>Create Processing Policy</li>
            <li>Create LS Virtualisation</li>
            <li>Create new LS Virtualisation Item and associate it to LS Virtualisation</li>
            <li>Search related Open Collector LS</li>
            <li>Add LS Virtualisation to Open Collector LS</li>
          </ul>
          <li>Exisiting Log Source / Update of field mapping</li>
          <ul>
            <li>Update Beat configuration in right location</li>
            <li>Re-import JQ to OC</li>
            <li>Modify MPE Sub-Rule(s)</li>
            <li>Modify Processing Policy</li>
            <li>Modify LS Virtualisation Item</li>
          </ul>
        </ul>
      </ul>
    </div> -->
  </q-page>

</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'

export default {
  mixins: [
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ],
  data () {
    return {
      pipelineUid: '',
      openCollectorUid: '',
      needsSaving: false,
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: 'Suitable', field: 'suitable', sortable: true },
        { name: 'openCollector', align: 'center', label: 'Open Collector', field: 'openCollectorHost', sortable: true },
        { name: 'installedShippers', align: 'center', label: 'Installed Shippers', field: 'installedShippers', sortable: false },
        { name: 'name', align: 'center', label: 'Log Source Name', field: 'name', sortable: true },
        { name: 'msgSourceId', align: 'center', label: 'Log Source ID', field: 'msgSourceId', sortable: true },
        { name: 'hostName', align: 'center', label: 'Log Source Host', field: 'hostName', sortable: true },
        { name: 'hostId', align: 'center', label: 'Log Source Host ID', field: 'hostId', sortable: true }
      ],
      pagination: {
        sortBy: 'status',
        descending: true,
        rowsPerPage: 25
      },
      collectorLogSourcesLoading: false
    }
  },
  /* Open Collector LS:
    {
      "msgSourceID": 13,
      "systemMonitorID": 1,
      "status": 1,
      "msgSourceTypeID": 1000759,
      "name": "LRVM6 Open Collector",
      "shortDesc": "",
      "longDesc": "",
      "isVirtual": 0,
      "dateUpdated": "2021-07-20T12:02:09.440Z",
      "hostID": 1,
      "hostName": "LRVM6",
      "hostIdentifiers": [
        {
          "value": "192.168.0.222",
          "type": 1
        },
        {
          "value": "lrvm6",
          "type": 3
        }
      ]
    }
  */
  computed: {
    ...mapGetters('mainStore', ['openCollectorLogSources']),
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
      // List of OC
      // List of OC LS
      // Merge them by Host
      const list = []
      // Go through the Log Sources and map their OC pair, if possible
      this.openCollectorLogSources.forEach(ls => {
        let isAMatch = false
        this.openCollectors.forEach(oc => {
          if (ls.hostIdentifiers && Array.isArray(ls.hostIdentifiers) && oc.hostname) {
            const openCollectorHostNameLowerCase = String(oc.hostname).toLowerCase()
            const f = ls.hostIdentifiers.filter(hi => hi.value && (String(hi.value).toLowerCase() === openCollectorHostNameLowerCase))
            if (f.length) {
              isAMatch = true
              const logSourceHostIdentifiers = ls.hostIdentifiers.reduce((valuesArray, hi) => {
                if (hi.value && hi.value.length) { valuesArray.push(hi.value) }
                return valuesArray
              }, [])

              list.push({
                openCollector: oc,
                openCollectorLogSource: ls,
                pipelineUid: this.pipeline.uid,
                suitable: isAMatch,
                openCollectorHost: (oc && oc.name && oc.hostname ? oc.name + ' (' + oc.hostname + ')' : null),
                name: ls.name,
                msgSourceId: ls.msgSourceID,
                hostName: ls.hostName + ' (' + logSourceHostIdentifiers.join(' / ') + ')',
                hostId: ls.hostID
              })
            }
          }
        })
        if (!isAMatch) {
          list.push({
            openCollector: null,
            openCollectorLogSource: ls,
            pipelineUid: this.pipeline.uid,
            suitable: isAMatch,
            openCollectorHost: null,
            name: ls.name,
            msgSourceId: ls.msgSourceID,
            hostName: ls.hostName,
            hostId: ls.hostID
          })
        }
      })

      // Quickly build a short list of the OC already in the List
      const openCollectorsAlreadyInTheList = list.reduce((uidsArray, item) => {
        if (item && item.openCollector && item.openCollector.uid && item.openCollector.uid.length) {
          uidsArray.push(item.openCollector.uid)
        }
        return uidsArray
      }, [])

      // Go through the OC and add to the list the ones that are not already in it
      this.openCollectors.forEach(oc => {
        if (!openCollectorsAlreadyInTheList.includes(oc.uid)) {
          list.push({
            openCollector: oc,
            openCollectorLogSource: null,
            pipelineUid: this.pipeline.uid,
            openCollectorHost: (oc && oc.name && oc.hostname ? oc.name + ' (' + oc.hostname + ')' : null),
            suitable: false
          })
        }
      })

      return list
    }
  },

  methods: {
    ...mapActions('mainStore', ['getOpenCollectorLogSources']),
    loadOpenCollectorLogSources () {
      this.getOpenCollectorLogSources(
        {
          loadingVariableName: 'collectorLogSourcesLoading',
          caller: this
        }
      )
    },
    loadOpenCollectorsPipelinesAndLogSources () {
      this.loadOpenCollectorsAndPipelines()
      this.loadOpenCollectorLogSources()
    },
    save () {
      //
    },
    selectOpenCollector (selectedRow) {
      console.log('selectOpenCollector', selectedRow)
    }
  },

  mounted () {
    // Load the Open Collector Log Sources from the XM/PM database
    if (this.openCollectorLogSources.length === 0) {
      this.loadOpenCollectorLogSources()
    }

    // Get the Pipeline UID from teh Route
    if (this.$route.params.pipelineUid && this.$route.params.pipelineUid.length) {
      if (this.pipelineUid !== this.$route.params.pipelineUid) {
        this.pipelineUid = this.$route.params.pipelineUid
      }
    }

    // Get the Open Collector UID from the Route
    if (this.$route.params.openCollectorUid && this.$route.params.openCollectorUid.length) {
      if (this.openCollectorUid !== this.$route.params.openCollectorUid) {
        this.openCollectorUid = this.$route.params.openCollectorUid
      }
    }
  }
}
</script>

<style>

</style>
