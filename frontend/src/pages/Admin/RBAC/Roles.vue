<template>
  <q-page class="q-pa-sm">
    <q-header elevated :style="(darkMode ? 'background: var(--q-color-dark);' : '')" :class="(darkMode ? '' : 'bg-grey-1')">
      <q-toolbar class="q-gutter-x-sm" :class="(darkMode ? '' : 'text-black')">
        <q-btn no-caps flat dense icon="arrow_back" :label="$t('Return to Admin')" :to="'/Admin'" />
        <q-toolbar-title style="opacity:.4" class="text-center">{{ $t('Admin : RBAC : Manage User Roles') }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-card class="">
      <q-card-section horizontal>
        <q-card-section class="col q-ma-none q-pa-none">
          <q-card-section class="text-h4">
              {{ $t('User Roles') }}
          </q-card-section>
          <q-card-section>
            <q-table
              :data="tableData"
              :columns="columns"
              row-key="roleUid"
              dense
              :no-data-label="$t('No Role to display.')"
              :filter="searchFilter"
              :loading="dataLoading"
              :rows-per-page-label="$t('Roles per page:')"
              :pagination.sync="pagination"
            >
              <template v-slot:top>
                <div class="full-width row wrap justify-between">
                  <div class="q-table__title">
                    {{ $t('Roles') }}
                  </div>
                  <div class="row q-gutter-md">
                    <div class="col" >
                      <q-btn rounded dense color="primary" icon="add" :label="$t('Add New Role')" style="min-width:14rem;" @click="addNewRole()" >
                        <q-tooltip content-style="font-size: 1em">
                          {{ $t('Create a new Role.') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                  <div class="row q-gutter-md">
                    <div style="width:300px;">
                      <q-input outlined dense debounce="300" v-model="searchFilter" :placeholder="$t('Search')">
                        <template v-slot:append>
                          <q-btn v-if="searchFilter.length" dense flat icon="close" @click="searchFilter=''" />
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </div>
                    <!-- <q-separator vertical dark color="orange" /> -->
                    <q-btn dense outline icon="refresh" :loading="dataLoading" @click="loadRoles()">
                      <q-tooltip content-style="font-size: 1em">
                        {{ $t('Reload the list of Roles.') }}
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>
              </template>

              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn flat dense icon="edit" @click="doPromptForRoleDetails(props.row)">
                    <q-tooltip content-style="font-size: 1em">
                      {{ $t('Edit Role details') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn flat dense icon="delete" color="negative" @click="deleteRolePrompt(props.row)">
                    <q-tooltip content-style="font-size: 1em">
                      {{ $t('Delete Role') }}
                    </q-tooltip>
                  </q-btn>
                </q-td>
              </template>

              <template v-slot:body-cell-roleIsPrivileged="props">
                <q-td :props="props">
                  <q-icon name="check_circle_outline" color="green" size="md" v-if="props.value === 1" />
                  <q-tooltip content-style="font-size: 1em">
                    <span v-if="props.value === 1">{{ $t('Privileged role') }}</span>
                    <span v-else-if ="props.value === 0">{{ $t('Non-privileged role') }}</span>
                    <span v-else>{{ props.value }}</span>
                  </q-tooltip>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
          <!-- <q-card-section>
              <span class="text-bold">editingRole ID: </span>
              <pre>{{ editingRoleUid }}</pre>
          </q-card-section>
          <q-card-section>
              <span class="text-bold">editingRole Username: </span>
              <pre>{{ editingRoleName }}</pre>
          </q-card-section>
          <q-card-section>
              <span class="text-bold">editingRole Is Privileged: </span>
              <pre>{{ editingRoleIsPrivileged }}</pre>
          </q-card-section>
          <q-card-section>
              <span class="text-bold">Table Data: </span>
              <pre>{{ tableData }}</pre>
          </q-card-section>
          <q-card-section>
              <span class="text-bold">Roles: </span>
              <pre>{{ userRoles }}</pre>
          </q-card-section> -->
        </q-card-section>

        <q-separator vertical />

        <q-card-actions vertical class="justify-around q-px-md">
            <q-btn icon="add" color="primary" @click="addNewRole()" >
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Add Role') }}
              </q-tooltip>
            </q-btn>
            <q-btn icon="refresh" :loading="dataLoading" @click="loadRoles()">
              <q-tooltip content-style="font-size: 1rem;">
                {{ $t('Reload') }}
              </q-tooltip>
            </q-btn>
        </q-card-actions>
      </q-card-section>
    </q-card>

    <!-- User Role details dialog -->

    <q-dialog v-model="promptForRoleDetails" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6" v-if="editingRoleUid != null">{{ $t('User Role Details') }}</div>
          <div class="text-h6" v-else>{{ $t('New User Role') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="editingRoleName"
            :label="$t('Name')"
            autofocus
            :rules="[val => !!val || $t('Role Name cannot be empty')]"
            @keyup.esc="promptForRoleDetails = false"
          />
        </q-card-section>

        <q-card-section class="q-pt-none q-mb-md">
          <q-toggle
            v-model="editingRoleIsPrivileged"
            :label="$t('Is Privileged')"
            false-value="0"
            :true-value="1"
            left-label
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="text-primary">
          <q-btn flat :label="$t('Cancel')" v-close-popup @click="cleanEditingVariables()" />
          <q-btn flat :label="$t('Update User Role')" v-close-popup v-if="editingRoleUid != null" :disabled="!editingRoleName || !editingRoleName.length" @click="addNewOrUpdateUserRole()" />
          <q-btn flat :label="$t('Add new User Role')" v-close-popup v-else :disabled="!editingRoleName || !editingRoleName.length" @click="addNewOrUpdateUserRole()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { uid } from 'quasar'
import mixinSharedDarkMode from 'src/mixins/mixin-Shared-DarkMode'
import ConfirmDialog from '../../../components/Dialogs/ConfirmDialog.vue'

export default {
  name: 'PageAdminRoles',
  mixins: [
    mixinSharedDarkMode // Shared computed to access and update the DarkMode
  ],
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: this.$t('Actions'), field: 'actions', sortable: false },
        { name: 'roleName', align: 'center', label: this.$t('Role'), field: 'roleName', sortable: true },
        { name: 'roleIsPrivileged', align: 'center', label: this.$t('Is Privileged'), field: 'roleIsPrivileged', sortable: true }
      ],
      pagination: {
        sortBy: 'roleName',
        descending: false,
        rowsPerPage: 20
      },
      rolesLoading: false,
      promptForRoleDetails: false,
      editingRoleUid: null,
      editingRoleName: null,
      editingRoleIsPrivileged: null
    }
  }, // data
  computed: {
    ...mapState('mainStore', ['userRoles']),
    tableData () {
      // const list = []
      // return list
      return this.userRoles
    },
    dataLoading () {
      return this.rolesLoading
    }
  },
  methods: {
    ...mapActions('mainStore', ['getUserRoles', 'updateUserRole', 'deleteUserRole']),
    loadRoles () {
      this.getUserRoles(
        {
          loadingVariableName: 'rolesLoading',
          caller: this
        }
      )
    },
    cleanEditingVariables () {
      // Clean the variables
      this.editingRoleUid = null
      this.editingRoleName = ''
      this.editingRoleIsPrivileged = '0'
    },
    addNewRole () {
      this.cleanEditingVariables()
      this.promptForRoleDetails = true
    },
    doPromptForRoleDetails (existing) {
      console.log('doPromptForRoleDetails')
      console.log(existing)
      this.editingRoleUid = (existing && existing.roleUid ? existing.roleUid : null)
      this.editingRoleName = (existing && existing.roleName ? existing.roleName : '')
      this.editingRoleIsPrivileged = (existing && existing.roleIsPrivileged ? existing.roleIsPrivileged : '0')
      this.promptForRoleDetails = true
    },
    addNewOrUpdateUserRole () {
      this.updateUserRole(
        {
          roleUid: (this.editingRoleUid && this.editingRoleUid.length ? this.editingRoleUid : uid()),
          roleName: this.editingRoleName,
          roleIsPrivileged: this.editingRoleIsPrivileged,
          loadingVariableName: 'rolesLoading',
          caller: this,
          onSuccessCallBack: this.loadRoles,
          onErrorCallBack: this.addNewOrUpdateUserRoleFailure
        }
      )

      // And clean the variables
      this.cleanEditingVariables()
    },
    addNewOrUpdateUserRoleFailure (payload) {
      // Pop this to the screen (via MainLayout)
      this.$root.$emit('addAndShowErrorToErrorPanel', payload)
      this.loadRoles()
    },
    deleteRolePrompt (row) {
      // ask to confirm
      this.$q.dialog({
        component: ConfirmDialog,
        parent: this,
        title: this.$t('Confirm'),
        message: this.$t('Do you REALLY want to delete this User Role?'),
        persistent: true
      }).onOk(() => {
        this.deleteRole(row ? row.roleUid : null)
      }) // }).onOk(() => {
    },
    deleteRole (roleUid) {
      console.log('deleteRole', roleUid)
      if (roleUid && roleUid.length) {
        this.deleteUserRole(
          {
            roleUid: roleUid,
            loadingVariableName: 'rolesLoading',
            caller: this,
            onSuccessCallBack: this.loadRoles,
            onErrorCallBack: this.addNewOrUpdateUserRoleFailure
          }
        )
      }
    }
  },
  mounted () {
    if (this.userRoles && this.userRoles.length === 0) {
      this.loadRoles()
    }
  }
}
</script>
