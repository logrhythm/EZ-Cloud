<template>
  <q-page class="flex flex-center">
    <div>
      <div class="text-h2" style="opacity:.4">
        Pipelines Builder
      </div>
      <div class="q-mt-md">
        <div v-for="jsonPath in jsonPathes"
          :key="jsonPath.id"
          class="row"
        >
          <div style="width: 4rem;" class="">
            <!-- {{ jsonPath.seenInLogCount }} -->
            <!-- <span
                v-for="c in jsonPath.seenInLogCount" :key="c"
            >-</span> -->
            <div :style="'height: .2rem; background-color: #5070ff; width: ' + jsonPath.seenInLogCount / maxSeenInLog * 4 + 'rem'"></div>
            <div style="height: .05rem; background-color: #7373be; width: 4rem"></div>
          </div>
          <div style="margin-left: 0.3rem;"
          class="fixed-font">
            <span
              v-for="d in jsonPath.depth" :key="d"
              class="span-json"
            ></span>
            <span
              style="font-weight: bold;"
              :class="{ selected: !!selected[jsonPath.id], selecting: !!selecting[jsonPath.id] }"
              class="item json-style-leaf">{{ jsonPath.leaf }}</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'Object'"
              class="json-style-object"
            > {}</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'Array'"
              class="json-style-array"
            > []</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'String' && showAllTypes"
              class="json-style-string"
            > ""</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'Number' && showAllTypes"
              class="json-style-number"
            > 00</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && jsonPath.values[0].type === 'Boolean' && showAllTypes"
              class="json-style-boolean"
            > &&</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].value !== undefined"
            >: {{ jsonPath.values[0].value }}</span
            ><span
              v-if="jsonPath.values && jsonPath.values.length && jsonPath.values[0].type && showExtraDetails"
              style="font-style: italic; opacity: 50%;"
            > ({{ jsonPath.values[0].type }}:{{ jsonPath.values[0].count }}/{{ jsonPath.seenInLogCount }})</span
            >
          </div>
        </div>
      </div>
      <div class="q-mt-md">
        <q-btn class="q-mr-lg" dense label="Reload data" flat color="primary" @click="loadData()" />
        <label><input type="checkbox" v-model="showAllTypes"> Show all types</label>
        <label><input type="checkbox" v-model="showExtraDetails"> Show extra details</label>
      </div>

      <div class="q-mt-md">
        Selected JSON pathes ({{ selectedCount }}): {{ selectedPathes }}
      </div>
      <div>
        {{ maxSeenInLog }} / {{ processedLogsCount }} / {{ logSample.length }}
      </div>
      <div>
        <pre>{{ jsonPathes }}</pre>
      </div>

    </div>
  </q-page>
</template>

<script>
const externalData = [
  { id: 0, name: '.', leaf: '', depth: 0, mappedField: '', seenInLogCount: 4, values: [{ type: 'Object', count: 4 }] },
  { id: 1, name: '.timestamp', leaf: 'timestamp', depth: 1, mappedField: '', seenInLogCount: 4, values: [{ value: '20210416T01:02:03', type: 'String', count: 1 }, { value: '20210416T02:02:03', type: 'String', count: 1 }, { value: '20210416T03:02:03', type: 'String', count: 1 }, { value: '20210416T04:02:03', type: 'String', count: 1 }] },
  { id: 2, name: '.id', leaf: 'id', depth: 1, mappedField: 'session', seenInLogCount: 4, values: [{ value: 'abc-def-123456-fedcba', type: 'String', count: 1 }, { value: 'def-def-123456-fedcba', type: 'String', count: 1 }, { value: 'xyz-def-123456-fedcba', type: 'String', count: 1 }, { value: 'cab-def-123456-fedcba', type: 'String', count: 1 }] },
  { id: 3, name: '.code', leaf: 'code', depth: 1, mappedField: 'vmid', seenInLogCount: 4, values: [{ value: 15, type: 'Number', count: 1 }, { value: 452, type: 'Number', count: 2 }, { value: 28, type: 'Number', count: 1 }] },
  { id: 4, name: '.destination', leaf: 'destination', depth: 1, mappedField: '', seenInLogCount: 3, values: [{ type: 'Object', count: 3 }] },
  { id: 5, name: '.destination.ip', leaf: 'ip', depth: 2, mappedField: 'dip', seenInLogCount: 3, values: [{ value: '192.168.0.5', type: 'String', count: 2 }, { value: '192.168.0.1', type: 'String', count: 1 }] },
  { id: 6, name: '.destination.port', leaf: 'port', depth: 2, mappedField: 'dport', seenInLogCount: 3, values: [{ value: 80, type: 'Number', count: 2 }, { value: 1234, type: 'Number', count: 1 }] },
  { id: 7, name: '.source.', leaf: 'source', depth: 1, mappedField: '', seenInLogCount: 4, values: [{ type: 'Object', count: 4 }] },
  { id: 8, name: '.source.ip', leaf: 'ip', depth: 2, mappedField: 'sip', seenInLogCount: 4, values: [{ value: '10.1.2.3', type: 'String', count: 2 }, { value: '10.1.2.4', type: 'String', count: 1 }, { value: '10.5.4.3', type: 'String', count: 1 }] },
  { id: 9, name: '.source.port', leaf: 'port', depth: 2, mappedField: 'sport', seenInLogCount: 4, values: [{ value: 4567, type: 'Number', count: 1 }, { value: 13456, type: 'Number', count: 1 }, { value: 12321, type: 'Number', count: 1 }, { value: 11234, type: 'Number', count: 1 }] },
  { id: 10, name: '.boop', leaf: 'boop', depth: 1, mappedField: '', seenInLogCount: 1, values: [{ value: 'bam', type: 'String', count: 1 }] },
  { id: 11, name: '.options', leaf: 'options', depth: 1, mappedField: '', seenInLogCount: 2, values: [{ type: 'Array', count: 2 }] },
  { id: 12, name: '.options.0', leaf: '0', depth: 2, mappedField: '', seenInLogCount: 2, values: [{ type: 'Object', count: 2 }] },
  { id: 13, name: '.options.0.enable', leaf: 'enable', depth: 3, mappedField: '', seenInLogCount: 2, values: [{ value: 'always', type: 'String', count: 1 }, { value: 'first', type: 'String', count: 1 }] },
  { id: 14, name: '.options.0.suppress', leaf: 'suppress', depth: 3, mappedField: '', seenInLogCount: 2, values: [{ value: false, type: 'Boolean', count: 2 }] },
  { id: 15, name: '.activities', leaf: 'activities', depth: 1, mappedField: '', seenInLogCount: 3, values: [{ type: 'Array', count: 3 }] },
  { id: 16, name: '.activities.0', leaf: '0', depth: 2, mappedField: '', seenInLogCount: 3, values: [{ value: 'Add', type: 'String', count: 3 }] },
  { id: 17, name: '.activities.1.', leaf: '1', depth: 2, mappedField: '', seenInLogCount: 3, values: [{ value: 'Validate', type: 'String', count: 3 }] }
]

