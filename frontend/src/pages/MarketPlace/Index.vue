<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Notifications
            </q-card-section>
            <!-- <q-card-section>
                <ul>
                  <li
                    v-for="(notification, index) in ezMarketNotifications"
                    :key="index"
                  >🚧 (# {{ index }}) {{ notification.message }}</li>
                </ul>
            </q-card-section> -->
            <q-card-section class="flex flex-center">
              <div class="text-h2" style="opacity:.4">
                Coming Soon
              </div>
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <q-btn icon="refresh" :loading="dataLoading" color="primary" @click="reloadEzMarketNotifications()">
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
              <q-btn icon="mark_email_read" @click="updateEzMarketNotification(null)" >
                <q-tooltip content-style="font-size: 1rem;">
                  <!-- Mark All Notifications as Read -->
                  {{ $t('Clear notifications') }}
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
    </q-card>

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

          <q-card-actions vertical class="justify-around q-px-md">
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

export default {
  name: 'PageAdmin',
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
    ...mapActions('mainStore', ['updateEzMarketNotification', 'reloadEzMarketNotifications'])
  }
}
</script>
