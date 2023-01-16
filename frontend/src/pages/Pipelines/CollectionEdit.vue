<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" src="logrhythm_logo_wide.svg" alt="LogRhythm Open Collector">
        <q-btn no-caps flat dense icon="arrow_back" :label="$t('Return to Properties')" :to="'/Pipelines/' + this.pipelineUid + '/Properties'" />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="save" :label="$t('Save')" color="primary" :disabled="!needsSaving" @click="save()" />
        <q-btn no-caps flat dense icon="restore" :label="$t('Reverse to last saved')" @click="reverseToLastSavedPrompt()" />
        <!-- <q-separator vertical />
        <q-btn no-caps flat dense icon="play_circle_outline" label="Start Live Tail" color="secondary" @click="tailEnabled = true" v-if="!tailEnabled" />
        <q-btn no-caps flat dense icon="stop" label="Stop Live Tail" @click="tailEnabled = false" v-else /> -->
        <!-- <q-separator vertical />
        <q-btn no-caps flat dense icon="search" label="Start background processing" color="secondary" @click="processInBackground = true" v-if="!processInBackground" />
        <q-btn no-caps flat dense icon="search_off" label="Stop background processing" @click="processInBackground = false" v-else /> -->
        <!-- <q-separator vertical />
        <q-btn no-caps flat dense icon="file_download" label="Export JQ" />
        <q-btn no-caps flat dense icon="visibility" label="Show JQ" v-if="!showJqOutput" @click="buildJqFilter(); buildJqTransform(); showJqOutput = true" />
        <q-btn no-caps flat dense icon="visibility_off" label="Hide JQ output" v-else @click="showJqOutput = false" /> -->

        <q-space />

        <q-btn no-caps flat dense icon="pending" :label="$t('Advanced')"  >
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">{{ $t('Advanced') }}</div>
                <q-toggle v-model="showCollectionConfig" :label="$t('Show Collection Configuration')" />
                <q-toggle v-model="showCollectionMethodTemplate" :label="$t('Show Collection Method Template')" />
              </div>
            </div>
          </q-menu>
        </q-btn>
        <!-- <q-btn no-caps flat dense icon="settings" label="Settings">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-item class="q-pl-none" >
                <q-toggle v-model="showTypesInMainList" label="Show types in Fields list" />
                </q-item>
                <q-item class="q-pl-none" >
                <q-toggle v-model="showTypesInPopup" label="Show types in Value popups" />
                </q-item>
                <q-item class="q-pl-none" >
                <q-toggle v-model="wrapSingleStringLog" label="Accept and Wrap non-JSON logs" />
                </q-item>
                <q-item class="q-pl-none" >
                  <q-toggle v-model="extractMessageFieldOnly" label="Extract Filebeat '.message' only" />
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="o_speed" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="processInBackgroundMaxRate"
                      :min="1"
                      :max="10"
                      label
                      :label-value="'Background Process max: ' + processInBackgroundMaxRate + ' / second'"
                    />
                  </q-item-section>
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="o_download" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="queueInMaxSize"
                      :min="1"
                      :max="2000"
                      label
                      :label-value="'Max messages in Queue In: ' + queueInMaxSize"
                    />
                  </q-item-section>
                </q-item>
                <q-item  style="width: 20rem;">
                  <q-item-section avatar>
                    <q-icon name="o_download_for_offline" />
                  </q-item-section>
                  <q-item-section>
                    <q-slider
                      v-model="processedLogsMaxSize"
                      :min="1"
                      :max="1000"
                      label
                      :label-value="'Max messages in Processed Logs: ' + processedLogsMaxSize"
                    />
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </q-menu>
        </q-btn> -->
      </q-toolbar>
    </q-header>
    <div class="q-gutter-y-md">
      <BreadCrumbs
        :crumbs="breadCrumbs"
        :pageTitle="(pipeline && pipeline.name && pipeline.name.length ? `Collection Builder: ${pipeline.name}` : 'Collection Builder')"
      />
      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h6">
                {{ $t('Collecting Shipper') }}
            </q-card-section>
            <q-separator />
            <q-card-section>
                <q-select
                  dense
                  standout="bg-blue-4 text-white"
                  v-model="collectionShipper"
                  emit-value
                  map-options
                  :options="collectionShippersOptions"
                  style="min-width: 20rem;"
                  class="q-mx-sm q-my-xs"
                />
            </q-card-section>
          </q-card-section>

          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h6">
                {{ $t('Collection Method') }}
            </q-card-section>
            <q-separator />
            <q-card-section>
                <q-select
                  dense
                  standout="bg-blue-4 text-white"
                  v-model="collectionMethod"
                  emit-value
                  map-options
                  :options="collectionMethodsOptions.filter(cmo => cmo.shipper == collectionShipper)"
                  style="min-width: 20rem;"
                  class="q-mx-sm q-my-xs"
                />
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
            <q-btn glossy class="full-height" color="primary" icon="check_circle_outline" @click="switchCollectionMethodPrompt()" >
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Switch to this Collection Method.') }}
              </q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
      <q-card v-if="activeCollectionMethod && activeCollectionMethod.length">
        <q-card-section class="text-h6 row">
            {{ $t('Collection Parameters') }}
            <q-space />
            <div class="text-teal-4">
              {{ currentCollectionMethodOption.label }}
            </div>
            <q-icon :name="currentCollectionMethodOption.icon" size="md" color="teal-4" class="q-ml-md">
              <q-tooltip content-style="font-size: 1rem;">
                {{ currentCollectionMethodOption.label }}
              </q-tooltip>
            </q-icon>
        </q-card-section>
        <q-separator />
        <div class="">
          <q-card-section
            v-for="(group, groupIndex) in templateGroups"
            :key="groupIndex"
            class="q-gutter-x-sm row"
          >
            <q-separator vertical color="blue-9" size="1px" />
            <q-expansion-item
              :default-opened="groupIndex === 0"
              :label="group"
              header-class="text-bold text-blue-4"
              class="q-gutter-y-md col"
            >
              <q-card-section
                v-for="(fieldTemplate, fieldIndex) in (collectionMethodTemplate && collectionMethodTemplate.definition ? collectionMethodTemplate.definition : []).filter(template => template.group && template.group === group)"
                :key="fieldIndex"
              >
                <div class="q-mb-sm">
                  <span class="text-bold q-mr-md">{{ fieldTemplate.label }}</span>
                  <span style="opacity: .6">
                    (&nbsp;<span class="fixed-font">{{ fieldTemplate.name }}</span>&nbsp;)
                    <span class="text-italic" v-if="fieldTemplate.required">&nbsp;{{ $t('- 🟧 Required') }}</span>
                    <span class="text-italic" v-if="fieldTemplate.readonly">&nbsp;{{ $t('- ⬛ Read Only') }}</span>
                  </span>
                </div>
                <FieldEditor
                  :template="fieldTemplate"
                  v-model="collectionConfig[fieldTemplate.name]"
                />
              </q-card-section>
            </q-expansion-item>
          </q-card-section>
        </div>
      </q-card>
      <q-separator color="green" size="2px" v-if="showCollectionConfig"/>
      <q-card v-if="showCollectionConfig">
        <q-card-section>
          <div class="row q-gutter-x-lg">
            <div class="col">
              <span class="text-bold">{{ $t('Collection Params (JSON):') }}</span><pre>{{ collectionConfig }}</pre>
            </div>
            <q-separator vertical color="green" />
            <div class="col">
              <span class="text-bold">{{ $t('Collection Params (Yaml):') }}</span><pre>{{ collectionConfigYml }}</pre>
            </div>
          </div>

        </q-card-section>
      </q-card>
      <q-separator color="purple" size="2px"  v-if="showCollectionMethodTemplate"/>
      <q-card v-if="showCollectionMethodTemplate">
        <q-card-section>
          <pre>{{ collectionMethodTemplate }}</pre>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import FieldEditor from 'components/Pipelines/Collection/FieldEditor.vue'
