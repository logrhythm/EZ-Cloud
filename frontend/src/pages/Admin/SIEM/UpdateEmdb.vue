<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" :src="(darkMode ? 'logrhythm_logo_darkmode_wide.svg' : 'logrhythm_logo_lightmode_wide.svg')" alt="LogRhythm Open Collector">
        <q-btn no-caps flat dense icon="link" color="primary" :label="$t('Manage MS SQL Connection')" to="/Admin/SIEM/MsSql" />
      </q-toolbar>
    </q-header>

    <BreadCrumbs
      :crumbs="breadCrumbs"
    />

    <div class="q-gutter-y-sm">
      <q-card class="">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                {{ $t('Database Version Details') }}
            </q-card-section>
            <!-- <q-card-section class="">
                <pre>{{ databaseElementsWithVersion }}</pre>
            </q-card-section> -->

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
                      <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.sqlServerIsUp === false" name="o_block" size="sm" color="warning" />
                      <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.sqlServerIsUp" name="o_task_alt" size="sm" color="positive" />
                      <q-icon v-else name="o_block" size="sm" color="grey" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('MS SQL Server') }}</q-item-label>
                      <q-item-label caption class="q-pl-md">
                        {{ $t('Status: {siemEmdbVersionsSqlServerIsUp}', { siemEmdbVersionsSqlServerIsUp: (siemEmdbVersions && siemEmdbVersions.sqlServerIsUp ? $t('Up and running') : (siemEmdbVersions.sqlServerIsUp === false ? $t('Unreachable') : $t('Unknown'))) }) }}<br>
                        {{ $t('Version: {siemEmdbVersionsSqlServerVersion}', { siemEmdbVersionsSqlServerVersion: (siemEmdbVersions && siemEmdbVersions.sqlServerVersion ? siemEmdbVersions.sqlServerVersion : '') }) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-spinner-dots v-if="loadingEmdbVersions" color="blue-10" size="2em" />
                      <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.ezDatabaseExists === false" name="o_block" size="sm" color="warning" />
                      <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.ezDatabaseExists" name="o_task_alt" size="sm" color="positive" />
                      <q-icon v-else name="o_block" size="sm" color="grey" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('EZ Database') }}</q-item-label>
                      <q-item-label caption class="q-pl-md">
                        {{ $t('Presence: {siemEmdbVersionsEzDatabaseExists}', { siemEmdbVersionsEzDatabaseExists: (siemEmdbVersions && siemEmdbVersions.ezDatabaseExists ? $t('Present') : (siemEmdbVersions.ezDatabaseExists === false ? $t('Not found') : $t('Unknown'))) }) }}<br>
                        {{ $t('Status: {siemEmdbVersionsEzDatabaseStatusStatus}', { siemEmdbVersionsEzDatabaseStatusStatus: (siemEmdbVersions && siemEmdbVersions.ezDatabaseStatus ? siemEmdbVersions.ezDatabaseStatus.status : '') }) }}<br>
                        {{ $t('Created on: {siemEmdbVersionsEzDatabaseStatusCreatedOn}', { siemEmdbVersionsEzDatabaseStatusCreatedOn: (siemEmdbVersions && siemEmdbVersions.ezDatabaseStatus ? siemEmdbVersions.ezDatabaseStatus.createdOn : '') }) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-spinner-dots v-if="loadingEmdbVersions" color="blue-10" size="2em" />
                      <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsExists === false" name="o_block" size="sm" color="warning" />
                      <q-icon v-else-if="siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsExists" name="o_task_alt" size="sm" color="positive" />
                      <q-icon v-else name="o_block" size="sm" color="grey" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('EZ Versions View') }}</q-item-label>
                      <q-item-label caption class="q-pl-md">
                        {{ $t('Presence: {siemEmdbVersionsViewGet_EZ_VersionsExists}', { siemEmdbVersionsViewGet_EZ_VersionsExists: (siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsExists ? $t('Present') : (siemEmdbVersions.viewGet_EZ_VersionsExists === false ? $t('Not found') : $t('Unknown'))) }) }}<br>
                        {{ $t('Created on: {siemEmdbVersionsViewGet_EZ_VersionsExistsCreatedOn}', { siemEmdbVersionsViewGet_EZ_VersionsExistsCreatedOn: (siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsDetails ? siemEmdbVersions.viewGet_EZ_VersionsDetails.createdOn : '') }) }}<br>
                        {{ $t('Updated on: {siemEmdbVersionsViewGet_EZ_VersionsExistsUpdatedOn}', { siemEmdbVersionsViewGet_EZ_VersionsExistsUpdatedOn: (siemEmdbVersions && siemEmdbVersions.viewGet_EZ_VersionsDetails ? siemEmdbVersions.viewGet_EZ_VersionsDetails.updatedOn : '') }) }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

  <!--
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
                      <q-icon v-else-if="requiredVersionForEzDbPartByName(storedProcedureAndViewsVersion.name) <= storedProcedureAndViewsVersion.version" name="o_task_alt" size="sm" color="positive" />
                      <q-icon v-else-if="requiredVersionForEzDbPartByName(storedProcedureAndViewsVersion.name) > storedProcedureAndViewsVersion.version" name="o_upgrade" size="sm" color="warning" />
                      <q-icon v-else name="o_block" size="sm" color="grey" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>EZ Database component: {{ storedProcedureAndViewsVersion.name }}</q-item-label>
                      <q-item-label caption class="q-pl-md">
                        Required Version: {{ requiredVersionForEzDbPartByName(storedProcedureAndViewsVersion.name) }}<br>
                        Detected Version: {{ (storedProcedureAndViewsVersion.version ? storedProcedureAndViewsVersion.version : 'Unknown') }}
                      </q-item-label>
                    </q-item-section>
                  </q-item> -->

                  <q-item
                    v-for="(storedProcedureAndViewsVersion, i) in databaseElementsWithVersion" :key="i"
                  >
                    <q-item-section avatar>
                      <q-spinner-dots v-if="loadingEmdbVersions" color="blue-10" size="2em" />
                      <q-icon v-else-if="storedProcedureAndViewsVersion.requiredVersion <= storedProcedureAndViewsVersion.detectedVersion" name="o_task_alt" size="sm" color="positive">
                        <q-tooltip content-style="font-size: 1rem;">
                          {{ $t('Up to date') }}
                        </q-tooltip>
                      </q-icon>
                      <q-icon v-else-if="storedProcedureAndViewsVersion.requiredVersion > storedProcedureAndViewsVersion.detectedVersion" name="o_upgrade" size="sm" color="warning">
                        <q-tooltip content-style="font-size: 1rem;">
                          {{ $t('Needs upgrading') }}
                        </q-tooltip>
                      </q-icon>
                      <q-icon v-else-if="!storedProcedureAndViewsVersion.detectedVersion" name="o_upgrade" size="sm" color="warning">
                        <q-tooltip content-style="font-size: 1rem;">
                          {{ $t('Needs upgrading') }}
                        </q-tooltip>
                      </q-icon>
                      <q-icon v-else name="o_block" size="sm" color="grey">
                        <q-tooltip content-style="font-size: 1rem;">
                          {{ $t('Unknown or not needed') }}
                        </q-tooltip>
                      </q-icon>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ $t('EZ Database component: {storedProcedureAndViewsVersionName}', { storedProcedureAndViewsVersionName: storedProcedureAndViewsVersion.name }) }}</q-item-label>
                      <q-item-label caption class="q-pl-md">
                        {{ $t('Required Version: {storedProcedureAndViewsVersionRequiredVersion}', { storedProcedureAndViewsVersionRequiredVersion: storedProcedureAndViewsVersion.requiredVersion }) }}<br>
                        {{ $t('Detected Version: {storedProcedureAndViewsVersionDetectedVersion}', { storedProcedureAndViewsVersionDetectedVersion: (storedProcedureAndViewsVersion.detectedVersion ? storedProcedureAndViewsVersion.detectedVersion : $t('Missing or unknown')) }) }}<br>
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
                  {{ $t('Reload Database Version Details') }}
                </q-tooltip>
              </q-btn>
          </q-card-actions>

        </q-card-section>
      </q-card>

      <q-card class="">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                {{ $t('Update Database') }}
            </q-card-section>

            <q-card-section class="q-pt-none">
              <span class="text-bold">{{ $t('Why?') }}</span><br>
              {{ $t('New versions of OC-Admin sometimes require to update some parts of the SIEM database.') }}<br>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <span class="text-bold">{{ $t('How?') }}</span><br>
              {{ $t('To accomplish this, it needs to know SQL credentials with enough access to alter the SIEM database.') }}<br>
              {{ $t('These credentials are different from the ones configured and saved in the "Manage MS SQL Connection" administration page: they will be used once, but never saved.') }}
            </q-card-section>

            <q-card-section class="q-pt-none">
              <span class="text-bold">{{ $t('What will be updated?') }}</span><br>
              {{ $t('It will update, or create if not already present, in the Database the Views and Stored Procedures necessary for OC-Admin to view SIEM Log Sources, License and Hosts, as well as handle (create/update) Log Source Types, Log Sources, Log Source Virtualisation and MPE Rules (Regex).') }}
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
                <q-input
                  dense
                  outlined
                  v-model="siemMsSqlUsername"
                  :disable="loadingMsSqlConfig"
                  :label="$t('Username')"
                  :rules="[val => !!val || $t('Username cannot be empty')]"
                />
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-input
                  dense
                  outlined
                  v-model="siemMsSqlPassword"
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
                  {{ $t('Connect to and update Database') }}
                </q-tooltip>
              </q-btn>
          </q-card-actions>

        </q-card-section>
      </q-card>

      <q-card class="">
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
                <q-input
                  dense
                  outlined
                  v-model="siemMsSqlHost"
                  disable
                  :label="$t('Hostname (XM or Platform Manager)')"
                  autofocus
                  :rules="[val => !!val || $t('Hostname cannot be empty')]"
                />
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-input
                  dense
                  outlined
                  v-model="siemMsSqlPort"
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
    </div>

  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog.vue'
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  name: 'PageAdminSiemUpdateEmdb',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { BreadCrumbs },
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
    },
    databaseElementsWithVersion () {
      const returnArray = []
      if (this.minimalEzDbPartsVersions && Array.isArray(this.minimalEzDbPartsVersions)) {
        this.minimalEzDbPartsVersions.forEach(pv => {
          returnArray.push(
            {
              name: pv.name,
              requiredVersion: pv.version,
              detectedVersion: (
                (
                  this.siemEmdbVersions &&
                  this.siemEmdbVersions.storedProcedureAndViewsVersions &&
                  Array.isArray(this.siemEmdbVersions.storedProcedureAndViewsVersions)
                    ? this.siemEmdbVersions.storedProcedureAndViewsVersions
                    : []
                ).find(spvv => {
                  if (String(spvv.name).toLowerCase() === String(pv.name).toLowerCase()) {
                    return true
                  }
                  return false
                }) || {}
              ).version
            }
          )
        })
      }
      return returnArray
    },
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('Admin'),
          link: '/Admin'
        },
        {
          title: 'SIEM'
        },
        {
          title: this.$t('Update Database')
        }
      ]
    }
  },
  methods: {
    ...mapActions('mainStore', ['getEmdbVersions', 'getMsSqlConfig', 'updateEmdb', 'updateExtraInformation']),
    promptToUpdateEmdb () {
      // ask to confirm
      this.$q.dialog({
        component: ConfirmDialog,
        parent: this,
        title: this.$t('Confirm'),
        message: this.$t('Do you want to connect to Database and update it?'),
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
