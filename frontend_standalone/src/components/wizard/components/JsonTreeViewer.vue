<template>
  <div class="json-tree-viewer">
    <div v-if="!data" class="no-data">
      No data structure to display
    </div>
    <div v-else class="tree-content">
      <JsonTreeNode
        :data="data"
        :expanded-nodes="expandedNodes"
        :selectable-types="selectableTypes"
        :selected-fields="selectedFields"
        :show-path="showPath"
        :mapped-paths="mappedPaths"
        :highlighted-path="highlightedPath"
        :clickable-mode="clickableMode"
        @toggle="onToggle"
        @select="onSelect"
        @node-click="onNodeClick"
      />
    </div>
  </div>
</template>

<script>
import JsonTreeNode from './JsonTreeNode.vue'

export default {
  name: 'JsonTreeViewer',

  components: {
    JsonTreeNode
  },

  props: {
    data: {
      type: Object,
      required: true
    },
    expandedNodes: {
      type: Set,
      default: () => new Set()
    },
    selectableTypes: {
      type: Array,
      default: () => ['array', 'string']
    },
    selectedFields: {
      type: Set,
      default: () => new Set()
    },
    showPath: {
      type: Boolean,
      default: false
    },
    // NEW: Mapped paths for showing checkmarks
    mappedPaths: {
      type: Set,
      default: () => new Set()
    },
    // NEW: Highlighted path for "show in tree" feature
    highlightedPath: {
      type: String,
      default: null
    },
    // NEW: Enable clickable nodes for mapping
    clickableMode: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onToggle (path) {
      this.$emit('toggle-node', path)
    },

    onSelect (data) {
      this.$emit('select-field', data.path, {
        path: data.path,
        selected: data.selected,
        type: data.type
      })
    },

    // NEW: Handle node click
    onNodeClick (nodeData) {
      this.$emit('node-click', nodeData)
    }
  }
}
</script>

<style lang="scss" scoped>
.json-tree-viewer {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 16px; /* Increased from 14px for better readability */
  line-height: 1.6;
  overflow-x: auto;
  position: relative;
}

.no-data {
  text-align: center;
  color: var(--q-color-grey-6);
  padding: 2rem;
  font-style: italic;
  border: 1px dashed var(--q-color-grey-4);
  border-radius: 8px;
  margin: 1rem 0;

  .dark-theme & {
    color: var(--q-color-grey-5);
    border-color: var(--q-color-grey-7);
  }
}

.tree-content {
  padding: 0.5rem;
}
</style>
