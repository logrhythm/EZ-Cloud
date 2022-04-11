<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Market Place" :to="'/MarketPlace'" />
        <q-separator spaced vertical />
        <q-btn no-caps flat dense icon="account_tree" color="primary" label="View Pipeline Templates" :to="'/MarketPlace/PipelineTemplates'" />
        <q-toolbar-title style="opacity:.4" class="text-center">EZ Market Place : Notifications</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                {{ $t('Notifications') }}
            </q-card-section>
            <!-- <q-card-section>
                <ul>
                  <li
                    v-for="(notification, index) in ezMarketNotifications"
                    :key="index"
                  >🚧 (# {{ index }}) {{ notification }}
                    <br>
                    notification.recipient: {{ notification.recipient }}
                  </li>
                </ul>
            </q-card-section> -->
            <q-card-section class="flex flex-center" v-if="!(ezMarketNotifications && Array.isArray(ezMarketNotifications) && ezMarketNotifications.length)">
              <div class="text-h4" style="opacity:.4">
                {{ $t('You\'ve got no notifications (yet...)') }}
              </div>
            </q-card-section>

            <q-card-section v-else>
              <q-list bordered class="rounded-borders">
                <div
                  v-for="(notification, index) in ezMarketNotifications"
                  :key="index"
                >
                  <q-item>
                    <q-item-section avatar top>
                      <div v-html="identicon(notification.sender)"></div>
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1"><span class="text-bold">From: </span><span :class="(notification.sender == null ? 'text-italic' : '')">{{ notification.sender || '*** Platform ***' }}</span></q-item-label>
                      <q-item-label caption lines="1" class="q-mb-md"><span class="text-bold">To: </span><span :class="(notification.recipient == null ? 'text-italic' : '')">{{ notification.recipient || '*** Broadcast ***' }}</span></q-item-label>
                      <q-item-label lines="20" style="white-space: pre-line;">
                        {{ notification.messageContent }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side top>
                      <div>
                        <div>
                          <q-tooltip content-style="font-size: 1rem;">
                            <div>
                              <span class="text-bold">Sent:</span><br>
                              {{ notification.sentOn }}
                            </div>
                            <div>
                              <span class="text-bold">Last updated:</span><br>
                              {{ notification.updatedOn }}
                            </div>
                          </q-tooltip>
                          <span class="text-bold">{{ timeAgo(notification.sentOn) }}</span>
                        </div>
                        <q-separator />
                        <div class="justify-around row">
                          <q-btn
                            icon="mark_email_read"
                            flat
                            dense
                            :disabled="(notification.recipient == null) || (notification.statusName === 'Read')"
                            @click="updateEzMarketNotificationStatusTo({messageUid: notification.messageUid, toStatus: 'Read'})"
                          >
                            <q-tooltip content-style="font-size: 1rem;" v-if="notification.statusName === 'Unread'">
                              {{ $t('Mark as Read') }}
                            </q-tooltip>
                          </q-btn>
                          <q-btn
                            icon="mark_email_unread"
                            flat
                            dense
                            :disabled="(notification.recipient == null) || (notification.statusName === 'Unread')"
                            @click="updateEzMarketNotificationStatusTo({messageUid: notification.messageUid, toStatus: 'Unread'})"
                          >
                            <q-tooltip content-style="font-size: 1rem;" v-if="notification.statusName === 'Read'">
                              {{ $t('Mark as Unread') }}
                            </q-tooltip>
                          </q-btn>
                          <q-btn
                            icon="delete"
                            flat
                            dense
                            color="negative"
                            :disabled="notification.recipient == null"
                          >
                            <q-tooltip content-style="font-size: 1rem;">
                              {{ $t('Delete') }}
                            </q-tooltip>
                            <q-menu content-class="bg-negative text-white" anchor="top right" self="top left">
                              <q-list style="min-width: 100px">
                                <q-item clickable v-close-popup @click="deleteEzMarketNotificationById(notification.messageUid)">
                                  <q-item-section>Confirm</q-item-section>
                                </q-item>
                              </q-list>
                            </q-menu>
                          </q-btn>
                        </div>

                      </div>
                    </q-item-section>
                  </q-item>

                  <q-separator inset="item" />
                </div>

              </q-list>
            </q-card-section>

            <!-- <q-card-section class="flex flex-center">
              <div class="text-h2" style="opacity:.4">
                Coming Soon
              </div>
            </q-card-section> -->
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="q-px-md">
              <q-btn icon="refresh" :loading="dataLoading" color="primary" @click="reloadEzMarketNotifications()">
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
              <!-- <q-btn icon="mark_email_read" @click="updateEzMarketNotificationsStatusFromTo('Unread', 'Read')" >
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Mark All Notifications as Read') }}
                </q-tooltip>
              </q-btn> -->
              <!-- <q-btn icon="person_pin" @click="ga('Bill')" >
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Clear notifications') }}
                </q-tooltip>
              </q-btn> -->
          </q-card-actions>
        </q-card-section>
    </q-card>
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
  name: 'PageMarketNotifications',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      dataLoading: false
    }
  },
  computed: {
    ...mapState('mainStore', ['ezMarketNotification', 'ezMarketNotifications'])
  }, // computed
  methods: {
    ...mapActions('mainStore', ['updateEzMarketNotificationNumber', 'reloadEzMarketNotifications', 'updateEzMarketNotificationStatusTo', 'deleteEzMarketNotificationById']),
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
  }
}
</script>
