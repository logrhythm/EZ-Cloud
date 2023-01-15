<template>
  <q-page class="flex flex-center">
    <div>
      <div class="text-h2 text-center" style="opacity:.4">
        EZ Cloud Market Place Admin
      </div>
      <div class="text-h6 text-right" style="opacity:.3">
        v{{ version }}
      </div>
      <div
        class="text-center q-mt-xl"
        v-if="loggedInUser && loggedInUser.length"
      >
        <div class="text-h4">
          Welcome back {{ loggedInUser }}
        </div>
        <!--
        <div
          class="q-mt-md"
          v-if="!loggedInUserIsPrivileged"
        >
          You are logged in, but not privileged enough to access the Admin pages.
        </div>
         -->
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex'
import packageDetails from '../../package.json'
const version = packageDetails.version

export default {
  name: 'PageIndex',
  data () {
    return {
      version: version
    }
  },
  computed: {
    ...mapState('mainStore', ['loggedInUser'])
  }
}
</script>
