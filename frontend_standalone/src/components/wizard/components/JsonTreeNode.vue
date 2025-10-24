<template>
  <div
    class="json-tree-node"
    :class="{
      'is-expandable': isExpandable,
      'is-expanded': isExpanded,
      'is-array': isArray,
      'is-object': isObject,
      'is-primitive': !isExpandable,
      'has-children': hasChildren,
      'is-selectable': selectable,
      'is-selected': isSelected
    }"
  >
    <!-- Node toggle for expandable items -->
    <div
      v-if="isExpandable"
      class="node-toggle"
      @click="toggleExpanded"
    >
      <q-icon :name="isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'" size="1rem" />
    </div>
    <div v-else class="node-toggle-placeholder"></div>

    <!-- Key for object properties -->
    <div v-if="data.key !== undefined" class="node-key">
      {{ data.key }}:
    </div>

    <!-- Node content -->
    <div class="node-content">
      <!-- Array/object summary -->
      <div
        v-if="isExpandable"
        class="node-summary"
        @click="toggleExpanded"
      >
        <span class="node-type">
          {{ isArray ? '[' : '{' }}
        </span>

        <span class="node-value">{{ data.value }}</span>

        <!-- Selection checkbox for arrays (when selectable) -->
        <template v-if="selectable && isArray">
          <q-checkbox
            v-model="nodeSelected"
            dense
            class="array-checkbox"
            @click.stop
          >
            <q-tooltip>Select this array for fanout processing</q-tooltip>
          </q-checkbox>
        </template>

        <span class="node-type">
          {{ isArray ? ']' : '}' }}
        </span>
      </div>

      <!-- Primitive value display -->
      <div v-else class="node-value" :class="`value-${data.type}`">
        <template v-if="data.type === 'string'">
          <span class="string-quote">"</span>
          <span class="string-value">{{ truncatedValue }}</span>
          <span class="string-quote">"</span>

          <!-- String actions for likely JSON strings -->
          <div v-if="isLikelyJson && selectable" class="string-actions">
            <q-checkbox
              v-model="nodeSelected"
              label="JSON"
              dense
              class="json-checkbox"
            >
              <q-tooltip>This string looks like JSON. Select to parse it during processing.</q-tooltip>
            </q-checkbox>
          </div>
        </template>

        <template v-else-if="data.type === 'null'">
          <span class="null-value">null</span>
        </template>

        <template v-else>
          {{ data.value }}
        </template>
      </div>

      <!-- Path label (optional) -->
      <div v-if="showPath" class="node-path">
        {{ data.path }}
      </div>
    </div>

    <!-- Child nodes -->
    <div
      v-if="isExpandable && isExpanded"
      class="node-children"
    >
      <json-tree-node
        v-for="(child, index) in data.children"
        :key="`${data.path}_${index}`"
        :data="child"
        :expanded-nodes="expandedNodes"
        :selectable-types="selectableTypes"
        :selected-fields="selectedFields"
        :show-path="showPath"
        @toggle="onToggle"
        @select="onSelect"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'JsonTreeNode',

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
    }
  },

  computed: {
    isObject () {
      return this.data.type === 'object'
    },

    isArray () {
      return this.data.type === 'array'
    },

    isExpandable () {
      return (this.isObject || this.isArray) && this.hasChildren
    },

    isExpanded () {
      return this.expandedNodes.has(this.data.path)
    },

    hasChildren () {
      return this.data.children && this.data.children.length > 0
    },

    selectable () {
      return this.selectableTypes.includes(this.data.type)
    },

    isSelected: {
      get () {
        return this.selectedFields.has(this.data.path)
      },
      set (value) {
        if (value) {
          this.selectedFields.add(this.data.path)
        } else {
          this.selectedFields.delete(this.data.path)
        }
      }
    },

    nodeSelected: {
      get () {
        return this.isSelected
      },
      set (value) {
        this.isSelected = value
        this.$emit('select', {
          path: this.data.path,
          selected: value,
          type: this.data.type
        })
      }
    },

    // Check if string might be stringified JSON
    isLikelyJson () {
      if (this.data.type !== 'string' || !this.data.value) return false

      const value = String(this.data.value).trim()
      return (value.startsWith('{') && value.endsWith('}')) ||
             (value.startsWith('[') && value.endsWith(']'))
    },

    // Truncate long string values
    truncatedValue () {
      if (this.data.type !== 'string') return this.data.value

      const value = String(this.data.value)
      const maxLength = 50

      if (value.length <= maxLength) return value

      return value.substring(0, maxLength) + '...'
    }
  },

  methods: {
    toggleExpanded () {
      this.$emit('toggle', this.data.path)
    },

    onToggle (path) {
      this.$emit('toggle', path)
    },

    onSelect (data) {
      this.$emit('select', data)
    }
  }
}
</script>

<style lang="scss" scoped>
.json-tree-node {
  position: relative;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  padding-left: 0.5rem;
  margin: 0.25rem 0;
  display: flex;
  align-items: flex-start;

  &.has-children {
    flex-wrap: wrap;
  }

  &.is-primitive {
    cursor: default;
  }

  &.is-selected {
    background-color: rgba(var(--q-primary-rgb), 0.1);
  }
}

.node-toggle,
.node-toggle-placeholder {
  flex: 0 0 1.2rem;
  width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 0.125rem;
}

.node-toggle-placeholder {
  visibility: hidden;
}

.node-key {
  font-weight: 500;
  margin-right: 0.5rem;
  color: var(--q-secondary);

  .dark-theme & {
    color: #ff9800;
  }
}

.node-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.node-summary {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;

  &:hover {
    background-color: rgba(var(--q-primary-rgb), 0.06);
  }
}

.node-type {
  color: var(--q-primary);

  .dark-theme & {
    color: #64b5f6;
  }
}

.node-value {
  &.value-string {
    color: #388e3c;

    .dark-theme & {
      color: #81c784;
    }
  }

  &.value-number {
    color: #0277bd;

    .dark-theme & {
      color: #29b6f6;
    }
  }

  &.value-boolean {
    color: #6a1b9a;

    .dark-theme & {
      color: #ba68c8;
    }
  }

  &.value-null {
    color: #757575;
    font-style: italic;

    .dark-theme & {
      color: #9e9e9e;
    }
  }
}

.string-quote {
  opacity: 0.6;
}

.null-value {
  font-style: italic;
}

.node-path {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-left: 1rem;
  color: var(--q-grey-7);

  .dark-theme & {
    color: var(--q-grey-5);
  }
}

.node-children {
  flex: 0 0 100%;
  margin-left: 1rem;
  border-left: 1px dashed var(--q-grey-4);

  .dark-theme & {
    border-color: var(--q-grey-7);
  }
}

.array-checkbox,
.json-checkbox {
  margin-left: 0.5rem;
}

.string-actions {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
}

// Type-specific styling
.is-array {
  > .node-content > .node-summary {
    color: var(--q-primary);

    .dark-theme & {
      color: #29b6f6;
    }
  }
}

.is-object {
  > .node-content > .node-summary {
    color: var(--q-secondary);

    .dark-theme & {
      color: #ff9800;
    }
  }
}

// Selectable items highlight
.is-selectable {
  &:hover {
    background-color: rgba(var(--q-primary-rgb), 0.03);
  }
}

@media (max-width: 600px) {
  .json-tree-node {
    font-size: 0.8rem;
  }

  .node-path {
    display: none;
  }
}
</style>
