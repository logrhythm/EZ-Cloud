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
      <q-avatar size="24px" class="q-pa-none" square >
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

    <q-item-section>
      <q-item-label :class="(isPageActive ? 'text-primary' : '')"><q-icon :name="(userIsLoggedIn ? 'lock_open' : 'lock')" size="1.5em" class="" left :color="(userIsLoggedIn ? 'secondary' : 'negative')" v-if="caption.length || !!needsPriviledge"/>{{ title }}</q-item-label>
      <q-item-label caption v-if="caption.length || !!needsPriviledge" class="text-italic">
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>

  <q-item
    v-else-if="spacer === true"
  >
  </q-item>

  <q-separator v-else-if="separator === true" class="q-my-xs" />
</template>

<script>
import { mapGetters } from 'vuex'

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

    notificationColor: {
      type: String,
      default: 'orange'
    },

    notificationTextColor: {
      type: String,
      default: 'white'
    },

    spacer: {
      type: Boolean,
      default: false
    },

    separator: {
      type: Boolean,
      default: false
    },

    needsPriviledge: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters('mainStore', ['userIsLoggedIn']),
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
