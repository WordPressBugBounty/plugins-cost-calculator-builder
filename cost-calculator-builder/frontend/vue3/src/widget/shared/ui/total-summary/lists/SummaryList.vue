<template>
  <div class="ccb-summary-list">
    <div
      class="ccb-summary-list__body"
      v-if="settingsStore.general?.descriptions"
    >
      <div class="ccb-summary-list__titles">
        <div>{{ translationsStore.getTranslations.name }}</div>
        <div>{{ translationsStore.getTranslations.total }}</div>
      </div>
      <div
        class="ccb-summary-list__wrapper"
        :class="{
          'ccb-summary-list__wrapper--disable-option-unit': disableOptionUnit,
        }"
      >
        <Transition
          v-for="summary in summaries"
          :key="summary.alias"
          name="fade"
        >
          <TotalSummaryItem
            :item-type="getFieldItemType(summary)"
            :summary="summary"
          />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";
import TotalSummaryItem from "@/widget/shared/ui/total-summary/TotalSummaryItem.vue";
import { Field } from "@/widget/shared/types/fields";

type Props = {
  summaries?: Field[];
};

const props = defineProps<Props>();

const settingsStore = useSettingsStore();
const translationsStore = useTranslationsStore();
const summaries = computed(() => props.summaries || []);

const getFieldItemType = (
  summary: Field,
): "summary" | "repeater" | "group" | "total" => {
  const types: { [key: string]: "repeater" | "group" | "total" } = {
    repeater: "repeater",
    group: "group",
    total: "total",
  };

  return types[summary.fieldName as keyof typeof types] || "summary";
};

const disableOptionUnit = computed(() => {
  return !settingsStore.general?.showOptionUnit;
});
</script>

<style lang="scss">
.ccb-summary-list {
  &__body {
    display: grid;
    gap: 5px;
    transition: all 0.6s;
    max-height: 2000px;
    overflow: hidden;
  }

  &__wrapper {
    padding-top: 10px;
    display: grid;
    gap: var(--ccb-summary-spacing);
    @media only screen and (max-width: 480px) {
      gap: var(--ccb-mobile-summary-spacing);
    }

    &--disable-option-unit {
      .description {
        display: none;
      }
    }
  }

  &__titles {
    display: grid;
    grid-template-columns: 1fr auto;
    color: var(--ccb-text-color);
    font-size: var(--ccb-summary-header-size);
    font-weight: var(--ccb-summary-header-weight);
    background-color: var(--ccb-container-dark-color);
    padding: 2px 10px;
    border-radius: var(--ccb-fields-border-radius);
    text-transform: var(--ccb-summary-text-transform);
    text-align: left;

    @media only screen and (max-width: 480px) {
      font-size: var(--ccb-mobile-summary-header-size);
      font-weight: var(--ccb-mobile-summary-header-weight);
    }
  }
}
</style>
