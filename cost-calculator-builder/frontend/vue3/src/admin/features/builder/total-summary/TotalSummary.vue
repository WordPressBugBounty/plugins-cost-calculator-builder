<template>
  <BuilderContainer>
    <template #body>
      <div class="ccb-total-summary-module__body">
        <BuilderNavigation />
        <CalculatorContent />
      </div>
    </template>
    <template #toolbar>
      <SidebarCollapseToolbar />
    </template>
    <template #sidebar>
      <TotalSummarySidebar />
    </template>
  </BuilderContainer>
</template>

<script setup lang="ts">
import BuilderContainer from "@/admin/shared/ui/components/Builder/BuilderContainer.vue";
import BuilderNavigation from "@/admin/features/builder/common/BuilderNavigation.vue";
import SidebarCollapseToolbar from "@/admin/features/builder/common/SidebarCollapseToolbar.vue";
import TotalSummarySidebar from "./TotalSummarySidebar.vue";
import CalculatorContent from "../calculator/CalculatorContent.vue";
</script>

<style scoped lang="scss">
.ccb-total-summary-module__body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  row-gap: 20px;
}
</style>
