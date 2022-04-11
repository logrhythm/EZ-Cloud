<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" label="Return to Market Place" :to="'/MarketPlace'" />
        <q-separator spaced vertical />
        <q-btn no-caps flat dense icon="mail_outline" color="primary" label="View Notifications" :to="'/MarketPlace/Notifications'" />
        <q-toolbar-title style="opacity:.4" class="text-center">EZ Market Place : Pipeline Templates</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Pipeline Templates
            </q-card-section>
            <q-card-section class="flex flex-center">
              <div class="text-h2" style="opacity:.4">
                Coming Soon
              </div>
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="q-px-md">
              <q-btn icon="refresh" color="primary" :loading="dataLoading" >
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
import { toSvg } from 'jdenticon'
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
TimeAgo.addDefaultLocale(en)

export default {
  name: 'PageMarketPipelineTemplates',
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
