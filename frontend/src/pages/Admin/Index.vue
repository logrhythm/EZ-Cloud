<template>
  <q-page class="q-pa-sm">
    <BreadCrumbs
      :crumbs="breadCrumbs"
      :pageTitle="$t('Admin')"
    />

    <div class="q-gutter-y-sm">
      <q-card class="q-pa-md q-mx-none">
          <q-card-section horizontal>
            <q-card-section class="col q-ma-none q-pa-none">
              <q-card-section class="text-h4">
                  RBAC
              </q-card-section>
              <q-card-section class="q-gutter-lg">
                <q-btn no-caps color="primary" :label="$t('Manage User Accounts')" to="/Admin/RBAC/Users" />
                <q-btn no-caps color="primary" :label="$t('Manage User Roles')" to="/Admin/RBAC/Roles" />
              </q-card-section>
            </q-card-section>

          </q-card-section>
      </q-card>

      <q-card class="q-pa-md q-mx-none">
          <q-card-section horizontal>
            <q-card-section class="col q-ma-none q-pa-none">
              <q-card-section class="text-h4">
                  SIEM
              </q-card-section>
              <q-card-section class="q-gutter-lg">
                <q-btn no-caps color="primary" :label="$t('Manage MS SQL Connection')" to="/Admin/SIEM/MsSql">
                  <q-badge
                    v-if="needToConfigureMsSql"
                    floating
                    rounded
                    color="negative"
                    text-color="white"
                    label="1"
                  />
                </q-btn>
                <q-btn no-caps color="primary" :label="$t('Update Database')" to="/Admin/SIEM/UpdateEmdb">
                  <!-- <q-badge
                    v-if="needToConfigureMsSql"
                    floating
                    rounded
                    color="negative"
                    text-color="white"
                    label="1"
                  /> -->
                </q-btn>
              </q-card-section>
            </q-card-section>

          </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  name: 'PageAdmin',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { BreadCrumbs },
  computed: {
    ...mapState('mainStore', ['extraInformation']),
    needToConfigureMsSql () {
      return this.extraInformation && this.extraInformation.msSqlConnectionConfigMissing
    },
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('Admin'),
          link: '/Admin'
        }
      ]
    }

  }
}
</script>
