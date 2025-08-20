<template>
  <div class="json-tree-viewer">
    <div v-if="!data" class="no-data">
      No data structure to display
    </div>
    <div v-else class="tree-content">
      <JsonNode
        v-for="(value, key) in data"
        :key="key"
        :name="key"
        :value="value"
        :path="key"
        :depth="0"
        :expanded="isNodeExpanded(key)"
        @toggle="$emit('toggle-node', key)"
        @select="$emit('select-field', key)"
      />
    </div>
  </div>
</template>

<script>
// Simple JSON node component
const JsonNode = {
  name: 'JsonNode',
  props: {
    name: String,
    value: null,
    path: String,
    depth: { type: Number, default: 0 },
    expanded: { type: Boolean, default: false }
  },
  template: `
    <div class="json-node" :style="{ marginLeft: depth * 20 + 'px' }">
      <div class="node-header" @click="$emit('toggle')">
        <q-icon 
          v-if="isObject || isArray"
          :name="expanded ? 'expand_more' : 'chevron_right'"
          size="16px"
          class="expand-icon"
        />
        <span class="node-name">{{ name }}</span>
        <span class="node-type">{{ getTypeDisplay() }}</span>
      </div>
      <div v-if="expanded && (isObject || isArray)" class="node-children">
        <!-- Render child nodes recursively -->
        <JsonNode
          v-for="(childValue, childKey) in value"
          :key="childKey"
          :name="childKey"
          :value="childValue"
          :path="path + '.' + childKey"
          :depth="depth + 1"
          :expanded="false"
          @toggle="$emit('toggle')"
          @select="$emit('select')"
        />
      </div>
    </div>
  `,
  computed: {
    isObject () {
      return this.value && typeof this.value === 'object' && !Array.isArray(this.value)
    },
    isArray () {
      return Array.isArray(this.value)
    }
  },
  methods: {
    getTypeDisplay () {
      if (Array.isArray(this.value)) {
        return `Array[${this.value.length}]`
      }
      if (this.value && typeof this.value === 'object') {
        return `Object{${Object.keys(this.value).length}}`
      }
      return typeof this.value
    }
  }
}

export default {
  name: 'JsonTreeViewer',

  components: {
    JsonNode
  },

  props: {
    data: {
      type: Object,
      default: null
    },
    expandedNodes: {
      type: Set,
      default: () => new Set()
    }
  },

  methods: {
    isNodeExpanded (path) {
      return this.expandedNodes.has(path)
    }
  }
}
</script>

<style lang="scss" scoped>
.json-tree-viewer {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.4;
}

.no-data {
  text-align: center;
  color: var(--q-color-grey-5);
  padding: 2rem;
  font-style: italic;
}

.tree-content {
  padding: 0.5rem;
}

::v-deep .json-node {
  .node-header {
    display: flex;
    align-items: center;
    padding: 0.25rem 0;
    cursor: pointer;
    border-radius: 4px;

    &:hover {
      background: var(--q-color-grey-2);
    }
  }

  .expand-icon {
    margin-right: 0.5rem;
    color: var(--q-color-grey-6);
  }

  .node-name {
    font-weight: 600;
    color: var(--q-primary);
    margin-right: 0.5rem;
  }

  .node-type {
    font-size: 12px;
    color: var(--q-color-grey-5);
    background: var(--q-color-grey-2);
    padding: 0.125rem 0.375rem;
    border-radius: 12px;
  }

  .node-children {
    border-left: 1px solid var(--q-color-grey-3);
    margin-left: 0.5rem;
  }
}

.dark-theme {
  ::v-deep .json-node {
    .node-header:hover {
      background: var(--q-color-grey-8);
    }

    .node-type {
      background: var(--q-color-grey-8);
      color: var(--q-color-grey-4);
    }

    .node-children {
      border-color: var(--q-color-grey-8);
    }
  }
}
</style>
