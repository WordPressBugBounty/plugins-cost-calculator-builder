<template>
  <div class="ccb-conditions-link-modal">
    <div
      class="ccb-conditions-link-modal-overlay"
      @click.self="closeModal"
    ></div>

    <div class="ccb-conditions-link-modal-content">
      <div class="ccb-conditions-link-modal-content-header">
        <div class="ccb-conditions-link-modal-content-header-title">
          <Text text="Link: " size="l" weight="bold" />
          <span
            v-if="sourceLabel && targetLabel"
            class="ccb-conditions-link-modal-content-header-fields"
          >
            {{ sourceLabel }}
            <i class="field-arrow"></i>
            {{ targetLabel }}
          </span>
        </div>
        <span class="ccb-links-close" @click="closeModal">
          <i class="ccb-icon-ic_cross_big"></i>
        </span>
      </div>
      <div class="ccb-conditions-link-modal-content-body ccb-custom-scrollbar">
        <LinkStructure
          :conditions="conditions"
          @addConditionRule="addConditionRule"
          @removeConditionRule="removeConditionRule"
          @removeCondition="removeCondition"
        />
      </div>
      <div class="ccb-conditions-link-modal-content-footer">
        <div>
          <Button
            label="Create Condition"
            size="m"
            type="blue"
            @click="addLink"
          />
        </div>
        <div class="ccb-conditions-links-buttons">
          <Button
            type="red-ghost"
            iconLeft="ccb-icon-ic_delete"
            size="m"
            @click="removeLink"
          />
          <Button
            label="Save"
            type="green"
            size="m"
            style="padding: 0 28px"
            @click="saveLink"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Text, Button } from "@/admin/shared/ui/UIKit";
import { LinkStructure } from "@/admin/features/conditions";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import {
  type ICondition,
  type IConditionRule,
  type IRawLink,
} from "@/admin/shared/types/conditions.type";
import { normalizeConditionsForEdit } from "@/admin/features/conditions/composable/useConditionNormalize";

const conditionsStore = useConditionsStore();
const builderStore = useBuilderStore();

defineProps<{}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

let hasNormalized = false;

const conditions = computed(() => {
  const link = conditionsStore.getCurrentLink;
  if (!link) return [];

  const raw = link.data.condition;
  if (!raw?.length) return raw;

  if (!hasNormalized) {
    const targetAlias = link.data.options_to;
    const targetField = builderStore.getFieldByAlias(targetAlias);
    if (targetField) {
      const normalized = normalizeConditionsForEdit(raw, targetField);
      const changed = JSON.stringify(normalized) !== JSON.stringify(raw);
      if (changed) {
        hasNormalized = true;
        const updated: IRawLink = JSON.parse(JSON.stringify(link));
        updated.data.condition = normalized;
        conditionsStore.setCurrentLink(updated);
        return normalized;
      }
    }
    hasNormalized = true;
  }

  return raw;
});

const resolveLiveLabel = (nodeId: string): string => {
  const node = conditionsStore.getNodes.find((n) => n.id === nodeId);
  if (!node) return "";
  const alias = node.data?.alias;
  if (alias) {
    const field = builderStore.getFieldByAlias(alias);
    if (field) return field.label;
  }
  return node.data?.label || "";
};

const sourceLabel = computed(() => {
  const link = conditionsStore.getCurrentLink;
  if (!link) return "";
  return resolveLiveLabel(link.source);
});

const targetLabel = computed(() => {
  const link = conditionsStore.getCurrentLink;
  if (!link) return "";
  return resolveLiveLabel(link.target);
});

const closeModal = () => {
  emit("close");
};

const addLink = () => {
  const targetNode = conditionsStore.getNodes.find(
    (node) => node.id === conditionsStore.getCurrentLink?.target,
  );
  const sourceNode = conditionsStore.getNodes.find(
    (node) => node.id === conditionsStore.getCurrentLink?.source,
  );

  const defaultCondition: ICondition = {
    setVal: "",
    setOptions: "",
    action: "",
    index: false,
    hide: false,
    open: false,
    type: "select",
    sort: conditions?.value?.length || 0,
    optionTo: targetNode?.data?.alias || "",
    optionFrom: sourceNode?.data?.alias || "",
    conditions: [
      {
        key: 0,
        value: "",
        condition: "",
        logicalOperator: "||",
        sort: 0,
        checkedValues: [],
      },
    ],
  };

  const currentLink = JSON.parse(
    JSON.stringify(conditionsStore.getCurrentLink),
  );
  currentLink.data.condition.push(defaultCondition);

  conditionsStore.setCurrentLink(currentLink);
};

