<template>
  <BuilderContainer>
    <template #body>
      <div class="ccb-confirmation-module__body">
        <BuilderNavigation />
        <component :is="ConfirmationContent" />
      </div>
    </template>
    <template #toolbar>
      <SidebarCollapseToolbar />
    </template>
    <template #sidebar>
      <ConfirmationSidebar />
    </template>
  </BuilderContainer>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import BuilderContainer from "@/admin/shared/ui/components/Builder/BuilderContainer.vue";
import BuilderNavigation from "@/admin/features/builder/common/BuilderNavigation.vue";
import SidebarCollapseToolbar from "@/admin/features/builder/common/SidebarCollapseToolbar.vue";
import ConfirmationSidebar from "./ConfirmationSidebar.vue";

const appStore = useAppStore();

const ConfirmationContent = computed(() => {
  if (appStore.getIsPro) {
    return defineAsyncComponent(() => import("./ConfirmationContent.vue"));
  } else {
    return defineAsyncComponent(() => import("./ConfirmationWithoutPro.vue"));
  }
});
</script>

<style scoped lang="scss">
.ccb-confirmation-module__body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  justify-content: flex-start;
}
</style>