// import { dump } from 'js-yaml'
import Vue2Filters from 'vue2-filters'
import { collectionConfigToYml } from 'src/pages/Pipelines/collectionConfigToYml'
import ConfirmDialog from 'components/Dialogs/ConfirmDialog.vue'
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    Vue2Filters.mixin
  ],
  components: { BreadCrumbs, FieldEditor },

  data () {
    return {
      pipelineUid: '',
      collectionConfig: {},
      needsSaving: false,
      collectionShipper: '',
      collectionMethod: '',
      activeCollectionShipper: '',
      activeCollectionMethod: '',
      showCollectionConfig: false,
      showCollectionMethodTemplate: false,
      collectionConfigYml: ''
    }
  },

  computed: {
    ...mapState('mainStore', ['collectionMethodTemplates', 'collectionMethodsOptions', 'collectionShippersOptions']),
    pipeline () {
      const pipeline = this.pipelines.find(p => p.uid === this.pipelineUid)
      return (pipeline || {
        uid: '',
        name: '',
        status: 'New', // New, Dev, Ready
        primaryOpenCollector: '', // UID of the main OC
        fieldsMapping: [],
        collectionConfig: {}
      })
    },
    collectionMethodTemplate () {
      return this.collectionMethodTemplates.find(template => template.collectionMethod === this.activeCollectionMethod)
    },
    // collectionConfigYml () {
    //   if (this.activeCollectionMethod && this.activeCollectionMethod.length) {
    //     return collectionConfigToYml(this.pipeline.collectionConfig)
    //   } else {
    //     return '# No Collection Method configured.'
    //   }
    // },
    templateGroups () {
      // Go through each template definition and extract the Groups
      const templates = (this.collectionMethodTemplate && this.collectionMethodTemplate.definition ? this.collectionMethodTemplate.definition : [])
        .filter(template => template.group && template.group.length)

      return (templates.length
        ? templates.reduce((groups, template) => {
          if (!groups.includes(template.group)) {
            groups.push(template.group)
          }
          return groups
        }, [])
        : [])
    },
    currentCollectionMethodOption () {
      if (this.activeCollectionMethod && this.activeCollectionMethod.length) {
        return this.collectionMethodsOptions.find(cmo => cmo.value && cmo.value === this.activeCollectionMethod) || { value: 'unknown', label: this.$t('Unknown'), icon: 'help_center' }
      } else {
        return { value: 'unknown', label: this.$t('Unknown'), icon: 'help_center' }
      }
    },
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('Pipelines'),
          link: '/Pipelines'
        },
        {
          title: (this.pipeline && this.pipeline.name && this.pipeline.name.length ? this.pipeline.name : '...'),
          icon: null,
          link: `/Pipelines/${this.pipelineUid}/Properties`,
          disabled: !(this.pipelineUid && this.pipelineUid.length)
        },
        {
          title: this.$t('Properties'),
          link: `/Pipelines/${this.pipelineUid}/Properties`,
          disabled: !(this.pipelineUid && this.pipelineUid.length)
        },
        {
          title: this.$t('Collection Builder')
        }
      ]
    }
  },

  methods: {
    ...mapActions('mainStore', ['upsertPipeline']),
    reverseToLastSavedPrompt () {
      // Ask to confirm
      this.$q.dialog({
        component: ConfirmDialog,
        parent: this,
        title: this.$t('Confirm'),
        message: this.$t('Do you REALLY want to lose all your un-saved changes and revert to the last Saved version?'),
        persistent: true
      }).onOk(() => {
        this.reverseToLastSaved()
      }) // }).onOk(() => {
    },
    reverseToLastSaved () {
      try {
        // Bring back config from the store
        const pipeline = this.pipelines.find(p => p.uid === this.pipelineUid)
        this.collectionConfig = (pipeline && pipeline.collectionConfig ? JSON.parse(JSON.stringify(pipeline.collectionConfig)) : [])
        this.activeCollectionShipper = this.collectionConfig.collectionShipper
        this.activeCollectionMethod = this.collectionConfig.collectionMethod
        this.collectionShipper = this.activeCollectionShipper
        this.collectionMethod = this.activeCollectionMethod

        // Flag down the need to Save as data is fresh from last save now
        this.needsSaving = false
      } catch {
        console.log('Can\'t parse JSON')
      }
    },
    save () {
      this.needsSaving = false
      this.upsertPipeline(
        {
          caller: this,
          pushToApi: true,
          pipeline:
          {
            uid: this.pipelineUid,
            status: (this.pipeline && this.pipeline.status && this.pipeline.status === 'Ready' ? this.pipeline.status : 'Dev'),
            collectionConfig: JSON.parse(JSON.stringify(this.collectionConfig))
          }
        }
      )
    },
    switchCollectionMethodPrompt () {
      console.log(this.collectionConfig)
      if (this.collectionConfig && this.collectionConfig.collectionMethod && this.collectionConfig.collectionMethod.length) {
        // Ask to confirm
        this.$q.dialog({
          component: ConfirmDialog,
          parent: this,
          title: this.$t('Confirm'),
          message: this.$t('You will lose any un-saved changes and start fresh with the new Collection Method. Are you sure?'),
          persistent: true
        }).onOk(() => {
          this.switchCollectionMethod()
        }) // }).onOk(() => {
      } else {
        this.switchCollectionMethod()
      }
    },
    switchCollectionMethod () {
      this.activeCollectionShipper = (this.collectionShipper && this.collectionShipper.value ? this.collectionShipper.value : this.collectionShipper)
      this.activeCollectionMethod = (this.collectionMethod && this.collectionMethod.value ? this.collectionMethod.value : this.collectionMethod)

      // If it's different than before, wipe the current config, and start fresh
      if (!this.collectionConfig.collectionMethod || (this.collectionConfig.collectionMethod !== this.activeCollectionMethod)) {
        // this.collectionConfig.collectionMethod = this.activeCollectionMethod
        const newConf = {
          collectionShipper: this.activeCollectionShipper,
          collectionMethod: this.activeCollectionMethod
        }

        // Set the initial default values based on the Template, if available
        if (this.collectionMethodTemplate && this.collectionMethodTemplate.initialDefaultValues) {
          Object.keys(this.collectionMethodTemplate.initialDefaultValues).forEach((fieldName) => {
            newConf[fieldName] = this.collectionMethodTemplate.initialDefaultValues[fieldName]
          })
        }

        // For filebeat:
        if (this.activeCollectionShipper === 'filebeat') {
          newConf.enabled = true
          newConf.fields = {
            stream_id: this.pipelineUid,
            stream_name: this.pipeline.name
          }

          // For Flat files:
          if (this.activeCollectionMethod === 'log') {
            newConf.paths = ['/var/log/' + this.pipeline.name + '_' + this.pipeline.uid + '/*.log']
          }

          // For Syslog:
          if (this.activeCollectionMethod === 'syslog_udp') {
            newConf['protocol.udp.host'] = '0.0.0.0:514'

            // newConf['protocol.udp'] = {
            // }
          }

          if (this.activeCollectionMethod === 'syslog_tcp') {
            newConf['protocol.tcp.host'] = '0.0.0.0:514'

            newConf['protocol.tcp.ssl.enabled'] = false
            newConf['protocol.tcp.ssl.certificate'] = '/etc/filebeat/certificates/ez_stream_' + this.pipeline.uid + '.crt'
            newConf['protocol.tcp.ssl.key'] = '/etc/filebeat/certificates/ez_stream_' + this.pipeline.uid + '.key'
            newConf['protocol.tcp.ssl.supported_protocols'] = ['TLSv1.1', 'TLSv1.2', 'TLSv1.3']

            // newConf['protocol.tcp.ssl'] = {
            // }
            // newConf['protocol.tcp'] = {
            // }
          }

          // For HTTP / REST API:
          if (this.activeCollectionMethod === 'httpjson') {
            newConf.config_version = 2
            newConf['request.url'] = 'https://CHANGE_THIS'
            // newConf['request.method'] = 'GET'
          }
          if (this.activeCollectionMethod === 'genericbeat') {
            newConf.config_version = 2
            newConf['request.url'] = 'https://CHANGE_THIS'
          }
        }

        // For jsBeat:
        if (this.activeCollectionShipper === 'jsBeat') {
          newConf.uid = this.pipelineUid
          newConf.name = this.pipeline.name
          newConf.deviceType = this.pipeline.name.replace(/[^a-zA-Z0-9]/g, '_')
          newConf.active = true
          newConf.filterHelpers = {
            stream_id: this.pipelineUid,
            stream_name: this.pipeline.name
          }

          if (this.activeCollectionMethod === 'flatFile') {
            newConf.baseDirectoryPath = '/var/log/' + String(this.pipeline.name).replace(/\s/g, '_') + '_' + this.pipeline.uid + '/'
            newConf.inclusionFilter = '*.log'
            newConf.multiLines = {
              msgStartRegex: '',
              msgStopRegex: '',
              msgDelimiterRegex: ''
            }
          }
        }

        // Identification for LogRhythm Beats:
        // `collectionMethodTemplate.identificationStyle` is an array of flags
        // LogRhythm Beats use the `logrhythmBeat` flag
        if (
          this.collectionMethodTemplate &&
          this.collectionMethodTemplate.identificationStyle &&
          Array.isArray(this.collectionMethodTemplate.identificationStyle) &&
          this.collectionMethodTemplate.identificationStyle.includes('logrhythmBeat')
        ) {
          // We are limited to 12 characters to ID the Beat
          // - let's use the first 3 chars from the UID, so to reduce the chances of collision
          // - then add the Stream name and full UID
          // - then truncate back to 12 chars max.
          newConf.beatIdentifier = String(this.pipeline.uid.substring(0, 3) + '_' + this.pipeline.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + this.pipeline.uid).substring(0, 12)
          newConf.logsource_name = this.pipeline.name
        }

        this.collectionConfig = newConf
        this.needsSaving = true
      }
    },
    buildYmlConfig () {
      console.log('buildYmlConfig')
      if (this.activeCollectionMethod && this.activeCollectionMethod.length) {
        this.collectionConfigYml = collectionConfigToYml(this.pipeline.collectionConfig)
      } else {
        this.collectionConfigYml = '# ' + this.$t('No Collection Method configured.')
      }
    },
    collectionShipperHasChanged () {
      console.log('collectionShipperHasChanged')
      this.needsSaving = true
      if (this.showCollectionConfig) {
        this.buildYmlConfig()
      }
    },
    collectionConfigHasChanged () {
      console.log('collectionConfigHasChanged')
      this.needsSaving = true
      if (this.showCollectionConfig) {
        this.buildYmlConfig()
      }
    }
  },

  mounted () {
    if (this.$route.params.pipelineUid && this.$route.params.pipelineUid.length) {
      if (this.pipelineUid !== this.$route.params.pipelineUid) {
        this.pipelineUid = this.$route.params.pipelineUid
      }
    }

    // Load the Collection configuration, if any
    this.reverseToLastSaved()

    this.switchCollectionMethod()
  },

  watch: {
    collectionShipper: {
      handler () {
        this.collectionShipperHasChanged()
      },
      deep: true
    },
    collectionConfig: {
      handler () {
        this.collectionConfigHasChanged()
      },
      deep: true
    },
    showCollectionConfig: {
      handler (value) {
        if (value) {
          this.buildYmlConfig()
        }
      },
      deep: false
    }
  }
}
</script>

<style scoped>
.fixed-font {
    font-family: monospace;
}
</style>
