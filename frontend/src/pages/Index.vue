<template>
  <q-page class="column justify-around">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" :src="(darkMode ? 'logrhythm_logo_darkmode_wide.svg' : 'logrhythm_logo_lightmode_wide.svg')" alt="LogRhythm Open Collector">
      </q-toolbar>
    </q-header>
    <div class="flex flex-center">
      <div>
        <div class="text-h2" style="opacity:.4">
          OC Admin
        </div>
        <div class="text-h6 text-right" style="opacity:.3">
          <q-tooltip content-style="font-size: 1em">
            <span class="text-bold">{{ $t('OC Admin Client version:') }}</span> v{{version}}<br>
            <span class="text-bold">{{ $t('OC Admin Server version:') }}</span> v{{serverVersion}}
          </q-tooltip>
          v{{ version }}
        </div>
      </div>
    </div>
    <div class="row justify-around">
      <div class="column justify-around" style="max-width: 35rem;">
        <div>
          <div class="text-h6 q-pb-none">
            {{ $t('Start') }}
          </div>
          <div class=" q-pt-none">
            <q-list padding class="" v-if="commonTasks">
              <q-item
                v-for="(item, index) in commonTasks"
                :key="index"
                tag="a"
                :href="item.link"
                clickable
                class="text-primary"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" />
                </q-item-section>

                <q-item-section>{{ item.label }}</q-item-section>
              </q-item>
              <!-- {
                label: 'Manage OpenCollectors',
                icon: 'o_mediation',
                link: '#/OpenCollectors'
              } -->
            </q-list>
          </div>
        </div>
        <div>
          <div class="text-h6 q-pb-none">
            {{ $t('Recent') }}
          </div>
          <!-- {
            name: 'Event Hub - Custom Mapping',
            type: 'pipeline',
            uid: '7f698a00-b6de-4672-be34-249eb5873059',
            link: '#/Pipelines/7f698a00-b6de-4672-be34-249eb5873059/Properties',
            lastVisit: ''
          } -->
          <div class=" q-pt-none">
            <q-list padding class="" v-if="recentItems">
              <q-item
                v-for="(item, index) in recentItems"
                :key="index"
                tag="a"
                :href="item.link"
                clickable
                class="text-primary"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" />
                </q-item-section>

                <q-item-section>{{ item.label }}</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
      </div>
      <div class="column" style="width: 35rem;">
        <div>
          <div class="text-h6 q-pb-none">
            {{ $t('Latest') }}
          </div>
          <div class=" q-pt-none">
            <q-scroll-area style="height: 38rem;" visible >
              <q-list
                padding
                v-if="latestNews"
                class="q-gutter-y-sm"
              >
                <q-item
                  v-for="(item, index) in latestNews"
                  :key="index"
                  tag="a"
                  :href="item.link"
                  target="_blank"
                  clickable
                  class="q-py-none q-pr-none q-pl-sm q-mr-sm"
                >
                  <q-card
                    class="full-width full-height"
                  >
                    <q-card-section>
                      <q-badge
                        v-if="item.chip"
                        class="q-mr-sm"
                        :color="(item.chip.colour ? item.chip.colour : undefined)"
                        :label="(item.chip.label ? item.chip.label : undefined)"
                        floating
                      ></q-badge>
                      <q-item>
                        <q-item-section top avatar>
                          <q-icon :name="item.icon" />
                        </q-item-section>

                        <!-- <q-item-section>{{ item.title }}</q-item-section> -->
                        <q-item-section>
                          <q-item-label
                            :lines="2"
                            class="text-bold"
                          >{{ item.title }}</q-item-label>
                          <q-item-label>
                            <q-markdown
                              class="col"
                              :src="item.markdownBody"
                              no-heading-anchor-links
                            />
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-card-section>
                  </q-card>
                </q-item>
              </q-list>
            </q-scroll-area>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="needToConfigureMsSql" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="link_off" color="primary" text-color="white" />
          <div class="text-h6 q-ml-sm">{{ $t('No connection to the SIEM') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          {{ $t('The connection details to the SQL server on the SIEM are missing.') }}
        </q-card-section>

        <q-card-section class="q-pt-none q-mb-md">
          {{ $t('Go to the Admin page and fix it.') }}
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="$t('Close')" @click="promptIgnoreConfigureMsSql()" />
          <q-btn color="primary" :label="$t('Go to Admin')" to="Admin/SIEM/MsSql" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import { version } from '../../package.json'
import ConfirmDialog from '../components/Dialogs/ConfirmDialog.vue'

export default {
  name: 'PageIndex',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      version: version,
      hideNeedToConfigureMsSqlPopup: false,
      commonTasks: [ // List of the Common tasks
        {
          label: this.$t('Create, Edit and Manage my OpenCollectors...'),
          icon: 'o_mediation',
          link: '#/OpenCollectors'
        },
        {
          label: this.$t('Create, Edit and Manage my Pipelines...'),
          icon: 'o_account_tree',
          link: '#/Pipelines'
        },
        {
          label: this.$t('Check my Notifications...'),
          icon: 'o_mail_outline',
          link: '#/MarketPlace/Notifications'
        },
        {
          label: this.$t('Browse the Marketplace...'),
          icon: 'o_storefront',
          link: '#/MarketPlace/PipelineTemplates'
        }
      // ],
      // latestNews: [
      //   // {
      //   //   title: '',
      //   //   icon: '',
      //   //   markdownBody: '',
      //   //   link: '',
      //   //   chip: {
      //   //     label: '',
      //   //     colour: ''
      //   //   }
      //   // }
      //   {
      //     title: 'OC Admin v1.0 is out',
      //     icon: 'o_celebration',
      //     markdownBody: 'Click for more information.',
      //     link: 'https://docs.logrhythm.com/docs/OCbeats/logrhythm-open-collector/open-collector-installation-and-user-guide/initialize-the-oc-admin',
      //     chip: {
      //       label: 'Release',
      //       colour: 'primary'
      //     }
      //   },
      //   {
      //     title: 'Visit our Innovation Portal',
      //     icon: 'o_how_to_vote',
      //     markdownBody: 'Join other customers to review our new designs, vote on your favourites and help shape the LogRhythm products.',
      //     link: 'https://community.logrhythm.com/t5/Innovation-Portal/idb-p/InnovationPortal'
      //   }
      ]
    }
  },
  computed: {
    ...mapState('mainStore', ['deployment', 'extraInformation', 'latestNews']),
    serverVersion () {
      return (this.deployment && this.deployment.version ? this.deployment.version : '?.?.?')
    },
    needToConfigureMsSql () {
      return this.extraInformation && this.extraInformation.msSqlConnectionConfigMissing && !this.hideNeedToConfigureMsSqlPopup
    },
    recentItems () {
      // {
      //   name: 'Event Hub - Custom Mapping',
      //   type: 'pipeline',
      //   uid: '7f698a00-b6de-4672-be34-249eb5873059',
      //   link: '#/Pipelines/7f698a00-b6de-4672-be34-249eb5873059/Properties',
      //   lastVisit: 12345678
      // }
      let recentItemsStored = []
      try {
        recentItemsStored = JSON.parse(localStorage.getItem('landing.recentItems') || [])
      } catch (err) {
        //
      }

      return (
        recentItemsStored &&
        Array.isArray(recentItemsStored)
          ? recentItemsStored.map((recentItem) => (
            {
              label: recentItem.name || this.$t('No name'),
              icon: (recentItem.type === 'pipeline' ? 'o_account_tree' : 'o_description'),
              link: recentItem.link || (recentItem.type === 'pipeline' ? '#/Pipelines' : '#/Welcome'),
              lastVisit: recentItem.lastVisit || 0,
              type: recentItem.type || 'pipeline',
              uid: recentItem.uid || ''
            }
          ))
          : []
      )
        .sort((a, b) => a.lastVisit - b.lastVisit)
        .slice(-5)
    }
  },
  methods: {
    ...mapActions('mainStore', ['loadLatestNews']),
    promptIgnoreConfigureMsSql () {
      this.$q.dialog({
        component: ConfirmDialog,
        parent: this,
        title: this.$t('Confirm'),
        message: this.$t('A lot of things will NOT work until this is configred. Are you sure you want to ignore this for now?'),
        persistent: true
      }).onOk(() => {
        // Do nothing
      }).onCancel(() => {
        this.hideNeedToConfigureMsSqlPopup = true
      })
    }
  },
  mounted () {
    // Check for News feed from EZ Cloud Market, for the Landing Page
    // this.loadLatestNews()
  }
}
</script>
