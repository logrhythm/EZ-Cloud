<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to List" :to="'/Pipelines'" />

        <q-toolbar-title style="opacity:.4" class="text-center">Pipeline Properties<span v-if="pipeline && pipeline.name && pipeline.name.length">:  {{ pipeline.name }}</span></q-toolbar-title>

      </q-toolbar>
    </q-header>
    <div class=" q-gutter-y-sm">
      <q-card>
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
              <!-- <div class="row">
                <div class="col-6">
                  Collection Params (JSON): <pre>{{ pipeline.collectionConfig }}</pre>
                </div>
                <div class="col-6">
                  Collection Params (YML): <pre>{{ collectionConfigOutput }}</pre>
                </div>
              </div> -->
              <div class="">
                  <div class="text-bold">Collection Configuration:</div>
                  <div class="row q-my-sm">
                    <q-separator vertical size="2px" color="teal" />
                    <div class="q-ml-sm"><pre>{{ collectionConfigOutput }}</pre></div>
                  </div>
              </div>
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <!-- <q-btn label="Edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Collection/Edit'" /> -->
              <q-btn icon="edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Collection/Edit'" >
                <q-tooltip content-style="font-size: 1rem;">
                  Edit Collection
                </q-tooltip>
              </q-btn>
              <q-btn icon="download" @click="downloadCollectionAsShipperConfigFile()">
                <q-tooltip content-style="font-size: 1rem;">
                  Download Collection configuration as a Shipper configuration file
                </q-tooltip>
              </q-btn>
              <q-btn icon="content_copy" @click="copyCollectionConfigAsShipperFileToClipboard()">
                <q-tooltip content-style="font-size: 1rem;">
                  Copy Collection configuration in Shipper's format to Clipboard
                </q-tooltip>
              </q-btn>
              <q-btn icon="share">
                <q-tooltip content-style="font-size: 1rem;">
                  Share and Import Collection Configuration
                </q-tooltip>
                <q-menu>
                  <q-list style="min-width: 400px">
                    <q-item clickable v-close-popup @click="downloadCollectionAsEZImportableConfigFile()">
                      <q-item-section avatar top>
                        <q-avatar icon="share" color="green-10" text-color="white" >
                          <q-badge color="primary" floating transparent>
                            <q-icon name="insert_drive_file" color="white" />
                          </q-badge>
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">Share as a Local File</q-item-label>
                        <q-item-label caption>As an importable EZ Cloud Collection Configuration file</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item clickable disabled>
                      <q-item-section avatar top>
                        <q-avatar icon="share" color="green-10" text-color="white" >
                          <q-badge color="primary" floating transparent>
                            <q-icon name="cloud" color="white" />
                          </q-badge>
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">Share via the Marketplace</q-item-label>
                        <q-item-label caption>As an importable EZ Cloud Collection Configuration</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup @click="collectionConfigurationImportFileInput = null ; showCollectionFileImportPopup = true">
                      <q-item-section avatar top>
                        <q-avatar icon="input" color="purple-10" text-color="white" >
                          <q-badge color="primary" floating transparent>
                            <q-icon name="insert_drive_file" color="white" />
                          </q-badge>
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">Import from Local File</q-item-label>
                        <q-item-label caption>Import a shared EZ Cloud Collection Configuration file</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item clickable disabled>
                      <q-item-section avatar top>
                        <q-avatar icon="input" color="purple-10" text-color="white" >
                          <q-badge color="primary" floating transparent>
                            <q-icon name="cloud" color="white" />
                          </q-badge>
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">Import from Marketplace</q-item-label>
                        <q-item-label caption>Import a shared EZ Cloud Collection Configuration</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup tag="a" :href="wikiLink('ref-whatsthedifferencecollectionconfigurationshareimport')" target="_blank" >
                      <q-item-section avatar top>
                        <q-avatar icon="help_outline" color="info" text-color="black" />
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">What's the difference?</q-item-label>
                        <q-item-label caption>A quick peek at the Wiki</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <!-- <q-btn icon="highlight_off" disable>
                <q-tooltip content-style="font-size: 1rem;">
                  Stop collection
                </q-tooltip>
              </q-btn> -->
              <q-btn icon="delete" text-color="negative" @click="deleteCollectionPrompt()">
                <q-tooltip content-style="font-size: 1rem;">
                  Delete Collection Configuration
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Mapping
            </q-card-section>
            <q-card-section>
                <span class="text-bold">Fields detected: </span>{{ detectedFields }}
            </q-card-section>
            <q-card-section>
                <span class="text-bold">Fields mapped: </span>{{ mappedFields }}
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <!-- <q-btn label="Edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Mapping/Edit'" /> -->
              <q-btn icon="edit" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Mapping/Edit'" >
                <q-tooltip content-style="font-size: 1rem;">
                  Edit Mapping
                </q-tooltip>
              </q-btn>
              <q-btn icon="download" disable>
                <q-tooltip content-style="font-size: 1rem;">
                  Download Mapping as JQ Pipeline
                </q-tooltip>
              </q-btn>
              <q-btn icon="share">
                <q-tooltip content-style="font-size: 1rem;">
                  Share and Import Mapping
                </q-tooltip>
                <q-menu content-style="min-width: 420px">
                  <q-list style="min-width: 400px">
                    <q-item-label header>Sanitisation</q-item-label>
                    <q-item tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>Share Field Frequencies</q-item-label>
                        <q-item-label caption>Include the frequency statistics for each field</q-item-label>
                      </q-item-section>
                      <q-item-section avatar>
                        <q-toggle v-model="shareFieldFrequencies" />
                      </q-item-section>
                    </q-item>

                    <q-item tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>Share Field Values</q-item-label>
                        <q-item-label caption>Include all the observed values for each field</q-item-label>
                        <q-item-label caption class="text-bold text-italic"><q-icon name="warning" class="q-ma-none q-mr-xs" color="orange" />This could lead to sharing sensitive information</q-item-label>
                      </q-item-section>
                      <q-item-section avatar>
                        <q-toggle color="orange" v-model="shareFieldValues" />
                      </q-item-section>
                    </q-item>

                    <q-item tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>Share Field SIEM Mapping</q-item-label>
                        <q-item-label caption>Include the SIEM tags mapping for each field</q-item-label>
                      </q-item-section>
                      <q-item-section avatar>
                        <q-toggle v-model="shareFieldMapping" />
                      </q-item-section>
                    </q-item>

                    <q-item tag="label" v-ripple>
                      <q-item-section>
                        <q-item-label>Share Field Modifiers</q-item-label>
                        <q-item-label caption>Include the modifiers for each field</q-item-label>
                      </q-item-section>
                      <q-item-section avatar>
                        <q-toggle v-model="shareFieldModifiers" />
                      </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup @click="downloadMappingAsEZImportableConfigFile()">
                      <q-item-section avatar top>
                        <q-avatar icon="share" color="green-10" text-color="white" >
                          <q-badge color="primary" floating transparent>
                            <q-icon name="insert_drive_file" color="white" />
                          </q-badge>
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">Share as a Local File</q-item-label>
                        <q-item-label caption>As an importable EZ Cloud Mapping file</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item clickable disabled>
                      <q-item-section avatar top>
                        <q-avatar icon="share" color="green-10" text-color="white" >
                          <q-badge color="primary" floating transparent>
                            <q-icon name="cloud" color="white" />
                          </q-badge>
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">Share via the Marketplace</q-item-label>
                        <q-item-label caption>As an importable EZ Cloud Mapping</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup @click="collectionConfigurationImportFileInput = null ; showMappingFileImportPopup = true">
                      <q-item-section avatar top>
                        <q-avatar icon="input" color="purple-10" text-color="white" >
                          <q-badge color="primary" floating transparent>
                            <q-icon name="insert_drive_file" color="white" />
                          </q-badge>
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">Import from Local File</q-item-label>
                        <q-item-label caption>Import a shared EZ Cloud Mapping file</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item clickable disabled>
                      <q-item-section avatar top>
                        <q-avatar icon="input" color="purple-10" text-color="white" >
                          <q-badge color="primary" floating transparent>
                            <q-icon name="cloud" color="white" />
                          </q-badge>
                        </q-avatar>
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">Import from Marketplace</q-item-label>
                        <q-item-label caption>Import a shared EZ Cloud Mapping</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-separator />

                    <q-item clickable v-close-popup tag="a" :href="wikiLink('ref-whatsthedifferencefieldmappingshareimport')" target="_blank" >
                      <q-item-section avatar top>
                        <q-avatar icon="help_outline" color="info" text-color="black" />
                      </q-item-section>

                      <q-item-section>
                        <q-item-label lines="1">What's the difference?</q-item-label>
                        <q-item-label caption>A quick peek at the Wiki</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
              <q-btn icon="delete" text-color="negative" @click="deleteMappingPrompt()">
                <q-tooltip content-style="font-size: 1rem;">
                  Delete Mapping
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>

      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Deployments
            </q-card-section>
            <q-card-section>
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="uid"
                dense
                no-data-label="No Deployment to display."
                :filter="searchFilter"
                :loading="dataLoading"
                rows-per-page-label="Deployments per page:"
                :pagination.sync="pagination"
              >
                <template v-slot:top>
                  <div class="full-width row wrap justify-between">
                    <div class="q-table__title">
                      Current Deployments
                    </div>
                    <div class="row q-gutter-md">
                      <div class="col" >
                        <q-btn rounded dense color="primary" icon="add" label="Add New Deployment" style="min-width:14rem;" @click="addNewDeployment()" >
                          <q-tooltip content-style="font-size: 1em">
                            Create a new Deployment.
                          </q-tooltip>
                        </q-btn>
                      </div>
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
                      <!-- <q-separator vertical dark color="orange" /> -->
                      <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadOpenCollectorsAndPipelines()">
                        <q-tooltip content-style="font-size: 1em">
                          Reload the list of Pipelines.
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense icon="edit" @click="doPromptForDeploymentDetails(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Edit Deployment details') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn flat dense icon="delete" color="negative" @click="deleteDeploymentPrompt(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Delete Deployment') }}
                      </q-tooltip>
                    </q-btn>
                  </q-td>
                </template>

                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-icon name="arrow_circle_up" color="green" size="md" v-if="props.value === true" />
                    <q-icon name="arrow_circle_down" color="red" size="md" v-else-if ="props.value === false" />
                    <q-icon name="help_center" color="grey" size="md" v-else />
                    <q-tooltip content-style="font-size: 1em">
                      <span v-if="props.value === true">Enabled</span>
                      <span v-else-if ="props.value === false">Disabled / Un-deployed</span>
                      <span v-else>{{ props.value }}</span>
                    </q-tooltip>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
            <!-- <q-card-section>
                <span class="text-bold">Table Data: </span>
                <pre>{{ tableData }}</pre>
            </q-card-section> -->
            <!-- <q-card-section>
                <span class="text-bold">Deployments: </span>
                <pre>{{ deployments }}</pre>
            </q-card-section> -->
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <!-- <q-btn icon="add" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Deployments/Edit'" > -->
              <q-btn icon="add" color="primary" @click="addNewDeployment()" >
                <q-tooltip content-style="font-size: 1rem;">
                  Add Deployment
                </q-tooltip>
              </q-btn>
              <q-btn icon="refresh" :loading="dataLoading" @click="loadOpenCollectorsAndPipelines()">
                <q-tooltip content-style="font-size: 1rem;">
                  Reload
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </div>

    <q-dialog v-model="showCollectionFileImportPopup" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('Import EZ Cloud Collection Configuration') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-file
            filled
            bottom-slots
            v-model="collectionConfigurationImportFileInput"
            label="Click or Drop a .ezCollection file here"
            input-style="min-width: 24em;min-height: 14em;"
            accept=".ezCollection"
            @rejected="onRejectedCollectionFile"
          >
            <template v-slot:append>
              <q-icon v-if="collectionConfigurationImportFileInput !== null" name="close" @click.stop="collectionConfigurationImportFileInput = null" class="cursor-pointer" />
              <q-icon name="note_add" @click.stop />
            </template>
          </q-file>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" >
          <q-btn color="primary" flat :label="$t('Cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('Import Configuration')" v-close-popup :disabled="collectionConfigurationImportFileInput === null" @click="importCollectionFromEZImportableConfigFile(collectionConfigurationImportFileInput)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showMappingFileImportPopup" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('Import EZ Cloud Fields Mapping') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-file
            filled
            bottom-slots
            v-model="mappingImportFileInput"
            label="Click or Drop a .ezFieldsMapping file here"
            input-style="min-width: 24em;min-height: 14em;"
            accept=".ezFieldsMapping"
            @rejected="onRejectedMappingFile"
          >
            <template v-slot:append>
              <q-icon v-if="mappingImportFileInput !== null" name="close" @click.stop="mappingImportFileInput = null" class="cursor-pointer" />
              <q-icon name="note_add" @click.stop />
            </template>
          </q-file>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" >
          <q-btn color="primary" flat :label="$t('Cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('Import Fields Mapping')" v-close-popup :disabled="mappingImportFileInput === null" @click="importMappingFromEZImportableConfigFile(mappingImportFileInput)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedShipperAndCollectionsHelpers from 'src/mixins/mixin-Shared-ShipperAndCollectionsHelpers'
// import { dump } from 'js-yaml'
import { exportFile, copyToClipboard } from 'quasar'

export default {
  name: 'PagePipelineProperties',
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedSocket, // Shared function and state to access the Socket.io
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedShipperAndCollectionsHelpers // Shared funtion to provide info (icon, names, etc...) for Shippers and Collections methods
  ],
  data () {
    return {
      // pipelineUid: '7dc7d568-a90e-11eb-bcbc-0242ac130002'
      pipelineUid: '',
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: 'Status', field: 'enabled', sortable: true },
        { name: 'openCollector', align: 'center', label: 'Open Collector', field: 'openCollectorHost', sortable: true }
      ],
      pagination: {
        sortBy: 'status',
        descending: true,
        rowsPerPage: 25
      },
      showCollectionFileImportPopup: false, // Governs the display of the Popup to import shared collection config file
      collectionConfigurationImportFileInput: null, // File to import shared collection config from
      showMappingFileImportPopup: false, // Governs the display of the Popup to import shared Mapping file
      mappingImportFileInput: null, // File to import shared Mapping from
      shareFieldFrequencies: true, // Include field frequencies when sharing?
      shareFieldValues: false, // Include field values when sharing? Default FALSE as risk of sharing sensitive info
      shareFieldMapping: true, // Include field SIEM tags mapping when sharing?
      shareFieldModifiers: true // Include field modifiers when sharing?
    }
  },
  computed: {
    ...mapGetters('mainStore', ['openCollectors', 'pipelines']),
    ...mapState('mainStore', ['collectionMethodsOptions', 'collectionShippersOptions', 'helpWikiUrlBase']),
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
    detectedFields () {
      return (this.pipeline.fieldsMapping && Array.isArray(this.pipeline.fieldsMapping) ? this.pipeline.fieldsMapping.length : 0)
    },
    mappedFields () {
      return (this.pipeline.fieldsMapping && Array.isArray(this.pipeline.fieldsMapping) ? this.pipeline.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) : 0)
    },
    collectionMethod () {
      return (this.pipeline.collectionConfig && this.pipeline.collectionConfig.collectionMethod ? this.pipeline.collectionConfig.collectionMethod : '')
    },
    collectionShipper () {
      return (this.pipeline.collectionConfig && this.pipeline.collectionConfig.collectionShipper ? this.pipeline.collectionConfig.collectionShipper : '')
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
            output = this.collectionConfigOutputFor(this.collectionShipperOption.outputFormat, this.pipeline.collectionConfig)
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
    deployments () {
      const deployments = []
      this.openCollectors.forEach((oc) => {
        if (oc.pipelines && Array.isArray(oc.pipelines)) {
          oc.pipelines.forEach((pipeline) => {
            if (pipeline.uid === this.pipelineUid) {
              deployments.push({
                pipelineUid: pipeline.uid,
                openCollector: oc,
                enabled: pipeline.enabled
              })
            }
          })
        }
      })
      return deployments
    },
    tableData () {
      const list = []
      this.deployments.forEach(deployment => {
        const deploymentOpenCollector = this.openCollectors.find(oc => deployment.openCollector && oc.uid === deployment.openCollector.uid)
        list.push(Object.assign({}, deployment, {
          openCollectorHost: (deploymentOpenCollector && deploymentOpenCollector.name && deploymentOpenCollector.hostname ? deploymentOpenCollector.name + ' (' + deploymentOpenCollector.hostname + ')' : null)
        }))
      })
      return list
    }
  },
  methods: {
    ...mapActions('mainStore', ['upsertPipeline', 'deleteDeployment']),
    editPipelineCollection () {
      this.$router.push({ path: '/Pipelines/' + this.pipelineUid + '/Collection/Edit' })
    }, // editPipelineCollection
    editPipelineMapping () {
      this.$router.push({ path: '/Pipelines/' + this.pipelineUid + '/Mapping/Edit' })
    }, // editPipelineMapping
    deleteMappingPrompt () {
      // ask to confirm
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you REALLY want to delete the Mapping information for this Pipeline?',
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
        this.deleteMapping()
      }) // }).onOk(() => {
    }, // deleteMappingPrompt
    deleteMapping () {
      if (this.pipelineUid && this.pipelineUid.length) {
        // this.upsertPipeline({
        //   uid: this.pipelineUid,
        //   fieldsMapping: []
        // })
        this.upsertPipeline(
          {
            caller: this,
            pushToApi: true,
            pipeline:
            {
              uid: this.pipelineUid,
              fieldsMapping: []
            }
          }
        )
      }
    }, // deleteMapping
    deleteCollectionPrompt () {
      // ask to confirm
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you REALLY want to delete the Collection information for this Pipeline?',
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
        this.deleteCollection()
      }) // }).onOk(() => {
    }, // deleteCollectionPrompt
    deleteCollection () {
      if (this.pipelineUid && this.pipelineUid.length) {
        // this.upsertPipeline({
        //   uid: this.pipelineUid,
        //   collectionConfig: { tony: 'aaa' }
        // })
        this.upsertPipeline(
          {
            caller: this,
            pushToApi: true,
            pipeline:
            {
              uid: this.pipelineUid,
              collectionConfig: { }
            }
          }
        )
      }
    }, // deleteCollection
    downloadCollectionAsShipperConfigFile () {
      // Fallback file extension and Mime type (if not possible to assign a better one based on Shipper)
      let fileExtension = '.txt'
      let fileMimeType = 'text/plain'

      // Set the file extension and Mime type based on teh outputFormat of the Shipper
      if (this.collectionShipperOption && this.collectionShipperOption.outputFormat && this.collectionShipperOption.outputFormat.length) {
        if (this.collectionShipperOption.outputFormat === 'yaml' || this.collectionShipperOption.outputFormat === 'yml') {
          fileExtension = '.yml'
          fileMimeType = 'text/yaml'
        } else if (this.collectionShipperOption.outputFormat === 'json') {
          fileExtension = '.json'
          fileMimeType = 'application/json'
        }
      }

      const fileName = 'input.' + this.pipeline.name + '_' + this.pipeline.uid + fileExtension

      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading Collection Configuration file...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Push file out
      const status = exportFile(fileName, this.collectionConfigOutput, fileMimeType)

      if (status === true) {
        notificationPopupId({
          type: 'positive',
          color: 'positive',
          icon: 'check',
          message: this.$t('Collection Configuration file downloaded'),
          caption: fileName
        })
      } else {
        notificationPopupId({
          type: 'negative',
          color: 'negative',
          icon: 'report_problem',
          message: this.$t('Problem while downloading Collection Configuration file:'),
          caption: status
        })
        console.log('Error: ' + status)
      }
    },
    copyCollectionConfigAsShipperFileToClipboard () {
      copyToClipboard(this.collectionConfigOutput)
        .then(() => {
          this.$q.notify({
            type: 'positive',
            color: 'positive',
            icon: 'check',
            message: this.$t('Collection Configuration copied to Clipboard')
          })
        })
        .catch(() => {
          this.$q.notify({
            type: 'negative',
            color: 'negative',
            icon: 'report_problem',
            message: this.$t('Problem while copying Collection Configuration file to Clipboard')
          })
        })
    },
    downloadCollectionAsEZImportableConfigFile () {
      // Fallback file extension and Mime type (if not possible to assign a better one based on Shipper)
      const fileExtension = '.ezCollection'
      const fileMimeType = 'application/json'

      const fileName = 'input.' + this.pipeline.name + '_' + this.pipeline.uid + fileExtension

      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading Importable Collection Configuration file...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Push file out
      const status = exportFile(fileName, JSON.stringify(this.pipeline.collectionConfig), fileMimeType)

      if (status === true) {
        notificationPopupId({
          type: 'positive',
          color: 'positive',
          icon: 'check',
          message: this.$t('Importable Collection Configuration file downloaded'),
          caption: fileName
        })
      } else {
        notificationPopupId({
          type: 'negative',
          color: 'negative',
          icon: 'report_problem',
          message: this.$t('Problem while downloading Importable Collection Configuration file:'),
          caption: status
        })
        console.log('Error: ' + status)
      }
    },
    onRejectedCollectionFile (rejectedEntries) {
      const badFileName = (
        rejectedEntries &&
        Array.isArray(rejectedEntries) &&
        rejectedEntries[0] &&
        rejectedEntries[0].file &&
        rejectedEntries[0].file.name
          ? rejectedEntries[0].file.name
          : ''
      )
      this.$root.$emit('addAndShowErrorToErrorPanel',
        {
          code: 'BadFileExtentionImportCollection',
          messageForLogAndPopup: `Only .ezCollection files are accepted. You tried to import "${badFileName}".`
        }
      )
    },
    async importCollectionFromEZImportableConfigFile (filesInput) {
      let fileName

      if (filesInput == null) {
        console.log('[importCollectionFromEZImportableConfigFile] - 🟠 - No file selected.')
      } else {
        // Deal with multiple or single file(s)
        if (Array.isArray(filesInput)) {
          this.$root.$emit('addAndShowErrorToErrorPanel',
            {
              code: 'TooManyFilesImportCollection',
              messageForLogAndPopup: `Only one .ezCollection file is accepted. You tried to import ${filesInput.length} files.`
            }
          )
        } else {
          // Get the file name
          fileName = (
            filesInput &&
            filesInput.name &&
            filesInput.name.length
              ? filesInput.name
              : undefined
          )

          const notificationPopupId = this.$q.notify({
            icon: 'cloud_download',
            message: this.$t('Importing Shared Collection Configuration file...'),
            caption: fileName,
            type: 'ongoing'
          })

          let thereWasAnError = false

          try {
            // Read the Import file
            const fileContent = await filesInput.text()

            // Parse it out and import
            let parsedFileContent = {}
            try {
              // Parse
              parsedFileContent = JSON.parse(fileContent)

              // Extract Shipper and Method
              const collectionShipper = (
                parsedFileContent &&
                parsedFileContent.collectionShipper &&
                parsedFileContent.collectionShipper.length
                  ? parsedFileContent.collectionShipper
                  : null
              )
              // eslint-disable-next-line no-unused-vars
              const collectionMethod = (
                parsedFileContent &&
                parsedFileContent.collectionMethod &&
                parsedFileContent.collectionMethod.length
                  ? parsedFileContent.collectionMethod
                  : null
              )

              // Replace Pipeline identifiers
              // Beat: genericbeat
              if (collectionShipper === 'genericbeat') {
                parsedFileContent.beatIdentifier = String(this.pipeline.uid.substring(0, 3) + '_' + this.pipeline.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + this.pipeline.uid).substring(0, 12)
                parsedFileContent.logsource_name = this.pipeline.name
              }
              // Beat: filebeat
              if (collectionShipper === 'filebeat') {
                // Ensure we have the .fields branch
                parsedFileContent.fields = parsedFileContent.fields || {}

                parsedFileContent.fields.stream_id = this.pipeline.uid
                parsedFileContent.fields.stream_name = this.pipeline.name
              }
              // Beat: jsBeat
              if (collectionShipper === 'jsBeat') {
                // Ensure we have the .fields branch
                parsedFileContent.filterHelpers = parsedFileContent.filterHelpers || {}

                parsedFileContent.filterHelpers.stream_id = this.pipeline.uid
                parsedFileContent.filterHelpers.stream_name = this.pipeline.name
                parsedFileContent.uid = this.pipeline.uid
                parsedFileContent.name = this.pipeline.name
              }

              // Beat: webhookbeat
              if (collectionShipper === 'webhookbeat') {
                parsedFileContent.beatIdentifier = String(this.pipeline.uid.substring(0, 3) + '_' + this.pipeline.name.replace(/[^a-zA-Z0-9]/g, '_') + '_' + this.pipeline.uid).substring(0, 12)
                parsedFileContent.logsource_name = this.pipeline.name
              }

              // Update Pipeline and Persist
              this.upsertPipeline(
                {
                  caller: this,
                  pushToApi: true,
                  pipeline:
                  {
                    uid: this.pipelineUid,
                    status: (this.pipeline && this.pipeline.status && this.pipeline.status === 'Ready' ? this.pipeline.status : 'Dev'),
                    collectionConfig: parsedFileContent
                  },
                  onSuccessCallBack: this.loadPipelines,
                  onErrorCallBack: this.loadPipelines
                }
              )
              notificationPopupId({
                type: 'positive',
                color: 'positive',
                icon: 'check',
                message: this.$t('Shared Collection Configuration file imported'),
                caption: fileName
              })
            } catch (error) {
              thereWasAnError = true
              this.$root.$emit('addAndShowErrorToErrorPanel',
                {
                  code: 'CantParseFileImportCollection',
                  messageForLogAndPopup: `Error trying to parse the content of ${filesInput.length} file. Error: ${error.message}`
                }
              )
            }
          } catch (error) {
            thereWasAnError = true
            this.$root.$emit('addAndShowErrorToErrorPanel',
              {
                code: 'CantReadFileImportCollection',
                messageForLogAndPopup: `Error trying to open ${filesInput.length} file. Error: ${error.message}`
              }
            )
          }

          if (thereWasAnError) {
            notificationPopupId({
              type: 'negative',
              color: 'negative',
              icon: 'report_problem',
              message: this.$t('Problem while importing Shared Collection Configuration file'),
              caption: fileName
            })
            console.log('Error: Problem while importing Shared Collection Configuration file')
          }
        }
      }
    },
    downloadMappingAsEZImportableConfigFile () {
      // Fallback file extension and Mime type (if not possible to assign a better one based on Shipper)
      const fileExtension = '.ezFieldsMapping'
      const fileMimeType = 'application/json'

      const fileName = 'input.' + this.pipeline.name + '_' + this.pipeline.uid + fileExtension

      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading Importable Fields Mapping file...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Sanitise the Mapping before export
      const sanitisedFieldsMapping = JSON.parse(JSON.stringify(this.pipeline.fieldsMapping))
      if (
        this.shareFieldFrequencies !== true ||
        this.shareFieldValues !== true ||
        this.shareFieldMapping !== true ||
        this.shareFieldModifiers !== true
      ) {
        sanitisedFieldsMapping.forEach(fieldMapping => {
          fieldMapping.seenInLogCount = (this.shareFieldFrequencies !== true ? 1 : fieldMapping.seenInLogCount)
          fieldMapping.values = (this.shareFieldValues !== true ? [] : fieldMapping.values)
          fieldMapping.mappedField = (this.shareFieldMapping !== true ? undefined : fieldMapping.mappedField)
          fieldMapping.modifiers = (this.shareFieldModifiers !== true ? undefined : fieldMapping.modifiers)
        })
      }

      // Add the relevant Options
      const sanitisedFieldsMappingWithOptions = {
        options: {
          extractMessageFieldOnly: (this.pipeline && this.pipeline.options ? this.pipeline.options.extractMessageFieldOnly : undefined)
        },
        fieldsMapping: sanitisedFieldsMapping
      }

      // Push file out
      const status = exportFile(fileName, JSON.stringify(sanitisedFieldsMappingWithOptions), fileMimeType)

      if (status === true) {
        notificationPopupId({
          type: 'positive',
          color: 'positive',
          icon: 'check',
          message: this.$t('Importable Fields Mapping file downloaded'),
          caption: fileName
        })
      } else {
        notificationPopupId({
          type: 'negative',
          color: 'negative',
          icon: 'report_problem',
          message: this.$t('Problem while downloading Importable Fields Mapping file:'),
          caption: status
        })
        console.log('Error: ' + status)
      }
    },
    onRejectedMappingFile (rejectedEntries) {
      const badFileName = (
        rejectedEntries &&
        Array.isArray(rejectedEntries) &&
        rejectedEntries[0] &&
        rejectedEntries[0].file &&
        rejectedEntries[0].file.name
          ? rejectedEntries[0].file.name
          : ''
      )
      this.$root.$emit('addAndShowErrorToErrorPanel',
        {
          code: 'BadFileExtentionImportMapping',
          messageForLogAndPopup: `Only .ezFieldsMapping files are accepted. You tried to import "${badFileName}".`
        }
      )
    },
    async importMappingFromEZImportableConfigFile (filesInput) {
      let fileName

      if (filesInput == null) {
        console.log('[importMappingFromEZImportableConfigFile] - 🟠 - No file selected.')
      } else {
        // Deal with multiple or single file(s)
        if (Array.isArray(filesInput)) {
          this.$root.$emit('addAndShowErrorToErrorPanel',
            {
              code: 'TooManyFilesImportMapping',
              messageForLogAndPopup: `Only one .ezFieldsMapping file is accepted. You tried to import ${filesInput.length} files.`
            }
          )
        } else {
          // Get the file name
          fileName = (
            filesInput &&
            filesInput.name &&
            filesInput.name.length
              ? filesInput.name
              : undefined
          )

          const notificationPopupId = this.$q.notify({
            icon: 'cloud_download',
            message: this.$t('Importing Shared Fields Mapping file...'),
            caption: fileName,
            type: 'ongoing'
          })

          let thereWasAnError = false

          try {
            // Read the Import file
            const fileContent = await filesInput.text()

            // Parse it out and import
            let parsedFileContent = {}
            try {
              // Parse
              parsedFileContent = JSON.parse(fileContent)

              // Update Pipeline and Persist
              this.upsertPipeline(
                {
                  caller: this,
                  pushToApi: true,
                  pipeline:
                  {
                    uid: this.pipelineUid,
                    status: (this.pipeline && this.pipeline.status && this.pipeline.status === 'Ready' ? this.pipeline.status : 'Dev'),
                    fieldsMapping: parsedFileContent.fieldsMapping || [],
                    // Update / Add extractMessageFieldOnly and any saved options to the Pipeline's Options
                    options: { ...(this.pipeline && this.pipeline.options ? this.pipeline.options : {}), ...(parsedFileContent && parsedFileContent.options ? parsedFileContent.options : {}) }
                  },
                  onSuccessCallBack: this.loadPipelines,
                  onErrorCallBack: this.loadPipelines
                }
              )
              notificationPopupId({
                type: 'positive',
                color: 'positive',
                icon: 'check',
                message: this.$t('Shared Fields Mapping file imported'),
                caption: fileName
              })
            } catch (error) {
              thereWasAnError = true
              this.$root.$emit('addAndShowErrorToErrorPanel',
                {
                  code: 'CantParseFileImportMapping',
                  messageForLogAndPopup: `Error trying to parse the content of ${filesInput.length} file. Error: ${error.message}`
                }
              )
            }
          } catch (error) {
            thereWasAnError = true
            this.$root.$emit('addAndShowErrorToErrorPanel',
              {
                code: 'CantReadFileImportMapping',
                messageForLogAndPopup: `Error trying to open ${filesInput.length} file. Error: ${error.message}`
              }
            )
          }

          if (thereWasAnError) {
            notificationPopupId({
              type: 'negative',
              color: 'negative',
              icon: 'report_problem',
              message: this.$t('Problem while importing Shared Fields Mapping file'),
              caption: fileName
            })
            console.log('Error: Problem while importing Shared Fields Mapping file')
          }
        }
      }
    },
    addNewDeployment () {
      this.$router.push('/Pipelines/' + this.pipelineUid + '/Deployments/Edit')
    },
    doPromptForDeploymentDetails (row) {
      if (row && row.openCollector && row.openCollector.uid && row.openCollector.uid.length) {
        this.$router.push('/Pipelines/' + this.pipelineUid + '/Deployments/' + row.openCollector.uid + '/Edit')
      }
    }, // doPromptForDeploymentDetails
    deleteDeploymentPrompt (row) {
      if (typeof row !== 'undefined') {
        const unDeployMessage = (row.enabled === false ? '' : ' ⚠️ This will NOT un-deploy it. It will simply delete the database record about this deployment. To un-deploy, click on Edit and un-deploy from there.')

        // ask to confirm
        this.$q.dialog({
          title: 'Confirm',
          message: 'Do you REALLY want to delete this Deployment?' + unDeployMessage,
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
          this.deleteDeployment({
            pushToApi: true,
            caller: this,
            pipelineUid: row.pipelineUid,
            openCollector: row.openCollector
          })
        }) // }).onOk(() => {
      }
    }, // deleteDeploymentPrompt
    wikiLink (reference) {
      // 'whatTheDifferenceLogArrayLogSet'
      return this.helpWikiUrlBase + reference
    }
  },
  mounted () {
    if (this.$route.params.pipelineUid && this.$route.params.pipelineUid.length) {
      if (this.pipelineUid !== this.$route.params.pipelineUid) {
        this.pipelineUid = this.$route.params.pipelineUid
      }
    }
  }
}
</script>

<style>

</style>
