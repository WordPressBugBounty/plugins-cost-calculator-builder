<template>
  <div class="ccb-admin-app"></div>
  <component v-if="getCurrentComponent" :is="getCurrentComponent" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, inject, onMounted } from "vue";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import type { Page } from "@/admin/app/providers/stores/useAppStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import type { IBuilderTranslations } from "@/admin/shared/types/translations.type";

const appStore = useAppStore();
const translationsStore = useBuilderTranslationsStore();

appStore.setCalcId(inject("calcId") || null);
appStore.setEditMode(inject("editMode") || false);
appStore.setPage(inject("page") as Page);
appStore.setCurrentPage(inject("currentPage") || "");

const getCurrentComponent = computed(() => {
  if (appStore.getCurrentPage === "cost_calculator_builder_whats_new") {
    return defineAsyncComponent(() => import("@/admin/pages/WhatsNew.vue"));
  }

  if (appStore.getCurrentPage === "cost_calculator_templates") {
    return defineAsyncComponent(() => import("@/admin/pages/Templates.vue"));
  }

  if (appStore.getPage === "flow") {
    return defineAsyncComponent(() => import("@/admin/pages/Flow.vue"));
  }

  if (appStore.getPage === "calculator") {
    return defineAsyncComponent(
      () => import("@/admin/pages/CalculatorBuilder.vue"),
    );
  }

  return null;
});

onMounted(() => {
  const exportLink = window.ccb_ajax_window?.export_link;
  const translations = window.ccb_ajax_window?.translations;
  if (translations) {
    translationsStore.initTranslations(
      translations as unknown as IBuilderTranslations,
    );
  }

  const isPro = window.ccb_ajax_window?.pro_active || false;
  const calcUrl = window.ccb_ajax_window?.plugin_url || "";
  appStore.setIsPro(isPro as boolean);
  appStore.setIsBackendDemo(Boolean(window.ccb_ajax_window?.is_backend_demo));
  appStore.setCalcUrl(calcUrl);
  appStore.setExportLink(exportLink as string);
});
</script>

<style lang="scss">
body {
  background-color: #1d2327 !important;
}

#wpcontent {
  border-radius: 16px;
  background: #f4f4f4;
}

.Toastify__toast-container {
  z-index: 999999 !important;
}
</style>
