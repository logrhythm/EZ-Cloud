<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Pipeline Templates
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
                <template v-slot:top>
                  <div class="full-width row wrap justify-between">
                    <div class="q-table__title">
                      Pipeline Templates
                    </div>
                    <div class="row q-gutter-md">
                      <div class="col" >
                        <q-btn rounded dense color="primary" icon="add" label="Add New Pipeline Template" style="min-width:14rem;" @click="addNewPipelineTemplate()" >
                          <q-tooltip content-style="font-size: 1em">
                            Create a new Pipeline Template.
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
                      <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadPipelineTemplates()">
                        <q-tooltip content-style="font-size: 1em">
                          Reload the list of Pipeline Templates.
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense icon="edit" @click="doPromptForPipelineTemplateEdit(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Edit Pipeline Template') }}
                      </q-tooltip>
                    </q-btn>
                    <!--
                      assignment
                      rule
                      thumbs_up_down
                      content_paste_search
                     -->
                    <q-btn
                      icon="content_paste_search"
                      flat
                      dense
                      :to="`PipelineTemplates/${props.row.pipelineTemplateUid}/Review`"
                    >
                      <q-tooltip content-style="font-size: 1rem;">
                        {{ $t('Review Pipeline Template') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="delete"
                      flat
                      dense
                      color="negative"
                    >
                      <q-tooltip content-style="font-size: 1rem;">
                        {{ $t('Delete') }}
                      </q-tooltip>
                      <q-menu anchor="top right" self="top left">
                        <q-list style="min-width: 100px">
                          <q-item clickable v-close-popup @click="updatePipelineTemplateStatusTo({pipelineTemplateFullDetails: props.row, toStatus: 'To be deleted'})">
                            <q-item-section>Mark to be Deleted</q-item-section>
                          </q-item>
                          <q-item clickable>
                            <q-item-section>Delete Permanently</q-item-section>
                            <q-item-section side>
                              <q-icon name="keyboard_arrow_right" />
                            </q-item-section>
                            <q-menu content-class="bg-negative text-white" anchor="top end" self="top start">
                              <q-list>
                                <q-item clickable v-close-popup @click="deletePipelineTemplateById(props.row.pipelineTemplateUid)">
                                  <q-item-section>Confirm</q-item-section>
                                </q-item>
                              </q-list>
                            </q-menu>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </q-td>
                </template>

                <template v-slot:body-cell-statusName="props">
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

                <template v-slot:body-cell-publisherName="props">
                  <q-td :props="props">
                    <Identicon :identity="props.value" />
                    <div>
                      {{ props.value }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-pipelineTemplateIconPicture="props">
                  <q-td :props="props">
                    <IconPicture
                      :pngBase64="props.value"
                      :size="70"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-pipelineTemplateFieldsMappingStats="props">
                  <q-td :props="props">
                    <!-- {{props.value}} -->
                    <div
                      v-if="props.value"
                      class="row q-gutter-x-md"
                    >
                      <q-tooltip content-style="font-size: 1em">
                        <span>Detected fields: {{ props.row.pipelineTemplateStats.detectedFields }}</span><br>
                        <span>Mapped fields: {{ props.row.pipelineTemplateStats.mappedFields }}</span>&nbsp;(<span class="text-bold">{{ Math.round(props.value * 100) / 100 }}%</span>)
                      </q-tooltip>
                      <q-circular-progress
                        show-value
                        :value="Math.round(props.value)"
                        size="4em"
                        :thickness="0.2"
                        :color="(darkMode ? 'blue-3' : 'blue-10')"
                        :track-color="(darkMode ? 'grey-9' : 'grey-3')"
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
                      </q-circular-progress>
                      <!-- sharedFieldFrequencies
                      sharedFieldValues
                      sharedFieldMapping
                      sharedFieldModifiers -->
                      <div class="column q-gutter-y-xs">
                        <q-badge :color="(props.row.pipelineTemplateStats && props.row.pipelineTemplateStats.sharedFieldFrequencies ? 'positive' : 'grey')" text-color="black" label="Shared Frequency" />
                        <q-badge :color="(props.row.pipelineTemplateStats && props.row.pipelineTemplateStats.sharedFieldValues ? 'orange' : 'grey')" text-color="black" label="Shared Values" />
                        <q-badge :color="(props.row.pipelineTemplateStats && props.row.pipelineTemplateStats.sharedFieldMapping ? 'positive' : 'grey')" text-color="black" label="Shared Mapping" />
                        <q-badge :color="(props.row.pipelineTemplateStats && props.row.pipelineTemplateStats.sharedFieldModifiers ? 'positive' : 'grey')" text-color="black" label="Shared Modifiers" />
                      </div>
                    </div>
                    <div v-else>
                      -
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-pipelineTemplateCreatedOn="props">
                  <q-td :props="props">
                    <div>
                      <q-tooltip content-style="font-size: 1rem;">
                        {{ props.value }}
                      </q-tooltip>
                      {{ timeAgo(props.value) }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-pipelineTemplateModifiedOn="props">
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

          </q-card-section>

        </q-card-section>
    </q-card>

    <!-- PipelineTemplate details dialog -->

    <q-dialog v-model="showPipelineTemplateEdit" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6" v-if="editingPipelineTemplateUid != null">{{ $t('Edit Pipeline Template') }}</div>
          <div class="text-h6" v-else>{{ $t('New Pipeline Template') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select dense v-model="editingStatusId"
            :options="statusOptions"
            label="Status"
            emit-value
            map-options
            :rules="[val => goodStatusOptions.includes(val) || $t('Status should only be \'Visible\', \'Pending review\', \'Failed Review\', \'Hidden\' or \'To be Deleted\'')]"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            dense
            v-model="editingPublisherUid"
            emit-value
            map-options
            :options="publishersOptions"
            label="Publisher"
            stack-label
            :popup-content-class="(darkMode ? 'bg-grey-9' : undefined)"

            use-input
            input-debounce="0"
            @filter="filterPublishersOptions"
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                v-if="scope.opt.label && scope.opt.label !== '<hr>'"
              >
                <q-item-section>
                  <q-item-label v-if="scope.opt.value && scope.opt.value.length > 0"><div class="row justify-between"><div class="text-bold">{{ scope.opt.label }}</div></div></q-item-label>
                  <q-item-label v-else class="text-bold">{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.value }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator v-if="scope.opt.separator" inset :spaced="scope.opt.label && scope.opt.label === '<hr>'"  />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="editingName"
            label="Name"
            autofocus
            :rules="[val => !!val || $t('Name cannot be empty')]"
            @keyup.esc="showPipelineTemplateEdit = false"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="$t('Cancel')" v-close-popup />
          <q-btn flat :label="$t('Update Pipeline Template')" v-close-popup v-if="editingPipelineTemplateUid != null" :disabled="!editingName || !editingName.length" @click="addNewOrUpdatePipelineTemplate()" />
          <q-btn flat :label="$t('Add new Pipeline Template')" v-close-popup v-else :disabled="!editingName || !editingName.length" @click="addNewOrUpdatePipelineTemplate()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
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
  name: 'PageAdminPipelineTemplates',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { Identicon, IconPicture },
  data () {
    return {
      // {
      //   "pipelineTemplateUid": "471aab1c-9eaa-4179-accc-a28aa58a54c1",
      //   "statusId": 0,
      //   "statusName": "Visible",
      //   "statusDescription": "The item is publicly visible",
      //   "pipelineTemplateCreatedOn": "2022-02-03T00:00:59.000Z",
      //   "pipelineTemplateModifiedOn": "2022-02-09T21:17:09.000Z",
      //   "publisherUid": null,
      //   "publisherName": null,
      //   "pipelineTemplateName": "C1",
      //   "pipelineTemplateCollectionConfiguration": null,
      //   "pipelineTemplateMappingConfiguration": null,
      //   "pipelineTemplateStats": {}
      // }
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'statusName', align: 'center', label: 'Status', field: 'statusName', sortable: true },
        { name: 'publisherName', align: 'center', label: 'Publisher', field: 'publisherName', sortable: true },
        { name: 'pipelineTemplateUid', align: 'center', label: 'UID', field: 'pipelineTemplateUid', sortable: true },
        { name: 'pipelineTemplateIconPicture', align: 'center', label: 'Icon / Logo', field: 'pipelineTemplateIconPicture', sortable: false },
        { name: 'pipelineTemplateName', align: 'center', label: 'Pipeline Template Name', field: 'pipelineTemplateName', sortable: true, classes: '', style: 'white-space: pre-line;' },
        // { name: 'pipelineTemplateStats', align: 'center', label: 'Stats', field: row => JSON.stringify(row.pipelineTemplateStats), sortable: false },
        { name: 'pipelineTemplateCollectionStats', align: 'center', label: 'Collection', field: row => (row.pipelineTemplateStats ? `${row.pipelineTemplateStats.collectionShipper || ''} - ${row.pipelineTemplateStats.collectionMethod || ''}` : null), sortable: true },
        { name: 'pipelineTemplateFieldsMappingStats', align: 'center', label: 'Fields Mapping', field: row => (row.pipelineTemplateStats && row.pipelineTemplateStats.detectedFields > 0 ? (row.pipelineTemplateStats.mappedFields || 0) / row.pipelineTemplateStats.detectedFields * 100 : null), sortable: true },
        { name: 'pipelineTemplateCreatedOn', align: 'center', label: 'Created', field: 'pipelineTemplateCreatedOn', sortable: true },
        { name: 'pipelineTemplateModifiedOn', align: 'center', label: 'Modified', field: 'pipelineTemplateModifiedOn', sortable: true }
      ],
      pagination: {
        sortBy: 'pipelineTemplateCreatedOn',
        descending: true, // Most recent on top
        rowsPerPage: 10
      },
      statusesLoading: false,
      pipelineTemplatesLoading: false,
      showPipelineTemplateEdit: false,
      // const pipelineTemplateSchema = yup.object().shape(
      //   {
      //     pipelineTemplateUid: yup.string().uuid().required(),
      //     publisherUid: yup.string().uuid().nullable(), // Only used for Admin APIs
      //     statusId: yup.number(), // Only used for Admin APIs
      //     name: yup.string().required(),
      //     collectionConfiguration: yup.object().nullable(),
      //     fieldsMapping: yup.object().nullable(),
      //     stats: yup.object()
      //   }
      // );
      editingPipelineTemplateUid: null,
      editingCreatedOn: null,
      editingModifiedOn: null,
      editingPublisherUid: null,
      editingPublisherName: null,
      editingStatusId: null,
      editingStatusName: null,
      editingStatusDescription: null,
      editingName: null,
      editingStats: null,
      goodStatusOptions: [ // Good options for Pipeline Templates
        0, // Visible
        1, // Pending review
        2, // Failed Review
        3, // Hidden
        4 // To be deleted
      ],
      publishersOptions: [],
      publishersLoading: false
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['ezMarketPipelineTemplates', 'ezMarketStatuses', 'ezMarketPublishers']),
    tableData () {
      return this.ezMarketPipelineTemplates
    },
    dataLoading () {
      return this.statusesLoading || this.publishersLoading || this.pipelineTemplatesLoading
    },
    statusOptions () {
      const options = []
      if (this.ezMarketStatuses && Array.isArray(this.ezMarketStatuses) && this.ezMarketStatuses.length) {
        this.ezMarketStatuses.forEach((status) => {
          options.push({
            value: status.id,
            label: status.name,
            description: status.description
          })
        })
      }
      return options
    },
    publishersOptionsRaw () {
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
    }
  },
  methods: {
    ...mapActions('mainStore', ['getStatuses', 'getPublishers', 'getPipelineTemplates', 'updatePipelineTemplate', 'deletePipelineTemplate']),
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
          caller: this,
          onSuccessCallBack: this.publishersLoaded
        }
      )
    },
    publishersLoaded () {
      // Build the list of Publishers
      this.publishersOptions = this.publishersOptionsRaw
    },
    filterPublishersOptions (val, update, abort) {
      const tmpSendersOptions = [
        ...this.publishersOptionsRaw
      ]
      if (val === '') {
        update(() => {
          this.publishersOptions = tmpSendersOptions
        })
      } else {
        update(() => {
          const needle = val.toLowerCase()
          this.publishersOptions = tmpSendersOptions.filter(v => (v.label + v.value).toLowerCase().indexOf(needle) > -1)
        })
      }
    },
    loadPipelineTemplates () {
      this.getPipelineTemplates(
        {
          loadingVariableName: 'pipelineTemplatesLoading',
          caller: this
        }
      )
    },
    doPromptForPipelineTemplateEdit (payload) {
      if (payload) {
        this.showPipelineTemplateEdit = true
        this.editingPipelineTemplateUid = payload.pipelineTemplateUid || null
        this.editingCreatedOn = payload.pipelineTemplateCreatedOn || null
        this.editingModifiedOn = payload.pipelineTemplateModifiedOn || null
        this.editingPublisherUid = payload.publisherUid || null
        this.editingPublisherName = payload.publisherName || null
        this.editingStatusId = payload.statusId
        this.editingStatusName = payload.statusName || null
        this.editingStatusDescription = payload.statusDescription || null
        this.editingName = payload.pipelineTemplateName || null
        this.editingStats = payload.pipelineTemplateStats || null
      }
    },
    addNewPipelineTemplate () {
      this.doPromptForPipelineTemplateEdit(
        {
          pipelineTemplateUid: null,
          pipelineTemplateCreatedOn: null,
          pipelineTemplateModifiedOn: null,
          publisherUid: null,
          publisherName: null,
          statusId: 1, // Pending review
          statusName: 'Pending review',
          statusDescription: 'The item is to be reviewed',
          pipelineTemplateName: '',
          pipelineTemplateStats: {}
        }
      )
    },
    updatePipelineTemplateStatusTo (payload) {
      let statusId
      if (
        payload &&
        payload.toStatus &&
        payload.toStatus.length &&
        payload.pipelineTemplateFullDetails &&
        payload.pipelineTemplateFullDetails.pipelineTemplateUid &&
        payload.pipelineTemplateFullDetails.pipelineTemplateUid.length
      ) {
        if (payload.toStatus === 'To be deleted') {
          statusId = 4
        }

        this.updatePipelineTemplate(
          {
            pipelineTemplateUid: payload.pipelineTemplateFullDetails.pipelineTemplateUid,
            statusId: statusId,
            name: payload.pipelineTemplateFullDetails.pipelineTemplateName,

            loadingVariableName: 'pipelineTemplatesLoading',
            caller: this,
            onSuccessCallBack: this.loadPipelineTemplates,
            onErrorCallBack: this.addNewOrUpdatePipelineTemplateFailure,
            debug: true
          }
        )
      }
    },
    deletePipelineTemplateById (pipelineTemplateUid) {
      this.deletePipelineTemplate(
        {
          pipelineTemplateUid,

          loadingVariableName: 'pipelineTemplatesLoading',
          caller: this,
          onSuccessCallBack: this.loadPipelineTemplates,
          onErrorCallBack: this.addNewOrUpdatePipelineTemplateFailure
        }
      )
    },
    addNewOrUpdatePipelineTemplate () {
      this.updatePipelineTemplate(
        {
          pipelineTemplateUid: this.editingPipelineTemplateUid,
          publisherUid: this.editingPublisherUid,
          statusId: this.editingStatusId,
          name: this.editingName,
          pipelineTemplateStats: this.editingStats,

          loadingVariableName: 'pipelineTemplatesLoading',
          caller: this,
          onSuccessCallBack: this.loadPipelineTemplates,
          onErrorCallBack: this.addNewOrUpdatePipelineTemplateFailure,
          debug: true
        }
      )
    },
    addNewOrUpdatePipelineTemplateFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
      this.loadPipelineTemplates()
    },
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
    this.publishersOptions = this.publishersOptionsRaw
    this.loadPipelineTemplates()
    this.loadStatuses()
    this.loadPublishers()
  }
}
</script>
