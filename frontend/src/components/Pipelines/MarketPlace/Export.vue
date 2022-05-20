<template>
  <q-card style="min-width: 80vw;/* height: 90vh; */max-height: 90vh;">
    <q-card-section>
      <!-- <div class="text-h6" v-if="exportRequestType === 'collection'">{{ $t('Export EZ Cloud Collection Configuration') }}</div>
      <div class="text-h6" v-else-if="exportRequestType === 'mapping'">{{ $t('Export EZ Cloud Fields Mapping') }}</div>
      <div class="text-h6" v-else>{{ $t('Export EZ Cloud Pipeline Template') }}</div> -->
      <div class="text-h6">{{ $t('Export EZ Cloud Pipeline Template') }}</div>
    </q-card-section>

    <q-card-section class="q-pa-none q-ma-none">
      <q-scroll-area style="height: calc(90vh - 6rem);">

        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h5">
              {{ $t('Publish') }}
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="row q-gutter-x-md justify-evenly">
              <div>
                <q-toggle v-model="marketplaceExportConfiguration">
                  <q-icon name="input" size="md" class="q-mx-xs" />
                  Collection Configuration
                </q-toggle>
              </div>
              <div>
                <q-toggle v-model="marketplaceExporFieldsMapping">
                  <q-icon name="mediation" size="md" class="q-mx-xs" />
                  Fields Mapping
                </q-toggle>
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="text-bold">{{ $t('Publishing as:') }}</div>
            <div>{{ publisherDisplayName }}</div>
          </q-card-section>
        </q-card-section>

        <q-separator size="2px" class="q-mx-sm q-my-lg" />

        <q-card-section class="q-pt-none">
          <div class="text-h5">{{ $t('Sanitisation') }}</div>
        </q-card-section>

        <!-- <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h6">
              Collection Configuration
          </q-card-section>
          <q-card-section class="row q-gutter-x-lg">
            //
          </q-card-section>
        </q-card-section> -->

        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="row q-gutter-x-lg"> <!-- XXXX -->
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              style="min-width: 400px"
              :value="marketplaceExportConfiguration"
              :disabled="!marketplaceExportConfiguration"
            >
              <template v-slot:header>
                <div class="text-h6">
                    Collection Configuration
                </div>
              </template>
              <div class="q-ml-md">
                <div>
                  <q-icon name="label_important" color="accent" size="sm" class="q-mr-sm" />
                  <span class="text-bold">IMPORTANT</span>
                  <ol>
                    <li>Do review the configurataion below</li>
                    <li>Check for any token, credential or bits of information that the user of this Template will need to replace with their own values</li>
                    <li>If not already done, replace each of them with the string "<span class="text-bold text-italic">CHANGE_ME</span>" or something similar</li>
                    <ul>
                      <li>If they are part of a field that requires to be obfuscated, leave them NON-obfuscated, so the next user can spot them easily</li>
                    </ul>
                    <li>In the <span class="text-bold">Configuration steps</span> section of the <span class="text-bold">Read Me</span> below, make sure to mention each of them what data to replace them with</li>
                    <li>Once you are done. Double check again that no private information has been left in your configuration</li>
                    <li>To alter the Collection Configuration below</li>
                    <ol>
                      <li>Close this by clicking the "<span class="text-bold">CANCEL</span>" button below</li>
                      <li>Edit the Collection Configuration by clicking the "<span class="text-bold">Edit</span>" (<q-icon name="edit" />) button on right hand side action panel</li>
                    </ol>
                  </ol>
                </div>
                <div class="row q-my-sm">
                  <q-separator vertical size="2px" color="teal" />
                  <div class="q-ml-sm"><pre>{{ collectionConfigOutput }}</pre></div>
                </div>
              </div>
            </q-expansion-item>
          </q-card-section>
        </q-card-section>

        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="row q-gutter-x-lg">
            <q-expansion-item
              dense
              dense-toggle
              expand-separator
              style="min-width: 400px"
              :value="marketplaceExporFieldsMapping"
              :disabled="!marketplaceExporFieldsMapping"
            >
              <template v-slot:header>
                <div class="text-h6">
                    Fields Mapping
                </div>
              </template>
              <q-list>
                <q-item tag="label" v-ripple>
                  <q-item-section avatar>
                    <q-toggle v-model="shareFieldFrequencies" :disable="!marketplaceExporFieldsMapping" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Share Field Frequencies</q-item-label>
                    <q-item-label caption>Include the frequency statistics for each field</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple disable>
                  <q-item-section avatar>
                    <q-toggle color="orange" :value="false" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Share Field Values</q-item-label>
                    <q-item-label caption>Include all the observed values for each field</q-item-label>
                    <q-item-label caption class="text-bold text-italic"><q-icon name="dangerous" class="q-ma-none q-mr-xs" color="negative" />This is disabled for Market Place</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple>
                  <q-item-section avatar>
                    <q-toggle v-model="shareFieldMapping" :disable="!marketplaceExporFieldsMapping" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Share Field SIEM Mapping</q-item-label>
                    <q-item-label caption>Include the SIEM tags mapping for each field</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple>
                  <q-item-section avatar>
                    <q-toggle v-model="shareFieldModifiers" :disable="!marketplaceExporFieldsMapping" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Share Field Modifiers</q-item-label>
                    <q-item-label caption>Include the modifiers for each field</q-item-label>
                  </q-item-section>
                </q-item>

              </q-list>
            </q-expansion-item>
          </q-card-section>
        </q-card-section>

        <q-separator size="2px" class="q-mx-sm q-my-lg" />

        <q-card-section class="q-pt-none">
          <div class="text-h5">{{ $t('Pipeline Template Details') }}</div>
        </q-card-section>

        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h6">
              {{ $t('Name') }}
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input
              dense
              outlined
              v-model="newPipelineTemplateName"
              :hint="$t('Make sure to include vendor and product name.')"
              :rules="[val => !!val || $t('Pipeline Template name cannot be empty')]"
              />
          </q-card-section>
        </q-card-section>

        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h6">
              Icon / Logo
          </q-card-section>
          <q-card-section class="row q-gutter-x-lg">
            <div>
              <div class="text-h6 text-center">
                Import PNG
              </div>
              <q-separator spaced />
              <div class="row q-gutter-md">
                <div style="">
                  <q-editor
                    v-model="pictureEditorContent"
                    min-height="200px"
                    placeholder="Paste the PNG picture here"
                    :toolbar="[]"
                    style="min-width: 200px;"
                  />
                </div>
              </div>
            </div>

            <q-separator vertical />

            <div class="column" style="max-height: 300px">
              <div class="text-h6 text-center">
                Detected / Extracted
              </div>
              <q-separator spaced />
              <div class="row q-gutter-md">
                <div class="text-center" style="min-width: 70px">
                  <div>70x70</div>
                  <IconPicture
                    :pngBase64="pictureEditorContentPngBase64Extracted"
                    :size="70"
                  />
                </div>
                <div class="text-center" style="min-width: 150px">
                  <div>150x150</div>
                  <IconPicture
                    :pngBase64="pictureEditorContentPngBase64Extracted"
                    :size="150"
                  />
                </div>
              </div>
              <div v-if="!pictureImportPictureFound" class="q-mt-xl text-negative">
                <q-icon name="image_not_supported" />
                No picture found in content
              </div>
              <div v-if="pictureImportPictureFound && !pictureImportPictureIsPng" class="q-mt-xl text-warning">
                <q-icon name="image_not_supported" />
                The <span style="text-decoration: underline;">first</span> picture is not in a PNG.
              </div>
              <q-space />
              <q-btn
                :disabled="!(pictureEditorContentPngBase64Extracted && pictureEditorContentPngBase64Extracted.length && !(pictureEditorContentPngBase64ExtractedAccepted && pictureEditorContentPngBase64ExtractedAccepted.length))"
                class="self-end full-width"
                color="primary"
                icon="check_circle_outline"
                @click="acceptPictureEditorContentPngBase64()"
              >
                Accept
              </q-btn>
            </div>

            <q-separator vertical v-if="pictureEditorContentPngBase64ExtractedAccepted && pictureEditorContentPngBase64ExtractedAccepted.length" />

            <div v-if="pictureEditorContentPngBase64ExtractedAccepted && pictureEditorContentPngBase64ExtractedAccepted.length" class="column" style="max-height: 300px">
              <div class="text-h6 text-center">
                Icon to be published
              </div>
              <q-separator spaced />
              <div class="row q-gutter-md">
                <div class="text-center" style="min-width: 70px">
                  <div>70x70</div>
                  <IconPicture
                    :pngBase64="pictureEditorContentPngBase64ExtractedAccepted"
                    :size="70"
                  />
                </div>
                <div class="text-center" style="min-width: 150px">
                  <div>150x150</div>
                  <IconPicture
                    :pngBase64="pictureEditorContentPngBase64ExtractedAccepted"
                    :size="150"
                  />
                </div>
              </div>
              <q-space />
              <q-btn
                class="self-end full-width"
                color="negative"
                icon="close"
                @click="discardAcceptedPictureEditorContentPngBase64()"
              >
                Discard
              </q-btn>
            </div>

          </q-card-section>
        </q-card-section>

        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h6 row">
              Readme
          </q-card-section>

          <q-card-section class="" >
            <q-editor
              v-model="readmeContentEditor"
              min-height="20rem"
              max-height="calc(70vh - 10rem)"
              :dense="$q.screen.lt.md"
              :toolbar="[
                ['bold', 'italic', 'strike'],
                [
                  {
                    label: $q.lang.editor.formatting,
                    icon: $q.iconSet.editor.formatting,
                    list: 'no-icons',
                    options: [
                      'h1',
                      'h2',
                      'h3',
                      'h4',
                      'h5',
                      'h6',
                      'p',
                      'code'
                    ]
                  },
                  'removeFormat'
                ],
                [
                  {
                    label: $q.lang.editor.align,
                    icon: $q.iconSet.editor.align,
                    fixedLabel: true,
                    options: ['left', 'center', 'right', 'justify']
                  }
                ],
                ['hr', 'link'],
                ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
                ['print', 'fullscreen'],
                ['undo', 'redo']
              ]"
            />
          </q-card-section>
        </q-card-section>

        <q-separator size="2px" class="q-mx-sm q-my-lg" />

        <q-card-section class="q-pt-none">
          <div class="text-h5">{{ $t('Data to be exported') }}</div>
        </q-card-section>

        <q-card-section class="col q-ma-none q-pa-none q-my-lg">
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            style="min-width: 400px"
            :value="marketplaceExportConfiguration"
            :disabled="!marketplaceExportConfiguration"
          >
            <template v-slot:header>
              <div class="text-h6">
                  Collection Configuration
              </div>
            </template>
            <div class="q-ml-md">
              <div class="row q-my-sm" v-if="marketplaceExportConfiguration">
                <q-separator vertical size="2px" color="teal" />
                <div class="q-ml-sm"><pre>{{ collectionConfigOutput }}</pre></div>
              </div>
              <div v-else class="text-h5 text-italic">
                <q-icon name="info" />
                You selected not to export the Collection Configuration.
              </div>

            </div>
          </q-expansion-item>
        </q-card-section>

        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h6 row">
              Options
          </q-card-section>

          <q-card-section class="" >
            <q-toggle
              :value="!!optionsToBeSaved.extractMessageFieldOnly"
              label="Extract Beat's '.message' only"
            />
          </q-card-section>
        </q-card-section>

        <q-card-section class="col q-ma-none q-pa-none q-my-lg">
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            style="min-width: 400px"
            :value="marketplaceExporFieldsMapping"
            :disabled="!marketplaceExporFieldsMapping"
          >
            <template v-slot:header>
              <div class="text-h6">
                  Fields Mapping
              </div>
            </template>
            <div class="q-mx-md">
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="name"
                dense
                no-data-label="No Fields to display."
                :filter="searchFilter"
                rows-per-page-label="Fields per page:"
                :pagination.sync="pagination"
                v-if="marketplaceExporFieldsMapping"
              >
                <template v-slot:top>
                  <div class="full-width row wrap justify-end">
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
                  </div>
                </template>

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
              <div v-else class="text-h5 text-italic">
                <q-icon name="info" />
                You selected not to export the Fields Mapping.
              </div>
            </div>
          </q-expansion-item>
        </q-card-section>

        <q-card-section class=" q-ma-none q-pa-none q-my-lg">
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
          >
            <template v-slot:header>
              <div class="text-h6">
                  Raw Pipeline Template to be Published
              </div>
            </template>
            <pre class="q-ml-md">{{ pipelineTemplateToBePublished }}</pre>
          </q-expansion-item>
        </q-card-section>

        <q-card-section> <!-- XXXX -->
          <q-expansion-item
            dense
            dense-toggle
            expand-separator
            label="pipelineToExport"
          >
            <pre>{{ pipelineToExport }}</pre>
          </q-expansion-item>
        </q-card-section>

      </q-scroll-area>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right" >
      <!-- <q-btn color="primary" :label="$t('Export to EZ Market Place')" v-close-popup :disabled="mappingImportFileInput === null" @click="importMappingFromEZImportableConfigFile(mappingImportFileInput)" /> -->
      <q-btn color="primary" flat :label="$t('Cancel')" v-close-popup />
      <q-btn
        color="primary"
        :label="$t('Export to EZ Market Place')"
        :disabled="!(marketplaceExportConfiguration || marketplaceExporFieldsMapping)"
        @click="publishToMarketPlace()"
        :loading="publishingToEzMarketPlace"
        />
        <!-- v-close-popup -->
    </q-card-actions>
  </q-card>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import IconPicture from 'components/Pipelines/IconPicture.vue'
