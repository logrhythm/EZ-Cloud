<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Market Place Pipeline Templates" :to="'/MarketPlace/PipelineTemplates'" />
        <q-separator spaced vertical />
        <q-btn no-caps flat dense icon="input" color="primary" label="Import" >
          <q-menu>
            <q-list style="min-width: 20rem">
              <q-item clickable v-close-popup @click="doPromptForNewPipelineDetails()">
                <q-item-section avatar top>
                  <q-avatar icon="auto_awesome" color="primary" text-color="white" >
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">Into new Pipeline</q-item-label>
                  <q-item-label caption>Create a new Pipeline and import this Template</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-close-popup disabled>
                <q-item-section avatar top>
                  <q-avatar icon="input" color="purple-10" text-color="white" >
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">Into existing Pipeline</q-item-label>
                  <q-item-label caption>Override parts of an existing Pipeline with this Template</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-toolbar-title style="opacity:.4" class="text-center">EZ Market Place : Pipeline Templates : {{ ezMarketPipelineTemplate.name }}</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-card class="q-pa-md q-mx-none q-mb-md">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              Properties
          </q-card-section>
          <q-card-section class="row">
            <div>
              <IconPicture
                :pngBase64="ezMarketPipelineTemplate.iconPicture"
                :size="150"
              />
            </div>
            <div class="q-ml-md col">
              <div class="row">
                <div>
                  <div class="text-h5">
                    {{ ezMarketPipelineTemplate.name }}
                  </div>
                  <div class="text-caption text-italic">
                    {{ ezMarketPipelineTemplate.uid }}
                  </div>
                </div>

                <q-space />

                <div class="row">
                  <div>
                    <q-icon name="visibility" color="positive" size="lg" v-if="ezMarketPipelineTemplate.status === 'Visible'" />
                    <q-icon name="visibility_off" style="opacity: .5;" size="lg" v-else-if="ezMarketPipelineTemplate.status === 'Hidden'" />
                    <q-icon name="pending_actions" color="primary" size="lg" v-else-if="ezMarketPipelineTemplate.status === 'Pending review'" />
                    <q-icon name="assignment_late" color="negative" style="opacity: .75;" size="lg" v-else-if="ezMarketPipelineTemplate.status === 'Failed Review'" />
                    <q-icon name="auto_delete" color="negative" style="opacity: .5;" size="lg" v-else-if="ezMarketPipelineTemplate.status === 'To be deleted'" />
                    <q-icon name="question_mark" color="orange" size="lg" v-else />
                  </div>
                  <div class="q-ml-sm">
                    <div class="text-bold">
                      {{ ezMarketPipelineTemplate.status }}
                    </div>
                    <div class="text-caption">
                      {{ ezMarketPipelineTemplate.statusDescription }}
                    </div>
                  </div>
                </div>
              </div>

              <q-separator spaced />

              <div class="row justify-between">
                <div class="">
                  <div class="">
                    <span class="text-bold">Created:</span> {{ timeAgo(ezMarketPipelineTemplate.created) }}
                    <q-tooltip content-style="font-size: 1rem;">
                      {{ ezMarketPipelineTemplate.created }}
                    </q-tooltip>
                  </div>
                  <div class="">
                    <span class="text-bold">Modified:</span> {{ timeAgo(ezMarketPipelineTemplate.modified) }}
                    <q-tooltip content-style="font-size: 1rem;">
                      {{ ezMarketPipelineTemplate.modified }}
                    </q-tooltip>
                  </div>
                </div>
                <div class="text-h6">
                  by
                </div>
                <div class="text-center">
                  <Identicon :identity="ezMarketPipelineTemplate.publisher" />
                  <div class="">
                    <div class="text-bold">
                      {{ ezMarketPipelineTemplate.publisher }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>

    <q-card class="q-pa-md q-mx-none q-mb-md">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              Read Me
          </q-card-section>
          <q-card-section class="">
            <q-markdown
              class="col"
              :src="readmeMarkdown"
              no-heading-anchor-links
            />
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>

    <q-card class="q-pa-md q-mx-none q-mb-md">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              Collection
          </q-card-section>
          <q-card-section class="row items-center">
            <span class="text-bold">Shipper and Method: </span>
            <div class="q-ml-md text-center">
              <img v-if="collectionShipperOption.icon && collectionShipperOption.icon.length" :src="'/shippers/' + collectionShipperOption.icon + '.svg'" width="64px">
              <div>{{ collectionShipperOption.label }}</div>
            </div>
            <div class="q-ml-xl text-center">
              <q-icon :name="collectionMethodOption.icon" size="64px" />
              <div>{{ collectionMethodOption.label }}</div>
            </div>
          </q-card-section>
            <q-card-section>
              <div class="">
                <div class="text-bold">Collection Configuration:</div>
                <div class="row q-my-sm">
                  <q-separator vertical size="2px" color="teal" />
                  <div class="q-ml-sm"><pre>{{ collectionConfigOutput }}</pre></div>
                </div>
              </div>
            </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>

    <q-card class="q-pa-md q-mx-none q-mb-md">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="row wrap justify-between">
            <div class="text-h4">
              Fields Mapping
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
            </div>
          </q-card-section>
          <q-card-section class="">
            <q-table
              :data="tableData"
              :columns="columns"
              row-key="name"
              dense
              no-data-label="No Fields to display."
              :filter="searchFilter"
              :loading="pipelineTemplateLoading"
              rows-per-page-label="Fields per page:"
              :pagination.sync="pagination"
            >

              <template v-slot:body-cell-frequency="props">
                <q-td :props="props" style="width: 3em;">
                  <div>
                    <q-tooltip content-style="font-size: 1em;">
                      Seen in <span style="font-weight: bold;">{{ (maxSeenInLog != 0 ? Math.round(props.value / maxSeenInLog * 100) : 0) }}%</span> of logs in the sample ({{ props.value }}&nbsp;/&nbsp;{{ maxSeenInLog }}).
                    </q-tooltip>
                    <q-linear-progress :value="props.value / maxSeenInLog" :color="(darkMode ? 'blue-10' : 'blue-7')" rounded size="1em" />
                  </div>
                </q-td>
              </template>

            </q-table>
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>

    <q-card class="q-pa-md q-mx-none q-mb-md">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              RAW
          </q-card-section>
          <q-card-section class="">
              <pre>{{ ezMarketPipelineTemplate }}</pre>
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showImportPopupNewPipeline" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('Import Template into a new Pipeline') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="newPipelineName" autofocus label="Pipeline Name" @keyup.esc="showImportPopupNewPipeline = false" @keyup.enter="ImportIntoNewPipeline()" :rules="[val => !!val || $t('Pipeline name cannot be empty')]" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select dense v-model="newPipelineOpenCollector" :options="openCollectorsOptions" label="Primary Open Collector" emit-value map-options />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list style="min-width: 400px">
            <q-item-label header>Import Options</q-item-label>
            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>Import Collection Configuation</q-item-label>
                <q-item-label caption>Include the Shipper's Collection Configuation</q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-toggle v-model="importCollectionConfiguration" />
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>Import Fields Mapping</q-item-label>
                <q-item-label caption>Include the Shipper's Collection Configuation</q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-toggle v-model="importFieldsMapping" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="text-primary q-mt-md">
          <q-btn flat :label="$t('Cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('Create from Template')" v-close-popup :disabled="!(newPipelineName.length && (importCollectionConfiguration || importFieldsMapping))" @click="ImportIntoNewPipeline()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedShipperAndCollectionsHelpers from 'src/mixins/mixin-Shared-ShipperAndCollectionsHelpers'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import Identicon from 'components/Publisher/Identicon.vue'
import IconPicture from 'components/Pipelines/IconPicture.vue'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

export default {
  name: 'PageMarketPipelineTemplateProperties',
  mixins: [
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedShipperAndCollectionsHelpers, // Shared funtion to provide info (icon, names, etc...) for Shippers and Collections methods
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ],
  components: { Identicon, IconPicture },
  data () {
    return {
      pipelineTemplateUid: '',
      searchFilter: '',
      columns: [
        { name: 'frequency', align: 'center', label: 'Frequency', field: 'seenInLogCount', sortable: true },
        { name: 'Fields', align: 'left', label: 'Field Full Paths', field: 'name', sortable: true, classes: '', style: 'font-family: monospace; white-space: pre-line;' },
        { name: 'mapping', align: 'center', label: 'Mappings', field: 'mappedField', sortable: true },
        { name: 'modifiers', align: 'center', label: 'Modifiers', field: row => (row.modifiers && Array.isArray(row.modifiers) ? row.modifiers.join(', ') : null), sortable: true }
      ],
      pagination: {
        sortBy: 'mapping',
        descending: true, // Mapped fields first
        rowsPerPage: 25
      },
      pipelineTemplateLoading: false,
      showImportPopupNewPipeline: false,
      newPipelineName: '',
      newPipelineOpenCollector: null,
      newPipelineStatus: null,
      importCollectionConfiguration: true,
      importFieldsMapping: true
    }
  },
  computed: {
    ...mapState('mainStore', ['collectionMethodsOptions', 'collectionShippersOptions', 'ezMarketPipelineTemplate']),
    readmeMarkdown () {
      return (this.ezMarketPipelineTemplate && this.ezMarketPipelineTemplate.readmeMarkdown ? this.ezMarketPipelineTemplate.readmeMarkdown : '')
    },
    collectionMethod () {
      return (this.ezMarketPipelineTemplate.collection_configuration && this.ezMarketPipelineTemplate.collection_configuration.collectionConfig && this.ezMarketPipelineTemplate.collection_configuration.collectionConfig.collectionMethod ? this.ezMarketPipelineTemplate.collection_configuration.collectionConfig.collectionMethod : '')
    },
    collectionShipper () {
      return (this.ezMarketPipelineTemplate.collection_configuration && this.ezMarketPipelineTemplate.collection_configuration.collectionConfig && this.ezMarketPipelineTemplate.collection_configuration.collectionConfig.collectionShipper ? this.ezMarketPipelineTemplate.collection_configuration.collectionConfig.collectionShipper : '')
    },
    collectionMethodOption () {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'help_center' }
      if (this.collectionMethod && this.collectionMethod.length) {
        return this.collectionMethodsOptions.find(cmo => cmo.value && cmo.value === this.collectionMethod) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionShipperOption () {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'unknown', outputFormat: 'json' }
      if (this.collectionShipper && this.collectionShipper.length) {
        return this.collectionShippersOptions.find(cso => cso.value && cso.value === this.collectionShipper) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionConfigOutput () {
      let output = ''
      // Transform the JSON config into Yaml
      if (this.collectionShipper && this.collectionShipper.length) {
        if (this.collectionShipperOption && this.collectionShipperOption.outputFormat && this.collectionShipperOption.outputFormat.length) {
          if (this.collectionMethod && this.collectionMethod.length) {
            // Calling collectionConfigOutputFor from Mixin mixin-Shared-ShipperAndCollectionsHelpers
            output = this.collectionConfigOutputFor(this.collectionShipperOption.outputFormat, this.ezMarketPipelineTemplate.collection_configuration.collectionConfig)
          } else {
            output = '# No Collection Method configured.'
          }
        } else {
          output = '# Unknown output format.'
        }
      } else {
        output = '# No Collecting Shipper configured.'
      }
      return output
    },
    tableData () {
      return (
        this.ezMarketPipelineTemplate &&
        this.ezMarketPipelineTemplate.mapping_configuration &&
        this.ezMarketPipelineTemplate.mapping_configuration.fieldsMapping
          ? this.ezMarketPipelineTemplate.mapping_configuration.fieldsMapping
          : []
      )
    },
    maxSeenInLog () {
      let max = 0
      this.tableData.forEach(row => {
        if (row.seenInLogCount > max) {
          max = row.seenInLogCount
        }
      })
      return max
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
  }, // computed
  methods: {
    ...mapActions('mainStore', ['loadEzMarketPipelineTemplateById', 'upsertPipeline']),
    timeAgo (timestamp) {
      let formattedTimeAgo = 'Some time ago'
      try {
        // Create formatter (English).
        const timeAgo = new TimeAgo('en-US')
        // Format the time
        formattedTimeAgo = timeAgo.format(new Date(timestamp))
      } catch (error) {
        // Fails silently
      }
      return formattedTimeAgo
    },
    doPromptForNewPipelineDetails () {
      this.newPipelineName = ''
      this.newPipelineOpenCollector = null
      this.newPipelineStatus = null
      this.importCollectionConfiguration = true
      this.importFieldsMapping = true

      this.showImportPopupNewPipeline = true
    },
    ImportIntoNewPipeline () {
      if (this.newPipelineName.length && (this.importCollectionConfiguration || this.importFieldsMapping)) {
        this.showImportPopupNewPipeline = false
        this.upsertPipeline(
          {
            pushToApi: true,
            caller: this,
            pipeline:
            {
              uid: '',
              name: this.newPipelineName,
              status: (this.newPipelineStatus && this.newPipelineStatus.length ? this.newPipelineStatus : 'New'),
              primaryOpenCollector: (this.newPipelineOpenCollector && this.newPipelineOpenCollector.length ? this.newPipelineOpenCollector : null),
              fieldsMapping: (this.importFieldsMapping && this.ezMarketPipelineTemplate && this.ezMarketPipelineTemplate.mapping_configuration && this.ezMarketPipelineTemplate.mapping_configuration.fieldsMapping ? JSON.parse(JSON.stringify(this.ezMarketPipelineTemplate.mapping_configuration.fieldsMapping)) : null),
              collectionConfig: (this.importCollectionConfiguration && this.ezMarketPipelineTemplate && this.ezMarketPipelineTemplate.collection_configuration && this.ezMarketPipelineTemplate.collection_configuration.collectionConfig ? JSON.parse(JSON.stringify(this.ezMarketPipelineTemplate.collection_configuration.collectionConfig)) : null),
              options: (this.ezMarketPipelineTemplate && this.ezMarketPipelineTemplate.mapping_configuration && this.ezMarketPipelineTemplate.mapping_configuration.options ? JSON.parse(JSON.stringify(this.ezMarketPipelineTemplate.mapping_configuration.options)) : null)
            }
          }
        )
      }
    }
  },
  mounted () {
    if (this.$route.params.pipelineTemplateUid && this.$route.params.pipelineTemplateUid.length) {
      if (this.pipelineTemplateUid !== this.$route.params.pipelineTemplateUid) {
        this.pipelineTemplateUid = this.$route.params.pipelineTemplateUid
      }
    }

    if (!(this.ezMarketPipelineTemplates && this.ezMarketPipelineTemplates.length)) {
      this.loadEzMarketPipelineTemplateById(this.pipelineTemplateUid)
    }
  }
}
</script>

<style>
/* To force the colour of the links inside of Mardown widgets (for the Description of the field we are displaying) */
.q-markdown a {
  color: aqua;
}
</style>
