<template>
  <q-item
    clickable
    tag="a"
    :href="link"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" :color="(isPageActive ? 'primary' : '')" />
    </q-item-section>

    <q-item-section>
      <q-item-label :class="(isPageActive ? 'text-primary' : '')">{{ title }}</q-item-label>
      <!-- <q-item-label caption>
        {{ caption }}
      </q-item-label> -->
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
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
