<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Publishers
            </q-card-section>
            <q-card-section>
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="publisherUid"
                dense
                no-data-label="No Publisher to display."
                :filter="searchFilter"
                :loading="dataLoading"
                rows-per-page-label="Publishers per page:"
                :pagination="pagination"
              >
                <template v-slot:top>
                  <div class="full-width row wrap justify-between">
                    <div class="q-table__title">
                      Publishers
                    </div>
                    <div class="row q-gutter-md">
                      <div class="col" >
                        <q-btn rounded dense color="primary" icon="add" label="Add New Publisher" style="min-width:14rem;" @click="addNewPublisher()" >
                          <q-tooltip content-style="font-size: 1em">
                            Create a new Publisher.
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
                      <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadPublishers()">
                        <q-tooltip content-style="font-size: 1em">
                          Reload the list of Publishers.
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense icon="edit" @click="doPromptForPublisherEdit(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Rename Publisher') }}
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
                      <q-menu content-class="bg-negative text-white" anchor="top right" self="top left">
                        <q-list>
                          <q-item clickable v-close-popup @click="deletePublisherById(props.row.publisherUid)">
                            <q-item-section>Confirm</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </q-td>
                </template>

                <template v-slot:body-cell-identicon="props">
                  <q-td :props="props">
                    <Identicon :identity="props.value" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card-section>

        </q-card-section>
    </q-card>

    <q-dialog v-model="showPublisherEdit" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6" v-if="editingPublisherUid != null">{{ $t('Edit Publisher') }}</div>
          <div class="text-h6" v-else>{{ $t('New Publisher') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="editingPublisherDisplayName"
            label="Display Name"
            autofocus
            :rules="[val => !!val || $t('Display Name cannot be empty')]"
            @keyup.esc="showPublisherEdit = false"
            @keyup.enter="checkUpdatePublisherAndClose()"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <!-- <q-btn flat :label="$t('Cancel')" v-close-popup @click="cleanEditingVariables()" /> -->
          <q-btn flat :label="$t('Cancel')" v-close-popup />
          <q-btn flat :label="$t('Update Publisher')" v-close-popup v-if="editingPublisherUid != null" :disabled="!(editingPublisherDisplayName && editingPublisherDisplayName.length)" @click="addNewOrUpdatePublisher()" />
          <q-btn flat :label="$t('Add new Publisher')" v-close-popup v-else :disabled="!(editingPublisherDisplayName && editingPublisherDisplayName.length)" @click="addNewOrUpdatePublisher()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import Identicon from 'components/Publisher/Identicon.vue'

export default {
  name: 'PageAdminPublishers',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { Identicon },
  data () {
    return {
      // {
      //   "publisherUid":"361670bc-8c29-11ec-88fe-00155d005a03",
      //   "displayName":"Rodeo 25",
      //   "messagesSent": 1,
      //   "messagesReceived": 3,
      //   "pipelineTemplatesAuthored": 5
      // }
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'publisherUid', align: 'center', label: 'UID', field: 'publisherUid', sortable: true },
        { name: 'identicon', align: 'center', label: 'Identicon', field: 'displayName', sortable: true },
        { name: 'displayName', align: 'center', label: 'Display Name', field: 'displayName', sortable: true, classes: '', style: 'white-space: pre-line;' },
        { name: 'pipelineTemplatesAuthored', align: 'center', label: 'Published Pipeline Templates', field: 'pipelineTemplatesAuthored', sortable: true, format: val => (val > 0 ? val : '\u00b7') },
        { name: 'messagesSent', align: 'center', label: 'Sent Messages', field: 'messagesSent', sortable: true, format: val => (val > 0 ? val : '\u00b7') },
        { name: 'messagesReceived', align: 'center', label: 'Received Messages', field: 'messagesReceived', sortable: true, format: val => (val > 0 ? val : '\u00b7') }
      ],
      pagination: {
        sortBy: 'displayName',
        descending: false,
        rowsPerPage: 20
      },
      statusesLoading: false,
      publishersLoading: false,
      showPublisherEdit: false,
      editingPublisherUid: null,
      editingPublisherDisplayName: null
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['ezMarketPublishers']),
    tableData () {
      return this.ezMarketPublishers
    },
    dataLoading () {
      return this.publishersLoading
    }
  },
  methods: {
    ...mapActions('mainStore', ['getPublishers', 'updatePublisher', 'deletePublisher']),
    loadPublishers () {
      this.getPublishers(
        {
          loadingVariableName: 'publishersLoading',
          caller: this
        }
      )
    },
    doPromptForPublisherEdit (payload) {
      if (payload) {
        this.showPublisherEdit = true
        this.editingPublisherUid = payload.publisherUid || null
        this.editingPublisherDisplayName = payload.displayName || null
      }
    },
    addNewPublisher () {
      this.doPromptForPublisherEdit(
        {
          publisherUid: null,
          displayName: null
        }
      )
    },
    deletePublisherById (publisherUid) {
      console.log('deletePublisherById', publisherUid)
      this.deletePublisher(
        {
          publisherUid,

          loadingVariableName: 'publishersLoading',
          caller: this,
          onSuccessCallBack: this.loadPublishers,
          onErrorCallBack: this.addNewOrUpdatePublisherFailure
        }
      )
    },
    checkUpdatePublisherAndClose () {
      if (this.editingPublisherDisplayName && this.editingPublisherDisplayName.length) {
        this.addNewOrUpdatePublisher()
        this.showPublisherEdit = false
      }
    },
    addNewOrUpdatePublisher () {
      console.log('addNewOrUpdatePublisher')
      this.updatePublisher(
        {
          publisherUid: this.editingPublisherUid,
          displayName: this.editingPublisherDisplayName,

          loadingVariableName: 'publishersLoading',
          caller: this,
          onSuccessCallBack: this.loadPublishers,
          onErrorCallBack: this.addNewOrUpdatePublisherFailure
        }
      )
    },
    addNewOrUpdatePublisherFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
      this.loadPublishers()
    }
  },
  mounted () {
    this.loadPublishers()
  }
}
</script>
