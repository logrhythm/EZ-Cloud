<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" src="logrhythm_logo_wide.svg" alt="LogRhythm Open Collector">
        <q-btn no-caps flat dense icon="input" color="primary" :label="$t('Import')" >
          <q-menu>
            <q-list style="min-width: 20rem">
              <q-item clickable v-close-popup @click="doPromptForNewPipelineDetails()">
                <q-item-section avatar top>
                  <q-avatar icon="auto_awesome" color="primary" text-color="white" >
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">{{ $t('Into new Pipeline') }}</q-item-label>
                  <q-item-label caption>{{ $t('Create a new Pipeline and import this Template') }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="doPromptForExistingPipelineDetails()">
                <q-item-section avatar top>
                  <q-avatar icon="input" color="purple-10" text-color="white" >
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">{{ $t('Into existing Pipeline') }}</q-item-label>
                  <q-item-label caption>{{ $t('Override parts of an existing Pipeline with this Template') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <!-- <q-toolbar-title style="opacity:.4" class="text-center">{{ $t('EZ Market Place : Pipeline Templates : {ezMarketPipelineTemplateName}', { ezMarketPipelineTemplateName: ezMarketPipelineTemplate.name }) }}</q-toolbar-title> -->
      </q-toolbar>
    </q-header>

    <BreadCrumbs
      :crumbs="breadCrumbs"
      :pageTitle="$t('EZ Market Place : Pipeline Templates : {ezMarketPipelineTemplateName}', { ezMarketPipelineTemplateName: ezMarketPipelineTemplate.name })"
    />

    <q-card class="q-pa-md q-mx-none q-mb-md">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('Properties') }}
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
                    <q-icon name="o_visibility" color="positive" size="lg" v-if="ezMarketPipelineTemplate.status === 'Visible'" />
                    <q-icon name="o_visibility_off" style="opacity: .5;" size="lg" v-else-if="ezMarketPipelineTemplate.status === 'Hidden'" />
                    <q-icon name="o_pending_actions" color="primary" size="lg" v-else-if="ezMarketPipelineTemplate.status === 'Pending review'" />
                    <q-icon name="o_assignment_late" color="negative" style="opacity: .75;" size="lg" v-else-if="ezMarketPipelineTemplate.status === 'Failed Review'" />
                    <q-icon name="o_auto_delete" color="negative" style="opacity: .5;" size="lg" v-else-if="ezMarketPipelineTemplate.status === 'To be deleted'" />
                    <q-icon name="o_question_mark" color="orange" size="lg" v-else />
                  </div>
                  <div class="q-ml-sm">
                    <div class="text-bold">
                      {{ $t(ezMarketPipelineTemplate.status) }}
                    </div>
                    <div class="text-caption">
                      {{ $t(ezMarketPipelineTemplate.statusDescription) }}
                    </div>
                  </div>
                </div>
              </div>

              <q-separator spaced />

              <div class="row justify-between">
                <div class="">
                  <div class="">
                    {{ $t('Created: {ezMarketPipelineTemplateCreated}', { ezMarketPipelineTemplateCreated: timeAgo(ezMarketPipelineTemplate.created)}) }}
                    <q-tooltip content-style="font-size: 1rem;">
                      {{ ezMarketPipelineTemplate.created }}
                    </q-tooltip>
                  </div>
                  <div class="">
                    {{ $t('Modified: {ezMarketPipelineTemplateModified}', { ezMarketPipelineTemplateModified: timeAgo(ezMarketPipelineTemplate.modified)}) }}
                    <q-tooltip content-style="font-size: 1rem;">
                      {{ ezMarketPipelineTemplate.modified }}
                    </q-tooltip>
                  </div>
                </div>
                <div class="text-h6">
                  {{ $t('by') }}
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
              {{ $t('Read Me') }}
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
              {{ $t('Collection') }}
          </q-card-section>
          <q-card-section class="row items-center">
            <span class="text-bold">{{ $t('Shipper and Method:') }}</span>
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
                <div class="text-bold">{{ $t('Collection Configuration:') }}</div>
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
              {{ $t('Fields Mapping') }}
            </div>
            <div class="row q-gutter-md">
              <div style="width:300px;">
                <q-input outlined dense debounce="300" v-model="searchFilter" :placeholder="$t('Search')">
                  <template v-slot:append>
                    <q-btn v-if="searchFilter.length" dense flat icon="close" @click="searchFilter=''" />
                    <q-icon name="o_search" />
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
              :no-data-label="$t('No Fields to display.')"
              :filter="searchFilter"
              :loading="pipelineTemplateLoading"
              :rows-per-page-label="$t('Fields per page:')"
              :pagination.sync="pagination"
            >

              <template v-slot:body-cell-frequency="props">
                <q-td :props="props" style="width: 3em;">
                  <div>
                    <q-tooltip content-style="font-size: 1em;">
                      {{ $t('Seen in {seenInOverMaxSeenInLog}% of logs in the sample ({seenIn}/{maxSeenInLog})', { seenInOverMaxSeenInLog: (maxSeenInLog != 0 ? Math.round(props.value / maxSeenInLog * 100) : 0), seenIn: props.value, maxSeenInLog}) }}
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

    <!-- <q-card class="q-pa-md q-mx-none q-mb-md">
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
    </q-card> -->

    <q-dialog v-model="showImportPopupNewPipeline" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('Import Template into a new Pipeline') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="newPipelineName" autofocus :label="$t('Pipeline Name')" @keyup.esc="showImportPopupNewPipeline = false" @keyup.enter="ImportIntoNewPipeline()" :rules="[val => !!val || $t('Pipeline name cannot be empty')]" />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select dense v-model="newPipelineOpenCollector" :options="openCollectorsOptions" :label="$t('Primary OpenCollector')" emit-value map-options />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-list style="min-width: 400px">
            <q-item-label header>{{ $t('Import Options') }}</q-item-label>
            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>{{ $t('Import Collection Configuation') }}</q-item-label>
                <q-item-label caption>{{ $t('Include the Shipper\'s Collection Configuation') }}</q-item-label>
              </q-item-section>
              <q-item-section avatar>
                <q-toggle v-model="importCollectionConfiguration" />
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>{{ $t('Import Fields Mapping') }}</q-item-label>
                <q-item-label caption>{{ $t('Include the Shipper\'s Collection Configuation') }}</q-item-label>
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

    <q-dialog v-model="showImportPopupExistingPipeline" persistent>
      <q-card style="min-width: 800px">
        <q-card-section>
          <div class="text-h6">{{ $t('Import Template into an existing Pipeline') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-table
            :title="$t('Existing Pipelines')"
            :data="existingPipelineTableData"
            :columns="existingPipelineTableColumns"
            row-key="uid"
            dense
            :no-data-label="$t('No Pipeline to display.')"
            :filter="existingPipelineTableSearchFilter"
            :loading="dataLoading"
            :rows-per-page-label="$t('Pipelines per page:')"
            :pagination.sync="existingPipelineTablePagination"
          >

            <template v-slot:top>
              <div class="full-width row wrap justify-between">
                <div class="q-table__title">
                  {{ $t('Existing Pipelines') }}
                </div>
                <div class="row q-gutter-md">
                  <div style="width:300px;">
                    <q-input outlined dense debounce="300" v-model="existingPipelineTableSearchFilter" :placeholder="$t('Search')">
                      <template v-slot:append>
                        <q-btn v-if="existingPipelineTableSearchFilter.length" dense flat icon="close" @click="existingPipelineTableSearchFilter=''" />
                        <q-icon name="o_search" />
                      </template>
                    </q-input>
                  </div>
                  <q-btn dense outline icon="refresh" @click="loadPipelines()">
                    <q-tooltip content-style="font-size: 1em">
                      {{ $t('Reload the list of Pipelines.') }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn dense icon="input" color="primary" class="q-mr-sm" @click="ImportIntoExistingPipeline(props.row, { importCollectionConfiguration: true, importFieldsMapping: true })">
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Import Collection and Fields Mapping') }}
                  </q-tooltip>
                </q-btn>
                <q-btn flat dense icon="mediation" @click="ImportIntoExistingPipeline(props.row, { importCollectionConfiguration: true, importFieldsMapping: false })">
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Import Collection only') }}
                  </q-tooltip>
                </q-btn>
                <q-btn flat dense icon="account_tree" @click="ImportIntoExistingPipeline(props.row, { importCollectionConfiguration: false, importFieldsMapping: true })">
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Import Fields Mapping only') }}
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-icon name="o_arrow_circle_up" color="green" size="md" v-if="props.value === 'Ready'" />
                <q-icon name="o_construction" :color="(darkMode ? 'green-3' : 'green-10')" size="md" v-else-if ="props.value === 'Dev'" />
                <q-icon name="o_auto_awesome" size="md" v-else-if ="props.value === 'New'" />
                <q-icon name="o_help_center" color="grey" size="md" v-else />
                <q-tooltip content-style="font-size: 1em">
                  {{ $t(props.value) }}
                </q-tooltip>
              </q-td>
            </template>
            <template v-slot:body-cell-collectionShipper="props">
              <q-td :props="props">
                <img v-if="props.row && props.row.collectionConfig && props.row.collectionConfig.collectionShipper && props.row.collectionConfig.collectionShipper.length" :src="'/shippers/' + collectionShipperDetails(props.row.collectionConfig.collectionShipper).icon + '.svg'" width="32px">
                <q-tooltip content-style="font-size: 1em">
                  <span v-if="props.row && props.row.collectionConfig && props.row.collectionConfig.collectionShipper && props.row.collectionConfig.collectionShipper.length" >{{ collectionShipperDetails(props.row.collectionConfig.collectionShipper).label }}</span>
                </q-tooltip>
              </q-td>
            </template>
            <template v-slot:body-cell-collectionMethod="props">
              <q-td :props="props">
                <q-icon :name="collectionMethodDetails(props.row.collectionConfig.collectionShipper, props.row.collectionConfig.collectionMethod).icon" size="md" v-if="props.row && props.row.collectionConfig && props.row.collectionConfig.collectionShipper && props.row.collectionConfig.collectionShipper.length && props.row.collectionConfig.collectionMethod && props.row.collectionConfig.collectionMethod.length" />
                <q-tooltip content-style="font-size: 1em">
                  <span v-if="props.row && props.row.collectionConfig && props.row.collectionConfig.collectionShipper && props.row.collectionConfig.collectionShipper.length && props.row.collectionConfig.collectionMethod && props.row.collectionConfig.collectionMethod.length" >{{ collectionMethodDetails(props.row.collectionConfig.collectionShipper, props.row.collectionConfig.collectionMethod).label }}</span>
                </q-tooltip>
              </q-td>
            </template>
            <template v-slot:body-cell-mappingStats="props">
              <q-td :props="props">
                <!-- {{props.value}} -->
                <div
                  v-if="props.row.fieldsMapping && Array.isArray(props.row.fieldsMapping) && props.row.fieldsMapping.length"
                >
                  <q-circular-progress
                    :value="Math.round(props.value)"
                    show-value
                    :font-size="(props.value < 100 ? '0.5em' : '0.4em')"
                    size="2.8em"
                    :thickness="0.2"
                    :color="(darkMode ? 'blue-3' : 'blue-10')"
                    :track-color="(darkMode ? 'grey-9' : 'grey-3')"
                  />
                  <q-tooltip content-style="font-size: 1em">
                    <span>{{ $t('Detected fields: {fieldsMappingDetectedCount}', { fieldsMappingDetectedCount: props.row.fieldsMapping.length}) }}</span><br>
                    <span>{{ $t('Mapped fields: {fieldsMappingMappedCount} ({fieldsMappingMappedPercent}%)', { fieldsMappingMappedCount: props.row.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0), fieldsMappingMappedPercent: Math.round(props.value * 100) / 100}) }}</span>
                  </q-tooltip>
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="text-primary q-mt-md">
          <q-btn flat :label="$t('Close')" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { uid } from 'quasar'
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedShipperAndCollectionsHelpers from 'src/mixins/mixin-Shared-ShipperAndCollectionsHelpers'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import BreadCrumbs from 'components/BreadCrumbs.vue'
import Identicon from 'components/Publisher/Identicon.vue'
import IconPicture from 'components/Pipelines/IconPicture.vue'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
if (TimeAgo.getDefaultLocale() == null) {
  TimeAgo.addDefaultLocale(en)
}
import ConfirmDialog from 'components/Dialogs/ConfirmDialog.vue'

export default {
  name: 'PageMarketPipelineTemplateProperties',
  mixins: [
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedShipperAndCollectionsHelpers, // Shared funtion to provide info (icon, names, etc...) for Shippers and Collections methods
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ],
  components: { BreadCrumbs, Identicon, IconPicture },
  data () {
    return {
      pipelineTemplateUid: '',
      searchFilter: '',
      columns: [
        { name: 'frequency', align: 'center', label: this.$t('Frequency'), field: 'seenInLogCount', sortable: true },
        { name: 'Fields', align: 'left', label: this.$t('Field Full Paths'), field: 'name', sortable: true, classes: '', style: 'font-family: monospace; white-space: pre-line;' },
        { name: 'mapping', align: 'center', label: this.$t('Mappings'), field: 'mappedField', sortable: true },
        { name: 'modifiers', align: 'center', label: this.$t('Modifiers'), field: row => (row.modifiers && Array.isArray(row.modifiers) ? row.modifiers.join(', ') : null), sortable: true }
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
      importFieldsMapping: true,
      showImportPopupExistingPipeline: false,
      existingPipelineTableSearchFilter: '',
      existingPipelineTableColumns: [
        { name: 'actions', align: 'center', label: this.$t('Actions'), field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: this.$t('Status'), field: 'status', sortable: true, sort: (a, b, rowA, rowB) => this.statusTextToId(a) - this.statusTextToId(b) },
        { name: 'name', align: 'center', label: this.$t('Pipeline Name'), field: 'name', sortable: true },
        { name: 'collectionShipper', align: 'center', label: this.$t('Shipper'), field: row => row.collectionConfig.collectionShipper, sortable: true },
        { name: 'collectionMethod', align: 'center', label: this.$t('Method'), field: row => row.collectionConfig.collectionMethod, sortable: true },
        { name: 'mappingStats', align: 'center', label: this.$t('Mapping (%)'), field: row => (row.fieldsMapping && Array.isArray(row.fieldsMapping) && row.fieldsMapping.length > 0 ? row.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) / row.fieldsMapping.length * 100 : null), sortable: true }
      ],
      existingPipelineTablePagination: {
        sortBy: 'status',
        descending: true,
        rowsPerPage: 10
      }
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
      const fallbackValue = { value: 'unknown', label: this.$t('Unknown or not set'), icon: 'help_center' }
      if (this.collectionMethod && this.collectionMethod.length) {
        return this.collectionMethodsOptions.find(cmo => cmo.value && cmo.value === this.collectionMethod) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionShipperOption () {
      const fallbackValue = { value: 'unknown', label: this.$t('Unknown or not set'), icon: 'unknown', outputFormat: 'json' }
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
            output = '# ' + this.$t('No Collection Method configured.')
          }
        } else {
          output = '# ' + this.$t('Unknown output format.')
        }
      } else {
        output = '# ' + this.$t('No Collecting Shipper configured.')
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
    existingPipelineTableData () {
      const list = []
      this.pipelines.forEach(pipeline => {
        const pipelineOpenCollector = this.openCollectors.find(oc => oc.uid === pipeline.primaryOpenCollector)
        list.push(Object.assign({}, pipeline, {
          openCollector: (pipelineOpenCollector && pipelineOpenCollector.name && pipelineOpenCollector.hostname ? pipelineOpenCollector.name + ' (' + pipelineOpenCollector.hostname + ')' : null)
        }))
      })
      return list
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
    },
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('EZ Market Place'),
          link: '/MarketPlace'
        },
        {
          title: this.$t('Pipeline Templates'),
          link: '/MarketPlace/PipelineTemplates'
        },
        {
          title: this.ezMarketPipelineTemplate.name || '...'
        }
      ]
    }
  }, // computed
  methods: {
    ...mapActions('mainStore', ['loadEzMarketPipelineTemplateById', 'upsertPipeline', 'adaptPipelineCollectionConfiguration']),
    timeAgo (timestamp) {
      let formattedTimeAgo = this.$t('Some time ago')
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
      this.newPipelineName = this.ezMarketPipelineTemplate.name
      this.newPipelineOpenCollector = null
      this.newPipelineStatus = null
      this.importCollectionConfiguration = true
      this.importFieldsMapping = true

      this.showImportPopupNewPipeline = true
    },
    async ImportIntoNewPipeline () {
      if (this.newPipelineName.length && (this.importCollectionConfiguration || this.importFieldsMapping)) {
        this.showImportPopupNewPipeline = false

        // Create new UID
        const newPipelineUid = uid()

        this.upsertPipeline(
          {
            pushToApi: true,
            caller: this,
            pipeline:
            {
              uid: newPipelineUid,
              name: this.newPipelineName,
              status: (this.newPipelineStatus && this.newPipelineStatus.length ? this.newPipelineStatus : 'New'),
              primaryOpenCollector: (this.newPipelineOpenCollector && this.newPipelineOpenCollector.length ? this.newPipelineOpenCollector : null),
              fieldsMapping: (
                this.importFieldsMapping &&
                this.ezMarketPipelineTemplate &&
                this.ezMarketPipelineTemplate.mapping_configuration &&
                this.ezMarketPipelineTemplate.mapping_configuration.fieldsMapping
                  ? JSON.parse(JSON.stringify(this.ezMarketPipelineTemplate.mapping_configuration.fieldsMapping))
                  : null
              ),
              collectionConfig: (
                this.importCollectionConfiguration &&
                this.ezMarketPipelineTemplate &&
                this.ezMarketPipelineTemplate.collection_configuration &&
                this.ezMarketPipelineTemplate.collection_configuration.collectionConfig
                  ? await this.adaptPipelineCollectionConfiguration(
                    {
                      importedCollectionConfiguration: this.ezMarketPipelineTemplate.collection_configuration.collectionConfig,
                      targetDetails: { uid: newPipelineUid, name: this.newPipelineName }
                    }
                  )
                  : null
              ),
              options: (this.ezMarketPipelineTemplate && this.ezMarketPipelineTemplate.mapping_configuration && this.ezMarketPipelineTemplate.mapping_configuration.options ? JSON.parse(JSON.stringify(this.ezMarketPipelineTemplate.mapping_configuration.options)) : null)
            }
          }
        )
      }
    },
    collectionMethodDetails (shipperId, methodId) {
      const fallbackValue = { value: 'unknown', label: this.$t('Unknown or not set'), icon: 'help_center' }
      if (shipperId && shipperId.length && methodId && methodId.length) {
        return this.collectionMethodsOptions.find(cmo => cmo.shipper && cmo.shipper === shipperId && cmo.value && cmo.value === methodId) || fallbackValue
      } else {
        // return fallbackValue
        return methodId
      }
    },
    statusTextToId (statusName) {
      let status = 0
      if (statusName === 'Ready') {
        status = 3
      }
      if (statusName === 'Dev') {
        status = 2
      }
      if (statusName === 'New') {
        status = 1
      }
      return status
    },
    doPromptForExistingPipelineDetails () {
      this.showImportPopupExistingPipeline = true
    },
    ImportIntoExistingPipeline (selectedExistingPipeline, options) {
      if (selectedExistingPipeline && selectedExistingPipeline.uid && selectedExistingPipeline.uid.length && options) {
        const pipelineUid = selectedExistingPipeline.uid
        const pipelineName = selectedExistingPipeline.name
        const pipelineOpenCollector = selectedExistingPipeline.primaryOpenCollector || null
        const pipelineStatus = selectedExistingPipeline.status
        const importCollectionConfiguration = (options ? !!options.importCollectionConfiguration : false)
        const importFieldsMapping = (options ? !!options.importFieldsMapping : false)

        if (pipelineName.length && (importCollectionConfiguration || importFieldsMapping)) {
          let confirmationMessage = ''
          if (importCollectionConfiguration && importFieldsMapping) {
            confirmationMessage = this.$t('This will overide any existing Collection Configuration and Fields Mapping in the selected Pipeline. Are you sure?')
          } else if (importCollectionConfiguration) {
            confirmationMessage = this.$t('This will overide any existing Collection Configuration in the selected Pipeline. Are you sure?')
          } else if (importFieldsMapping) {
            confirmationMessage = this.$t('This will overide any existing Fields Mapping in the selected Pipeline. Are you sure?')
          }

          this.$q.dialog({
            component: ConfirmDialog,
            parent: this,
            title: this.$t('Confirm overide'),
            message: confirmationMessage,
            persistent: true
          }).onOk(async () => {
            this.upsertPipeline(
              {
                pushToApi: true,
                caller: this,
                pipeline:
                {
                  uid: pipelineUid,
                  name: pipelineName,
                  status: (pipelineStatus && pipelineStatus.length ? pipelineStatus : 'New'),
                  primaryOpenCollector: (pipelineOpenCollector && pipelineOpenCollector.length ? pipelineOpenCollector : null),
                  fieldsMapping: (
                    importFieldsMapping &&
                    this.ezMarketPipelineTemplate &&
                    this.ezMarketPipelineTemplate.mapping_configuration &&
                    this.ezMarketPipelineTemplate.mapping_configuration.fieldsMapping
                      ? JSON.parse(JSON.stringify(this.ezMarketPipelineTemplate.mapping_configuration.fieldsMapping))
                      : null
                  ),
                  collectionConfig: (
                    importCollectionConfiguration &&
                    this.ezMarketPipelineTemplate &&
                    this.ezMarketPipelineTemplate.collection_configuration &&
                    this.ezMarketPipelineTemplate.collection_configuration.collectionConfig
                      ? await this.adaptPipelineCollectionConfiguration(
                        {
                          importedCollectionConfiguration: this.ezMarketPipelineTemplate.collection_configuration.collectionConfig,
                          targetDetails: { uid: pipelineUid, name: pipelineName }
                        }
                      )
                      : null
                  ),
                  options: (this.ezMarketPipelineTemplate && this.ezMarketPipelineTemplate.mapping_configuration && this.ezMarketPipelineTemplate.mapping_configuration.options ? JSON.parse(JSON.stringify(this.ezMarketPipelineTemplate.mapping_configuration.options)) : null)
                },
                onSuccessCallBack: this.loadPipelines,
                onErrorCallBack: this.loadPipelines
              }
            )
          }) // }).onOk(() => {
        }
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
      this.loadEzMarketPipelineTemplateById({ pipelineTemplateUid: this.pipelineTemplateUid })
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
