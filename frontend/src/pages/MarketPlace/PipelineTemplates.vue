<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Market Place" :to="'/MarketPlace'" />
        <q-separator spaced vertical />
        <q-btn no-caps flat dense icon="mail_outline" color="primary" :label="$t('View Notifications')" to="/MarketPlace/Notifications" />
        <q-btn no-caps flat dense icon='person' :label="$t('View My Profile')" to="/MarketPlace/PublisherProfile" />
        <q-toolbar-title style="opacity:.4" class="text-center">EZ Market Place : Pipeline Templates</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="row wrap justify-between">
            <div class="text-h4">
              Pipeline Templates
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

            <q-card-section>
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="pipelineTemplateUid"
                dense
                no-data-label="No Pipeline Template to display."
                :filter="searchFilter"
                :loading="dataLoading"
                rows-per-page-label="Pipeline Templates per page:"
                :pagination.sync="pagination"
              >

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <div>
                      <q-btn
                        flat
                        dense
                        icon="launch"
                        :to="'/MarketPlace/PipelineTemplates/' + props.row.uid + '/Properties'"
                        :disable="!(props.row.status && props.row.status === 'Visible')"
                      >
                      </q-btn>
                      <q-tooltip content-style="font-size: 1em" v-if="props.row.status && props.row.status === 'Visible'">
                        {{ $t('Open this Pipeline Template') }}
                      </q-tooltip>
                      <q-tooltip content-style="font-size: 1em" v-else>
                        {{ $t('Still Pending Review.') }}<br>
                        {{ $t('Can\'t open.') }}
                      </q-tooltip>
                    </div>
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
                      <img v-if="collectionShipperByValue(props.row.stats.collectionShipper).icon.length" :src="'/shippers/' + collectionShipperByValue(props.row.stats.collectionShipper).icon + '.svg'" width="60px">
                      <q-icon :name="collectionMethodByValue(props.row.stats.collectionMethod).icon" size="60px" />
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
                        <span>Detected fields: {{ props.row.stats.detectedFields }}</span><br>
                        <span>Mapped fields: {{ props.row.stats.mappedFields }}</span>&nbsp;(<span class="text-bold">{{ Math.round(props.value * 100) / 100 }}%</span>)
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
                      <div class="column q-gutter-y-xs">
                        <q-badge :color="(props.row.stats && props.row.stats.sharedFieldFrequencies ? 'positive' : 'grey')" text-color="black" label="Shared Frequency" />
                        <!-- <q-badge :color="(props.row.stats && props.row.stats.sharedFieldValues ? 'orange' : 'grey')" text-color="black" label="Shared Values" /> -->
                        <q-badge :color="(props.row.stats && props.row.stats.sharedFieldMapping ? 'positive' : 'grey')" text-color="black" label="Shared Mapping" />
                        <q-badge :color="(props.row.stats && props.row.stats.sharedFieldModifiers ? 'positive' : 'grey')" text-color="black" label="Shared Modifiers" />
                      </div>
                    </div>
                    <div v-else>
                      -
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-created="props">
                  <q-td :props="props">
                    <div>
                      <q-tooltip content-style="font-size: 1rem;">
                        {{ props.value }}
                      </q-tooltip>
                      {{ timeAgo(props.value) }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-modified="props">
                  <q-td :props="props">
                    <div>
                      <q-tooltip content-style="font-size: 1rem;">
                        {{ props.value }}
                      </q-tooltip>
                      {{ timeAgo(props.value) }}
                    </div>
                  </q-td>
                </template>

              </q-table>
            </q-card-section>

            <!-- <q-card-section class="">
                <pre>{{ ezMarketPipelineTemplates }}</pre>
            </q-card-section> -->
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="q-px-md">
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
import Identicon from 'components/Publisher/Identicon.vue'
import IconPicture from 'components/Pipelines/IconPicture.vue'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

export default {
  name: 'PageMarketPipelineTemplates',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { Identicon, IconPicture },
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'iconPicture', align: 'center', label: 'Icon / Logo', field: 'iconPicture', sortable: false },
        { name: 'name', align: 'center', label: 'Pipeline Template Name', field: 'name', sortable: true, classes: '', style: 'white-space: pre-line;' },
        // { name: 'pipelineTemplateCollectionStats', align: 'center', label: 'Collection', field: row => (row.stats ? `${row.stats.collectionShipper || ''} - ${row.stats.collectionMethod || ''}` : null), sortable: true },
        { name: 'pipelineTemplateCollectionStats', align: 'center', label: 'Collection', field: row => (row.stats ? `${row.stats.collectionShipper || ''}${row.stats.collectionMethod || ''}` : null), sortable: true },
        { name: 'pipelineTemplateFieldsMappingStats', align: 'center', label: 'Fields Mapping', field: row => (row.stats && row.stats.detectedFields > 0 ? (row.stats.mappedFields || 0) / row.stats.detectedFields * 100 : null), sortable: true },
        { name: 'publisher', align: 'center', label: 'Publisher', field: 'publisher', sortable: true },
        { name: 'created', align: 'center', label: 'Created', field: 'created', sortable: true },
        { name: 'modified', align: 'center', label: 'Modified', field: 'modified', sortable: true },
        { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true }
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
    }
  }, // computed
  methods: {
    ...mapActions('mainStore', ['reloadEzMarketPipelineTemplates']),
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
    collectionShipperByValue (value) {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'unknown', outputFormat: 'json' }
      if (value && value.length) {
        return this.collectionShippersOptions.find(cso => cso.value && cso.value === value) || fallbackValue
      } else {
        return fallbackValue
      }
    },
    collectionMethodByValue (value) {
      const fallbackValue = { value: 'unknown', label: 'Unknown or not set', icon: 'help_center' }
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
