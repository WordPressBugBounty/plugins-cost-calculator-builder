<template>
  <div class="ccb-tab" :class="{ 'ccb-tab--regular': type === 'regular' }">
    <div v-if="title" class="ccb-tab__title">
      <Text :text="title || ''" size="s" weight="medium" />
    </div>
    <div class="ccb-tab__items">
      <div
        class="ccb-tab__item"
        v-for="item in items"
        :key="item.id"
        :class="{
          'ccb-tab__item--active': isActive(item),
          'ccb-tab__item--disabled': disabled,
          'ccb-tab__item--pro': item.isPro,
        }"
        @click="!item.isPro && onSelect(item)"
      >
        <div class="ccb-tab__item__label">
          <span v-if="item.icon" class="ccb-tab__item__icon">
            <img
              v-if="isImageSource(item.icon)"
              :src="item.icon || ''"
              alt=""
            />
            <i v-else :class="item.icon" aria-hidden="true"></i>
          </span>
          <span class="ccb-tab__item__label__text">{{
            translateText(item.label || "")
          }}</span>
          <Badge v-if="item.proBadge" label="PRO" type="blue" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, toRefs } from "vue";
import { TabItem } from "@/admin/shared/types/template.type";
import { Text, Badge } from "@/admin/shared/ui/UIKit";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { translateAdminText } from "@/admin/shared/utils/translate-admin-text.utils";

const props = defineProps<{
  items: TabItem[];
  modelValue?: number | string;
  disabled?: boolean;
  name?: string;
  title?: string;
  type?: "regular";
  proBadge?: boolean;
}>();

const { items, modelValue, disabled, name, title } = toRefs(props);
const translationsStore = useBuilderTranslationsStore();

const emit = defineEmits<{
  (e: "update:modelValue", value: number | string): void;
  (e: "change", name: string, value: number | string): void;
}>();

const onSelect = (item: TabItem) => {
  emit("update:modelValue", item.id as number | string);
  emit("change", name.value || "", item.id as number | string);
};

const isActive = (item: TabItem): boolean => {
  if (!modelValue.value) return false;
  return modelValue.value === item.id;
};

const isImageSource = (source: string | undefined): boolean => {
  if (!source) {
    return false;
  }
  return (
    /\.(svg|png|jpe?g|webp|gif)$/i.test(source) ||
    source.startsWith("/") ||
    source.startsWith("http")
  );
};

const translateText = (value: string): string =>
  translateAdminText(value, translationsStore.getTranslations);

const isSameItem = (a?: TabItem | null, b?: TabItem | null): boolean => {
  if (!a || !b) return false;
  if (a.id != null && b.id != null) return a.id === b.id;
  return a === b;
};

const isInItems = (candidate?: TabItem | null): boolean => {
  if (!candidate || !items.value?.length) return false;
  return items.value.some((i) => isSameItem(i, candidate));
};

watch(
  () => [items.value, modelValue.value] as const,
  () => {
    if (!items.value?.length) return;
    if (!modelValue.value || !isInItems(items.value[0] as TabItem)) {
      emit("update:modelValue", items.value[0].id as number | string);
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.ccb-tab {
  display: flex;
  flex-direction: column;
  transition: var(--ccb-transition-normal);
  border-radius: 20px;
  width: 100%;

  &__title {
    padding-bottom: 10px;
    padding-left: 16px;
    color: var(--ccb-font-comment);
  }

  &__items {
    display: flex;
    gap: 2px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
    cursor: pointer;
    color: var(--ccb-button-bw-disabled);
    font-size: 16px;
    background-color: var(--ccb-bw-dull-disabled);

    &__label {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    &--disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.5;
    }

    &--pro {
      cursor: not-allowed;
      opacity: 0.7;
    }

    &--active {
      color: var(--ccb-blue-fg-normal);
      background-color: var(--ccb-blue-bg-dull-normal);
    }

    &:first-child {
      padding-left: 20px;
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
    }

    &:last-child {
      padding-right: 20px;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
    }
  }

  &--regular {
    border-radius: 0;
    width: 100%;

    .ccb-tab__items {
      gap: 0;
      border-bottom: 1px solid var(--ccb-bw-dull-normal);
      width: 100%;
    }

    .ccb-tab__item {
      flex: 1 1 0;
      min-width: 0;
      padding: 8px 12px;
      background-color: transparent;
      color: var(--ccb-font-main);
      font-size: 14px;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition:
        color var(--ccb-transition-normal),
        border-color var(--ccb-transition-normal);

      &:first-child,
      &:last-child {
        padding-left: 12px;
        padding-right: 12px;
        border-radius: 0;
      }

      &:hover:not(.ccb-tab__item--active):not(.ccb-tab__item--disabled):not(
          .ccb-tab__item--pro
        ) {
        color: var(--ccb-blue-fg-normal);
      }

      &--active {
        color: var(--ccb-blue-fg-normal);
        background-color: transparent;
        border-bottom-color: var(--ccb-blue-fg-normal);
      }
    }
  }
}
</style>
