<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" :label="$t('Return to Admin')" :to="'/Admin'" />
        <q-separator spaced vertical />
        <q-btn no-caps flat dense icon="link" color="primary" :label="$t('Manage MS SQL Connection')" to="/Admin/SIEM/MsSql" />
        <q-toolbar-title style="opacity:.4" class="text-center">{{ $t('Admin : SIEM : Update EMDB') }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-card class="q-pa-md q-mx-none">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('EMDB Version Details') }}
          </q-card-section>

          <div v-if="managedOnBackend">
            <q-card-section class="q-pt-none">
              {{ $t('The MS SQL connection configuration is managed on the Backend.') }}
            </q-card-section>
            <q-card-section class="q-pt-none">
              {{ $t('Nothing to do here.') }}
            </q-card-section>
          </div>

          <div v-else>
            <q-card-section class="q-pt-none">
              <q-list dense bordered separator>
                <q-item>
                  <q-item-section avatar>
                    <q-spinner-dots v-if="loadingEmdbVersions" color="blue-10" size="2em" />
                    <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.sqlServerIsUp === false" name="block" size="sm" color="warning" />
                    <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.sqlServerIsUp" name="task_alt" size="sm" color="positive" />
                    <q-icon v-else name="block" size="sm" color="grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>MS SQL Server</q-item-label>
                    <q-item-label caption class="q-pl-md">
                      Status: {{ (siemEmdbVersions && siemEmdbVersions.sqlServerIsUp ? 'Up and running' : (siemEmdbVersions.sqlServerIsUp === false ? 'Unreachable' : 'Unknown')) }}<br>
                      Version: {{ (siemEmdbVersions && siemEmdbVersions.sqlServerVersion ? siemEmdbVersions.sqlServerVersion : '') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-spinner-dots v-if="loadingEmdbVersions" color="blue-10" size="2em" />
                    <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.ezDatabaseExists === false" name="block" size="sm" color="warning" />
                    <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.ezDatabaseExists" name="task_alt" size="sm" color="positive" />
                    <q-icon v-else name="block" size="sm" color="grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>EZ Database</q-item-label>
                    <q-item-label caption class="q-pl-md">
                      Presence: {{ (siemEmdbVersions && siemEmdbVersions.ezDatabaseExists ? 'Present' : (siemEmdbVersions.ezDatabaseExists === false ? 'Not found' : 'Unknown')) }}<br>
                      Status: {{ (siemEmdbVersions && siemEmdbVersions.ezDatabaseStatus ? siemEmdbVersions.ezDatabaseStatus.status : '') }}<br>
                      Created on: {{ (siemEmdbVersions && siemEmdbVersions.ezDatabaseStatus ? siemEmdbVersions.ezDatabaseStatus.createdOn : '') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-spinner-dots v-if="loadingEmdbVersions" color="blue-10" size="2em" />
                    <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsExists === false" name="block" size="sm" color="warning" />
                    <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsExists" name="task_alt" size="sm" color="positive" />
                    <q-icon v-else name="block" size="sm" color="grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>EZ Versions View</q-item-label>
                    <q-item-label caption class="q-pl-md">
                      Presence: {{ (siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsExists ? 'Present' : (siemEmdbVersions.viewGet_EZ_VersionsExists === false ? 'Not found' : 'Unknown')) }}<br>
                      Created on: {{ (siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsDetails ? siemEmdbVersions.viewGet_EZ_VersionsDetails.createdOn : '') }}<br>
                      Updated on: {{ (siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsDetails ? siemEmdbVersions.viewGet_EZ_VersionsDetails.updatedOn : '') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-if="loadingEmdbVersions"
                >
                  <q-item-section avatar>
                    <q-spinner-dots  color="blue-10" size="2em" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>EZ Database components</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-else
                  v-for="(storedProcedureAndViewsVersion, i) in (siemEmdbVersions && siemEmdbVersions.storedProcedureAndViewsVersions && siemEmdbVersions.storedProcedureAndViewsVersions.length ? siemEmdbVersions.storedProcedureAndViewsVersions : [])" :key="i"
                >
                  <q-item-section avatar>
                    <q-spinner-dots v-if="loadingEmdbVersions" color="blue-10" size="2em" />
                    <q-icon v-else-if="requiredVersionForEzDbPartByName(storedProcedureAndViewsVersion.name) <= storedProcedureAndViewsVersion.version" name="task_alt" size="sm" color="positive" />
                    <q-icon v-else-if="requiredVersionForEzDbPartByName(storedProcedureAndViewsVersion.name) > storedProcedureAndViewsVersion.version" name="upgrade" size="sm" color="warning" />
                    <q-icon v-else name="block" size="sm" color="grey" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>EZ Database component: {{ storedProcedureAndViewsVersion.name }}</q-item-label>
                    <q-item-label caption class="q-pl-md">
                      Required Version: {{ requiredVersionForEzDbPartByName(storedProcedureAndViewsVersion.name) }}<br>
                      Detected Version: {{ (storedProcedureAndViewsVersion.version ? storedProcedureAndViewsVersion.version : 'Unknown') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

              </q-list>
            </q-card-section>

            <!-- <q-card-section class="q-pt-none">
              <pre>{{ siemEmdbVersions }}</pre>
            </q-card-section> -->
          </div>

        </q-card-section>

        <q-separator vertical />

        <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="refresh" color="primary" :loading="loadingEmdbVersions" @click="loadEmdbVersions()" :disabled="loadingEmdbVersions">
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Reload EMDB Version Details') }}
              </q-tooltip>
            </q-btn>
        </q-card-actions>

      </q-card-section>
    </q-card>

    <q-card class="q-pa-md q-mx-none">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('Update EMDB') }}
          </q-card-section>

          <q-card-section class="q-pt-none">
            <span class="text-bold">{{ $t('Why?') }}</span><br>
            {{ $t('New versions of OC-Admin sometimes require to update some parts of the SIEM database (EMDB).') }}<br>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <span class="text-bold">{{ $t('How?') }}</span><br>
            {{ $t('To accomplish this, it needs to know SQL credentials with enough access to alter the EMDB database.') }}<br>
            {{ $t('These credentials are different from the ones configured and saved in the "Manage MS SQL Connection" administration page: they will be used once, but never saved.') }}
          </q-card-section>

          <q-card-section class="q-pt-none">
            <span class="text-bold">{{ $t('What will be updated?') }}</span><br>
            {{ $t('It will update, or create if not already present, in the EMDB database the Views and Stored Procedures necessary for OC-Admin to view SIEM Log Sources, License and Hosts, as well as handle (create/update) Log Source Types, Log Sources, Log Source Virtualisation and MPE Rules (Regex).') }}
          </q-card-section>

          <div v-if="managedOnBackend">
            <q-card-section class="q-pt-none">
              {{ $t('The MS SQL connection configuration is managed on the Backend.') }}
            </q-card-section>
            <q-card-section class="q-pt-none">
              {{ $t('Nothing to do here.') }}
            </q-card-section>
          </div>

          <div v-else>
            <q-card-section class="q-pt-none">
              <q-input dense v-model="siemMsSqlUsername"
                :disable="loadingMsSqlConfig"
                :label="$t('Username')"
                :rules="[val => !!val || $t('Username cannot be empty')]"
              />
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input dense v-model="siemMsSqlPassword"
                :disable="loadingMsSqlConfig"
                type="password"
                :label="$t('Password')"
                :rules="[val => !!val || $t('Really?! An empty Password?')]"
              />
            </q-card-section>

          </div>

        </q-card-section>

        <q-separator vertical />

        <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="update" color="primary" :loading="updatingAction" @click="promptToUpdateEmdb()" :disabled="!readyToUpdate" >
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Connect to and update EMDB') }}
              </q-tooltip>
            </q-btn>
        </q-card-actions>

      </q-card-section>
    </q-card>

    <q-card class="q-pa-md q-mx-none">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('MS SQL Connection') }}
          </q-card-section>

          <q-card-section class="q-pt-none">
              {{ $t('This update will use the other connection details already configured in "Manage MS SQL Connection". As shown below:') }}
          </q-card-section>

          <div v-if="managedOnBackend">
            <q-card-section class="q-pt-none">
              {{ $t('The MS SQL connection configuration is managed on the Backend.') }}
            </q-card-section>
            <q-card-section class="q-pt-none">
              {{ $t('Nothing to do here.') }}
            </q-card-section>
          </div>

          <div v-else>
            <q-card-section class="q-pt-none">
              <q-input dense v-model="siemMsSqlHost"
                disable
                :label="$t('Hostname (XM or Platform Manager)')"
                autofocus
                :rules="[val => !!val || $t('Hostname cannot be empty')]"
              />
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input dense v-model="siemMsSqlPort"
                disable
                :label="$t('MS SQL Port')"
                type="number"
                :rules="[
                  val => val !== null && val !== '' || $t('Port must be specified'),
                  val => val >= 1 && val <= 65535 || ('Port should be between 1 and 65535. Standard MS SQL port is 1433.')
                ]"
              />
            </q-card-section>

            <q-card-section class="q-pt-none q-mb-md">
              <q-toggle
                v-model="siemMsSqlEncrypt"
                disable
                :label="$t('Encrypt traffic')"
                left-label
                checked-icon="lock"
                unchecked-icon="warning"
                :color="(siemMsSqlEncrypt === true ? 'positive' : 'warning')"
                keep-color
                size="4rem"
              >
                <q-tooltip content-style="font-size: 1em">
                  {{ $t('Enable encryption between OC-Admin backend and MS SQL on the XM or Platform Manager (PM)') }}
                </q-tooltip>
              </q-toggle>
            </q-card-section>

          </div>

        </q-card-section>

        <q-separator vertical />

        <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="refresh" :loading="loadingMsSqlConfig" @click="loadMsSqlConfig()">
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Reload MS SQL Connection settings') }}
              </q-tooltip>
            </q-btn>
            <q-btn icon="edit" :loading="updatingAction" to="/Admin/SIEM/MsSql" >
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Edit MS SQL Connection setting') }}
              </q-tooltip>
            </q-btn>
        </q-card-actions>

      </q-card-section>
    </q-card>

  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageAdminSiemUpdateEmdb',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      loadingEmdbVersions: false,
      loadingMsSqlConfig: false,
      updatingAction: false,
      siemMsSqlHost: null,
      siemMsSqlPort: 1433,
      siemMsSqlEncrypt: true,
      siemMsSqlUsername: null,
      siemMsSqlPassword: null
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['siemEmdbVersions', 'msSqlConfig', 'extraInformation', 'minimalEzDbPartsVersions']),
    readyToUpdate () {
      return this.siemMsSqlHost &&
        this.siemMsSqlHost.length &&
        this.siemMsSqlPort >= 1 &&
        this.siemMsSqlPort <= 65535 &&
        this.siemMsSqlUsername &&
        this.siemMsSqlUsername.length &&
        !this.managedOnBackend
    },
    managedOnBackend () {
      return (
        this.msSqlConfig &&
        this.msSqlConfig.isManagedOnBackend === true
      )
    }
  },
  methods: {
    ...mapActions('mainStore', ['getEmdbVersions', 'getMsSqlConfig', 'updateEmdb', 'updateExtraInformation']),
    promptToUpdateEmdb () {
      // ask to confirm
      this.$q.dialog({
        title: this.$t('Confirm'),
        message: this.$t('Do you want to connect to EMDB and update it?'),
        ok: {
          push: true,
          color: 'positive'
        },
        cancel: {
          push: true,
          color: 'negative'
        },
        persistent: true
      }).onOk(() => {
        this.doUpdateEmdb()
      }) // }).onOk(() => {
    },
    doUpdateEmdb () {
      this.updateEmdb(
        {
          host: this.siemMsSqlHost,
          port: this.siemMsSqlPort,
          username: this.siemMsSqlUsername,
          password: this.siemMsSqlPassword,
          encrypt: this.siemMsSqlEncrypt,
          loadingVariableName: 'updatingAction',
          caller: this,
          onSuccessCallBack: this.loadEmdbVersions,
          onErrorCallBack: this.updateEmdbFailure
        }
      )
    },
    prepVariables () {
      if (this.msSqlConfig) {
        this.siemMsSqlHost = this.msSqlConfig.host
        this.siemMsSqlPort = this.msSqlConfig.port
        this.siemMsSqlEncrypt = !!this.msSqlConfig.encrypt

        // // Update the Extra Information branch `msSqlConnectionConfigMissing`
        // if (this.msSqlConfig.host && this.msSqlConfig.host.length) {
        //   if (this.extraInformation && this.extraInformation.msSqlConnectionConfigMissing) {
        //     // Turn is off
        //     const newExtraInformation = Object.assign({}, this.extraInformation)
        //     newExtraInformation.msSqlConnectionConfigMissing = false
        //     this.updateExtraInformation({ extraInformation: newExtraInformation })
        //   }
        // } else {
        //   // Turn is on
        //   const newExtraInformation = Object.assign({}, this.extraInformation)
        //   newExtraInformation.msSqlConnectionConfigMissing = true
        //   this.updateExtraInformation({ extraInformation: newExtraInformation })
        // }
      }
    },
    loadEmdbVersions () {
      this.getEmdbVersions(
        {
          loadingVariableName: 'loadingEmdbVersions',
          silent: false,
          caller: this
        }
      )
    },
    loadMsSqlConfig () {
      this.getMsSqlConfig(
        {
          loadingVariableName: 'loadingMsSqlConfig',
          caller: this,
          onSuccessCallBack: this.prepVariables
        }
      )
    },
    updateEmdbFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
    },
    requiredVersionForEzDbPartByName (EzDbPartName) {
      if (this.minimalEzDbPartsVersions) {
        const minimalEzDbPartsVersion = this.minimalEzDbPartsVersions.filter(pv => String(pv.name).toLowerCase() === String(EzDbPartName).toLowerCase())
        if (minimalEzDbPartsVersion && minimalEzDbPartsVersion.length) {
          return minimalEzDbPartsVersion[0].version
        }
        return 'Unknown'
      }
      return 'Unknown'
    }
  },
  mounted () {
    if (!(this.msSqlConfig && this.msSqlConfig.config && this.msSqlConfig.config.server.length)) {
      this.loadMsSqlConfig()
    }
    if (!(this.siemEmdbVersions && this.siemEmdbVersions.ezDatabaseStatus)) {
      this.loadEmdbVersions()
    }
  }
}
</script>
