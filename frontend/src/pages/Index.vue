<template>
  <q-page class="flex flex-center">
    <!-- <img
      alt="EZ Cloud"
      src="~assets/ez-cloud-logo.svg"
    > -->
    <div>
      <div class="text-h2" style="opacity:.4">
        EZ Cloud Client
      </div>
      <div class="text-h6 text-right" style="opacity:.3">
        <q-tooltip content-style="font-size: 1em">
          <span class="text-bold">EZ Client version:</span> v{{version}}<br>
          <span class="text-bold">EZ Server version:</span> v{{serverVersion}}
        </q-tooltip>
        v{{ version }}
      </div>
      <div>
        <pre>{{ extraInformation }}</pre>
      </div>
      <div>
        <pre>needToConfigureMsSql: {{ needToConfigureMsSql }}</pre>
      </div>
    </div>

    <q-dialog v-model="needToConfigureMsSql" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="link_off" color="primary" text-color="white" />
          <div class="text-h6 q-ml-sm">{{ $t('No connection to the SIEM') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          The connection details to the SQL server on the SIEM are missing.
        </q-card-section>

        <q-card-section class="q-pt-none q-mb-md">
          Go to the Admin page and fix it.
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="$t('Close')" @click="promptIgnoreConfigureMsSql()" />
          <q-btn color="primary" :label="$t('Go to Admin')" to="Admin/SIEM/MsSql" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import { version } from '../../package.json'

export default {
  name: 'PageIndex',
  data () {
    return {
      version: version,
      hideNeedToConfigureMsSqlPopup: false
    }
  },
  computed: {
    ...mapState('mainStore', ['deployment', 'extraInformation']),
    serverVersion () {
      return (this.deployment && this.deployment.version ? this.deployment.version : '?.?.?')
    },
    needToConfigureMsSql () {
      // return this.extraInformation && this.extraInformation.msSqlConnectionConfigMissing
      return true && !this.hideNeedToConfigureMsSqlPopup
    }
  },
  methods: {
    promptIgnoreConfigureMsSql () {
      this.$q.dialog({
        title: 'Confirm',
        message: 'A lot of things will NOT work until this is configred. Are you sure you want to ignore this for now?',
        cancel: 'Yes',
        ok: 'No',
        persistent: true
      }).onOk(() => {
        // Do nothing
      }).onCancel(() => {
        this.hideNeedToConfigureMsSqlPopup = true
      })
    }
  }
}
</script>
