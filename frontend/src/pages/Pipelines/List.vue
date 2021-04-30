<template>
  <q-page class="q-pa-md">
    <!-- <q-btn class="q-mt-sm" label="Open Editor" to="/Pipelines/b9f7c85a-a278-11eb-bcbc-0242ac130002/Edit" color="primary"/> -->
      <q-table
        title="Pipelines"
        :data="tableData"
        :columns="columns"
        row-key="uid"
        dense
        no-data-label="No Pipeline to display."
        :filter="searchFilter"
        :loading="tableLoading"
        rows-per-page-label="Pipelines per page:"
        :pagination.sync="pagination"
      >

        <template v-slot:top>
          <div class="full-width row wrap justify-between">
            <div class="q-table__title">
              Pipelines
            </div>
            <div class="row q-gutter-md">
              <div class="col" >
                <q-btn rounded dense color="primary" icon="add" label="Add New Pipeline" @click="doPromptForPipelineDetails()" style="min-width:12rem;">
                  <q-tooltip content-style="font-size: 1em">
                    Create a new Pipeline.
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
              <q-btn dense outline icon="refresh" @click="getPipelines()">
                <q-tooltip content-style="font-size: 1em">
                  Reload the list of Pipelines.
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense icon="launch" @click="openPipeline(props.row)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Open this Pipeline') }}
              </q-tooltip>
            </q-btn>
            <q-btn flat dense icon="delete" color="negative" @click="deletePipelinePrompt(props.row)">
              <q-tooltip content-style="font-size: 1em">
                {{ $t('Delete Pipeline') }}
              </q-tooltip>
            </q-btn>
          </q-td>
        </template>
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-icon name="arrow_circle_up" color="green" size="md" v-if="props.value === 'Ready'" />
            <q-icon name="construction" size="md" v-else-if ="props.value === 'Dev'" />
            <q-icon name="auto_awesome" size="md" v-else-if ="props.value === 'New'" />
            <q-icon name="help_center" color="grey" size="md" v-else />
            <q-tooltip content-style="font-size: 1em">
              {{ props.value }}
            </q-tooltip>
          </q-td>
        </template>
      </q-table>

      <q-dialog v-model="promptForNewPipelineDetails" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('New Pipeline Details') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="newPipelineName" autofocus label="Pipeline Name" @keyup.esc="promptForNewPipelineDetails = false" :rules="[val => !!val || $t('Pipeline name cannot be empty')]" />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-select dense v-model="newPipelineOpenCollector" :options="openCollectorsOptions" label="Primary Open Collector" />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('Cancel')" v-close-popup />
            <q-btn flat :label="$t('Add new Pipeline')" v-close-popup :disabled="!newPipelineName.length" @click="addNewPipeline()" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PagePipelinesList',
  data () {
    return {
      searchFilter: '',
      columns: [
        { name: 'actions', align: 'center', label: 'Actions', field: 'actions', sortable: false },
        { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
        { name: 'name', align: 'center', label: 'Pipeline Name', field: 'name', sortable: true },
        { name: 'openCollector', align: 'center', label: 'Primary Open Collector', field: 'openCollector', sortable: true }
      ],
      pagination: {
        sortBy: 'status',
        descending: true,
        rowsPerPage: 25
      },
      tableLoading: false,
      promptForNewPipelineDetails: false,
      newPipelineName: '',
      newPipelineOpenCollector: null
    } // return
  },
  computed: {
    ...mapGetters('mainStore', ['openCollectors', 'pipelines']),
    tableData () {
      const list = []
      this.pipelines.forEach(p => {
        const pipelineOpenCollector = this.openCollectors.find(oc => oc.uid === p.primaryOpenCollector)
        list.push(Object.assign({}, p, {
          openCollector: (pipelineOpenCollector && pipelineOpenCollector.name && pipelineOpenCollector.hostname ? pipelineOpenCollector.name + ' (' + pipelineOpenCollector.hostname + ')' : null)
        }))
      })
      return list
    },
    openCollectorsOptions () {
      const options = []
      this.openCollectors.forEach(oc => {
        options.push(
          {
            value: oc.uid,
            label: oc.name + ' (' + oc.hostname + ')'
          }
        )
      })
      return options
    }
  },
  methods: {
    ...mapActions('mainStore', ['upsertPipeline', 'deletePipeline', 'getPipelines']),
    openPipeline (row) {
      this.$router.push({ path: '/Pipelines/' + row.uid + '/Properties' })
    }, // openPipeline
    deletePipelinePrompt (row) {
      if (typeof row !== 'undefined') {
        // ask to confirm
        this.$q.dialog({
          title: 'Confirm',
          message: 'Do you REALLY want to delete this Pipeline?',
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
          this.deletePipeline(row)
        }) // }).onOk(() => {
      }
    }, // deletePipelinePrompt
    doPromptForPipelineDetails () {
      this.newPipelineName = ''
      this.newPipelineOpenCollector = null
      this.promptForNewPipelineDetails = true
    }, // doPromptForPipelineDetails
    addNewPipeline () {
      this.promptForNewPipelineDetails = false
      this.upsertPipeline(
        {
          name: this.newPipelineName,
          status: 'New',
          primaryOpenCollector: (this.newPipelineOpenCollector && this.newPipelineOpenCollector.value && this.newPipelineOpenCollector.value.length ? this.newPipelineOpenCollector.value : null)
        }
      )
    }
  }

}
</script>
