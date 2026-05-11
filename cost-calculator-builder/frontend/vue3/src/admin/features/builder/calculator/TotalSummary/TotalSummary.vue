<template>
  <div
    class="ccb-total-summary"
    @click="handleTotalSummary"
    :class="{ active: isActive }"
  >
    <div class="ccb-total-summary__controls">
      <i class="ccb-icon-ic_edit"></i>
      <div class="ccb-total-summary__controls-title">Edit</div>
    </div>
    <div
      class="ccb-total-summary__section"
      v-for="section in sections"
      :key="section.id"
    >
      <template
        v-if="
          section.items &&
          section.items.filter((item) => !checkIsDisabled(item.id)).length > 0
        "
      >
        <div
          class="ccb-total-summary__item"
          v-for="item in section.items"
          :key="item.id"
          :style="{ width: getItemWidth(item.options.width) }"
          :class="{ hide: checkIsDisabled(item.id) }"
        >
          <component
            :is="currentComponent(item.id)"
            :summary="item"
            :is-open="!hideSummary"
            @hide-summary="setHideSummary"
          />
        </div>
      </template>
      <template v-else-if="section.items && section.items.length > 0">
        <div
          class="ccb-total-summary__notice"
          v-for="item in section.items"
          :key="item.id"
        >
          <span class="ccb-total-summary__notice-name">{{
            formatSectionName(item.title)
          }}</span>
          — not configured. It will show only after configuration.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { useTotalSummaryStore } from "@/admin/app/providers/stores/useTotalSummaryStore";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useDiscountsStore } from "@/admin/app/providers/stores/useDiscountsStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import type { builderContentType } from "@/admin/shared/types/builder.type";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { useAppearanceTypography } from "@/admin/shared/utils/useAppearanceTypography";

const builderStore = useBuilderStore();
const discountsStore = useDiscountsStore();
const orderFormStore = useOrderFormStore();
const calculatorStore = useCalculatorStore();
const discounts = computed(() => discountsStore.getDiscounts);
const hasCoupons = computed(() =>
  discounts.value.some((discount) => discount.discount_status === "active"),
);

const settingsStore = useSettingsStore();

const { summaryTextTransform } = useAppearanceTypography();

const components = {
  summary_item_total_summary: defineAsyncComponent(
    () => import("./components/Header.vue"),
  ),
  summary_item_coupons: defineAsyncComponent(
    () => import("./components/Coupons.vue"),
  ),
  summary_item_details: defineAsyncComponent(
    () => import("./components/Details.vue"),
  ),
  summary_item_payments: defineAsyncComponent(
    () => import("./components/Payments.vue"),
  ),
  summary_item_total: defineAsyncComponent(
    () => import("./components/Totals.vue"),
  ),
  summary_item_pdf_button: defineAsyncComponent(
    () => import("./components/PDFButton.vue"),
  ),
  summary_item_purchase_button: defineAsyncComponent(
    () => import("./components/PurchaseButton.vue"),
  ),
  summary_item_share_button: defineAsyncComponent(
    () => import("./components/ShareButton.vue"),
  ),
};

const hideSummary = ref(true);

const setHideSummary = (value: boolean) => {
  hideSummary.value = value;
};

const isActive = computed(() => {
  if (settingsStore.getSettings?.page_break?.summary_after_last_page) {
    return builderStore.getActivePage === builderStore.getBuilderFields.length;
  }

  return builderStore.getBuilderContent.content === "total-summary";
});

type SummaryComponentId = keyof typeof components;

const hasSummaryComponent = (itemId: string): itemId is SummaryComponentId =>
  itemId in components;

const activeContent = computed(() => {
  return builderStore.getBuilderContent.content;
});

async function handleTotalSummary() {
  const canLeave = await beforeLeaveOrderForm("total-summary");
  if (builderStore.getSidebarCollapse) {
    builderStore.setSidebarCollapse(false);
  }
  if (!canLeave) return;
  builderStore.setBuilderContent("total-summary");
}

const confirmVisible = ref(false);

