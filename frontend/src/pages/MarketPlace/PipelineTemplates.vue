<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" src="logrhythm_logo_wide.svg" alt="LogRhythm Open Collector">
        <q-btn no-caps flat dense icon="mail_outline" color="primary" :label="$t('View Notifications')" to="/MarketPlace/Notifications" />
        <q-btn no-caps flat dense icon='person' :label="$t('View My Profile')" to="/MarketPlace/PublisherProfile" />
        <!-- <q-toolbar-title style="opacity:.4" class="text-center">{{ $t('EZ Market Place : Pipeline Templates') }}</q-toolbar-title> -->
      </q-toolbar>
    </q-header>
    <BreadCrumbs
      :crumbs="breadCrumbs"
    />
    <q-card class="q-pa-none q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="row wrap justify-between">
            <div class="text-h4">
              {{ $t('Pipeline Templates') }}
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

            <q-card-section>
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="pipelineTemplateUid"
                dense
                :no-data-label="$t('No Pipeline Template to display.')"
                :filter="searchFilter"
                :loading="dataLoading"
                :rows-per-page-label="$t('Pipeline Templates per page:')"
                :pagination.sync="pagination"
                grid
                hide-header
              >
                <template v-slot:item="props">
                  <PipelineTemplate
                    v-bind="props.row"
                    :topIndicator="(
                      props.row.status !== 'Visible'
                        ?
                          {
                            text: props.row.status,
                            showBar: true,
                            icon: 'o_warning',
                            color: 'deep-orange'
                          }
                        : {}
                    )
                    "
                  />
                </template>

              </q-table>
            </q-card-section>

            <!-- <q-card-section class="">
                <pre>{{ ezMarketPipelineTemplates }}</pre>
            </q-card-section> -->
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="q-pa-md">
              <q-btn icon="refresh" color="primary" :loading="dataLoading" @click="reloadEzMarketPipelineTemplates()" >
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
// import Identicon from 'components/Publisher/Identicon.vue'
// import IconPicture from 'components/Pipelines/IconPicture.vue'
import BreadCrumbs from 'components/BreadCrumbs.vue'
import PipelineTemplate from 'components/Pipelines/MarketPlace/PipelineTemplate.vue'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
if (TimeAgo.getDefaultLocale() == null) {
  TimeAgo.addDefaultLocale(en)
}

export default {
  name: 'PageMarketPipelineTemplates',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { /* Identicon, IconPicture, */ BreadCrumbs, PipelineTemplate },
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: this.$t('Actions'), field: 'actions', sortable: false },
        { name: 'iconPicture', align: 'center', label: this.$t('Icon / Logo'), field: 'iconPicture', sortable: false },
        { name: 'name', align: 'center', label: this.$t('Pipeline Template Name'), field: 'name', sortable: true, classes: '', style: 'white-space: pre-line;' },
        // { name: 'pipelineTemplateCollectionStats', align: 'center', label: 'Collection', field: row => (row.stats ? `${row.stats.collectionShipper || ''} - ${row.stats.collectionMethod || ''}` : null), sortable: true },
        { name: 'pipelineTemplateCollectionStats', align: 'center', label: this.$t('Collection'), field: row => (row.stats ? `${row.stats.collectionShipper || ''}${row.stats.collectionMethod || ''}` : null), sortable: true },
        { name: 'pipelineTemplateFieldsMappingStats', align: 'center', label: this.$t('Fields Mapping'), field: row => (row.stats && row.stats.detectedFields > 0 ? (row.stats.mappedFields || 0) / row.stats.detectedFields * 100 : null), sortable: true },
        { name: 'publisher', align: 'center', label: this.$t('Publisher'), field: 'publisher', sortable: true },
        { name: 'created', align: 'center', label: this.$t('Created'), field: 'created', sortable: true },
        { name: 'modified', align: 'center', label: this.$t('Modified'), field: 'modified', sortable: true },
        { name: 'status', align: 'center', label: this.$t('Status'), field: 'status', sortable: true }
      ],
      pagination: {
        sortBy: 'created',
        descending: true, // Most recent on top
        rowsPerPage: 10
      },
      dataLoading: false
    }
  },
  computed: {
    ...mapState('mainStore', ['collectionMethodsOptions', 'collectionShippersOptions', 'ezMarketPipelineTemplates']),
    tableData () {
      return this.ezMarketPipelineTemplates
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
          title: this.$t('Pipeline Templates')
        }
      ]
    }
  }, // computed
  methods: {
    ...mapActions('mainStore', ['reloadEzMarketPipelineTemplates']),
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
    collectionShipperByValue (value) {
      const fallbackValue = { value: 'unknown', label: this.$t('Unknown or not set'), icon: 'unknown', outputFormat: 'json' }
      if (value && value.length) {
        return this.collectionShippersOptions.find(cso => cso.value && cso.value === value) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionMethodByValue (value) {
      const fallbackValue = { value: 'unknown', label: this.$t('Unknown or not set'), icon: 'help_center' }
      if (value && value.length) {
        return this.collectionMethodsOptions.find(cmo => cmo.value && cmo.value === value) || fallbackValue
      } else {
        return fallbackValue
      }
    }
  },
  mounted () {
    if (!(this.ezMarketPipelineTemplates && this.ezMarketPipelineTemplates.length)) {
      this.reloadEzMarketPipelineTemplates()
    }
  }
}
</script>
