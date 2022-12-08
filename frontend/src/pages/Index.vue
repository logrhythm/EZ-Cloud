<template>
  <q-page class="column justify-around">
    <div class="row justify-around">
      <!-- <q-card>
        <q-card-section class="text-h6 q-pb-none">
          Common Actions
        </q-card-section>
        <q-card-section class="q-pt-none">
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
                <q-icon  :name="item.icon" />
              </q-item-section>

              <q-item-section >{{ item.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card> -->
      <div>
        <div class="text-h6 q-pb-none">
          Start
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
          Recent
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
    <div class="q-mx-xl">
      <q-card style="max-height: 15rem; min-height: 10rem;">
        <q-card-section class="text-h6 q-pb-none">
          Latest
        </q-card-section>
        <q-card-section>
          <q-scroll-area style="height: 10rem;">
            <q-list
              padding
              class=""
              v-if="newsItems"
              separator
            >
            <!-- {
              title: '',
              icon: '',
              markdownBody: '',
              link: '',
              chip: [
                {
                  label: '',
                  colour: ''
                }
              ]
            } -->
              <q-item
                v-for="(item, index) in newsItems"
                :key="index"
                tag="a"
                :href="item.link"
                target="_blank"
                clickable
              >
                <q-badge
                  v-if="item.chip"
                  class="q-mr-sm"
                  :color="(item.chip.colour ? item.chip.colour : undefined)"
                  :label="(item.chip.label ? item.chip.label : undefined)"
                  floating
                ></q-badge>

                <q-item-section top avatar>
                  <q-icon :name="item.icon" />
                </q-item-section>

                <!-- <q-item-section>{{ item.title }}</q-item-section> -->
                <q-item-section>
                  <q-item-label class="text-bold">{{ item.title }}</q-item-label>
                  <!-- <q-item-label>{{ item.markdownBody }}</q-item-label> -->
                  <q-item-label>
                    <q-markdown
                      class="col"
                      :src="item.markdownBody"
                      no-heading-anchor-links
                    />
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>
      </q-card>
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
import { mapState } from 'vuex'
import { version } from '../../package.json'
import ConfirmDialog from '../components/Dialogs/ConfirmDialog.vue'

export default {
  name: 'PageIndex',
  data () {
    return {
      version: version,
      hideNeedToConfigureMsSqlPopup: false,
      commonTasks: [ // List of the Common tasks
        {
          label: 'Create, Edit and Manage my OpenCollectors...',
          icon: 'o_mediation',
          link: '#/OpenCollectors'
        },
        {
          label: 'Create, Edit and Manage my Pipelines...',
          icon: 'o_account_tree',
          link: '#/Pipelines'
        },
        {
          label: 'Check my Notifications...',
          icon: 'o_mail_outline',
          link: '#/MarketPlace/Notifications'
        },
        {
          label: 'Browse the Marketplace...',
          icon: 'o_storefront',
          link: '#/MarketPlace/PipelineTemplates'
        }
      ],
      newsItems: [
        // {
        //   title: '',
        //   icon: '',
        //   markdownBody: '',
        //   link: '',
        //   chip: {
        //     label: '',
        //     colour: ''
        //   }
        // }
        {
          title: 'OC Admin v1.0 is out',
          icon: 'o_celebration',
          markdownBody: '',
          link: 'https://docs.logrhythm.com/docs/OCbeats/logrhythm-open-collector/open-collector-installation-and-user-guide/initialize-the-oc-admin',
          chip: {
            label: 'Release',
            colour: 'primary'
          }
        },
        {
          title: 'Inside Japan\'s most minimalist homes',
          icon: 'o_home',
          markdownBody: `*Close to nature and beautifully minimalist, the Zen-like interiors featured in a new book offer a glimpse inside the Japanese mindset.*

"The home – before it is a place of beauty – is a place for safety, and assessed according to its alignment with its natural surroundings," says Mihoko Iida, whose new book Japanese Interiors takes a look inside some of Japan's most interesting private homes. From urban apartments to mountain and seaside escapes, the spaces featured in the book all share this idea of what home interiors mean in Japan, and how they are informed by a sense of harmony and balance with their surrounding environment.

![Houses are beautiful!](https://ychef.files.bbci.co.uk/180x180/p0d1g72g.jpg "Houses are beautiful!")

At Lotus House there is a floating staircase on the rear wall, and the living room overlooks the lotus pond. As the architect Kuma puts it: "The lightness of the stone is an expression of the gentle lotus petals." According to Iida, the term 'interiors' is defined rather differently in Japan. "When Japanese people talk about interiors, it's more about where the sunlight enters a room, how the wind travels through the entrance," she explains. "Or creating a space to withstand the natural elements in the mountains or along the coast."
`,
          link: 'https://www.bbc.com/culture/article/20221206-japans-most-zen-like-minimalist-interiors'
        }
      ]
    }
  },
  computed: {
    ...mapState('mainStore', ['deployment', 'extraInformation']),
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
              label: recentItem.name || 'No name',
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
  }
}
</script>
