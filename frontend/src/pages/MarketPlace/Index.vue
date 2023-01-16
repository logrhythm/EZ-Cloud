<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" src="logrhythm_logo_wide.svg" alt="LogRhythm Open Collector">
      </q-toolbar>
    </q-header>
    <BreadCrumbs
      :crumbs="breadCrumbs"
      :pageTitle="$t('EZ Market Place')"
    />
    <div class="q-gutter-y-sm">
      <q-card class="q-pa-md q-mx-none">
          <q-card-section horizontal>
            <q-card-section class="col q-ma-none q-pa-none">
              <q-card-section class="text-h4">
                  {{ $t('EZ Market Place') }}
              </q-card-section>
              <q-card-section class="q-gutter-lg">
                <q-btn color="primary" icon='mail_outline' :label="$t('View Notifications')" to="/MarketPlace/Notifications" />
                <q-btn color="primary" icon='account_tree' :label="$t('View Pipeline Templates')" to="/MarketPlace/PipelineTemplates" />
                <q-btn color="primary" icon='person' :label="$t('View My Profile')" to="/MarketPlace/PublisherProfile" />
              </q-card-section>
            </q-card-section>

          </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  name: 'PageMarket',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { BreadCrumbs },
  computed: {
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('EZ Market Place'),
          link: '/MarketPlace'
        }
      ]
    }
  }
}
</script>
