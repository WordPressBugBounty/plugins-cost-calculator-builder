<template>
  <div
    class="ccb-search-toolbar-overlay"
    v-if="show"
    @click.stop="toggleSearchToolbar"
  ></div>
  <div class="ccb-search-toolbar" v-if="show">
    <div class="ccb-search-toolbar--header">
      <Input
        placeholder="Enter field name"
        label=""
        name="search"
        :modelValue="searchInput"
        icon-right="ccb-icon-Search-Magnifier"
        class="ccb-search-toolbar-input"
        @change="
          (_: string, value: string | number) =>
            handleSearchInput(value as string)
        "
      />

      <Dropdown
        label=""
        :items="searchTypeOptions"
        name="searchType"
        v-model="searchType"
        class="ccb-search-toolbar-dropdown"
      />
    </div>
    <div class="ccb-search-toolbar--content">
      <template v-if="groupedFields.length > 0">
        <div
          class="ccb-search-toolbar--content-item"
          v-for="group in groupedFields"
          :key="group.node.data?.alias || group.node.id"
          @click="focusNode(group.node.id)"
        >
          <div class="ccb-search-toolbar--content-item-icon">
            <i class="ccb-icon-Search-Magnifier"></i>
          </div>
          <div class="ccb-search-toolbar--content-item-title-box">
            <span
              class="ccb-search-toolbar--content-item-title-box-title"
              :title="getLabelWithCount(group.node.data.label, group.count)"
              v-html="
                highlightMatch(
                  getLabelWithCount(group.node.data.label, group.count),
                )
              "
            ></span>
            <span
              class="ccb-search-toolbar--content-item-title-box-description"
              v-html="`[${highlightMatch(group.node.data.alias)}]`"
            ></span>
          </div>
          <span
            class="ccb-search-toolbar--content-item-space"
            :title="getSpaceLabel(group.node.data?.space)"
          >
            {{ getSpaceLabel(group.node.data?.space) }}
          </span>
        </div>
      </template>
      <template v-else>
        <div class="ccb-search-toolbar--content-no-results">
          <Text text="No results found" size="s" weight="regular" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, computed, nextTick } from "vue";
import { Input, Dropdown } from "@/admin/shared/ui/UIKit";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { Text } from "@/admin/shared/ui/UIKit";
import { useVueFlow } from "@vue-flow/core";

const props = defineProps<{
  show: boolean;
}>();

const { show } = toRefs(props);

const searchType = ref<string>("all");
const searchInput = ref<string>("");

const conditionsStore = useConditionsStore();
const { setCenter, getNodes } = useVueFlow();

const searchTypeOptions = ref<any[]>([
  { label: "All", value: "all" },
  { label: "Impact othe fields", value: "impact" },
  { label: "Affected by other fields", value: "affected" },
]);

const emit = defineEmits<{
  (e: "toggle"): void;
}>();

const toggleSearchToolbar = (): void => {
  emit("toggle");
};

const sourceNodeIds = computed(() => {
  const edges = conditionsStore.getAllEdges;
  return new Set(edges.map((edge) => edge.source));
});

const targetNodeIds = computed(() => {
  const edges = conditionsStore.getAllEdges;
  return new Set(edges.map((edge) => edge.target));
});

const filteredByType = computed(() => {
  const allNodes = conditionsStore.getAllNodes;

  if (searchType.value === "all") {
    return allNodes;
  } else if (searchType.value === "impact") {
    return allNodes.filter((node) => sourceNodeIds.value.has(node.id));
  } else if (searchType.value === "affected") {
    return allNodes.filter((node) => targetNodeIds.value.has(node.id));
  }

  return allNodes;
});

const filteredFields = computed(() => {
  const nodes = filteredByType.value;
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    return nodes;
  }

  return nodes.filter((node) => {
    const label = (node.data?.label || "").toLowerCase();
    const alias = (node.data?.alias || "").toLowerCase();
    return label.includes(query) || alias.includes(query);
  });
});

const groupedFields = computed(() => {
  const nodes = filteredFields.value;
  const groups: Record<string, { node: (typeof nodes)[0]; count: number }> = {};

  nodes.forEach((node) => {
    const key = node.data?.alias || node.data?.label || node.id;

    if (!groups[key]) {
      groups[key] = { node, count: 1 };
    } else {
      groups[key].count++;
    }
  });

  return Object.values(groups);
});

