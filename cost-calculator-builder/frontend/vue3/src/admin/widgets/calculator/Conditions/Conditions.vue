<template>
  <div class="ccb-amdin-conditions">
    <Spaces />
    <div
      class="dnd-flow"
      @drop="onDrop"
      :class="{ 'dnd-flow-collapsed': conditionsStore.getSidebarCollapse }"
    >
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        @nodes-change="onNodesChange"
        @edges-change="onEdgesChange"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @pane-click="clearSearchFocus"
        @node-click="clearSearchFocus"
        @node-drag-start="clearSearchFocus"
        @edge-click="clearSearchFocus"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.2"
        :max-zoom="4"
        :node-types="nodeTypes"
        :default-edge-options="{
          type: 'button',
          markerEnd: MarkerType.ArrowClosed,
        }"
      >
        <template #edge-button="buttonEdgeProps">
          <EdgeButton
            :id="buttonEdgeProps.id"
            :source="buttonEdgeProps.source"
            :target="buttonEdgeProps.target"
            :source-x="buttonEdgeProps.sourceX"
            :source-y="buttonEdgeProps.sourceY"
            :target-x="buttonEdgeProps.targetX"
            :target-y="buttonEdgeProps.targetY"
            :source-position="buttonEdgeProps.sourcePosition"
            :target-position="buttonEdgeProps.targetPosition"
            :marker-end="buttonEdgeProps.markerEnd"
            :selected="buttonEdgeProps.selected"
            :style="buttonEdgeProps.style"
            @showLinkModal="showLinkModal = true"
          />
        </template>
        <DropzoneBackground
          :style="{
            backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
            transition: 'background-color 0.2s ease',
          }"
        >
          <p v-if="isDragOver">Drop here</p>
        </DropzoneBackground>
        <MiniMap pannable zoomable />
      </VueFlow>
      <Tools @layoutGraph="layoutGraph" />
      <Sidebar />
    </div>
  </div>
  <LinkModal v-if="showLinkModal" @close="closeLinkModal" />
</template>

<script setup lang="ts">
import "@/styles/admin/conditions/style.scss";
import "@vue-flow/minimap/dist/style.css";
import "@vue-flow/core/dist/style.css";

import { nextTick, computed, markRaw, ref, onMounted } from "vue";
import {
  VueFlow,
  useVueFlow,
  MarkerType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type NodeComponent,
} from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import useDragAndDrop from "@/admin/features/conditions/composable/useDnD";
import {
  DropzoneBackground,
  Sidebar,
  Spaces,
  Tools,
  CustomNode,
  EdgeButton,
  LinkModal,
} from "@/admin/features/conditions";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { useLayout } from "@/admin/features/conditions/composable/useConditionLayout";
import { Direction } from "@/admin/shared/types/conditions.type";

const conditionsStore = useConditionsStore();
const {
  onConnect,
  addEdges,
  setViewport,
  applyNodeChanges,
  applyEdgeChanges,
  getNodes,
  getEdges,
} = useVueFlow();
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop();
const { layout } = useLayout();

const showLinkModal = ref<boolean>(false);

const nodeTypes = {
  custom: markRaw(CustomNode) as NodeComponent,
};

const nodes = computed({
  get: () => conditionsStore.getNodes,
  set: (value: Node[]) => conditionsStore.setNodes(value),
});

const edges = computed({
  get: () => conditionsStore.getEdges,
  set: (value: Edge[]) => conditionsStore.setEdges(value),
});

const layoutGraph = async (direction: Direction): Promise<void> => {
  const isHorizontal = direction === "LR";

  conditionsStore.setCurrentDirection(direction);

  const newNodes = layout(nodes.value, edges.value, direction);
  nodes.value = newNodes;

  const updatedEdges = edges.value.map((edge) => ({
    ...edge,
    sourceHandle: isHorizontal ? "right" : "bottom",
    targetHandle: isHorizontal ? "left" : "top",
  }));
  edges.value = updatedEdges;

  nextTick(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  });
};

const onNodesChange = (changes: NodeChange[]) => {
  applyNodeChanges(changes);
  conditionsStore.setNodes(getNodes.value);
};

const onEdgesChange = (changes: EdgeChange[]) => {
  applyEdgeChanges(changes);
  conditionsStore.setEdges(getEdges.value);
};

onConnect((connection) => {
  addEdges({
    ...connection,
    data: {
      space: conditionsStore.getCurrentSpace,
    },
  });
  nextTick(() => {
    conditionsStore.setEdges(getEdges.value);
  });
});

const closeLinkModal = () => {
  showLinkModal.value = false;
};

const clearSearchFocus = () => {
  conditionsStore.setFocusNodeId(null);
};

onMounted(() => {
  conditionsStore.syncLabelsFromBuilder();
});
</script>

<style lang="scss">
.vue-flow {
  width: calc(100% - 396px);
  transition: all 0.3s linear;
}

.dnd-flow-collapsed {
  .vue-flow {
    width: 100%;
  }
}

.ccb-amdin-conditions {
  width: 100%;
  height: calc(100% - 80px);
  display: flex;
  flex-direction: column;
  row-gap: 1px;
  margin-top: 8px;
  overflow-x: hidden;
}
.dnd-flow {
  display: flex;
  flex-direction: row;
  column-gap: 20px;
  height: 100%;
}

.vue-flow__minimap {
  margin: 0;
  border: 1px solid rgba(0, 0, 0, 0.15) !important;

  // background: #f4f4f4 !important;

  transform: scale(75%);
  transform-origin: bottom right;
}
</style>
