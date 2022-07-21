<template>
  <q-layout view="lHh lpR fFf">
    <q-drawer
      v-model="drawerMenuOpen"
      show-if-above

      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay

      :width="300"
      :breakpoint="500"
      bordered

      class="column"
    >
    <div class="fit column">
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

        <q-item v-if="needToConfigureMsSql">
          <q-tooltip content-style="font-size: 1rem;">
            {{ $t('The connection details to the SQL server on the SIEM are missing.') }}<br>
            {{ $t('A lot of things will not work until this is configred.') }}
          </q-tooltip>
          <q-item-section
            side
          >
            <q-avatar size="24px" class="q-pa-none" square>
              <q-icon name="link_off" size="sm" color="orange" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-orange">{{ $t('SIEM Not Connected') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-xs" v-if="needToConfigureMsSql"/>

        <q-item v-if="!socket.connected">
          <q-tooltip content-style="font-size: 1rem;">
            {{ $t('Live connection with server has been lost.') }}<br>
            {{ $t('Some features might not work anymore.') }}
          </q-tooltip>
          <q-item-section
            side
          >
            <q-avatar size="24px" class="q-pa-none" square>
              <q-icon name="cloud_off" size="sm" color="orange" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-orange">{{ $t('Disconnected') }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-xs" v-if="!socket.connected"/>

        <EssentialLink
          v-for="(link, index) in lowLinks"
          :key="index"
          v-bind="link"
          v-show="!link.needsPriviledge || (link.needsPriviledge && loggedInUserIsPrivileged)"
        />
      </q-list>
      <div class="text-center">
        <q-tooltip content-style="font-size: 1em">
          <span class="text-bold">{{ $t('OC Admin Client version:') }}</span> v{{version}}<br>
          <span class="text-bold">{{ $t('OC Admin Server version:') }}</span> v{{serverVersion}}
        </q-tooltip>
        <span style="opacity:.4; font-size:.75em">v{{version}}</span>
      </div>
    </div>
  </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Error messages display. Responds to "addAndShowErrorToErrorPanel" events -->

    <q-dialog v-model="showErrorPanel" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="q-pb-none">
          <div class="text-h6">{{ $t('What did just go wrong?') }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none" v-if="errorPanelDetails && Array.isArray(errorPanelDetails)">
          <div class="text-bold text-italic">{{ $tc('| {count} error occured. | {count} errors occured.', errorPanelDetails.length) }}</div>
        </q-card-section>

        <q-card-section class="" v-for="(detail, index) in errorPanelDetails" :key="index">
          <div class="">
              <div class="row q-my-sm">
                <q-separator vertical size="2px" color="orange" />
                <div class="q-ml-sm">
                  <div class="text-overline">{{ $t('Message Code:') }}</div>
                  <div class="q-ml-sm text-bold">{{ detail.code }}</div>
                  <div class="q-mt-sm text-overline">{{ $t('Message:') }}</div>
                  <div class="q-ml-sm text-italic">{{ detail.message }}</div>
                  <div class="q-mt-sm text-overline">{{ $t('More information available at:') }}</div>
                  <div class="q-ml-sm"><a :href="detail.wikiLink" target="_blank" class="text-primary">{{ detail.wikiLink }}</a></div>
                </div>
              </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn color="primary" text-color="white" :label="$t('Close')" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { mapState } from 'vuex'
import EssentialLink from 'components/EssentialLink.vue'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import { version } from '../../package.json'
import { date } from 'quasar'

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
      // mainLinks: [
      //   {
      //     title: '',
      //     icon: 'home',
      //     link: '#/Welcome'
      //   },
      //   // {
      //   //   title: 'Status',
      //   //   icon: 'dashboard',
      //   //   link: '#/Status'
      //   // },
      //   {
      //     title: this.$t('OpenCollectors'),
      //     icon: 'mediation',
      //     link: '#/OpenCollectors'
      //   },
      //   {
      //     title: this.$t('Pipelines'),
      //     icon: 'account_tree',
      //     link: '#/Pipelines'
      //   }
      // ],
      // lowLinks: [
      //   {
      //     title: this.$t('EZ Market Place'),
      //     icon: 'storefront',
      //     link: '#/MarketPlace',
      //     id: 'ezMarketPlace',
      //     notification: 5,
      //     notificationColor: 'green',
      //     notificationTextColor: 'white',
      //     subMenus: [
      //       {
      //         title: this.$t('Notifications'),
      //         icon: 'mail_outline',
      //         link: '#/MarketPlace/Notifications'
      //       },
      //       {
      //         title: this.$t('Pipeline Templates'),
      //         icon: 'account_tree',
      //         link: '#/MarketPlace/PipelineTemplates'
      //       },
      //       {
      //         title: this.$t('My Profile'),
      //         icon: 'person',
      //         link: '#/MarketPlace/PublisherProfile'
      //       }
      //     ]
      //   },
      //   {
      //     separator: true
      //   },
      //   {
      //     title: this.$t('Admin'),
      //     icon: 'admin_panel_settings',
      //     link: '#/Admin',
      //     needsPriviledge: true,
      //     id: 'admin',
      //     notification: null,
      //     notificationColor: 'negative',
      //     notificationTextColor: 'white'
      //   },
      //   {
      //     title: this.$t('Settings'),
      //     icon: 'settings',
      //     link: '#/Settings'
      //   },
      //   {
      //     separator: true
      //   },
      //   {
      //     title: this.$t('Log Out'),
      //     icon: 'logout',
      //     link: '#/Logout'
      //   }
      // ],
      version: version,
      showErrorPanel: false,
      errorPanelDetails: []
    }
  },
  computed: {
    ...mapState('mainStore', ['loggedInUser', 'loggedInUserIsPrivileged', 'errorWikiUrlBase', 'ezMarketNotification', 'deployment', 'extraInformation']),
    serverVersion () {
      return (this.deployment && this.deployment.version ? this.deployment.version : '?.?.?')
    },
    needToConfigureMsSql () {
      return this.extraInformation && this.extraInformation.msSqlConnectionConfigMissing
    },
    mainLinks () {
      return [
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
          title: this.$t('OpenCollectors'),
          icon: 'mediation',
          link: '#/OpenCollectors'
        },
        {
          title: this.$t('Pipelines'),
          icon: 'account_tree',
          link: '#/Pipelines'
        }
      ]
    },
    lowLinks () {
      return [
        {
          title: this.$t('EZ Market Place'),
          icon: 'storefront',
          link: '#/MarketPlace',
          id: 'ezMarketPlace',
          notification: 5,
          notificationColor: 'green',
          notificationTextColor: 'white',
          subMenus: [
            {
              title: this.$t('Notifications'),
              icon: 'mail_outline',
              link: '#/MarketPlace/Notifications'
            },
            {
              title: this.$t('Pipeline Templates'),
              icon: 'account_tree',
              link: '#/MarketPlace/PipelineTemplates'
            },
            {
              title: this.$t('My Profile'),
              icon: 'person',
              link: '#/MarketPlace/PublisherProfile'
            }
          ]
        },
        {
          separator: true
        },
        {
          title: this.$t('Admin'),
          icon: 'admin_panel_settings',
          link: '#/Admin',
          needsPriviledge: true,
          id: 'admin',
          notification: null,
          notificationColor: 'negative',
          notificationTextColor: 'white'
        },
        {
          title: this.$t('Settings'),
          icon: 'settings',
          link: '#/Settings'
        },
        {
          separator: true
        },
        {
          title: this.$t('Log Out'),
          icon: 'logout',
          link: '#/Logout'
        }
      ]
    }
  },
  methods: {
    sanitiseWikiLinks (rawLinkRef) {
      // We are using GitHub Wiki to host the error explaination page
      // And the links needs to be cleaned out of any non alpha-numerical characters
      //
      // For example:
      //   --THIS--
      // Fancy Code 1!2"3£4$5%6^7&8*9(0)1-2_3=4+5[6{7]8}9'0@1#2~3/4?5.6>7,8<9\0|1`2¬3€4¦5 6
      //   --BECOMES--
      // fancy-code-12345678901-2_34567890123456789012345-6
      //
      // So the rule seems to be:
      // - all lower case
      // - replace each space with a dash
      // - keep only:
      // -- alpha-numerical characters
      // -- dashes
      // -- underscores
      try {
        return String(rawLinkRef)
          .toLowerCase()
          .replace(/[^a-zA-Z0-9_-]/g, '') // Strip non alpha-num chars, non dashes and non underscores
          .replace(/ /g, '-') // Spaces into dashes
      } catch (error) {
        return null
      }
    },
    prepareAndShowErrorPanel (payload) {
      console.log('prepareAndShowErrorPanel', payload)
      // Let me clear my throat...
      this.errorPanelDetails = []

      if (
        payload &&
        payload.data &&
        payload.data.errors &&
        Array.isArray(payload.data.errors) &&
        payload.data.errors.length
      ) {
        payload.data.errors.forEach(error => {
          const timestamp = Date.now()
          this.errorPanelDetails.push(
            {
              timestamp: timestamp,
              timestampIso: date.formatDate(timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
              code: (
                error && error.number != null
                  ? error.number
                  : error.code
              ) || 'N/A',

              message: (
                error && error.message
                  ? error.message
                  : 'Unknown error. See Console.'
              ),

              wikiLink: (
                error && error.message
                  ? (
                      error && error.number != null
                        ? this.errorWikiUrlBase + this.sanitiseWikiLinks(error.number)
                        : this.errorWikiUrlBase + this.sanitiseWikiLinks(error.code)
                    )
                  // No error message. Direct to Unknown article:
                  : this.errorWikiUrlBase + 'unknown-error-see-console'
              )
            }
          )
        })
        // data:
        // {
        //     "stillChecking": false,
        //     "errors": [
        //         {
        //             "message": "User Login already exists. EZ Server only uses new User Login.",
        //             "code": "EREQUEST",
        //             "number": 51001,
        //             "state": 1,
        //             "class": 16,
        //             "serverName": "LRVM6",
        //             "procName": "upsert_RBAC_User",
        //             "lineNumber": 67
        //         }
        //     ],
        //     "outputs": [],
        //     "payload": []
        // }
      } else {
        const timestamp = Date.now()
        this.errorPanelDetails.push(
          {
            timestamp: timestamp,
            timestampIso: date.formatDate(timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ'),
            code: (
              payload &&
              payload.code
                ? payload.code
                : 'N/A'
            ),
            message: (
              payload &&
              payload.messageForLogAndPopup
                ? payload.messageForLogAndPopup
                : (
                    payload &&
                    payload.captionForLogAndPopup
                      ? payload.captionForLogAndPopup
                      : 'Unknown error. See Console.'
                  )
            ),
            wikiLink: (
              payload &&
              payload.code
                ? this.errorWikiUrlBase + payload.code
                : (
                    payload &&
                    payload.messageForLogAndPopup
                      ? null
                      : (
                          payload &&
                          payload.captionForLogAndPopup
                            ? null
                            : this.errorWikiUrlBase + 'unknown-error-see-console'
                        )
                  )
            )
          }
        )
      }

      this.showErrorPanel = true
      this.errorPanelDetails.forEach(error => {
        console.log('📜 [LOG] |', error.timestampIso, '| Code:', error.code, '| Message:', error.message, '| WikiLink:', error.wikiLink)
      })
    },
    updateEzMarketNotificationNumber (payload) {
      const ezMarketPlaceLink = this.lowLinks.find((link) => link.id === 'ezMarketPlace')
      if (ezMarketPlaceLink) {
        ezMarketPlaceLink.notification = payload
      }
    },
    updateAdminNotificationNumber (payload) {
      const adminLink = this.lowLinks.find((link) => link.id === 'admin')
      if (adminLink) {
        adminLink.notification = payload
      }
    }
  },
  watch: {
    ezMarketNotification: {
      handler (newValue) {
        this.updateEzMarketNotificationNumber(newValue)
      },
      immediate: true
    },
    extraInformation: {
      handler (newValue) {
        this.updateAdminNotificationNumber(this.extraInformation && this.extraInformation.msSqlConnectionConfigMissing === true ? 1 : null)
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    this.$root.$on('addAndShowErrorToErrorPanel', this.prepareAndShowErrorPanel)
  },
  beforeDestroy () {
    this.$root.$off('addAndShowErrorToErrorPanel')
  }
}
</script>
