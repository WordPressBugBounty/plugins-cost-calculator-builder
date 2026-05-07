<template>
  <div
    class="ccb-four-port-node"
    :class="{
      ['ccb-node-selected']: selected,
      'ccb-focus-from-search': isFocused,
    }"
  >
    <Handle
      v-show="isHorizontal"
      id="left"
      type="source"
      :position="Position.Left"
      :connectable-start="canBeSource"
      :connectable-end="true"
    />

    <Handle
      v-show="isHorizontal"
      id="right"
      type="source"
      :position="Position.Right"
      :connectable-start="canBeSource"
      :connectable-end="true"
    />

    <Handle
      v-show="!isHorizontal"
      id="top"
      type="source"
      :position="Position.Top"
      :connectable-start="canBeSource"
      :connectable-end="true"
    />

    <Handle
      v-show="!isHorizontal"
      id="bottom"
      type="source"
      :position="Position.Bottom"
      :connectable-start="canBeSource"
      :connectable-end="true"
    />

    <Transition name="toolbar-fade">
      <div v-if="selected" class="ccb-node-toolbar">
        <div class="ccb-node-toolbar__btn" @click="moveTo">
          <i class="ccb-icon-ic_move-to"></i>
        </div>
        <div
          class="ccb-node-toolbar__btn ccb-node-toolbar__btn--delete"
          @click="removeNode"
        >
          <i class="ccb-icon-ic_delete"></i>
        </div>
      </div>
    </Transition>

    <div class="ccb-node-content">
      <div class="ccb-node-content__icon">
        <i :class="data?.icon"></i>
      </div>
      <div class="ccb-node-content__title-box">
        <div class="ccb-node-label">{{ liveLabel }}</div>
        <div class="ccb-node-alias">[{{ data?.alias ?? "Node" }}]</div>
      </div>
    </div>

    <Teleport to="body">
      <MoveToModal
        v-if="showMoveToModal"
        :nodeId="id"
        @close="showMoveToModal = false"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from "vue";
import { Handle, Position } from "@vue-flow/core";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import MoveToModal from "./MoveToModal.vue";

const conditionsStore = useConditionsStore();
const builderStore = useBuilderStore();

const showMoveToModal = ref(false);

const props = defineProps<{
  id: string;
  data?: {
    label?: string;
    alias?: string;
    icon: string;
    direction?: "LR" | "TB";
  };
  selected?: boolean;
}>();

const { selected, data, id } = toRefs(props);

const isHorizontal = computed(() => data.value?.direction !== "TB");

const liveLabel = computed(() => {
  const alias = data.value?.alias;
  if (!alias) return data.value?.label ?? "Node";

  const field = builderStore.getFieldByAlias(alias);
  if (field) return field.label;

  for (const page of builderStore.getBuilderFields) {
    for (const section of page.groupElements) {
      if (section.alias === alias) return section.label;
    }
  }

  return data.value?.label ?? "Node";
});

const NON_SOURCE_ALIASES = [
  "line",
  "html",
  "group",
  "validated_form",
  "text",
  "datePicker",
  "timePicker",
];

const canBeSource = computed(() => {
  const alias = data.value?.alias || "";
  const prefix = alias.replace(/_field_id.*/, "");
  return !NON_SOURCE_ALIASES.includes(prefix);
});

const removeNode = () => {
  const nodes = conditionsStore.getNodes.filter((node) => node.id !== id.value);
  conditionsStore.setNodes(nodes);

  const edges = conditionsStore.getEdges.filter(
    (edge) => edge.source !== id.value && edge.target !== id.value,
  );
  conditionsStore.setEdges(edges);
};

const moveTo = () => {
  showMoveToModal.value = true;
};

const isFocused = computed(() => conditionsStore.getFocusNodeId === id.value);
</script>

<style lang="scss">
.ccb-node-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  &__icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--ccb-blue-bg-dull-normal);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 16px;

    i {
      font-size: 15px;
      color: var(--ccb-blue-fg-normal);
    }
  }

  &__title-box {
    display: flex;
    flex-direction: column;
    max-width: 136px;
    width: 100%;
    margin-right: 8px;

    .ccb-node-label {
      overflow: hidden;
      color: var(--ccb-font-labels);
      text-overflow: ellipsis;

      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }

    .ccb-node-alias {
      overflow: hidden;
      color: var(--ccb-font-comment);
      text-overflow: ellipsis;

      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }
  }
}

.ccb-node-toolbar {
  position: absolute;
  top: -33px;
  right: -1px;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 28px;
  padding: 0 16px;
  border-radius: 99px;
  background: var(--ccb-wb-normal, rgba(0, 0, 0, 0.8));
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  z-index: 10;
  color: var(--ccb-font-labels);

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    cursor: pointer;

    i {
      font-size: 16px;
      transition: opacity 0.15s ease;
    }

    &:hover i {
      opacity: 0.7;
    }

    &--delete:hover i {
      opacity: 1;
      color: var(--ccb-red-fg-normal);
    }
  }
}

.toolbar-fade-enter-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.toolbar-fade-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.1s ease;
}

.toolbar-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.toolbar-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.vue-flow__handle {
  width: 12px;
  height: 12px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background-color: #dddddd;
}

// .vue-flow__handle-left {
//   left: 1px;
// }

// .vue-flow__handle-right {
//   right: 1px;
// }

// .vue-flow__handle-top {
//   top: 1px;
// }

// .vue-flow__handle-bottom {
//   bottom: 1px;
// }

.vue-flow__handle-right {
  right: 0;
  left: auto !important; // Важно! Сбрасываем left
  top: 50%;
  transform: translate(50%, -50%);
}

.ccb-four-port-node {
  padding: 0 12px;
  background: var(--ccb-wb-normal);
  border: 1px solid var(--ccb-input-border);
  border-radius: 8px;
  min-width: 248px;
  max-width: 248px;
  width: 100%;
  height: 58px;

  &.ccb-node-selected {
    border: 2px solid var(--ccb-blue-fg-normal);
    box-shadow: 0 1px 2px 0 rgba(151, 151, 151, 0.2);
    z-index: 2;

    .ccb-node-content__title-box .ccb-node-label {
      color: var(--ccb-blue-fg-normal) !important;
    }

    .vue-flow__handle {
      background: #007ac6;
      opacity: 1;
    }
  }
}

.ccb-focus-from-search {
  box-shadow: 0 0 0 3px rgba(0, 122, 198, 0.5);
  border-color: #007ac6 !important;
  animation: pulse-focus 1s ease-in-out;
}

@keyframes pulse-focus {
  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(0, 122, 198, 0.5);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(0, 122, 198, 0.3);
  }
}
</style>
