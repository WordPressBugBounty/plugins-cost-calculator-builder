<template>
  <div class="ccb-total-row">
    <div
      class="ccb-total-row__discount"
      v-if="
        summary.hasDiscount &&
        summary.discount &&
        summary.discount.viewType === 'show_with_title'
      "
    >
      <div class="label">Discount:</div>
      <div class="name">{{ summary.discount.discountName }}</div>
      <div class="value">{{ summary.discount.extraView }}</div>
    </div>
    <div class="ccb-total-row__item">
      <div class="ccb-total-row__name">
        <span>{{ summary.label }}</span>
        <span
          class="discount"
          v-if="
            summary.hasDiscount &&
            summary.discount &&
            summary.discount.viewType === 'show_without_title'
          "
          >{{ summary.discount.extraView }}</span
        >
      </div>
      <div class="ccb-total-row__value">
        <span
          class="discount"
          v-if="
            summary.hasDiscount &&
            summary.discount &&
            summary.discount.viewType === 'show_without_title'
          "
        >
          {{ summary.originalDisplayView }}
        </span>
        <span>{{ summary.displayValue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import { IFormulaField } from "@/widget/shared/types/fields";

type Props = {
  summary: IFormulaField;
};

const props = defineProps<Props>();
const { summary } = toRefs(props);
</script>

<style lang="scss">
.ccb-total-row {
  display: flex;
  flex-direction: column;
  color: var(--ccb-text-color);
  font-size: var(--ccb-grand-total-size);
  font-weight: var(--ccb-grand-total-weight);

  &__item {
    display: flex;
    justify-content: space-between;

    .ccb-total-row__value {
      display: flex;
      align-items: center;
      gap: 5px;

      .discount {
        font-size: 0.8em;
        font-weight: 500;
        text-decoration: line-through;
      }
    }

    .ccb-total-row__name {
      display: flex;
      align-items: center;
      gap: 5px;

      .discount {
        font-size: 10px !important;
        font-weight: 500;
        color: #ffffff;
        background: #1ab163;
        padding: 2px 4px;
        border-radius: 4px;
        vertical-align: middle;
        box-sizing: border-box;
        letter-spacing: 0.1px;
      }
    }
  }

  &__discount {
    font-size: 12px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    text-transform: var(--ccb-summary-text-transform);
    font-size: 0.75em;

    .label {
      margin-right: 8px;
    }

    .value {
      margin-left: auto;
      white-space: nowrap;
      padding-left: 5px;
    }
  }
}
</style>
