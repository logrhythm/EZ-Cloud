<template>
  <div
    class="operation-card"
    :class="{ 'selected': isSelected, 'disabled': disabled }"
    @click="handleClick"
  >
    <div class="card-header">
      <div class="card-icon" :style="{ backgroundColor: categoryColor }">
        <q-icon :name="icon" size="32px" color="white" />
      </div>
      <div class="card-category-badge" :style="{ backgroundColor: categoryColor }">
        {{ category }}
      </div>
    </div>

    <div class="card-content">
      <div class="card-title">{{ label }}</div>
      <div class="card-description">{{ description }}</div>

      <div v-if="example" class="card-example">
        <q-icon name="tips_and_updates" size="14px" />
        <span>{{ example }}</span>
      </div>
    </div>

    <div v-if="isSelected" class="card-selected-indicator">
      <q-icon name="check_circle" size="24px" color="primary" />
    </div>

    <q-tooltip v-if="tooltip" anchor="top middle" self="bottom middle" :delay="500">
      {{ tooltip }}
    </q-tooltip>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'OperationCard',
  props: {
    operationType: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'settings'
    },
    category: {
      type: String,
      default: ''
    },
    example: {
      type: String,
      default: ''
    },
    tooltip: {
      type: String,
      default: ''
    },
    isSelected: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup (props, { emit }) {
    const categoryColors = {
      String: '#2196F3',
      Array: '#FF9800',
      'Date/Time': '#4CAF50',
      'Number/Decimal': '#F44336',
      Other: '#9E9E9E'
    }

    const categoryColor = computed(() => {
      return categoryColors[props.category] || categoryColors.Other
    })

    const handleClick = () => {
      if (!props.disabled) {
        emit('click', props.operationType)
      }
    }

    return {
      categoryColor,
      handleClick
    }
  }
}
</script>

<style lang="scss" scoped>
.operation-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(33, 150, 243, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.selected {
    background: rgba(33, 150, 243, 0.15);
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.3);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  transition: transform 200ms;

  .operation-card:hover & {
    transform: scale(1.1);
  }
}

.card-category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-content {
  margin-top: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #E3F2FD;
  margin-bottom: 6px;
  line-height: 1.3;
}

.card-description {
  font-size: 13px;
  color: rgba(227, 242, 253, 0.7);
  line-height: 1.4;
  margin-bottom: 8px;
}

.card-example {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #2196F3;
  font-style: italic;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card-selected-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  animation: checkmark-appear 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes checkmark-appear {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .operation-card {
    padding: 12px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-description {
    font-size: 12px;
  }
}
</style>
