<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" :src="(darkMode ? 'logrhythm_logo_darkmode_wide.svg' : 'logrhythm_logo_lightmode_wide.svg')" alt="LogRhythm Open Collector">
      </q-toolbar>
    </q-header>
    <BreadCrumbs
      :crumbs="breadCrumbs"
      :pageTitle="$tc('Edit Deployment | Edit Deployment: {pipelineName} | Edit Deployment: {pipelineName}', (pipeline && pipeline.name && pipeline.name.length ? 1 : 0), { pipelineName: (pipeline && pipeline.name && pipeline.name.length ? pipeline.name : '') })"
    />
    <div class=" q-gutter-y-sm">
      <q-card>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('Select a Suitable OpenCollector') }}
          </q-card-section>
          <q-card-section>
            <q-table
              :data="tableData"
              :columns="columns"
              row-key="uid"
              dense
              :no-data-label="$t('No OpenCollector to display.')"
              :filter="searchFilter"
              :loading="dataLoading || collectorLogSourcesLoading"
              :rows-per-page-label="$t('OpenCollectors per page:')"
              :pagination.sync="pagination"
            >
              <template v-slot:top>
                <div class="full-width row wrap justify-between">
                  <div class="q-table__title">
                    {{ $t('Available OpenCollectors') }}
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
                    <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadOpenCollectorsPipelinesAndLogSources()">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Reload the list of Pipelines.') }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">

                  <!-- DEPLOY BUTTON -->

                  <q-btn
                    flat
                    dense
                    icon="add_circle_outline"
                    v-if="!(props.row.deploymentStatus && (props.row.deploymentStatus.ongoing === true || props.row.deploymentStatus.completed === true))"
                    :disable="!props.row.suitable || (props.row.alreadyDeployed === true)"
                    @click="selectOpenCollectorForDeployment(props.row)"
                  >
                    <q-tooltip content-style="font-size: 1em">
                      {{ $t('Deploy') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else
                    flat
                    dense
                  >
                    <q-tooltip content-style="font-size: 1em">
                      <div>
                        <div class="row justify-between q-my-sm q-mr-sm">
                          <div class="row items-center q-gutter-x-sm">
                            <q-icon name="o_list" color="blue-3" size="md" />
                            <div class="text-h6">Deployment Steps</div>
                          </div>
                          <div class="q-gutter-x-md">
                            <q-icon name="o_warning" color="orange" size="md" v-if="props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true" />
                            <q-icon name="o_task_alt" color="positive" size="md" v-else-if="props.row && props.row.deploymentStatus && props.row.deploymentStatus.completed === true" />
                            <q-circular-progress
                              :value="Math.round(deploymentProgressFor(props.row, 'deploymentStatus').done)"
                              show-value
                              :font-size="(deploymentProgressFor(props.row, 'deploymentStatus').done < 100 ? '0.5em' : '0.4em')"
                              size="2.8em"
                              :thickness="0.2"
                              :color="(darkMode ? 'blue-3' : 'blue-10')"
                              :track-color="(props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true ? (darkMode ? 'red-10' : 'red') : (darkMode ? 'grey-9' : 'grey-3'))"
                              :center-color="(props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true ? (darkMode ? 'orange-10' : 'orange') : undefined)"
                            />
                          </div>
                        </div>
                        <q-separator />
                        <div class="q-mb-sm">
                          <q-item
                            v-for="(step, i) in (props.row && props.row.deploymentStatus && props.row.deploymentStatus.steps && props.row.deploymentStatus.steps.length ? props.row.deploymentStatus.steps : [])" :key="i"
                            style="min-width: 30rem;"
                            dense
                          >
                            <q-item-section>
                              <q-item-label>
                                <div class="row items-center no-wrap">
                                  <q-icon name="o_arrow_right" size="sm" :class="(step.status === 'On-going' || step.status === 'Error' ? '' : 'invisible')" />
                                  <div class="force-long-text-wrap ellipsis-3-lines" :class="(step.status === 'On-going' || step.status === 'Error' ? 'text-bold' : '')" >{{ step.name }}</div>
                                </div>
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-icon v-if="step.status === 'Not started'" name="o_hourglass_empty" size="sm" color="grey" />
                              <q-icon v-else-if="step.status === 'To skip'" name="o_redo" size="sm" color="grey" />
                              <q-icon v-else-if="step.status === 'Pending'" name="o_hourglass_top" size="sm" color="grey-3" />
                              <q-spinner-dots v-else-if="step.status === 'On-going'" color="blue-10" size="2em" />
                              <q-icon v-else-if="step.status === 'Completed'" name="o_task_alt" size="sm" color="positive" />
                              <q-icon v-else-if="step.status === 'Skipped'" name="o_redo" size="sm" color="green-4" style="opacity: .5;" />
                              <q-icon v-else-if="step.status === 'Error'" name="o_error" size="sm" color="orange" />
                              <q-icon v-else-if="step.status === 'Cancelled'" name="o_block" size="sm" color="grey" />
                            </q-item-section>
                          </q-item>
                        </div>
                        <div v-if="props.row && deploymentProgressFor(props.row, 'deploymentStatus').errorAbsolute">
                          <q-separator />
                          <div class="row items-center col no-wrap">
                            <q-icon name="o_warning" color="orange" size="md" />
                            <q-separator vertical class="q-mx-sm"/>
                            <q-separator vertical color="negative" size="0.2rem" class="q-ml-none q-mr-sm"/>
                            <div class="q-my-sm">
                              <div class="text-bold text-orange" v-if="props.row.deploymentStatus.errorMessage && props.row.deploymentStatus.errorMessage.length">{{ $t('The last step failed with this error message:') }}</div>
                              <div class="text-bold" v-else>{{ $t('The last step failed with no error message.') }}</div>
                              <div class="force-long-text-wrap ellipsis-3-lines" style="max-width: 35rem;">{{ props.row.deploymentStatus.errorMessage }}</div>
                            </div>
                          </div>
                        </div>
                        <div v-if="props.row && deploymentProgressFor(props.row, 'deploymentStatus').skippedAbsolute">
                          <q-separator />
                          <div class="row items-center col no-wrap">
                            <q-icon name="o_redo" color="green-4" size="md" />
                            <q-separator vertical class="q-mx-sm"/>
                            <div class="q-my-sm">
                              <div class="text-bold">{{ $tc('| One step has been skipped. | {count} steps have been skipped.', Math.round(deploymentProgressFor(props.row, 'deploymentStatus').skippedAbsolute)) }}</div>
                              <div class="">{{ $t('This is fine. Steps are typically skipped if not necessary for a given deployment.') }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-tooltip>
                    <q-circular-progress
                      :value="Math.round(deploymentProgressFor(props.row, 'deploymentStatus').done)"
                      show-value
                      :font-size="(deploymentProgressFor(props.row, 'deploymentStatus').done < 100 ? '0.5em' : '0.4em')"
                      size="1.7em"
                      :thickness="0.2"
                      :color="(darkMode ? 'blue-3' : 'blue-10')"
                      :track-color="(props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true ? (darkMode ? 'red-10' : 'red') : (darkMode ? 'grey-9' : 'grey-3'))"
                      :center-color="(props.row && props.row.deploymentStatus && props.row.deploymentStatus.error === true ? (darkMode ? 'orange-10' : 'orange') : undefined)"
                    />
                  </q-btn>

                  <!-- UN-DEPLOY BUTTON -->

                  <q-btn
                    flat
                    dense
                    icon="remove_circle_outline"
                    color="negative"
                    v-if="!(props.row.unDeployStatus && (props.row.unDeployStatus.ongoing === true || props.row.unDeployStatus.completed === true))"
                    :disable="!(props.row.alreadyDeployed === true)"
                    @click="selectOpenCollectorForUndeploy(props.row)"
                  >
                    <q-tooltip content-style="font-size: 1em">
                      <div class="text-bold q-mb-sm">{{ $t('Un-deploy') }}</div>
                      <div class="q-mb-xs">{{ $t('This Stream has already been deployed on this OpenCollector.') }}</div>
                      <div>{{ $t('This will remove the configuration from the Shipper on the OpenCollector, but will leave the OpenCollector\'s Pipeline and SIEM Log Source as they are.') }}</div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    v-else
                    flat
                    dense
                  >
                    <q-tooltip content-style="font-size: 1em">
                      <div>
                        <div class="row justify-between q-my-sm q-mr-sm">
                          <div class="row items-center q-gutter-x-sm">
                            <q-icon name="o_list" color="blue-3" size="md" />
                            <div class="text-h6">{{ $t('Un-Deployment Steps') }}</div>
                          </div>
                          <div class="q-gutter-x-md">
                            <q-icon name="o_warning" color="orange" size="md" v-if="props.row && props.row.unDeployStatus && props.row.unDeployStatus.error === true" />
                            <q-icon name="o_task_alt" color="positive" size="md" v-else-if="props.row && props.row.unDeployStatus && props.row.unDeployStatus.completed === true" />
                            <q-circular-progress
                              :value="Math.round(deploymentProgressFor(props.row, 'unDeployStatus').done)"
                              show-value
                              :font-size="(deploymentProgressFor(props.row, 'unDeployStatus').done < 100 ? '0.5em' : '0.4em')"
                              size="2.8em"
                              :thickness="0.2"
                              :color="(darkMode ? 'blue-3' : 'blue-10')"
                              :track-color="(props.row && props.row.unDeployStatus && props.row.unDeployStatus.error === true ? (darkMode ? 'red-10' : 'red') : (darkMode ? 'grey-9' : 'grey-3'))"
                              :center-color="(props.row && props.row.unDeployStatus && props.row.unDeployStatus.error === true ? (darkMode ? 'orange-10' : 'orange') : undefined)"
                            />
                          </div>
                        </div>
                        <q-separator />
                        <div class="q-mb-sm">
                          <q-item
                            v-for="(step, i) in (props.row && props.row.unDeployStatus && props.row.unDeployStatus.steps && props.row.unDeployStatus.steps.length ? props.row.unDeployStatus.steps : [])" :key="i"
                            style="min-width: 30rem;"
                            dense
                          >
                            <q-item-section>
                              <q-item-label>
                                <div class="row items-center no-wrap">
                                  <q-icon name="o_arrow_right" size="sm" :class="(step.status === 'On-going' || step.status === 'Error' ? '' : 'invisible')" />
                                  <div class="force-long-text-wrap ellipsis-3-lines" :class="(step.status === 'On-going' || step.status === 'Error' ? 'text-bold' : '')" >{{ step.name }}</div>
                                </div>
                              </q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-icon v-if="step.status === 'Not started'" name="o_hourglass_empty" size="sm" color="grey" />
                              <q-icon v-else-if="step.status === 'To skip'" name="o_redo" size="sm" color="grey" />
                              <q-icon v-else-if="step.status === 'Pending'" name="o_hourglass_top" size="sm" color="grey-3" />
                              <q-spinner-dots v-else-if="step.status === 'On-going'" color="blue-10" size="2em" />
                              <q-icon v-else-if="step.status === 'Completed'" name="o_task_alt" size="sm" color="positive" />
                              <q-icon v-else-if="step.status === 'Skipped'" name="o_redo" size="sm" color="green-4" style="opacity: .5;" />
                              <q-icon v-else-if="step.status === 'Error'" name="o_error" size="sm" color="orange" />
                              <q-icon v-else-if="step.status === 'Cancelled'" name="o_block" size="sm" color="grey" />
                            </q-item-section>
                          </q-item>
                        </div>
                        <div v-if="props.row && deploymentProgressFor(props.row, 'unDeployStatus').errorAbsolute">
                          <q-separator />
                          <div class="row items-center col no-wrap">
                            <q-icon name="o_warning" color="orange" size="md" />
                            <q-separator vertical class="q-mx-sm"/>
                            <q-separator vertical color="negative" size="0.2rem" class="q-ml-none q-mr-sm"/>
                            <div class="q-my-sm">
                              <div class="text-bold text-orange" v-if="props.row.unDeployStatus.errorMessage && props.row.unDeployStatus.errorMessage.length">{{ $t('The last step failed with this error message:') }}</div>
                              <div class="text-bold" v-else>{{ $t('The last step failed with no error message.') }}</div>
                              <div class="force-long-text-wrap ellipsis-3-lines" style="max-width: 35rem;">{{ props.row.unDeployStatus.errorMessage }}</div>
                            </div>
                          </div>
                        </div>
                        <div v-if="props.row && deploymentProgressFor(props.row, 'unDeployStatus').skippedAbsolute">
                          <q-separator />
                          <div class="row items-center col no-wrap">
                            <q-icon name="o_redo" color="green-4" size="md" />
                            <q-separator vertical class="q-mx-sm"/>
                            <div class="q-my-sm">
                              <div class="text-bold">{{ $tc('| One step has been skipped. | {count} steps have been skipped.', Math.round(deploymentProgressFor(props.row, 'unDeployStatus').skippedAbsolute)) }} </div>
                              <div class="">{{ $t('This is fine. Steps are typically skipped if not necessary for a given deployment.') }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-tooltip>
                    <q-circular-progress
                      :value="Math.round(deploymentProgressFor(props.row, 'unDeployStatus').done)"
                      show-value
                      :font-size="(deploymentProgressFor(props.row, 'unDeployStatus').done < 100 ? '0.5em' : '0.4em')"
                      size="1.7em"
                      :thickness="0.2"
                      :color="(darkMode ? 'blue-3' : 'blue-10')"
                      :track-color="(props.row && props.row.unDeployStatus && props.row.unDeployStatus.error === true ? (darkMode ? 'red-10' : 'red') : (darkMode ? 'grey-9' : 'grey-3'))"
                      :center-color="(props.row && props.row.unDeployStatus && props.row.unDeployStatus.error === true ? (darkMode ? 'orange-10' : 'orange') : undefined)"
                    />
                  </q-btn>
                </q-td>
              </template>

              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-badge color="green" size="md" v-if="props.value === true" >{{ $t('Suitable')}}</q-badge>
                  <q-badge color="red" size="md" v-else-if ="props.value === false" >{{ $t('Unsuitable')}}</q-badge>
                  <q-badge color="orange" size="md" v-else style="opacity: .6" >{{ $t('Unknown')}}</q-badge>
                  <q-tooltip content-style="font-size: 1em">
                    <span v-if="props.value === true">{{ $t('Suitable') }}</span>
                    <span v-else-if ="props.value === false">{{ $t('Unsuitable') }}</span>
                    <span v-else>{{ $t('Unknown. Likely unsuitable ({propValue})', { propValue: props.value }) }}</span>
                  </q-tooltip>
                </q-td>
              </template>

              <template v-slot:body-cell-installedShippers="props">
                <q-td :props="props">
                  <div
                      v-for="(shipper, index) in props.value"
                      :key="index"
                  >
                    <q-badge outline >{{ shipper.name }} - v{{ shipper.version }}</q-badge>
                  </div>
                  <div v-if="props.row.hasNecessaryShipper !== true">
                    <q-tooltip content-style="font-size: 1em;" >
                      {{ $t('The necessary Shipper to collect this source is not installed on this collector.') }}<br><br>
                      {{ $t('Please go to the Collectors page to deploy this Shipper on this Collector.') }}<br><br>
                      <q-icon
                        name="o_info"
                        size="sm"
                        color="info"
                        class="q-mr-sm"
                      />
                      <span class="text-bold">{{ $t('Missing:') }}</span><br>
                      <div class="q-ml-lg q-mt-sm row ">
                        <div class="text-center">
                          <span class="" >{{ (pipeline && pipeline.collectionConfig && pipeline.collectionConfig.collectionShipper ? pipeline.collectionConfig.collectionShipper : 'N/A') }}</span><br>
                          <img class="q-mt-sm" :src="'/shippers/' + collectionShipperDetails((pipeline && pipeline.collectionConfig && pipeline.collectionConfig.collectionShipper ? pipeline.collectionConfig.collectionShipper : null)).icon + '.svg'"  width="128px"/>
                        </div>
                      </div>
                    </q-tooltip>
                    <q-badge outline color="orange" class="">
                      <q-icon
                        name="o_warning"
                        color="orange"
                        class="q-mr-sm"
                      />
                      <div>
                        {{ (pipeline && pipeline.collectionConfig && pipeline.collectionConfig.collectionShipper ? pipeline.collectionConfig.collectionShipper : 'N/A') }}
                      </div>
                    </q-badge>
                  </div>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card-section>
      </q-card>
    </div>
    <hr>
  </q-page>

</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedShipperAndCollectionsHelpers from 'src/mixins/mixin-Shared-ShipperAndCollectionsHelpers'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedBuildJq from 'src/mixins/mixin-Shared-BuildJq'
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedShipperAndCollectionsHelpers, // Shared funtion to provide info (icon, names, etc...) for Shippers and Collections methods
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedBuildJq // Shared JQ Building functions (Filter and Transform)
  ],
  components: { BreadCrumbs },
  data () {
    return {
      pipelineUid: '',
      openCollectorUid: '',
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: this.$t('Actions'), field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: this.$t('Suitable'), field: 'suitable', sortable: true },
        { name: 'openCollector', align: 'center', label: this.$t('OpenCollector'), field: 'openCollectorHost', sortable: true },
        { name: 'installedShippers', align: 'center', label: this.$t('Installed Shippers'), field: row => (row.openCollector ? row.openCollector.installedShippers : undefined), sortable: true },
        { name: 'name', align: 'center', label: this.$t('Log Source Name'), field: 'name', sortable: true },
        { name: 'msgSourceId', align: 'center', label: this.$t('Log Source ID'), field: 'msgSourceId', sortable: true },
        { name: 'hostName', align: 'center', label: this.$t('Log Source Host'), field: 'hostName', sortable: true },
        { name: 'hostId', align: 'center', label: this.$t('Log Source Host ID'), field: 'hostId', sortable: true }
      ],
      pagination: {
        sortBy: 'status',
        descending: true,
        rowsPerPage: 25
      },
      collectorLogSourcesLoading: false,
      deploymentStatuses: [],
      unDeployStatuses: [],
      deploymentStepsNewLogSource: [
        {
          uid: 'e745e0e6-60f6-4857-8afa-f8ea0663b6c3',
          name: this.$t('Create and drop Beat\'s configuration in right location'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/oc/UpdateStreamConfigurationForBeat',
          apiParamNames: ['openCollector', 'beat', 'stream']
        },
        {
          uid: 'd004f165-a028-4183-8e6d-f64534357c5d',
          name: this.$t('Import JQ Pipeline into OpenCollector'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/oc/ImportPipelineForBeat',
          apiParamNames: ['openCollector', 'beat', 'stream']
        },
        {
          uid: 'b632b998-cd67-4571-a384-31faf0053d1a',
          name: this.$t('Create Log Source Type'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateLogSourceType',
          apiParamNames: ['uid', 'name']
        },
        {
          uid: '7e739d98-d427-4fac-9f63-392e8ccb4c94',
          name: this.$t('Create MPE Rule'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateMpeRule',
          apiParamNames: ['uid', 'name']
        },
        { // NOT IMPLEMENTING THIS FOR NOW
          uid: '04ff4e8c-de73-419a-a48b-944b01bca836',
          name: this.$t('Create MPE Sub-Rule(s)'),
          status: 'To skip', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateMpeSubRule',
          apiParamNames: ['uid', 'SubRuleUid', 'SubRuleName', 'Tag1'],
          specialTag: ['runForEachSubRule']
        },
        {
          uid: '6fba3b49-580b-4ceb-b8be-374fc848fe63',
          name: this.$t('Create Processing Policy'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateProcessingPolicy',
          apiParamNames: ['uid', 'name', 'MPEPolicy_Name']
        },
        {
          uid: 'dd1fae83-10af-40ea-bfe9-20ff668d5141',
          name: this.$t('Create Log Source (LS) Virtualisation'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateLogSourceVirtualisationTemplate',
          apiParamNames: []
        },
        {
          uid: '857787cd-4ec5-4c06-b044-7aaf37de326f',
          name: this.$t('Create new LS Virtualisation Item and associate it to LS Virtualisation'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateLogSourceVirtualisationTemplateItem',
          apiParamNames: ['uid', 'name']
        },
        // { // NOT NECESSARY AS ALREADY GATHERED AND DISPLAYED TO USER AS TABLE
        //      USER WILL HAVE PICKED UP THE OpenCollectorMotherLogSourceID FROM TABLE
        //   uid: '1246443c-2f50-48af-bd7e-8072ed214e2e',
        //   name: 'Search related OpenCollector LS',
        //   status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
        //   apiEndpoint: '/logrhythmCore/GetOpenCollectorLogSourcesList',
        //   apiParamNames: ['uid', 'name']
        // },
        {
          uid: '5c0a3a9c-6d01-40e6-acb8-b0763a52bba3',
          name: this.$t('Add LS Virtualisation to OpenCollector Log Source'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateOpenCollectorLogSourceWithLogSourceVirtualisation',
          apiParamNames: ['uid', 'OpenCollectorMotherLogSourceID']
        }
      ],
      deploymentStepsExistingLogSource: [
        {
          uid: 'd1038519-da8b-4580-91a6-8c34b3001327',
          name: this.$t('Update Beat configuration'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/oc/UpdateStreamConfigurationForBeat',
          apiParamNames: ['openCollector', 'beat', 'stream']
        },
        {
          uid: 'b0f41342-c758-4453-8381-9be346f25dfe',
          name: this.$t('Re-import JQ Pipeline into OpenCollector'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/oc/ImportPipelineForBeat',
          apiParamNames: ['openCollector', 'beat', 'stream']
        },
        {
          uid: '3d0ef0a5-0c65-4b62-a68a-e1422490ffef',
          name: this.$t('Modify MPE Sub-Rule(s)'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateMpeSubRule',
          apiParamNames: ['uid', 'SubRuleUid', 'SubRuleName', 'Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5']
        },
        {
          uid: '32d0bf3c-9e09-4388-9a68-cec7c8b38529',
          name: this.$t('Modify Processing Policy'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateProcessingPolicy',
          apiParamNames: ['uid', 'name', 'MPEPolicy_Name']
        },
        {
          uid: '72e265cd-9d0d-469c-b1fd-8a319f3971b2',
          name: this.$t('Modify Log Source Virtualisation'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/logrhythmCore/UpdateLogSourceVirtualisationTemplateItem',
          apiParamNames: ['uid', 'name']
        }
      ],
      unDeploySteps: [
        {
          uid: '8276950b-c01b-423e-8ce0-1ed23af6efe4',
          name: this.$t('Delete Beat configuration for Stream'),
          status: 'Not started', // Not started, To skip, Pending, On-going, Completed, Error, Cancelled
          apiEndpoint: '/oc/DeleteStreamConfigurationForBeat',
          apiParamNames: ['openCollector', 'beat', 'stream']
        }
      ]
    }
  },
  computed: {
    ...mapState('mainStore', ['openCollectorBeats', 'loggedInUser', 'collectionShippersOptions', 'collectionMethodTemplates']),
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
      // Steps to build the table:
      // - List of OC
      // - List of OC LS
      // - Merge them by Host identifiers

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
              // Flag if the right Shipper is already installed or if included out-of-the-box with the OpenCollector
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
                deploymentStatus: this.deploymentStatuses.find(ds => ds && ds.openCollectorUid && oc && oc.uid && ls && ls.msgSourceID && ds.msgSourceId === ls.msgSourceID && ds.openCollectorUid === oc.uid),
                unDeployStatus: this.unDeployStatuses.find(ds => ds && ds.openCollectorUid && oc && oc.uid && ls && ls.msgSourceID && ds.msgSourceId === ls.msgSourceID && ds.openCollectorUid === oc.uid),
                alreadyDeployed: this.isAlreadyDeployed(oc, this.pipeline.uid)
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
            hasNecessaryShipper: false // No OpenCollector: no Shipper. Pas de bras: pas de chocolat.
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
            hasNecessaryShipper: this.hasNecessaryShipper(oc),
            alreadyDeployed: this.isAlreadyDeployed(oc, this.pipeline.uid)
          })
        }
      })

      return list
    },
    beatName () {
      return (this.pipeline && this.pipeline.collectionConfig && this.pipeline.collectionConfig.collectionShipper ? this.pipeline.collectionConfig.collectionShipper : '')
    },
    beatConfigForStream () {
      const collectionShipperOption = this.collectionShippersOptions.find(cso => cso.value && cso.value === this.beatName)

      return (
        this.pipeline && this.pipeline.collectionConfig && this.pipeline.collectionConfig.collectionShipper && collectionShipperOption
          ? this.collectionConfigOutputFor(collectionShipperOption.outputFormat, this.pipeline.collectionConfig)
          : ''
      )
    },
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('Pipelines'),
          link: '/Pipelines'
        },
        {
          title: (this.pipeline && this.pipeline.name && this.pipeline.name.length ? this.pipeline.name : '...'),
          icon: null,
          link: `/Pipelines/${this.pipelineUid}/Properties`,
          disabled: !(this.pipelineUid && this.pipelineUid.length)
        },
        {
          title: this.$t('Properties'),
          link: `/Pipelines/${this.pipelineUid}/Properties`,
          disabled: !(this.pipelineUid && this.pipelineUid.length)
        },
        {
          title: this.$tc('Edit Deployment | Edit Deployment: {pipelineName} | Edit Deployment: {pipelineName}', 0)
        }
      ]
    }
  },

  methods: {
    ...mapActions('mainStore', ['getOpenCollectorLogSources', 'callDeploymentStepApi', 'upsertOpenCollector']),
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
    selectOpenCollectorForDeployment (selectedRow) {
      // Called when user click on the (+) button in the Action column to Deploy the Pipeline to this OC and map to the Log Source (defined on the line clicked on)
      const isDeployment = true // 👉 True: it's a deployment. 👈 Flase: it's un Un-Deploy.
      this.kickOffDeployment(selectedRow, this.deploymentStepsNewLogSource, this.deploymentStatuses, isDeployment)
    }, // selectOpenCollectorForDeployment
    selectOpenCollectorForUndeploy (selectedRow) {
      // Called when user click on the (-) button in the Action column to Un-Deploy the Shipper configuration for this Stream (defined on the line clicked on)
      const isDeployment = false // True: it's a deployment. 👉 Flase: it's un Un-Deploy. 👈
      this.kickOffDeployment(selectedRow, this.unDeploySteps, this.unDeployStatuses, isDeployment)
    }, // selectOpenCollectorForUndeploy
    kickOffDeployment (selectedRow, deploymentSteps, deploymentStatuses, isDeployment) {
      // Will kick off a Deployement or Un-Deploy action, depending on parameters
      if (
        selectedRow &&
        selectedRow.openCollector &&
        selectedRow.openCollector.uid &&
        selectedRow.openCollector.uid.length &&
        selectedRow.msgSourceId
      ) {
        const deploymentStatus = deploymentStatuses.find(
          ds =>
            ds.openCollectorUid === selectedRow.openCollector.uid &&
            ds.msgSourceId === selectedRow.msgSourceId
        )
        if (deploymentStatus) {
          deploymentStatus.ongoing = true
          deploymentStatus.completed = false
          deploymentStatus.isDeployment = isDeployment // True: it's a deployment. Flase: it's un Un-Deploy.
          deploymentStatuses = JSON.parse(JSON.stringify(deploymentStatuses))
        } else {
          const skipDeploymentStepsFromTemplate = (this.collectionMethodTemplates
            .find(template => template.collectionMethod === this.pipeline.collectionConfig.collectionMethod) || {})
            .skipDeploymentSteps || []
          const actualDeploymentSteps = deploymentSteps.filter((step) => !skipDeploymentStepsFromTemplate.includes(step.uid))

          deploymentStatuses.push(
            {
              openCollectorUid: selectedRow.openCollector.uid,
              msgSourceId: selectedRow.msgSourceId,
              ongoing: true,
              completed: false,
              isDeployment: isDeployment, // True: it's a deployment. Flase: it's un Un-Deploy.
              logs: [],
              steps: JSON.parse(JSON.stringify(actualDeploymentSteps))
            }
          )
        }
        // Run the first step
        setTimeout(this.runDeploymentStep, 500, this, deploymentStatuses, selectedRow, 0)
      }
    }, // kickOffDeployment
    deploymentProgressFor (selectedRow, deploymentStatus) {
      // Calculate the percentage of steps that are set to Completed for the deploymentStatus a given Row
      const dividedBy = (
        selectedRow && selectedRow[deploymentStatus] && selectedRow[deploymentStatus].steps && selectedRow[deploymentStatus].steps.length
          ? selectedRow[deploymentStatus].steps.length
          : 1
      )

      const completedAbsolute = (
        selectedRow && selectedRow[deploymentStatus] && selectedRow[deploymentStatus].steps && selectedRow[deploymentStatus].steps.length
          ? selectedRow[deploymentStatus].steps.filter(
            s => s.status &&
            s.status.length &&
            s.status.toLowerCase() === 'completed'
          ).length
          : 0
      )
      const completed = completedAbsolute / dividedBy * 100

      const skippedAbsolute = (
        selectedRow && selectedRow[deploymentStatus] && selectedRow[deploymentStatus].steps && selectedRow[deploymentStatus].steps.length
          ? selectedRow[deploymentStatus].steps.filter(
            s => s.status &&
            s.status.length &&
            s.status.toLowerCase() === 'skipped'
          ).length
          : 0
      )
      const skipped = skippedAbsolute / dividedBy * 100

      const errorAbsolute = (
        selectedRow && selectedRow[deploymentStatus] && selectedRow[deploymentStatus].steps && selectedRow[deploymentStatus].steps.length
          ? selectedRow[deploymentStatus].steps.filter(
            s => s.status &&
            s.status.length &&
            s.status.toLowerCase() === 'error'
          ).length
          : 0
      )
      const error = errorAbsolute / dividedBy * 100

      return {
        done: (completed + skipped),
        completed,
        skipped,
        error,
        completedAbsolute,
        skippedAbsolute,
        errorAbsolute
      }
    }, // deploymentProgressFor
    hasNecessaryShipper (oc) {
      // Prep a lower case Shipper name
      const neededShipperLowerCase = (
        this.pipeline &&
        this.pipeline.collectionConfig &&
        this.pipeline.collectionConfig.collectionShipper &&
        this.pipeline.collectionConfig.collectionShipper.length
          ? this.pipeline.collectionConfig.collectionShipper.toLowerCase()
          : null
      )

      return !!(( // Is this Shipper in the list of the Installed Shipper for this OpenCollector
        oc &&
        oc.installedShippers &&
        Array.isArray(oc.installedShippers) &&
        oc.installedShippers.filter((shipper) => shipper.name && shipper.name.toLowerCase() === neededShipperLowerCase).length
      ) | ( // Or is is part of the out-of-the-box OpenCollector Beats
        this.openCollectorBeats.filter((beat) => beat.value && beat.value.toLowerCase() === neededShipperLowerCase).length
      ))
    }, // hasNecessaryShipper
    runDeploymentStep (caller, deploymentStatuses, selectedRow, stepNumber) {
      // - Process of onboarding a LS (Beat Config, JQ Pipeline and SIEM LogSource)
      //   - New Log Source
      //     - Drop Beat configuration in right location
      //     - Import JQ to OC
      //     - Create LS Type
      //     - Create MPE Rule
      //     - Create MPE Sub-Rule(s)
      //       - Based on Field Mapping / Sub Rules ID
      //     - Create Processing Policy
      //     - Create LS Virtualisation
      //     - Create new LS Virtualisation Item and associate it to LS Virtualisation
      //     - Search related OpenCollector LS
      //     - Add LS Virtualisation to OpenCollector LS
      //   - Exisiting Log Source / Update of field mapping
      //     - Update Beat configuration in right location
      //     - Re-import JQ to OC
      //     - Modify MPE Sub-Rule(s)
      //     - Modify Processing Policy
      //     - Modify LS Virtualisation Item
      // - Process for un-deploying a LS on OC
      //   - Delete Beat configuration from OC

      if (
        selectedRow &&
        selectedRow.openCollector &&
        selectedRow.openCollector.uid &&
        selectedRow.openCollector.uid.length &&
        selectedRow.msgSourceId
      ) {
        const deploymentStatus = deploymentStatuses.find(
          ds =>
            ds.openCollectorUid === selectedRow.openCollector.uid &&
            ds.msgSourceId === selectedRow.msgSourceId
        )
        if (deploymentStatus && deploymentStatus.steps && deploymentStatus.steps.length > stepNumber) {
          const step = deploymentStatus.steps[stepNumber]

          // Check if we need to Skip this step or execute it
          let skipStep = false
          skipStep = skipStep | (step.status && step.status === 'To skip')

          if (skipStep) {
            step.status = 'Skipped'
            setTimeout(caller.runDeploymentStep, 150, caller, deploymentStatuses, selectedRow, stepNumber + 1)
          } else {
            // Do the work for this step
            step.status = 'On-going'

            // Prepare the parameters
            const apiUrl = (step.apiEndpoint && step.apiEndpoint.length ? step.apiEndpoint : '/test/doesNotExist/andShouldReturnAnError')
            const apiCallParamsSource = {
              uid: (caller && caller.pipeline && caller.pipeline.uid && caller.pipeline.uid.length ? caller.pipeline.uid : undefined),
              name: (caller && caller.pipeline && caller.pipeline.name && caller.pipeline.name.length ? caller.pipeline.name : undefined),
              // SubRuleUid: '{{ls_sub_rule_uid}}_',  // NOT IMPLEMENTING THIS FOR NOW, see Step UID 04ff4e8c-de73-419a-a48b-944b01bca836
              // SubRuleName: '{{ls_sub_rule_name}}_',  // NOT IMPLEMENTING THIS FOR NOW, see Step UID 04ff4e8c-de73-419a-a48b-944b01bca836
              // Tag1: '{{ls_sub_rule_tag1}}',  // NOT IMPLEMENTING THIS FOR NOW, see Step UID 04ff4e8c-de73-419a-a48b-944b01bca836
              MPEPolicy_Name: 'LogRhythm Default',
              OpenCollectorMotherLogSourceID: deploymentStatus.msgSourceId,
              openCollector: {
                uid: (deploymentStatus.openCollectorUid && deploymentStatus.openCollectorUid.length ? deploymentStatus.openCollectorUid : undefined)
              },
              beat: {
                name: caller.beatName,
                config: [ // API expect an array of configuration files' content, but we so far only have one to provide
                  this.beatConfigForStream
                ],
                sourceJsonConfig: (this.pipeline && this.pipeline.collectionConfig ? this.pipeline.collectionConfig : {})
              },
              stream: {
                uid: (caller && caller.pipeline && caller.pipeline.uid && caller.pipeline.uid.length ? caller.pipeline.uid : undefined),
                name: (caller && caller.pipeline && caller.pipeline.name && caller.pipeline.name.length ? caller.pipeline.name : undefined),
                sanitisedName: (caller && caller.pipeline && caller.pipeline.name && caller.pipeline.name.length ? caller.pipeline.name.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase() : undefined),
                jqFilter: (
                  caller && caller.pipeline && caller.pipeline.uid && caller.pipeline.uid.length &&
                  caller.pipeline.name && caller.pipeline.name.length &&
                  caller.beatName && caller.beatName.length &&
                  caller.loggedInUser && caller.loggedInUser.length
                    ? this.buildJqFilterFromParams(caller.pipeline.uid, caller.pipeline.name, caller.beatName, caller.loggedInUser)
                    : undefined
                ),
                jqTransform: (
                  caller && caller.pipeline && caller.pipeline.uid && caller.pipeline.uid.length &&
                  caller.pipeline.name && caller.pipeline.name.length &&
                  caller.beatName && caller.beatName.length &&
                  caller.loggedInUser && caller.loggedInUser.length // &&
                  // caller.pipeline.fieldsMapping
                    // ? this.buildJqTransformFromParams(caller.pipeline.uid, caller.pipeline.name, caller.beatName, caller.loggedInUser, false /* Hardcoding extractMessageFieldOnly */, (caller.pipeline.fieldsMapping || []))
                    ? this.buildJqTransformFromParams(caller.pipeline.uid, caller.pipeline.name, caller.beatName, caller.loggedInUser, (caller.pipeline.options && caller.pipeline.options.extractMessageFieldOnly === true), (caller.pipeline.fieldsMapping || []))
                    : undefined
                )
              }
            }

            const apiCallParams = (
              step.apiParamNames &&
              step.apiParamNames.length
                ? step.apiParamNames.reduce((paramsObject, param) => {
                  paramsObject[param] = (apiCallParamsSource && apiCallParamsSource[param] ? apiCallParamsSource[param] : undefined)
                  return paramsObject
                }, {})
                : undefined
            )

            // Call the API
            caller.callDeploymentStepApi({
              apiUrl,
              caller: caller,
              apiCallParams,
              dataLabel: `Step name: ${step.name}`,
              onSuccessCallBack: (
                apiCallResult, // Param passed to onErrorCallBack by postDataToSite()
                step_ = step,
                selectedRow_ = selectedRow,
                stepNumber_ = stepNumber,
                caller_ = caller,
                deploymentStatuses_ = deploymentStatuses
              ) => {
                // Flag the step as Completed, and run the next step
                setTimeout(
                  () => {
                    step_.status = 'Completed'
                    caller_.runDeploymentStep(caller_, deploymentStatuses_, selectedRow_, stepNumber_ + 1)
                  },
                  // Run next step in 100 ms + up to 600 ms delay
                  100 + Math.floor(Math.random() * 600) // Add temporisation and randomisation to avoid blasting the API server off
                )
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

                // Mark as Cancelled all the steps that were still waiting to run
                if (deploymentStatus_ && deploymentStatus_.steps && Array.isArray(deploymentStatus_.steps)) {
                  deploymentStatus_.steps.filter(
                    s => s.status && (s.status.toLowerCase() === 'not started' || s.status.toLowerCase() === 'to skip')
                  ).forEach(s => { s.status = 'Cancelled' })
                }
              },
              debug: false
            })
          } // else - if (step.status && step.status === 'To skip')
        } else {
          // We have run out of Steps. Job done.
          deploymentStatus.ongoing = false
          deploymentStatus.completed = true
          console.log('🏁 We have run out of Steps. Job done.')
          if (deploymentStatus.completed === true && !(deploymentStatus.error === true)) {
            console.log('💾 Saving Deployment.')
            setTimeout(
              () => {
                caller.updateAndPersistDeployment(selectedRow, deploymentStatus.isDeployment)
              },
              // Run next step in 100 ms + up to 250 ms delay
              100 + Math.floor(Math.random() * 250) // Add temporisation and randomisation to avoid blasting the API server off
            )
          }
        }
      }
    },
    updateAndPersistDeployment (selectedRow, enabled = true) {
      if (
        selectedRow &&
        selectedRow.openCollector &&
        selectedRow.openCollector.uid &&
        selectedRow.openCollector.uid.length &&
        selectedRow.pipelineUid &&
        selectedRow.pipelineUid.length
      ) {
        const openCollector = JSON.parse(JSON.stringify(this.openCollectors.find(oc => oc.uid === selectedRow.openCollector.uid)))
        if (openCollector && openCollector.uid && openCollector.uid.length) {
          // Make sure we have a pipelines array under openCollector
          if (!openCollector.pipelines) {
            openCollector.pipelines = []
          }

          // Go through existing deployments of this Stream on this OC, and change their Enabled status
          let haveWeChangedAny = false
          openCollector.pipelines
            .filter(p => p.uid === selectedRow.pipelineUid)
            .forEach(p => {
              p.enabled = enabled
              haveWeChangedAny = true
            })

          // In case none were found and changed, just add one
          if (!haveWeChangedAny) {
            // Add this deployment to this OC
            openCollector.pipelines.push({
              enabled,
              uid: selectedRow.pipelineUid
            })
          }
          // And persist
          this.upsertOpenCollector({
            openCollector,
            pushToApi: true,
            caller: this
          })
        }
      }
    },
    isAlreadyDeployed (oc, pipelineUid) {
      // Returns TRUE if this Stream has already been deployed on this OpenCollector
      if (oc && oc.pipelines && Array.isArray(oc.pipelines) && pipelineUid && pipelineUid.length) {
        return !!(oc.pipelines.filter(p => (p.enabled === true) && p.uid === pipelineUid).length > 0)
      } else {
        return false
      }
    }
  },

  mounted () {
    // Load the OpenCollector Log Sources from the XM/PM database
    if (this.openCollectorLogSources.length === 0) {
      this.loadOpenCollectorLogSources()
    }

    // Get the Pipeline UID from teh Route
    if (this.$route.params.pipelineUid && this.$route.params.pipelineUid.length) {
      if (this.pipelineUid !== this.$route.params.pipelineUid) {
        this.pipelineUid = this.$route.params.pipelineUid
      }
    }

    // Get the OpenCollector UID from the Route
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
