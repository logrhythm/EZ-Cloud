<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Properties" :to="'/Pipelines/' + this.pipelineUid + '/Properties'" />
        <q-separator vertical />
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
                  <q-btn
                    flat
                    dense
                    icon="add_circle_outline"
                    v-if="!(props.row.deploymentStatus && (props.row.deploymentStatus.ongoing === true || props.row.deploymentStatus.completed === true))"
                    :disable="!props.row.suitable"
                    @click="selectOpenCollector(props.row)"
                  >
                    <q-tooltip content-style="font-size: 1em">
                      {{ $t('Deploy') }}
                    </q-tooltip>
                  </q-btn>
                  <!-- <q-linear-progress rounded size="1em" :value="0.25" class="col" color="green-8" >
                    <q-tooltip content-style="font-size: 1em;" >Completed steps: 1 / 4</q-tooltip>
                  </q-linear-progress> -->
                  <!-- <q-linear-progress rounded size="1em" :value="(job.step > 0 ? job.totalSteps / job.step : 0)" class="col" :color="(job.onGoing === false ? (job.failed === false ? 'green-8' : 'deep-orange-8') : '')" >
                    <q-tooltip content-style="font-size: 1em;" >Completed steps: {{ job.step }} / {{ job.totalSteps }}</q-tooltip>
                  </q-linear-progress> -->
                  <!-- <div v-else>
                    <q-tooltip content-style="font-size: 1em">
                      ...
                    </q-tooltip>
                    <q-circular-progress
                      :value="Math.round(25)"
                      show-value
                      :font-size="(25 < 100 ? '0.5em' : '0.4em')"
                      size="2.2em"
                      :thickness="0.2"
                      :color="(darkMode ? 'blue-3' : 'blue-10')"
                      :track-color="(darkMode ? 'grey-9' : 'grey-3')"
                    />
                  </div> -->
                  <q-btn
                    v-else
                    flat
                    dense
                  >
                    <q-tooltip content-style="font-size: 1em">
                      <div>
                        <div class="row justify-between q-my-sm q-mr-sm">
                          <div class="row items-center q-gutter-x-sm">
                            <q-icon name="list" color="blue-3" size="md" />
                            <div class="text-h6">Deployment Steps</div>
                          </div>
                          <div class="q-gutter-x-md">
                            <q-icon name="warning" color="orange" size="md" v-if="props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true" />
                            <q-icon name="task_alt" color="positive" size="md" v-else-if="props.row && props.row.deploymentStatus && props.row.deploymentStatus.completed === true" />
                            <q-circular-progress
                              :value="Math.round(deploymentProgressFor(props.row))"
                              show-value
                              :font-size="(deploymentProgressFor(props.row) < 100 ? '0.5em' : '0.4em')"
                              size="2.8em"
                              :thickness="0.2"
                              :color="(darkMode ? 'blue-3' : 'blue-10')"
                              :track-color="(props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true ? (darkMode ? 'red-10' : 'red') : (darkMode ? 'grey-9' : 'grey-3'))"
                              :center-color="(props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true ? (darkMode ? 'orange-10' : 'orange') : undefined)"
                            />
                          </div>
                        </div>
                        <q-separator />
                          <!-- v-if="props.row && props.row.deploymentStatus && props.row.deploymentStatus.steps && props.row.deploymentStatus.steps.length" -->
                        <q-item
                          v-for="(step, i) in (props.row && props.row.deploymentStatus && props.row.deploymentStatus.steps && props.row.deploymentStatus.steps.length ? props.row.deploymentStatus.steps : [])" :key="i"
                          style="min-width: 30rem;"
                          dense
                        >
                          <q-item-section>
                            <q-item-label>
                              <div class="row items-center no-wrap">
                                <q-icon name="arrow_right" size="sm" :class="(step.status === 'On-going' || step.status === 'Error' ? '' : 'invisible')" />
                                <div class="force-long-text-wrap ellipsis-3-lines" :class="(step.status === 'On-going' || step.status === 'Error' ? 'text-bold' : '')" >{{ step.name }}</div>
                              </div>
                              <!-- <div class="force-long-text-wrap ellipsis-3-lines">{{ step.status }}</div> -->
                            </q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-icon v-if="step.status === 'Not started'" name="hourglass_empty" size="sm" color="grey" />
                            <q-icon v-else-if="step.status === 'Pending'" name="hourglass_top" size="sm" color="grey-3" />
                            <q-spinner-dots v-else-if="step.status === 'On-going'" color="blue-10" size="2em" />
                            <q-icon v-else-if="step.status === 'Completed'" name="task_alt" size="sm" color="positive" />
                            <q-icon v-else-if="step.status === 'Error'" name="error" size="sm" color="orange" />
                            <q-icon v-else-if="step.status === 'Cancelled'" name="block" size="sm" color="grey" />
                          </q-item-section>
                        </q-item>
                        <div v-if="props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true"  class="q-mt-sm">
                          <q-separator />
                          <div class="row items-center">
                            <q-icon name="info" color="blue-10" size="md" />
                            <q-separator vertical class="q-mx-sm"/>
                            <div class="q-my-sm">
                              <div class="text-bold" v-if="props.row.deploymentStatus.errorMessage && props.row.deploymentStatus.errorMessage.length">The last step failed with this error message:</div>
                              <div class="text-bold" v-else>The last step failed with no error message.</div>
                              <div class="force-long-text-wrap ellipsis-3-lines" style="max-width: 35rem;">{{ props.row.deploymentStatus.errorMessage }}</div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </q-tooltip>
                    <q-circular-progress
                      :value="Math.round(deploymentProgressFor(props.row))"
                      show-value
                      :font-size="(deploymentProgressFor(props.row) < 100 ? '0.5em' : '0.4em')"
                      size="1.7em"
                      :thickness="0.2"
                      :color="(darkMode ? 'blue-3' : 'blue-10')"
                      :track-color="(props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true ? (darkMode ? 'red-10' : 'red') : (darkMode ? 'grey-9' : 'grey-3'))"
                      :center-color="(props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true ? (darkMode ? 'orange-10' : 'orange') : undefined)"
                    />
                  </q-btn>
                  <!-- <q-circular-progress
                    :value="Math.round(props.value)"
                    show-value
                    :font-size="(props.value < 100 ? '0.5em' : '0.4em')"
                    size="2.8em"
                    :thickness="0.2"
                    :color="(darkIsEnabled ? 'blue-3' : 'blue-10')"
                    :track-color="(darkIsEnabled ? 'grey-9' : 'grey-3')"
                  /> -->

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

              <template v-slot:body-cell-installedShippers="props">
                <q-td :props="props">
                  <div
                      v-for="(shipper, index) in props.value"
                      :key="index"
                  >
                    <q-tooltip content-style="font-size: 1em;" >{{ shipper.name }}</q-tooltip>
                    <q-avatar square  size="24px" class="q-mr-xs">
                      <img :src="'/shippers/' + collectionShipperDetails(shipper.name).icon + '.svg'" />
                      <!-- <q-badge floating transparent color="primary">v{{ shipper.version }}</q-badge> -->
                    </q-avatar>
                    <q-badge outline color="grey">v{{ shipper.version }}</q-badge>
                  </div>
                  <div v-if="props.row.hasNecessaryShipper !== true">
                    <q-tooltip content-style="font-size: 1em;" >
                      The necessary Shipper to collect this source is not installed on this collector.<br><br>
                      Please go to the Collectors page to deploy this Shipper on this Collector.<br><br>
                      <q-icon
                        name="info"
                        size="sm"
                        color="info"
                        class="q-mr-sm"
                      />
                      <span class="text-bold">Missing:</span> {{ (pipeline && pipeline.collectionConfig && pipeline.collectionConfig.collectionShipper ? pipeline.collectionConfig.collectionShipper : 'N/A') }}<br>
                      <img class="q-ml-lg" :src="'/shippers/' + collectionShipperDetails((pipeline && pipeline.collectionConfig && pipeline.collectionConfig.collectionShipper ? pipeline.collectionConfig.collectionShipper : null)).icon + '.svg'"  width="128px"/>
                    </q-tooltip>
                    <q-badge outline color="orange" class="q-gutter-x-sm">
                      <q-icon
                        name="warning"
                        size="sm"
                        color="orange"
                      />
                      <div class="icon-stack">
                        <img class="img-stack-75" :src="'/shippers/' + collectionShipperDetails((pipeline && pipeline.collectionConfig && pipeline.collectionConfig.collectionShipper ? pipeline.collectionConfig.collectionShipper : null)).icon + '.svg'"/>
                        <img class="img-stack-100 img-stack-opacity-50" :src="'/shippers/_block_overlay.svg'"/>
                      </div>
                    </q-badge>

                  </div>
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
          <!-- <q-card-section>
              <span class="text-bold">deploymentStatuses: </span>
              <pre>{{ deploymentStatuses }}</pre>
          </q-card-section> -->
        </q-card-section>
      </q-card>
    </div>
    <hr>
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
import { mapState, mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedShipperAndCollectionsHelpers from 'src/mixins/mixin-Shared-ShipperAndCollectionsHelpers'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedShipperAndCollectionsHelpers, // Shared funtion to provide info (icon, names, etc...) for Shippers and Collections methods
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      pipelineUid: '',
      openCollectorUid: '',
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: 'Suitable', field: 'suitable', sortable: true },
        { name: 'openCollector', align: 'center', label: 'Open Collector', field: 'openCollectorHost', sortable: true },
        { name: 'installedShippers', align: 'center', label: 'Installed Shippers', field: row => (row.openCollector ? row.openCollector.installedShippers : undefined), sortable: true },
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
      collectorLogSourcesLoading: false,
      deploymentStatuses: [],
      // deploymentStatuses: [
      //   {
      //     openCollectorUid: '941415a2-1608-4f1e-b32a-b735a29cdbb3',
      //     // pipelineUid: 'b9f7c85a-a278-11eb-bcbc-0242ac130002',
      //     msgSourceId: 30,
      //     ongoing: false,
      //     steps: [],
      //     logs: []
      //   }
      // ],
      deploymentStepsNewLogSource: [
        {
          uid: 'e745e0e6-60f6-4857-8afa-f8ea0663b6c3',
          name: 'Create and drop Beat\'s configuration in right location',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/test/post',
          apiParamNames: ['uid', 'oc_uid_TBC']
        },
        {
          uid: 'd004f165-a028-4183-8e6d-f64534357c5d',
          name: 'Import JQ Pipeline into Open Collector',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/test/post',
          apiParamNames: ['uid', 'oc_uid_TBC']
        },
        {
          uid: 'b632b998-cd67-4571-a384-31faf0053d1a',
          name: 'Create Log Source Type',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateLogSourceType',
          apiParamNames: ['uid', 'name']
        },
        {
          uid: '7e739d98-d427-4fac-9f63-392e8ccb4c94',
          name: 'Create MPE Rule',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateMpeRule',
          apiParamNames: ['uid', 'name']
        },
        // { // NOT IMPLEMENTING THIS FOR NOW
        //   uid: '04ff4e8c-de73-419a-a48b-944b01bca836',
        //   name: 'Create MPE Sub-Rule(s)',
        //   status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
        //   apiEndpoint: '/logrhythmCore/UpdateMpeSubRule',
        //   apiParamNames: ['uid', 'SubRuleUid', 'SubRuleName', 'Tag1'],
        //   specialTag: ['runForEachSubRule']
        // },
        {
          uid: '6fba3b49-580b-4ceb-b8be-374fc848fe63',
          name: 'Create Processing Policy',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateProcessingPolicy',
          apiParamNames: ['uid', 'name', 'MPEPolicy_Name']
        },
        {
          uid: 'dd1fae83-10af-40ea-bfe9-20ff668d5141',
          name: 'Create Log Source (LS) Virtualisation',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateLogSourceVirtualisationTemplate',
          apiParamNames: []
        },
        {
          uid: '857787cd-4ec5-4c06-b044-7aaf37de326f',
          name: 'Create new LS Virtualisation Item and associate it to LS Virtualisation',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateLogSourceVirtualisationTemplateItem',
          apiParamNames: ['uid', 'name']
        },
        // { // NOT NECESSARY AS ALREADY GATHERED AND DISPLAYED TO USER AS TABLE
        //      USER WILL HAVE PICKED UP THE OpenCollectorMotherLogSourceID FROM TABLE
        //   uid: '1246443c-2f50-48af-bd7e-8072ed214e2e',
        //   name: 'Search related Open Collector LS',
        //   status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
        //   apiEndpoint: '/logrhythmCore/GetOpenCollectorLogSourcesList',
        //   apiParamNames: ['uid', 'name']
        // },
        {
          uid: '5c0a3a9c-6d01-40e6-acb8-b0763a52bba3',
          name: 'Add LS Virtualisation to Open Collector Log Source',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateOpenCollectorLogSourceWithLogSourceVirtualisation',
          apiParamNames: ['uid', 'OpenCollectorMotherLogSourceID']
        }
      ],
      deploymentStepsExistingLogSource: [
        {
          uid: 'd1038519-da8b-4580-91a6-8c34b3001327',
          name: 'Update Beat configuration',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/test/post',
          apiParamNames: ['uid', 'oc_uid_TBC']
        },
        {
          uid: 'b0f41342-c758-4453-8381-9be346f25dfe',
          name: 'Re-import JQ Pipeline into Open Collector',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/test/post',
          apiParamNames: ['uid', 'oc_uid_TBC']
        },
        {
          uid: '3d0ef0a5-0c65-4b62-a68a-e1422490ffef',
          name: 'Modify MPE Sub-Rule(s)',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateMpeSubRule',
          apiParamNames: ['uid', 'SubRuleUid', 'SubRuleName', 'Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5']
        },
        {
          uid: '32d0bf3c-9e09-4388-9a68-cec7c8b38529',
          name: 'Modify Processing Policy',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateProcessingPolicy',
          apiParamNames: ['uid', 'name', 'MPEPolicy_Name']
        },
        {
          uid: '72e265cd-9d0d-469c-b1fd-8a319f3971b2',
          name: 'Modify Log Source Virtualisation',
          status: 'Not started', // Not started, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateLogSourceVirtualisationTemplateItem',
          apiParamNames: ['uid', 'name']
        }
      ]
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
    ...mapState('mainStore', ['openCollectorBeats']),
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
              // Flagging as a good match (has both an OC specified here and a OC Losg Source in the SIEM)
              isAMatch = true
              // Establishing the list of Identifiers
              const logSourceHostIdentifiers = ls.hostIdentifiers.reduce((valuesArray, hi) => {
                if (hi.value && hi.value.length) { valuesArray.push(hi.value) }
                return valuesArray
              }, [])
              // Flag if the right Shipper is already installed or if included out-of-the-box with the Open Collector
              const hasNecessaryShipper = this.hasNecessaryShipper(oc)

              list.push({
                openCollector: oc,
                openCollectorLogSource: ls,
                pipelineUid: this.pipeline.uid,
                suitable: !!(isAMatch & hasNecessaryShipper),
                openCollectorHost: (oc && oc.name && oc.hostname ? oc.name + ' (' + oc.hostname + ')' : null),
                name: ls.name,
                msgSourceId: ls.msgSourceID,
                hostName: ls.hostName + ' (' + logSourceHostIdentifiers.join(' / ') + ')',
                hostId: ls.hostID,
                hasNecessaryShipper,
                deploymentStatus: this.deploymentStatuses.find(ds => ds && ds.openCollectorUid && oc && oc.uid && ls && ls.msgSourceID && ds.msgSourceId === ls.msgSourceID && ds.openCollectorUid === oc.uid)
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
            hostId: ls.hostID,
            hasNecessaryShipper: false // No Open Collector: no Shipper. Pas de bras: pas de chocolat.
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
            suitable: false,
            hasNecessaryShipper: this.hasNecessaryShipper(oc)
          })
        }
      })

      return list
    }
  },

  methods: {
    ...mapActions('mainStore', ['getOpenCollectorLogSources', 'callDeploymentStepApi']),
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
    selectOpenCollector (selectedRow) {
      // Called when user click on the (+) button in the Action column to Deploy the Pipeline to this OC and map to the Log Source (defined on the line clicked on)
      if (
        selectedRow &&
        selectedRow.openCollector &&
        selectedRow.openCollector.uid &&
        selectedRow.openCollector.uid.length &&
        selectedRow.msgSourceId
      ) {
        const deploymentStatus = this.deploymentStatuses.find(
          ds =>
            ds.openCollectorUid === selectedRow.openCollector.uid &&
            ds.msgSourceId === selectedRow.msgSourceId
        )
        if (deploymentStatus) {
          deploymentStatus.ongoing = true
          deploymentStatus.completed = false
          this.deploymentStatuses = JSON.parse(JSON.stringify(this.deploymentStatuses))
        } else {
          this.deploymentStatuses.push(
            {
              openCollectorUid: selectedRow.openCollector.uid,
              msgSourceId: selectedRow.msgSourceId,
              ongoing: true,
              completed: false,
              logs: [],
              steps: JSON.parse(JSON.stringify(this.deploymentStepsNewLogSource))
            }
          )
        }
        console.log('selectOpenCollector - deploymentStatus', deploymentStatus) // XXXX
        // Run the first step
        setTimeout(this.runDeploymentStep, 500, this, selectedRow, 0)
      }
    }, // selectOpenCollector
    deploymentProgressFor (selectedRow) {
      // Calculate the percentage of steps that are set to Completed for the deploymentStatus a given Row
      return (
        selectedRow && selectedRow.deploymentStatus && selectedRow.deploymentStatus.steps && selectedRow.deploymentStatus.steps.length
          ? selectedRow.deploymentStatus.steps.filter(s => s.status && s.status.length && s.status.toLowerCase() === 'completed').length / selectedRow.deploymentStatus.steps.length * 100
          : 0
      )
    }, // deploymentProgressFor
    hasNecessaryShipper (oc) {
      // this.pipeline.collectionConfig.collectionShipper
      // "filebeat"
      //
      // oc.installedShippers
      // "installedShippers": [
      //   {
      //     "name": "Filebeat",
      //     "version": "7.13.0"
      //   }
      // ]
      // debugger

      // Prep a lower case Shipper name
      const neededShipperLowerCase = (
        this.pipeline &&
        this.pipeline.collectionConfig &&
        this.pipeline.collectionConfig.collectionShipper &&
        this.pipeline.collectionConfig.collectionShipper.length
          ? this.pipeline.collectionConfig.collectionShipper.toLowerCase()
          : null
      )

      return !!(( // Is this Shipper in the list of the Installed Shipper for this Open Collector
        oc &&
        oc.installedShippers &&
        Array.isArray(oc.installedShippers) &&
        oc.installedShippers.filter((shipper) => shipper.name && shipper.name.toLowerCase() === neededShipperLowerCase).length
      ) | ( // Or is is part of the out-of-the-box Open Collector Beats
        this.openCollectorBeats.filter((beat) => beat.value && beat.value.toLowerCase() === neededShipperLowerCase).length
      ))
    }, // hasNecessaryShipper
    runDeploymentStep (caller, selectedRow, stepNumber) {
      console.log('runDeploymentStep', stepNumber, selectedRow)
      // if (selectedRow && selectedRow.deploymentStatus && selectedRow.deploymentStatus.steps && selectedRow.deploymentStatus.steps.length > stepNumber) {
      if (
        selectedRow &&
        selectedRow.openCollector &&
        selectedRow.openCollector.uid &&
        selectedRow.openCollector.uid.length &&
        selectedRow.msgSourceId
      ) {
        const deploymentStatus = caller.deploymentStatuses.find(
          ds =>
            ds.openCollectorUid === selectedRow.openCollector.uid &&
            ds.msgSourceId === selectedRow.msgSourceId
        )
        if (deploymentStatus && deploymentStatus.steps && deploymentStatus.steps.length > stepNumber) {
          const step = deploymentStatus.steps[stepNumber]
          console.log(' - Step: ', step.name, JSON.stringify(step))
          // Do the work for this step
          step.status = 'On-going'

          // - Process of onboarding a LS from JQ
          //   - [ ] New Log Source
          //     - [ ] Drop Beat configuration in right location
          //     - [ ] Import JQ to OC
          //     - [ ] Create LS Type
          //     - [ ] Create MPE Rule
          //     - [ ] Create MPE Sub-Rule(s)
          //       - [ ] Based on Field Mapping / Sub Rules ID
          //     - [ ] Create Processing Policy
          //     - [ ] Create LS Virtualisation
          //     - [ ] Create new LS Virtualisation Item and associate it to LS Virtualisation
          //     - [ ] Search related Open Collector LS
          //     - [ ] Add LS Virtualisation to Open Collector LS
          //   - [ ] Exisiting Log Source / Update of field mapping
          //     - [ ] Update Beat configuration in right location
          //     - [ ] Re-import JQ to OC
          //     - [ ] Modify MPE Sub-Rule(s)
          //     - [ ] Modify Processing Policy
          //     - [ ] Modify LS Virtualisation Item

          // Prepare the parameters
          const apiUrl = (step.apiEndpoint && step.apiEndpoint.length ? step.apiEndpoint : '/test/doesNotExist')
          // const apiUrl = (stepNumber < 6 ? (step.apiEndpoint && step.apiEndpoint.length ? step.apiEndpoint : '/test/doesNotExist') : '/test/doesNotExist') // XXXX
          // const apiUrl = (stepNumber < 60 ? '/test/post' : '/test/doesNotExist') // XXXX
          console.log(' - apiUrl', apiUrl) // XXXX
          // const apiUrl_ = (step.apiEndpoint && step.apiEndpoint.length ? step.apiEndpoint : '/test/doesNotExist') // XXXX
          // console.log(' - apiUrl_', apiUrl_) // XXXX

          const apiCallParamsSource = {
            uid: (caller && caller.pipeline && caller.pipeline.uid && caller.pipeline.uid.length ? caller.pipeline.uid : undefined),
            name: (caller && caller.pipeline && caller.pipeline.name && caller.pipeline.name.length ? caller.pipeline.name : undefined),
            oc_uid_TBC: (deploymentStatus.openCollectorUid && deploymentStatus.openCollectorUid.length ? deploymentStatus.openCollectorUid : undefined),
            // SubRuleUid: '{{ls_sub_rule_uid}}_',  // NOT IMPLEMENTING THIS FOR NOW, see Step UID 04ff4e8c-de73-419a-a48b-944b01bca836
            // SubRuleName: '{{ls_sub_rule_name}}_',  // NOT IMPLEMENTING THIS FOR NOW, see Step UID 04ff4e8c-de73-419a-a48b-944b01bca836
            // Tag1: '{{ls_sub_rule_tag1}}',  // NOT IMPLEMENTING THIS FOR NOW, see Step UID 04ff4e8c-de73-419a-a48b-944b01bca836
            MPEPolicy_Name: 'LogRhythm Default',
            OpenCollectorMotherLogSourceID: deploymentStatus.msgSourceId
          }
          // console.log(' - apiCallParamsSource', apiCallParamsSource) // XXXX

          const apiCallParams = (
            step.apiParamNames &&
            step.apiParamNames.length
              ? step.apiParamNames.reduce((paramsObject, param) => {
                paramsObject[param] = (apiCallParamsSource && apiCallParamsSource[param] ? apiCallParamsSource[param] : undefined)
                return paramsObject
              }, {})
              : undefined
          )
          console.log(' - apiCallParams', JSON.stringify(apiCallParams)) // XXXX

          // Call the API
          caller.callDeploymentStepApi({
            apiUrl,
            caller: caller,
            apiCallParams,
            onSuccessCallBack: (
              apiCallResult, // Param passed to onErrorCallBack by postDataToSite()
              step_ = step,
              selectedRow_ = selectedRow,
              stepNumber_ = stepNumber,
              caller_ = caller
            ) => {
              // Flag the step as Completed, and run the next step
              console.log('  👉 Run the next step') // XXXX
              setTimeout(
                () => {
                  step_.status = 'Completed'
                  caller_.runDeploymentStep(caller_, selectedRow_, stepNumber_ + 1)
                },
                // 250 // Run next step in 250 ms
                100 + Math.floor(Math.random() * 600) // XXXX
              )
              // setTimeout(caller_.runDeploymentStep, 50, caller_, selectedRow_, stepNumber_ + 1)
            },
            onErrorCallBack: (
              apiCallResult, // Param passed to onErrorCallBack by postDataToSite()
              step_ = step,
              deploymentStatus_ = deploymentStatus
            ) => {
              step_.status = 'Error'
              deploymentStatus_.ongoing = false
              deploymentStatus_.completed = true
              deploymentStatus_.error = true
              deploymentStatus_.errorMessage = (apiCallResult && apiCallResult.messageForLogAndPopup ? apiCallResult.messageForLogAndPopup : '')
              deploymentStatus_.errorMessage += (apiCallResult && apiCallResult.captionForLogAndPopup ? ` // ${apiCallResult.captionForLogAndPopup}` : '')
              console.log(apiCallResult)

              // Mark as Cancelled all the steps that were still waiting to run
              if (deploymentStatus_ && deploymentStatus_.steps && Array.isArray(deploymentStatus_.steps)) {
                deploymentStatus_.steps.filter(s => s.status && s.status.toLowerCase() === 'not started').forEach(s => { s.status = 'Cancelled' })
              }
            },
            debug: false
          })
        } else {
          // We have run out of Steps. Job done.
          deploymentStatus.ongoing = false
          deploymentStatus.completed = true
          console.log('🏁 We have run out of Steps. Job done.') // XXXX
        }
      }
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

<style scoped>
.icon-stack {
  position: relative;
  display: inline-block;
  width: 2em;
  height: 2em;
  line-height: 2em;
  vertical-align: middle;
}
.icon-stack-1x,
.icon-stack-2x,
.icon-stack-3x,
.img-stack-50,
.img-stack-75,
.img-stack-100 {
  position: absolute;
  left: 0;
  width: 100%;
  text-align: center;
}
.icon-stack-1x {
  line-height: inherit;
}
.icon-stack-2x {
  font-size: 1.5em;
}
.icon-stack-3x {
  font-size: 2em;
}
.img-stack-50 {
  top: 0.5em;
  left: 0.5em;
  width: 50%;
}
.img-stack-75 {
  top: 0.25em;
  left: 0.25em;
  width: 75%;
}
.img-stack-opacity-50 {
  opacity: 0.5;
}
</style>
