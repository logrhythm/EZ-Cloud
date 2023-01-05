<template>
  <q-page class="q-pa-xl">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Pipeline Templates" :to="'/Admin/PipelineTemplates'" />
        <q-separator vertical />
        <q-btn no-caps flat dense icon="save" label="Save" color="primary" :disabled="!needsSaving" @click="save()" />
        <q-btn no-caps flat dense icon="restore" label="Reverse to last saved" @click="reverseToLastSaved()" />
        <q-toolbar-title style="opacity:.4" class="text-center">Admin : Pipeline Templates : Review Template<span v-if="pipelineTemplateName && pipelineTemplateName.length">:  {{ pipelineTemplateName }}</span></q-toolbar-title>
      </q-toolbar>
    </q-header>
    <div class="q-gutter-sm">

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Properties
            </q-card-section>
            <q-card-section class="row">
              <div>
                <IconPicture
                  :pngBase64="pipelineTemplate.pipelineTemplateIconPicture"
                  :size="150"
                />
              </div>
              <div class="q-ml-md col">
                <div class="row">
                  <div>
                    <div class="text-h5">
                      {{ pipelineTemplate.pipelineTemplateName }}
                    </div>
                    <div class="text-caption text-italic">
                      {{ pipelineTemplate.pipelineTemplateUid }}
                    </div>
                  </div>

                  <q-space />

                  <div class="row">
                    <div>
                      <q-icon name="visibility" color="positive" size="lg" v-if="pipelineTemplate.statusName === 'Visible'" />
                      <q-icon name="visibility_off" style="opacity: .5;" size="lg" v-else-if="pipelineTemplate.statusName === 'Hidden'" />
                      <q-icon name="pending_actions" color="primary" size="lg" v-else-if="pipelineTemplate.statusName === 'Pending review'" />
                      <q-icon name="assignment_late" color="negative" style="opacity: .75;" size="lg" v-else-if="pipelineTemplate.statusName === 'Failed Review'" />
                      <q-icon name="auto_delete" color="negative" style="opacity: .5;" size="lg" v-else-if="pipelineTemplate.statusName === 'To be deleted'" />
                      <q-icon name="question_mark" color="orange" size="lg" v-else />
                      <q-tooltip style="font-size: 1em">
                        <span class="text-bold">Status ID:</span> {{ pipelineTemplate.statusId }}
                      </q-tooltip>
                    </div>
                    <div class="q-ml-sm">
                      <div class="text-bold">
                        {{ pipelineTemplate.statusName }}
                      </div>
                      <div class="text-caption">
                        {{ pipelineTemplate.statusDescription }}
                      </div>
                    </div>
                  </div>
                </div>

                <q-separator spaced />

                <div class="row justify-between">
                  <div class="">
                    <div class="">
                      <span class="text-bold">Created:</span> {{ pipelineTemplate.pipelineTemplateCreatedOn }}
                    </div>
                    <div class="">
                      <span class="text-bold">Modified:</span> {{ pipelineTemplate.pipelineTemplateModifiedOn }}
                    </div>
                  </div>
                  <div class="text-h6">
                    by
                  </div>
                  <div class="">
                    <div class="row">
                      <Identicon :identity="pipelineTemplate.publisherName" />
                      <div class="q-ml-sm">
                        <div class="text-bold">
                          {{ pipelineTemplate.publisherName }}
                        </div>
                        <div class="text-caption text-italic">
                          {{ pipelineTemplate.publisherUid }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card-section>
      </q-card>

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Stats
            </q-card-section>
            <q-card-section class="row justify-between">
              <div>
                Current Stats:
                <pre>{{ pipelineTemplate.pipelineTemplateStats }}</pre>
              </div>
              <div>
                New Stats:
                <pre>{{ pipelineTemplateStats }}</pre>
              </div>
            </q-card-section>
          </q-card-section>
          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <q-btn icon="published_with_changes" color="primary" @click="save()">
                <q-tooltip style="font-size: 1rem;">
                  Force save new Stats
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>

      </q-card>

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4 row">
                Icon / Logo
              <q-space />
              <q-icon name="save_as" color="positive" v-if="pictureNeedsSaving">
                <q-tooltip style="font-size: 1rem;">
                  Needs saving
                </q-tooltip>
              </q-icon>
            </q-card-section>
            <q-card-section class="row q-gutter-x-lg">
              <div>
                <div class="text-h6 text-center">
                  Current
                </div>
                <q-separator spaced />
                <div class="row q-gutter-md">
                  <div class="text-center" style="min-width: 70px">
                    <div>70x70</div>
                    <IconPicture
                      :pngBase64="pipelineTemplate.pipelineTemplateIconPicture"
                      :size="70"
                    />
                  </div>
                  <div class="text-center" style="min-width: 150px">
                    <div>150x150</div>
                    <IconPicture
                      :pngBase64="pipelineTemplate.pipelineTemplateIconPicture"
                      :size="150"
                    />
                  </div>
                </div>
              </div>

              <q-separator vertical v-if="pictureImportPanel" />

              <div v-if="pictureImportPanel">
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

              <q-separator vertical v-if="pictureImportPanel" />

              <div v-if="pictureImportPanel" class="column" style="max-height: 300px">
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
                  New
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

              <q-separator vertical v-if="pipelineTemplateIconPictureToBeDeleted" />

              <div v-if="pipelineTemplateIconPictureToBeDeleted" class="column" style="max-height: 300px">
                <div class="text-h6 text-center text-negative">
                  To be deleted at next save.
                </div>
                <q-space />
                <q-btn
                  class="self-end full-width"
                  color="positive"
                  icon="undo"
                  @click="discardIconPictureToBeDeleted()"
                >
                  Undo
                </q-btn>
              </div>
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <q-btn icon="edit" color="primary" @click="pictureImportPanel=true">
                <q-tooltip style="font-size: 1rem;">
                  Update the picture
                </q-tooltip>
              </q-btn>
              <q-btn icon="delete" :loading="dataLoading">
                <q-tooltip style="font-size: 1rem;">
                  Remove the picture
                </q-tooltip>
                <q-menu class="bg-negative text-white" anchor="top end" self="top start">
                  <q-list>
                    <!-- <q-item v-close-popup @click="removePicture()" disabled> -->
                    <q-item clickable v-close-popup @click="removePicture()">
                      <q-item-section>Confirm</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4 row">
                Readme
              <q-space />
              <q-icon name="save_as" color="positive" v-if="readmeNeedsSaving">
                <q-tooltip style="font-size: 1rem;">
                  Needs saving
                </q-tooltip>
              </q-icon>
            </q-card-section>

            <q-card-section >
              <q-editor
                v-model="readmeContentEditor"
                min-height="20rem"
                max-height="calc(100vh - 15rem)"
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

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <q-btn icon="delete" :loading="dataLoading">
                <q-tooltip style="font-size: 1rem;">
                  Remove Readme content
                </q-tooltip>
                <q-menu class="bg-negative text-white" anchor="top end" self="top start">
                  <q-list>
                    <q-item clickable v-close-popup @click="removeReadme()">
                      <q-item-section>Confirm</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4 row">
              Collection Configuration
              <q-space />
              <q-icon name="save_as" color="positive" v-if="collectionConfigurationNeedsSaving">
                <q-tooltip style="font-size: 1rem;">
                  Needs saving
                </q-tooltip>
              </q-icon>
            </q-card-section>

            <q-card-section>
              <div class="row">
                <q-separator vertical size="4px" :color="(collectionConfigurationEditableAsTextIsInvalid ? 'negative' : 'positive')" class="q-mr-sm"/>
                <div class="col">
                  <pre
                    v-if="editCollectionConfiguration"
                  ><q-input
                      v-model="collectionConfigurationEditableAsText"
                      outlined
                      type="textarea"
                      debounce="100"
                      input-style="min-height: 20rem;"
                    /></pre>
                </div>
              </div>
              <pre v-if="!editCollectionConfiguration">{{ collectionConfigurationToBeSaved }}</pre>
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="edit" color="primary" @click="editCollectionConfiguration = !editCollectionConfiguration">
                <q-tooltip style="font-size: 1rem;">
                  Edit Collection Configuration
                </q-tooltip>
              </q-btn>
              <q-btn icon="share">
                <q-tooltip style="font-size: 1rem;">
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

                    <!-- <q-separator /> -->

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
                  </q-list>
                </q-menu>
              </q-btn>
              <q-btn icon="delete" :loading="dataLoading">
                <q-tooltip style="font-size: 1rem;">
                  Delete Collection Configuration
                </q-tooltip>
                <q-menu class="bg-negative text-white" anchor="top end" self="top start">
                  <q-list>
                    <q-item clickable  v-close-popup @click="removeCollectionConfiguration()" >
                      <q-item-section>Confirm</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4 row">
              Options
              <q-space />
              <q-icon name="save_as" color="positive" v-if="optionsNeedsSaving">
                <q-tooltip style="font-size: 1rem;">
                  Needs saving
                </q-tooltip>
              </q-icon>
            </q-card-section>

            <q-card-section>
              <q-toggle
                v-if="optionsToBeSaved"
                v-model="optionsToBeSaved.extractMessageFieldOnly"
                label="Extract Beat's '.message' only"
              />
            </q-card-section>

          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="delete" :loading="dataLoading">
              <q-tooltip style="font-size: 1rem;">
                Delete Options
              </q-tooltip>
              <q-menu class="bg-negative text-white" anchor="top end" self="top start">
                <q-list>
                  <q-item clickable  v-close-popup @click="removeOptions()" >
                    <q-item-section>Confirm</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4 row">
              Fields Mapping
              <q-space />
              <q-icon name="save_as" color="positive" v-if="fieldsMappingNeedsSaving">
                <q-tooltip style="font-size: 1rem;">
                  Needs saving
                </q-tooltip>
              </q-icon>
            </q-card-section>

            <q-card-section>
              <div class="row">
                <q-separator vertical size="4px" :color="(fieldsMappingEditableAsTextIsInvalid ? 'negative' : 'positive')" class="q-mr-sm"/>
                <div class="col">
                  <pre
                    v-if="editFieldsMapping"
                  ><q-input
                      v-model="fieldsMappingEditableAsText"
                      outlined
                      type="textarea"
                      debounce="100"
                      input-style="min-height: 20rem; height: calc(100vh - 15rem);"
                    /></pre>
                </div>
              </div>
              <q-scroll-area
                style="height: calc(100vh - 15rem);"
                v-if="!editFieldsMapping"
              >
                <pre>{{ fieldsMappingToBeSaved }}</pre>
              </q-scroll-area>
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="edit" color="primary" @click="editFieldsMapping = !editFieldsMapping">
                <q-tooltip style="font-size: 1rem;">
                  Edit Fields Mapping
                </q-tooltip>
              </q-btn>
              <q-btn icon="share">
                <q-tooltip style="font-size: 1rem;">
                  Share and Import Mapping
                </q-tooltip>
                <q-menu style="min-width: 420px">
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

                    <q-item clickable v-close-popup @click="fieldsMappingImportFileInput = null ; showFieldsMappingFileImportPopup = true">
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

                  </q-list>
                </q-menu>
              </q-btn>
              <q-btn icon="delete" :loading="dataLoading">
                <q-tooltip style="font-size: 1rem;">
                  Delete Fields Mapping
                </q-tooltip>
                <q-menu class="bg-negative text-white" anchor="top end" self="top start">
                  <q-list>
                    <q-item clickable  v-close-popup @click="removeFieldsMapping()" >
                      <q-item-section>Confirm</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Raw data
            </q-card-section>
            <q-card-section>
              <q-expansion-item
                expand-separator
                icon="raw_on"
                label="Expand to see full RAW record"
                caption="As stored in DB"
              >
                <pre>{{ pipelineTemplate }}</pre>
              </q-expansion-item>
            </q-card-section>
          </q-card-section>
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

    <q-dialog v-model="showFieldsMappingFileImportPopup" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ $t('Import EZ Cloud Fields Mapping') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-file
            filled
            bottom-slots
            v-model="fieldsMappingImportFileInput"
            label="Click or Drop a .ezFieldsMapping file here"
            input-style="min-width: 24em;min-height: 14em;"
            accept=".ezFieldsMapping"
            @rejected="onRejectedFieldsMappingFile"
          >
            <template v-slot:append>
              <q-icon v-if="fieldsMappingImportFileInput !== null" name="close" @click.stop="fieldsMappingImportFileInput = null" class="cursor-pointer" />
              <q-icon name="note_add" @click.stop />
            </template>
          </q-file>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" >
          <q-btn color="primary" flat :label="$t('Cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('Import Fields Mapping')" v-close-popup :disabled="fieldsMappingImportFileInput === null" @click="importMappingFromEZImportableConfigFile(fieldsMappingImportFileInput)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { exportFile /*, copyToClipboard */ } from 'quasar'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import Identicon from 'components/Publisher/Identicon.vue'
import IconPicture from 'components/Pipelines/IconPicture.vue'

// Time stamps as Time Ago
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

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

import deepEqual from 'deep-equal'

export default {
  name: 'PageAdminPipelineTemplateReview',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { Identicon, IconPicture },
  data () {
    return {
      pipelineTemplateUid: '',
      pipelineTemplate: {},
      pipelineTemplateLoading: false,
      pictureEditorContent: '',
      pictureEditorContentPngBase64Extracted: '',
      pictureEditorContentPngBase64ExtractedAccepted: '',
      pipelineTemplateIconPictureToBeDeleted: false,
      pictureImportPanel: false,
      pictureImportPictureFound: false,
      pictureImportPictureIsPng: false,
      readmeContentHtml: '', // Direct translation from the Markdown, untouched
      readmeContentEditor: '', // Version edited by the user
      showCollectionFileImportPopup: false, // Governs the display of the Popup to import shared collection config file
      collectionConfigurationImportFileInput: null, // File to import shared collection config from
      optionsToBeSaved: null, // Stores edited value of Options
      collectionConfigurationToBeSaved: null, // Stores edited value of Collection Configuation
      editCollectionConfiguration: false, // Show the Collection Configuration editor
      collectionConfigurationEditableAsTextIsInvalid: false, // Flag invalid JSON format for the editable Collection Configuration
      fieldsMappingToBeSaved: null, // Stores edited value of Fields Mapping
      editFieldsMapping: false, // Show the Fields Mapping editor
      fieldsMappingEditableAsTextIsInvalid: false, // Flag invalid JSON format for the editable Fields Mapping
      shareFieldFrequencies: true, // Include field frequencies when sharing?
      shareFieldValues: false, // Include field values when sharing? Default FALSE as risk of sharing sensitive info
      shareFieldMapping: true, // Include field SIEM tags mapping when sharing?
      shareFieldModifiers: true, // Include field modifiers when sharing?
      fieldsMappingImportFileInput: null, // File to import shared fields mapping from
      showFieldsMappingFileImportPopup: false // Governs the display of the Popup to import shared fields mapping file
    }
  },
  computed: {
    ...mapState('mainStore', ['ezMarketStatuses', 'ezMarketPublishers']),
    dataLoading () {
      return this.pipelineTemplateLoading
    },
    needsSaving () {
      return (
        this.pictureNeedsSaving ||
        this.readmeNeedsSaving ||
        this.optionsNeedsSaving ||
        this.collectionConfigurationNeedsSaving ||
        this.fieldsMappingNeedsSaving
      )
    },
    pictureNeedsSaving () {
      return !!(
        (this.pictureEditorContentPngBase64ExtractedAccepted && this.pictureEditorContentPngBase64ExtractedAccepted.length) ||
        (this.pipelineTemplateIconPictureToBeDeleted === true)
      )
    },
    readmeNeedsSaving () {
      return !!(
        (this.readmeContentEditor !== this.readmeContentHtml)
      )
    },
    optionsNeedsSaving () {
      return !(
        deepEqual(
          this.optionsToBeSaved,
          (this.pipelineTemplate && this.pipelineTemplate.pipelineTemplateMappingConfiguration ? this.pipelineTemplate.pipelineTemplateMappingConfiguration.options : undefined)
        )
      )
    },
    collectionConfigurationNeedsSaving () {
      return !(
        deepEqual(
          this.collectionConfigurationToBeSaved,
          (this.pipelineTemplate && this.pipelineTemplate.pipelineTemplateCollectionConfiguration ? this.pipelineTemplate.pipelineTemplateCollectionConfiguration.collectionConfig : {})
        )
      )
    },
    fieldsMappingNeedsSaving () {
      return !(
        deepEqual(
          this.fieldsMappingToBeSaved,
          (this.pipelineTemplate && this.pipelineTemplate.pipelineTemplateMappingConfiguration ? this.pipelineTemplate.pipelineTemplateMappingConfiguration.fieldsMapping : {})
        )
      )
    },
    pipelineTemplateName () {
      return this.pipelineTemplate.pipelineTemplateName
    },
    publishersOptions () {
      const options = []
      if (this.ezMarketPublishers && Array.isArray(this.ezMarketPublishers) && this.ezMarketPublishers.length) {
        this.ezMarketPublishers.forEach((publisher) => {
          options.push({
            value: publisher.publisherUid,
            label: publisher.displayName
          })
        })
      }
      return options
    },
    readmeContentEditorAsMarkdown () {
      if (this.readmeNeedsSaving) {
        try {
          const editedReadmeAsMd = nhm.translate(this.readmeContentEditor)
          return editedReadmeAsMd
        } catch {
          // Fails silently
        }
      }
      // Fall back to the loaded data
      return this.pipelineTemplate.pipelineTemplateReadmeMarkdown
    },
    pipelineTemplateStats () {
      const fieldsMappingToBeSavedIsArray = !!(this.fieldsMappingToBeSaved && this.fieldsMappingToBeSaved && Array.isArray(this.fieldsMappingToBeSaved))
      const fieldsMappingToBeSavedIsArrayWithData = !!(fieldsMappingToBeSavedIsArray && this.fieldsMappingToBeSaved.length > 0)
      return {
        collectionShipper: (this.collectionConfigurationToBeSaved && this.collectionConfigurationToBeSaved.collectionShipper ? this.collectionConfigurationToBeSaved.collectionShipper : undefined),
        collectionMethod: (this.collectionConfigurationToBeSaved && this.collectionConfigurationToBeSaved.collectionMethod ? this.collectionConfigurationToBeSaved.collectionMethod : undefined),
        detectedFields: (fieldsMappingToBeSavedIsArray ? this.fieldsMappingToBeSaved.length : undefined),
        mappedFields: (fieldsMappingToBeSavedIsArrayWithData ? this.fieldsMappingToBeSaved.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) : undefined),
        sharedFieldFrequencies: (fieldsMappingToBeSavedIsArrayWithData ? this.fieldsMappingToBeSaved.reduce((count, fm) => (fm.seenInLogCount > 1 ? count + 1 : count), 0) : undefined) > 0,
        sharedFieldValues: (fieldsMappingToBeSavedIsArrayWithData ? this.fieldsMappingToBeSaved.reduce((count, fm) => (fm.values && Array.isArray(fm.values) && fm.values.length ? count + 1 : count), 0) : undefined) > 0,
        sharedFieldMapping: (fieldsMappingToBeSavedIsArrayWithData ? this.fieldsMappingToBeSaved.reduce((count, fm) => (fm.mappedField && fm.mappedField.length > 0 ? count + 1 : count), 0) : undefined) > 0,
        sharedFieldModifiers: (fieldsMappingToBeSavedIsArrayWithData ? this.fieldsMappingToBeSaved.reduce((count, fm) => (fm.modifiers && Array.isArray(fm.modifiers) && fm.modifiers.length ? count + 1 : count), 0) : undefined) > 0
      }
    },
    collectionConfigurationEditableAsText: {
      get () {
        return JSON.stringify(this.collectionConfigurationToBeSaved, undefined, '  ')
      },
      set (newValue) {
        try {
          this.collectionConfigurationToBeSaved = JSON.parse(newValue)
          this.collectionConfigurationEditableAsTextIsInvalid = false
        } catch (error) {
          this.collectionConfigurationEditableAsTextIsInvalid = true
          // Fails silently
        }
      }
    },
    fieldsMappingEditableAsText: {
      get () {
        return JSON.stringify(this.fieldsMappingToBeSaved, undefined, '  ')
      },
      set (newValue) {
        try {
          this.fieldsMappingToBeSaved = JSON.parse(newValue)
          this.fieldsMappingEditableAsTextIsInvalid = false
        } catch (error) {
          this.fieldsMappingEditableAsTextIsInvalid = true
          // Fails silently
        }
      }
    }
  },
  methods: {
    ...mapActions('mainStore', ['getStatuses', 'getPublishers', 'getPipelineTemplateByUid', 'updatePipelineTemplate']),
    loadStatuses () {
      this.getStatuses(
        {
          loadingVariableName: 'statusesLoading',
          caller: this
        }
      )
    },
    loadPublishers () {
      this.getPublishers(
        {
          loadingVariableName: 'publishersLoading',
          caller: this
        }
      )
    },
    loadPipelineTemplate () {
      this.getPipelineTemplateByUid(
        {
          pipelineTemplateUid: this.pipelineTemplateUid,

          loadingVariableName: 'pipelineTemplateLoading',
          caller: this,
          onSuccessCallBack: this.pipelineTemplateLoaded
        }
      )
    },
    pipelineTemplateLoaded (payload) {
      if (payload && payload.data && payload.data.records && Array.isArray(payload.data.records) && payload.data.records.length >= 0) {
        try {
          const pipelineTemplate = JSON.parse(JSON.stringify(payload.data.records[0]))
          // Parse the stats (as they are stored as stringified JSON in the database)
          if (pipelineTemplate) {
            // Stats
            try {
              pipelineTemplate.pipelineTemplateStats = JSON.parse(pipelineTemplate.pipelineTemplateStats) || {}
            } catch (error) {
              pipelineTemplate.pipelineTemplateStats = {}
            }

            // Collection config Raw
            try {
              pipelineTemplate.pipelineTemplateCollectionConfiguration = JSON.parse(pipelineTemplate.pipelineTemplateCollectionConfiguration) || {}
            } catch (error) {
              pipelineTemplate.pipelineTemplateCollectionConfiguration = {}
            }
            // Collection Configuration (they are stored as part of the pipelineTemplateCollectionConfiguration)
            try {
              this.collectionConfigurationToBeSaved = JSON.parse(JSON.stringify(pipelineTemplate.pipelineTemplateCollectionConfiguration.collectionConfig))
            } catch (error) {
              this.collectionConfigurationToBeSaved = null
            }

            // Field Mapping Raw
            try {
              pipelineTemplate.pipelineTemplateMappingConfiguration = JSON.parse(pipelineTemplate.pipelineTemplateMappingConfiguration) || {}
            } catch (error) {
              pipelineTemplate.pipelineTemplateMappingConfiguration = {}
            }
            // Options (they are stored as part of the pipelineTemplateMappingConfiguration)
            try {
              this.optionsToBeSaved = JSON.parse(JSON.stringify(pipelineTemplate.pipelineTemplateMappingConfiguration.options))
            } catch (error) {
              this.optionsToBeSaved = null
            }
            // Field Mapping (they are stored as part of the pipelineTemplateMappingConfiguration)
            try {
              this.fieldsMappingToBeSaved = JSON.parse(JSON.stringify(pipelineTemplate.pipelineTemplateMappingConfiguration.fieldsMapping))
            } catch (error) {
              this.fieldsMappingToBeSaved = null
            }
          }
          // And assign
          this.pipelineTemplate = pipelineTemplate
        } catch (error) {
          // Fall back on an empty object
          this.pipelineTemplate = {}
        } finally {
          this.discardAcceptedPictureEditorContentPngBase64()
          this.pipelineTemplateIconPictureToBeDeleted = false
          this.discardEditedReadmeContent()
        }
      }
    },
    save () {
      if (
        this.pipelineTemplateUid &&
        this.pipelineTemplateUid.length &&
        this.pipelineTemplate &&
        this.pipelineTemplate.pipelineTemplateUid &&
        this.pipelineTemplate.pipelineTemplateUid.length &&
        this.pipelineTemplateUid === this.pipelineTemplate.pipelineTemplateUid
      ) {
        this.updatePipelineTemplate(
          {
            pipelineTemplateUid: this.pipelineTemplateUid,
            statusId: this.pipelineTemplate.statusId,
            name: this.pipelineTemplate.pipelineTemplateName,
            pipelineTemplateIconPicture: (
              this.pictureEditorContentPngBase64ExtractedAccepted && this.pictureEditorContentPngBase64ExtractedAccepted.length
                ? this.pictureEditorContentPngBase64ExtractedAccepted // To replace with picture with the selected one
                : (
                    this.pipelineTemplateIconPictureToBeDeleted === true
                      ? null // To remove the Picture
                      : undefined
                  )
            ),
            pipelineTemplateReadmeMarkdown: (
              this.readmeNeedsSaving
                ? this.readmeContentEditorAsMarkdown
                : undefined
            ),
            collectionConfiguration: (
              this.collectionConfigurationNeedsSaving
                ? {
                    collectionConfig: (
                      this.collectionConfigurationNeedsSaving
                        ? this.collectionConfigurationToBeSaved
                        : (this.pipelineTemplate.pipelineTemplateCollectionConfiguration ? this.pipelineTemplate.pipelineTemplateCollectionConfiguration.collectionConfig : undefined)
                    )
                  }
                : undefined
            ),
            fieldsMapping: (
              this.fieldsMappingNeedsSaving || this.optionsNeedsSaving
                ? {
                    options: (
                      this.optionsNeedsSaving
                        ? this.optionsToBeSaved
                        : (this.pipelineTemplate.pipelineTemplateMappingConfiguration ? this.pipelineTemplate.pipelineTemplateMappingConfiguration.options : undefined)
                    ),
                    fieldsMapping: (
                      this.fieldsMappingNeedsSaving
                        ? this.fieldsMappingToBeSaved
                        : (this.pipelineTemplate.pipelineTemplateMappingConfiguration ? this.pipelineTemplate.pipelineTemplateMappingConfiguration.fieldsMapping : undefined)
                    )
                  }
                : undefined
            ),
            // publisherUid: this.pipelineTemplate.xxx,
            pipelineTemplateStats: this.pipelineTemplateStats || null,

            loadingVariableName: 'pipelineTemplateLoading',
            caller: this,
            onSuccessCallBack: this.loadPipelineTemplate,
            onErrorCallBack: this.updatePipelineTemplateFailure,
            debug: true
          }
        )
      }
    },
    reverseToLastSaved () {
      this.loadPipelineTemplate()
    },
    updatePipelineTemplateFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$bus.emit('addAndShowErrorToErrorPanel', payload)
      this.loadPipelineTemplate()
    },
    extractPictureEditorContentPngBase64 (newValue) {
      // <img src="data:image/png;base64,iVBORw0KGgoAA...Uawz9YIPMfeaw" alt="">
      try {
        const rawHtml = newValue || ''
        // this.loadImageFromUrl('https://cdn.quasar.dev/logo-v2/svg/logo.svg')
        // this.loadImageFromUrl('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAALCAYAAACksgdhAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAF1SURBVChTLZFbTwMhEIUPDHStWp+Mmnip1vgDjO/+tv5MfdN4SYzxUrvd0gUGD5smDLfhcD4Yc3t3X/zIYzI5wOHREWbXNzg+OUUqQOgjYgbnFtkIivVIsJCLs7N5yRGaEzT2yGmDsAkoRTHeaaAcU0zIOXMPQ8jF+eVcOUspITLZ9z1FGx4ucM4jpoysCqUDjGUTyHR6Na9qZSLTre8TuhDQrQPadkURgSj2oxGc9xBxsGItnFhY3lIRVu0SXx+feHl6xuPDA95f37DpOhh61XP1vFxOZ3PLiTUGhsKKlbWA5nTPaJqGLs2AlpSfQhqZEc+JEIFBsdKtoiqFOfP2LVKhV31bYtjC2+qXiAFFhsGRrp4oIy/QFIm8wOL3G8vFD7r2D1aVX01hdWAHQy7LzlOwNx4Pb1mv2kGw/NuKSkVhnWpdDCGqkxBXBleuSVD3ackaRuQYYGt9hsJVTCYdVc5ZrhUhrAfX/f1dHEwmGDcezhj8A/VF6czzvVvtAAAAAElFTkSuQmCC')

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
      this.discardIconPictureToBeDeleted()
    },
    discardAcceptedPictureEditorContentPngBase64 () {
      this.pictureEditorContentPngBase64ExtractedAccepted = ''
    },
    removePicture () {
      this.pipelineTemplateIconPictureToBeDeleted = true
      this.discardAcceptedPictureEditorContentPngBase64()
    },
    discardIconPictureToBeDeleted () {
      this.pipelineTemplateIconPictureToBeDeleted = false
    },
    removeReadme () {
      this.readmeContentEditor = ''
    },
    discardEditedReadmeContent () {
      try {
        this.readmeContentHtml = marked.parse(this.pipelineTemplate.pipelineTemplateReadmeMarkdown)
      } catch (error) {
        // Fails silently
      } finally {
        this.readmeContentEditor = this.readmeContentHtml
      }
    },
    downloadCollectionAsEZImportableConfigFile () {
      // Fallback file extension and Mime type (if not possible to assign a better one based on Shipper)
      const fileExtension = '.ezCollection'
      const fileMimeType = 'application/json'

      const fileName = 'input.' + this.pipelineTemplate.pipelineTemplateName + '_' + this.pipelineTemplate.pipelineTemplateUid + fileExtension

      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading Importable Collection Configuration file...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Push file out
      const status = exportFile(
        fileName,
        JSON.stringify(
          this.pipelineTemplate &&
          this.pipelineTemplate.pipelineTemplateCollectionConfiguration
            ? this.pipelineTemplate.pipelineTemplateCollectionConfiguration.collectionConfig
            : {}
        ),
        fileMimeType
      )

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
      this.$bus.emit('addAndShowErrorToErrorPanel',
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
          this.$bus.emit('addAndShowErrorToErrorPanel',
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

              // Beat: filebeat
              if (collectionShipper === 'filebeat') {
                // Ensure we have the .fields branch
                parsedFileContent.fields = parsedFileContent.fields || {}

                parsedFileContent.fields.stream_id = this.pipelineTemplate.pipelineTemplateUid
                parsedFileContent.fields.stream_name = this.pipelineTemplate.pipelineTemplateName
              }
              // Beat: jsBeat
              if (collectionShipper === 'jsBeat') {
                // Ensure we have the .fields branch
                parsedFileContent.filterHelpers = parsedFileContent.filterHelpers || {}

                parsedFileContent.filterHelpers.stream_id = this.pipelineTemplate.pipelineTemplateUid
                parsedFileContent.filterHelpers.stream_name = this.pipelineTemplate.pipelineTemplateName
                parsedFileContent.uid = this.pipelineTemplate.pipelineTemplateUid
                parsedFileContent.name = this.pipelineTemplate.pipelineTemplateName
              }

              // LogRhythm Beats
              if (
                [
                  'genericbeat',
                  'webhookbeat'
                ].includes(collectionShipper)
              ) {
                parsedFileContent.beatIdentifier = String(this.pipelineTemplate.pipelineTemplateUid.substring(0, 3) + '_' + this.pipelineTemplate.pipelineTemplateName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + this.pipelineTemplate.pipelineTemplateUid).substring(0, 12)
                parsedFileContent.logsource_name = this.pipelineTemplate.pipelineTemplateName
              }

              // Update Pipeline Template to be saved
              try {
                this.collectionConfigurationToBeSaved = JSON.parse(JSON.stringify(parsedFileContent))
              } catch (error) {
                this.collectionConfigurationToBeSaved = null
              }

              notificationPopupId({
                type: 'positive',
                color: 'positive',
                icon: 'check',
                message: this.$t('Shared Collection Configuration file imported'),
                caption: fileName
              })
            } catch (error) {
              thereWasAnError = true
              this.$bus.emit('addAndShowErrorToErrorPanel',
                {
                  code: 'CantParseFileImportCollection',
                  messageForLogAndPopup: `Error trying to parse the content of ${filesInput.length} file. Error: ${error.message}`
                }
              )
            }
          } catch (error) {
            thereWasAnError = true
            this.$bus.emit('addAndShowErrorToErrorPanel',
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
    removeOptions () {
      this.optionsToBeSaved = null
    },
    removeCollectionConfiguration () {
      this.collectionConfigurationToBeSaved = null
    },
    downloadMappingAsEZImportableConfigFile () {
      // Fallback file extension and Mime type (if not possible to assign a better one based on Shipper)
      const fileExtension = '.ezFieldsMapping'
      const fileMimeType = 'application/json'

      const fileName = 'input.' + this.pipelineTemplate.pipelineTemplateName + '_' + this.pipelineTemplate.pipelineTemplateUid + fileExtension

      const notificationPopupId = this.$q.notify({
        icon: 'cloud_download',
        message: this.$t('Downloading Importable Fields Mapping file...'),
        caption: fileName,
        type: 'ongoing'
      })

      // Sanitise the Mapping before export
      const sanitisedFieldsMapping = JSON.parse(
        JSON.stringify(
          this.pipelineTemplate &&
          this.pipelineTemplate.pipelineTemplateMappingConfiguration
            ? this.pipelineTemplate.pipelineTemplateMappingConfiguration.fieldsMapping
            : {}
        )
      )
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
          extractMessageFieldOnly: (this.optionsToBeSaved ? this.optionsToBeSaved.extractMessageFieldOnly : undefined)
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
    onRejectedFieldsMappingFile (rejectedEntries) {
      const badFileName = (
        rejectedEntries &&
        Array.isArray(rejectedEntries) &&
        rejectedEntries[0] &&
        rejectedEntries[0].file &&
        rejectedEntries[0].file.name
          ? rejectedEntries[0].file.name
          : ''
      )
      this.$bus.emit('addAndShowErrorToErrorPanel',
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
          this.$bus.emit('addAndShowErrorToErrorPanel',
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

              // Update Pipeline Template
              // this.pipelineTemplate.pipelineTemplateCollectionConfiguration.pipelineTemplateMappingConfiguration = parsedFileContent.fieldsMapping || null
              try {
                this.fieldsMappingToBeSaved = JSON.parse(JSON.stringify(parsedFileContent.fieldsMapping || null))
              } catch (error) {
                this.fieldsMappingToBeSaved = null
              }
              // Update Pipeline Template to be saved
              notificationPopupId({
                type: 'positive',
                color: 'positive',
                icon: 'check',
                message: this.$t('Shared Fields Mapping file imported'),
                caption: fileName
              })
            } catch (error) {
              thereWasAnError = true
              this.$bus.emit('addAndShowErrorToErrorPanel',
                {
                  code: 'CantParseFileImportMapping',
                  messageForLogAndPopup: `Error trying to parse the content of ${filesInput.length} file. Error: ${error.message}`
                }
              )
            }
          } catch (error) {
            thereWasAnError = true
            this.$bus.emit('addAndShowErrorToErrorPanel',
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
    removeFieldsMapping () {
      this.fieldsMappingToBeSaved = null
    }
  },
  mounted () {
    if (this.$route.params.pipelineTemplateUid && this.$route.params.pipelineTemplateUid.length) {
      if (this.pipelineTemplateUid !== this.$route.params.pipelineTemplateUid) {
        this.pipelineTemplateUid = this.$route.params.pipelineTemplateUid
      }
    }
    this.loadStatuses()
    this.loadPublishers()
    this.loadPipelineTemplate()
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
