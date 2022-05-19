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

                    <q-item clickable v-close-popup @click="doShowMarketplaceExportPopup({exportType: 'collection'})">
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

                    <q-item clickable v-close-popup @click="doShowMarketplaceImportPopup({importType: 'collection'})">
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

                    <q-item clickable v-close-popup @click="doShowMarketplaceExportPopup({exportType: 'mapping'})">
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

                    <q-item clickable  v-close-popup @click="doShowMarketplaceImportPopup({importType: 'mapping'})">
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
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
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

    <q-dialog v-model="showMarketplaceImportPopup" persistent>
      <q-card style="min-width: 900px">
        <q-card-section>
          <div class="text-h6" v-if="marketplaceImportPopupType === 'collection'">{{ $t('Import EZ Cloud Collection Configuration') }}</div>
          <div class="text-h6" v-else-if="marketplaceImportPopupType === 'mapping'">{{ $t('Import EZ Cloud Fields Mapping') }}</div>
          <div class="text-h6" v-else>{{ $t('Import EZ Cloud Pipeline Template') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-table
            title="Pipelines Templates"
            :data="MarketplaceImportPopupTableData"
            :columns="marketplaceImportPopupColumns"
            row-key="uid"
            dense
            no-data-label="No Pipeline Template to display."
            :filter="marketplaceImportPopupSearchFilter"
            :loading="dataLoading"
            rows-per-page-label="Pipeline Templates per page:"
            :pagination.sync="marketplaceImportPopupPagination"
          >

            <template v-slot:top>
              <div class="full-width row wrap justify-between">
                <div class="q-table__title">
                  Pipeline Templates
                </div>
                <div class="row q-gutter-md">
                  <div style="width:300px;">
                    <q-input outlined dense debounce="300" v-model="marketplaceImportPopupSearchFilter" placeholder="Search">
                      <template v-slot:append>
                        <q-btn v-if="marketplaceImportPopupSearchFilter.length" dense flat icon="close" @click="marketplaceImportPopupSearchFilter=''" />
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                  <q-btn dense outline icon="refresh" @click="reloadEzMarketPipelineTemplates()">
                    <q-tooltip content-style="font-size: 1em">
                      Reload the list of Pipeline Templates.
                    </q-tooltip>
                  </q-btn>
                </div>
              </div>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  icon="launch"
                  class="q-mr-sm"
                  :to="'/MarketPlace/PipelineTemplates/' + props.row.uid + '/Properties'"
                  :disable="!(props.row.status && props.row.status === 'Visible')"
                >
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Open Pipeline Template full properties') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  icon="input"
                  dense
                  :flat="(marketplaceImportPopupType === 'collection' || marketplaceImportPopupType === 'mapping' ? false : true)"
                  :color="(marketplaceImportPopupType === 'collection' || marketplaceImportPopupType === 'mapping' ? '' : 'primary')"
                  @click="loadAndImportIntoCurrentPipelineFromTemplate(props.row, { importCollectionConfiguration: true, importFieldsMapping: true })"
                >
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Import Collection and Fields Mapping') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  icon="mediation"
                  dense
                  :flat="(marketplaceImportPopupType === 'collection' ? false : true)"
                  :color="(marketplaceImportPopupType === 'collection' ? 'primary' : '')"
                  @click="loadAndImportIntoCurrentPipelineFromTemplate(props.row, { importCollectionConfiguration: true, importFieldsMapping: false })"
                >
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Import Collection only') }}
                  </q-tooltip>
                </q-btn>
                <q-btn
                  icon="account_tree"
                  dense
                  :flat="(marketplaceImportPopupType === 'mapping' ? false : true)"
                  :color="(marketplaceImportPopupType === 'mapping' ? 'primary' : '')"
                  @click="loadAndImportIntoCurrentPipelineFromTemplate(props.row, { importCollectionConfiguration: false, importFieldsMapping: true })"
                >
                  <q-tooltip content-style="font-size: 1em">
                    {{ $t('Import Fields Mapping only') }}
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <div>
                  <q-icon name="visibility" color="positive" size="md" v-if="props.value === 'Visible'" />
                  <q-icon name="visibility_off" style="opacity: .5;" size="md" v-else-if="props.value === 'Hidden'" />
                  <q-icon name="pending_actions" color="primary" size="md" v-else-if="props.value === 'Pending review'" />
                  <q-icon name="assignment_late" color="negative" style="opacity: .75;" size="md" v-else-if="props.value === 'Failed Review'" />
                  <q-icon name="auto_delete" color="negative" style="opacity: .5;" size="md" v-else-if="props.value === 'To be deleted'" />
                  <q-icon name="question_mark" color="orange" size="md" v-else />
                  <q-tooltip content-style="font-size: 1em">
                    {{ props.row.statusDescription }}
                  </q-tooltip>
                  <br>
                  {{ props.value }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-publisher="props">
              <q-td :props="props">
                <Identicon :identity="props.value" />
                <div>
                  {{ props.value }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-iconPicture="props">
              <q-td :props="props">
                <IconPicture
                  :pngBase64="props.value"
                  :size="70"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-pipelineTemplateCollectionStats="props">
              <q-td :props="props">
                <q-tooltip content-style="font-size: 1em">
                  <span class="text-bold">Shipper:</span> {{ collectionShipperByValue(props.row.stats.collectionShipper).label }}<br>
                  <span class="text-bold">Method:</span> {{ collectionMethodByValue(props.row.stats.collectionMethod).label }}
                </q-tooltip>
                <div
                  v-if="props.value"
                  class="row items-center justify-evenly"
                >
                  <img v-if="collectionShipperByValue(props.row.stats.collectionShipper).icon.length" :src="'/shippers/' + collectionShipperByValue(props.row.stats.collectionShipper).icon + '.svg'" width="40px">
                  <q-icon :name="collectionMethodByValue(props.row.stats.collectionMethod).icon" size="40px" />
                </div>
                <div v-else>
                  -
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-pipelineTemplateFieldsMappingStats="props">
              <q-td :props="props">
                <div
                  v-if="props.value"
                  class="row items-center justify-center"
                >
                  <q-tooltip content-style="font-size: 1em">
                    <div class="column">
                      <div>
                        <span>Detected fields: {{ props.row.stats.detectedFields }}</span><br>
                        <span>Mapped fields: {{ props.row.stats.mappedFields }}</span>&nbsp;(<span class="text-bold">{{ Math.round(props.value * 100) / 100 }}%</span>)
                      </div>
                      <q-separator spaced  />
                      <div class="column q-gutter-y-xs">
                        <q-badge :color="(props.row.stats && props.row.stats.sharedFieldFrequencies ? 'positive' : 'grey')" text-color="black" label="Shared Frequency" />
                        <q-badge :color="(props.row.stats && props.row.stats.sharedFieldMapping ? 'positive' : 'grey')" text-color="black" label="Shared Mapping" />
                        <q-badge :color="(props.row.stats && props.row.stats.sharedFieldModifiers ? 'positive' : 'grey')" text-color="black" label="Shared Modifiers" />
                      </div>
                    </div>
                  </q-tooltip>
                  <q-circular-progress
                    class="q-mr-md"
                    :value="Math.round(props.value)"
                    show-value
                    :font-size="(props.value < 100 ? '0.5em' : '0.4em')"
                    size="2.8em"
                    :thickness="0.2"
                    :color="(darkMode ? 'blue-3' : 'blue-10')"
                    :track-color="(darkMode ? 'grey-9' : 'grey-3')"
                  />
                </div>
                <div v-else>
                  -
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-created="props">
              <q-td :props="props">
                <div>
                  <q-tooltip content-style="font-size: 1em;">
                    <span class="text-bold">Created: </span>{{ props.value }}<br>
                    <span class="text-bold">Modified: </span>{{ timeAgo(props.row.modified) }}<br>
                    ({{ props.row.modified }})
                  </q-tooltip>
                  {{ timeAgo(props.value) }}
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-modified="props">
              <q-td :props="props">
                <div>
                  <q-tooltip content-style="font-size: 1em;">
                    {{ props.value }}
                  </q-tooltip>
                  {{ timeAgo(props.value) }}
                </div>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" >
          <q-btn color="primary" flat :label="$t('Close')" v-close-popup />
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

    <q-dialog v-model="showMarketplaceExportPopup" persistent v-if="publisherDisplayName == null">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6" v-if="marketplaceExportPopupType === 'collection'">{{ $t('Export EZ Cloud Collection Configuration') }}</div>
          <div class="text-h6" v-else-if="marketplaceExportPopupType === 'mapping'">{{ $t('Export EZ Cloud Fields Mapping') }}</div>
          <div class="text-h6" v-else>{{ $t('Export EZ Cloud Pipeline Template') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none column">
          <div class="text-bold">{{ $t('Your Publisher profile doesn\'t exist yet.') }}</div>
          <div class="q-mb-md">{{ $t('You need one to be able to publish anything to the MarketPlace.') }}</div>
          <q-btn color="primary" :label="$t('Edit My Profile')" to="/MarketPlace/PublisherProfile" :loading="loadingMarketPublisherDetails" />
          <q-btn flat icon="refresh" @click="reloadEzMarketPublisherDetails()" :loading="loadingMarketPublisherDetails">
            <q-tooltip content-style="font-size: 1rem;">
              {{ $t('Reload Publisher Profile') }}
            </q-tooltip>
          </q-btn>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" >
          <q-btn color="primary" flat :label="$t('Cancel')" v-close-popup />
          <!-- <q-btn color="primary" :label="$t('Import Fields Mapping')" v-close-popup :disabled="mappingImportFileInput === null" @click="importMappingFromEZImportableConfigFile(mappingImportFileInput)" /> -->
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showMarketplaceExportPopup" persistent v-else>
      <MarketPlaceExport
        :exportRequestType="marketplaceExportPopupType"
        :pipelineToExport="pipeline"
        :collectionConfigOutput="collectionConfigOutput"
        :publisherDisplayName="publisherDisplayName"
      />
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
import MarketPlaceExport from 'components/Pipelines/MarketPlace/Export.vue'
import Identicon from 'components/Publisher/Identicon.vue'
import IconPicture from 'components/Pipelines/IconPicture.vue'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

export default {
  name: 'PagePipelineProperties',
  mixins: [
    mixinSharedLoadCollectorsAndPipelines, // Shared functions to load the Collectors and Pipelines
    mixinSharedSocket, // Shared function and state to access the Socket.io
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedShipperAndCollectionsHelpers // Shared funtion to provide info (icon, names, etc...) for Shippers and Collections methods
  ],
  components: { MarketPlaceExport, Identicon, IconPicture },
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
      shareFieldModifiers: true, // Include field modifiers when sharing?
      showMarketplaceImportPopup: false, // Governs the display of the Popup to import shared collection config from Market Place
      marketplaceImportPopupType: null, // Select the type of import for the popup. Either "collection" or "mapping"
      marketplaceImportPopupSearchFilter: '',
      marketplaceImportPopupColumns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'iconPicture', align: 'center', label: 'Icon / Logo', field: 'iconPicture', sortable: false },
        { name: 'name', align: 'center', label: 'Pipeline Template Name', field: 'name', sortable: true, classes: '', style: 'white-space: pre-line;' },
        { name: 'pipelineTemplateCollectionStats', align: 'center', label: 'Collection', field: row => (row.stats ? `${row.stats.collectionShipper || ''}${row.stats.collectionMethod || ''}` : null), sortable: true },
        { name: 'pipelineTemplateFieldsMappingStats', align: 'center', label: 'Mapping', field: row => (row.stats && row.stats.detectedFields > 0 ? (row.stats.mappedFields || 0) / row.stats.detectedFields * 100 : null), sortable: true },
        { name: 'publisher', align: 'center', label: 'Publisher', field: 'publisher', sortable: true },
        { name: 'created', align: 'center', label: 'Created', field: 'created', sortable: true }
        // { name: 'modified', align: 'center', label: 'Modified', field: 'modified', sortable: true },
        // { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true }
      ],
      marketplaceImportPopupPagination: {
        sortBy: 'created',
        descending: true, // Most recent on top
        rowsPerPage: 5
      },
      marketplaceImportPopupDataLoading: false,
      loadingMarketPublisherDetails: false,
      showMarketplaceExportPopup: false, // Governs the display of the Popup to export shared collection config from Market Place
      marketplaceExportPopupType: null, // Select the type of import for the popup. Either "collection" or "mapping"
      marketplaceExportConfiguration: false, // Include Collection Configuration in Market Place export?
      marketplaceExporFieldsMapping: false // Include Fields Mapping in Market Place export?
    }
  },
  computed: {
    ...mapGetters('mainStore', ['openCollectors', 'pipelines']),
    ...mapState('mainStore', ['collectionMethodsOptions', 'collectionShippersOptions', 'ezMarketPipelineTemplates', 'helpWikiUrlBase', 'ezMarketPublisherDetails']),
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
    },
    MarketplaceImportPopupTableData () {
      return this.ezMarketPipelineTemplates.filter(template => template.status === 'Visible')
    },
    publisherDisplayName () {
      return (this.ezMarketPublisherDetails ? this.ezMarketPublisherDetails.displayName : null)
    }
  },
  methods: {
    ...mapActions('mainStore', ['upsertPipeline', 'deleteDeployment', 'adaptPipelineCollectionConfiguration', 'reloadEzMarketPipelineTemplates', 'loadEzMarketPipelineTemplateById', 'loadEzMarketPublisherDetails']),
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
    async importFromEZImportableConfig (newConfiguration, newMapping, newOptions) {
      let thereWasAnError = false
      // Parse it out and import
      try {
        // Parse
        const parsedNewConfigContent = (
          newConfiguration
            ? (
                typeof newConfiguration === 'string'
                  ? JSON.parse(newConfiguration)
                  : JSON.parse(JSON.stringify(newConfiguration))
              )
            : undefined
        )

        const parsedNewMappingContent = (
          newMapping
            ? (
                typeof newMapping === 'string'
                  ? JSON.parse(newMapping)
                  : JSON.parse(JSON.stringify(newMapping))
              )
            : undefined
        )

        const parsedNewOptionsContent = (
          newOptions
            ? (
                typeof newOptions === 'string'
                  ? JSON.parse(newOptions)
                  : JSON.parse(JSON.stringify(newOptions))
              )
            : undefined
        )

        // Update Pipeline and Persist
        this.upsertPipeline(
          {
            caller: this,
            pushToApi: true,
            pipeline:
            {
              uid: this.pipelineUid,
              status: (this.pipeline && this.pipeline.status && this.pipeline.status === 'Ready' ? this.pipeline.status : 'Dev'),
              collectionConfig: (
                newConfiguration
                  ? await this.adaptPipelineCollectionConfiguration(
                    {
                      importedCollectionConfiguration: parsedNewConfigContent,
                      targetDetails: { uid: this.pipelineUid, name: this.pipeline.name }
                    }
                  )
                  : undefined
              ),
              fieldsMapping: (
                newMapping
                  ? parsedNewMappingContent
                  : undefined
              ),
              options: (
                newOptions
                  ? parsedNewOptionsContent
                  : undefined
              )

            },
            onSuccessCallBack: this.loadPipelines,
            onErrorCallBack: this.loadPipelines
          }
        )
      } catch (error) {
        thereWasAnError = true
        this.$root.$emit('addAndShowErrorToErrorPanel',
          {
            code: 'CantParseFileImportCollection',
            messageForLogAndPopup: `Error trying to parse the content of the imported Collection Configuration file. Error: ${error.message}`
          }
        )
      }

      return !thereWasAnError
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
            if (this.importFromEZImportableConfig(fileContent, undefined, undefined)) {
              notificationPopupId({
                type: 'positive',
                color: 'positive',
                icon: 'check',
                message: this.$t('Shared Collection Configuration file imported'),
                caption: fileName
              })
            } else {
              thereWasAnError = true
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
    doShowMarketplaceImportPopup (options) {
      this.marketplaceImportPopupType = options.importType || 'collection'
      this.showMarketplaceImportPopup = true
      if (!(this.ezMarketPipelineTemplates && this.ezMarketPipelineTemplates.length)) {
        this.reloadEzMarketPipelineTemplates()
      }
    },
    loadAndImportIntoCurrentPipelineFromTemplate (selectedPipelineTemplate, { importCollectionConfiguration, importFieldsMapping }) {
      if (
        selectedPipelineTemplate &&
        selectedPipelineTemplate.uid &&
        selectedPipelineTemplate.uid.length &&
        (importCollectionConfiguration || importFieldsMapping)
      ) {
        // Get confirmation from the user before overiding anything
        let confirmationMessage = ''
        if (importCollectionConfiguration && importFieldsMapping) {
          confirmationMessage = this.$t('This will overide any existing Collection Configuration and Fields Mapping in the current Pipeline. Are you sure?')
        } else if (importCollectionConfiguration) {
          confirmationMessage = this.$t('This will overide any existing Collection Configuration in the current Pipeline. Are you sure?')
        } else if (importFieldsMapping) {
          confirmationMessage = this.$t('This will overide any existing Fields Mapping in the current Pipeline. Are you sure?')
        }

        this.$q.dialog({
          title: this.$t('Confirm overide'),
          message: confirmationMessage,
          ok: {
            push: true,
            color: 'negative'
          },
          cancel: {
            push: true,
            color: 'positive'
          },
          persistent: true
        }).onOk(async () => {
          // Load full details of the Template
          // Import it once loaded
          this.loadEzMarketPipelineTemplateById(
            {
              pipelineTemplateUid: selectedPipelineTemplate.uid,
              onSuccessCallBack: this.importIntoCurrentPipelineFromTemplate,
              // onErrorCallBack,
              params: { selectedPipelineTemplate, importCollectionConfiguration, importFieldsMapping }
            }
          )
        }) // }).onOk(() => {
      }
    },
    importIntoCurrentPipelineFromTemplate ({ data, success, params, messageForLogAndPopup }) {
      // This is called on success, using onSuccessCallBack. Which has got the following call:
      // onSuccessCallBack({
      //   data: (data && data.records ? data.records : undefined),
      //   success: true,
      //   params,
      //   messageForLogAndPopup: null
      // })

      // Extract selectedPipelineTemplate, importCollectionConfiguration and importFieldsMapping back out of Params
      const { selectedPipelineTemplate, importCollectionConfiguration, importFieldsMapping } = params
      const loadedPipelineTemplateContent = data || {}

      if (success && selectedPipelineTemplate && loadedPipelineTemplateContent && (importCollectionConfiguration || importFieldsMapping)) {
        const notificationPopupId = this.$q.notify({
          icon: 'cloud_download',
          message: (
            importCollectionConfiguration
              ? this.$t('Importing Shared Collection Configuration from Template...')
              : (
                  importFieldsMapping
                    ? this.$t('Importing Shared Fields Mapping from Template...')
                    : this.$t('Importing Shared Collection Configuration and Fields Mapping from Template...')
                )
          ),
          caption: selectedPipelineTemplate.name,
          type: 'ongoing'
        })

        let thereWasAnError = false

        // Read the Imported Collection Configuration, if required
        const pipelineTemplateCollectionConfigContent = (
          importCollectionConfiguration
            ? (
                loadedPipelineTemplateContent &&
                loadedPipelineTemplateContent.collection_configuration &&
                loadedPipelineTemplateContent.collection_configuration.collectionConfig
                  ? loadedPipelineTemplateContent.collection_configuration.collectionConfig
                  : {}
              )
            : undefined
        )

        // Read the Imported Fields Mapping and Options, if required
        const pipelineTemplateFieldsMappingContent = (
          importFieldsMapping
            ? (
                loadedPipelineTemplateContent &&
                loadedPipelineTemplateContent.mapping_configuration &&
                loadedPipelineTemplateContent.mapping_configuration.fieldsMapping
                  ? loadedPipelineTemplateContent.mapping_configuration.fieldsMapping
                  : []
              )
            : undefined
        )
        const pipelineTemplateOptionsContent = (
          importFieldsMapping
            ? (
                loadedPipelineTemplateContent &&
                loadedPipelineTemplateContent.mapping_configuration &&
                loadedPipelineTemplateContent.mapping_configuration.options
                  ? loadedPipelineTemplateContent.mapping_configuration.options
                  : {}
              )
            : undefined
        )

        // Parse it out and import
        if (this.importFromEZImportableConfig(pipelineTemplateCollectionConfigContent, pipelineTemplateFieldsMappingContent, pipelineTemplateOptionsContent)) {
          notificationPopupId({
            type: 'positive',
            color: 'positive',
            icon: 'check',
            message: (
              importCollectionConfiguration
                ? this.$t('Shared Collection Configuration imported from Template...')
                : (
                    importFieldsMapping
                      ? this.$t('Shared Fields Mapping imported from Template...')
                      : this.$t('Shared Collection Configuration and Fields Mapping imported from Template...')
                  )
            ),
            caption: selectedPipelineTemplate.name
          })
        } else {
          thereWasAnError = true
        }

        if (thereWasAnError) {
          notificationPopupId({
            type: 'negative',
            color: 'negative',
            icon: 'report_problem',
            message: (
              importCollectionConfiguration
                ? this.$t('Problem while importing Shared Collection Configuration from Template.')
                : (
                    importFieldsMapping
                      ? this.$t('Problem while importing Shared Fields Mapping from Template.')
                      : this.$t('Problem while importing Shared Collection Configuration and Fields Mapping from Template.')
                  )
            ),
            caption: selectedPipelineTemplate.name
          })
          console.log('Error: Problem while importing Shared Collection Configuration and/or Fields Mapping from Template')
        }
      }
    },
    timeAgo (timestamp) { // XXXX Move to its own Mixin
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
    collectionShipperByValue (value) { // XXXX Move to its own Mixin
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'unknown', outputFormat: 'json' }
      if (value && value.length) {
        return this.collectionShippersOptions.find(cso => cso.value && cso.value === value) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionMethodByValue (value) { // XXXX Move to its own Mixin
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'help_center' }
      if (value && value.length) {
        return this.collectionMethodsOptions.find(cmo => cmo.value && cmo.value === value) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    doShowMarketplaceExportPopup (options) {
      this.marketplaceExportPopupType = options.exportType || 'collection'
      this.showMarketplaceExportPopup = true
      if (!(this.ezMarketPublisherDetails && this.ezMarketPublisherDetails.displayName && this.ezMarketPublisherDetails.displayName.length)) {
        this.reloadEzMarketPublisherDetails()
      }
    },
    reloadEzMarketPublisherDetails () {
      this.loadingMarketPublisherDetails = true
      this.loadEzMarketPublisherDetails({
        onSuccessCallBack: this.ezMarketPublisherDetailsLoaded,
        onErrorCallBack: this.ezMarketPublisherDetailsLoaded
      })
    },
    ezMarketPublisherDetailsLoaded (payload) {
      this.loadingMarketPublisherDetails = false
      if (payload) {
        if (payload.success !== true) {
          this.$q.notify({
            type: 'negative',
            color: 'negative',
            icon: 'report_problem',
            message: this.$t('Error loading Publisher\'s details'),
            caption: payload.messageForLogAndPopup || ''
          })
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
              if (
                this.importFromEZImportableConfig(
                  undefined,
                  parsedFileContent.fieldsMapping || [],
                  { ...(this.pipeline && this.pipeline.options ? this.pipeline.options : {}), ...(parsedFileContent && parsedFileContent.options ? parsedFileContent.options : {}) }
                )
              ) {
                notificationPopupId({
                  type: 'positive',
                  color: 'positive',
                  icon: 'check',
                  message: this.$t('Shared Fields Mapping file imported'),
                  caption: fileName
                })
              } else {
                thereWasAnError = true
              }
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
