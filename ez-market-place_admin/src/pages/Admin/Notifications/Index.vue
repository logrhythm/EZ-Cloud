<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                Notifications
            </q-card-section>
            <q-card-section class="flex flex-center">
              <div class="text-h2" style="opacity:.4">
                Coming Soon
              </div>
            </q-card-section>
            <q-card-section class="flex flex-center">
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
            </q-card-section>
          </q-card-section>

        </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageAdminNotifications',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      notificationsLoading: false
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['ezMarketNotifications'])
  },
  methods: {
    ...mapActions('mainStore', ['getNotifications']),
    loadNotifications () {
      this.getNotifications(
        {
          loadingVariableName: 'notificationsLoading',
          caller: this,
          debug: true
        }
      )
    }
  }
}
</script>
