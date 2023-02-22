<template>
  <div class=""
    v-if="pageTitle && pageTitle.length || crumbs && crumbs.length"
  >
    <q-breadcrumbs
      v-if="crumbs && crumbs.length"
      class="q-mb-md"
      active-color="textForPrimaryButton"
    >
      <q-breadcrumbs-el
        v-for="(crumb, index) in crumbs"
        v-bind:key="index"
        :label="crumb.title"
        :to="crumb.link"
        :icon="crumb.icon || undefined"
        :disable="crumb.disabled"
      />
    </q-breadcrumbs>
    <div
      v-if="pageTitle && pageTitle.length"
      class="text-h5 q-mb-md"
    >{{ pageTitle }}</div>
  </div>
</template>

<script>
export default {
  name: 'BreadCrumbs',
  props: {
    crumbs: {
      type: Array,
      default: null
    },
    pageTitle: {
      type: String,
      default: null
      // default: 'Mapping Builder: Palo Alto - NG Firewall'
    }
  },
  data () {
    return {
      xcrumbs: [],
      cxxrumbs: [
        {
          title: 'Pipelines',
          icon: null,
          link: '/Pipelines',
          disabled: false
        },
        {
          title: 'Palo Alto - NG Firewall',
          icon: null,
          link: '/Pipelines/81f53047-ab0e-4ef9-a421-52724532ae92/Properties',
          disabled: true
        },
        {
          title: 'Properties',
          icon: null,
          link: '/Pipelines/81f53047-ab0e-4ef9-a421-52724532ae92/Properties',
          disabled: false
        },
        {
          title: 'Mapping Builder',
          icon: null,
          link: '',
          disabled: false
        }
      ]
    }
  },
  computed: {
    isPageActive () {
      if (this.$route.path && this.$route.path.length) {
        const cleanLink = this.link.replace('#/', '/')
        return this.$route.path.startsWith(cleanLink, 0)
      } else {
        return false
      }
    }
  }
}
</script>
