<template>
  <q-page class="q-pa-md">
      <q-table
        title="OpenCollectors"
        :data="tableData"
        :columns="columns"
        row-key="uid"
        dense
        no-data-label="No OpenCollector to display."
        :filter="searchFilter"
        :loading="tableLoading"
        rows-per-page-label="OpenCollectors per page:"
        :pagination.sync="pagination"
      >

        <template v-slot:top>
          <div class="full-width row wrap justify-between">
            <div class="q-table__title">
              OpenCollectors
            </div>
            <div class="row q-gutter-md">
              <div class="col" >
                <q-btn rounded dense color="primary" icon="add" label="Add New OpenCollector" @click="doPromptForOpenCollectorDetails()" style="min-width:15rem;">
                  <q-tooltip content-style="font-size: 1em">
                    Create a new OpenCollector.
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
              <q-btn dense outline icon="refresh" @click="loadOpenCollectors()">
                <q-tooltip content-style="font-size: 1em">
                  Reload the list of OpenCollectors.
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <!-- <q-btn flat dense icon="launch" @click="openOpenCollector(props.row)" >
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Open this OpenCollector') }}
              </q-tooltip>
            </q-btn> -->
            <q-btn flat dense icon="refresh" @click="refreshOpenCollector(props.row.uid)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Refresh stats for this OpenCollector') }}
              </q-tooltip>
            </q-btn>
            <q-btn flat dense icon="edit" @click="doPromptForOpenCollectorDetails(props.row)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Edit OpenCollector details') }}
              </q-tooltip>
            </q-btn>
            <q-btn flat dense icon="delete" color="negative" @click="deleteOpenCollectorPrompt(props.row)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Delete OpenCollector') }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template v-slot:body-cell-authenticationMethod="props">
          <q-td :props="props">
            <q-icon name="password" size="sm" v-if="props.value === 'password'" />
            <q-icon name="vpn_key" size="sm" v-else-if ="props.value === 'private_key'" />
            <q-icon name="help_center" color="grey" size="md" v-else />
            <q-tooltip content-style="font-size: 1em">
              {{ props.value }}
            </q-tooltip>
          </q-td>
        </template>
        <template v-slot:body-cell-ocVersion="props">
          <q-td :props="props">
            {{ props.value }}
            <q-spinner-dots
              color="primary"
              size="2em"
              v-if="ocVersionCheck && ocVersionCheck[props.row.uid] && ocVersionCheck[props.row.uid].checking"
              class="q-ml-sm"
            />
          </q-td>
        </template>
        <template v-slot:body-cell-osVersion="props">
          <q-td :props="props">
            {{ props.value }}
            <q-spinner-dots
              color="primary"
              size="2em"
              v-if="osVersionCheck && osVersionCheck[props.row.uid] && osVersionCheck[props.row.uid].checking"
              class="q-ml-sm"
            />
          </q-td>
        </template>
        <!-- <template v-slot:body-cell-fbVersion="props">
          <q-td :props="props">
            <span v-if="props.value !== 'Not Installed'" >{{ (props.value && props.value.length ? 'Filebeat ' + props.value : '') }}</span>
            <q-btn-dropdown
              v-else
              label="Install Default"
              dense
              color="primary"
              flat
              split
              class="q-px-sm"
              @click="installFilebeat(props.row.uid, shippersUrls[0])"
            >
              <q-list>
                <q-item
                  v-for="(shipperUrl, index) in shippersUrls"
                  :key="index"
                  clickable
                  v-close-popup
                  @click="installFilebeat(props.row.uid, shipperUrl)"
                >
                  <q-item-section side style="min-width: 5em;" class="items-center">
                    <q-badge color="primary">v{{ shipperUrl.version }}</q-badge>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ shipperUrl.name }}</q-item-label>
                    <q-item-label caption>{{ shipperUrl.filename }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-spinner-dots
              color="primary"
              size="2em"
              v-if="fbVersionCheck && fbVersionCheck[props.row.uid] && fbVersionCheck[props.row.uid].checking"
              class="q-ml-sm"
            />
          </q-td>
        </template> -->
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

            <q-spinner-dots
              color="primary"
              size="2em"
              v-if="fbVersionCheck && fbVersionCheck[props.row.uid] && fbVersionCheck[props.row.uid].checking"
              class="q-ml-sm"
            />

            <q-spinner-dots
              color="primary"
              size="2em"
              v-if="activeOcBeatsVersionCheck && activeOcBeatsVersionCheck[props.row.uid] && activeOcBeatsVersionCheck[props.row.uid].checking"
              class="q-ml-sm"
            />

            <q-btn
              dense
              icon="add"
              color="primary"
              flat
            >
              <q-tooltip content-style="font-size: 1em;" >Add another Shipper</q-tooltip>
              <q-menu>
                <q-list>
                  <q-item
                    v-for="(shipperUrl, index) in shippersUrls"
                    :key="index"
                    clickable
                    v-close-popup
                    @click="installFilebeat(props.row.uid, shipperUrl)"
                  >
                    <q-item-section side style="min-width: 5em;" class="items-center">
                      <q-badge color="primary">v{{ shipperUrl.version }}</q-badge>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ shipperUrl.name }}</q-item-label>
                      <q-item-label caption>{{ shipperUrl.filename }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>

      <q-dialog v-model="promptForNewOpenCollectorDetails" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6" v-if="newOpenCollectorUid && newOpenCollectorUid.length">{{ $t('OpenCollector Details') }}</div>
            <div class="text-h6" v-else>{{ $t('New OpenCollector') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="newOpenCollectorName" autofocus label="OpenCollector Name" @keyup.esc="promptForNewOpenCollectorDetails = false" :rules="[val => !!val || $t('OpenCollector name cannot be empty')]" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pt-none">
            <div class="text-overline">Host</div>
            <q-input dense v-model="newOpenCollectorHostname" label="Host name" @keyup.esc="promptForNewOpenCollectorDetails = false" :rules="[val => !!val || $t('OpenCollector Host name cannot be empty')]" />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="newOpenCollectorPort" type="number" label="SSH Port" @keyup.esc="promptForNewOpenCollectorDetails = false" :rules="[val => !!val || $t('OpenCollector port cannot be empty')]" />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pt-none">
            <div class="text-overline">Authentication</div>

            <q-input dense v-model="newOpenCollectorUsername" label="SSH User name" hint="" @keyup.esc="promptForNewOpenCollectorDetails = false" />

            <q-tabs
              v-model="newOpenCollectorAuthMethod"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="password" label="Password" />
              <q-tab name="private_key" label="Private Key" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="newOpenCollectorAuthMethod" animated>
              <q-tab-panel name="password">
                <q-input dense v-model="newOpenCollectorPassword" type="password" label="SSH Password" hint="" @keyup.esc="promptForNewOpenCollectorDetails = false" />
              </q-tab-panel>

              <q-tab-panel name="private_key">
                <q-input dense v-model="newOpenCollectorPrivateKey" type="textarea" label="SSH Private Key" hint="" @keyup.esc="promptForNewOpenCollectorDetails = false" />
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('Cancel')" v-close-popup />
            <q-btn flat :label="$t('Update OpenCollector')" v-close-popup v-if="newOpenCollectorUid && newOpenCollectorUid.length" :disabled="!newOpenCollectorName || !newOpenCollectorName.length || !newOpenCollectorHostname || !newOpenCollectorHostname.length || !newOpenCollectorPort || newOpenCollectorPort < 0 || newOpenCollectorPort > 65535 || !newOpenCollectorUsername || !newOpenCollectorUsername.length || ((!newOpenCollectorPassword || !newOpenCollectorPassword.length) && (!newOpenCollectorPrivateKey || !newOpenCollectorPrivateKey.length))" @click="addNewOrUpdateOpenCollector()" />
            <q-btn flat :label="$t('Add new OpenCollector')" v-close-popup v-else :disabled="!newOpenCollectorName || !newOpenCollectorName.length || !newOpenCollectorHostname || !newOpenCollectorHostname.length || !newOpenCollectorPort || newOpenCollectorPort < 0 || newOpenCollectorPort > 65535 || !newOpenCollectorUsername || !newOpenCollectorUsername.length || ((!newOpenCollectorPassword || !newOpenCollectorPassword.length) && (!newOpenCollectorPrivateKey || !newOpenCollectorPrivateKey.length))" @click="addNewOrUpdateOpenCollector()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-card class="q-mt-sm" v-if="Object.keys(shipperInstall).length">
        <q-card-section>
          <div class="text-h6">Installation Logs</div>
        </q-card-section>
        <q-card-section v-for="(job, jobIndex) in shipperInstall" :key="jobIndex">
          <div class="row q-gutter-x-md items-center" v-if="job.collector">
            <q-spinner-gears size="2em" color="teal" v-show="job.onGoing === true" />
            <q-icon name="thumb_up" size="2em" color="positive" v-show="job.onGoing === false && job.failed === false" >
              <q-tooltip content-style="font-size: 1em;" >Job completed successfuly</q-tooltip>
            </q-icon>
            <q-icon name="thumb_down" size="2em" color="negative" v-show="job.onGoing === false && job.failed === true" >
              <q-tooltip content-style="font-size: 1em;" >Job failed to complete</q-tooltip>
            </q-icon>
            <q-separator vertical />
            <div class="text-bold">{{ job.collector.name }}</div>
            <q-separator vertical />
            <div class="text-italic">{{ job.collector.hostname }}:{{ job.collector.port }}</div>
            <q-separator vertical />
            <q-linear-progress rounded size="1em" :value="(job.step > 0 ? job.totalSteps / job.step : 0)" class="col" :color="(job.onGoing === false ? (job.failed === false ? 'green-8' : 'deep-orange-8') : '')" >
              <q-tooltip content-style="font-size: 1em;" >Completed steps: {{ job.step }} / {{ job.totalSteps }}</q-tooltip>
            </q-linear-progress>
          </div>
          <div class="row q-my-sm">
            <q-separator vertical size="2px" color="teal" />
            <div class="q-ml-sm col">
              <div v-for="(log, logIndex) in job.console" :key="logIndex">
                <q-icon name="subdirectory_arrow_right" class="q-mr-sm" color="primary" v-if="log.type === 'finished'"/>
                <q-icon name="error" class="q-mr-sm" color="orange" v-if="log.type === 'error' && log.msgCode === 'ERROR'"/>
                <q-icon name="error" class="q-mr-sm" color="orange" v-if="log.type === 'error' && log.msgCode === 'EXIT'"/>
                <span
                  :class="(log.type === 'stdout' ? 'fixed-font-console' : '') + ' '
                    + (log.type === 'finished' ? 'text-positive' : '')
                    + (log.type === 'error' ? 'text-negative' : '')"
                >{{ log.value }}</span>
                <q-separator color="" v-if="log.type === 'finished'" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
      <!-- shipperInstall:
      <pre>{{shipperInstall}}</pre> -->
      <!-- <pre>{{tableData}}</pre> -->
    </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import { uid } from 'quasar'

// import shippersFallbackUrls from 'src/pages/OpenCollectors/shippers_fallback_urls.json'

export default {
  name: 'PageOpenCollectorsList',
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedSocket // Shared function and state to access the Socket.io
  ],
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
        { name: 'hostname', align: 'center', label: 'Hostname', field: 'hostname', sortable: true },
        { name: 'authenticationMethod', align: 'center', label: 'Authentication Method', field: 'authenticationMethod', sortable: true },
        { name: 'osVersion', align: 'center', label: 'OS version', field: 'osVersion', sortable: true },
        { name: 'ocVersion', align: 'center', label: 'OpenCollector version', field: 'ocVersion', sortable: true },
        // { name: 'fbVersion', align: 'center', label: 'Shippers version', field: 'fbVersion', sortable: true },
        { name: 'installedShippers', align: 'center', label: 'Installed Shippers', field: 'installedShippers', sortable: true }
        // { name: 'pipelinesCount', align: 'center', label: 'Log Sources', field: 'pipelinesCount', sortable: true }
      ],
      pagination: {
        sortBy: 'name',
        descending: false,
        rowsPerPage: 25
      },
      promptForNewOpenCollectorDetails: false,
      newOpenCollectorUid: '',
      newOpenCollectorName: '',
      newOpenCollectorHostname: '',
      newOpenCollectorPort: 22,
      newOpenCollectorAuthMethod: 'password',
      newOpenCollectorUsername: '',
      newOpenCollectorPassword: '',
      newOpenCollectorPrivateKey: '',
      // newOpenCollectorOpenCollector: null,
      newOpenCollectorPipelines: [],
      newOpenCollectorOsVersion: '',
      newOpenCollectorOcInstalled: false,
      newOpenCollectorOcVersion: '',
      newOpenCollectorFbInstalled: false,
      newOpenCollectorFbVersion: '',
      osVersionCheck: {},
      ocVersionCheck: {},
      fbVersionCheck: {},
      activeOcBeatsVersionCheck: {},
      shipperInstall: {}
    } // return
  },
  computed: {
    ...mapState('mainStore', ['collectionShippersOptions', 'openCollectorBeats']),
    ...mapGetters('mainStore', ['openCollectors', 'pipelines', 'shippersUrls']),
    tableData () {
      const list = []
      this.openCollectors.forEach(oc => {
        list.push(Object.assign({}, oc, {
          pipelinesCount: (oc.pipelines && oc.pipelines.length > 0 ? oc.pipelines.length : '-')
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
    }
    // shippersUrls: {
    //   get () {
    //     // Use the downloaded ones, otherwise, fallback to pre-recorded list
    //     return (
    //       Object.keys(this.shippersUrlsInternal).length
    //         ? this.shippersUrlsInternal
    //         : shippersFallbackUrls
    //     )
    //   }
    // }
  },
  methods: {
    ...mapActions('mainStore', ['upsertOpenCollector', 'deleteOpenCollector', 'loadShippersUrls']),
    ...mapActions('mainStore', ['getOpenCollectorsOsVersion', 'getOpenCollectorsOcVersion', 'getOpenCollectorsFilebeatVersion', 'getOpenCollectorsOcAndActiveBeatsVersion']),
    openOpenCollector (row) {
      this.$router.push({ path: '/OpenCollectors/' + row.uid + '/View' })
    }, // openOpenCollector
    refreshOpenCollector (uid) {
      if (uid && uid.length) {
        if (!this.ocVersionCheck[uid]) {
          this.ocVersionCheck[uid] = {
            apiData: {},
            error: false
          }
        }
        this.ocVersionCheck[uid].checking = true
        this.ocVersionCheck = JSON.parse(JSON.stringify(this.ocVersionCheck))
        // this.getOpenCollectorsOcVersion({
        //   caller: this,
        //   apiCallParams: { uid: uid },
        //   onSuccessCallBack: this.ocVersionReceive,
        //   onErrorCallBack: this.ocVersionReceive,
        //   debug: false
        // })

        if (!this.osVersionCheck[uid]) {
          this.osVersionCheck[uid] = {
            apiData: {}
          }
        }
        this.osVersionCheck[uid].checking = true
        this.osVersionCheck = JSON.parse(JSON.stringify(this.osVersionCheck))
        this.getOpenCollectorsOsVersion({
          caller: this,
          apiCallParams: { uid: uid },
          onSuccessCallBack: this.osVersionReceive,
          onErrorCallBack: this.osVersionReceive,
          debug: false
        })

        // Clear the list of Shippers for this Collector, but don't save them to the Backend
        const newOcInfo = JSON.parse(JSON.stringify(this.openCollectors.find((oc) => oc.uid === uid)))
        newOcInfo.installedShippers = []
        this.upsertOpenCollector(
          {
            pushToApi: false,
            caller: this,
            openCollector: newOcInfo
          }
        )

        if (!this.fbVersionCheck[uid]) {
          this.fbVersionCheck[uid] = {
            apiData: {}
          }
        }
        this.fbVersionCheck[uid].checking = true
        this.fbVersionCheck = JSON.parse(JSON.stringify(this.fbVersionCheck))
        this.getOpenCollectorsFilebeatVersion({
          caller: this,
          apiCallParams: { uid: uid },
          onSuccessCallBack: this.fbVersionReceive,
          onErrorCallBack: this.fbVersionReceive,
          debug: false
        })

        if (!this.activeOcBeatsVersionCheck[uid]) {
          this.activeOcBeatsVersionCheck[uid] = {
            apiData: {}
          }
        }
        this.activeOcBeatsVersionCheck[uid].checking = true
        this.activeOcBeatsVersionCheck = JSON.parse(JSON.stringify(this.activeOcBeatsVersionCheck))
        this.getOpenCollectorsOcAndActiveBeatsVersion({
          caller: this,
          apiCallParams: { uid: uid },
          onSuccessCallBack: this.ocAndBeatsVersionReceive,
          onErrorCallBack: this.ocAndBeatsVersionReceive,
          debug: false
        })
      }
    }, // refreshOpenCollector
    ocVersionReceive (response) {
      console.log('ocVersionReceive - 🔺- SHOULD NOT BE USED ANYMORE') // XXXXXX
      if (response) {
        const uid = (response.params && response.params.apiCallParams && response.params.apiCallParams.uid ? response.params.apiCallParams.uid : null)
        if (uid && this.ocVersionCheck && this.ocVersionCheck[uid]) {
          this.ocVersionCheck[uid].checking = false
          if (response.success) {
            this.ocVersionCheck[uid].error = false
            // this.ocVersionCheck[uid].apiData = (response.data && response.data.payload ? response.data.payload : {})

            const newOcInfo = JSON.parse(JSON.stringify(this.openCollectors.find((oc) => oc.uid === uid)))
            newOcInfo.ocVersion = (response.data && response.data.payload && response.data.payload.version && response.data.payload.version.full ? response.data.payload.version.full : newOcInfo.ocVersion)
            newOcInfo.ocVersion = newOcInfo.ocVersion || ''
            this.upsertOpenCollector(
              {
                pushToApi: true,
                caller: this,
                openCollector: newOcInfo
              }
            )
          } else {
            this.ocVersionCheck[uid].error = true
            this.ocVersionCheck[uid].apiData = {}
          }
          this.ocVersionCheck = JSON.parse(JSON.stringify(this.ocVersionCheck))
        }
      }
    },
    osVersionReceive (response) {
      if (response) {
        const uid = (response.params && response.params.apiCallParams && response.params.apiCallParams.uid ? response.params.apiCallParams.uid : null)
        if (uid && this.osVersionCheck && this.osVersionCheck[uid]) {
          this.osVersionCheck[uid].checking = false
          if (response.success) {
            this.osVersionCheck[uid].error = false

            const newOcInfo = JSON.parse(JSON.stringify(this.openCollectors.find((oc) => oc.uid === uid)))
            newOcInfo.osVersion = (response.data && response.data.payload && response.data.payload.version && response.data.payload.version.full ? response.data.payload.version.full : newOcInfo.osVersion)
            newOcInfo.osVersion = newOcInfo.osVersion || ''
            this.upsertOpenCollector(
              {
                pushToApi: true,
                caller: this,
                openCollector: newOcInfo
              }
            )
          } else {
            this.osVersionCheck[uid].error = true
            this.osVersionCheck[uid].apiData = {}
          }
          this.osVersionCheck = JSON.parse(JSON.stringify(this.osVersionCheck))
        }
      }
    },
    fbVersionReceive (response) {
      if (response) {
        const uid = (response.params && response.params.apiCallParams && response.params.apiCallParams.uid ? response.params.apiCallParams.uid : null)
        if (uid && this.fbVersionCheck && this.fbVersionCheck[uid]) {
          this.fbVersionCheck[uid].checking = false
          const newOcInfo = JSON.parse(JSON.stringify(this.openCollectors.find((oc) => oc.uid === uid)))

          if (response.success) {
            this.fbVersionCheck[uid].error = false
            // newOcInfo.fbVersion = (response.data && response.data.payload && response.data.payload.version && response.data.payload.version.full ? response.data.payload.version.full : newOcInfo.fbVersion)
            if (response.data && response.data.payload && response.data.payload.version && response.data.payload.version.full) {
              newOcInfo.fbVersion = response.data.payload.version.full
              newOcInfo.installedShippers.push(
                {
                  name: 'Filebeat',
                  version: response.data.payload.version.full
                }
              )
            }
          } else {
            this.fbVersionCheck[uid].error = true
            // Only set to 'Not Installed' if something responded with 'bash: filebeat: command not found' or something similar
            // Any other error (host not responding, or SSH failed) will simply return no version information
            newOcInfo.fbVersion = ''
            if (response.data.errors && Array.isArray(response.data.errors)) {
              response.data.errors.forEach((err) => {
                if (String(err).includes('command not found')) {
                  newOcInfo.fbVersion = 'Not Installed'
                }
              })
            }
            this.fbVersionCheck[uid].apiData = {}
          }

          this.upsertOpenCollector(
            {
              pushToApi: true,
              caller: this,
              openCollector: newOcInfo
            }
          )

          this.fbVersionCheck = JSON.parse(JSON.stringify(this.fbVersionCheck))
        }
      }
    },
    ocAndBeatsVersionReceive (response) {
      console.log('ocAndBeatsVersionReceive:', response) // XXXXXX
      if (response) {
        const uid = (response.params && response.params.apiCallParams && response.params.apiCallParams.uid ? response.params.apiCallParams.uid : null)

        // Do the Open Collector version

        if (uid) {
          const newOcInfo = JSON.parse(JSON.stringify(this.openCollectors.find((oc) => oc.uid === uid)))

          if (this.ocVersionCheck && this.ocVersionCheck[uid]) {
            this.ocVersionCheck[uid].checking = false
            if (response.success) {
              this.ocVersionCheck[uid].error = false

              const openCollectorVersionPayload = (response.data && response.data.payload && response.data.payload.length ? response.data.payload.find((p) => p.name === 'open_collector') : null)
              console.log('openCollectorVersionPayload', openCollectorVersionPayload) // XXXXXXXX
              newOcInfo.ocVersion = (openCollectorVersionPayload && openCollectorVersionPayload.version && openCollectorVersionPayload.version.full ? openCollectorVersionPayload.version.full : newOcInfo.ocVersion)
              newOcInfo.ocVersion = newOcInfo.ocVersion || ''
              this.upsertOpenCollector(
                {
                  pushToApi: true,
                  caller: this,
                  openCollector: newOcInfo
                }
              )
            } else {
              this.ocVersionCheck[uid].error = true
              this.ocVersionCheck[uid].apiData = {}
            }
            this.ocVersionCheck = JSON.parse(JSON.stringify(this.ocVersionCheck))
          }

          // Do the Active Beats version

          if (this.activeOcBeatsVersionCheck && this.activeOcBeatsVersionCheck[uid]) {
            this.activeOcBeatsVersionCheck[uid].checking = false

            if (response.success) {
              this.activeOcBeatsVersionCheck[uid].error = false

              const activeBeatsVersionPayload = (response.data && response.data.payload && response.data.payload.length ? response.data.payload.filter((p) => p.name !== 'open_collector') : null)
              newOcInfo.installedShippers = newOcInfo.installedShippers.concat(
                (
                  activeBeatsVersionPayload && Array.isArray(activeBeatsVersionPayload)
                    ? activeBeatsVersionPayload.reduce((accumulatedPayloads, payload) => {
                      accumulatedPayloads.push(
                        {
                          name: payload.name,
                          version: (payload && payload.version && payload.version.full ? payload.version.full : null)
                        }
                      )
                      return accumulatedPayloads
                    }, [])
                    : []
                )
              )
            } else {
              this.activeOcBeatsVersionCheck[uid].error = true
              this.activeOcBeatsVersionCheck[uid].apiData = {}
            }

            this.upsertOpenCollector(
              {
                pushToApi: true,
                caller: this,
                openCollector: newOcInfo
              }
            )

            this.activeOcBeatsVersionCheck = JSON.parse(JSON.stringify(this.activeOcBeatsVersionCheck))
          }
        }
      }
    },
    deleteOpenCollectorPrompt (row) {
      if (typeof row !== 'undefined') {
        // ask to confirm
        this.$q.dialog({
          title: 'Confirm',
          message: 'Do you REALLY want to delete this OpenCollector?',
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
          this.deleteOpenCollector({
            pushToApi: true,
            caller: this,
            openCollector: row
          })
        }) // }).onOk(() => {
      }
    }, // deleteOpenCollectorPrompt
    doPromptForOpenCollectorDetails (existing) {
      this.newOpenCollectorUid = (existing && existing.uid ? existing.uid : null)
      this.newOpenCollectorName = (existing && existing.name ? existing.name : '')
      this.newOpenCollectorHostname = (existing && existing.hostname ? existing.hostname : '')
      this.newOpenCollectorPort = (existing && existing.port ? existing.port : 22)
      this.newOpenCollectorAuthMethod = (existing && existing.authenticationMethod ? existing.authenticationMethod : 'password')
      this.newOpenCollectorUsername = (existing && existing.username ? existing.username : null)
      this.newOpenCollectorPassword = (existing && existing.password ? existing.password : null)
      this.newOpenCollectorPrivateKey = (existing && existing.privateKey ? existing.privateKey : null)
      this.newOpenCollectorPipelines = (existing && existing.pipelines ? existing.pipelines : [])
      this.newOpenCollectorOsVersion = (existing && existing.osVersion ? existing.osVersion : '')
      this.newOpenCollectorOcInstalled = (existing && existing.ocInstalled ? existing.ocInstalled : false)
      this.newOpenCollectorOcVersion = (existing && existing.ocVersion ? existing.ocVersion : '')
      this.newOpenCollectorFbInstalled = (existing && existing.fbInstalled ? existing.fbInstalled : false)
      this.newOpenCollectorFbVersion = (existing && existing.fbVersion ? existing.fbVersion : '')

      this.promptForNewOpenCollectorDetails = true
    }, // doPromptForOpenCollectorDetails
    addNewOrUpdateOpenCollector () {
      this.promptForNewOpenCollectorDetails = false
      const openCollectoruid = this.newOpenCollectorUid || uid()
      this.upsertOpenCollector(
        {
          pushToApi: true,
          caller: this,
          openCollector:
          {
            // uid: this.newOpenCollectorUid,
            uid: openCollectoruid,
            name: this.newOpenCollectorName,
            hostname: this.newOpenCollectorHostname,
            port: this.newOpenCollectorPort,
            authenticationMethod: this.newOpenCollectorAuthMethod, // "password", "private_key"
            username: this.newOpenCollectorUsername,
            password: this.newOpenCollectorPassword,
            privateKey: this.newOpenCollectorPrivateKey,
            pipelines: this.newOpenCollectorPipelines,
            osVersion: this.newOpenCollectorOsVersion,
            ocInstalled: this.newOpenCollectorOcInstalled,
            ocVersion: this.newOpenCollectorOcVersion,
            fbInstalled: this.newOpenCollectorFbInstalled,
            fbVersion: this.newOpenCollectorFbVersion
          }
        }
      )
      setTimeout(() => {
        console.log('timeout - refreshOpenCollector - ' + openCollectoruid)
        this.refreshOpenCollector(openCollectoruid)
      }, 1000)
    },

    installFilebeat (uid, shipperSource) {
      console.log('installFilebeat:')
      console.log(uid)
      console.log(shipperSource)

      this.shipperInstall[uid] = {
        collector: this.tableData.find(c => c.uid === uid),
        onGoing: true,
        console: [],
        bufferStdOut: '',
        failed: false,
        step: 0,
        totalSteps: 1
      }
      this.shipperInstall = JSON.parse(JSON.stringify(this.shipperInstall))

      if (this.socket && this.socket.connected) {
        this.socket.emit('shipper.install', {
          jobId: uid,
          uid,
          installerSource: shipperSource
        })
      }
    },

    addLineToShipperInstallConsole (payload, type = 'stdout') {
      if (payload && payload.jobId && payload.payload) {
        // Make sure we have an Arrar to add to
        if (!Array.isArray(this.shipperInstall[payload.jobId].console)) {
          this.shipperInstall[payload.jobId].console = []
        }

        // Dump the string or strings (if multiline) into new line(s) in the console array
        if (typeof payload.payload === 'string') {
          // eslint-disable-next-line quotes
          payload.payload.split("\n").forEach(line => {
            this.shipperInstall[payload.jobId].console.push({
              type: type,
              value: line,
              msgCode: payload.code || ''
            })
          })
        } else {
          this.shipperInstall[payload.jobId].console.push({
            type: type,
            value: JSON.stringify(payload.payload),
            msgCode: payload.code || ''
          })
        }
        // Refresh object
        this.shipperInstall = JSON.parse(JSON.stringify(this.shipperInstall))
      }
    },

    handleSocketOnShipperInstall (payload) {
      console.log(payload)

      if (
        payload.payload &&
        payload.jobId &&
        payload.jobId.length > 0 &&
        payload.code
      ) {
        // In case, re-build a fresh shipperInstall sub-object
        if (!this.shipperInstall[payload.jobId]) {
          this.shipperInstall[payload.jobId] = {
            collector: this.tableData.find(c => c.uid === payload.jobId),
            onGoing: true,
            console: [],
            bufferStdOut: '',
            failed: false,
            step: 0,
            totalSteps: 1
          }
        }

        // If we are getting data from the remote job, breack it in multiple lines (if \n is found in it) and push it in the job's console
        if (payload.code === 'STDOUT') {
          if (typeof payload.payload === 'string') {
            // Add new data to end of buffer
            this.shipperInstall[payload.jobId].bufferStdOut += payload.payload

            // eslint-disable-next-line quotes
            if (this.shipperInstall[payload.jobId].bufferStdOut.indexOf("\n") > -1) {
              const newPayload = []
              // eslint-disable-next-line quotes
              this.shipperInstall[payload.jobId].bufferStdOut.split("\n").forEach(line => {
                newPayload.push(line)
              })

              // Empty the buffer
              this.shipperInstall[payload.jobId].bufferStdOut = ''

              // Check if the last element of the array is not empty (denoting a string not terminated with a carriage return)
              // If found, put it back inthis.shipperInstall[payload.jobId] bufferStdOut, as it's most likely the beginning of a truncated line
              if (newPayload.length > 0) {
                if (newPayload[newPayload.length - 1].length !== 0) {
                  this.shipperInstall[payload.jobId].bufferStdOut = newPayload.pop()
                }
              }

              newPayload.forEach((line) => {
                this.addLineToShipperInstallConsole({
                  jobId: payload.jobId,
                  code: payload.code,
                  payload: line
                }, 'stdout')
              })
            }
          } else {
            this.addLineToShipperInstallConsole(payload, 'stdout')
          }
        }

        // Moving along?
        if (payload.code === 'FINISHED') {
          // this.shipperInstall[payload.jobId].onGoing = true
          this.shipperInstall[payload.jobId].step = payload.step || this.shipperInstall[payload.jobId].step
          this.shipperInstall[payload.jobId].totalSteps = payload.totalSteps || this.shipperInstall[payload.jobId].totalSteps
          this.addLineToShipperInstallConsole(payload, 'finished')
        }

        // If we are getting STDERR data from the remote job, breack it in multiple lines (if \n is found in it) and log it to the console
        if (
          payload.code === 'STDERR' ||
          payload.code === 'ERROR'
        ) {
          this.addLineToShipperInstallConsole(payload, 'error')
        }

        // If the remote job failed, flag the jobs as off here too
        if (
          payload.code === 'EXIT' ||
          payload.code === 'FAILURE'
        ) {
          this.addLineToShipperInstallConsole(payload, 'error')
          this.shipperInstall[payload.jobId].failed = true
          this.shipperInstall[payload.jobId].onGoing = false
          setTimeout(() => {
            this.refreshOpenCollector(payload.jobId)
          }, 1000)
        }

        // If the remote job died, flag the jobs as off here too
        if (payload.code === 'END') {
          if (payload.payload && payload.payload !== 'SUCCESS') {
            this.addLineToShipperInstallConsole(payload, 'error')
          }
          this.shipperInstall[payload.jobId].onGoing = false
          setTimeout(() => {
            this.refreshOpenCollector(payload.jobId)
          }, 1000)
          console.log('*** END ***')
        }

        // Refresh object
        this.shipperInstall = JSON.parse(JSON.stringify(this.shipperInstall))
      }
    },
    collectionShipperDetails (shipperName) {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'unknown', outputFormat: 'json' }
      if (shipperName && shipperName.length) {
        return (
          this.collectionShippersOptions.find(cso => cso.label && cso.label === shipperName) ||
          this.openCollectorBeats.find(ocb => ocb.label && ocb.label === shipperName) ||
          fallbackValue
        )
      } else {
        return fallbackValue
      }
    }
  }, // methods
  mounted () {
    // if (this.openCollectors.length === 0) {
    //   this.loadOpenCollectors()
    // }

    // Get the list of Shippers and their URLs from the cloud
    this.loadShippersUrls({ caller: this })

    // Event when Server sends output or updates from an Install/Uninstall job
    this.socket.on('shipper.install', this.handleSocketOnShipperInstall)
  },
  beforeDestroy () {
    this.socket.offAny(this.handleSocketOnShipperInstall)
  }
}

</script>

<style>
</style>
