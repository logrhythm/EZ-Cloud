<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Notifications
            </q-card-section>
            <!-- <q-card-section class="flex flex-center">
              <div class="text-h2" style="opacity:.4">
                Coming Soon
              </div>
            </q-card-section> -->
            <!-- <q-card-section class="flex flex-center">
              <q-btn dense color="primary" icon="refresh" :loading="statusesLoading" @click="loadStatuses()">
                <q-tooltip content-style="font-size: 1em">
                  Reload the list of Statuses.
                </q-tooltip>
              </q-btn>
            </q-card-section>
            <q-card-section class="flex flex-center">
              <div class="">
                {{ ezMarketStatuses }}
              </div>
            </q-card-section> -->

            <!-- <q-card-section class="flex flex-center">
              <q-btn dense color="primary" icon="refresh" :loading="notificationsLoading" @click="loadNotifications()">
                <q-tooltip content-style="font-size: 1em">
                  Reload the list of Notifications.
                </q-tooltip>
              </q-btn>
            </q-card-section>
            <q-card-section class="flex flex-center">
              <div class="">
                {{ ezMarketNotifications }}
              </div>
            </q-card-section> -->

            <q-card-section>
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="roleUid"
                dense
                no-data-label="No Notification to display."
                :filter="searchFilter"
                :loading="dataLoading"
                rows-per-page-label="Notifications per page:"
                :pagination.sync="pagination"
              >
                <template v-slot:top>
                  <div class="full-width row wrap justify-between">
                    <div class="q-table__title">
                      Notifications
                    </div>
                    <div class="row q-gutter-md">
                      <div class="col" >
                        <q-btn rounded dense color="primary" icon="add" label="Add New Notification" style="min-width:14rem;" @click="addNewNotification()" >
                          <q-tooltip content-style="font-size: 1em">
                            Create a new Notification.
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
                      <!-- <q-separator vertical dark color="orange" /> -->
                      <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadNotifications()">
                        <q-tooltip content-style="font-size: 1em">
                          Reload the list of Notifications.
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense icon="edit" @click="doPromptForNotificationEdit(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Edit Message') }}
                      </q-tooltip>
                    </q-btn>
                    <!-- <q-btn flat dense icon="delete" color="negative" @click="deleteNotificationPrompt(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Delete Notification') }}
                      </q-tooltip>
                    </q-btn> -->
                    <!-- {{ props.row }} -->
                    <!-- {
                      "messageUid":"361670bc-8c29-11ec-88fe-00155d005a03",
                      "sentOn":"2022-02-12T17:28:39.000Z",
                      "updatedOn":"2022-02-14T16:16:55.000Z",
                      "recipient":null,
                      "sender":null,
                      "statusName":"Unread",
                      "statusDescription":"The item is marked as Not Read",
                      "messageContent":"Welcome to the EZ Cloud Market Place.",
                      "messageFlags":"[]"
                    } -->
                    <q-btn
                      icon="mark_email_read"
                      flat
                      dense
                      :disabled="props.row.statusName === 'Read'"
                      @click="updateNotificationStatusTo({messageFullDetails: props.row, toStatus: 'Read'})"
                    >
                      <q-tooltip content-style="font-size: 1rem;" v-if="props.row.statusName === 'Unread'">
                        {{ $t('Mark as Read') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      icon="mark_email_unread"
                      flat
                      dense
                      :disabled="props.row.statusName === 'Unread'"
                      @click="updateNotificationStatusTo({messageFullDetails: props.row, toStatus: 'Unread'})"
                    >
                      <q-tooltip content-style="font-size: 1rem;" v-if="props.row.statusName === 'Read'">
                        {{ $t('Mark as Unread') }}
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
                          <q-item clickable v-close-popup @click="updateNotificationStatusTo({messageFullDetails: props.row, toStatus: 'To be deleted'})">
                            <q-item-section>Mark to be Deleted</q-item-section>
                          </q-item>
                          <q-item clickable>
                            <q-item-section>Delete Permanently</q-item-section>
                            <q-item-section side>
                              <q-icon name="keyboard_arrow_right" />
                            </q-item-section>
                            <q-menu content-class="bg-negative text-white" anchor="top end" self="top start">
                              <q-list>
                                <q-item clickable v-close-popup @click="deleteNotificationById(props.row.messageUid)">
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
                      <q-icon name="mark_email_unread" color="positive" style="opacity: .75;" size="md" v-if="props.value === 'Unread'" />
                      <q-icon name="mark_email_read" style="opacity: .5;" size="md" v-else-if="props.value === 'Read'" />
                      <q-icon name="visibility_off" color="orange" style="opacity: .5;" size="md" v-else-if="props.value === 'Hidden'" />
                      <q-icon name="visibility" color="orange" size="md" v-else-if="props.value === 'Visible'" />
                      <q-icon name="auto_delete" color="negative" style="opacity: .75;" size="md" v-else-if="props.value === 'To be deleted'" />
                      <q-icon name="question_mark" color="orange" size="md" v-else />
                      <q-tooltip content-style="font-size: 1em">
                        {{ props.row.statusDescription }}
                      </q-tooltip>
                      <br>
                      {{ props.value }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-sender="props">
                  <q-td :props="props">
                    <div v-html="identicon(props.value)"></div>
                    <div>
                      {{ props.value }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-recipient="props">
                  <q-td :props="props">
                    <div v-html="identicon(props.value)"></div>
                    <div>
                      {{ props.value }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-sentOn="props">
                  <q-td :props="props">
                    <div>
                      <q-tooltip content-style="font-size: 1rem;">
                        {{ props.value }}
                      </q-tooltip>
                      {{ timeAgo(props.value) }}
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-updatedOn="props">
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

    <!-- Notification details dialog -->
    <!--
      editingMessageUid: null,
      editingSentOn: null,
      editingUpdatedOn: null,
      editingRecipientUid: null,
      editingRecipient: null,
      editingSenderUid: null,
      editingSender: null,
      editingStatusId: null,
      editingStatusName: null,
      editingStatusDescription: null,
      editingMessageContent: null,
      editingMessageFlags: null
    -->

    <q-dialog v-model="showNotificationEdit" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6" v-if="editingMessageUid != null">{{ $t('Edit Notification') }}</div>
          <div class="text-h6" v-else>{{ $t('New Notification') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select dense v-model="editingStatusId"
            :options="statusOptions"
            label="Status"
            emit-value
            map-options
            :rules="[val => goodStatusOptions.includes(val) || $t('Status should only be \'Read\', \'Unread\' or \'To be Deleted\'')]"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            dense
            v-model="editingSenderUid"
            emit-value
            map-options
            :options="sendersOptions"
            label="Sender"
            stack-label
            :popup-content-class="(darkMode ? 'bg-grey-9' : undefined)"

            use-input
            input-debounce="0"
            @filter="filterSendersOptions"
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                v-if="scope.opt.label && scope.opt.label !== '<hr>'"
              >
                <q-item-section>
                  <!-- <q-item-label v-if="scope.opt.value && scope.opt.value.length > 0"><div class="row justify-between"><div class="text-bold">{{ scope.opt.label }}</div><div class="fixed-font text-caption">&lt;{{ scope.opt.value }}&gt;</div></div></q-item-label> -->
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
          <q-select
            dense
            v-model="editingRecipientUid"
            emit-value
            map-options
            :options="recipientsOptions"
            label="Recipient"
            stack-label
            :popup-content-class="(darkMode ? 'bg-grey-9' : undefined)"

            use-input
            input-debounce="0"
            @filter="filterRecipientsOptions"
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                v-if="scope.opt.label && scope.opt.label !== '<hr>'"
              >
                <q-item-section>
                  <!-- <q-item-label v-if="scope.opt.value && scope.opt.value.length > 0"><div class="row justify-between"><div class="text-bold">{{ scope.opt.label }}</div><div class="fixed-font text-caption">&lt;{{ scope.opt.value }}&gt;</div></div></q-item-label> -->
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
          <q-input dense v-model="editingMessageContent"
            label="Message"
            autofocus
            autogrow
            :rules="[val => !!val || $t('Message cannot be empty')]"
            @keyup.esc="showNotificationEdit = false"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <!-- <q-btn flat :label="$t('Cancel')" v-close-popup @click="cleanEditingVariables()" /> -->
          <q-btn flat :label="$t('Cancel')" v-close-popup />
          <q-btn flat :label="$t('Update Notification')" v-close-popup v-if="editingMessageUid != null" :disabled="!editingMessageContent || !editingMessageContent.length" @click="addNewOrUpdateNotification()" />
          <q-btn flat :label="$t('Add new Notification')" v-close-popup v-else :disabled="!editingMessageContent || !editingMessageContent.length" @click="addNewOrUpdateNotification()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import { toSvg } from 'jdenticon'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

export default {
  name: 'PageAdminNotifications',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      // {
      //   "messageUid":"361670bc-8c29-11ec-88fe-00155d005a03",
      //   "sentOn":"2022-02-12T17:28:39.000Z",
      //   "updatedOn":"2022-02-14T16:16:55.000Z",
      //   "recipient":null,
      //   "sender":null,
      //   "statusName":"Unread",
      //   "statusDescription":"The item is marked as Not Read",
      //   "messageContent":"Welcome to the EZ Cloud Market Place.",
      //   "messageFlags":"[]"
      // }
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'statusName', align: 'center', label: 'Status', field: 'statusName', sortable: true },
        { name: 'sender', align: 'center', label: 'Sender', field: 'sender', sortable: true },
        { name: 'recipient', align: 'center', label: 'Recipient', field: 'recipient', sortable: true },
        { name: 'messageContent', align: 'left', label: 'Message', field: 'messageContent', sortable: true, classes: '', style: 'white-space: pre-line;' },
        { name: 'messageFlags', align: 'center', label: 'Flags', field: 'messageFlags', sortable: true },
        { name: 'sentOn', align: 'center', label: 'Sent', field: 'sentOn', sortable: true },
        { name: 'updatedOn', align: 'center', label: 'Updated', field: 'updatedOn', sortable: true }
      ],
      pagination: {
        sortBy: 'sentOn',
        descending: true, // Most recent on top
        rowsPerPage: 20
      },
      statusesLoading: false,
      notificationsLoading: false,
      showNotificationEdit: false,
      editingMessageUid: null,
      editingSentOn: null,
      editingUpdatedOn: null,
      editingRecipientUid: null,
      editingRecipient: null,
      editingSenderUid: null,
      editingSender: null,
      editingStatusId: null,
      editingStatusName: null,
      editingStatusDescription: null,
      editingMessageContent: null,
      editingRelatedPipelineTemplate: null,
      editingMessageFlags: null,
      goodStatusOptions: [ // Good options for Notifications
        4, // To be deleted
        5, // Unread
        6 // Read
      ],
      sendersOptions: [],
      recipientsOptions: [],
      publishersLoading: false,
      senderTopEntries: [
        { label: 'System Senders', disable: true, separator: true },
        { label: 'EZ Market Broadcaster', value: null },
        { label: 'Publishers', disable: true, separator: true }
      ],
      recipientTopEntries: [
        { label: 'System Recipient', disable: true, separator: true },
        { label: 'EZ Market Broadcast Message', value: null },
        { label: 'Publishers', disable: true, separator: true }
      ]
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['ezMarketNotifications', 'ezMarketStatuses', 'ezMarketPublishers']),
    tableData () {
      return this.ezMarketNotifications
    },
    dataLoading () {
      return this.statusesLoading || this.publishersLoading || this.notificationsLoading
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
    }
  },
  methods: {
    ...mapActions('mainStore', ['getStatuses', 'getPublishers', 'getNotifications', 'updateNotification', 'deleteNotification']),
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
      console.log('publishersLoaded')
      // Build the list of Publishers
      this.sendersOptions = this.publishersOptions
      this.recipientsOptions = this.publishersOptions
    },
    filterSendersOptions (val, update, abort) {
      const tmpSendersOptions = [
        ...this.senderTopEntries,
        ...this.publishersOptions
      ]
      if (val === '') {
        update(() => {
          this.sendersOptions = tmpSendersOptions
        })
      } else {
        update(() => {
          const needle = val.toLowerCase()
          this.sendersOptions = tmpSendersOptions.filter(v => (v.label + v.value).toLowerCase().indexOf(needle) > -1)
        })
      }
    },
    filterRecipientsOptions (val, update, abort) {
      const tmpRecipientsOptions = [
        ...this.recipientTopEntries,
        ...this.publishersOptions
      ]
      if (val === '') {
        update(() => {
          this.recipientsOptions = tmpRecipientsOptions
        })
      } else {
        update(() => {
          const needle = val.toLowerCase()
          this.recipientsOptions = tmpRecipientsOptions.filter(v => (v.label + v.value).toLowerCase().indexOf(needle) > -1)
        })
      }
    },
    loadNotifications () {
      this.getNotifications(
        {
          loadingVariableName: 'notificationsLoading',
          caller: this
        }
      )
    },
    doPromptForNotificationEdit (payload) {
      if (payload) {
        this.showNotificationEdit = true
        this.editingMessageUid = payload.messageUid || null
        this.editingSentOn = payload.sentOn || null
        this.editingUpdatedOn = payload.updatedOn || null
        this.editingRecipientUid = payload.recipientUid || null
        this.editingRecipient = payload.recipient || null
        this.editingSenderUid = payload.senderUid || null
        this.editingSender = payload.sender || null
        this.editingStatusId = payload.statusId
        this.editingStatusName = payload.statusName || null
        this.editingStatusDescription = payload.statusDescription || null
        this.editingMessageContent = payload.messageContent || null
        this.editingRelatedPipelineTemplate = payload.relatedPipelineTemplate || null
        this.editingMessageFlags = payload.messageFlags || null
      }
    },
    addNewNotification () {
      this.doPromptForNotificationEdit(
        {
          messageUid: null,
          sentOn: null,
          updatedOn: null,
          recipientUid: null,
          recipient: null,
          senderUid: null,
          sender: null,
          statusId: 5, // Unread
          statusName: 'Unread',
          statusDescription: 'The item is marked as Not Read',
          messageContent: '',
          relatedPipelineTemplate: null,
          messageFlags: []
        }
      )
    },
    updateNotificationStatusTo (payload) {
      console.log('updateNotificationStatusTo', payload)
      let statusId
      if (
        payload &&
        payload.toStatus &&
        payload.toStatus.length &&
        payload.messageFullDetails &&
        payload.messageFullDetails.messageUid &&
        payload.messageFullDetails.messageUid.length
      ) {
        if (payload.toStatus === 'To be deleted') {
          statusId = 4
        }
        if (payload.toStatus === 'Unread') {
          statusId = 5
        }
        if (payload.toStatus === 'Read') {
          statusId = 6
        }

        this.updateNotification(
          {
            messageUid: payload.messageFullDetails.messageUid,
            statusId: statusId,

            loadingVariableName: 'notificationsLoading',
            caller: this,
            onSuccessCallBack: this.loadNotifications,
            onErrorCallBack: this.addNewOrUpdateNotificationFailure
          }
        )
      }
    },
    deleteNotificationById (messageUid) {
      console.log('deleteNotificationById', messageUid)
      this.deleteNotification(
        {
          messageUid,

          loadingVariableName: 'notificationsLoading',
          caller: this,
          onSuccessCallBack: this.loadNotifications,
          onErrorCallBack: this.addNewOrUpdateNotificationFailure
        }
      )
    },
    addNewOrUpdateNotification () {
      console.log('addNewOrUpdateNotification')
      this.updateNotification(
        {
          messageUid: this.editingMessageUid,
          senderUid: this.editingSenderUid,
          recipientUid: this.editingRecipientUid,
          statusId: this.editingStatusId,
          messageContent: this.editingMessageContent,
          relatedPipelineTemplate: this.editingRelatedPipelineTemplate,
          messageFlags: this.editingMessageFlags,

          loadingVariableName: 'notificationsLoading',
          caller: this,
          onSuccessCallBack: this.loadNotifications,
          onErrorCallBack: this.addNewOrUpdateNotificationFailure
        }
      )
    },
    addNewOrUpdateNotificationFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
      this.loadNotifications()
    },
    identicon (name) {
      return toSvg(name, 50)
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
    this.sendersOptions = this.publishersOptions
    this.recipientsOptions = this.publishersOptions
    this.loadStatuses()
    this.loadPublishers()
    this.loadNotifications()
  }
}
</script>