function askConfirmation(): Promise<boolean> {
  confirmVisible.value = true;
  return new Promise((resolve) => {
    resolve(true);
  });
}

async function beforeLeaveOrderForm(
  targetContent: builderContentType,
): Promise<boolean> {
  if (
    activeContent.value !== "order-form" ||
    targetContent === "order-form" ||
    !orderFormStore.getDirty
  ) {
    return true;
  }

  const shouldSave = await askConfirmation();

  if (shouldSave) {
    const wasDraft = orderFormStore.getIsDraftActiveForm;
    const success = await orderFormStore.updateForm();
    if (!success) return false;

    if (wasDraft) {
      const calcId = calculatorStore.getId;
      const createdFormId = orderFormStore.getActiveFormId;
      if (calcId && createdFormId) {
        await orderFormStore.applyFormToCalculator(
          Number(createdFormId),
          Number(calcId),
        );
      }
    }
    return true;
  }

  await orderFormStore.discardActiveChanges();
  return true;
}

const currentComponent = (itemId: string) => {
  return hasSummaryComponent(itemId) ? components[itemId] : null;
};

const getItemWidth = (width?: string | number) => {
  return width ? `calc(${Number(width)}% - 5px)` : "100%";
};

const formatSectionName = (id: string) => {
  return id
    .replace(/^section_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const {
  containerColor,
  textColor,
  containerShadow,
  containerBorder,
  containerBorderRadius,
} = useAppearanceColors();

const totalSummaryStore = useTotalSummaryStore();

const totalSummary = computed({
  get() {
    return totalSummaryStore.getTotalSummary;
  },
  set(value) {
    if (value) totalSummaryStore.setTotalSummary(value);
  },
});

const sections = computed(() => totalSummary.value?.arrangement_sections || []);

const checkIsDisabled = computed(() => {
  return (id: string) => {
    if (id === "summary_item_payments") {
      return (
        settingsStore.getOrderFormStatus || !settingsStore.getPaymentsStatus
      );
    } else if (id === "summary_item_purchase_button") {
      return !settingsStore.getOrderFormStatus;
    } else if (id === "summary_item_pdf_button") {
      return !settingsStore.getGeneralSettings?.invoice?.use_in_all;
    } else if (id === "summary_item_share_button") {
      return !settingsStore.getGeneralSettings?.invoice?.emailButton;
    } else if (id === "summary_item_coupons") {
      return !hasCoupons.value;
    }

    return false;
  };
});
</script>

<style scoped lang="scss">
.ccb-total-summary {
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid transparent;
  padding: 2px;
  cursor: pointer;
  transition: border-color 0.2s ease;
  position: relative;
  border-radius: 8px;
  text-transform: v-bind(summaryTextTransform);

  &.active {
    border: 1px solid var(--ccb-blue-bg-normal, #0b79d0);
  }

  &:hover {
    border: 1px solid var(--ccb-blue-bg-normal, #0b79d0);

    .ccb-total-summary__controls {
      opacity: 1;
    }
  }

  &__controls {
    position: absolute;
    top: -14px;
    right: -1px;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    height: 28px;
    padding: 0 16px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 99px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
    z-index: 5;
    color: #fff;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &__section {
    width: 100%;
    height: fit-content;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    background-color: v-bind(containerColor);
    color: v-bind(textColor);
    padding: var(--ccb-container-padding-top) var(--ccb-container-padding-right)
      var(--ccb-container-padding-bottom) var(--ccb-container-padding-left);
    border-radius: v-bind(containerBorderRadius);
    border: v-bind(containerBorder);
    box-shadow: v-bind(containerShadow);
  }

  &__notice {
    width: 100%;
    text-align: center;
    padding: 16px 12px;
    font-size: 13px;
    color: var(--ccb-text-secondary, #888);
    font-style: italic;

    &-name {
      font-weight: 600;
      font-style: normal;
      color: v-bind(textColor);
    }
  }

  &__item {
    &.hide {
      display: none;
    }
  }
}
</style>
