<template>
  <q-card
    v-ripple="!!(status && status === 'Visible')"
    class="q-ma-sm"
    @click="goTo('/MarketPlace/PipelineTemplates/' + uid + '/Properties')"
    :class="status && status === 'Visible' ? 'cursor-pointer q-hoverable' : ''"
    bordered
    style="max-width: 20rem"
  >
    <span class="q-focus-helper"></span>
    <q-badge
      v-if="topIndicator_.showBadge"
      floating
      :rounded="!(topIndicator_.text && topIndicator_.text.length)"
      :color="(topIndicator_.color && topIndicator_.color.length ? topIndicator_.color : 'primary')"
      :label="(topIndicator_.text && topIndicator_.text.length ? topIndicator_.text : undefined)"
    >
      <q-icon
        v-if="topIndicator_.icon && topIndicator_.icon.length"
        :name="(topIndicator_.icon && topIndicator_.icon.length ? topIndicator_.icon : undefined)"
      />
    </q-badge>
    <q-bar
      v-if="topIndicator_.showBar"
      :class="(topIndicator_.color && topIndicator_.color.length ? `bg-${topIndicator_.color}-1 text-black` : '')"
    >
      <q-icon
        v-if="topIndicator_.icon && topIndicator_.icon.length"
        :name="topIndicator_.icon"
        :color="topIndicator_.color"
      />
      <div v-if="topIndicator_.text && topIndicator_.text.length">{{ topIndicator_.text }}</div>
    </q-bar>

    <q-card-section horizontal class="">
      <q-card-section class="col row justify-start items-start">
        <div
          v-if="pipelineTemplateFieldsMappingStats"
          class="row items-center justify-center"
        >
          <q-tooltip content-style="font-size: 1em">
            <span>{{ $t('Detected fields: {detectedFields}', { detectedFields: stats.detectedFields }) }}</span><br>
            <span>{{ $t('Mapped fields: {mappedFields} ({mappedFieldsPercent}%)', { mappedFields: stats.mappedFields, mappedFieldsPercent: Math.round(pipelineTemplateFieldsMappingStats * 100) / 100 }) }}</span><br>
          </q-tooltip>
          <q-circular-progress
            :value="Math.round(pipelineTemplateFieldsMappingStats)"
            show-value
            :font-size="(pipelineTemplateFieldsMappingStats < 100 ? '0.5em' : '0.4em')"
            size="2.8em"
            :thickness="0.2"
            :color="(darkMode ? 'teal-14' : 'teal-14')"
            :track-color="(darkMode ? 'grey-9' : 'grey-3')"
          />
        </div>
        <div v-else>
          -
        </div>
      </q-card-section>

      <q-card-section class="col row justify-center items-center">
        <IconPicture
          :pngBase64="iconPicture"
          :size="70"
        />
      </q-card-section>

      <q-card-section class="col row justify-end items-start">
        <q-btn icon="more_horiz" dense flat @click.stop="showKebabMenu = !showKebabMenu">
          <q-menu anchor="bottom right" self="top right" v-model="showKebabMenu">
            <q-list style="min-width: 100px">
              <slot name="kebabMenuItems">
                <q-item clickable v-close-popup
                  :to="'/MarketPlace/PipelineTemplates/' + uid + '/Properties'"
                  :disable="!(status && status === 'Visible')"
                >
                  <q-item-section avatar>
                    <q-icon name="launch" />
                  </q-item-section>
                  <q-item-section>{{ $t('Open') }}</q-item-section>
                </q-item>
              </slot>
            </q-list>
          </q-menu>
        </q-btn>
      </q-card-section>
    </q-card-section>

    <q-card-section class="q-my-md q-py-none q-gutter-xs">
      <div class="text-center q-mb-sm">{{ name }}</div>
      <div class="text-center text-caption">Published by {{ publisher }}</div>
    </q-card-section>

    <q-card-section class="q-my-md q-py-none">
      <div class="row wrap items-center justify-center q-gutter-xs">
        <q-badge outline rounded :color="(stats && stats.sharedFieldFrequencies ? (darkMode ? 'teal-14' : 'teal-14') : 'grey')" text-color="black" :label="$t('Shared Frequency')" />
        <!-- <q-badge outline rounded :color="(stats && stats.sharedFieldValues ? 'orange' : 'grey')" text-color="black" label="Shared Values" /> -->
        <q-badge outline rounded :color="(stats && stats.sharedFieldMapping ? (darkMode ? 'teal-14' : 'teal-14') : 'grey')" text-color="black" :label="$t('Shared Mapping')" />
        <q-badge outline rounded :color="(stats && stats.sharedFieldModifiers ? (darkMode ? 'teal-14' : 'teal-14') : 'grey')" text-color="black" :label="$t('Shared Modifiers')" />
      </div>
    </q-card-section>

    <q-card-section class="q-my-md q-py-none">
      <div>
        <q-tooltip content-style="font-size: 1rem;">
          {{ modified }}
        </q-tooltip>
        {{ $t('Last modified: {lastModified}', { lastModified: timeAgo(modified) }) }}
      </div>
    </q-card-section>

    <!-- <q-card-actions align="right">
      <div>
        <q-btn
          :label="$t('Open')"
          no-caps
          color="primary"
          :to="'/MarketPlace/PipelineTemplates/' + uid + '/Properties'"
          :disable="!(status && status === 'Visible')"
        >
        </q-btn>
        <q-tooltip content-style="font-size: 1em" v-if="status && status === 'Visible'">
          {{ $t('Open this Pipeline Template') }}
        </q-tooltip>
        <q-tooltip content-style="font-size: 1em" v-else>
          {{ $t('Still Pending Review.') }}<br>
          {{ $t('Can\'t open.') }}
        </q-tooltip>
      </div>

    </q-card-actions> -->

  </q-card>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import IconPicture from 'components/Pipelines/IconPicture.vue'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
if (TimeAgo.getDefaultLocale() == null) {
  TimeAgo.addDefaultLocale(en)
}

export default {
  name: 'PipelineTemplate',
  props: {
    topIndicator: {
      type: Object,
      default: null
    },
    iconPicture: {
      type: String,
      default: null
    },
    uid: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    stats: {
      type: Object,
      default: null
    },
    publisher: {
      type: String,
      default: null
    },
    created: {
      type: String,
      default: null
    },
    modified: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: null
    }
  },
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { IconPicture },
  data () {
    return {
      defaultTopIndicator: {
        type: ' ', // String - Information, Warning, Error
        text: '', // String
        color: '', // String - Must be a pure Quasar color, like "red", "green", "orange". No "Brand" like "negative", "positive", "warning". Not a numbered variation like "red-4".
        icon: '', // String
        showBar: false, // Bool
        showBadge: false, // Bool
        showKebabMenu: true
      }
    }
  },
  computed: {
    topIndicator_ () {
      return { ...this.defaultTopIndicator, ...this.topIndicator }
    },
    pipelineTemplateCollectionStats () {
      return (
        this.stats
          ? `${this.stats.collectionShipper || ''}${this.stats.collectionMethod || ''}`
          : null
      )
    },
    pipelineTemplateFieldsMappingStats () {
      return (
        this.stats && this.stats.detectedFields > 0
          ? (this.stats.mappedFields || 0) / this.stats.detectedFields * 100
          : null
      )
    }
  },
  methods: {
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
    goTo (target) {
      if (this.status && this.status === 'Visible') {
        this.$router.push(target)
      }
    }
  }
}
</script>
