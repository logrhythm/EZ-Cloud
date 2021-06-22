<template>
  <q-layout view="lHh lpR fFf">
    <q-drawer
      v-model="drawerMenuOpen"
      show-if-above

      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay

      :width="200"
      :breakpoint="500"
      bordered

      class="column"
    >
    <div class="yep fit column">
      <div
        class="col"
      >
        <q-scroll-area
          class="fit"
        >
          <q-list padding class="">
            <EssentialLink
              v-for="link in mainLinks"
              :key="link.title"
              v-bind="link"
            />
          </q-list>
        </q-scroll-area>
      </div>
      <q-list class="col-auto">
        <q-item v-if="!socket.connected">
          <q-tooltip content-style="font-size: 1rem;">
            Live connection with server has been lost.<br>
            Some features might not work anymore.
          </q-tooltip>
          <q-item-section
            avatar
          >
            <q-icon name="cloud_off" color="orange">
            </q-icon>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-orange">Disconnected</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-md" v-if="!socket.connected"/>
        <EssentialLink
          v-for="link in lowLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
      <div class="text-center">
        <span style="opacity:.4; font-size:.75em">v{{version}}</span>
      </div>
    </div>
  </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import { version } from '../../package.json'

export default {
  name: 'MainLayout',
  components: { EssentialLink },
  mixins: [
    mixinSharedSocket // Shared function and state to access the Socket.io
  ],
  data () {
    return {
      drawerMenuOpen: false,
      miniState: true,
      mainLinks: [
        {
          title: '',
          icon: 'home',
          link: '#/Welcome'
        },
        // {
        //   title: 'Status',
        //   icon: 'dashboard',
        //   link: '#/Status'
        // },
        {
          title: 'Open Collectors',
          icon: 'mediation',
          link: '#/OpenCollectors'
        },
        {
          title: 'Pipelines',
          icon: 'account_tree',
          link: '#/Pipelines'
        }
      ],
      lowLinks: [
        {
          title: 'Settings',
          icon: 'settings',
          link: '#/Settings'
        },
        {
          title: 'Log Out',
          icon: 'logout',
          link: '#/Logout'
        }
      ],
      version: version
    }
  }
}
</script>
