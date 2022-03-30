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
            <q-card-section>
              <span class="text-bold">pipelineTemplateUid:</span> {{ pipelineTemplateUid }}
            </q-card-section>
            <q-card-section>
              <pre>{{ pipelineTemplate }}</pre>
            </q-card-section>
            <q-card-section>
              <Identicon :identity="pipelineTemplate.publisherName" />
            </q-card-section>
          </q-card-section>
        </q-card-section>
      </q-card>

      <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4 row">
                Icon / Logo
              <q-space />
              <q-icon name="save_as" color="positive" v-if="pictureNeedsSaving">
                <q-tooltip content-style="font-size: 1rem;">
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
                <q-tooltip content-style="font-size: 1rem;">
                  Update the picture
                </q-tooltip>
              </q-btn>
              <q-btn icon="delete" :loading="dataLoading">
                <q-tooltip content-style="font-size: 1rem;">
                  Remove the picture
                </q-tooltip>
                <q-menu content-class="bg-negative text-white" anchor="top end" self="top start">
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
                <q-tooltip content-style="font-size: 1rem;">
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
                <q-tooltip content-style="font-size: 1rem;">
                  Remove Readme content
                </q-tooltip>
                <q-menu content-class="bg-negative text-white" anchor="top end" self="top start">
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
    </div>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
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
      readmeContentEditor: '' // Version edited by the user
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
        this.readmeNeedsSaving
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
            try {
              pipelineTemplate.pipelineTemplateStats = JSON.parse(pipelineTemplate.pipelineTemplateStats) || {}
            } catch (error) {
              pipelineTemplate.pipelineTemplateStats = {}
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
            // publisherUid: this.pipelineTemplate.xxx,
            // pipelineTemplateStats: this.pipelineTemplate.xxx,

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
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
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
