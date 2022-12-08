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
      <q-card>
        <q-card-section class="text-h5">
          News
        </q-card-section>
        <q-card-section>
          ...
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
      // recentItemsStored: [
      //   {
      //     name: 'Event Hub - Custom Mapping',
      //     type: 'pipeline',
      //     uid: '7f698a00-b6de-4672-be34-249eb5873059',
      //     link: '#/Pipelines/7f698a00-b6de-4672-be34-249eb5873059/Properties',
      //     lastVisit: ''
      //   },
      //   {
      //     name: 'fix @ me',
      //     type: 'pipeline',
      //     uid: 'dbb77ea6-a9c3-4718-a62f-7048e0f33932',
      //     link: '#/Pipelines/dbb77ea6-a9c3-4718-a62f-7048e0f33932/Properties',
      //     lastVisit: ''
      // },
      // {
      //   name: '',
      //   type: '',
      //   uid: '',
      //   link: '#/Pipelines//Properties',
      //   lastVisit: ''
      // }
      // ],
      newsItems: [
        {
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
