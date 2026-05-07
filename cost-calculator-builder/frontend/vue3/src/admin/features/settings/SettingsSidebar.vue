<template>
  <div class="ccb-settings-sidebar">
    <div
      class="ccb-settings-sidebar__wrapper"
      v-for="item in sidebarItems"
      :key="item.Title"
    >
      <div class="ccb-settings-sidebar__title">
        <Text :text="item.Title" size="m" weight="bold" />
      </div>
      <div class="ccb-settings-sidebar__items">
        <div
          class="ccb-settings-sidebar__item"
          v-for="option in item.items"
          :key="option.slug"
          :class="{ active: activeItem === option.slug }"
          @click="handleItemClick(option.slug)"
        >
          <i :class="option.icon"></i>
          <Text :text="option.label" size="m" weight="medium" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Text } from "@/admin/shared/ui/UIKit";

defineProps<{
  activeItem: string;
}>();

const emit = defineEmits<{
  (e: "update:activeItem", slug: string): void;
}>();

const handleItemClick = (slug: string) => {
  emit("update:activeItem", slug);
};

const sidebarItems = ref([
  {
    Title: "Basic",
    items: [
      {
        label: "Currency",
        icon: "ccb-icon-ic_usd-circle",
        slug: "currency",
      },
      {
        label: "Warning messages",
        icon: "ccb-icon-ic_warrning",
        slug: "warning-messages",
      },
      {
        label: "Order Form",
        icon: "ccb-icon-ic_order_form",
        slug: "order-form",
      },
    ],
  },
  {
    Title: "Integrations",
    items: [
      {
        label: "Sticky Calculator",
        icon: "ccb-icon-ic_sticky",
        slug: "sticky",
      },
      {
        label: "Woo",
        icon: "ccb-icon-ic_woo",
        slug: "woo",
      },
      {
        label: "Payments",
        icon: "ccb-icon-ic_payments",
        slug: "payments",
      },
      {
        label: "Webhooks",
        icon: "ccb-icon-ic_webhook",
        slug: "webhooks",
      },
    ],
  },
]);
</script>

<style scoped lang="scss">
.ccb-settings-sidebar {
  width: 240px;
  height: 100%;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: var(--ccb-font-labels);

  &__wrapper {
  }

  &__title {
    transition: var(--ccb-transition-normal);
    padding: 8px 24px 16px 24px;
  }

  &__items {
    transition: var(--ccb-transition-normal);
  }

  &__item {
    padding: 14px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--ccb-font-labels);
    border-radius: 8px;
    transition: var(--ccb-transition-normal);
    cursor: pointer;

    &.active {
      background-color: var(--ccb-blue-bg-dull-hover);
      i {
        color: var(--ccb-blue-bg-normal);
      }
    }

    &:hover {
      background-color: var(--ccb-blue-bg-dull-hover);
    }

    i {
      font-size: 20px;
      transition: var(--ccb-transition-normal);
      color: var(--ccb-font-comment);
    }
  }
}
</style>
