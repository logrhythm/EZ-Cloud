<template>
  <q-item
    clickable
    tag="a"
    :href="link"
    v-if="title !== null"
  >
    <q-item-section
      v-if="icon"
      side
    >
      <q-avatar size="24px" text-color="white" class="q-pa-none">
        <q-icon :name="icon" size="sm" :color="(isPageActive ? 'primary' : '')" />
        <q-badge
          v-if="notification !== null"
          floating
          color="orange"
          :label="notification"
        />
      </q-avatar>
    </q-item-section>

    <q-item-section>
      <q-item-label :class="(isPageActive ? 'text-primary' : '')">{{ title }}</q-item-label>
      <!-- <q-item-label caption>
        {{ caption }}
      </q-item-label> -->
    </q-item-section>
  </q-item>

  <q-item
    v-else-if="spacer === true"
  >
  </q-item>

  <q-separator v-else-if="separator === true" class="q-my-xs" />
</template>

<script>
export default {
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      // required: true,
      default: null
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
    },

    notification: {
      // type: can be a String or a Number
      type: [String, Number],
      default: null
    },

    spacer: {
      type: Boolean,
      default: false
    },

    separator: {
      type: Boolean,
      default: false
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
