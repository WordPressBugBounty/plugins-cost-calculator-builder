<template>
  <div class="ccb-discount-list">
    <div class="ccb-discount-list__toolbar">
      <div class="ccb-discount-list__toolbar-left">
        <Button
          size="m"
          type="default"
          :label="hasSelection ? translations.done : translations.selectAll"
          :border="false"
          @click="discountsStore.toggleSelectAll()"
        />
        <template v-if="hasSelection">
          <Button
            size="m"
            type="green-ghost"
            iconLeft="ccb-icon-ic_duplicate"
            :border="false"
            @click="duplicateSelected"
          />
          <Button
            size="m"
            type="red-ghost"
            iconLeft="ccb-icon-ic_delete"
            :border="false"
            @click="deleteSelected"
          />
        </template>
      </div>
      <Button
        size="m"
        type="green"
        iconLeft="ccb-icon-ic_plus_big"
        :label="translations.addDiscount"
        @click="$emit('create')"
      />
    </div>

    <div class="ccb-discount-list__head">
      <div
        class="ccb-discount-list__head-checkbox"
        style="justify-content: flex-start; padding-left: 1px"
      >
        <Checkbox
          :modelValue="isAllCurrentPageSelected"
          @change-single="onToggleSelectAll"
        />
      </div>
      <button
        class="ccb-discount-list__sortable"
        :class="{ 'is-not-clickable': !hasDiscounts }"
        @click="sortBy('discount_id')"
      >
        {{ translations.id }}
        <i
          class="ccb-icon-ic_caret_down"
          :class="sortIconClass('discount_id')"
        ></i>
      </button>
      <button
        class="ccb-discount-list__sortable"
        :class="{ 'is-not-clickable': !hasDiscounts }"
        @click="sortBy('title')"
      >
        {{ translations.discountName }}
        <i class="ccb-icon-ic_caret_down" :class="sortIconClass('title')"></i>
      </button>
      <button
        class="ccb-discount-list__sortable"
        :class="{ 'is-not-clickable': !hasDiscounts }"
        @click="sortBy('is_promo')"
      >
        {{ translations.type }}
        <i
          class="ccb-icon-ic_caret_down"
          :class="sortIconClass('is_promo')"
        ></i>
      </button>
      <span>{{ translations.usageLimit }}</span>
      <button
        class="ccb-discount-list__sortable"
        :class="{ 'is-not-clickable': !hasDiscounts }"
        @click="sortBy('period')"
      >
        {{ translations.discountPeriod }}
        <i class="ccb-icon-ic_caret_down" :class="sortIconClass('period')"></i>
      </button>
      <button
        class="ccb-discount-list__sortable"
        :class="{ 'is-not-clickable': !hasDiscounts }"
        @click="sortBy('discount_status')"
      >
        {{ translations.status }}
        <i
          class="ccb-icon-ic_caret_down"
          :class="sortIconClass('discount_status')"
        ></i>
      </button>
      <span></span>
    </div>

    <div
      v-if="discountsStore.getDiscounts.length"
      class="ccb-discount-list__rows"
    >
      <DiscountItem
        v-for="discount in discountsStore.getDiscounts"
        :key="String(discount.discount_id)"
        :discount="discount"
        :selected="isSelected(discount.discount_id)"
        @toggle-select="discountsStore.toggleSelectDiscount"
        @edit="$emit('edit', $event)"
        @duplicate="duplicateOne"
        @delete="deleteOne"
      />
    </div>

    <div v-else class="ccb-discount-list__empty">
      <img :src="discountCalculatorImage" :alt="translations.noDiscounts" />
      <Text
        :text="translations.thereAreNoDiscountsYet"
        size="xl"
        weight="bold"
      />
      <Text
        :text="translations.createNewDiscountFromScratch"
        size="m"
        weight="regular"
      />
      <Button
        size="m"
        type="green"
        iconLeft="ccb-icon-ic_plus_big"
        :label="translations.create"
        @click="$emit('create')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDiscountsStore } from "@/admin/app/providers/stores/useDiscountsStore";
import { Button, Checkbox, Text } from "@/admin/shared/ui/UIKit";
import type {
  DiscountSortBy,
  NumericLike,
} from "@/admin/shared/types/discounts.type";
import { toast } from "vue3-toastify";
import DiscountItem from "./DiscountItem.vue";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import discountCalculatorImage from "@/images/discounts/calculator.png";

