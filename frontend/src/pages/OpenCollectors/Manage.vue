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
            <q-card-section class="q-gutter-y-sm">
              <div class="text-overline text-uppercase text-bold">
                {{ $t('Basic Information') }}
              </div>
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
            <q-space />
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
                    @click="doStartStopContainer(props.row)"
                    :disable="!(props.row && props.row.pid !== 0)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_play_arrow" />
                    </q-item-section>
                    <q-item-section>{{ $t('Start Container') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doStartStopContainer(props.row)"
                    :disable="!(props.row && props.row.pid !== 0)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_stop" />
                    </q-item-section>
                    <q-item-section>{{ $t('Stop Container') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doStartStopContainer(props.row)"
                    :disable="!(props.row && props.row.pid !== 0)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_restart_alt" />
                    </q-item-section>
                    <q-item-section>{{ $t('Restart Container') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup
                    @click="doStartStopContainer(props.row)"
                    :disable="!(props.row && props.row.pid !== 0)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_file_download" />
                    </q-item-section>
                    <q-item-section>{{ $t('Export Configuration to File') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doStartStopContainer(props.row)"
                    :disable="!(props.row && props.row.pid !== 0)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_file_upload" />
                    </q-item-section>
                    <q-item-section>{{ $t('Import Configuration from File') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doStartStopContainer(props.row)"
                    :disable="!(props.row && props.row.pid !== 0)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_source" />
                    </q-item-section>
                    <q-item-section>{{ $t('View Configuration') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup
                    @click="doStartStopContainer(props.row)"
                    :disable="!(props.row && props.row.pid !== 0)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_file_download" />
                    </q-item-section>
                    <q-item-section>{{ $t('Export Logs to File') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup
                    @click="doStartStopContainer(props.row)"
                    :disable="!(props.row && props.row.pid !== 0)"
                  >
                    <q-item-section avatar>
                      <q-icon name="o_text_snippet" />
                    </q-item-section>
                    <q-item-section>{{ $t('View Real Time Logs') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-btn flat dense :icon="(props.row && props.row.pids && props.row.pids.instant !== 0 ? 'o_stop' : 'o_play_arrow')" @click="doStartStopContainer(props.row)">
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
            <!-- <q-icon name="o_arrow_circle_up" color="green" size="md" v-if="props.value === true" />
            <q-icon name="o_arrow_circle_down" color="red" size="md" v-else-if ="props.value === false" />
            <q-icon name="o_help_center" color="grey" size="md" v-else />
            <q-tooltip content-style="font-size: 1em">
              <span v-if="props.value === true">{{ $t('Enabled') }}</span>
              <span v-else-if ="props.value === false">{{ $t('Disabled / Un-deployed') }}</span>
              <span v-else>{{ props.value }}</span>
            </q-tooltip> -->
          </q-td>
        </template>
      </q-table>

      <!-- <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section>
              <div class="">
                <pre>{{ containersListRaw }}</pre>
              </div>
            </q-card-section>
            <q-card-section>
              <div class="">
                <pre>{{ tableData }}</pre>
              </div>
            </q-card-section>
            <q-card-section>
              <div class="text-bold">
                opened openCollector:
              </div>
              <pre>{{ openCollector }}</pre>
            </q-card-section>
          </q-card-section>
        </q-card-section>
      </q-card> -->
    </div>
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import BreadCrumbs from 'components/BreadCrumbs.vue'

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
      containersListRaw: [ // docker stats -a --no-trunc --format "{{ json . }}"
        // { BlockIO: '0B / 0B', CPUPerc: '0.00%', Container: 'aceb078bf98a', ID: 'aceb078bf98a', MemPerc: '0.00%', MemUsage: '0B / 0B', Name: 'metric', NetIO: '0B / 0B', PIDs: '0' },
        // { BlockIO: '0B / 0B', CPUPerc: '0.00%', Container: '56b6cf9ac82a', ID: '56b6cf9ac82a', MemPerc: '0.00%', MemUsage: '0B / 0B', Name: 'openCollector', NetIO: '0B / 0B', PIDs: '0' },
        // { BlockIO: '0B / 0B', CPUPerc: '0.00%', Container: '5b272e6ac2b9', ID: '5b272e6ac2b9', MemPerc: '0.00%', MemUsage: '0B / 0B', Name: 'gracious_shaw', NetIO: '0B / 0B', PIDs: '0' },
        // { BlockIO: '0B / 0B', CPUPerc: '0.00%', Container: '6dbe6bc6fd5f', ID: '6dbe6bc6fd5f', MemPerc: '0.00%', MemUsage: '0B / 0B', Name: 'mariadb', NetIO: '0B / 0B', PIDs: '0' },
        // { BlockIO: '3.62GB / 72.5MB', CPUPerc: '9.36%', Container: '280810e0bf6c', ID: '280810e0bf6c', MemPerc: '231.51%', MemUsage: '4.373GiB / 1.889GiB', Name: 'oc-admin', NetIO: '11MB / 3.35MB', PIDs: '4515' },
        // { BlockIO: '255MB / 2.49MB', CPUPerc: '0.00%', Container: '0bff8eedd486', ID: '0bff8eedd486', MemPerc: '1.07%', MemUsage: '20.71MiB / 1.889GiB', Name: 'oc-db', NetIO: '551kB / 2.27MB', PIDs: '7' }
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
      }
    }
  },
  computed: {
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
              }
            }
          )
        })
      }
      return list
    }
  },
  methods: {
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
    doStartStopContainer () {
      //
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
    handleSocketOnTailLog (payload) {
      // If we are getting data from the remote job, breack it in multiple lines (if \n is found in it) and push it in the queueIn
      if (
        payload.code &&
        payload.code === 'STDOUT' &&
        payload.payload &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        // console.log('STDOUT', payload.payload) // XXXX
        // console.log('STDOUT', payload) // XXXX
        // {
        //     "openCollectorUid": "2b31b21b-c40c-4216-9fd6-3d5bebe3d30d",
        //     "code": "STDOUT",
        //     "payload": "{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"aceb078bf98a\",\"ID\":\"aceb078bf98a8ac3373b82b893faec9890904b9e7eca1c8f773f7335283d2aed\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"compose-swagger-1\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"56b6cf9ac82a\",\"ID\":\"56b6cf9ac82ae58095ebe2aa286b0c1981bb37402150b9a3da254ac6fd342ea2\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"compose-ted-rest-1\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"64f65327eefd\",\"ID\":\"64f65327eefdacd6ea09e245138883d4b9594ec2da270b4898ec34efe92d7835\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"compose-adminer-1\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"57d0835889ae\",\"ID\":\"57d0835889aed8df1f6b0b155b677a9f80a186ebc3267a8e848a395f2075d5eb\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"compose-ted-db-1\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"4.01GB / 94.1MB\",\"CPUPerc\":\"8.73%\",\"Container\":\"7275e31ecaa6\",\"ID\":\"7275e31ecaa616dea086e1d0d722b662ee944fb902a79777764065401a2ec38d\",\"MemPerc\":\"34.83%\",\"MemUsage\":\"673.6MiB / 1.889GiB\",\"Name\":\"ted-dev\",\"NetIO\":\"61.3MB / 887MB\",\"PIDs\":\"380\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"5b272e6ac2b9\",\"ID\":\"5b272e6ac2b9a44418e72ef4f8bf05e33441e0fd8ca6a95e069acf7912d561e0\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"gracious_shaw\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"6dbe6bc6fd5f\",\"ID\":\"6dbe6bc6fd5f6c8b5bb4e84eb2fa1d130b1a38c975fdf1041b9a0ec1da6c693d\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"mariadb\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"7.14GB / 242MB\",\"CPUPerc\":\"10.80%\",\"Container\":\"280810e0bf6c\",\"ID\":\"280810e0bf6c0a6a5594ca83b33bb0afa8d85188c8c2e187fca685de8436a087\",\"MemPerc\":\"261.18%\",\"MemUsage\":\"4.933GiB / 1.889GiB\",\"Name\":\"oc-admin\",\"NetIO\":\"26.5MB / 6.71MB\",\"PIDs\":\"4596\"}\n{\"BlockIO\":\"374MB / 5.83MB\",\"CPUPerc\":\"0.00%\",\"Container\":\"0bff8eedd486\",\"ID\":\"0bff8eedd4869c63dde890ff92d18945d34da934b0f6a44b65f099472547422f\",\"MemPerc\":\"0.70%\",\"MemUsage\":\"13.55MiB / 1.889GiB\",\"Name\":\"oc-db\",\"NetIO\":\"1.41MB / 3.99MB\",\"PIDs\":\"7\"}\n"
        // }

        // {
        //     "openCollectorUid": "2b31b21b-c40c-4216-9fd6-3d5bebe3d30d",
        //     "code": "STDOUT",
        //     "payload": "\u001b[2J\u001b[H"
        // }

        // {
        //     "openCollectorUid": "2b31b21b-c40c-4216-9fd6-3d5bebe3d30d",
        //     "code": "STDOUT",
        //     "payload": "\u001b[2J\u001b[H{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"aceb078bf98a\",\"ID\":\"aceb078bf98a8ac3373b82b893faec9890904b9e7eca1c8f773f7335283d2aed\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"compose-swagger-1\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"56b6cf9ac82a\",\"ID\":\"56b6cf9ac82ae58095ebe2aa286b0c1981bb37402150b9a3da254ac6fd342ea2\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"compose-ted-rest-1\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"64f65327eefd\",\"ID\":\"64f65327eefdacd6ea09e245138883d4b9594ec2da270b4898ec34efe92d7835\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"compose-adminer-1\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"57d0835889ae\",\"ID\":\"57d0835889aed8df1f6b0b155b677a9f80a186ebc3267a8e848a395f2075d5eb\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"compose-ted-db-1\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"4.02GB / 94.1MB\",\"CPUPerc\":\"10.39%\",\"Container\":\"7275e31ecaa6\",\"ID\":\"7275e31ecaa616dea086e1d0d722b662ee944fb902a79777764065401a2ec38d\",\"MemPerc\":\"35.00%\",\"MemUsage\":\"676.9MiB / 1.889GiB\",\"Name\":\"ted-dev\",\"NetIO\":\"61.3MB / 887MB\",\"PIDs\":\"380\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"5b272e6ac2b9\",\"ID\":\"5b272e6ac2b9a44418e72ef4f8bf05e33441e0fd8ca6a95e069acf7912d561e0\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"gracious_shaw\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"0B / 0B\",\"CPUPerc\":\"0.00%\",\"Container\":\"6dbe6bc6fd5f\",\"ID\":\"6dbe6bc6fd5f6c8b5bb4e84eb2fa1d130b1a38c975fdf1041b9a0ec1da6c693d\",\"MemPerc\":\"0.00%\",\"MemUsage\":\"0B / 0B\",\"Name\":\"mariadb\",\"NetIO\":\"0B / 0B\",\"PIDs\":\"0\"}\n{\"BlockIO\":\"7.14GB / 242MB\",\"CPUPerc\":\"30.04%\",\"Container\":\"280810e0bf6c\",\"ID\":\"280810e0bf6c0a6a5594ca83b33bb0afa8d85188c8c2e187fca685de8436a087\",\"MemPerc\":\"258.37%\",\"MemUsage\":\"4.88GiB / 1.889GiB\",\"Name\":\"oc-admin\",\"NetIO\":\"26.8MB / 6.76MB\",\"PIDs\":\"4582\"}\n{\"BlockIO\":\"374MB / 5.83MB\",\"CPUPerc\":\"0.01%\",\"Container\":\"0bff8eedd486\",\"ID\":\"0bff8eedd4869c63dde890ff92d18945d34da934b0f6a44b65f099472547422f\",\"MemPerc\":\"0.70%\",\"MemUsage\":\"13.55MiB / 1.889GiB\",\"Name\":\"oc-db\",\"NetIO\":\"1.42MB / 4MB\",\"PIDs\":\"7\"}\n"
        // }

        // Stripping the shell formatting characters that Docker Stats adds before its payload
        const cleanPayload = String(payload.payload).replace('\u001b[2J\u001b[H', '') || ''
        if (cleanPayload.includes('{')) {
          // console.log('STDOUT', cleanPayload) // XXXX
          try {
            // eslint-disable-next-line quotes
            // console.log(cleanPayload.split("\n").filter((line) => String(line).includes('{')).join(','))
            this.containersListRaw = JSON.parse(`[${
              cleanPayload
              // eslint-disable-next-line quotes
                .split("\n")
                .filter((line) => String(line)
                .includes('{'))
                .join(',')}]`)
          } catch (error) {
            console.log('ERROR', error)
          }
        }
      }

      // If we are getting STDERR data from the remote job, breack it in multiple lines (if \n is found in it) and log it to the console
      if (
        payload.code &&
        payload.code === 'STDERR' &&
        payload.payload &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        // this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        // if (typeof payload.payload === 'string') {
        //   console.log(payload.payload)
        //   // const newPayload = []
        //   // // eslint-disable-next-line quotes
        //   // payload.payload.split("\n").forEach(lr => {
        //   //   console.log(lr)
        //   // })
        //   // this.queueInAdd({ values: newPayload })
        // } else {
        //   console.log(payload.payload)
        //   // this.queueInAdd({ values: payload.payload })
        // }
      }

      // If we are getting ERROR data from the remote job, log it to the console as error
      if (
        payload.code &&
        payload.code === 'ERROR' &&
        payload.payload &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        this.addLineToCommunicationLog(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
        this.showNotificationWithActionToLogs(`${payload.code} | ${(payload.payload !== undefined ? payload.payload : '')}`)
      }

      if (
        payload.code === 'END' &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        this.isLiveStatisticsRunning = false
        this.addLineToCommunicationLog(`${payload.code} | Closing this Tail. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
        this.showNotificationWithActionToLogs(`${payload.code} | Closing this Tail. (${(payload.payload !== undefined ? payload.payload : '🏁')})`, 'info')
      }

      // If the remote job died, push it to the Comm Log
      if (
        payload.code === 'EXIT' &&
        payload.openCollectorUid &&
        payload.openCollectorUid === this.openCollectorUid
      ) {
        this.isLiveStatisticsRunning = false
        this.addLineToCommunicationLog(`${payload.code} | Tailjob exited. | ${(payload.payload !== undefined ? payload.payload : '🏁')}`)
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
    addLineToCommunicationLog (payload) {
      if (payload !== undefined) {
        // Dump the string or strings (if multiline) into new line(s) in the console
        if (typeof payload === 'string') {
          // this.communicationLogsOutput += payload + (payload.endsWith("\n") ? '' : "\n")
          // eslint-disable-next-line quotes
          console.log(payload)
          // // eslint-disable-next-line quotes
          // payload.split("\n").forEach(line => {
          //   this.communicationLogsOutput += `${line}\n`
          // })
        } else {
          // this.communicationLogsOutput += `${JSON.stringify(payload, null, '  ')}\n`
          console.log(`${JSON.stringify(payload, null, '  ')}\n`)
        }
      }
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
    }
  },
  mounted () {
    if (this.$route.params.openCollectorUid && this.$route.params.openCollectorUid.length) {
      if (this.openCollectorUid !== this.$route.params.openCollectorUid) {
        this.openCollectorUid = this.$route.params.openCollectorUid
      }

      // Record the page in Recent Items
      this.updateRecentItems()

      // Event when Server sends a new log via Tail
      this.socket.on('statsTail.log', this.handleSocketOnTailLog)
      // Event when Server sends a message while killing a Tail
      this.socket.on('statsTail.kill', this.handleSocketOnTailKill)

      // Auto start Stats collection
      if (this.openCollectorUid && this.openCollectorUid.length && this.socket && this.isLiveStatisticsRunning === false) {
        this.startLiveStatisitics()
      }
    }
  },
  destroyed () {
    // Close any ongoing Tail
    this.killStatsTail()
    if (this.socket) {
      // Unsubscribe from Socket.io events about new log via Tail
      this.socket.off('statsTail.log')
      // Unsubscribe from Socket.io events about message while killing a Tail
      this.socket.off('statsTail.kill')
    }
  }
}
</script>

<style>

</style>