const addConditionRule = (idx: number) => {
  const defaultConditionRule: IConditionRule = {
    key: 0,
    value: "",
    condition: "",
    logicalOperator: "||",
    sort: 0,
    checkedValues: [],
  };

  const currentLink = JSON.parse(
    JSON.stringify(conditionsStore.getCurrentLink),
  );
  currentLink.data.condition[idx].conditions.push(defaultConditionRule);
  conditionsStore.setCurrentLink(currentLink);
};

const removeConditionRule = (idx: number, c_idx: number) => {
  const currentLink = JSON.parse(
    JSON.stringify(conditionsStore.getCurrentLink),
  );
  currentLink.data.condition[idx].conditions.splice(c_idx, 1);
  conditionsStore.setCurrentLink(currentLink);
};

const removeCondition = (idx: number) => {
  const currentLink = JSON.parse(
    JSON.stringify(conditionsStore.getCurrentLink),
  );
  currentLink.data.condition.splice(idx, 1);
  conditionsStore.setCurrentLink(currentLink);
};

const removeLink = () => {
  const edges = conditionsStore.getEdges;
  conditionsStore.setEdges(
    edges.filter((edge) => edge.id !== conditionsStore.getCurrentLink?.id),
  );
  closeModal();
  conditionsStore.setCurrentLink(null);
};

const saveLink = () => {
  const edges = conditionsStore.getEdges.map((edge) => {
    if (edge.id === conditionsStore.getCurrentLink?.id) {
      return conditionsStore.getCurrentLink;
    }
    return edge;
  });
  conditionsStore.setEdges(edges);
  closeModal();
  conditionsStore.setCurrentLink(null);
};
</script>

<style lang="scss" scoped>
.ccb-conditions-link-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ccb-conditions-link-modal-overlay {
  position: absolute;
  inset: 0;
  background: var(--ccb-bgr-dimmer);
  cursor: pointer;
}

.ccb-conditions-link-modal-content {
  position: relative;
  z-index: 1;
  max-width: 940px;
  width: 100%;
  height: max-content;
  border-radius: 16px;
  background: var(--ccb-bgr-overlay);
  box-shadow: 0 5px 30px 0 rgba(0, 0, 0, 0.15);
  color: var(--ccb-font-labels);
  padding: 0 22px;
  min-height: 400px;
  max-height: 800px;
  position: relative;
  top: -50px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 10px;

    &-title {
      display: flex;
      align-items: center;
      column-gap: 12px;
    }

    &-fields {
      display: flex;
      align-items: center;
      color: var(--ccb-green-bg-normal);
      font-size: 18px;
      font-weight: 500;
      opacity: 0.8;
    }

    .field-arrow {
      position: relative;
      display: inline-block;
      width: 16px;
      height: 16px;
      margin: 0 10px;
      box-sizing: content-box;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='12' viewBox='0 0 14 12'%3E%3Cg%3E%3Cg opacity='.7'%3E%3Cpath fill='%23333' d='M13.776 5.28L8.72.224A.76.76 0 0 0 8.18 0a.76.76 0 0 0-.542.224l-.46.459a.776.776 0 0 0 0 1.09l2.95 2.956H.757A.748.748 0 0 0 0 5.482v.65c0 .422.334.786.756.786h9.405L7.178 9.89a.755.755 0 0 0 0 1.076l.459.458a.76.76 0 0 0 .542.223.76.76 0 0 0 .541-.224l5.056-5.056A.761.761 0 0 0 14 5.824a.76.76 0 0 0-.224-.544z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-size: contain;
    }
  }

  &-body {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
    max-height: 400px;
    overflow-y: auto;
    padding: 0 10px;
    flex: 1;
  }

  &-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 72px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    padding: 0 10px;
  }
}

.ccb-hidden {
  opacity: 0;
  visibility: hidden;
  cursor: not-allowed;
}

.ccb-links-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 200ms linear;

  i {
    font-size: 14px;
    color: var(--ccb-font-labels);
    opacity: 0.8;
    transition: 200ms linear;
    font-weight: 400;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.ccb-conditions-links-buttons {
  display: flex;
  align-items: center;
  column-gap: 8px;
}
</style>
