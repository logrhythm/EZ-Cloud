<template>
  <div class="json-tree-node">
    <!-- Object node -->
    <div v-if="isObject" class="tree-node" :class="getIndentClass(depth)">
      <div class="node-header" @click="toggleExpand">
        <q-icon
          :name="isExpanded ? 'expand_more' : 'chevron_right'"
          size="16px"
          class="expand-icon"
          v-if="hasChildren"
        />
        <span class="node-key">{{ nodeName }}</span>
        <span class="node-bracket">{</span>
        <span class="node-type">object</span>
        <span class="node-count" v-if="objectSize > 0">({{ objectSize }})</span>
      </div>

      <!-- Object children -->
      <div v-if="isExpanded && hasChildren">
        <JsonTreeNode
          v-for="(childValue, childKey) in data"
          :key="childKey"
          :name="childKey"
          :data="childValue"
          :path="`${path}.${childKey}`"
          :depth="depth + 1"
          :selectedArrays="selectedArrays"
          @array-selected="handleArraySelection"
        />
        <div class="tree-node" :class="getIndentClass(depth)">
          <span class="node-bracket">}</span>
        </div>
      </div>
      <div v-else-if="isExpanded && !hasChildren">
        <div class="tree-node" :class="getIndentClass(depth + 1)">
          <span class="empty-object">empty object</span>
        </div>
        <div class="tree-node" :class="getIndentClass(depth)">
          <span class="node-bracket">}</span>
        </div>
      </div>
    </div>

    <!-- Array node -->
    <div v-else-if="isArray" class="tree-node" :class="getIndentClass(depth)">
      <div class="node-header">
        <q-icon
          :name="isExpanded ? 'expand_more' : 'chevron_right'"
          size="16px"
          class="expand-icon"
          v-if="data.length > 0"
          @click="toggleExpand"
        />
        <span class="node-key" @click="toggleExpand">{{ nodeName }}</span>
        <q-checkbox
          v-model="isSelected"
          class="inline-checkbox"
          @update:model-value="toggleSelection"
        />
        <span class="node-bracket">[</span>
        <span class="node-type">array</span>
        <span class="node-count">({{ data.length }})</span>
      </div>

      <!-- Array children -->
      <div v-if="isExpanded && data.length > 0">
        <JsonTreeNode
          v-for="(item, index) in data.slice(0, 5)"
          :key="index"
          :name="index.toString()"
          :data="item"
          :path="`${path}[${index}]`"
          :depth="depth + 1"
          :selectedArrays="selectedArrays"
          @array-selected="handleArraySelection"
        />
        <div v-if="data.length > 5" class="tree-node" :class="getIndentClass(depth + 1)">
          <span class="ellipsis">... {{ data.length - 5 }} more items</span>
        </div>
        <div class="tree-node" :class="getIndentClass(depth)">
          <span class="node-bracket">]</span>
        </div>
      </div>
      <div v-else-if="isExpanded && data.length === 0">
        <div class="tree-node" :class="getIndentClass(depth + 1)">
          <span class="empty-array">empty array</span>
        </div>
        <div class="tree-node" :class="getIndentClass(depth)">
          <span class="node-bracket">]</span>
        </div>
      </div>
    </div>

    <!-- Primitive value node -->
    <div v-else class="tree-node" :class="getIndentClass(depth)">
      <span class="node-key">{{ nodeName }}</span>
      <span class="node-value" :class="`value-${typeof data}`">{{ formattedValue }}</span>
      <span class="node-type">{{ typeof data }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonTreeNode',

  props: {
    name: {
      type: String,
      required: true
    },
    data: {
      required: true
    },
    path: {
      type: String,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    selectedArrays: {
      type: Array,
      default: () => []
    }
  },

  data () {
    return {
      isExpanded: this.depth < 2 // Auto-expand first two levels
    }
  },

  computed: {
    nodeName () {
      return this.name
    },

    isObject () {
      return this.data !== null && typeof this.data === 'object' && !Array.isArray(this.data)
    },

    isArray () {
      return Array.isArray(this.data)
    },

    hasChildren () {
      if (this.isObject) {
        return Object.keys(this.data).length > 0
      }
      if (this.isArray) {
        return this.data.length > 0
      }
      return false
    },

    objectSize () {
      if (this.isObject) {
        return Object.keys(this.data).length
      }
      return 0
    },

    formattedValue () {
      if (this.data === null) return 'null'
      if (this.data === undefined) return 'undefined'
      if (typeof this.data === 'string') {
        // Truncate long strings
        if (this.data.length > 50) {
          return `"${this.data.substring(0, 47)}..."`
        }
        return `"${this.data}"`
      }
      return String(this.data)
    },

    isSelected: {
      get () {
        return this.isArray && this.selectedArrays.includes(this.path)
      },
      set (value) {
        // Handled in toggleSelection method
      }
    }
  },

  methods: {
    getIndentClass (depth) {
      switch (depth) {
        case 0: return ''
        case 1: return 'indented'
        case 2: return 'double-indented'
        case 3: return 'triple-indented'
        default: return 'quadruple-indented'
      }
    },

    toggleExpand () {
      this.isExpanded = !this.isExpanded
    },

    toggleSelection (value) {
      this.$emit('array-selected', {
        path: this.path,
        selected: value
      })
    },

    handleArraySelection (event) {
      this.$emit('array-selected', event)
    }
  }
}
</script>

<style lang="scss" scoped>
.json-tree-node {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.tree-node {
  white-space: nowrap;
  margin: 2px 0;
}

.node-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.indented {
  padding-left: 20px;
}

.double-indented {
  padding-left: 40px;
}

.triple-indented {
  padding-left: 60px;
}

.quadruple-indented {
  padding-left: 80px;
}

.expand-icon {
  margin-right: 4px;
  color: var(--q-color-grey-6);
}

.node-key {
  color: #0b7285;
  font-weight: bold;
  margin-right: 5px;
}

.node-bracket {
  color: #868e96;
  font-weight: normal;
}

.node-type {
  color: #868e96;
  font-style: italic;
  margin-left: 5px;
  font-size: 12px;
}

.node-count {
  color: #868e96;
  font-size: 12px;
}

.node-value {
  margin: 0 5px;
}

.inline-checkbox {
  display: inline-flex;
  margin: 0 4px;
}

.value-string {
  color: #37b24d;
}

.value-number {
  color: #339af0;
}

.value-boolean {
  color: #f03e3e;
}

.ellipsis {
  color: #868e96;
  font-style: italic;
  font-size: 12px;
}

.empty-object, .empty-array {
  color: #adb5bd;
  font-style: italic;
  font-size: 12px;
}
</style>
