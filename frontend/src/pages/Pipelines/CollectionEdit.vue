<template>
  <q-page class="q-pa-sm">
    <q-header elevated style="background: var(--q-color-dark);">
      <q-toolbar class="q-gutter-x-sm">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Properties" :to="'/Pipelines/' + this.pipelineUid + '/Properties'" />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="save" label="Save" color="primary" :disabled="!needsSaving" @click="save()" />
        <q-btn no-caps flat dense icon="restore" label="Reverse to last saved" @click="reverseToLastSavedPrompt()" />
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

        <q-toolbar-title style="opacity:.4" class="text-center">Collection Builder<span v-if="pipeline && pipeline.name && pipeline.name.length">:  {{ pipeline.name }}</span></q-toolbar-title>

        <q-btn no-caps flat dense icon="pending" label="Advanced">
          <q-menu>
            <div class="row no-wrap q-pa-md">
              <div class="column">
                <div class="text-h6 q-mb-md">Advanced</div>
                <q-toggle v-model="showCollectionConfig" label="Show Collection Configuration" />
                <q-toggle v-model="showCollectionMethodTemplate" label="Show Collection Method Template" />
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
                    <q-icon name="speed" />
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
                    <q-icon name="download" />
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
                    <q-icon name="download_for_offline" />
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
      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h6">
                Collection Method
            </q-card-section>
            <q-separator />
            <q-card-section>
                <q-select
                  dense
                  standout="bg-blue-5 text-white"
                  v-model="collectionMethod"
                  emit-value
                  map-options
                  :options="collectionMethodsOptions"
                  style="min-width: 20rem;"
                  class="q-mx-sm q-my-xs"
                  popup-content-class="bg-grey-9"
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
            Collection Parameters
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
                    <span class="text-italic" v-if="fieldTemplate.required">&nbsp;- 🟧 Required</span>
                    <span class="text-italic" v-if="fieldTemplate.readonly">&nbsp;- ⬛ Read Only</span>
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
              <span class="text-bold">Collection Params (JSON):</span><pre>{{ collectionConfig }}</pre>
            </div>
            <q-separator vertical color="green" />
            <div class="col">
              <span class="text-bold">Collection Params (Yaml):</span><pre>{{ collectionConfigYml }}</pre>
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
import FieldEditor from 'components/Pipelines/Collection/FieldEditor.vue'
import { dump } from 'js-yaml'
import Vue2Filters from 'vue2-filters'

export default {
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    Vue2Filters.mixin
  ],
  components: { FieldEditor },

  data () {
    return {
      pipelineUid: '',
      collectionConfig: {},
      needsSaving: false,
      collectionMethod: '',
      activeCollectionMethod: '',
      showCollectionConfig: false,
      showCollectionMethodTemplate: false
    }
  },

  computed: {
    ...mapState('mainStore', ['collectionMethodTemplates', 'collectionMethodsOptions']),
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
    collectionConfigYml () {
      if (this.activeCollectionMethod && this.activeCollectionMethod.length) {
        try {
          const jsonConfig = Object.assign({}, this.pipeline.collectionConfig)

          // trash our own stuff, as it has nothing to do in the file Yaml
          delete jsonConfig.activeCollectionMethod

          // and push it out as Yaml
          return dump([{ type: this.activeCollectionMethod, ...jsonConfig }])
        } catch (error) {
          return error
        }
      } else {
        return '# No Collection Method configured.'
      }
    },
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
        return this.collectionMethodsOptions.find(cmo => cmo.value && cmo.value === this.activeCollectionMethod) || { value: 'unknown', label: 'Unknown', icon: 'help_center' }
      } else {
        return { value: 'unknown', label: 'Unknown', icon: 'help_center' }
      }
    }
  },

  methods: {
    ...mapActions('mainStore', ['upsertPipeline']),
    reverseToLastSavedPrompt () {
      // Ask to confirm
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you REALLY want to lose all your un-saved changes and revert to the last Saved version?',
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
        this.reverseToLastSaved()
      }) // }).onOk(() => {
    },
    reverseToLastSaved () {
      try {
        // Bring back config from the store
        const pipeline = this.pipelines.find(p => p.uid === this.pipelineUid)
        this.collectionConfig = (pipeline && pipeline.collectionConfig ? JSON.parse(JSON.stringify(pipeline.collectionConfig)) : [])
        this.activeCollectionMethod = this.collectionConfig.collectionMethod
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
          title: 'Confirm',
          message: 'You will lose any un-saved changes and start fresh with the new Collection Method. Are you sure?',
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
          this.switchCollectionMethod()
        }) // }).onOk(() => {
      } else {
        this.switchCollectionMethod()
      }
    },
    switchCollectionMethod () {
      this.activeCollectionMethod = (this.collectionMethod && this.collectionMethod.value ? this.collectionMethod.value : this.collectionMethod)

      // If it's different than before, wipe the current config, and start fresh
      if (!this.collectionConfig.collectionMethod || (this.collectionConfig.collectionMethod !== this.activeCollectionMethod)) {
        // this.collectionConfig.collectionMethod = this.activeCollectionMethod
        const newConf = {
          collectionMethod: this.activeCollectionMethod,
          enabled: true,
          fields: {
            stream_id: this.pipelineUid,
            stream_name: this.pipeline.name
          }
        }
        // For Flat files:
        if (this.activeCollectionMethod === 'log') {
          newConf.paths = ['/var/log/' + this.pipeline.name + '_' + this.pipeline.uid + '/*.log']
        }

        // For Syslog:
        if (this.activeCollectionMethod === 'syslog') {
          newConf['protocol.udp.host'] = '0.0.0.0:514'

          newConf['protocol.tcp.host'] = '0.0.0.0:514'

          newConf['protocol.tcp.ssl.enabled'] = false
          newConf['protocol.tcp.ssl.certificate'] = '/etc/filebeat/certificates/ez_stream_' + this.pipeline.uid + '.crt'
          newConf['protocol.tcp.ssl.key'] = '/etc/filebeat/certificates/ez_stream_' + this.pipeline.uid + '.key'
          newConf['protocol.tcp.ssl.supported_protocols'] = ['TLSv1.1', 'TLSv1.2', 'TLSv1.3']

          // newConf['protocol.tcp.ssl'] = {
          // }
          // newConf['protocol.tcp'] = {
          // }
          // newConf['protocol.udp'] = {
          // }
        }

        // For HTTP / REST API:
        if (this.activeCollectionMethod === 'httpjson') {
          newConf.config_version = 2
          newConf['request.url'] = 'https://CHANGE_THIS'
          // newConf['request.method'] = 'GET'
        }

        this.collectionConfig = newConf
        this.needsSaving = true
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
    collectionConfig: {
      handler () {
        this.needsSaving = true
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.fixed-font {
    font-family: monospace;
}
</style>
