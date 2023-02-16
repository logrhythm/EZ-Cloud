<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" :src="(darkMode ? 'logrhythm_logo_darkmode_wide.svg' : 'logrhythm_logo_lightmode_wide.svg')" alt="LogRhythm Open Collector">
        <q-btn v-if="isLiveStatisticsRunning" flat no-caps color="secondary" icon="stop" :label="$t('Stop Live Statistics')" @click="stopLiveStatisitics()" />
        <q-btn v-else flat no-caps color="primary" icon="play_circle_outline" :label="$t('Start Live Statistics')" @click="startLiveStatisitics()" />
      </q-toolbar>
    </q-header>
    <BreadCrumbs
      :crumbs="breadCrumbs"
      :pageTitle="(openCollector && openCollector.name && openCollector.name.length ? openCollector.name : '...')"
    />
    <div class=" q-gutter-y-sm">
      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section>
              <q-expansion-item
              >
                <template v-slot:header>
                  <div class="text-overline text-uppercase text-bold">
                    {{ $t('Basic Information') }}
                  </div>
                </template>
                <div class="q-gutter-y-sm">
                  <div>
                    <div class="text-bold">
                      {{ $t('Host Name') }}
                    </div>
                    <div>
                      {{ openCollector ? openCollector.hostname : '...' }}
                    </div>
                  </div>
                  <div>
                    <div class="text-bold">
                      {{ $t('Host Version') }}
                    </div>
                    <div>
                      {{ $t('Linux - {osVersion}', { osVersion: (openCollector ? openCollector.osVersion : '...')}) }}
                    </div>
                    <div>
                      {{ $t('Docker - {dockerVersion}', { dockerVersion: (openCollector ? openCollector.dockerVersion : '...')}) }}
                    </div>
                  </div>
                  <div>
                    <div class="text-bold">
                      {{ $t('OpenCollector Version') }}
                    </div>
                    <div>
                      {{ openCollector ? openCollector.ocVersion : '...' }}
                    </div>
                    <div>
                    </div>
                  </div>
                </div>
              </q-expansion-item>
            </q-card-section>
          </q-card-section>
        </q-card-section>
      </q-card>

      <q-table
        :data="tableData"
        :columns="columns"
        row-key="uid"
        dense
        :no-data-label="$t('No Container to display.')"
        :filter="searchFilter"
        :loading="dataLoading"
        :rows-per-page-label="$t('Containers per page:')"
        :pagination.sync="pagination"
      >
        <template v-slot:top>
          <div class="full-width row wrap justify-between">
            <div class="col row justify-start">
              <q-slider
                class="full-width q-px-xl"
                :class="liveStatisticsStageSliderVisibilityStateClass"
                v-model="liveStatisticsStage"
                dense
                track-size="12px"
                thumb-size="20px"
                marker-labels-class="text-grey"
                markers
                :marker-labels="stageMarkerLabels"
                :label-always="(liveStatisticsStage > 0) && (liveStatisticsStage < 3)"
                :label-value="stageLabels[liveStatisticsStage]"
                :min="0"
                :max="3"
                readonly
              />
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
            </div>
          </div>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense icon="more_horiz">
              <!-- <q-menu anchor="bottom right" self="top right"> -->
              <q-menu>
                <q-list style="min-width: 100px">
                  <q-item clickable v-close-popup
                    @click="doStartContainer(props.row)"
                    :disable="(props.row && props.row.pids && props.row.pids.instant !== 0) || !!props.row.actionInProgress"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_play_arrow" />
                    </q-item-section>
                    <q-item-section>{{ $t('Start Container') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doStopContainer(props.row)"
                    :disable="!!props.row.actionInProgress"
                  >
                  <!-- Allowing to stop containers that show as Stopped already. -->
                  <!-- As the "Stopped" status is derived from the number of PIDs, -->
                  <!-- and that a container that is stuck in "Restarting" mode will have zero, thus wrongly showing as "Stopped". -->
                    <q-item-section avatar>
                      <q-icon name="o_stop" />
                    </q-item-section>
                    <q-item-section>{{ $t('Stop Container') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doRestartContainer(props.row)"
                    :disable="!(props.row && props.row.pids && props.row.pids.instant !== 0) || !!props.row.actionInProgress"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_restart_alt" />
                    </q-item-section>
                    <q-item-section>{{ $t('Restart Container') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup
                    @click="doExportContainerConfigurationToFile(props.row)"
                    :disable="!(props.row && props.row.logRhythmContainerWithConfig)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_file_download" />
                    </q-item-section>
                    <q-item-section>{{ $t('Export Configuration to File') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doImportContainerConfigurationFromFile(props.row)"
                    :disable="!(props.row && props.row.logRhythmContainerWithConfig)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_file_upload" />
                    </q-item-section>
                    <q-item-section>{{ $t('Import Configuration from File') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doViewContainerConfguration(props.row)"
                    :disable="!(props.row && props.row.logRhythmContainerWithConfig)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_source" />
                    </q-item-section>
                    <q-item-section>{{ $t('View Short Configuration') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup
                    @click="doExportContainerLogsToFile(props.row)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_file_download" />
                    </q-item-section>
                    <q-item-section>{{ $t('Export Logs to File') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doViewRealTimeContainerLogs(props.row)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_text_snippet" />
                    </q-item-section>
                    <q-item-section>{{ $t('View Real Time Logs') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-btn
              flat
              dense
              :icon="(props.row && props.row.pids && props.row.pids.instant !== 0 ? 'o_stop' : 'o_play_arrow')"
              @click="doStartStopContainer(props.row)"
              :loading="!!props.row.actionInProgress"
            >
              <q-tooltip content-style="font-size: 1em">
                {{ $t((props.row && props.row.pids && props.row.pids.instant !== 0 ? 'Stop Container' : 'Start Container')) }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge rounded color="green" :label="$t('Running')" v-if="props.value === true" />
            <q-badge rounded color="red" :label="$t('Stopped')" v-else-if="props.value === false" />
            <q-badge rounded color="grey" :label="$t('Unknown')" v-else />
          </q-td>
        </template>
      </q-table>

    </div>

    <q-dialog
      v-model="showContainerLog"
      persistent
      full-width
      :maximized="showContainerLogMaximised"
    >
      <q-card class="column">
        <q-card-section class="row justify-between q-pb-none">
          <div class="text-h6 col-auto">{{ $t('Container Logs') }}</div>
          <q-slider
            class="col q-px-xl"
            :class="liveContainerLogsStageSliderVisibilityStateClass"
            v-model="liveContainerLogsStage"
            dense
            track-size="12px"
            thumb-size="20px"
            marker-labels-class="text-grey"
            markers
            :marker-labels="stageMarkerLabels"
            :label-always="(liveContainerLogsStage > 0) && (liveContainerLogsStage < 3)"
            :label-value="stageLabels[liveContainerLogsStage]"
            :min="0"
            :max="3"
            readonly
            switch-label-side
            switch-marker-labels-side
          />
          <div class="col-auto q-gutter-x-sm">
            <!-- <q-btn dense flat :icon="(showContainerLogMaximised ? 'fullscreen_exit' : 'fullscreen')" color="grey-5" @click="showContainerLogMaximised = !showContainerLogMaximised" /> -->
            <q-btn dense flat icon="close" color="grey-5" @click="closeRealTimeContainerLogs()" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="col self-stretch" style="height: 300px">
          <q-input
            v-model="containerLogs"
            ref="containerLogsField"
            type="textarea"
            outlined
            readonly
            input-class="fixed-font-console"
            class="fixed-font full-height"
            rows="25"
          >
            <!-- :input-style="containerLogsFieldInputStyle" -->
            <!-- :input-style="{resize: 'none', height: '400px', '-webkit-box-sizing': 'border-box', '-moz-box-sizing': 'border-box', 'box-sizing': 'border-box'}" -->
            <!-- input-style="height: 100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing:border-box;" -->
            <!-- style="min-height: 10rem; height: 100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing:border-box;" -->
            <!-- rows="21" -->
            <template v-slot:after>
              <div class="column full-height">
                <div class="column q-gutter-y-lg">
                  <q-btn round dense flat icon="content_copy" @click="copyToClipboard(containerLogs)" :disable="!containerLogs || (containerLogs && containerLogs.length === 0)">
                    <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                      {{ $t('Copy to Clipboad') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn round dense flat icon="o_download" @click="downloadContainerLogsAsFileFromLiveLogs(containerLogs)" :disable="!containerLogs || (containerLogs && containerLogs.length === 0)">
                    <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                      {{ $t('Download to file') }}
                    </q-tooltip>
                  </q-btn>
                  <q-separator />
                  <q-btn round dense flat icon="clear" @click="clearContainerLog()" color="red" :disable="!containerLogs || (containerLogs && containerLogs.length === 0)">
                    <q-tooltip content-style="font-size: 1rem; min-width: 10rem;" v-if="containerLogs && containerLogs.length">
                      {{ $t('Clear') }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="showConfigurationViewer"
      persistent
      full-width
    >
      <q-card class="column">
        <q-card-section class="row justify-between">
          <div class="text-h6 col-auto">{{ $t('Container Short Configuration') }}</div>
          <div class="col-auto q-gutter-x-sm">
            <q-btn dense flat icon="close" color="grey-5" @click="showConfigurationViewer = false" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="col self-stretch" style="height: 300px">
          <q-input
            v-model="configurationToView"
            type="textarea"
            outlined
            readonly
            input-class="fixed-font-console"
            class="fixed-font full-height"
            rows="25"
            :loading="loadingConfigurationToView"
          >
            <template v-slot:after>
              <div class="column full-height">
                <div class="column q-gutter-y-lg">
                  <q-btn round dense flat icon="content_copy" @click="copyToClipboard(configurationToView)" :disable="!configurationToView || (configurationToView && configurationToView.length === 0)">
                    <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                      {{ $t('Copy to Clipboad') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn round dense flat icon="o_download" @click="downloadConfigurationToViewAsFileFromViewer(configurationToView)" :disable="!configurationToView || (configurationToView && configurationToView.length === 0)">
                    <q-tooltip content-style="font-size: 1rem; min-width: 10rem;">
                      {{ $t('Download to file') }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </template>
          </q-input>
        </q-card-section>
        <!-- <q-inner-loading :showing="loadingConfigurationToView">
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading> -->
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import BreadCrumbs from 'components/BreadCrumbs.vue'
import { dom, copyToClipboard, exportFile } from 'quasar'
const { height } = dom

export default {
  name: 'PageOpenCollectorManage',
  mixins: [
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedSocket // Shared function and state to access the Socket.io
  ],
  components: { BreadCrumbs },
  data () {
    return {
      openCollectorUid: '',
      isLiveStatisticsRunning: false,
      containersListRaw: [ // Raw array storing the result of: docker stats -a --no-trunc --format "{{ json . }}"
      ],
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: this.$t('Actions'), field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: this.$t('Status'), field: row => row.pids.instant > 0, sortable: true },
        { name: 'name', align: 'center', label: this.$t('Name'), field: 'name', sortable: true },
        { name: 'cpuPercent', align: 'center', label: this.$t('CPU'), field: 'cpuPercent', sortable: true },
        { name: 'memUsage', align: 'center', label: this.$t('Memory Usage / Limit'), field: row => row.memUsage.instant, sortable: true },
        { name: 'memoryPercent', align: 'center', label: this.$t('Memory Percentage'), field: 'memoryPercent', sortable: true },
        { name: 'netIO', align: 'center', label: this.$t('Net I/O'), field: row => row.netIO.received.instant, sortable: true },
        { name: 'blockIO', align: 'center', label: this.$t('Block I/O'), field: row => row.blockIO.written.instant, sortable: true },
        { name: 'pids', align: 'center', label: this.$t('Processes'), field: row => row.pids.instant, sortable: true },
        { name: 'containerId', align: 'center', label: this.$t('Container ID'), field: 'containerId', sortable: true }
      ],
      pagination: {
        sortBy: 'name',
        descending: false,
        rowsPerPage: 25
      },
      liveStatisticsStage: 0, // Stage of the connection to the host
      stageMarkerLabels: {
        0: 'Idle',
        1: 'Started',
        2: 'Connected',
        3: 'Receiving'
      },
      stageLabels: {
        0: 'Stopped',
        1: 'Connecting to host...',
        2: 'Waiting for data...',
        3: 'Receiving Real Time Data'
      },
      liveStatisticsStageSliderVisibilityStateClass: '', // Class for the Statistics Stage slider
      showContainerLog: false, // Toggle the Container Logs modal dialog
      showContainerLogMaximised: false, // Toggle full screen mode of the Container Logs modal dialog
      containerLogs: '', // Real time logs from the container
      activeContainerIdLogs: '', // Docker ID of the container being logged right now
      activeContainerNameLogs: '', // Docker name of the container being logged right now
      alwaysScrollToBottom: true, // Shall we keep scrolling to the bottom of the Container Logs
      liveContainerLogsStage: 0, // Stage of the connection to the host
      liveContainerLogsStageSliderVisibilityStateClass: '', // Class for the Container Logs Stage slider
      actionInProgressOnContainers: [], // Array of Docker IDs that are seeing an action in progress (Start, Stop, etc...)
      loadingConfigurationToView: false, // Are we still loading the container's config?
      configurationToView: '', // Content of the Container configuration
      showConfigurationViewer: false, // Toggle to show the Configuration viewer Dialog
      activeContainerIdConfig: '', // Docker ID of the container being shown the config of right now
      activeContainerNameConfig: '' // Docker name of the container being shown the config of right now
    }
  },
  computed: {
    ...mapState('mainStore', ['logRhythmContainersWithConfig']),
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('OpenCollectors'),
          link: '/OpenCollectors'
        },
        {
          title: (this.openCollector && this.openCollector.name && this.openCollector.name.length ? this.openCollector.name : this.openCollectorUid)
        },
        {
          title: this.$t('Manage')
        }
      ]
    },
    openCollector () {
      const openCollector = this.openCollectors.find(p => p.uid === this.openCollectorUid)
      return (openCollector || {
        uid: '',
        name: '',
        hostname: '',
        port: null,
        authenticationMethod: '',
        username: '',
        password: '',
        privateKey: '',
        osVersion: '',
        dockerVersion: '',
        ocInstalled: false,
        ocVersion: '',
        installedShippers: [],
        pipelines: []
      })
    },
    tableData () {
      const list = []

      // containersListRaw is an array of items like:
      // { BlockIO: '3.62GB / 72.5MB', CPUPerc: '9.36%', Container: '280810e0bf6c', ID: '280810e0bf6c', MemPerc: '231.51%', MemUsage: '4.373GiB / 1.889GiB', Name: 'oc-admin', NetIO: '11MB / 3.35MB', PIDs: '4515' },

      if (this.containersListRaw && Array.isArray(this.containersListRaw)) {
        this.containersListRaw.forEach(container => {
          list.push(
            {
              containerId: container.Container,
              name: container.Name,
              cpuPercent: container.CPUPerc,
              memUsage: {
                instant: container.MemUsage,
                past: []
              },
              memLimit: {
                instant: container.MemUsage,
                past: []
              },
              memoryPercent: container.MemPerc,
              netIO: {
                received: {
                  instant: container.NetIO,
                  past: []
                },
                sent: {
                  instant: container.NetIO,
                  past: []
                }
              },
              blockIO: {
                written: {
                  instant: container.BlockIO,
                  past: []
                },
                read: {
                  instant: container.BlockIO,
                  past: []
                }
              },
              pids: {
                instant: Number(container.PIDs),
                past: []
              },
              // Flag if this container is already flagged as being done an action onto
              actionInProgress: !!this.actionInProgressOnContainers[String(container.Container)],
              // Flag if this container is a LogRhythm container with a configuration
              logRhythmContainerWithConfig: !!this.logRhythmContainersWithConfig.filter(lcwc => String(container.Name).trim().startsWith(lcwc)).length
            }
          )
        })
      }
      return list
    },
    containerLogsFieldInputStyle () {
      return {
        height: `${this.containerLogsFieldHeight()}px`,
        '-webkit-box-sizing': 'border-box',
        '-moz-box-sizing': 'border-box',
        'box-sizing': 'border-box'
      }
    }
  },
  methods: {
    ...mapActions('mainStore', ['startContainerOnOpenCollector', 'stopContainerOnOpenCollector', 'getContainerLogs', 'getContainerConfiguration']),
    containerLogsFieldHeight () {
      console.log('containerLogsFieldHeight')
      console.log(JSON.stringify(this.$refs))
      console.log(this.$refs)
      let result = 0
      try {
        console.log(height(this.$refs.containerLogsField.$el))
        result = height(this.$refs.containerLogsField.$el)
      } catch (error) {
        console.log('ERROR - containerLogsFieldHeight - ', error)
      }
      return result
    },
    startLiveStatisitics () {
      if (this.socket && this.socket.connected) {
        this.isLiveStatisticsRunning = true
        this.initStatsTail()
      } else { // No Socket. Tell the user.
        this.isLiveStatisticsRunning = false
        // Pop this to the screen (via MainLayout)
        this.$root.$emit('addAndShowErrorToErrorPanel', {
          data: {
            errors: [
              {
                code: 'NoLiveSocket',
                message: this.$t('Live (Socket) connection with the EZ Server has been lost or is not currently established.')
              },
              {
                code: 'TailFailedToStart',
                message: this.$t('Tail could not start due to no live socket available.')
              }
            ]
          }
        })
      }
    },
    stopLiveStatisitics () {
      this.isLiveStatisticsRunning = false
      if (this.socket && this.socket.connected) {
        this.killStatsTail()
      } else { // No Socket. Tell the user.
        // Pop this to the screen (via MainLayout)
        this.$root.$emit('addAndShowErrorToErrorPanel', {
          data: {
            errors: [
              {
                code: 'NoLiveSocket',
                message: this.$t('Live (Socket) connection with the EZ Server has been lost or is not currently established.')
              },
              {
                code: 'TailFailedToStart',
                message: this.$t('Tail could not start due to no live socket available.')
              }
            ]
          }
        })
      }
    },
    doStartStopContainer (row) {
      if (row && row.pids && row.pids.instant !== 0) {
        // Stop
        this.doStopContainer(row)
      } else {
        // Start
        this.doStartContainer(row)
      }
    },
    doStopContainer (row) {
      if (row) {
        const { containerId } = row
        this.actionInProgressOnContainers[String(containerId)] = true
        this.stopContainerOnOpenCollector(
          {
            caller: this,
            apiCallParams: {
              openCollector: { uid: this.openCollectorUid },
              container: { uid: containerId }
            },
            onSuccessCallBack: this.onContainerActionResponse,
            onErrorCallBack: this.onContainerActionResponse
          }
        )
      }
    },
    doStartContainer (row) {
      if (row) {
        const { containerId } = row
        this.actionInProgressOnContainers[String(containerId)] = true
        this.startContainerOnOpenCollector(
          {
            caller: this,
            apiCallParams: {
              openCollector: { uid: this.openCollectorUid },
              container: { uid: containerId }
            },
            onSuccessCallBack: this.onContainerActionResponse,
            onErrorCallBack: this.onContainerActionResponse
          }
        )
      }
    },
    doRestartContainer (row) {
      if (row) {
        const { containerId } = row
        this.actionInProgressOnContainers[String(containerId)] = true
        this.stopContainerOnOpenCollector(
          {
            caller: this,
            apiCallParams: {
              openCollector: { uid: this.openCollectorUid },
              container: { uid: containerId }
            },
            onSuccessCallBack: this.onContainerActionStopOfRestartSuccess,
            onErrorCallBack: this.onContainerActionResponse
          }
        )
      }
    },
    doExportContainerConfigurationToFile (row) {
      if (row) {
        const { containerId } = row
        this.getContainerConfiguration(
          {
            caller: this,
            apiCallParams: {
              uid: this.openCollectorUid,
              containerId
            },
            onSuccessCallBack: this.onExportContainerConfigurationToFileSuccess
          }
        )
      }
    },
    doImportContainerConfigurationFromFile (row) {
      //
    },
    doViewContainerConfguration (row) {
      if (row) {
        this.configurationToView = ''
        this.showConfigurationViewer = true

        const { containerId, name } = row
        this.activeContainerIdConfig = containerId
        this.activeContainerNameConfig = name

        this.getContainerConfiguration(
          {
            caller: this,
            apiCallParams: {
              uid: this.openCollectorUid,
              containerId,
              short: '' // We only want the short confiuration (not the full export)
            },
            loadingVariableName: 'loadingConfigurationToView',
            targetObjectName: 'configurationToView'
          }
        )
      }
    },
    doExportContainerLogsToFile (row) {
      if (row) {
        const { containerId, name } = row
        this.getContainerLogs(
          {
            caller: this,
            apiCallParams: {
              uid: this.openCollectorUid,
              containerId,
              containerName: name
            },
            onSuccessCallBack: this.onExportContainerLogsToFileSuccess
          }
        )
      }
    },
    doViewRealTimeContainerLogs (row) {
      if (this.socket && this.socket.connected) {
        if (row) {
          const { containerId } = row
          const { name } = row
          if (containerId && containerId.length) {
            this.activeContainerIdLogs = containerId
            this.activeContainerNameLogs = name
            this.clearContainerLog()
            this.showContainerLog = true
            this.initContainerLogsTail(containerId)
          } else {
            console.log('ERROR | ViewRealTimeContainerLogs | No Container was selected')
            this.showNotificationWithActionToLogs('No Container was selected')
          }
        }
      } else { // No Socket. Tell the user.
        this.showContainerLog = false
        // Pop this to the screen (via MainLayout)
        this.$root.$emit('addAndShowErrorToErrorPanel', {
          data: {
            errors: [
              {
                code: 'NoLiveSocket',
                message: this.$t('Live (Socket) connection with the EZ Server has been lost or is not currently established.')
              },
              {
                code: 'TailFailedToStart',
                message: this.$t('Tail could not start due to no live socket available.')
              }
            ]
          }
        })
      }
    },
    closeRealTimeContainerLogs () {
      this.showContainerLog = false
      this.killContainerLogsTail(this.activeContainerIdLogs || '')
      this.activeContainerIdLogs = ''
      this.activeContainerNameLogs = ''
    },
    onContainerActionResponse (payload) {
      if (
        payload &&
        payload.params &&
        payload.params.apiCallParams &&
        payload.params.apiCallParams.container &&
        payload.params.apiCallParams.container.uid &&
        payload.params.apiCallParams.container.uid.length
      ) {
        this.actionInProgressOnContainers[String(payload.params.apiCallParams.container.uid)] = false
      }
    },
    onContainerActionStopOfRestartSuccess (payload) {
      if (
        payload &&
        payload.params &&
        payload.params.apiCallParams &&
        payload.params.apiCallParams.container &&
        payload.params.apiCallParams.container.uid &&
        payload.params.apiCallParams.container.uid.length
      ) {
        this.doStartContainer({ containerId: payload.params.apiCallParams.container.uid })
      }
    },
    onExportContainerLogsToFileSuccess (payload) {
      if (
        payload &&
        payload.data &&
        payload.data.payload &&
        payload.params &&
        payload.params.apiCallParams &&
        payload.params.apiCallParams.containerId && // Docker container ID
        payload.params.apiCallParams.containerId.length &&
        payload.params.apiCallParams.containerName && // Docker container Name
        payload.params.apiCallParams.containerName.length
      ) {
        this.downloadContainerLogsAsFile(
          {
            container: {
              id: payload.params.apiCallParams.containerId || '',
              name: payload.params.apiCallParams.containerName || ''
            },
            value: payload.data.payload
          }
        )
      }
    },
    onExportContainerConfigurationToFileSuccess (payload) {
      if (
        payload &&
        payload.data &&
        payload.data.payload &&
        payload.data.outputs &&
        Array.isArray(payload.data.outputs) &&
        payload.data.outputs.length && // Needed to get the name of the Container
        payload.params &&
        payload.params.apiCallParams &&
        payload.params.apiCallParams.containerId && // Docker container ID
        payload.params.apiCallParams.containerId.length
      ) {
        this.downloadContainerConfigAsFile(
          {
            container: {
              id: payload.params.apiCallParams.containerId || '',
              name: payload.data.outputs[0] || ''
            },
            value: payload.data.payload
          }
        )
      }
    },
    initStatsTail () {
      if (this.socket && this.socket.connected) {
        this.socket.emit('statsTail.init', { openCollectorUid: this.openCollectorUid })
      }
    },
    killStatsTail () {
      if (this.socket && this.socket.connected) {
        this.socket.emit('statsTail.kill', { openCollectorUid: this.openCollectorUid })
      }
    },
    initContainerLogsTail (containerId = '') {
      if (this.socket && this.socket.connected) {
        this.socket.emit('containerLogsTail.init', { openCollectorUid: this.openCollectorUid, containerId })
      }
    },
    killContainerLogsTail (containerId = '') {
      if (this.socket && this.socket.connected) {
        this.socket.emit('containerLogsTail.kill', { openCollectorUid: this.openCollectorUid, containerId })
      }
    },
    scrollToBottom (logFieldName) {
      try {
        // console.log(height(this.$refs[logFieldName || 'containerLogsField'].$el))
        // console.log(this.$refs[logFieldName || 'containerLogsField'])
        const logField = this.$refs[logFieldName || 'containerLogsField'].$refs.input
        logField.scrollTop = logField.scrollHeight
      } catch (error) {
        console.log('ERROR - scrollToBottom - ', error)
      }
    },
    handleSocketOnStatsTailLog (payload) {
      if (
        payload &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        // If we are getting data from the remote job, breack it in multiple lines (if \n is found in it) and push it in the queueIn
        if (
          payload.code === 'STDOUT' &&
          payload.payload
        ) {
          // const cleanPayload = String(payload.payload).replace('\u001b[2J\u001b[H', '') || ''
          const cleanPayload = String(payload.payload).replace(/^[^{]*/, '') || ''
          if (cleanPayload.includes('{')) {
            try {
              this.containersListRaw = JSON.parse(`[${
                cleanPayload
                // eslint-disable-next-line quotes
                  .split("\n")
                  .filter((line) => String(line)
                  .includes('{'))
                  .join(',')}]`)
                .filter(line => line.PIDs !== '--') // Filter out the dead entries that Docker Stats seems to give once the container has died
            } catch (error) {
              console.log('ERROR', error)
            }
          }
        }

        // If we are getting STDERR data from the remote job, breack it in multiple lines (if \n is found in it) and log it
        if (
          payload.code === 'STDERR'
        ) {
          if (typeof payload.payload === 'string') {
            // eslint-disable-next-line quotes
            payload.payload.split("\n").forEach(lr => {
              this.addLineToCommunicationLog(`${payload.code} | ${lr || ''}`)
            })
          } else {
            console.log(payload.payload)
          }
        }

        // If we are getting STAGE data from the remote job, use it to track the stage progression
        if (
          payload.code === 'STAGE'
        ) {
          if (typeof payload.payload === 'string') {
            // Update the Stage
            let newStage = null
            try {
              newStage = {
                Stopped: 0,
                'Container Stats Tail Ended': 0,
                'Container Stats Tail Started': 1,
                'Connected to host': 2,
                'Receiving Real Time Data': 3
              }[payload.payload] || 0
            } catch (error) {
              console.log('STAGE | Unknown Stage. Error:', error)
            }

            if (newStage !== null && this.liveStatisticsStage !== newStage) {
              if (
                this.liveStatisticsStage < newStage &&
                newStage === 3
              ) {
                // We are progressing to Receiving from a lower stage
                // Fade the status slidder away slowly
                this.liveStatisticsStageSliderVisibilityStateClass = 'fadeOutOnce'
              } else if (
                // We are getting to a different stage, but the slidder was hidden
                // Fade the status slidder back in quickly
                this.liveStatisticsStage !== newStage &&
                this.liveStatisticsStageSliderVisibilityStateClass === 'fadeOutOnce'
              ) {
                this.liveStatisticsStageSliderVisibilityStateClass = 'fadeInOnce'
              }
              // Update the liveStatisticsStage
              this.liveStatisticsStage = newStage
            }

            if (this.liveStatisticsStage > 0) { // If we are above Stopped/Idle, then surely we are running
              this.isLiveStatisticsRunning = true
            }
          } else {
            console.log(payload.payload)
          }
        }

        // If we are getting ERROR data from the remote job, log it to the console as error
        if (
          payload.code === 'ERROR'
        ) {
          this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
          this.showNotificationWithActionToLogs(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        }

        if (
          payload.code === 'END'
        ) {
          this.isLiveStatisticsRunning = false
          this.addLineToCommunicationLog(`${payload.code} | Closing this Tail. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
          this.showNotificationWithActionToLogs(`${payload.code} | Closing this Tail. (${(payload.payload !== undefined ? payload.payload : '🏁')})`, 'info')
        }

        // If the remote job died, push it to the Comm Log
        if (
          payload.code === 'EXIT'
        ) {
          this.isLiveStatisticsRunning = false
          this.addLineToCommunicationLog(`${payload.code} | Tailjob exited. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
        }
      }
    },

    handleSocketOnTailKill (payload) {
      // If we are getting STDOUT or STDERR data from the remote job push it to the Comm Log
      if (
        payload.code &&
        (
          payload.code === 'STDOUT' ||
          payload.code === 'STDERR'
        ) &&
        payload.payload &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
      }

      // If we are getting ERROR data from the remote job, push it to the Comm Log
      if (
        payload.code &&
        payload.code === 'ERROR' &&
        payload.payload &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        console.error(payload.payload)
        this.showNotificationWithActionToLogs(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`, 'info')
      }

      // If the remote job died, push it to the Comm Log
      if (
        payload.code === 'END' &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | ${this.$t('Post-Tail killing/cleaning job finished.')} | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
        this.showNotificationWithActionToLogs(`${payload.code} | ${this.$t('Post-Tail killing/cleaning job finished.')} (${(payload.payload !== undefined ? payload.payload : '🏁')})`, 'info')
      }

      // If the remote job died, push it to the Comm Log
      if (
        payload.code === 'EXIT' &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | ${this.$t('Post-Tail killing/cleaning job exited.')} | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
      }
    },
    handleSocketOnContainerTailLog (payload) {
      if (
        payload &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        // If we are getting data from the remote job, breack it in multiple lines (if \n is found in it) and push it in the queueIn
        if (
          payload.code === 'STDOUT' &&
          payload.payload
        ) {
          // eslint-disable-next-line quotes
          payload.payload.split("\n").forEach(lr => {
            this.addLineToContainerLog(payload.payload)
          })
        }

        // If we are getting STDERR data from the remote job, breack it in multiple lines (if \n is found in it) and log it
        if (
          payload.code === 'STDERR'
        ) {
          if (typeof payload.payload === 'string') {
            // eslint-disable-next-line quotes
            payload.payload.split("\n").forEach(lr => {
              this.addLineToContainerLog(payload.payload)
            })
          } else {
            console.log(payload.payload)
          }
        }

        // If we are getting STAGE data from the remote job, use it to track the stage progression
        if (
          payload.code === 'STAGE'
        ) {
          if (typeof payload.payload === 'string') {
            // Update the Stage
            let newStage = null
            try {
              newStage = {
                Stopped: 0,
                'Container Stats Tail Ended': 0,
                'Container Stats Tail Started': 1,
                'Connected to host': 2,
                'Receiving Real Time Data': 3
              }[payload.payload] || 0
            } catch (error) {
              console.log('STAGE | Unknown Stage. Error:', error)
            }

            if (newStage !== null && this.liveContainerLogsStage !== newStage) {
              if (
                this.liveContainerLogsStage < newStage &&
                newStage === 3
              ) {
                // We are progressing to Receiving from a lower stage
                // Fade the status slidder away slowly
                this.liveContainerLogsStageSliderVisibilityStateClass = 'fadeOutOnce'
              } else if (
                // We are getting to a different stage, but the slidder was hidden
                // Fade the status slidder back in quickly
                this.liveContainerLogsStage !== newStage &&
                this.liveContainerLogsStageSliderVisibilityStateClass === 'fadeOutOnce'
              ) {
                this.liveContainerLogsStageSliderVisibilityStateClass = 'fadeInOnce'
              }
              // Update the liveContainerLogsStage
              this.liveContainerLogsStage = newStage
            }
          } else {
            console.log(payload.payload)
          }
        }

        // If we are getting ERROR data from the remote job, log it to the console as error
        if (
          payload.code === 'ERROR'
        ) {
          this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
          this.showNotificationWithActionToLogs(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        }

        if (
          payload.code === 'END'
        ) {
          this.isLiveStatisticsRunning = false
          this.addLineToCommunicationLog(`${payload.code} | Closing this Tail. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
          this.showNotificationWithActionToLogs(`${payload.code} | Closing this Tail. (${(payload.payload !== undefined ? payload.payload : '🏁')})`, 'info')
        }

        // If the remote job died, push it to the Comm Log
        if (
          payload.code === 'EXIT'
        ) {
          this.isLiveStatisticsRunning = false
          this.addLineToCommunicationLog(`${payload.code} | Tailjob exited. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
        }
      }
    },

    addLineToCommunicationLog (payload) {
      // Just dump to the Console logs for now
      console.log(payload)
    },
    addLineToContainerLog (payload) {
      if (payload !== undefined) {
        // Dump the string or strings (if multiline) into new line(s)
        if (typeof payload === 'string') {
          // eslint-disable-next-line quotes
          this.containerLogs += payload + (payload.endsWith("\n") ? '' : "\n")
        } else {
          try {
            this.containerLogs += `${JSON.stringify(payload, null, '  ')}\n`
          } catch (error) {
            // Fails silently
          }
        }
        if (this.showContainerLog) {
          this.$nextTick(this.scrollToBottom)
        }
      }
    },
    clearContainerLog () {
      this.containerLogs = ''
    },
    showNotificationWithActionToLogs (message, type = 'negative') {
      this.$q.notify({
        message: message,
        type,
        progress: true,
        timeout: (type === 'negative' ? 10000 : 2500)
        // ,
        // actions: [
        //   { label: 'See Logs', color: 'white', handler: this.showCommunicationLogAndScrollToIt }
        // ]
      })
    },
    copyToClipboard (value) {
      copyToClipboard(value)
    },
    downloadContainerLogsAsFile ({ container, value }) {
      const fileExtension = '.log'
      const fileMimeType = 'text/plain'
      const fileName = 'container.' + String(container.name || '').replace(/[^-_a-zA-Z0-9]/g, '') + '_' + String(container.id || '').replace(/[^-_a-zA-Z0-9]/g, '') + fileExtension
      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading Container log as file...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Push file out
      const status = exportFile(fileName, value || '', fileMimeType)

      if (status === true) {
        notificationPopupId({
          type: 'positive',
          color: 'positive',
          icon: 'check',
          message: this.$t('Container log as file downloaded'),
          caption: fileName
        })
      } else {
        notificationPopupId({
          type: 'negative',
          color: 'negative',
          icon: 'o_report_problem',
          message: this.$t('Problem while downloading Container logs:'),
          caption: status
        })
        console.log('Error: ' + status)
      }
    },
    downloadContainerLogsAsFileFromLiveLogs (value) {
      this.downloadContainerLogsAsFile(
        {
          container: {
            id: this.activeContainerIdLogs || '',
            name: this.activeContainerNameLogs || ''
          },
          value
        }
      )
    },
    downloadContainerConfigAsFile ({ container, value, short }) {
      const fileExtension = `.${short === true ? 'short_' : ''}configuration.txt`
      const fileMimeType = 'text/plain'
      const fileName = 'container.' + String(container.name || '').replace(/[^-_a-zA-Z0-9]/g, '') + '_' + String(container.id || '').replace(/[^-_a-zA-Z0-9]/g, '') + fileExtension
      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading Container configuration...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Push file out
      const status = exportFile(fileName, value || '', fileMimeType)

      if (status === true) {
        notificationPopupId({
          type: 'positive',
          color: 'positive',
          icon: 'check',
          message: this.$t('Container configuration downloaded'),
          caption: fileName
        })
      } else {
        notificationPopupId({
          type: 'negative',
          color: 'negative',
          icon: 'o_report_problem',
          message: this.$t('Problem while downloading Container configuration:'),
          caption: status
        })
        console.log('Error: ' + status)
      }
    },
    downloadConfigurationToViewAsFileFromViewer (value) {
      this.downloadContainerConfigAsFile(
        {
          container: {
            id: this.activeContainerIdConfig || '',
            name: this.activeContainerNameConfig || ''
          },
          value,
          short: true
        }
      )
    }
  },
  mounted () {
    if (this.$route.params.openCollectorUid && this.$route.params.openCollectorUid.length) {
      if (this.openCollectorUid !== this.$route.params.openCollectorUid) {
        this.openCollectorUid = this.$route.params.openCollectorUid
      }

      // Record the page in Recent Items
      this.updateRecentItems()

      // Event when Server sends a new stats via Tail
      this.socket.on('statsTail.log', this.handleSocketOnStatsTailLog)
      // Event when Server sends a message while killing a Tail
      this.socket.on('statsTail.kill', this.handleSocketOnTailKill)

      // Auto start Stats collection
      if (this.openCollectorUid && this.openCollectorUid.length && this.socket && this.isLiveStatisticsRunning === false) {
        this.startLiveStatisitics()
      }

      // Event when Server sends a new container log via Tail
      this.socket.on('containerLogsTail.log', this.handleSocketOnContainerTailLog)
      // Event when Server sends a message while killing a Tail
      this.socket.on('containerLogsTail.kill', this.handleSocketOnTailKill)
    }
  },
  destroyed () {
    // Close any ongoing Tail
    this.killStatsTail()
    if (this.socket) {
      // Unsubscribe from Socket.io events about new stats data via Tail
      this.socket.off('statsTail.log')
      // Unsubscribe from Socket.io events about message while killing a Tail
      this.socket.off('statsTail.kill')

      // Unsubscribe from Socket.io events about new container log via Tail
      this.socket.off('containerLogsTail.log')
      // Unsubscribe from Socket.io events about message while killing a Tail
      this.socket.off('containerLogsTail.kill')
    }
  }
}
</script>

<style>
.fadeOutOnce {
  animation-name: fadeOutOnce;
  animation-duration: 4s;
  animation-fill-mode: forwards;
}

@keyframes fadeOutOnce {
   0% {opacity: 1;}
   50% {opacity: 1;}
   100% {opacity: 0;}
}

.fadeInOnce {
  animation-name: fadeInOnce;
  animation-duration: 0.5s;
  animation-fill-mode: forwards;
}

@keyframes fadeInOnce {
   0% {opacity: 0;}
   10% {opacity: 0.5;}
   100% {opacity: 1;}
}
</style>
