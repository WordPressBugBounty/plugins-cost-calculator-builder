import dagre from "@dagrejs/dagre";
import { Position, useVueFlow, type Node, type Edge } from "@vue-flow/core";
import { ref, type Ref } from "vue";
import { Direction } from "@/admin/shared/types/conditions.type";

export function useLayout() {
  const { findNode } = useVueFlow();

  const graph: Ref<dagre.graphlib.Graph> = ref(new dagre.graphlib.Graph());
  const previousDirection: Ref<Direction> = ref("LR");

  function layout(nodes: Node[], edges: Edge[], direction: Direction): Node[] {
    const dagreGraph = new dagre.graphlib.Graph();
    graph.value = dagreGraph;

    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    previousDirection.value = direction;

    for (const node of nodes) {
      const graphNode = findNode(node.id);

      dagreGraph.setNode(node.id, {
        width: graphNode?.dimensions.width ?? 150,
        height: graphNode?.dimensions.height ?? 50,
      });
    }

    for (const edge of edges) {
      dagreGraph.setEdge(edge.source, edge.target);
    }

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id) as {
        x: number;
        y: number;
      };

      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: {
          x: nodeWithPosition.x,
          y: nodeWithPosition.y,
        },
        data: {
          ...node.data,
          direction: direction,
        },
      };
    });
  }

  return {
    graph,
    layout,
    previousDirection,
  };
}
