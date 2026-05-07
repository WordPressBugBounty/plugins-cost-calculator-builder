<template>
  <BuilderContainer>
    <template #body>
      <div class="ccb-order-form-module__body">
        <BuilderNavigation />
        <component :is="OrderFormContent" />
      </div>
    </template>
    <template #toolbar>
      <SidebarCollapseToolbar />
    </template>
    <template #sidebar>
      <OrderFormEditFields v-if="selectedField" />
      <OrderFormSidebar v-else />
    </template>
  </BuilderContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, defineAsyncComponent } from "vue";
import BuilderContainer from "@/admin/shared/ui/components/Builder/BuilderContainer.vue";
import BuilderNavigation from "@/admin/features/builder/common/BuilderNavigation.vue";
import SidebarCollapseToolbar from "@/admin/features/builder/common/SidebarCollapseToolbar.vue";
import OrderFormSidebar from "./OrderFormSidebar.vue";
import OrderFormEditFields from "./OrderFormEditFields.vue";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";

const appStore = useAppStore();

const orderFormStore = useOrderFormStore();
const selectedField = computed(() => orderFormStore.getSelectedField);

const OrderFormContent = computed(() => {
  if (appStore.getIsPro) {
    return defineAsyncComponent(() => import("./OrderFormContent.vue"));
  } else {
    return defineAsyncComponent(() => import("./OrderFormWithoutPro.vue"));
  }
});

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!orderFormStore.getDirty) return;
  event.preventDefault();
};

onMounted(async () => {
  window.addEventListener("beforeunload", handleBeforeUnload);

  if (!orderFormStore.getForms.length) {
    await orderFormStore.fetchFormsExisting();
  }

  if (!orderFormStore.getActiveFormId && orderFormStore.getForms.length) {
    orderFormStore.setActiveFormId(Number(orderFormStore.getForms[0].id));
  }
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<style scoped lang="scss">
.ccb-order-form-module__body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  row-gap: 20px;
}
</style>
