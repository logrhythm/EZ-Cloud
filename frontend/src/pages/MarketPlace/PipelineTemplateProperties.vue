<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Market Place Pipeline Templates" :to="'/MarketPlace/PipelineTemplates'" />
        <q-separator spaced vertical />
        <q-btn no-caps flat dense icon="input" color="primary" label="Import" disabled />
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
              RAW
          </q-card-section>
          <q-card-section class="">
              <pre>{{ ezMarketPipelineTemplate }}</pre>
          </q-card-section>
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import Identicon from 'components/Publisher/Identicon.vue'
import IconPicture from 'components/Pipelines/IconPicture.vue'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

export default {
  name: 'PageMarketPipelineTemplateProperties',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { Identicon, IconPicture },
  data () {
    return {
      pipelineTemplateUid: '',
      dataLoading: false
    }
  },
  computed: {
    ...mapState('mainStore', ['ezMarketPipelineTemplate']),
    readmeMarkdown () {
      return (this.ezMarketPipelineTemplate && this.ezMarketPipelineTemplate.readmeMarkdown ? this.ezMarketPipelineTemplate.readmeMarkdown : '')
    }
  }, // computed
  methods: {
    ...mapActions('mainStore', ['loadEzMarketPipelineTemplateById']),
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
