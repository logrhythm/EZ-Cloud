<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                RBAC
            </q-card-section>
            <q-card-section>
              <q-btn color="primary" :label="$t('Manage User Accounts')" to="/Admin/Users" />
            </q-card-section>
            <q-card-section>
              <q-btn color="primary" :label="$t('Manage User Roles')" to="/Admin/Roles" />
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
            <q-card-section>
              <q-btn color="primary" :label="$t('Manage MS SQL Connection')" to="/Admin/SIEM/MsSql" />
            </q-card-section>
          </q-card-section>

        </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageAdmin',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ]
}
</script>
