<template>
  <div class="ccb-summary-totals">
    <template v-if="totals.length">
      <div
        v-for="total in totals"
        :key="total.alias"
        class="ccb-summary-totals__row"
      >
        <span class="ccb-summary-totals__label">
          {{ total.label || translations.total }}
          <span
            v-if="getDiscountForTotal(total.alias)"
            class="ccb-summary-totals__discount"
          >
            -{{ getDiscountForTotal(total.alias) }}%
          </span>
        </span>
        <span class="ccb-summary-totals__value">
          $ {{ formatValue(getRandomValueByAlias(total.alias)) }}
        </span>
      </div>
    </template>
    <div v-else class="ccb-summary-totals__row">
      <span class="ccb-summary-totals__label">{{ translations.total }}</span>
      <span class="ccb-summary-totals__value">$ 0.00</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useDiscountsStore } from "@/admin/app/providers/stores/useDiscountsStore";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import { useAppearanceTypography } from "@/admin/shared/utils/useAppearanceTypography";

import type {
  IField,
  IGroupField,
  ITotalField,
} from "@/admin/shared/types/fields.type";

interface TotalItem {
  alias: string;
  label: string;
}

const translationsStore = useBuilderTranslationsStore();
const builderStore = useBuilderStore();
const translations = computed(() => translationsStore.getTranslations);

const { textColor, borderColor, accentColor } = useAppearanceColors();
const discountsStore = useDiscountsStore();
const { totalFieldFontSize, totalFieldFontWeight } = useAppearanceTypography();
const discountByAlias = computed(() => {
  const map = new Map<string, number>();

  for (const discount of discountsStore.getDiscounts) {
    if (discount.discount_status !== "active") continue;

    for (const condition of discount.conditions) {
      if (condition.discount_type !== "percent_of_amount") continue;

      const aliases = condition.field_alias
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      for (const alias of aliases) {
        const existing = map.get(alias);
        const amount = Number(condition.discount_amount) || 0;
        if (existing === undefined || amount > existing) {
          map.set(alias, amount);
        }
      }
    }
  }

  return map;
});

function getDiscountForTotal(alias: string): number | null {
  const amount = discountByAlias.value.get(alias);
  return amount !== undefined ? amount : null;
}

function isGroupField(field: IField): field is IGroupField {
  return (
    "groupElements" in field &&
    Array.isArray((field as IGroupField).groupElements)
  );
}

function isFormulaTotalField(field: IField): field is ITotalField {
  if (field.type === "total") return true;
  return false;
}

function buildTotalItem(field: ITotalField): TotalItem {
  return {
    alias: field.alias,
    label: field.label,
  };
}

const totals = computed((): TotalItem[] => {
  const items: TotalItem[] = [];

  for (const page of builderStore.getBuilderFields) {
    for (const section of page.groupElements) {
      for (const field of section.fields) {
        if (isFormulaTotalField(field)) {
          items.push(buildTotalItem(field));
          continue;
        }

        if (isGroupField(field)) {
          const groupField = field as IGroupField;
          for (const child of groupField.groupElements) {
            if (isFormulaTotalField(child)) {
              items.push(buildTotalItem(child));
            }
          }
        }
      }
    }
  }

  return items;
});

function getRandomValueByAlias(alias: string): number {
  let hash = 0;
  for (let i = 0; i < alias.length; i += 1) {
    hash = (hash << 5) - hash + alias.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash % 1001);
}

function formatValue(value: number): string {
  return value.toFixed(2);
}
</script>

<style scoped lang="scss">
.ccb-summary-totals {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: v-bind(textColor);
  border-bottom: 1px solid v-bind(borderColor);
  padding-bottom: 15px;

  &__label {
    font-size: v-bind(totalFieldFontSize);
    font-weight: v-bind(totalFieldFontWeight);
    display: flex;
    align-items: center;
    line-height: normal;
  }

  &__value {
    font-size: v-bind(totalFieldFontSize);
    font-weight: v-bind(totalFieldFontWeight);
    line-height: normal;
  }

  &__discount {
    font-size: 13px;
    font-weight: 600;
    color: v-bind(textColor);
    padding: 2px 4px;
    border-radius: 4px;
    background-color: v-bind(accentColor);
    margin-left: 6px;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 4px 0;
  }
}
</style>
