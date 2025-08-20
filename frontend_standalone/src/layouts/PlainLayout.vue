<template>
  <q-layout view="hHh lpR fFf">

<q-page-container style="background: var(--q-color-dark); color: var(--q-color-text, #fff);">
  <router-view />
</q-page-container>

  </q-layout>
</template>

<script>

export default {
  name: 'plainLayout',
  data () {
    return {
      //
    }
  }
}
</script>
