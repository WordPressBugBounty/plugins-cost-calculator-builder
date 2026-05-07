<template>
  <BaseEdge
    :id="id"
    :style="props.style"
    :path="path[0]"
    :marker-end="markerEnd"
  />
  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        zIndex: isConnectedToSelectedNode ? 1000 : 0,
      }"
      class="nodrag nopan"
    >
      <button class="ccb-edge-button" @click="showLinkModal">
        <i class="ccb-icon-schema"></i>
      </button>
    </div>
  </EdgeLabelRenderer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useVueFlow,
  type Position,
} from "@vue-flow/core";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import {
  type IRawLink,
  type IRawLinkData,
} from "@/admin/shared/types/conditions.type";

const conditionsStore = useConditionsStore();

const emit = defineEmits<{
  (e: "showLinkModal"): void;
}>();

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
  sourcePosition: {
    type: String,
    required: true,
  },
  targetPosition: {
    type: String,
    required: true,
  },
  markerEnd: {
    type: String,
    required: false,
  },
  style: {
    type: Object,
    required: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    required: true,
  },
});

const { getSelectedNodes } = useVueFlow();

const isConnectedToSelectedNode = computed(() => {
  const selectedNodeIds = getSelectedNodes.value.map((n) => n.id);
  return (
    selectedNodeIds.includes(props.source) ||
    selectedNodeIds.includes(props.target)
  );
});

const path = computed(() =>
  getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition as Position,
    targetPosition: props.targetPosition as Position,
  }),
);

const showLinkModal = () => {
  const edges = conditionsStore.getEdges;
  const edge = edges.find((edge) => edge.id === props.id);

  if (edge) {
    const link: IRawLink = {
      id: edge?.id || "",
      type: "button",
      source: edge?.source,
      target: edge?.target,
      sourceHandle: edge?.sourceHandle || "",
      targetHandle: edge?.targetHandle || "",
      data: edge?.data as IRawLinkData,
    };
    conditionsStore.setCurrentLink(link);
  }

  emit("showLinkModal");
};
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<style lang="scss" scoped>
.ccb-edge-button {
  display: flex;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border-radius: 99px;
  background: var(--ccb-wb-normal);
  cursor: pointer;
  border: none;
  outline: none;
  box-shadow: none;
  transition: var(--ccb-transition-normal);
  &:hover {
    background: var(--ccb-wb-normal);
  }

  i {
    font-size: 16px;
    color: var(--ccb-font-labels);
    font-weight: 700;
  }
}
</style>
