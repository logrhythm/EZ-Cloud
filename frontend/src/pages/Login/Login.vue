<template>
  <q-page class="flex flex-center">
    <form>
      <q-card style="min-width: 350px" :class="(shakyClass ? 'computerSaysNo' : '')">
        <q-card-section>
          <div class="text-h6">{{ $t('Sign in to OC Admin') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="username"
            autofocus
            :hint="$t('Username')"
            :rules="[val => !!val || $t('Username is required')]"
            @keyup.enter="checkCredentials()"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="password" type="password" :hint="$t('Password')" @keyup.enter="checkCredentials()" />
        </q-card-section>

        <q-card-section class="q-py-none">
          <dir class="q-ma-none q-px-sm text-bold text-negative text-center fadeOut">
            <span v-show="lastAttemptFailed">{{ $t('Authentication failed.') }}</span>&nbsp;
          </dir>
        </q-card-section>

        <q-card-actions align="between">
          <q-toggle
            v-model="darkMode"
            checked-icon="dark_mode"
            unchecked-icon="light_mode"
            color="grey"
            keep-color
            class="q-my-sm"
          >
            <q-tooltip content-style="font-size: 1em">
              {{ $t('Switch between Light and Dark mode') }}
            </q-tooltip>
          </q-toggle>

          <q-btn flat icon="translate">
            <q-tooltip content-style="font-size: 1em">
              {{ $t('Change language') }}
            </q-tooltip>
            <q-menu auto-close anchor="bottom middle" self="top middle">
              <q-list style="min-width: 10em">
                <q-item
                  class="text-center"
                  :clickable="!language.selected"
                  v-for="language in languageList"
                  :key="language.value"
                  @click="selectLanguage(language.value)"
                >
                  <q-item-section :class="(language.selected ? 'text-primary' : '')">
                    <div>{{ language.nativeLabel }}</div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn flat class="q-my-sm" :label="$t('Login')" color="primary" @click="checkCredentials()" :loading="waitingOnServer" :disable="!canWeLogin" />
        </q-card-actions>

      </q-card>
    </form>

    <q-page-sticky position="bottom" :offset="[18, 18]">
      <q-fab
        icon="keyboard_arrow_up"
        direction="up"
        square
        color="blue-grey-7"
        @click="morphGroupModel = 'full'"
      >
        <template v-slot:label="{ opened }">
          <div :class="{ 'example-fab-animate--hover': opened !== true }">
            <q-badge color="warning" text-color="black" floating v-if="statusWarnings && !statusProblems">{{ statusWarnings }}</q-badge>
            <q-badge color="negative" floating v-if="statusProblems">{{ statusProblems }}</q-badge>
            {{ opened !== true ? $t('Statuses') : $t('Close') }}
            <q-linear-progress :indeterminate="loadingPersistenceLayerAvailability && delayUntilCheck < 0" :value="delayUntilCheck" color="white" size="1px" v-if="loadingPersistenceLayerAvailability || delayUntilCheck > 0" />
          </div>
        </template>
        <q-card
          dense
          style="min-width: 40rem"
        >

          <q-card-section horizontal>
            <q-card-section class="column items-center no-wrap q-gutter-y-sm justify-center q-px-lg">
              <q-icon name="traffic" size="xl" />
              <div class="text-bold">{{ $t('Statuses') }}</div>
            </q-card-section>

            <q-separator vertical/>

            <q-card-section class="full-width row items-center no-wrap justify-evenly">
              <div class="column items-center">
                <div class="text-bold">{{ $t('OC-Admin Container') }}</div>
                <q-icon name="extension" size="xl" color="positive" v-if="ocAdminState === true"/>
                <q-icon name="extension_off" size="xl" color="warning" v-else-if="ocAdminState === false"/>
                <q-icon name="extension" size="xl" color="grey" v-else/>
                <div v-if="ocAdminState === true">{{ $t('Reachable') }}</div>
                <div v-else-if="ocAdminState === false">{{ $t('Unreachable') }}</div>
                <div v-else>{{ $t('Unknown') }}</div>
              </div>

              <div class="column items-center">
                <div class="text-bold">{{ $t('OC-DB Container') }}</div>
                <q-icon name="extension" size="xl" color="positive" v-if="pgSqlState === true"/>
                <q-icon name="extension_off" size="xl" color="warning" v-else-if="pgSqlState === false"/>
                <q-icon name="extension" size="xl" color="grey" v-else/>
                <div v-if="pgSqlState === true">{{ $t('Reachable') }}</div>
                <div v-else-if="pgSqlState === false">{{ $t('Unreachable') }}</div>
                <div v-else>{{ $t('Unknown') }}</div>
              </div>

              <div class="column items-center">
                <div class="text-bold">{{ $t('Platform Manager') }}</div>
                <q-icon name="cloud" size="xl" color="positive" v-if="msSqlState === true"/>
                <q-icon name="cloud_off" size="xl" color="warning" v-else-if="msSqlState === false"/>
                <q-icon name="cloud" size="xl" color="grey" v-else/>
                <div v-if="msSqlState === true">{{ $t('Reachable') }}</div>
                <div v-else-if="msSqlState === false">{{ $t('Unreachable') }}</div>
                <div v-else>{{ $t('Unknown') }}</div>
              </div>
            </q-card-section>
          </q-card-section>
        </q-card>
      </q-fab>

    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedSocket from 'src/mixins/mixin-Shared-Socket'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import { languageOptions, switchLanguageTo } from 'src/i18n/shared'

export default {
  name: 'PageLogin',
  mixins: [
    mixinSharedSocket, // Shared function and state to access the Socket.io
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      username: '',
      password: '',
      waitingOnServer: false,
      lastAttemptFailed: false,
      shakyClass: false,
      lastAttemptFailedTimer: null,
      shakyClassTime: null,
      ocAdminState: null, // State of OC Admin. Null = status unknown, True = OC Admin is up and responding, False = OC Admin not responding
      loadingPersistenceLayerAvailability: true, // Are we waiting for the API for Persistence Layer Availability
      delayUntilCheck: 0, // How long until we check next API for Persistence Layer Availability
      persistenceLayerAvailabilityCheckTimer: null
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['jwtToken', 'currentPersistenceLayerAvailability']),
    languageList () {
      if (languageOptions && Array.isArray(languageOptions)) {
        return languageOptions.reduce(
          (accumulatedLanguages, language) => {
            accumulatedLanguages.push(
              {
                ...language,
                selected: !!(String(language.value).toLowerCase() === String(this.$i18n.locale).toLowerCase())
              }
            )
            return accumulatedLanguages
          },
          []
        )
      }
      return [{ value: 'en-gb', nativeLabel: 'English' }]
    },
    pgSqlState () {
      return this.currentPersistenceLayerAvailability.pgSqlAvailable
    },
    msSqlState () {
      return this.currentPersistenceLayerAvailability.msSqlAvailable
    },
    statusWarnings () {
      return Number(this.ocAdminState === null) + Number(this.pgSqlState === null) + Number(this.msSqlState === null)
    },
    statusProblems () {
      return Number(this.ocAdminState === false) + Number(this.pgSqlState === false) + Number(this.msSqlState === false)
    },
    canWeLogin () {
      return this.pgSqlState === true ||
        (this.pgSqlState === null && this.msSqlState === true)
    }
  }, // computed
  methods: {
    ...mapActions('mainStore', ['signIn', 'signOut', 'reloadEzMarketNotifications', 'getPersistenceLayerAvailability']),
    checkCredentials () {
      if (this.lastAttemptFailedTimer) {
        clearTimeout(this.lastAttemptFailedTimer)
      }
      if (this.shakyClassTime) {
        clearTimeout(this.shakyClassTime)
      }
      this.shakyClass = false
      this.lastAttemptFailed = false
      this.signIn({
        loadingVariableName: 'waitingOnServer',
        caller: this,
        apiCallParams: {
          username: this.username,
          password: this.password
        },
        onSuccessCallBack: this.checkTokenAndMoveOn,
        onErrorCallBack: this.checkTokenAndMoveOn,
        debug: false
      })
    },
    checkTokenAndMoveOn () {
      if (this.jwtToken && this.jwtToken.length) {
        // Connect Socket.io
        this.connectSocket()
        // Check for Notifications on EZ Cloud Market
        this.reloadEzMarketNotifications()
        // And move to Welcome page
        this.$router.push('/Welcome')
      } else {
        this.lastAttemptFailed = true
        this.shakyClass = true
        this.shakyClassTimer = setTimeout(() => {
          this.shakyClass = false
        }, 1000)
        this.lastAttemptFailedTimer = setTimeout(() => {
          this.lastAttemptFailed = false
        }, 4800)
      }
    },
    selectLanguage (selectedLanguage) {
      switchLanguageTo(this, selectedLanguage)
    },
    checkPersistenceLayerAvailability () {
      // Get the status of the Databases
      this.getPersistenceLayerAvailability(
        {
          onSuccessCallBack: this.onPersistenceLayerAvailabilitySuccess,
          onErrorCallBack: this.onPersistenceLayerAvailabilityError
        }
      )
    },
    onPersistenceLayerAvailabilitySuccess () {
      this.ocAdminState = true
      this.loadingPersistenceLayerAvailability = false
      this.scheduleNewCheck()
    },
    onPersistenceLayerAvailabilityError () {
      this.ocAdminState = false
      this.loadingPersistenceLayerAvailability = false
      this.scheduleNewCheck()
    },
    scheduleNewCheck () {
      // Check if we have any negative stuff
      // If we do:
      // - set `delayUntilCheck` to 1
      // - set `persistenceLayerAvailabilityCheckTimer` timer to 0.1 second to reduce `delayUntilCheck` until it's 0
      // If `delayUntilCheck` is 0, kill `persistenceLayerAvailabilityCheckTimer` time and start a new API check

      if (this.statusWarnings || this.statusProblems) {
        this.delayUntilCheck = 1

        if (!this.persistenceLayerAvailabilityCheckTimer) {
          this.persistenceLayerAvailabilityCheckTimer = setInterval(() => {
            this.delayUntilCheck = this.delayUntilCheck - 0.05
            if (this.delayUntilCheck <= 0) {
              clearInterval(this.persistenceLayerAvailabilityCheckTimer)
              this.persistenceLayerAvailabilityCheckTimer = null
              this.checkPersistenceLayerAvailability()
            }
          }, 500)
        }
      }
    }
  }, // methods
  mounted () {
    // First remove any token from previous Login
    this.signOut()

    // Get the status of the Databases
    this.checkPersistenceLayerAvailability()
  },
  beforeDestroy () {
    if (this.persistenceLayerAvailabilityCheckTimer) {
      clearInterval(this.persistenceLayerAvailabilityCheckTimer)
    }
  }
}
</script>

<style>
.computerSaysNo {
  position: relative;
  animation-name: shakeLogin;
  animation-duration: 5s;
  animation-iteration-count: infinite;
  animation-timing-function: cubic-bezier(.36, .07, .19, .97);
}

@keyframes shakeLogin {
  0% {left: 0}
  2% {left: -6px}
  4% {left: 10px}
  6% {left: -16px}
  8% {left: 16px}
  10% {left: -10px}
  10% {left: 6px}
  14% {left: 0}
}

.fadeOut {
  animation-name: fadeOut;
  animation-duration: 5s;
  animation-iteration-count: infinite;
}

@keyframes fadeOut {
   0% {opacity: 1;}
   40% {opacity: 1;}
   90% {opacity: 0;}
   100% {opacity: 0;}
}
</style>
