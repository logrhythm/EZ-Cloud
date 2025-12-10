<template>
  <div
    v-show="isVisible"
    class="json-tree-node"
    :class="{
      'is-expandable': isExpandable,
      'is-expanded': isExpanded,
      'is-array': isArray,
      'is-object': isObject,
      'is-primitive': !isExpandable,
      'has-children': hasChildren,
      'is-selectable': selectable,
      'is-selected': isSelected,
      'is-mapped': isMapped,
      'is-highlighted': isHighlighted,
      'is-clickable': isClickable,
      'is-search-match': hasSearchQuery && matchesSearch
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

    <!-- NEW: Mapping status indicator (checkmark for mapped fields) -->
    <div v-if="clickableMode" class="mapping-status">
      <q-icon
        v-if="isMapped"
        name="check_circle"
        size="1rem"
        color="positive"
        class="mapped-icon"
      >
        <q-tooltip>Mapped field</q-tooltip>
      </q-icon>
      <div v-else class="mapping-placeholder"></div>
    </div>

    <!-- NEW: Type icon -->
    <div v-if="clickableMode" class="type-icon">
      <q-icon
        :name="typeIcon"
        size="0.9rem"
        :style="{ color: typeColor }"
      />
    </div>

    <!-- Key for object properties -->
    <div
      v-if="data.key !== undefined"
      class="node-key"
      :class="{ 'node-key-clickable': isClickable }"
      @click="handleNodeClick"
    >
      {{ data.key }}:
    </div>

    <!-- Node content -->
    <div class="node-content" @click="handleNodeClick">
      <!-- Array/object summary -->
      <div
        v-if="isExpandable"
        class="node-summary"
        @click="toggleExpanded"
      >
        <span class="node-type">
          {{ isArray ? '[...]' : '{...}' }}
        </span>

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
      </div>

      <!-- Primitive value display (schema-only mode - no values shown) -->
      <div v-else class="node-value-schema" :class="`value-${data.type}`">
        <!-- Type indicator only -->
        <span class="type-label">{{ formatTypeName(data.type) }}</span>

        <!-- Tooltip with aggregated values and mapping hint -->
        <q-tooltip
          v-if="clickableMode || hasAggregatedValues"
          :delay="200"
          anchor="top left"
          self="bottom left"
          :offset="[0, 10]"
          max-width="400px"
          class="value-tooltip"
        >
          <div class="tooltip-content">
            <!-- Mapping hint -->
            <div v-if="clickableMode" class="mapping-hint">
              <q-icon name="touch_app" size="xs" class="q-mr-xs" />
              <strong>Click on '{{ fieldName }}' to {{ isMapped ? 'edit' : 'map' }} it to a LogRhythm field</strong>
            </div>

            <!-- Sample values -->
            <div v-if="hasAggregatedValues" class="sample-values">
              <div class="sample-label">Sample values:</div>
              <div class="values-list">
                <div
                  v-for="(val, idx) in displayedValues"
                  :key="idx"
                  class="value-item"
                >
                  <code>{{ formatValue(val) }}</code>
                </div>
                <div v-if="hasMoreValues" class="more-values">
                  ... and {{ remainingValuesCount }} more
                </div>
              </div>
            </div>

            <!-- Type info -->
            <div class="type-info">
              <span class="type-badge">Type: {{ data.type }}</span>
            </div>
          </div>
        </q-tooltip>
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
        v-for="(child, index) in visibleChildren"
        :key="`${data.path}_${index}`"
        :data="child"
        :expanded-nodes="expandedNodes"
        :selectable-types="selectableTypes"
        :selected-fields="selectedFields"
        :show-path="showPath"
        :mapped-paths="mappedPaths"
        :highlighted-path="highlightedPath"
        :clickable-mode="clickableMode"
        :search-query="searchQuery"
        @toggle="onToggle"
        @select="onSelect"
        @node-click="$emit('node-click', $event)"
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
    },
    // NEW: Search query for filtering tree nodes
    searchQuery: {
      type: String,
      default: ''
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
    },

    // NEW: Check if this node is mapped
    isMapped () {
      return this.mappedPaths.has(this.data.path)
    },

    // NEW: Check if this node is highlighted
    isHighlighted () {
      return this.highlightedPath === this.data.path
    },

    // NEW: Check if this is a leaf node (can be clicked for mapping)
    isLeafNode () {
      return !this.isExpandable
    },

    // NEW: Check if this node is clickable
    isClickable () {
      return this.clickableMode && this.isLeafNode
    },

    // NEW: Get type icon for the node
    typeIcon () {
      const iconMap = {
        string: 'description',
        number: 'tag',
        boolean: 'check_box',
        object: 'folder',
        array: 'view_list',
        null: 'block'
      }
      return iconMap[this.data.type] || 'help'
    },

    // NEW: Get type color
    typeColor () {
      const colorMap = {
        string: '#A5D6A7', // green
        number: '#90CAF9', // blue
        boolean: '#CE93D8', // purple
        object: '#FFD54F', // yellow
        array: '#FF8A65', // orange
        null: '#BDBDBD' // grey
      }
      return colorMap[this.data.type] || '#BDBDBD'
    },

    // NEW: Check if node has aggregated values
    hasAggregatedValues () {
      return this.data.aggregatedValues && this.data.aggregatedValues.length > 0
    },

    // NEW: Get displayed values (limit to first 5)
    displayedValues () {
      if (!this.hasAggregatedValues) {
        return []
      }
      return this.data.aggregatedValues.slice(0, 5)
    },

    // NEW: Check if there are more values than displayed
    hasMoreValues () {
      return this.hasAggregatedValues && this.data.aggregatedValues.length > 5
    },

    // NEW: Get count of remaining values
    remainingValuesCount () {
      if (!this.hasAggregatedValues) {
        return 0
      }
      return this.data.aggregatedValues.length - 5
    },

    // NEW: Get field name for tooltip
    fieldName () {
      if (this.data.key) {
        return this.data.key
      }
      // Extract field name from path
      const parts = this.data.path.split('.')
      return parts[parts.length - 1] || this.data.path
    },

    // NEW: Check if search is active
    hasSearchQuery () {
      return this.searchQuery && this.searchQuery.trim().length > 0
    },

    // NEW: Check if this node matches the search query
    matchesSearch () {
      if (!this.hasSearchQuery) {
        return true // Show all nodes when no search
      }

      const query = this.searchQuery.toLowerCase().trim()

      // Check if key matches
      if (this.data.key && this.data.key.toLowerCase().includes(query)) {
        return true
      }

      // Check if path matches
      if (this.data.path && this.data.path.toLowerCase().includes(query)) {
        return true
      }

      // Check if any aggregated value matches (for primitive types)
      if (this.hasAggregatedValues) {
        return this.data.aggregatedValues.some(val => {
          if (val === null || val === undefined) return false
          return String(val).toLowerCase().includes(query)
        })
      }

      // Check if single value matches
      if (this.data.value !== undefined && this.data.value !== null) {
        return String(this.data.value).toLowerCase().includes(query)
      }

      return false
    },

    // NEW: Check if any descendant matches search
    hasMatchingDescendant () {
      if (!this.hasSearchQuery || !this.hasChildren) {
        return false
      }

      return this.checkDescendantsMatch(this.data)
    },

    // NEW: Determine if node should be visible based on search
    isVisible () {
      if (!this.hasSearchQuery) {
        return true // Show all when no search
      }

      // Show if this node matches
      if (this.matchesSearch) {
        return true
      }

      // Show if any descendant matches (for parent nodes)
      if (this.hasMatchingDescendant) {
        return true
      }

      return false
    },

    // NEW: Filter visible children based on search
    visibleChildren () {
      if (!this.hasChildren) {
        return []
      }

      if (!this.hasSearchQuery) {
        return this.data.children
      }

      // Return all children - let each child determine its own visibility
      return this.data.children
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
    },

    // NEW: Recursively check if any descendant matches search
    checkDescendantsMatch (node) {
      if (!node || !node.children || node.children.length === 0) {
        return false
      }

      const query = this.searchQuery.toLowerCase().trim()

      for (const child of node.children) {
        // Check if child matches
        if (child.key && child.key.toLowerCase().includes(query)) {
          return true
        }

        if (child.path && child.path.toLowerCase().includes(query)) {
          return true
        }

        // Check child's value or aggregated values
        if (child.aggregatedValues && child.aggregatedValues.length > 0) {
          const hasMatchingValue = child.aggregatedValues.some(val => {
            if (val === null || val === undefined) return false
            return String(val).toLowerCase().includes(query)
          })
          if (hasMatchingValue) {
            return true
          }
        }

        if (child.value !== undefined && child.value !== null) {
          if (String(child.value).toLowerCase().includes(query)) {
            return true
          }
        }

        // Recursively check child's descendants
        if (this.checkDescendantsMatch(child)) {
          return true
        }
      }

      return false
    },

    // NEW: Handle node click for mapping
    handleNodeClick () {
      if (this.isClickable) {
        this.$emit('node-click', {
          path: this.data.path,
          type: this.data.type,
          value: this.data.value,
          key: this.data.key,
          isMapped: this.isMapped,
          aggregatedValues: this.data.aggregatedValues || []
        })
      }
    },

    // NEW: Format type name for display
    formatTypeName (type) {
      const typeMap = {
        string: 'string',
        number: 'number',
        boolean: 'boolean',
        object: 'object',
        array: 'array',
        null: 'null'
      }
      return typeMap[type] || type
    },

    // NEW: Format value for tooltip display
    formatValue (value) {
      if (value === null) {
        return 'null'
      }
      if (value === undefined) {
        return 'undefined'
      }
      if (typeof value === 'string') {
        // Truncate long strings
        if (value.length > 100) {
          return `"${value.substring(0, 100)}..."`
        }
        return `"${value}"`
      }
      if (typeof value === 'object') {
        try {
          const str = JSON.stringify(value)
          if (str.length > 100) {
            return str.substring(0, 100) + '...'
          }
          return str
        } catch (e) {
          return '[Object]'
        }
      }
      return String(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.json-tree-node {
  position: relative;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 1rem; /* Increased from 0.9rem for better readability */
  line-height: 1.6;
  padding-left: 0.5rem;
  margin: 0.35rem 0; /* Slightly increased spacing between nodes */
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
  flex: 0 0 1.4rem; /* Increased from 1.2rem */
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 0.125rem;

  .q-icon {
    font-size: 1.3rem; /* Larger toggle icon */
  }
}

.node-toggle-placeholder {
  visibility: hidden;
}

.node-key {
  font-weight: 600; /* Increased from 500 for better readability */
  font-size: 1.05rem; /* Slightly larger key names */
  margin-right: 0.5rem;
  color: var(--q-secondary);

  .dark-theme & {
    color: #ff9800;
  }

  &.node-key-clickable {
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0.125rem 0.25rem;
    border-radius: 4px;

    &:hover {
      background-color: rgba(33, 150, 243, 0.15);
      color: #2196F3;
      font-weight: 700;

      .dark-theme & {
        background-color: rgba(33, 150, 243, 0.2);
        color: #64b5f6;
      }
    }

    &:active {
      background-color: rgba(33, 150, 243, 0.25);
    }
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

// NEW: Clickable nodes for mapping
.is-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  padding-left: 0.25rem;

  &:hover {
    background-color: rgba(33, 150, 243, 0.1);
    border-left-color: #2196F3;

    .node-content {
      font-weight: 500;
    }
  }

  &:active {
    background-color: rgba(33, 150, 243, 0.15);
  }
}

// NEW: Mapped field styling
.is-mapped {
  background-color: rgba(76, 175, 80, 0.05);
  border-left: 3px solid #4CAF50;

  &:hover {
    background-color: rgba(76, 175, 80, 0.1);
    border-left-color: #4CAF50;
  }
}

// NEW: Highlighted field (from "show in tree")
.is-highlighted {
  background-color: rgba(255, 193, 7, 0.2);
  border-left: 3px solid #FFC107;
  animation: highlight-pulse 2s ease-in-out;

  @keyframes highlight-pulse {
    0%, 100% {
      background-color: rgba(255, 193, 7, 0.2);
    }
    50% {
      background-color: rgba(255, 193, 7, 0.4);
    }
  }
}

// NEW: Search match highlight
.is-search-match {
  background-color: rgba(255, 235, 59, 0.15);
  border-left: 3px solid #FFEB3B;

  .node-key {
    color: #FDD835;
    font-weight: 700;
  }

  &:hover {
    background-color: rgba(255, 235, 59, 0.25);
  }
}

// NEW: Mapping status indicator
.mapping-status {
  flex: 0 0 1.4rem; /* Increased from 1.2rem */
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.25rem;

  .q-icon {
    font-size: 1.2rem; /* Larger checkmark icon */
  }
}

.mapping-placeholder {
  width: 1.2rem; /* Increased from 1rem */
  height: 1.2rem;
}

.mapped-icon {
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
}

// NEW: Type icon styling
.type-icon {
  flex: 0 0 1.2rem; /* Increased from 1rem */
  width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.25rem;
  opacity: 0.7;

  .q-icon {
    font-size: 1.1rem; /* Larger type icon */
  }
}

// NEW: Schema-only value display
.node-value-schema {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.6rem; /* Slightly increased padding */
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);

  .type-label {
    font-size: 0.85rem; /* Increased from 0.75rem */
    font-weight: 500;
    font-style: italic;
    opacity: 0.7;
    color: #90CAF9;
  }

  &.value-string .type-label {
    color: #A5D6A7;
  }

  &.value-number .type-label {
    color: #90CAF9;
  }

  &.value-boolean .type-label {
    color: #CE93D8;
  }

  &.value-null .type-label {
    color: #BDBDBD;
  }
}

@media (max-width: 600px) {
  .json-tree-node {
    font-size: 0.95rem; /* Increased from 0.8rem for better mobile readability */
  }

  .node-path {
    display: none;
  }

  .type-icon {
    display: none;
  }
}
</style>

<style lang="scss">
// Global styles for tooltip (must be unscoped for q-tooltip portal)

.value-tooltip {
  background: #1a1a1a !important;
  border: 1px solid #2196F3 !important;
  border-radius: 8px !important;
  padding: 0 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;

  .q-tooltip__content {
    padding: 0 !important;
    background: transparent !important;
  }

  .tooltip-content {
    padding: 12px;
    color: #E3F2FD;
    font-size: 0.95rem; /* Increased from 0.875rem for better readability */
    line-height: 1.5;
  }

  .mapping-hint {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: rgba(33, 150, 243, 0.15);
    border-radius: 6px;
    margin-bottom: 10px;
    border-left: 3px solid #2196F3;

    strong {
      color: #2196F3;
    }
  }

  .sample-values {
    margin-bottom: 10px;

    .sample-label {
      font-weight: 600;
      margin-bottom: 6px;
      color: #90CAF9;
      font-size: 0.85rem; /* Increased from 0.8rem */
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .values-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .value-item {
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      border-left: 2px solid #4CAF50;

      code {
        font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        font-size: 0.9rem; /* Increased from 0.8rem */
        color: #A5D6A7;
        word-break: break-all;
      }
    }

    .more-values {
      padding: 4px 8px;
      font-style: italic;
      color: #90CAF9;
      font-size: 0.8rem; /* Increased from 0.75rem */
    }
  }

  .type-info {
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .type-badge {
      display: inline-block;
      padding: 2px 8px;
      background: rgba(144, 202, 249, 0.2);
      border-radius: 4px;
      color: #90CAF9;
      font-size: 0.8rem; /* Increased from 0.75rem */
      font-weight: 600;
    }
  }
}
</style>
