<template>
  <q-page class="q-pa-sm">
    <q-header bordered :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <img class="q-mr-md" src="logrhythm_logo_wide.svg" alt="LogRhythm Open Collector">
        <q-btn v-if="isLiveStatisticsRunning" flat no-caps color="secondary" icon="stop" :label="$t('Stop Live Statistics')" @click="stopLiveStatisitics()" />
        <q-btn v-else flat no-caps color="primary" icon="play_circle_outline" :label="$t('Start Live Statistics')" @click="startLiveStatisitics()" />
      </q-toolbar>
    </q-header>
    <BreadCrumbs
      :crumbs="breadCrumbs"
    />
    <div class=" q-gutter-y-sm">
      <q-card>
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                {{ $t('Running Containers') }}
            </q-card-section>
            <q-card-section>
              <div class="">
                <pre>{{ containersList }}</pre>
              </div>
            </q-card-section>
            <q-card-section>
              <div class="text-bold">
                opened openCollector:
              </div>
              <pre>{{ openCollector }}</pre>
            </q-card-section>
          </q-card-section>

          <!-- <q-card-actions vertical class="justify-start">
              <q-btn icon="more_horiz" flat >
                <q-menu anchor="bottom right" self="top right">
                  <q-item clickable v-close-popup :to="'/Pipelines/' + this.pipelineUid + '/Collection/Edit'">
                    <q-item-section avatar>
                      <q-icon name="o_edit" />
                    </q-item-section>
                    <q-item-section>{{ $t('Edit Collection') }}</q-item-section>
                  </q-item>
                </q-menu>
              </q-btn>
          </q-card-actions> -->
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import mixinSharedLoadCollectorsAndPipelines from 'src/mixins/mixin-Shared-LoadCollectorsAndPipelines'
import BreadCrumbs from 'components/BreadCrumbs.vue'

export default {
  name: 'PageOpenCollectorManage',
  mixins: [
    mixinSharedDarkMode, // Shared computed to access and update the DarkMode
    mixinSharedLoadCollectorsAndPipelines // Shared functions to load the Collectors and Pipelines
  ],
  components: { BreadCrumbs },
  data () {
    return {
      openCollectorUid: '',
      isLiveStatisticsRunning: false,
      containersList: []
    }
  },
  computed: {
    breadCrumbs () {
      return [
        {
          icon: 'o_home',
          link: '/Welcome'
        },
        {
          title: this.$t('OpenCollectors'),
          link: '/OpenCollectors'
        },
        {
          title: (this.openCollector && this.openCollector.name && this.openCollector.name.length ? this.openCollector.name : this.openCollectorUid)
        },
        {
          title: this.$t('Manage')
        }
      ]
    },
    openCollector () {
      const openCollector = this.openCollectors.find(p => p.uid === this.openCollectorUid)
      return (openCollector || {
        uid: '',
        name: '',
        hostname: '',
        port: null,
        authenticationMethod: '',
        username: '',
        password: '',
        privateKey: '',
        osVersion: '',
        dockerVersion: '',
        ocInstalled: false,
        ocVersion: '',
        installedShippers: [],
        pipelines: []
      })
    }
  },
  methods: {
    startLiveStatisitics () {
      this.isLiveStatisticsRunning = true
    },
    stopLiveStatisitics () {
      this.isLiveStatisticsRunning = false
    }
  },
  mounted () {
    if (this.$route.params.openCollectorUid && this.$route.params.openCollectorUid.length) {
      if (this.openCollectorUid !== this.$route.params.openCollectorUid) {
        this.openCollectorUid = this.$route.params.openCollectorUid
      }

      // Record the page in Recent Items
      this.updateRecentItems()
    }
  }
}
</script>

<style>

</style>
