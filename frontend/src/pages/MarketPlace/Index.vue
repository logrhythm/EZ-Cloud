<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                EZ Market Place
            </q-card-section>
            <q-card-section>
              <q-btn color="primary" icon='mail_outline' :label="$t('View Notifications')" to="/MarketPlace/Notifications" />
            </q-card-section>
            <q-card-section>
              <q-btn color="primary" icon='account_tree' :label="$t('View Pipeline Templates')" to="/MarketPlace/PipelineTemplates" />
            </q-card-section>
            <q-card-section>
              <q-btn color="primary" icon='person' :label="$t('View My Profile')" to="/MarketPlace/PublisherProfile" />
            </q-card-section>
          </q-card-section>

        </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageMarket',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ]
}
</script>
