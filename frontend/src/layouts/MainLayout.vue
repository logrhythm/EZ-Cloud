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
    >
    <q-scroll-area class="fit">
      <q-list padding class="">
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        <q-separator class="q-my-md"/>
        <EssentialLink
          v-bind="logOut"
        />
        <q-separator class="q-my-md" v-if="!socket.connected"/>
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
        <q-item>
          <q-item-section
            avatar
          >
            <span style="opacity:.4">v{{version}}</span>
            <!-- <span style="opacity:.4">v0.5-rc1</span> -->
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
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
      essentialLinks: [
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
        },
        {
          title: 'Settings',
          icon: 'settings',
          link: '#/Settings'
        }
      ],
      logOut: {
        title: 'Log Out',
        icon: 'logout',
        link: '#/Logout'
      },
      version: version
    }
  }
}
</script>