import { uid } from 'quasar'

// Readme HTML <-> Markdown
import { marked } from 'marked'
import { NodeHtmlMarkdown } from 'node-html-markdown'

const nhm = new NodeHtmlMarkdown(
  /* options (optional) */ {
    keepDataImages: true
  },
  /* customTransformers (optional) */ undefined,
  /* customCodeBlockTranslators (optional) */ undefined
)

export default {
  name: 'MarketPlaceExport',
  props: {
    exportRequestType: {
      type: String,
      default: ''
    },

    pipelineToExport: {
      type: Object,
      required: true
    },

    collectionConfigOutput: {
      type: String,
      required: true
    },

    publisherDisplayName: {
      type: String,
      required: true
    }

  },
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { IconPicture },
  data () {
    return {
      shareFieldFrequencies: true, // Include field frequencies when sharing?
      // shareFieldValues: false, // Include field values when sharing? Default FALSE as risk of sharing sensitive info
      shareFieldMapping: true, // Include field SIEM tags mapping when sharing?
      shareFieldModifiers: true, // Include field modifiers when sharing?
      marketplaceExportConfiguration: false, // Include Collection Configuration in Market Place export?
      marketplaceExporFieldsMapping: false, // Include Fields Mapping in Market Place export?
      newPipelineTemplateName: '',
      pictureEditorContent: '', //
      pictureEditorContentPngBase64Extracted: '', //
      pictureEditorContentPngBase64ExtractedAccepted: '', //
      pictureImportPictureFound: false, //
      pictureImportPictureIsPng: false, //
      readmeContentHtml: '', // Direct translation from the Markdown, untouched
      readmeContentEditor: '', // Version edited by the user
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
        rowsPerPage: 15
      },
      publishingToEzMarketPlace: false // Are we waiting for EZ Market while publishing the template
    }
  },
  computed: {
    ...mapState('mainStore', ['ezMarketPublisherDetails']),
    readmeContentEditorAsMarkdown () {
      try {
        return nhm.translate(this.readmeContentEditor)
      } catch {
        // Fails silently
      }
      // Fall back to an emtpy value
      return ''
    },
    tableData () {
      return (
        this.pipelineToExport &&
        this.pipelineToExport.fieldsMapping
          ? this.pipelineToExport.fieldsMapping
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
    optionsToBeSaved () {
      try {
        return JSON.parse(JSON.stringify(this.pipelineToExport.options))
      } catch (error) {
        return {}
      }
    },
    sanitisedFieldsMappingWithOptions () {
      let sanitisedFieldsMappingWithOptions
      if (this.marketplaceExporFieldsMapping) {
        // Sanitise the Mapping before export
        const sanitisedFieldsMapping = JSON.parse(JSON.stringify(this.pipelineToExport.fieldsMapping))
        sanitisedFieldsMapping.forEach(fieldMapping => {
          fieldMapping.seenInLogCount = (this.shareFieldFrequencies !== true ? 1 : fieldMapping.seenInLogCount)
          fieldMapping.values = [] // We are not allowing anyone to share their values to EZ Market Place
          fieldMapping.mappedField = (this.shareFieldMapping !== true ? undefined : fieldMapping.mappedField)
          fieldMapping.modifiers = (this.shareFieldModifiers !== true ? undefined : fieldMapping.modifiers)
        })

        // Add the relevant Options
        sanitisedFieldsMappingWithOptions = {
          options: {
            extractMessageFieldOnly: (this.pipelineToExport && this.pipelineToExport.options ? this.pipelineToExport.options.extractMessageFieldOnly : undefined)
          },
          fieldsMapping: sanitisedFieldsMapping
        }
      }

      return sanitisedFieldsMappingWithOptions
    },
    pipelineTemplateStats () {
      const fieldsMappingToBeSavedIsArray = !!(this.marketplaceExporFieldsMapping && this.sanitisedFieldsMappingWithOptions && this.sanitisedFieldsMappingWithOptions.fieldsMapping && Array.isArray(this.sanitisedFieldsMappingWithOptions.fieldsMapping))
      const fieldsMappingToBeSavedIsArrayWithData = !!(fieldsMappingToBeSavedIsArray && this.sanitisedFieldsMappingWithOptions.fieldsMapping.length > 0)
      return {
        collectionShipper: (this.pipelineToExport.collectionConfig && this.pipelineToExport.collectionConfig.collectionShipper ? this.pipelineToExport.collectionConfig.collectionShipper : undefined),
        collectionMethod: (this.pipelineToExport.collectionConfig && this.pipelineToExport.collectionConfig.collectionMethod ? this.pipelineToExport.collectionConfig.collectionMethod : undefined),
        detectedFields: (fieldsMappingToBeSavedIsArray ? this.sanitisedFieldsMappingWithOptions.fieldsMapping.length : undefined),
        mappedFields: (fieldsMappingToBeSavedIsArrayWithData ? this.sanitisedFieldsMappingWithOptions.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) : undefined),
        sharedFieldFrequencies: (fieldsMappingToBeSavedIsArrayWithData ? this.sanitisedFieldsMappingWithOptions.fieldsMapping.reduce((count, fm) => (fm.seenInLogCount > 1 ? count + 1 : count), 0) : undefined) > 0,
        sharedFieldValues: false, // We are not allowing anyone to share their values to EZ Market Place
        sharedFieldMapping: (fieldsMappingToBeSavedIsArrayWithData ? this.sanitisedFieldsMappingWithOptions.fieldsMapping.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) : undefined) > 0,
        sharedFieldModifiers: (fieldsMappingToBeSavedIsArrayWithData ? this.sanitisedFieldsMappingWithOptions.fieldsMapping.reduce((count, fm) => (fm.modifiers && Array.isArray(fm.modifiers) && fm.modifiers.length ? count + 1 : count), 0) : undefined) > 0
      }
    },
    pipelineTemplateToBePublished () {
      const pipelineTemplate = {
        pipelineTemplateUid: uid(),
        name: this.newPipelineTemplateName,
        readmeMarkdown: this.readmeContentEditorAsMarkdown,
        iconPicture: this.pictureEditorContentPngBase64ExtractedAccepted,
        collectionConfiguration: (this.marketplaceExportConfiguration ? { collectionConfig: this.pipelineToExport.collectionConfig } : undefined),
        fieldsMapping: (this.marketplaceExporFieldsMapping ? this.sanitisedFieldsMappingWithOptions : undefined),
        stats: this.pipelineTemplateStats
      }

      return pipelineTemplate
    }
  },
  methods: {
    ...mapActions('mainStore', ['createEzMarketPipelineTemplate']),
    extractPictureEditorContentPngBase64 (newValue) {
      // <img src="data:image/png;base64,iVBORw0KGgoAA...Uawz9YIPMfeaw" alt="">
      try {
        const rawHtml = newValue || ''

        const matches = rawHtml.match(/<img .*?src="([^"]*)"/)
        if (matches && Array.isArray(matches) && matches.length >= 2) {
          this.pictureImportPictureFound = true
          this.loadImageFromUrl((matches && Array.isArray(matches) && matches.length >= 2 ? matches[1] : ''))
          return
        } else {
          this.pictureImportPictureFound = false
          this.pictureImportPictureIsPng = false
          this.pictureEditorContentPngBase64Extracted = ''
        }
      } catch (error) {
        // Fails silently
        this.pictureImportPictureFound = false
        this.pictureImportPictureIsPng = false
        this.pictureEditorContentPngBase64Extracted = ''
      }
      return ''
    },
    async loadImageFromUrl (imageUrl) {
      if (imageUrl && imageUrl.length) {
        try {
          const response = await fetch(imageUrl)
          const imageBlob = await response.blob()
          const reader = new FileReader()
          reader.readAsDataURL(imageBlob)
          reader.onloadend = () => {
            const base64data = reader.result
            const matchesEmbeddedPng = base64data.match(/data:image\/png;base64,(.*)/)
            if (matchesEmbeddedPng && Array.isArray(matchesEmbeddedPng) && matchesEmbeddedPng.length >= 2) {
              this.pictureEditorContentPngBase64Extracted = (matchesEmbeddedPng && Array.isArray(matchesEmbeddedPng) && matchesEmbeddedPng.length >= 2 ? matchesEmbeddedPng[1] : '')
              this.pictureImportPictureIsPng = true
            } else {
              this.pictureImportPictureIsPng = false
              this.pictureEditorContentPngBase64Extracted = ''
            }
          }
        } catch (error) {
          this.pictureImportPictureIsPng = false
          this.pictureEditorContentPngBase64Extracted = ''
        }
      }
    },
    acceptPictureEditorContentPngBase64 () {
      this.pictureEditorContentPngBase64ExtractedAccepted = this.pictureEditorContentPngBase64Extracted
    },
    discardAcceptedPictureEditorContentPngBase64 () {
      this.pictureEditorContentPngBase64ExtractedAccepted = ''
    },
    addReadMeTemplate (templateMarkdown) {
      try {
        this.readmeContentHtml += '\n' + marked.parse(templateMarkdown)
      } catch (error) {
        // Fails silently
      } finally {
        this.readmeContentEditor = this.readmeContentHtml
      }
    },
    publishToMarketPlace () {
      this.publishingToEzMarketPlace = true
      this.createEzMarketPipelineTemplate(
        {
          pipelineTemplateToPublish: this.pipelineTemplateToBePublished,
          onSuccessCallBack: this.publishedToMarketPlace,
          onErrorCallBack: this.publishedToMarketPlace,
          params: undefined
        }
      )
    },
    publishedToMarketPlace (payload) {
      this.publishingToEzMarketPlace = false
    }
  },
  mounted () {
    if (this.exportRequestType === 'collection') {
      this.marketplaceExportConfiguration = true
    } else if (this.exportRequestType === 'mapping') {
      this.marketplaceExporFieldsMapping = true
    } else {
      this.marketplaceExportConfiguration = true
      this.marketplaceExporFieldsMapping = true
    }

    this.newPipelineTemplateName = (
      this.pipelineToExport && this.pipelineToExport.name
        ? this.pipelineToExport.name
        : ''
    )

    this.addReadMeTemplate(`
# Vendor name - Product name
### Configuration steps:
1. Go there
1. Do this
1. Then this
1. Copy this value
   1. Paste in field **Xyz** of the **Collection Configuration**
1. ...

**Good practice for writting these Configuration Steps:**
   1. 👉 **Ideally, add screenshots** 👈
      - 🛑 **DO BLUR OR HIDE ANY OF YOUR CREDENTIALS**
   1. Add any steps that was necessary to get things like:
      - URL for the API
      - Tenant ID
      - Token or credentials
      - Access rights on the API backend
   1. Keep in mind that someone with potentially much less knowledge about this API/Product than you will want simple and clear instructions to successfully deploy your Pipeline Template
   1. Be wary of inadvertently share any of your IDs, tokens, credentials, IP addresses, private information (company name, domain, email, PII, etc.)
      - Prime candidates for this type of mistake are in screenshots. For example:
         - URL of the Admin page you are screenshooting
         - Other tabs in you web browser
         - Computer / user name on the prompt of your shell/command line

### Gotchas / Things to know:
- Be careful about Xyz
- Make sure the value for \`xyz\` is lower case/upper case/doesn't have leading or trailing space characters

### Notes:
- We are using version 0.0 of Product Name
- We only tested this with versions 0.0, 0.0 and 0.0
- We are not using module/feature Xyz of Product Name, so we didn't map any fields for the related logs to that module/feature
- We are only using module/feature Xyz of Product Name, so we only mapped the related logs to that module/feature
- Link to my blog post or article / the blog post or article we followed to build this Pipeline

---

Official Help/Documentation for the **Product name API**:

<https://docs.vendor.com/product/API>
`)
  },
  watch: {
    pictureEditorContent: {
      handler (newValue) {
        this.extractPictureEditorContentPngBase64(newValue)
      }
    }
  }
}
</script>

<style>

</style>
