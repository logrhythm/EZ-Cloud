<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" :label="$t('Return to Admin')" :to="'/Admin'" />
        <q-toolbar-title style="opacity:.4" class="text-center">{{ $t('Admin : RBAC : Manage User Accounts') }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-card class="">
      <!-- <q-card-section class="col">
        <div class="text-h4">User Accounts</div>
        🚧🚧 Placeholder 🚧🚧
      </q-card-section> -->
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                {{ $t('User Accounts') }}
            </q-card-section>
            <q-card-section>
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="userId"
                dense
                :no-data-label="$t('No Account to display.')"
                :filter="searchFilter"
                :loading="dataLoading"
                :rows-per-page-label="$t('Accounts per page:')"
                :pagination.sync="pagination"
              >
                <template v-slot:top>
                  <div class="full-width row wrap justify-between">
                    <div class="q-table__title">
                      {{ $t('Accounts') }}
                    </div>
                    <div class="row q-gutter-md">
                      <div class="col" >
                        <q-btn no-caps dense color="primary" icon="add" :label="$t('Add New Account')" style="min-width:14rem;" @click="addNewAccount()" >
                          <q-tooltip content-style="font-size: 1em">
                            {{ $t('Create a new Account.') }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <div class="row q-gutter-md">
                      <div style="width:300px;">
                        <q-input outlined dense debounce="300" v-model="searchFilter" :placeholder="$t('Search')">
                          <template v-slot:append>
                            <q-btn v-if="searchFilter.length" dense flat icon="close" @click="searchFilter=''" />
                            <q-icon name="o_search" />
                          </template>
                        </q-input>
                      </div>
                      <!-- <q-separator vertical dark color="orange" /> -->
                      <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadAccountsAndRoles()">
                        <q-tooltip content-style="font-size: 1em">
                          {{ $t('Reload the list of Accounts.') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat dense icon="edit" @click="doPromptForAccountDetails(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Edit Account details') }}
                      </q-tooltip>
                    </q-btn>
                    <q-btn flat dense icon="delete" color="negative" @click="deleteAccountPrompt(props.row)">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Delete Account') }}
                      </q-tooltip>
                    </q-btn>
                  </q-td>
                </template>

                <template v-slot:body-cell-roleIsPrivileged="props">
                  <q-td :props="props">
                    <q-icon name="o_check_circle_outline" color="green" size="md" v-if="props.value === 1" />
                    <q-tooltip content-style="font-size: 1em">
                      <span v-if="props.value === 1">{{ $t('Privileged user') }}</span>
                      <span v-else-if ="props.value === 0">{{ $t('Non-privileged user') }}</span>
                      <span v-else>{{ props.value }}</span>
                    </q-tooltip>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
            <!-- <q-card-section>
                <span class="text-bold">editingAccount ID: </span>
                <pre>{{ editingAccountId }}</pre>
            </q-card-section>
            <q-card-section>
                <span class="text-bold">editingAccount Username: </span>
                <pre>{{ editingAccountUsername }}</pre>
            </q-card-section>
            <q-card-section>
                <span class="text-bold">editingAccount Password: </span>
                <pre>{{ editingAccountPassword }}</pre>
            </q-card-section>
            <q-card-section>
                <span class="text-bold">editingAccount Role Uid: </span>
                <pre>{{ editingAccountRoleUid }}</pre>
            </q-card-section> -->
            <!-- <q-card-section>
                <span class="text-bold">Table Data: </span>
                <pre>{{ tableData }}</pre>
            </q-card-section> -->
            <!-- <q-card-section>
                <span class="text-bold">Accounts: </span>
                <pre>{{ userAccounts }}</pre>
            </q-card-section> -->
            <!-- <q-card-section>
                <span class="text-bold">Roles: </span>
                <pre>{{ userRoles }}</pre>
            </q-card-section> -->
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <q-btn icon="add" color="primary" @click="addNewAccount()" >
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Add Account') }}
                </q-tooltip>
              </q-btn>
              <q-btn icon="refresh" :loading="dataLoading" @click="loadAccountsAndRoles()">
                <q-tooltip content-style="font-size: 1rem;">
                  {{ $t('Reload') }}
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
    </q-card>

    <!-- User Account details dialog -->

    <q-dialog v-model="promptForAccountDetails" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row justify-between">
          <div class="text-h6" v-if="editingAccountId != null">{{ $t('User Account Details') }}</div>
          <div class="text-h6" v-else>{{ $t('New User Account') }}</div>
          <q-btn dense flat icon="close" color="grey-5" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="">
          <q-input
            dense
            outlined
            v-model="editingAccountUsername"
            :label="$t('Username')"
            autofocus
            :disable="editingAccountId != null"
            :rules="[val => !!val || $t('Account Username cannot be empty')]"
            @keyup.esc="promptForAccountDetails = false"
          />
        </q-card-section>

        <q-card-section class="q-pt-none q-mb-md">
          <q-input
            dense
            outlined
            v-model="editingAccountPassword"
            :label="$t('Password')"
            :type="!showPassword ? 'password' : 'text'"
            :disable="editingAccountId != null"
            @keyup.esc="promptForAccountDetails = false"
          >
          <template
              v-slot:append
            >
              <q-icon
                :name="showPassword ? 'o_visibility' : 'o_visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <q-tooltip content-style="font-size: 1rem;">
                  <span v-if="showPassword">{{ $t('Hide Secret') }}</span><span v-else>{{ $t('Show Secret') }}</span>
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>

        </q-card-section>

        <q-card-section class="q-pt-none q-mb-md">
          <q-select
            dense
            outlined
            v-model="editingAccountRoleUid"
            :options="rolesOptions"
            :label="$t('Role')"
            emit-value
            map-options
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <q-btn no-caps outline :label="$t('Cancel')" v-close-popup @click="cleanEditingVariables()" />
          <q-btn no-caps color="primary" :label="$t('Update User Account')" v-close-popup v-if="editingAccountId != null" :disabled="!editingAccountRoleUid || !editingAccountRoleUid.length" @click="addNewOrUpdateUserAccount()" />
          <q-btn no-caps color="primary" :label="$t('Add new User Account')" v-close-popup v-else :disabled="!editingAccountUsername || !editingAccountUsername.length || !editingAccountPassword || !editingAccountPassword.length || !editingAccountRoleUid || !editingAccountRoleUid.length" @click="addNewOrUpdateUserAccount()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog.vue'

export default {
  name: 'PageAdminUsers',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: this.$t('Actions'), field: 'actions', sortable: false },
        { name: 'userLogin', align: 'center', label: this.$t('Username'), field: 'userLogin', sortable: true },
        { name: 'roleName', align: 'center', label: this.$t('Role'), field: 'roleName', sortable: true },
        { name: 'roleIsPrivileged', align: 'center', label: this.$t('Is Privileged'), field: 'roleIsPrivileged', sortable: true }
      ],
      pagination: {
        sortBy: 'userLogin',
        descending: false,
        rowsPerPage: 20
      },
      accountsLoading: false,
      rolesLoading: false,
      promptForAccountDetails: false,
      editingAccountId: null,
      editingAccountUsername: null,
      editingAccountPassword: null,
      editingAccountRoleUid: null,
      showPassword: false
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['userAccounts', 'userRoles']),
    tableData () {
      // const list = []
      // return list
      return this.userAccounts
    },
    dataLoading () {
      return this.accountsLoading || this.rolesLoading
    },
    rolesOptions () {
      // Build the list of options for the Drop Down list of Roles
      const options = []
      this.userRoles.forEach(role => {
        options.push(
          {
            value: role.roleUid,
            label: (role.roleIsPrivileged === 1 ? this.$t('{roleName} (Privileged)', { roleName: role.roleName }) : role.roleName),
            isPrivileged: (role.roleIsPrivileged === 1)
          }
        )
      })
      // Sort them by Name
      return options.sort(
        (a, b) => {
          const nameA = String(a.roleName).toLowerCase()
          const nameB = String(b.roleName).toLowerCase()
          if (nameA < nameB) {
            return -1
          }
          if (nameA > nameB) {
            return 1
          }
          return 0
        }
      )
    }
  },
  methods: {
    ...mapActions('mainStore', ['getUserAccounts', 'getUserRoles', 'updateUserAccount', 'deleteUserAccount']),
    loadAccounts () {
      this.getUserAccounts(
        {
          loadingVariableName: 'accountsLoading',
          caller: this
        }
      )
    },
    loadRoles () {
      this.getUserRoles(
        {
          loadingVariableName: 'rolesLoading',
          caller: this
        }
      )
    },
    loadAccountsAndRoles () {
      this.loadAccounts()
      this.loadRoles()
    },
    cleanEditingVariables () {
      // Clean the variables
      this.editingAccountId = null
      this.editingAccountUsername = ''
      this.editingAccountPassword = ''
      this.editingAccountRoleUid = null
    },
    addNewAccount () {
      this.cleanEditingVariables()
      this.showPassword = false
      this.promptForAccountDetails = true
    },
    doPromptForAccountDetails (existing) {
      this.editingAccountId = (existing && existing.userId ? existing.userId : null)
      this.editingAccountUsername = (existing && existing.userLogin ? existing.userLogin : '')
      this.editingAccountPassword = 'placeholder.......'
      this.editingAccountRoleUid = (existing && existing.roleUid ? existing.roleUid : null)
      this.showPassword = false
      this.promptForAccountDetails = true
    },
    addNewOrUpdateUserAccount () {
      this.updateUserAccount(
        {
          userId: this.editingAccountId,
          userLogin: this.editingAccountUsername,
          userPassword: this.editingAccountPassword,
          roleUid: this.editingAccountRoleUid,
          loadingVariableName: 'accountsLoading',
          caller: this,
          onSuccessCallBack: this.loadAccounts,
          onErrorCallBack: this.addNewOrUpdateUserAccountFailure
        }
      )

      // And clean the variables
      this.cleanEditingVariables()
    },
    addNewOrUpdateUserAccountFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
      this.loadAccounts()
    },
    deleteAccountPrompt (row) {
      // ask to confirm
      this.$q.dialog({
        component: ConfirmDialog,
        parent: this,
        title: this.$t('Confirm'),
        message: this.$t('Do you REALLY want to delete this User Account?'),
        persistent: true
      }).onOk(() => {
        this.deleteAccount(row ? row.userId : null)
      }) // }).onOk(() => {
    },
    deleteAccount (userId) {
      if (userId != null) {
        this.deleteUserAccount(
          {
            userId: userId,
            loadingVariableName: 'accountsLoading',
            caller: this,
            onSuccessCallBack: this.loadAccounts,
            onErrorCallBack: this.loadAccounts
          }
        )
      }
    }
  },
  mounted () {
    if (this.userAccounts && this.userAccounts.length === 0) {
      this.loadAccounts()
    }
    if (this.userRoles && this.userRoles.length === 0) {
      this.loadRoles()
    }
  }
}
</script>
