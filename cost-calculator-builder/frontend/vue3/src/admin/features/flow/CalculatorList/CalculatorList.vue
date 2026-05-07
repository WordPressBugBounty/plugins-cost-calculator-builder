<template>
  <div class="ccb-admin-calculator-list">
    <div
      class="ccb-admin-calculator-list__header"
      :class="{ 'has-bulk-actions': flowStore.getSelectedIds.length }"
    >
      <Transition name="slide-up">
        <div
          class="ccb-admin-calculator-list__header--bulk-actions"
          v-if="flowStore.getSelectedIds.length"
        >
          <div class="ccb-admin-calculator-list__header--buttons">
            <Button
              v-for="bulkAction in bulkActions"
              :key="bulkAction.icon"
              :iconLeft="bulkAction.icon"
              :size="bulkAction.size"
              :type="bulkAction.type"
              :border="bulkAction.border"
              @click="bulkAction.onClick"
            />
          </div>
        </div>
      </Transition>
      <div class="ccb-admin-calculator-list__header--content">
        <div
          class="ccb-admin-calculator-list__header--bulk-actions"
          style="position: relative; min-width: 200px; height: 100%"
        >
          <div
            class="ccb-admin-calculator-list__header--buttons"
            style="position: absolute; top: 0; right: 0"
          >
            <Transition name="bounce">
              <Button
                size="m"
                label="Select All"
                type="default"
                :border="false"
                @click="toggleSelectAll"
                v-if="!flowStore.getSelectedIds.length"
              />
            </Transition>
          </div>
        </div>
        <div class="ccb-admin-calculator-list__header--buttons">
          <div class="ccb-admin-calculator-list__export">
            <Button
              iconLeft="ccb-icon-ic_upload"
              size="m"
              type="default"
              :border="false"
              @click="toggleExportDropdown"
            />
            <Submenu
              :items="exportItems"
              :position="exportPosition"
              v-if="showExportDropdown"
              @close-dropdown="toggleExportDropdown"
            />
          </div>
          <Button
            iconLeft="ccb-icon-ic_download"
            size="m"
            type="default"
            :border="false"
            @click="openImport"
            :disabled="flowStore.getSelectedIds.length !== 0"
          />
        </div>
      </div>
    </div>
    <div class="ccb-admin-calculator-list__content ccb-custom-scrollbar">
      <component
        :is="currentListComponent"
        :calculators="calculators"
        v-if="calculators.length > 0"
      />
      <div class="ccb-empty-state" v-if="calculators.length === 0">
        <div class="ccb-empty-state__header">
          <Text text="No calculators were found" size="l" weight="bold" />
        </div>
        <div class="ccb-empty-state__description">
          <Text
            text="Create your first calculator to get started"
            size="m"
            weight="regular"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, toRefs } from "vue";
import { TabItem } from "@/admin/shared/types/template.type";
import { ICalculator } from "@/admin/shared/types/calculator.type";
import { Button, Submenu, Text } from "@/admin/shared/ui/UIKit";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import {
  ButtonType,
  ButtonSize,
  ISubmenuItem,
} from "@/admin/shared/types/uikit.type";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";

interface ICalculatorListProps {
  calculators: ICalculator[];
}

const props = defineProps<ICalculatorListProps>();
const { calculators } = toRefs(props);

const emit = defineEmits<{
  (e: "open-import"): void;
}>();

const openImport = () => {
  emit("open-import");
};

const flowStore = useFlowStore();
const appStore = useAppStore();

const showExportDropdown = ref<boolean>(false);

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value;
};

const viewType = computed({
  get: (): TabItem => {
    const id = flowStore.getViewType;
    return {
      id,
      label: id === "grid" ? "Grid" : "List",
      icon: id === "grid" ? "ccb-icon-ic_grid_view" : "ccb-icon-ic_list_view",
    };
  },
  set: (val: TabItem) => {
    flowStore.setViewType(val.id as string);
  },
});

const exportPosition = computed(() => {
  return {
    top: 10,
    right: 10,
  };
});

const exportItems = computed<ISubmenuItem[]>(() => {
  const selectedIdx = flowStore.getSelectedIds.length;
  const exportLinkAll = appStore.exportLink;
  const selectedLinkAll = `${exportLinkAll}&calculator_ids=${flowStore.getSelectedIds.join(",")}`;

  const items: ISubmenuItem[] = [
    {
      label: `Selected (${selectedIdx})`,
      disabled: selectedIdx === 0,
      icon: "",
      href: selectedLinkAll,
    },
    {
      label: "All",
      icon: "",
      href: exportLinkAll,
    },
  ];

  return items;
});

const currentListComponent = computed(() => {
  if (viewType.value.id === "grid") {
    return defineAsyncComponent(
      () => import("@/admin/features/flow/CalculatorList/components/Grid.vue"),
    );
  }

  return defineAsyncComponent(
    () => import("@/admin/features/flow/CalculatorList/components/List.vue"),
  );
});

const toggleSelectAll = () => {
  let selectedIds: number[] = [];
  if (!flowStore.getSelectedIds.length) {
    selectedIds = flowStore.getCalculators.map((calculator) => +calculator.id);
  }
  flowStore.setSelectedIds(selectedIds);
};

const bulkActions = computed(() => {
  return [
    {
      icon: "ccb-icon-ic_cross_small",
      type: "default" as ButtonType,
      size: "xs" as ButtonSize,
      border: true,
      onClick: () => {
        flowStore.setSelectedIds([]);
      },
    },
    {
      icon: "ccb-icon-ic_delete",
      type: "red-ghost" as ButtonType,
      border: false,
      size: "m" as ButtonSize,
      onClick: async () => {
        await appStore.deleteCalculators(flowStore.getSelectedIds);
        await flowStore.fetchCalculators();
        flowStore.setSelectedIds([]);
      },
    },
    {
      icon: "ccb-icon-ic_duplicate",
      type: "green-ghost" as ButtonType,
      border: false,
      size: "m" as ButtonSize,
      onClick: async () => {
        await appStore.duplicateCalculators(flowStore.getSelectedIds);
        await flowStore.fetchCalculators();
        flowStore.setSelectedIds([]);
      },
    },
  ];
});
</script>

<style scoped lang="scss">
.ccb-admin-calculator-list {
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  height: calc(100% - 110px);
}

.ccb-admin-calculator-list__content {
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  height: 100%;
  overflow-y: auto;
}

.ccb-admin-calculator-list__header {
  display: flex;
  width: 100%;
  height: 32px;
  justify-content: flex-end;

  &.has-bulk-actions {
    justify-content: space-between;
    padding-left: 20px;
  }

  &--content {
    display: flex;
    align-items: center;
    column-gap: 32px;
  }

  &--buttons {
    display: flex;
    column-gap: 8px;

    .ccb-admin-calculator-list__export {
      position: relative;
    }
  }

  button {
    height: 32px;
  }
}

.ccb-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 16px;
  padding: 100px 0;
}
</style>
