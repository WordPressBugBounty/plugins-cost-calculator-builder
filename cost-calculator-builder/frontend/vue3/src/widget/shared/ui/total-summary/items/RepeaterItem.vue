<template>
  <div class="ccb-summary-repeater">
    <template v-for="(elements, idx) in summary.groupElements">
      <div
        class="ccb-summary-repeater__header"
        @click="collapseStore[idx] = !collapseStore[idx]"
        v-if="getFieldsFromMap(elements).length > 0"
      >
        <div class="ccb-summary-repeater__left">
          <div
            class="ccb-summary-repeater__btn"
            :aria-expanded="!collapseStore[idx]"
            :class="{ rotated: collapseStore[idx] }"
          >
            <i class="ccb-icon-Path-3514"></i>
          </div>
          <div class="ccb-summary-repeater__title">{{ summary.label }}</div>
          <div class="ccb-summary-repeater__count">#{{ idx + 1 }}</div>
        </div>
        <div class="ccb-summary-repeater__value">
          {{ getGroupTotal(elements) }}
        </div>
      </div>
      <div
        class="ccb-summary-repeater__list"
        :class="{ hidden: collapseStore[idx] }"
      >
        <template
          v-if="getFieldsFromMap(elements).length > 0"
          v-for="element in getFieldsFromMap(elements)"
        >
          <Transition name="fade">
            <TotalSummaryItem
              item-type="summary"
              :summary="element"
            ></TotalSummaryItem>
          </Transition>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from "vue";
import { Field, IRepeaterField } from "@/widget/shared/types/fields";
import TotalSummaryItem from "@/widget/shared/ui/total-summary/TotalSummaryItem.vue";

type Props = {
  summary: IRepeaterField;
};

const props = defineProps<Props>();
const { summary } = toRefs(props);

const collapseStore = ref<Record<number, boolean>>({});

const getFieldsFromMap = computed(() => {
  return (data: Map<string, Field>): Field[] => {
    return Array.from(data.values()).filter((item: Field) => item.addToSummary);
  };
});

const getGroupTotal = computed(() => {
  return (data: Map<string, Field>): number => {
    if (summary.value.enableFormula) {
      // If formula mode is enabled for repeater, calculate per-group total by formula
      const baseFormula =
        (summary.value.originalFormula &&
          summary.value.originalFormula.trim()) ||
        (summary.value.formula && summary.value.formula.trim()) ||
        "0";

      let groupFormula = baseFormula;

      const fieldsAliasList = groupFormula.match(/\w+_field_id_\d+/g) || [];

      fieldsAliasList.forEach((alias: string) => {
        let numeric = 0;
        for (const field of data.values()) {
          if (field.alias === alias) {
            numeric =
              typeof field.value === "number"
                ? (field.value as number)
                : Number(
                    (field as any)?.displayValue
                      ?.toString()
                      ?.replace(/[^\d.-]/g, ""),
                  );
            if (Number.isNaN(numeric)) numeric = 0;
            break;
          }
        }

        groupFormula = groupFormula.replace(
          new RegExp("\\b" + alias + "\\b", "g"),
          numeric.toString(),
        );
      });

      try {
        const res = Number(eval(groupFormula));
        return Number.isFinite(res) ? res : 0;
      } catch {
        return 0;
      }
    } else {
      // Default behavior: sum fields that are added to summary
      const items = Array.from(data.values()).filter(
        (item: Field) => item.addToSummary,
      );
      return items.reduce((sum: number, item: Field) => {
        const numeric =
          typeof item.value === "number"
            ? item.value
            : Number(
                (item as any)?.displayValue
                  ?.toString()
                  ?.replace(/[^\d.-]/g, ""),
              );
        return sum + (isNaN(numeric) ? 0 : numeric);
      }, 0);
    }
  };
});
</script>

<style lang="scss">
.ccb-summary-repeater {
  padding-left: 15px;

  &__header {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    margin-bottom: 10px;
    cursor: pointer;

    &:not(:first-child) {
      margin-top: 12px;
    }

    .ccb-summary-repeater__left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 4px;
    }

    .ccb-summary-repeater__btn {
      cursor: pointer;
      font-size: 10px;
      margin-right: 4px;
      color: var(--ccb-text-color);
      transition: transform 0.4s;

      &.rotated {
        transform: rotate(180deg);
      }
    }

    .ccb-summary-repeater__title {
      font-size: var(--ccb-repeater-title-font-size);
      font-weight: 700;
      margin-right: 4px;
      color: var(--ccb-text-color);
    }

    .ccb-summary-repeater__count {
      font-size: var(--ccb-repeater-title-font-size);
      font-weight: 600;
      color: var(--ccb-summary-description-color);
    }

    .ccb-summary-repeater__value {
      justify-self: end;
      font-size: var(--ccb-summary-text-size);
      font-weight: var(--ccb-summary-text-weight);
      color: var(--ccb-text-color);
      text-transform: var(--ccb-summary-text-transform);
    }
  }

  &__list {
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: all 0.4s;
    max-height: 2000px;
    overflow: hidden;

    &.hidden {
      max-height: 0;
    }
  }
}
</style>
