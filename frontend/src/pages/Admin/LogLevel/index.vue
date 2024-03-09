<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" :src="(darkMode ? 'logrhythm_logo_darkmode_wide.svg' : 'logrhythm_logo_lightmode_wide.svg')" alt="LogRhythm Open Collector">
      </q-toolbar>
    </q-header>
    <BreadCrumbs
      :crumbs="breadCrumbs"
    />
    <q-card class="">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('OC Admin Log Level') }}
          </q-card-section>
          <q-card-section>
            {{ $t('The Log Level will be set temporarily, that is until the next restart of the OC Admin container or reset it from here.') }}<br>
            {{ $t('This will only affect the Log Level on the OC Admin container / Backend.') }}
          </q-card-section>
          <q-card-section style="opacity: 0.6;">
            <q-icon class="q-ml-xl" name="keyboard_arrow_up" />{{ $t('Less logs') }}
          </q-card-section>
          <q-card-section class="">
            <q-slider
              v-if="logLevelIsValid"
              v-model="logLevel"
              class="q-ml-xl"
              vertical
              reverse
              snap
              :loading="true"
              :min="1"
              :max="7"
              :step="1"
              marker-labels
              markers
              selection-color="transparent"
            >
              <template v-slot:marker-label-group="{ markerMap }">
                <div
                  class="row items-center no-wrap"
                  :class="markerMap[logLevel].classes"
                  :style="markerMap[logLevel].style"
                >
                  <template>
                    <q-icon
                      size="sm"
                      class="q-mx-sm"
                      :color="logLevels[logLevel].color"
                      :name="logLevels[logLevel].icon"
                    />
                    <div class="">{{ $t(logLevels[logLevel].label) }}</div>
                  </template>
                </div>
              </template>
            </q-slider>
          </q-card-section>
          <q-card-section style="opacity: 0.6;">
            <q-icon class="q-ml-xl" name="keyboard_arrow_down" />{{ $t('More logs') }}
          </q-card-section>
        </q-card-section>

        <q-separator vertical />

        <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="save" color="primary" :loadind="saving" @click="saveLogLevel()" >
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Save') }}
              </q-tooltip>
            </q-btn>
            <q-btn icon="restore" :loading="reverting" @click="resetLogLevel()" >
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Revert to configuration file value') }}
              </q-tooltip>
            </q-btn>
            <q-btn icon="refresh" :loading="dataLoading" @click="loadCurrentLogLevel()">
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Get current Log Level') }}
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
import BreadCrumbs from 'components/BreadCrumbs.vue'

const logLevels = {
  1: {
    label: 'Debug',
    color: 'purple',
    icon: 'bug_report'
  },
  2: {
    label: 'Verbose',
    color: 'indigo',
    icon: 'campaign'
  },
  3: {
    label: 'Information',
    color: 'blue',
    icon: 'info'
  },
  4: {
    label: 'Warning',
    color: 'orange',
    icon: 'warning'
  },
  5: {
    label: 'Error',
    color: 'pink',
    icon: 'report'
  },
  6: {
    label: 'Critical',
    color: 'red',
    icon: 'new_releases'
  },
  7: {
    label: 'Silent',
    color: 'blue-grey',
    icon: 'volume_off'
  }
}

export default {
  name: 'PageAdminLogLevel',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { BreadCrumbs },
  data () {
    return {
      loading: false,
      saving: false,
      reverting: false,
      logLevels
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['temporaryLogLevel']),
    logLevel: {
      get: function () {
        return (
          this.temporaryLogLevel &&
          this.temporaryLogLevel.logLevel > 0 &&
          this.temporaryLogLevel.logLevel < 8
            ? this.temporaryLogLevel.logLevel
            : 7
        )
      },
      set: function (newValue) {
        if (newValue > 0 && newValue < 8 && this.temporaryLogLevel) {
          this.setTemporaryLoggingLevel({
            logLevel: newValue,
            logLevelName: logLevels[newValue].label
          })
        }
      }
    },
    logLevelIsValid () {
      return (
        this.logLevel > 0 &&
        this.logLevel < 8
      )
    },
    dataLoading () {
      return this.loading || this.saving || this.reverting
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
          title: this.$t('Logging')
        },
        {
          title: this.$t('Manage Log Level')
        }
      ]
    }
  },
  methods: {
    ...mapActions('mainStore', ['setTemporaryLoggingLevel', 'getTemporaryLoggingLevel', 'updateTemporaryLoggingLevel', 'revertTemporaryLoggingLevel']),
    loadCurrentLogLevel () {
      this.getTemporaryLoggingLevel(
        {
          loadingVariableName: 'loading',
          caller: this
        }
      )
    },
    saveLogLevel () {
      if (
        this.temporaryLogLevel &&
        this.temporaryLogLevel.logLevel > 0 &&
        this.temporaryLogLevel.logLevel < 8
      ) {
        this.updateTemporaryLoggingLevel(
          {
            newLoggingLevel: this.logLevel,
            loadingVariableName: 'saving',
            caller: this,
            onSuccessCallBack: this.loadCurrentLogLevel,
            onErrorCallBack: this.saveOrRevertLogLevelFailure
          }
        )
      }
    },
    resetLogLevel () {
      this.revertTemporaryLoggingLevel(
        {
          loadingVariableName: 'reverting',
          caller: this,
          onSuccessCallBack: this.loadCurrentLogLevel,
          onErrorCallBack: this.saveOrRevertLogLevelFailure
        }
      )
    },
    saveOrRevertLogLevelFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
      this.loadCurrentLogLevel()
    }
  },
  mounted () {
    this.loadCurrentLogLevel()
  }
}
</script>
