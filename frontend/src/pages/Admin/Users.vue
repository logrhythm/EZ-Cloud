<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
      <q-card-section class="col">
        <div class="text-h4">User Accounts</div>
        🚧🚧 Placeholder 🚧🚧
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageAdminUsers',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
    }
  } // data
}
</script>
