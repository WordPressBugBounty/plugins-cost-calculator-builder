<template>
  <PopupContent>
    <Header>
      <template #left>
        <Logo />
      </template>
    </Header>
    <div class="ccb-templates-flow">
      <TemplateList />
    </div>
  </PopupContent>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import { Header, Logo, PopupContent } from "@/admin/shared/ui/components";
import TemplateList from "@/admin/features/flow/TemplateList/TemplateList.vue";

const flowStore = useFlowStore();

onMounted(() => {
  flowStore.fetchCalculators();
  flowStore.fetchTemplates();
});
</script>

<style scoped lang="scss">
.ccb-admin-header__right-buttons {
  display: flex;
  column-gap: 8px;
}

.ccb-admin-flow-page__header {
  margin-bottom: 16px;
}

.header__items {
  display: flex;
  column-gap: 8px;
}

:deep(.ccb-popup__close) {
  display: none;
}

.ccb-templates-flow {
  width: 100%;
  height: 100%;
  display: flex;
}

.popup-content {
  justify-content: center;
  margin-top: 100px;
}

.import-content {
  width: 100%;
  height: calc(100% - 64px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
