<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" :label="$t('Return to Market Place')" :to="'/MarketPlace'" />
        <q-separator spaced vertical />
        <q-btn no-caps flat dense icon="mail_outline" color="primary" :label="$t('View Notifications')" to="/MarketPlace/Notifications" />
        <q-btn no-caps flat dense icon="account_tree" :label="$t('View Pipeline Templates')" to="/MarketPlace/PipelineTemplates" />
        <q-toolbar-title style="opacity:.4" class="text-center">{{ $t('EZ Market Place : My Profile') }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-card class="q-pa-none q-mx-none">
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                {{ $t('My Publisher Profile') }}
            </q-card-section>

            <q-card-section class="q-pt-none" v-if="!editingPublisherName">
              <div class="text-bold">{{ $t('Pseudo Name:') }}</div>
              <div v-if="publisherDisplayName == null" class="text-italic" style="opacity: .6">{{ $t('You don\'t seem to have a profile yet') }}</div>
              <div v-else>{{ publisherDisplayName }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none" v-if="editingPublisherName">
              <q-input
                dense
                v-model="newPublisherName"
                autofocus
                :label="$t('New Publisher Pseudo Name')"
                @keyup.esc="editingPublisherName = false"
                @keyup.enter="saveProfileDetails()"
                :rules="[val => !!val || $t('Publisher pseudo-name cannot be empty')]"
              />
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="text-bold">{{ $t('Identicon:') }}</div>
              <div class="row items-center q-gutter-x-md">
                <Identicon :identity="publisherDisplayName" />
                <q-icon name="o_arrow_forward" size="lg" v-if="editingPublisherName"/>
                <Identicon :identity="newPublisherName" v-if="editingPublisherName"/>
              </div>
            </q-card-section>

          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-pa-md">
              <q-btn icon="edit" :loading="dataLoading" color="primary" :disabled="editingPublisherName" @click="editProfileDetails()">
                <q-tooltip content-style="font-size: 1rem;" v-if="!editingPublisherName">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
              <q-btn icon="save" :loading="dataSaving" color="secondary" :disabled="!editingPublisherName" @click="saveProfileDetails()">
                <q-tooltip content-style="font-size: 1rem;" v-if="editingPublisherName">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
              <q-btn icon="refresh" :loading="dataLoading" @click="reloadEzMarketPublisherDetails({})">
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import Identicon from 'components/Publisher/Identicon.vue'

export default {
  name: 'PageMarketPublisherProfile',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  components: { Identicon },
  data () {
    return {
      dataLoading: false,
      dataSaving: false,
      editingPublisherName: false,
      newPublisherName: null
    }
  },
  computed: {
    ...mapState('mainStore', ['ezMarketNotification', 'ezMarketNotifications', 'ezMarketPublisherDetails']),
    publisherDisplayName () {
      return (this.ezMarketPublisherDetails ? this.ezMarketPublisherDetails.displayName : null)
    }
  }, // computed
  methods: {
    ...mapActions('mainStore', ['loadEzMarketPublisherDetails', 'createEzMarketPublisher', 'updateEzMarketPublisherDetails']),
    reloadEzMarketPublisherDetails () {
      this.dataLoading = true
      this.loadEzMarketPublisherDetails({
        onSuccessCallBack: this.ezMarketPublisherDetailsLoaded,
        onErrorCallBack: this.ezMarketPublisherDetailsLoaded
      })
    },
    ezMarketPublisherDetailsLoaded (payload) {
      this.dataLoading = false
      if (payload) {
        if (payload.data) {
          this.newPublisherName = payload.data.displayName
        }
        if (payload.success !== true) {
          this.$q.notify({
            type: 'negative',
            color: 'negative',
            icon: 'report_problem',
            message: this.$t('Error loading Publisher\'s details'),
            caption: payload.messageForLogAndPopup || ''
          })
        }
      }
    },
    editProfileDetails () {
      this.newPublisherName = this.publisherDisplayName
      this.editingPublisherName = true
    },
    saveProfileDetails () {
      this.editingPublisherName = false
      this.dataSaving = true
      if (this.publisherDisplayName == null) {
        this.createEzMarketPublisher({
          toName: this.newPublisherName,
          onSuccessCallBack: this.ezMarketPublisherDetailsSaved,
          onErrorCallBack: this.ezMarketPublisherDetailsSaved
        })
      } else {
        this.updateEzMarketPublisherDetails({
          toName: this.newPublisherName,
          onSuccessCallBack: this.ezMarketPublisherDetailsSaved,
          onErrorCallBack: this.ezMarketPublisherDetailsSaved
        })
      }
    },
    ezMarketPublisherDetailsSaved () {
      this.dataSaving = false
      this.reloadEzMarketPublisherDetails()
    }
  },
  mounted () {
    if (!(this.ezMarketPublisherDetails && this.ezMarketPublisherDetails.displayName != null)) {
      this.reloadEzMarketPublisherDetails({})
    }
  }
}
</script>