const highlightMatch = (text: string): string => {
  const query = searchInput.value.trim();

  if (!query || !text) {
    return text;
  }

  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, '<span class="ccb-search-highlight">$1</span>');
};

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getLabelWithCount = (label: string, count: number): string => {
  return count > 1 ? `${label} (${count})` : label;
};

const handleSearchInput = (value: string) => {
  searchInput.value = value;
};

const getSpaceLabel = (slug: string): string => {
  const spaces = conditionsStore.getSpaces;
  const space = spaces.find((s) => s.slug === slug);
  return space?.label || "";
};

const focusNode = (nodeId: string) => {
  const allNodes = conditionsStore.getAllNodes;
  const node = allNodes.find((n) => n.id === nodeId);

  if (!node) return;

  const nodeSpace = node.data?.space;
  if (nodeSpace && nodeSpace !== conditionsStore.getCurrentSpace) {
    conditionsStore.setCurrentSpace(nodeSpace);
  }

  nextTick(() => {
    const flowNodes = getNodes.value;
    const flowNode = flowNodes.find((n) => n.id === nodeId);
    const target = flowNode || node;

    const dims = (target as unknown as Record<string, unknown>).dimensions as
      | { width?: number; height?: number }
      | undefined;
    const centerX = target.position.x + (dims?.width || 150) / 2;
    const centerY = target.position.y + (dims?.height || 40) / 2;

    setCenter(centerX, centerY, { zoom: 1, duration: 300 });
    conditionsStore.setFocusNodeId(nodeId);
  });

  emit("toggle");
};
</script>

<style lang="scss">
.ccb-search-toolbar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: transparent;
  z-index: 110;
  cursor: pointer;
}

.ccb-search-toolbar {
  position: absolute;
  top: 0px;
  left: -335px;
  width: 317px;
  min-height: 148px;
  padding: 24px;
  box-sizing: border-box;
  background: var(--ccb-bgr-overlay);
  border: none;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  overflow: hidden;
  z-index: 111;
  min-width: 100px;
  box-shadow: 0 0 32px 0 rgba(0, 0, 0, 0.08);
  min-height: 300px;

  &--header {
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 4px;
  }

  &--content {
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    flex: 1;
    max-height: 296px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.35);
    }

    &-no-results {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      flex: 1;
    }

    &-item {
      cursor: pointer;
      width: 100%;
      display: flex;
      align-items: center;
      row-gap: 4px;
      border-radius: 12px;
      border: 1px solid rgba(0, 0, 0, 0.06);
      background: var(--ccb-input-normal);
      height: 56px;
      flex-shrink: 0;
      padding: 0 12px;
      column-gap: 16px;
      cursor: pointer !important;
      transition: all 200ms linear;
      color: var(--ccb-font-labels);
      position: relative;

      &:hover {
        border-color: rgba(0, 0, 0, 0.15);
        box-shadow: 0 0 0 2px rgba(0, 122, 198, 0.08);
      }

      &-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        background: #eef1f7;
        border-radius: 6px;
        background: var(--ccb-blue-bg-dull-normal);

        i {
          font-size: 16px;
          color: var(--ccb-blue-fg-normal);
        }
      }

      &-title-box {
        display: flex;
        flex-direction: column;
        max-width: 125px;
      }

      &-title-box-title {
        overflow: hidden;
        text-overflow: ellipsis;

        color: var(--ccb-font-labels);
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 0.2px;
        white-space: nowrap;
        max-width: 135px;
      }

      &-title-box-description {
        overflow: hidden;
        color: var(--ccb-font-comment);
        text-overflow: ellipsis;

        font-size: 12px;
        font-weight: 500;
        line-height: 16px;
        letter-spacing: 0.2px;
      }

      &-space {
        margin-left: auto;
        flex-shrink: 0;
        font-size: 11px;
        font-weight: 500;
        color: var(--ccb-blue-fg-normal);
        background: var(--ccb-blue-bg-dull-normal);
        border-radius: 99px;
        padding: 2px 8px;
        white-space: nowrap;
        // position: absolute;
        // right: 4px;
        // top: 4px;
        max-width: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}

.ccb-search-toolbar-input {
  width: 100%;

  i {
    color: rgba(0, 0, 0, 0.2) !important;
    right: 15px !important;
  }
}

.ccb-search-toolbar-dropdown {
  width: 100%;

  .ccb-dropdown-options {
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
  }
}

.ccb-search-highlight {
  background-color: #fff3cd;
  color: #856404;
  border-radius: 2px;
  padding: 0 2px;
}
</style>
