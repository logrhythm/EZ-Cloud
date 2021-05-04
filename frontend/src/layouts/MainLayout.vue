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

export default {
  name: 'MainLayout',
  components: { EssentialLink },
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
        {
          title: 'Status',
          icon: 'dashboard',
          link: '#/Status'
        },
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
      socket: this.$socket
    }
  }
}
</script>
