<template>
  <q-page class="q-gutter-sm q-pa-xl">
    <q-card class="q-pa-md q-mx-none">
      <!-- <q-card-section class="col">
        <div class="text-h4">User Accounts</div>
        🚧🚧 Placeholder 🚧🚧
      </q-card-section> -->
        <q-card-section horizontal>
          <q-card-section class="col q-ma-none q-pa-none">
            <q-card-section class="text-h4">
                User Accounts
            </q-card-section>
            <q-card-section>
              <q-table
                :data="tableData"
                :columns="columns"
                row-key="userId"
                dense
                no-data-label="No Account to display."
                :filter="searchFilter"
                :loading="dataLoading"
                rows-per-page-label="Accounts per page:"
                :pagination.sync="pagination"
              >
                <template v-slot:top>
                  <div class="full-width row wrap justify-between">
                    <div class="q-table__title">
                      Accounts
                    </div>
                    <div class="row q-gutter-md">
                      <div class="col" >
                        <q-btn rounded dense color="primary" icon="add" label="Add New Account" style="min-width:14rem;" @click="addNewAccount()" >
                          <q-tooltip content-style="font-size: 1em">
                            Create a new Account.
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                    <div class="row q-gutter-md">
                      <div style="width:300px;">
                        <q-input outlined dense debounce="300" v-model="searchFilter" placeholder="Search">
                          <template v-slot:append>
                            <q-btn v-if="searchFilter.length" dense flat icon="close" @click="searchFilter=''" />
                            <q-icon name="search" />
                          </template>
                        </q-input>
                      </div>
                      <!-- <q-separator vertical dark color="orange" /> -->
                      <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadAccountsAndRoles()">
                        <q-tooltip content-style="font-size: 1em">
                          Reload the list of Pipelines.
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

                <template v-slot:body-cell-roleIsPriviledged="props">
                  <q-td :props="props">
                    <q-icon name="check_circle_outline" color="green" size="md" v-if="props.value === 1" />
                    <q-tooltip content-style="font-size: 1em">
                      <span v-if="props.value === 1">Priviledged user</span>
                      <span v-else-if ="props.value === 0">Non-priviledged user</span>
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
                  Add Account
                </q-tooltip>
              </q-btn>
              <q-btn icon="refresh" :loading="dataLoading" @click="loadAccountsAndRoles()">
                <q-tooltip content-style="font-size: 1rem;">
                  Reload
                </q-tooltip>
              </q-btn>
          </q-card-actions>
        </q-card-section>
    </q-card>
    <q-dialog v-model="promptForAccountDetails" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6" v-if="editingAccountId != null">{{ $t('User Account Details') }}</div>
          <div class="text-h6" v-else>{{ $t('New User Account') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="editingAccountUsername"
            label="Username"
            autofocus
            :disable="editingAccountId != null"
            :rules="[val => !!val || $t('Account Username cannot be empty')]"
            @keyup.esc="promptForAccountDetails = false"
          />
        </q-card-section>

        <q-card-section class="q-pt-none q-mb-md">
          <q-input dense v-model="editingAccountPassword"
            label="Password"
            :type="!showPassword ? 'password' : 'text'"
            :disable="editingAccountId != null"
            @keyup.esc="promptForAccountDetails = false"
          >
          <template
              v-slot:append
            >
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <q-tooltip content-style="font-size: 1rem;">
                  <span v-if="showPassword">Hide</span><span v-else>Show</span> Secret
                </q-tooltip>
              </q-icon>
            </template>
          </q-input>

        </q-card-section>

        <q-card-section class="q-pt-none q-mb-md">
          <q-select dense v-model="editingAccountRoleUid" :options="rolesOptions" label="Role" emit-value map-options />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="$t('Cancel')" v-close-popup @click="cleanEditingVariables()" />
          <q-btn flat :label="$t('Update User Account')" v-close-popup v-if="editingAccountId != null" :disabled="!editingAccountRoleUid || !editingAccountRoleUid.length" @click="addNewOrUpdateUserAccount()" />
          <q-btn flat :label="$t('Add new User Account')" v-close-popup v-else :disabled="!editingAccountUsername || !editingAccountUsername.length || !editingAccountPassword || !editingAccountPassword.length || !editingAccountRoleUid || !editingAccountRoleUid.length" @click="addNewOrUpdateUserAccount()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'

export default {
  name: 'PageAdminUsers',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'userLogin', align: 'center', label: 'Username', field: 'userLogin', sortable: true },
        { name: 'roleName', align: 'center', label: 'Role', field: 'roleName', sortable: true },
        { name: 'roleIsPriviledged', align: 'center', label: 'Is Priviledged', field: 'roleIsPriviledged', sortable: true }
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
            label: role.roleName + (role.roleIsPriviledged === 1 ? ' (Priviledged)' : ''),
            isPriviledged: (role.roleIsPriviledged === 1)
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
          onErrorCallBack: this.loadAccounts
        }
      )

      // And clean the variables
      this.cleanEditingVariables()
    },
    deleteAccountPrompt (row) {
      // ask to confirm
      this.$q.dialog({
        title: 'Confirm',
        message: 'Do you REALLY want to delete this User Account?',
        ok: {
          push: true,
          color: 'negative'
        },
        cancel: {
          push: true,
          color: 'positive'
        },
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
