<template>
  <q-layout view="hHh lpR fFf">
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
      ]
    }
  }
}
</script>
