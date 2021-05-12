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
            <q-btn flat dense icon="launch" @click="openOpenCollector(props.row)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Open this OpenCollector') }}
              </q-tooltip>
            </q-btn>
            <q-btn flat dense icon="refresh" @click="refreshOpenCollector(props.row)">
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
            <div class="text-overline">Authentication Method</div>
            <q-tabs
              v-model="newOpenCollectorAuthMethod"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
            >
              <q-tab name="password" label="Login / Password" />
              <q-tab name="private_key" label="Private Key" />
            </q-tabs>

            <q-separator />

            <q-tab-panels v-model="newOpenCollectorAuthMethod" animated>
              <q-tab-panel name="password">
                <q-input dense v-model="newOpenCollectorUsername" label="SSH User name" hint="" @keyup.esc="promptForNewOpenCollectorDetails = false" />
                <q-input dense v-model="newOpenCollectorPassword" type="password" label="SSH Password" hint="" @keyup.esc="promptForNewOpenCollectorDetails = false" />
              </q-tab-panel>

              <q-tab-panel name="private_key">
                <q-input dense v-model="newOpenCollectorPrivateKey" type="textarea" label="SSH Private Key" hint="" @keyup.esc="promptForNewOpenCollectorDetails = false" />
              </q-tab-panel>
            </q-tab-panels>
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('Cancel')" v-close-popup />
            <q-btn flat :label="$t('Update OpenCollector')" v-close-popup v-if="newOpenCollectorUid && newOpenCollectorUid.length" :disabled="!newOpenCollectorName || !newOpenCollectorName.length || !newOpenCollectorHostname || !newOpenCollectorHostname.length || !newOpenCollectorPort || newOpenCollectorPort < 0 || newOpenCollectorPort > 65535 || ((!newOpenCollectorUsername || !newOpenCollectorUsername.length) && (!newOpenCollectorPrivateKey || !newOpenCollectorPrivateKey.length))" @click="addNewOrUpdateOpenCollector()" />
            <q-btn flat :label="$t('Add new OpenCollector')" v-close-popup v-else :disabled="!newOpenCollectorName || !newOpenCollectorName.length || !newOpenCollectorHostname || !newOpenCollectorHostname.length || !newOpenCollectorPort || newOpenCollectorPort < 0 || newOpenCollectorPort > 65535 || ((!newOpenCollectorUsername || !newOpenCollectorUsername.length) && (!newOpenCollectorPrivateKey || !newOpenCollectorPrivateKey.length))" @click="addNewOrUpdateOpenCollector()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PageOpenCollectorsList',
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
        { name: 'hostname', align: 'center', label: 'Hostname', field: 'hostname', sortable: true },
        { name: 'authenticationMethod', align: 'center', label: 'Authentication Method', field: 'authenticationMethod', sortable: true },
        { name: 'ocVersion', align: 'center', label: 'OpenCollector version', field: 'ocVersion', sortable: true },
        { name: 'osVersion', align: 'center', label: 'OS version', field: 'osVersion', sortable: true },
        { name: 'fbVersion', align: 'center', label: 'Filebeat version', field: 'fbVersion', sortable: true },
        { name: 'pipelinesCount', align: 'center', label: 'Log Sources', field: 'pipelinesCount', sortable: true }
      ],
      pagination: {
        sortBy: 'name',
        descending: false,
        rowsPerPage: 25
      },
      tableLoading: false,
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
      newOpenCollectorFbVersion: ''
    } // return
  },
  computed: {
    ...mapGetters('mainStore', ['openCollectors', 'pipelines']),
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
    }
  },
  methods: {
    ...mapActions('mainStore', ['upsertOpenCollector', 'deleteOpenCollector', 'getOpenCollectors']),
    openOpenCollector (row) {
      this.$router.push({ path: '/OpenCollectors/' + row.uid + '/View' })
    }, // openOpenCollector
    loadOpenCollectors () {
      this.getOpenCollectors(
        {
          loadingVariableName: 'tableLoading',
          caller: this
        }
      )
    }, // loadOpenCollectors
    refreshOpenCollector (row) {
      //
    }, // refreshOpenCollector
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
      this.upsertOpenCollector(
        {
          pushToApi: true,
          caller: this,
          openCollector:
          {
            uid: this.newOpenCollectorUid,
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
    }
  }, // methods
  mounted () {
    if (this.openCollectors.length === 0) {
      this.loadOpenCollectors()
    }
  }
}

</script>
