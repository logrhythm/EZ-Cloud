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

      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="">
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
                          <q-separator />
                        </q-list>
                      </q-menu>
                    </q-btn>
                    <q-btn flat dense icon="o_stop" @click="doStartStopContainer(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Start / Stop Container') }}
                      </q-tooltip>
                    </q-btn>
                  </q-td>
                </template>

                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-icon name="o_arrow_circle_up" color="green" size="md" v-if="props.value === true" />
                    <q-icon name="o_arrow_circle_down" color="red" size="md" v-else-if ="props.value === false" />
                    <q-icon name="o_help_center" color="grey" size="md" v-else />
                    <q-tooltip content-style="font-size: 1em">
                      <span v-if="props.value === true">{{ $t('Enabled') }}</span>
                      <span v-else-if ="props.value === false">{{ $t('Disabled / Un-deployed') }}</span>
                      <span v-else>{{ props.value }}</span>
                    </q-tooltip>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card-section>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section>
              <div class="">
                <pre>{{ containersList }}</pre>
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
      </q-card>
    </div>
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  name: 'PageOpenCollectorManage',
  mixins: [
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ],
  components: { BreadCrumbs },
  data () {
    return {
      openCollectorUid: '',
      isLiveStatisticsRunning: false,
      containersListRaw: [ // docker stats -a --no-trunc --format "{{ json . }}"
        { BlockIO: '0B / 0B', CPUPerc: '0.00%', Container: 'aceb078bf98a', ID: 'aceb078bf98a', MemPerc: '0.00%', MemUsage: '0B / 0B', Name: 'metric', NetIO: '0B / 0B', PIDs: '0' },
        { BlockIO: '0B / 0B', CPUPerc: '0.00%', Container: '56b6cf9ac82a', ID: '56b6cf9ac82a', MemPerc: '0.00%', MemUsage: '0B / 0B', Name: 'openCollector', NetIO: '0B / 0B', PIDs: '0' },
        { BlockIO: '0B / 0B', CPUPerc: '0.00%', Container: '5b272e6ac2b9', ID: '5b272e6ac2b9', MemPerc: '0.00%', MemUsage: '0B / 0B', Name: 'gracious_shaw', NetIO: '0B / 0B', PIDs: '0' },
        { BlockIO: '0B / 0B', CPUPerc: '0.00%', Container: '6dbe6bc6fd5f', ID: '6dbe6bc6fd5f', MemPerc: '0.00%', MemUsage: '0B / 0B', Name: 'mariadb', NetIO: '0B / 0B', PIDs: '0' },
        { BlockIO: '3.62GB / 72.5MB', CPUPerc: '9.36%', Container: '280810e0bf6c', ID: '280810e0bf6c', MemPerc: '231.51%', MemUsage: '4.373GiB / 1.889GiB', Name: 'oc-admin', NetIO: '11MB / 3.35MB', PIDs: '4515' },
        { BlockIO: '255MB / 2.49MB', CPUPerc: '0.00%', Container: '0bff8eedd486', ID: '0bff8eedd486', MemPerc: '1.07%', MemUsage: '20.71MiB / 1.889GiB', Name: 'oc-db', NetIO: '551kB / 2.27MB', PIDs: '7' }
      ],
      containersList: [
        // {
        //   containerId: '',
        //   name: '',
        //   cpuPercent: 0,
        //   memUsage: {
        //     instant: '0B',
        //     past: []
        //   },
        //   memLimit: {
        //     instant: '0B',
        //     past: []
        //   },
        //   memoryPercent: 0,
        //   netIO: {
        //     received: {
        //       instant: '0B',
        //       past: []
        //     },
        //     sent: {
        //       instant: '0B',
        //       past: []
        //     }
        //   },
        //   blockIO: {
        //     written: {
        //       instant: '0B',
        //       past: []
        //     },
        //     read: {
        //       instant: '0B',
        //       past: []
        //     }
        //   },
        //   pids: {
        //     instant: 0,
        //     past: []
        //   }
        // },
        {
          containerId: '280810e0bf6c',
          name: 'oc-admin',
          cpuPercent: 4.55,
          memUsage: {
            instant: '4.354GiB',
            past: []
          },
          memLimit: {
            instant: '1.889GiB',
            past: []
          },
          memoryPercent: 233.21,
          netIO: {
            received: {
              instant: '10.8MB',
              past: []
            },
            sent: {
              instant: '3.27MB',
              past: []
            }
          },
          blockIO: {
            written: {
              instant: '3.62GB',
              past: []
            },
            read: {
              instant: '71.9MB',
              past: []
            }
          },
          pids: {
            instant: 4530,
            past: []
          }
        },
        {
          containerId: '5b272e6ac2b9',
          name: 'gracious_shaw',
          cpuPercent: 0,
          memUsage: {
            instant: '0B',
            past: []
          },
          memLimit: {
            instant: '0B',
            past: []
          },
          memoryPercent: 0,
          netIO: {
            received: {
              instant: '0B',
              past: []
            },
            sent: {
              instant: '0B',
              past: []
            }
          },
          blockIO: {
            written: {
              instant: '0B',
              past: []
            },
            read: {
              instant: '0B',
              past: []
            }
          },
          pids: {
            instant: 0,
            past: []
          }
        }
      ],
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: this.$t('Actions'), field: 'actions', sortable: false },
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
        sortBy: 'status',
        descending: true,
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
      const list = this.containersList
      // this.deployments.forEach(deployment => {
      //   const deploymentOpenCollector = this.openCollectors.find(oc => deployment.openCollector && oc.uid === deployment.openCollector.uid)
      //   if (this.areWeInLTR) { // Left To Right
      //     list.push(Object.assign({}, deployment, {
      //       openCollectorHost: (deploymentOpenCollector && deploymentOpenCollector.name && deploymentOpenCollector.hostname ? deploymentOpenCollector.name + ' (' + deploymentOpenCollector.hostname + ')' : null)
      //     }))
      //   } else { // Right To Left
      //     list.push(Object.assign({}, deployment, {
      //       openCollectorHost: (deploymentOpenCollector && deploymentOpenCollector.name && deploymentOpenCollector.hostname ? '(' + deploymentOpenCollector.hostname + ') ' + deploymentOpenCollector.name : null)
      //     }))
      //   }
      // })

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
                instant: container.PIDs,
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
      this.isLiveStatisticsRunning = true
    },
    stopLiveStatisitics () {
      this.isLiveStatisticsRunning = false
    },
    doStartStopContainer () {
      //
    }
  },
  mounted () {
    if (this.$route.params.openCollectorUid && this.$route.params.openCollectorUid.length) {
      if (this.openCollectorUid !== this.$route.params.openCollectorUid) {
        this.openCollectorUid = this.$route.params.openCollectorUid
      }

      // Record the page in Recent Items
      this.updateRecentItems()
    }
  }
}
</script>

<style>

</style>