interface IDiscountListsProps {
  calcId: number;
}

const props = defineProps<IDiscountListsProps>();
defineEmits<{
  (e: "create"): void;
  (e: "edit", id: number): void;
}>();

const discountsStore = useDiscountsStore();
const translationsStore = useBuilderTranslationsStore();

const translations = computed(() => {
  return translationsStore.getTranslations;
});

const hasSelection = computed<boolean>(
  () => discountsStore.getSelectedDiscountIds.length > 0,
);
const hasDiscounts = computed<boolean>(
  () => discountsStore.getDiscounts.length > 0,
);
const isAllCurrentPageSelected = computed<boolean>(() => {
  const currentPageIds = discountsStore.getDiscounts.map((discount) =>
    Number(discount.discount_id),
  );
  if (!currentPageIds.length) return false;
  return currentPageIds.every((id) =>
    discountsStore.getSelectedDiscountIds.includes(id),
  );
});

const isSelected = (id: NumericLike): boolean =>
  discountsStore.getSelectedDiscountIds.includes(Number(id));

const onToggleSelectAll = (): void => {
  discountsStore.toggleSelectAllCurrentPage();
};

const sortBy = async (sortKey: DiscountSortBy): Promise<void> => {
  if (!hasDiscounts.value) return;
  discountsStore.setSort(sortKey);
  await discountsStore.fetchDiscounts(props.calcId);
};

const sortIconClass = (sortKey: DiscountSortBy): string => {
  if (discountsStore.getDiscountList.sortBy !== sortKey) return "";
  return discountsStore.getDiscountList.direction === "asc"
    ? "is-asc"
    : "is-desc";
};

const deleteOne = async (id: number): Promise<void> => {
  const confirmed = window.confirm(
    translations.value.areYouSureToDeleteThisDiscount,
  );
  if (!confirmed) return;
  const success = await discountsStore.deleteDiscount(props.calcId, id);
  if (success)
    toast(translations.value.deletedSuccessfully, { type: "success" });
};

const duplicateOne = async (id: number): Promise<void> => {
  const success = await discountsStore.duplicateDiscount(props.calcId, id);
  if (success)
    toast(translations.value.duplicatedSuccessfully, { type: "success" });
};

const deleteSelected = async (): Promise<void> => {
  const ids = discountsStore.getSelectedDiscountIds;
  if (!ids.length) return;
  const confirmed = window.confirm(
    translations.value.areYouSureToDeleteChosenDiscounts,
  );
  if (!confirmed) return;
  const success = await discountsStore.deleteBulk(props.calcId, ids);
  if (success)
    toast(translations.value.deletedSuccessfully, { type: "success" });
};

const duplicateSelected = async (): Promise<void> => {
  const ids = discountsStore.getSelectedDiscountIds;
  if (!ids.length) return;
  const success = await discountsStore.duplicateBulk(props.calcId, ids);
  if (success)
    toast(translations.value.duplicatedSuccessfully, { type: "success" });
};
</script>

<style scoped lang="scss">
.ccb-discount-list {
  display: flex;
  flex-direction: column;
  row-gap: 12px;
  width: 100%;
  min-height: 100%;

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__toolbar-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__head {
    display: grid;
    grid-template-columns:
      36px 56px minmax(180px, 1.4fr) minmax(120px, 1fr) minmax(120px, 1fr)
      minmax(180px, 1.2fr) 110px minmax(160px, auto);
    align-items: center;
    column-gap: 12px;
    background: var(--ccb-bgr-menu);
    border-radius: 12px;
    padding: 14px 16px;
    color: var(--ccb-font-comment);
    font-size: 14px;
    font-weight: 500;
  }

  &__sortable {
    border: none;
    background: transparent;
    color: inherit;
    font-size: inherit;
    font-weight: inherit;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    justify-self: start;

    &.is-not-clickable {
      pointer-events: none;
      cursor: default;
    }
  }

  &__head-checkbox {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__rows {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    color: var(--ccb-font-labels);
  }

  &__empty {
    min-height: 420px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 10px;
    text-align: center;
    height: 80%;
    color: var(--ccb-font-labels);

    img {
      width: 110px;
      height: 110px;
      object-fit: contain;
    }
  }
}

.ccb-icon-ic_caret_down {
  font-size: 9px;
  transition: transform var(--ccb-transition-normal);

  &.is-asc {
    transform: rotate(180deg);
  }
}
</style>
