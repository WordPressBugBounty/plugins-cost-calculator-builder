import { useVueFlow, type Node } from "@vue-flow/core";
import { ref, watch, type Ref } from "vue";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { IField } from "@/admin/shared/types/fields.type";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export interface DragAndDropState {
  draggedType: Ref<string | null>;
  draggedElement: Ref<IField | null>;
  isDragOver: Ref<boolean>;
  isDragging: Ref<boolean>;
}

export const state: DragAndDropState = {
  draggedType: ref<string | null>(null),
  draggedElement: ref<IField | null>(null),
  isDragOver: ref<boolean>(false),
  isDragging: ref<boolean>(false),
};

export default function useDragAndDrop() {
  const conditionsStore = useConditionsStore();
  const { draggedType, draggedElement, isDragOver, isDragging } = state;

  const { addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode } =
    useVueFlow();

  watch(isDragging, (dragging: boolean) => {
    document.body.style.userSelect = dragging ? "none" : "";
  });

  function onDragStart(event: DragEvent, type: string, element: IField): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData("application/vueflow", type);
      event.dataTransfer.effectAllowed = "move";
    }

    draggedType.value = type;
    draggedElement.value = element;
    isDragging.value = true;

    document.addEventListener("drop", onDragEnd);
  }

  function onDragOver(event: DragEvent): void {
    event.preventDefault();

    if (!draggedType.value) return;

    isDragOver.value = true;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  function onDragLeave(): void {
    isDragOver.value = false;
  }

  function onDragEnd(): void {
    isDragging.value = false;
    isDragOver.value = false;
    draggedType.value = null;
    draggedElement.value = null;

    document.removeEventListener("drop", onDragEnd);
  }

  function onDrop(event: DragEvent): void {
    if (!draggedType.value || !draggedElement.value) return;

    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    });

    const nodeId = generateId();

    const newNode: Node = {
      id: nodeId,
      type: "custom",
      position,
      data: {
        label: draggedElement.value.label,
        alias: draggedElement.value.alias,
        icon: draggedElement.value.icon,
        space: conditionsStore.getCurrentSpace,
        direction: conditionsStore.getCurrentDirection,
      },
    };

    const { off } = onNodesInitialized(() => {
      updateNode(nodeId, (node) => ({
        position: {
          x: node.position.x - node.dimensions.width / 2,
          y: node.position.y - node.dimensions.height / 2,
        },
      }));

      off();
    });

    addNodes(newNode);
  }

  return {
    draggedType,
    draggedElement,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop,
  };
}
