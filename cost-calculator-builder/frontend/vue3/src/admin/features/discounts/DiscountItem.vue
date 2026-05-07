<template>
  <div
    class="ccb-discount-row"
    :class="{ 'is-selected': selected }"
    @click="$emit('edit', discountId)"
  >
    <div class="ccb-discount-row__check" @click.stop>
      <Checkbox :modelValue="selected" @change-single="toggleSelection" />
    </div>
    <div class="ccb-discount-row__id">
      <Text :text="String(discountId)" size="m" weight="regular" />
    </div>
    <div class="ccb-discount-row__title">
      <Text
        :text="discount.title || translations.untitled"
        size="m"
        weight="bold"
      />
    </div>
    <div class="ccb-discount-row__type">
      <Text :text="discountTypeLabel" size="m" weight="medium" />
      <div
        v-show="discount.promocode"
        class="ccb-discount-row__copy"
        @click.stop="copyPromocode"
      >
        <Text :text="discount.promocode || ''" size="xs" weight="regular" />
        <span class="ccb-discount-row__copy-icon">
          <i class="ccb-icon-ic_duplicate"></i>
        </span>
      </div>
    </div>
    <div class="ccb-discount-row__usage">
      <Text :text="usageLabel" size="m" weight="medium" />
    </div>
    <div class="ccb-discount-row__period">
      <Text :text="periodLabel" size="m" weight="medium" />
    </div>
    <div class="ccb-discount-row__status">
      <span class="ccb-discount-status" :class="statusClass">{{
        statusLabel
      }}</span>
    </div>
    <div class="ccb-discount-row__actions" @click.stop>
      <div class="ccb-discount-row__icon-actions">
        <button
          class="ccb-discount-row__icon-action ccb-discount-row__duplicate"
          @click.stop="$emit('duplicate', discountId)"
        >
          <i class="ccb-icon-ic_duplicate"></i>
        </button>
        <button
          class="ccb-discount-row__icon-action ccb-discount-row__delete"
          @click.stop="$emit('delete', discountId)"
        >
          <i class="ccb-icon-ic_delete"></i>
        </button>
        <button
          class="ccb-discount-row__icon-action ccb-discount-row__edit"
          @click.stop="$emit('edit', discountId)"
        >
          <i class="ccb-icon-ic_edit"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Checkbox, Text } from "@/admin/shared/ui/UIKit";
import type { IDiscountResponse } from "@/admin/shared/types/discounts.type";
import { toast } from "vue3-toastify";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

interface IDiscountItemProps {
  discount: IDiscountResponse;
  selected: boolean;
}

const props = defineProps<IDiscountItemProps>();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
const emit = defineEmits<{
  (e: "toggle-select", id: number): void;
  (e: "edit", id: number): void;
  (e: "duplicate", id: number): void;
  (e: "delete", id: number): void;
}>();

const copied = ref<boolean>(false);

const discountId = computed<number>(
  () => Number(props.discount.discount_id) || 0,
);

const discountTypeLabel = computed<string>(() =>
  props.discount.is_promo
    ? translations.value.promoCode
    : translations.value.forTotalPrice,
);

const usageLabel = computed<string>(() => {
  if (!props.discount.is_promo) return "–";
  const used = Number(props.discount.promocode_used) || 0;
  const count = Number(props.discount.promocode_count) || 0;
  return `${used} / ${count}`;
});

const periodLabel = computed<string>(() => {
  if (props.discount.period === "permanently")
    return translations.value.forever;
  if (props.discount.period === "single_day") {
    return props.discount.single_date || "—";
  }
  const start = props.discount.period_start_date || "—";
  const end = props.discount.period_end_date || "—";
  return `${start} - ${end}`;
});

const statusLabel = computed<string>(() => {
  if (props.discount.discount_status === "active")
    return translations.value.active;
  if (props.discount.discount_status === "ended")
    return translations.value.ended;
  return translations.value.upcoming;
});

const statusClass = computed<string>(() => {
  if (props.discount.discount_status === "active") return "is-active";
  if (props.discount.discount_status === "ended") return "is-ended";
  return "is-upcoming";
});

const toggleSelection = (checked: boolean): void => {
  if (!checked && props.selected) {
    emit("toggle-select", discountId.value);
    return;
  }
  if (checked && !props.selected) {
    emit("toggle-select", discountId.value);
  }
};

const copyPromocode = async (): Promise<void> => {
  if (!props.discount.promocode) return;
  const value = props.discount.promocode;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    copied.value = true;
    toast(translations.value.promocodeCopied, { type: "success" });
    setTimeout(() => {
      copied.value = false;
    }, 1200);
  } catch (_error) {
    toast(translations.value.unableToCopyPromocode, { type: "error" });
  }
};
</script>

<style scoped lang="scss">
.ccb-discount-row {
  display: grid;
  grid-template-columns:
    36px 56px minmax(180px, 1.4fr) minmax(120px, 1fr) minmax(120px, 1fr)
    minmax(180px, 1.2fr) 110px minmax(160px, auto);
  align-items: center;
  column-gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: var(--ccb-transition-normal);
  cursor: pointer;

  &__type {
    display: flex;
    align-items: center;
    column-gap: 12px;
  }

  &:hover {
    background: var(--ccb-bw-dull-normal);

    .ccb-discount-row__duplicate,
    .ccb-discount-row__delete {
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
    }
  }

  &.is-selected {
    background: var(--ccb-blue-bg-dull-normal);
  }

  &__status {
    display: inline-flex;
  }

  &__actions {
    justify-self: end;
    display: flex;
    align-items: center;
    column-gap: 10px;
    position: relative;
  }

  &__icon-actions {
    display: flex;
    align-items: center;
    column-gap: 2px;

    i {
      font-size: 16px;
    }
  }

  &__icon-action,
  &__copy {
    border: none;
    background: transparent;
    color: var(--ccb-blue-fg-normal);
    cursor: pointer;
    height: 28px;
    border-radius: 99px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    gap: 6px;

    &-icon {
      line-height: 0.5px;
    }
  }

  &__icon-action {
    width: 28px;
    justify-content: center;
    border-radius: 50%;

    &:hover {
      background: var(--ccb-bw-dull-normal);
    }
  }

  &__edit {
    color: var(--ccb-blue-fg-normal);
  }

  &__duplicate {
    color: var(--ccb-green-fg-normal);
    opacity: 0;
    pointer-events: none;
    transform: translateX(4px);
    transition: var(--ccb-transition-normal);
  }

  &__delete {
    color: var(--ccb-red-bg-normal);
    opacity: 0;
    pointer-events: none;
    transform: translateX(4px);
    transition: var(--ccb-transition-normal);
  }

  &__copy {
    background: var(--ccb-blue-bg-dull-normal);
    color: var(--ccb-blue-fg-normal);
    font-size: 12px;
  }
}

.ccb-discount-status {
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;

  &.is-active {
    color: var(--ccb-green-bg-normal);
    background: var(--ccb-green-bg-dull-normal);
  }

  &.is-upcoming {
    color: var(--ccb-blue-fg-normal);
    background: var(--ccb-blue-bg-dull-normal);
  }

  &.is-ended {
    color: #7e57c2;
    background: rgba(126, 87, 194, 0.12);
  }
}
</style>
