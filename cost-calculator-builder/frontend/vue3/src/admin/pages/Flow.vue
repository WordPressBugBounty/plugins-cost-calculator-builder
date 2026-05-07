<template>
  <div class="ccb-flow-page-root">
    <Wrapper>
      <div class="ccb-flow-page-loader" v-if="isPageLoading">
        <Loader />
      </div>
      <Suspense v-else>
        <template #default>
          <div class="ccb-flow-page">
            <Header>
              <template #left>
                <Logo />
                <div class="header__items">
                  <Button
                    v-for="button in getButtons"
                    :key="button.label"
                    :label="button.label"
                    :size="button.size"
                    :iconLeft="button.iconLeft"
                    :onClick="button.onClick"
                    :active="button.isActive"
                  />
                </div>
              </template>
              <template #right>
                <div
                  class="ccb-admin-header__right-buttons"
                  :class="{ 'ccb-show-buttons': showButtons }"
                >
                  <Button
                    label="Get PRO"
                    height="30px"
                    size="m"
                    type="blue"
                    @click="getProPage"
                    v-if="!flowStore.getProActive"
                  />
                  <Button
                    :label="translations.create"
                    iconLeft="ccb-icon-ic_plus_big"
                    height="30px"
                    size="m"
                    type="green"
                    @click="clickCreateCalculator"
                  />
                </div>
                <ThemeToggle />
              </template>
            </Header>
            <CalculatorList
              @open-import="clickImport"
              :calculators="getCalcultors"
            />
            <CalculatorPagination
              :key="getTotal"
              v-if="+getTotal > 9 && flowStore.getFirstLoadCalculatorsCount > 0"
            />
          </div>
        </template>
        <template #fallback>
          <div class="ccb-flow-page-loader">
            <Loader />
          </div>
        </template>
      </Suspense>
    </Wrapper>

    <PopupContent v-if="popup" @close="closePopup" :showBackButton="true">
      <Header>
        <template #left>
          <Logo />
        </template>
      </Header>
      <template v-if="modalType === 'flow'">
        <div
          class="ccb-templates-flow popup-content"
          v-if="action !== 'template'"
        >
          <TemplateSteps @action-selected="actionSelected" />
        </div>
        <div class="ccb-templates-flow" v-if="action === 'template'">
          <TemplateList />
        </div>
      </template>
      <template v-if="modalType === 'import'">
        <div class="ccb-templates-flow import-content">
          <ImportBox @close="closePopup" />
        </div>
      </template>
    </PopupContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import {
  Wrapper,
  Header,
  Logo,
  PopupContent,
  ThemeToggle,
} from "@/admin/shared/ui/components";
import { CalculatorList } from "@/admin/features/flow/CalculatorList";
import { Button, Loader } from "@/admin/shared/ui/UIKit";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import TemplateSteps from "@/admin/features/flow/TemplateSteps/TemplateSteps.vue";
import TemplateList from "@/admin/features/flow/TemplateList/TemplateList.vue";
import { ImportBox } from "@/admin/features/import";
import { ICalculator } from "@/admin/shared/types/calculator.type";
import CalculatorPagination from "@/admin/features/flow/CalculatorList/CalculatorPagination.vue";

const appStore = useAppStore();
const flowStore = useFlowStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
const popup = ref<boolean>(false);
const action = ref<string>("");
const modalType = ref<"flow" | "import" | "">("flow");

const showButtons = ref<boolean>(false);
const isPageLoading = ref<boolean>(true);

const clickCreateCalculator = (): void => {
  action.value = "";
  popup.value = true;
  modalType.value = "flow";
  flowStore.setSelectedIds([]);
};

const getProPage = (): void => {
  window.location.href = `${window.location.origin}/wp-admin/admin.php?page=cost_calculator_gopro`;
};

const clickImport = (): void => {
  modalType.value = "import";
  popup.value = true;
  flowStore.setSelectedIds([]);
};

const actionSelected = async (value: string): Promise<void> => {
  if (value === "calculator") {
    await appStore.createCalculator();
    action.value = "";
    popup.value = false;
  } else {
    action.value = value;
  }
};

const closePopup = (): void => {
  if (action.value === "template") {
    backPopup();
    return;
  }
  action.value = "";
  popup.value = false;
  modalType.value = "";
};

const backPopup = (): void => {
  if (action.value === "template") {
    action.value = "flow";
  }
};

const getCalcultors = computed((): ICalculator[] => {
  return flowStore.getCalculators;
});

const redirectTo = (page: string) => {
  const currentPage = appStore.getCurrentPage;
  if (currentPage === page) {
    return;
  }
  window.location.href = `/wp-admin/admin.php?page=${page}`;
};

const getButtons = computed(() => {
  return [
    {
      label: translations.value.calculators,
      isActive: true,
      iconLeft: "ccb-icon-ic_calc",
      size: "m" as const,
      onClick: () => redirectTo("cost_calculator_builder"),
    },
    {
      label: translations.value.orders,
      isActive: false,
      iconLeft: "ccb-icon-ic_order",
      size: "m" as const,
      onClick: () => redirectTo("cost_calculator_orders"),
    },
    {
      label: translations.value.analytics,
      isActive: false,
      iconLeft: "ccb-icon-ic_chart",
      size: "m" as const,
      onClick: () => redirectTo("cost_calculator_analytics"),
    },
    {
      label: translations.value.settings,
      isActive: false,
      iconLeft: "ccb-icon-ic_settings",
      size: "m" as const,
      onClick: () => redirectTo("cost_calculator_builder_settings"),
    },
  ];
});

const getTotal = computed(() => {
  if (flowStore.getTotal < 10) {
    localStorage.setItem("flow_current_page", "1");
  }
  return flowStore.getTotal;
});

const loadFlowPage = async (): Promise<void> => {
  try {
    await Promise.all([
      flowStore.fetchCalculators(),
      flowStore.fetchTemplates(),
    ]);
  } catch (error) {
    console.error("Failed to load flow page:", error);
  } finally {
    showButtons.value = true;
    isPageLoading.value = false;
    await nextTick();
  }
};

onMounted(() => {
  loadFlowPage();
});
</script>

<style scoped lang="scss">
.ccb-flow-page-root {
  height: 100%;
}

.ccb-flow-page {
  height: 100%;
}

.ccb-flow-page-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.ccb-admin-header__right-buttons {
  display: flex;
  column-gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;

  &.ccb-show-buttons {
    opacity: 1;
  }
}

.ccb-admin-flow-page__header {
  margin-bottom: 16px;
}

.header__items {
  display: flex;
  column-gap: 8px;
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
