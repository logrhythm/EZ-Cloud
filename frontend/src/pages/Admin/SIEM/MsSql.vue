<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" :label="$t('Return to Admin')" :to="'/Admin'" />
        <q-toolbar-title style="opacity:.4" class="text-center">{{ $t('Admin : SIEM : Manage MS SQL Connection') }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-card class="q-pa-md q-mx-none">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('MS SQL Connection') }}
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="siemMsSqlHost"
              :label="$t('Hostname (XM or Platform Manager)')"
              autofocus
              :rules="[val => !!val || $t('Hostname cannot be empty')]"
            />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="siemMsSqlPort"
              :label="$t('MS SQL Port')"
              type="number"
              :rules="[
                val => val !== null && val !== '' || $t('Port must be specified'),
                val => val >= 1 && val <= 65535 || ('Port should be between 1 and 65535. Standard MS SQL port is 1433.')
              ]"
            />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="siemMsSqlUsername"
              :label="$t('Username')"
              :rules="[val => !!val || $t('Username cannot be empty')]"
            />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="siemMsSqlPassword"
              :label="$t('Password')"
              :rules="[val => !!val || $t('Really?! An empty Password?')]"
            />
          </q-card-section>

          <q-card-section class="q-pt-none q-mb-md">
            <q-toggle
              v-model="siemMsSqlEncrypt"
              :label="$t('Encrypt traffic')"
              left-label
              checked-icon="lock"
              unchecked-icon="lock_open"
              :color="(siemMsSqlEncrypt === true ? 'positive' : 'warning')"
              size="4rem"
            >
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Enable encryption between OC-Admin backend and MS SQL on the XM or Platform Manager (PM)') }}
              </q-tooltip>
            </q-toggle>
          </q-card-section>

        </q-card-section>

        <q-separator vertical />

        <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="save" color="primary" :loading="savingAction" @click="saveSettings()" >
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

  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageAdminSiemMsSQL',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      loadingMsSqlConfig: false,
      savingAction: false,
      siemMsSqlHost: null,
      siemMsSqlPort: 1433,
      siemMsSqlUsername: null,
      siemMsSqlPassword: null,
      siemMsSqlEncrypt: true
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['msSqlConfig'])
  },
  methods: {
    ...mapActions('mainStore', ['getMsSqlConfig', 'updateMsSqlConfig']),
    saveSettings () {
      this.saveOrUpdateUserRole()
    },
    prepVariables () {
      if (this.msSqlConfig) {
        this.siemMsSqlHost = this.msSqlConfig.host
        this.siemMsSqlPort = this.msSqlConfig.port
        this.siemMsSqlUsername = this.msSqlConfig.username
        this.siemMsSqlPassword = this.msSqlConfig.password
        this.siemMsSqlEncrypt = !!this.msSqlConfig.encrypt
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
    saveOrUpdateUserRole () {
      this.updateMsSqlConfig(
        {
          host: this.siemMsSqlHost,
          port: this.siemMsSqlPort,
          username: this.siemMsSqlUsername,
          password: this.siemMsSqlPassword,
          encrypt: this.siemMsSqlEncrypt,
          loadingVariableName: 'loadingMsSqlConfig',
          caller: this,
          onSuccessCallBack: this.loadMsSqlConfig,
          onErrorCallBack: this.saveOrUpdateMsSqlConfigFailure
        }
      )
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
