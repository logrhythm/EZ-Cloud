<template>
  <q-item
    clickable
    :tag="(subMenus && subMenus.length ? undefined : 'a')"
    :href="(subMenus && subMenus.length ? undefined : link)"
    v-if="title !== null || tooltip !== null"
  >
    <q-tooltip content-style="font-size: 1rem;" v-if="tooltip !== null">
      {{ tooltip }}
    </q-tooltip>
    <q-item-section
      v-if="icon"
      :side="!!(title && title.length)"
    >
      <q-avatar size="24px" class="q-pa-none" square>
        <q-icon :name="icon" size="sm" :color="(isPageActive ? 'primary' : '')" />
        <q-badge
          v-if="notification !== null"
          floating
          rounded
          :color="notificationColor"
          :text-color="notificationTextColor"
          :label="notification"
        />
      </q-avatar>
    </q-item-section>

    <q-item-section v-if="title && title.length">
      <q-item-label :class="(isPageActive ? 'text-primary' : '')">{{ title }}</q-item-label>
    </q-item-section>

    <q-menu auto-close anchor="center start" self="center start" v-if="subMenus && subMenus.length">
      <q-list padding class="">
        <EssentialLink
          v-for="(subMenu, index) in subMenus"
          :key="index"
          v-bind="subMenu"
        />
      </q-list>
    </q-menu>
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

    tooltip: {
      type: String,
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

    notificationColor: {
      type: String,
      default: 'orange'
    },

    notificationTextColor: {
      type: String,
      default: 'white'
    },

    subMenus: {
      type: Array,
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
