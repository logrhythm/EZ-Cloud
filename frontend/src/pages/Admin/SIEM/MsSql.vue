<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" :src="(darkMode ? 'logrhythm_logo_darkmode_wide.svg' : 'logrhythm_logo_lightmode_wide.svg')" alt="LogRhythm Open Collector">
        <q-btn no-caps flat dense icon="update" :label="$t('Update Database')" to="/Admin/SIEM/UpdateEmdb" />
      </q-toolbar>
    </q-header>

    <BreadCrumbs
      :crumbs="breadCrumbs"
    />

    <q-card class="">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('MS SQL Connection') }}
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ $t('OC-Admin backend needs access to the SIEM database for certain operations, like listing and managing the OpenCollector and OC-Admin related Log Sources.') }}<br>
            {{ $t('To accomplish this, it needs to know the PM or XM address and SQL credentials.') }}
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
                :disable="loadingMsSqlConfig"
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
                :disable="loadingMsSqlConfig"
                :label="$t('MS SQL Port')"
                type="number"
                :rules="[
                  val => val !== null && val !== '' || $t('Port must be specified'),
                  val => val >= 1 && val <= 65535 || ('Port should be between 1 and 65535. Standard MS SQL port is 1433.')
                ]"
              />
            </q-card-section>

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

            <q-card-section class="q-pt-none q-mb-md">
              <q-toggle
                v-model="siemMsSqlEncrypt"
                :disable="loadingMsSqlConfig"
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
            <q-btn icon="save" color="primary" :loading="savingAction" @click="saveSettings()" :disabled="!readyToSave" >
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Save settings') }}
              </q-tooltip>
            </q-btn>
            <q-btn icon="refresh" :loading="loadingMsSqlConfig" @click="loadMsSqlConfig()">
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Reload') }}
              </q-tooltip>
            </q-btn>
        </q-card-actions>

      </q-card-section>
    </q-card>

    <q-dialog v-model="promptForDatabaseUpgrade" persistent>
      <q-card style="min-width: 350px; max-width: 450px">
        <q-card-section>
          <div class="text-h6">{{ $t('Success') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="">{{ $t('Now that the MS SQL Connection is configured, the Database must be updated for all the features of OC Admin to work.') }}</div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="$t('Close')" v-close-popup />
          <q-btn color="primary" icon="update" :label="$t('Update Database')" to="/Admin/SIEM/UpdateEmdb" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  name: 'PageAdminSiemMsSQL',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { BreadCrumbs },
  data () {
    return {
      loadingMsSqlConfig: false,
      savingAction: false,
      siemMsSqlHost: null,
      siemMsSqlPort: 1433,
      siemMsSqlUsername: null,
      siemMsSqlPassword: null,
      siemMsSqlEncrypt: true,
      promptForDatabaseUpgrade: false
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['msSqlConfig', 'extraInformation']),
    readyToSave () {
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
          title: this.$t('Manage MS SQL Connection')
        }
      ]
    }
  },
  methods: {
    ...mapActions('mainStore', ['getMsSqlConfig', 'updateMsSqlConfig', 'updateExtraInformation']),
    saveSettings () {
      this.saveOrUpdateMsSqlConnectionConfiguration()
    },
    prepVariables () {
      if (this.msSqlConfig) {
        this.siemMsSqlHost = this.msSqlConfig.host
        this.siemMsSqlPort = this.msSqlConfig.port
        this.siemMsSqlUsername = this.msSqlConfig.username
        this.siemMsSqlPassword = this.msSqlConfig.password
        this.siemMsSqlEncrypt = !!this.msSqlConfig.encrypt

        // Update the Extra Information branch `msSqlConnectionConfigMissing`
        if (this.msSqlConfig.host && this.msSqlConfig.host.length) {
          if (this.extraInformation && this.extraInformation.msSqlConnectionConfigMissing) {
            // Turn is off
            const newExtraInformation = Object.assign({}, this.extraInformation)
            newExtraInformation.msSqlConnectionConfigMissing = false
            this.updateExtraInformation({ extraInformation: newExtraInformation })
          }
        } else {
          // Turn is on
          const newExtraInformation = Object.assign({}, this.extraInformation)
          newExtraInformation.msSqlConnectionConfigMissing = true
          this.updateExtraInformation({ extraInformation: newExtraInformation })
        }
      }
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
    saveOrUpdateMsSqlConnectionConfiguration () {
      this.updateMsSqlConfig(
        {
          host: this.siemMsSqlHost,
          port: this.siemMsSqlPort,
          username: this.siemMsSqlUsername,
          password: this.siemMsSqlPassword,
          encrypt: this.siemMsSqlEncrypt,
          loadingVariableName: 'loadingMsSqlConfig',
          caller: this,
          onSuccessCallBack: this.saveOrUpdateMsSqlConfigSuccess,
          onErrorCallBack: this.saveOrUpdateMsSqlConfigFailure
        }
      )
    },
    saveOrUpdateMsSqlConfigSuccess (payload) {
      this.loadMsSqlConfig()
      // Prompt the user to Update the Database now
      this.promptForDatabaseUpgrade = true
    },
    saveOrUpdateMsSqlConfigFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
      this.loadMsSqlConfig()
    }
  },
  mounted () {
    if (!(this.msSqlConfig && this.msSqlConfig.config && this.msSqlConfig.config.server.length)) {
      this.loadMsSqlConfig()
    }
  }
}
</script>