export default {
  name: 'PagePipelineBuilder',
  data () {
    return {
      jsonPathes: [],
      selected: [],
      selecting: [],
      showHidden: false,
      search: '',
      addMode: false,
      logSample: [{}, {}, {}, {}],
      processedLogsCount: 4,
      showAllTypes: true,
      showExtraDetails: true
    }
  },
  mounted () {
    this.loadData()
  },

  computed: {
    selectedCount () {
      return this.selected.reduce((counter, value) => counter + (value ? 1 : 0), 0)
    },

    selectedPathes () {
      return this.selectedCount > 0
        ? this.jsonPathes.filter((p, i) => !!this.selected[i])
          .map(p => p.name + ' (' + p.value + ')')
          .join(', ')
        : 'none'
    },

    maxSeenInLog () {
      let max = 0
      this.jsonPathes.forEach(jp => {
        if (jp.seenInLogCount > max) {
          max = jp.seenInLogCount
        }
      })
      return max
    }
  },

  methods: {
    loadData () {
      setTimeout(() => { this.jsonPathes = [].concat(externalData) }, 300)
    },

    // isPersonShown (jsonPath) {
    //   let searchLine = this.search.trim().toLowerCase()

    //   return !searchLine ||
    //     (jsonPath.name + ' ' + jsonPath.value).toLowerCase().includes(searchLine)
    // },

    // clearSelection () {
    //   this.selected = []
    // },

    // selectAll () {
    //   this.selected = new Array(this.jsonPathes.length).fill(true)
    // },

    // invertSelection () {
    //   this.selected = this.selected.length > 0 ?
    //     this.selected.map(i => !i)
    //     : new Array(this.jsonPathes.length).fill(true)
    // },

    // selectedGetter () {
    //   return this.selected
    // },

    // selectedSetter (v) {
    //   this.selected = v
    // },

    // selectingSetter (v) {
    //   this.selecting = v
    // },

    processLogSample ({ logSample, options }) {
      // Steps:
      // - get FileBeat to write to disk in specific file for LS
      // - Backend tails disk file
      // - bring logs to Front (UI) as they arrive (via Socket.io)
      // - limit to 10k log samples on disk (or to given size, whichever is the easiest to achieve)
      // - process logs in background on UI
      // - keep stats updated on UI
      // - for each log:
      //     - recursively go through each keys:
      //           - populate the jsonPathes object with:
      //               - full dotted path, leaf name, and depth, if not already in
      //               - increment seenInLogCount
      //               - add value to values.value (if not already in)
      //               - add type to values.type (if not already in)
      //               - increment values.count for value / type
      //     - increment processedLogsCount

    } // processLogSample
  },

  watch: {
    // jsonPathes: {
    //   handler () {
    //     this.$nextTick(() => vueSelectable.setSelectableItems(this.$refs.vsel));
    //   },
    //   deep: true
    // }
  }
}
</script>

<style scoped>
.fixed-font {
    font-family: monospace;
}
.span-json {
    margin-left: .2rem;
    padding-left: .8rem;
    border-left: 1px solid #037d92;
}
.json-style-leaf {
    font-style: bold;
}
.json-style-object {
    font-style: italic;
    color: blueviolet;
}
.json-style-array {
    font-style: italic;
    color: rgb(148, 14, 41);
}
.json-style-string {
    font-style: italic;
    color: rgb(80, 112, 255);
}
.json-style-number {
    font-style: italic;
    color: rgb(15, 129, 50);
}
.json-style-boolean {
    font-style: italic;
    color: rgb(32, 227, 253);
}
</style>
