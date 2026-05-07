import { defineStore } from "pinia";
import { type Node, type Edge, MarkerType } from "@vue-flow/core";
import { type ISpace } from "@/admin/shared/types/conditions.type";
import { useGenerateId } from "@/admin/shared/utils/useGenerateId";
import {
  IConditionList,
  IRawNode,
  IRawLink,
  type IRawLinkData,
} from "@/admin/shared/types/conditions.type";
import { type Direction } from "@/admin/shared/types/conditions.type";
import { useBuilderStore } from "./useBuilderStore";

interface IConditionsStore {
  sidebarCollapse: boolean;
  nodes: Node[];
  edges: Edge[];
  spaces: ISpace[];
  currentSpace: string;
  currentDirection: Direction;
  currentLink: IRawLink | null;
  focusNodeId: string | null;
}

export const useConditionsStore = defineStore("conditions_store", {
  state: (): IConditionsStore => ({
    sidebarCollapse: false,
    nodes: [],
    edges: [],
    spaces: [],
    currentSpace: "",
    currentDirection: "LR" as Direction,
    currentLink: null,
    focusNodeId: null,
  }),

  getters: {
    getSidebarCollapse: (state: IConditionsStore): boolean =>
      state.sidebarCollapse,
    getNodes: (state: IConditionsStore): Node[] => {
      if (!state.currentSpace) {
        return [];
      }
      return state.nodes.filter(
        (node) => node.data.space === state.currentSpace,
      );
    },

    getEdges: (state: IConditionsStore): Edge[] => {
      if (!state.currentSpace) {
        return [];
      }
      return state.edges.filter(
        (edge) => edge.data.space === state.currentSpace,
      );
    },

    getAllNodes: (state: IConditionsStore): Node[] => state.nodes,

    getAllEdges: (state: IConditionsStore): Edge[] => state.edges,

    getSpaces: (state: IConditionsStore): ISpace[] => {
      if (state.spaces.length === 0) {
        const space = useGenerateId();
        state.spaces.push({ id: 1, label: "Space 1", slug: space, sort_id: 1 });
        state.currentSpace = space;
      }
      return state.spaces;
    },

    getCurrentSpace: (state: IConditionsStore): string => state.currentSpace,

    getCurrentDirection: (state: IConditionsStore): Direction =>
      state.currentDirection,

    getCurrentLink: (state: IConditionsStore): IRawLink | null =>
      state.currentLink,
    getFocusNodeId: (state: IConditionsStore): string | null =>
      state.focusNodeId,
  },

  actions: {
    setFocusNodeId(nodeId: string | null): void {
      this.focusNodeId = nodeId;
    },
    toggleSidebarCollapse(): void {
      this.sidebarCollapse = !this.sidebarCollapse;
    },
    setNodes(nodes: Node[]): void {
      const otherNodes =
        this.nodes.filter((node) => node.data.space !== this.currentSpace) ||
        [];

      const nodesWithSpace =
        nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            space: node.data.space || this.currentSpace,
          },
        })) || [];

      this.nodes = [...otherNodes, ...nodesWithSpace];
    },

    setEdges(edges: Edge[]): void {
      const otherEdges =
        this.edges.filter((edge) => edge.data.space !== this.currentSpace) ||
        [];

      const defaultEdgeData: IRawLinkData = {
        space: this.currentSpace,
        condition: [],
        options_from: "",
        options_to: "",
      };

      const edgesWithSpace =
        edges.map((edge) => {
          if (!this.currentLink) {
            const sourceNode = this.nodes.find(
              (node) => node.id === edge.source,
            );
            const targetNode = this.nodes.find(
              (node) => node.id === edge.target,
            );

            defaultEdgeData.options_from = sourceNode?.data.alias || "";
            defaultEdgeData.options_to = targetNode?.data.alias || "";
          }
          return {
            ...edge,
            markerEnd: MarkerType.ArrowClosed,
            data: {
              ...{ ...defaultEdgeData, ...edge.data },
              space: edge.data.space || this.currentSpace,
            },
          };
        }) || [];

      this.edges = [...otherEdges, ...edgesWithSpace];
    },

    setSpaces(spaces: ISpace[]): void {
      this.spaces = spaces;
      if (spaces.length > 0 && !this.currentSpace) {
        this.currentSpace = spaces[0].slug;
      }
    },

    checkCurrentSpace() {
      if (!this.currentSpace) {
        this.currentSpace = this.spaces[0].slug;
      }

      const spaces: string[] = this.spaces.map((s) => s.slug);
      if (!spaces.includes(this.currentSpace)) {
        this.currentSpace = spaces[0] || "";
      }
    },

    syncNodesAndEdgesToSpaces(): void {
      const deletedSpaces: string[] = [];
      for (const node of this.nodes) {
        if (!this.spaces.some((s) => s.slug === node.data.space)) {
          deletedSpaces.push(node.data.space);
        }
      }

      for (const deletedSpace of deletedSpaces) {
        this.nodes = this.nodes.filter(
          (node) => node.data.space !== deletedSpace,
        );
        this.edges = this.edges.filter(
          (edge) => edge.data.space !== deletedSpace,
        );
      }
    },

    setCurrentSpace(space: string): void {
      this.currentSpace = space;
    },

    moveChainToSpace(nodeId: string, targetSpaceSlug: string): void {
      const visited = new Set<string>();
      const queue = [nodeId];

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);

        for (const edge of this.edges) {
          if (edge.source === current && !visited.has(edge.target)) {
            queue.push(edge.target);
          }
          if (edge.target === current && !visited.has(edge.source)) {
            queue.push(edge.source);
          }
        }
      }

      this.nodes = this.nodes.map((node) => {
        if (visited.has(node.id)) {
          return { ...node, data: { ...node.data, space: targetSpaceSlug } };
        }
        return node;
      });

      this.edges = this.edges.map((edge) => {
        if (visited.has(edge.source) && visited.has(edge.target)) {
          return { ...edge, data: { ...edge.data, space: targetSpaceSlug } };
        }
        return edge;
      });
    },

    removeByAlias(alias: string): void {
      const nodeIds = new Set(
        this.nodes
          .filter((node) => node.data?.alias === alias)
          .map((node) => node.id),
      );

      if (nodeIds.size === 0) return;

      const filteredNodes = this.nodes.filter(
        (node) => node.data?.alias !== alias,
      );
      const filteredEdges = this.edges.filter(
        (edge) => !nodeIds.has(edge.source) && !nodeIds.has(edge.target),
      );

      this.nodes = [...filteredNodes];
      this.edges = [...filteredEdges];
    },

    setCurrentDirection(direction: Direction): void {
      this.currentDirection = direction;
    },

    setCurrentLink(link: IRawLink | null): void {
      this.currentLink = link;
    },

    initConditions(conditions: IConditionList): void {
      this.currentSpace = "";
      this.nodes = [];
      this.edges = [];
      this.setSpaces(conditions.spaces);
      this.setNodes(this.initNodes(conditions.nodes));
      this.setEdges(this.initEdges(conditions.links));
    },

    initNodes(nodes: IRawNode[]): Node[] {
      return nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
        },
      }));
    },

    initEdges(edges: IRawLink[]): Edge[] {
      return edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        type: "button",
        markerEnd: MarkerType.ArrowClosed,
        data: {
          ...edge.data,
        },
      }));
    },

    syncLabelsFromBuilder(): void {
      const builderStore = useBuilderStore();
      const labelMap = new Map<string, string>();

      for (const page of builderStore.getBuilderFields) {
        for (const section of page.groupElements) {
          if (section.alias) labelMap.set(section.alias, section.label);
          for (const field of section.fields) {
            if (field.alias) labelMap.set(field.alias, field.label);
            if (
              "groupElements" in field &&
              Array.isArray((field as any).groupElements)
            ) {
              for (const child of (field as any).groupElements) {
                if (child.alias) labelMap.set(child.alias, child.label);
              }
            }
          }
        }
      }

      for (const node of this.nodes) {
        const alias = node.data?.alias;
        if (!alias) continue;
        const freshLabel = labelMap.get(alias);
        if (freshLabel != null && freshLabel !== node.data.label) {
          node.data.label = freshLabel;
        }
      }
    },

    serializeConditions(): IConditionList {
      const nodes: IRawNode[] = this.nodes.map((node) => ({
        id: node.id,
        type: node.type || "",
        position: {
          x: node.position.x,
          y: node.position.y,
        },
        data: {
          ...node.data,
          space: node.data.space,
        },
      }));

      const edges: IRawLink[] = this.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || "",
        targetHandle: edge.targetHandle || "",
        type: edge.type || "",
        data: {
          space: edge.data?.space || "",
          condition: edge.data?.condition || [],
          old_id: edge.data?.old_id || 0,
          old_from: edge.data?.old_from || 0,
          old_to: edge.data?.old_to || 0,
          options_from: edge.data?.options_from || "",
          options_to: edge.data?.options_to || "",
        },
      }));

      return {
        nodes,
        links: edges,
        spaces: this.spaces,
      };
    },
  },
});
