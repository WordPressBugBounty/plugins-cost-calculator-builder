<template>
  <div class="ccb-settings-sections">
    <component :is="currenSectionComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, toRefs } from "vue";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";

const props = defineProps<{
  activeSection: string;
}>();

const { activeSection } = toRefs(props);

const appStore = useAppStore();

const currenSectionComponent = computed(() => {
  if (activeSection.value === "currency") {
    return defineAsyncComponent(
      () => import("@/admin/features/settings/sections/Currency.vue"),
    );
  } else if (activeSection.value === "warning-messages") {
    if (appStore.getIsPro) {
      return defineAsyncComponent(
        () => import("@/admin/features/settings/sections/WarningMessages.vue"),
      );
    } else {
      return defineAsyncComponent(
        () =>
          import(
            "@/admin/features/settings/sections/WarningMessagesWithoutPro.vue"
          ),
      );
    }
  } else if (activeSection.value === "thank-you-page") {
    return defineAsyncComponent(
      () => import("@/admin/features/settings/sections/Confirmation.vue"),
    );
  } else if (activeSection.value === "order-form") {
    if (appStore.getIsPro) {
      return defineAsyncComponent(
        () => import("@/admin/features/settings/sections/OrderForm.vue"),
      );
    } else {
      return defineAsyncComponent(
        () =>
          import("@/admin/features/settings/sections/OrderFormWithoutPro.vue"),
      );
    }
  } else if (activeSection.value === "sticky") {
    if (appStore.getIsPro) {
      return defineAsyncComponent(
        () => import("@/admin/features/settings/sections/Sticky.vue"),
      );
    } else {
      return defineAsyncComponent(
        () => import("@/admin/features/settings/sections/StickyWithoutPro.vue"),
      );
    }
  } else if (activeSection.value === "woo") {
    if (appStore.getIsPro) {
      return defineAsyncComponent(
        () => import("@/admin/features/settings/sections/Woocommerce.vue"),
      );
    } else {
      return defineAsyncComponent(
        () => import("@/admin/features/settings/sections/WooWithoutPro.vue"),
      );
    }
  } else if (activeSection.value === "payments") {
    if (appStore.getIsPro) {
      return defineAsyncComponent(
        () => import("@/admin/features/settings/sections/Payments.vue"),
      );
    } else {
      return defineAsyncComponent(
        () =>
          import("@/admin/features/settings/sections/PaymentsWithoutPro.vue"),
      );
    }
  } else if (activeSection.value === "webhooks") {
    if (appStore.getIsPro) {
      return defineAsyncComponent(
        () => import("@/admin/features/settings/sections/Webhooks.vue"),
      );
    } else {
      return defineAsyncComponent(
        () =>
          import("@/admin/features/settings/sections/WebhooksWithoutPro.vue"),
      );
    }
  }
});
</script>

<style scoped lang="scss">
.ccb-settings-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
