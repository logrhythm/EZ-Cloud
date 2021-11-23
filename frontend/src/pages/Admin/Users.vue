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
                row-key="id"
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

                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-icon name="arrow_circle_up" color="green" size="md" v-if="props.value === true" />
                    <q-icon name="arrow_circle_down" color="red" size="md" v-else-if ="props.value === false" />
                    <q-icon name="help_center" color="grey" size="md" v-else />
                    <q-tooltip content-style="font-size: 1em">
                      <span v-if="props.value === true">Enabled</span>
                      <span v-else-if ="props.value === false">Disabled / Un-deployed</span>
                      <span v-else>{{ props.value }}</span>
                    </q-tooltip>
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
            <q-card-section>
                <span class="text-bold">Table Data: </span>
                <pre>{{ tableData }}</pre>
            </q-card-section>
            <q-card-section>
                <span class="text-bold">Accounts: </span>
                <pre>{{ userAccounts }}</pre>
            </q-card-section>
            <q-card-section>
                <span class="text-bold">Roles: </span>
                <pre>{{ userRoles }}</pre>
            </q-card-section>
          </q-card-section>

          <q-separator vertical />

          <q-card-actions vertical class="justify-around q-px-md">
              <!-- <q-btn icon="add" color="primary" :to="'/Pipelines/' + this.pipelineUid + '/Accounts/Edit'" > -->
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
        { name: 'name', align: 'center', label: 'Username', field: 'name', sortable: true },
        { name: 'role', align: 'center', label: 'Role', field: 'role', sortable: true },
        { name: 'isPriviledged', align: 'center', label: 'Is Priviledged', field: 'isPriviledged', sortable: true }
      ],
      pagination: {
        sortBy: 'name',
        descending: true,
        rowsPerPage: 25
      },
      accountsLoading: false,
      rolesLoading: false
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
    }
  },
  methods: {
    ...mapActions('mainStore', ['getUserAccounts']),
    loadAccountsAndRoles () {
      this.getUserAccounts(
        {
          loadingVariableName: 'accountsLoading',
          caller: this
        }
      )
    },
    addNewAccount () {
      //
    }
  }
}
</script>
