<template>
  <component :is="getCurrentComponent" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, inject, h, onMounted } from "vue";
import { useAdminTranslationsStore } from "@/admin/store/analytics/translationsStore";
import { IAdminTranslations } from "@/admin/shared/types/analytics/translations.type";

const page = inject("page");
const demo = inject("demo");

const getCurrentComponent = computed(() => {
  if (page === "analytics") {
    if (demo) {
      return defineAsyncComponent(
        () => import("@/admin/pages/OrderAnalyticsDemo/index.ts"),
      );
    }

    return defineAsyncComponent(
      () => import("@/admin/pages/OrderAnalytics/index.ts"),
    );
  }

  if (page === "calculator-list") {
    return defineAsyncComponent(
      () => import("@/admin/pages/CalculatorList/index.ts"),
    );
  }

  return h("div", "No page found");
});

onMounted(() => {
  const translationsStore = useAdminTranslationsStore();
  const translations = window.ccb_ajax_window?.translations;
  if (!translations) return;
  translationsStore.initTranslations(
    translations as unknown as IAdminTranslations,
  );
});
</script>

<style lang="scss">
#wpfooter {
  display: none !important;
}

#wpbody-content,
#wpcontent {
  padding-bottom: 0 !important;
}

.ccb-custom-scrollbar {
  /* Scrollbar Styling */
  &::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }

  &.ccb-scroll-hide {
    &::-webkit-scrollbar {
      display: none;
    }
  }

  &::-webkit-scrollbar-track {
    transition: 300ms ease;
    background-color: transparent;
    -webkit-border-radius: 4px;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    transition: 300ms ease;
    -webkit-border-radius: 4px;
    border-radius: 4px;
    background: transparent;
  }

  &:hover {
    &::-webkit-scrollbar {
      background-color: #ebebeb;
    }

    &::-webkit-scrollbar-thumb {
      -webkit-border-radius: 4px;
      border-radius: 4px;
      background: #808c97;
    }
  }

  &.large {
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      -webkit-border-radius: 6px;
      border-radius: 6px;
    }

    &::-webkit-scrollbar-thumb {
      -webkit-border-radius: 6px;
      border-radius: 6px;
    }

    &:hover {
      &::-webkit-scrollbar-thumb {
        -webkit-border-radius: 6px;
        border-radius: 6px;
      }
    }
  }
}
</style>
