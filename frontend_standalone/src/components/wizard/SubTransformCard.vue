<template>
  <q-card
    class="subtransform-card"
    :class="[
      `depth-${depth}`,
      { 'dragging': isDragging, 'drag-over': isDragOver }
    ]"
    :style="cardStyle"
    flat
    bordered
  >
    <!-- Card Header -->
    <q-card-section
      class="card-header"
      :class="{ 'cursor-pointer': true }"
      @click="toggleExpanded"
    >
      <div class="header-content">
        <q-icon
          name="drag_indicator"
          class="drag-handle"
          @mousedown.stop="startDrag"
          @click.stop
        >
          <q-tooltip>Drag to reorder</q-tooltip>
        </q-icon>

        <q-icon
          :name="depthIcon"
          :color="depthColor"
          size="24px"
          class="q-mr-sm"
        />

        <div class="header-info">
          <div class="header-title">
            <span class="subtransform-number">#{{ displayIndex }}</span>
            <q-input
              v-model="localName"
              dense
              borderless
              @blur="updateName"
              @click.stop
              @keyup.enter="$event.target.blur()"
              class="name-input"
              placeholder="Enter name..."
            />
          </div>

          <div class="header-summary" v-if="!expanded">
            <span class="summary-item">
              <q-icon name="filter_alt" size="xs" class="q-mr-xs" />
              {{ conditionSummary }}
            </span>
            <span class="summary-separator">•</span>
            <span class="summary-item">
              <q-icon name="swap_horiz" size="xs" class="q-mr-xs" />
              {{ transformCount }} transforms
            </span>
            <span v-if="subtransform.exitOnMatch" class="summary-separator">•</span>
            <span v-if="subtransform.exitOnMatch" class="summary-item exit-on-match">
              <q-icon name="stop_circle" size="xs" class="q-mr-xs" />
              Exit on Match
            </span>
          </div>
        </div>

        <q-space />

        <div class="header-actions" @click.stop>
          <q-btn
            flat
            dense
            round
            icon="arrow_upward"
            @click.stop="moveUp"
            :disable="index === 0"
            size="sm"
          >
            <q-tooltip>Move Up</q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            round
            icon="arrow_downward"
            @click.stop="moveDown"
            :disable="isLast"
            size="sm"
          >
            <q-tooltip>Move Down</q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click.stop="confirmDelete"
            size="sm"
          >
            <q-tooltip>Delete SubTransform</q-tooltip>
          </q-btn>

          <q-btn
            flat
            dense
            round
            :icon="expanded ? 'expand_less' : 'expand_more'"
            size="sm"
            @click.stop="toggleExpanded"
          >
            <q-tooltip>{{ expanded ? 'Collapse' : 'Expand' }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>

    <!-- Expandable Content -->
    <q-slide-transition>
      <div v-show="expanded" class="card-content">
        <!-- Condition Section -->
        <q-card-section class="condition-section">
          <div class="section-header">
            <div class="section-title-group">
              <h6 class="section-title">CONDITION</h6>
              <q-icon name="info" size="xs" class="q-ml-xs text-grey-6">
                <q-tooltip max-width="300px">
                  Define when this SubTransform should apply using JSONPath filter expressions
                </q-tooltip>
              </q-icon>
            </div>
            <q-btn
              unelevated
              dense
              icon="edit"
              label="Add/Edit Condition"
              @click="editCondition"
              size="sm"
              color="blue"
              text-color="black"
              no-caps
            />
          </div>

          <div class="condition-display" :class="{ 'no-condition': !subtransform.condition }">
            <code v-if="subtransform.condition">{{ subtransform.condition }}</code>
            <div v-else class="text-grey-6 text-center q-py-sm">
              <q-icon name="warning" class="q-mr-xs" />
              No condition defined yet. Click "Edit" to add one.
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- ExitOnMatch Section -->
        <q-card-section
          class="exit-on-match-section"
          :class="{ 'active': subtransform.exitOnMatch }"
        >
          <div class="section-header">
            <div class="section-title-group">
              <h6 class="section-title">EXIT ON MATCH</h6>
              <q-icon name="info" size="xs" class="q-ml-xs text-grey-6">
                <q-tooltip max-width="300px">
                  When enabled, if this SubTransform's condition matches,
                  no further SubTransforms will be evaluated.
                </q-tooltip>
              </q-icon>
            </div>
            <q-chip
              v-if="subtransform.exitOnMatch"
              size="sm"
              color="amber-9"
              text-color="white"
              icon="stop_circle"
            >
              Enabled
            </q-chip>
          </div>

          <q-toggle
            v-model="localExitOnMatch"
            label="Stop processing after this SubTransform matches"
            color="amber-9"
            keep-color
          />
        </q-card-section>

        <q-separator />

        <!-- Transforms Section -->
        <q-card-section class="transforms-section">
          <div class="section-header">
            <div class="section-title-group">
              <h6 class="section-title">FIELD MAPPINGS</h6>
              <q-chip size="sm" color="primary" text-color="white">
                {{ transformCount }}
              </q-chip>
            </div>
            <q-btn
              unelevated
              dense
              icon="add"
              label="Add Mapping"
              @click="addTransform"
              size="sm"
              color="blue"
              text-color="black"
              no-caps
            />
          </div>

          <div v-if="transformCount === 0" class="empty-transforms">
            <q-icon name="info" color="grey-6" size="md" />
            <span class="text-grey-6 q-ml-sm">No transforms configured yet</span>
          </div>

          <div v-else class="transforms-list">
            <div
              v-for="(transform, tIndex) in subtransform.transforms"
              :key="`transform-${tIndex}`"
              class="transform-item"
            >
              <div class="transform-content">
                <q-icon name="swap_horiz" size="sm" color="primary" class="q-mr-sm" />
                <div class="transform-mapping">
                  <span class="transform-source">{{ getTransformSource(transform) }}</span>
                  <q-icon name="arrow_forward" size="xs" class="q-mx-xs text-grey-6" />
                  <span class="transform-target">{{ transform.LRSchemaField }}</span>
                </div>
              </div>
              <div class="transform-actions">
                <q-btn
                  flat
                  dense
                  round
                  icon="edit"
                  size="xs"
                  color="primary"
                  @click="editTransform(tIndex)"
                >
                  <q-tooltip>Edit mapping</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  dense
                  round
                  icon="delete"
                  size="xs"
                  color="negative"
                  @click="deleteTransform(tIndex)"
                >
                  <q-tooltip>Delete mapping</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Nested SubTransforms Section -->
        <template v-if="canAddNested">
          <q-separator />

          <q-card-section class="nested-section">
            <div class="section-header">
              <div class="section-title-group">
                <h6 class="section-title">NESTED SUBTRANSFORMS</h6>
                <q-chip size="sm" color="secondary" text-color="white">
                  {{ nestedCount }}
                </q-chip>
                <q-icon name="info" size="xs" class="q-ml-xs text-grey-6">
                  <q-tooltip max-width="300px">
                    Add nested SubTransforms for complex conditional logic.
                    Maximum nesting depth: {{ maxDepth }}
                  </q-tooltip>
                </q-icon>
              </div>
              <q-btn
                unelevated
                dense
                icon="add"
                label="Add Nested SubTransform"
                @click="addNested"
                size="sm"
                color="blue"
                text-color="black"
                no-caps
              />
            </div>

            <div v-if="nestedCount === 0" class="empty-nested">
              <q-icon name="info" color="grey-6" size="md" />
              <span class="text-grey-6 q-ml-sm">No nested SubTransforms</span>
            </div>

            <div v-else class="nested-list q-mt-md">
              <SubTransformCard
                v-for="(nested, nIndex) in subtransform.subTransforms"
                :key="nested.id"
                :subtransform="nested"
                :index="nIndex"
                :depth="depth + 1"
                :max-depth="maxDepth"
                :is-last="nIndex === subtransform.subTransforms.length - 1"
                class="nested-card q-mb-md"
                @update="updateNested"
                @delete="deleteNested"
                @reorder="reorderNested"
                @edit-condition="$emit('edit-condition', $event)"
                @edit-transform="$emit('edit-transform', $event)"
              />
            </div>
          </q-card-section>
        </template>
      </div>
    </q-slide-transition>
  </q-card>
</template>

<script>
export default {
  name: 'SubTransformCard',

  // Explicitly register self for recursion to avoid webpack bundling issues
  components: {
    // eslint-disable-next-line vue/no-unused-components
    SubTransformCard: () => import('./SubTransformCard.vue')
  },

  props: {
    subtransform: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    maxDepth: {
      type: Number,
      default: 3
    },
    isLast: {
      type: Boolean,
      default: false
    },
    parentIndex: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      expanded: true,
      isDragging: false,
      isDragOver: false,
      localName: this.subtransform.name || ''
    }
  },

  computed: {
    displayIndex () {
      if (this.depth === 0) {
        return this.index + 1
      }
      if (this.parentIndex) {
        return `${this.parentIndex}.${this.index + 1}`
      }
      return `${this.index + 1}`
    },

    depthIcon () {
      const icons = ['account_tree_outline', 'subdirectory_arrow_right', 'chevron_right', 'more_horiz']
      return icons[Math.min(this.depth, icons.length - 1)]
    },

    depthColor () {
      const colors = ['primary', 'green-6', 'orange-6', 'purple-6']
      return colors[Math.min(this.depth, colors.length - 1)]
    },

    cardStyle () {
      const indent = this.depth * 24
      const style = {
        marginLeft: `${indent}px`
      }

      if (this.depth > 0) {
        const colorMap = {
          primary: '#42A5F5',
          'green-6': '#66BB6A',
          'orange-6': '#FFA726',
          'purple-6': '#AB47BC'
        }
        style.borderLeft = `3px solid ${colorMap[this.depthColor] || '#42A5F5'}`
      }

      return style
    },

    conditionSummary () {
      if (!this.subtransform.condition) return 'No condition'
      return this.subtransform.condition.length > 50
        ? this.subtransform.condition.substring(0, 50) + '...'
        : this.subtransform.condition
    },

    transformCount () {
      return this.subtransform.transforms?.length || 0
    },

    nestedCount () {
      return this.subtransform.subTransforms?.length || 0
    },

    canAddNested () {
      return this.depth < this.maxDepth
    },

    localExitOnMatch: {
      get () {
        return this.subtransform.exitOnMatch
      },
      set (value) {
        this.updateExitOnMatch(value)
      }
    }
  },

  watch: {
    'subtransform.name' (newVal) {
      this.localName = newVal
    }
  },

  mounted () {
    this.$root.$on('subtransform-expand-all', this.handleExpandAll)
    this.$root.$on('subtransform-collapse-all', this.handleCollapseAll)
  },

  beforeDestroy () {
    this.$root.$off('subtransform-expand-all', this.handleExpandAll)
    this.$root.$off('subtransform-collapse-all', this.handleCollapseAll)
  },

  methods: {
    toggleExpanded () {
      this.expanded = !this.expanded
    },

    handleExpandAll () {
      this.expanded = true
    },

    handleCollapseAll () {
      this.expanded = false
    },

    updateName () {
      if (this.localName !== this.subtransform.name) {
        this.$emit('update', {
          id: this.subtransform.id,
          updates: { name: this.localName }
        })
      }
    },

    updateExitOnMatch (value) {
      this.$emit('update', {
        id: this.subtransform.id,
        updates: { exitOnMatch: value }
      })
    },

    moveUp () {
      if (this.index > 0) {
        this.$emit('reorder', {
          oldIndex: this.index,
          newIndex: this.index - 1
        })
      }
    },

    moveDown () {
      if (!this.isLast) {
        this.$emit('reorder', {
          oldIndex: this.index,
          newIndex: this.index + 1
        })
      }
    },

    confirmDelete () {
      this.$emit('delete', this.subtransform.id)
    },

    startDrag (event) {
      // TODO: Implement drag-and-drop in Phase 5
      console.log('Drag started', event)
    },

    editCondition () {
      // Emit to parent (Step6_SubTransformConfig) to open modal
      this.$emit('edit-condition', this.subtransform.id)
    },

    addTransform () {
      // Emit to parent (Step6_SubTransformConfig) to open modal in add mode
      this.$emit('edit-transform', {
        subtransformId: this.subtransform.id,
        transformIndex: -1, // -1 indicates new transform
        mode: 'add'
      })
    },

    editTransform (transformIndex) {
      // Emit to parent (Step6_SubTransformConfig) to open modal in edit mode
      this.$emit('edit-transform', {
        subtransformId: this.subtransform.id,
        transformIndex: transformIndex,
        mode: 'edit'
      })
    },

    deleteTransform (transformIndex) {
      this.$q.dialog({
        title: 'Delete Transform?',
        message: 'This action cannot be undone.',
        cancel: true,
        persistent: true
      }).onOk(() => {
        const updatedTransforms = [...this.subtransform.transforms]
        updatedTransforms.splice(transformIndex, 1)

        this.$emit('update', {
          id: this.subtransform.id,
          updates: { transforms: updatedTransforms }
        })
      })
    },

    addNested () {
      const newNestedSubTransform = {
        id: this.generateUUID(),
        name: `Nested ${this.nestedCount + 1}`,
        condition: '',
        exitOnMatch: false,
        transforms: [],
        subTransforms: []
      }

      const updatedSubTransforms = [
        ...(this.subtransform.subTransforms || []),
        newNestedSubTransform
      ]

      this.$emit('update', {
        id: this.subtransform.id,
        updates: { subTransforms: updatedSubTransforms }
      })
    },

    updateNested (payload) {
      // Find and update the nested SubTransform
      const updatedSubTransforms = this.subtransform.subTransforms.map(nested =>
        nested.id === payload.id ? { ...nested, ...payload.updates } : nested
      )

      this.$emit('update', {
        id: this.subtransform.id,
        updates: { subTransforms: updatedSubTransforms }
      })
    },

    deleteNested (nestedId) {
      const updatedSubTransforms = this.subtransform.subTransforms.filter(
        nested => nested.id !== nestedId
      )

      this.$emit('update', {
        id: this.subtransform.id,
        updates: { subTransforms: updatedSubTransforms }
      })
    },

    reorderNested ({ oldIndex, newIndex }) {
      const updatedSubTransforms = [...this.subtransform.subTransforms]
      const [moved] = updatedSubTransforms.splice(oldIndex, 1)
      updatedSubTransforms.splice(newIndex, 0, moved)

      this.$emit('update', {
        id: this.subtransform.id,
        updates: { subTransforms: updatedSubTransforms }
      })
    },

    getTransformSource (transform) {
      return transform.inputRule || transform.inputrule || '(not set)'
    },

    generateUUID () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.subtransform-card {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);

  &.dragging {
    opacity: 0.5;
    transform: scale(0.98);
  }

  &.drag-over {
    border-color: var(--q-primary);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
  }

  .card-header {
    background: var(--q-grey-1);
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--q-grey-2);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .drag-handle {
        cursor: grab;
        color: var(--q-grey-6);
        transition: color 0.2s;

        &:hover {
          color: var(--q-primary);
        }

        &:active {
          cursor: grabbing;
        }
      }

      .header-info {
        flex: 1;
        min-width: 0;

        .header-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          .subtransform-number {
            font-weight: 600;
            color: var(--q-primary);
            font-size: 14px;
          }

          .name-input {
            flex: 1;
            min-width: 0;

            ::v-deep .q-field__control {
              height: 28px;
            }

            ::v-deep .q-field__native {
              font-weight: 500;
              font-size: 14px;
            }
          }
        }

        .header-summary {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--q-grey-7);
          flex-wrap: wrap;

          .summary-item {
            display: flex;
            align-items: center;

            &.exit-on-match {
              color: var(--q-amber-9);
              font-weight: 500;
            }
          }

          .summary-separator {
            color: var(--q-grey-5);
          }
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }

  .card-content {
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;

      .section-title-group {
        display: flex;
        align-items: center;

        .section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--q-grey-7);
          margin: 0;
        }
      }
    }

    .condition-section {
      .condition-display {
        padding: 12px 16px;
        background: var(--q-grey-1);
        border: 1px solid var(--q-grey-3);
        border-radius: 6px;

        &.no-condition {
          border-style: dashed;
        }

        code {
          font-family: 'Roboto Mono', monospace;
          font-size: 13px;
          color: var(--q-primary);
          word-break: break-all;
        }
      }
    }

    .exit-on-match-section {
      background: #FFF3E0;
      transition: background 0.3s;

      &.active {
        background: #FFE0B2;
        border-left: 3px solid var(--q-amber-9);
      }

      ::v-deep .q-toggle__label {
        font-size: 13px;
      }
    }

    .transforms-section {
      .empty-transforms {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: var(--q-grey-1);
        border: 1px dashed var(--q-grey-4);
        border-radius: 6px;
      }

      .transforms-list {
        .transform-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: var(--q-grey-1);
          border: 1px solid var(--q-grey-3);
          border-radius: 6px;
          margin-bottom: 8px;
          transition: all 0.2s;

          &:hover {
            background: var(--q-grey-2);
            border-color: var(--q-primary);
          }

          .transform-content {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;

            .transform-mapping {
              display: flex;
              align-items: center;
              flex: 1;
              min-width: 0;
              font-size: 13px;

              .transform-source {
                font-family: 'Roboto Mono', monospace;
                color: var(--q-green-7);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .transform-target {
                font-family: 'Roboto Mono', monospace;
                color: var(--q-primary);
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }

          .transform-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
          }
        }
      }
    }

    .nested-section {
      .empty-nested {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: var(--q-grey-1);
        border: 1px dashed var(--q-grey-4);
        border-radius: 6px;
      }

      .nested-list {
        .nested-card {
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

// Depth-specific styling
.subtransform-card {
  &.depth-0 {
    background: #FFFFFF;
  }

  &.depth-1 {
    background: #FAFAFA;
  }

  &.depth-2 {
    background: #F5F5F5;
  }

  &.depth-3 {
    background: #EEEEEE;
  }
}

// Dark mode
body.body--dark {
  .subtransform-card {
    .card-header {
      background: var(--q-dark-page);

      &:hover {
        background: lighten(#1E1E1E, 5%);
      }
    }

    .card-content {
      .condition-section {
        .condition-display {
          background: var(--q-dark-page);
          border-color: var(--q-dark);
        }
      }

      .exit-on-match-section {
        background: rgba(255, 111, 0, 0.15);

        &.active {
          background: rgba(255, 111, 0, 0.25);
        }
      }

      .transforms-section {
        .empty-transforms {
          background: var(--q-dark-page);
        }

        .transforms-list {
          .transform-item {
            background: var(--q-dark-page);
            border-color: var(--q-dark);

            &:hover {
              background: lighten(#1E1E1E, 5%);
            }
          }
        }
      }

      .nested-section {
        .empty-nested {
          background: var(--q-dark-page);
        }
      }
    }

    &.depth-0 {
      background: #2C2C2C;
    }

    &.depth-1 {
      background: #272727;
    }

    &.depth-2 {
      background: #222222;
    }

    &.depth-3 {
      background: #1D1D1D;
    }
  }
}
</style>
