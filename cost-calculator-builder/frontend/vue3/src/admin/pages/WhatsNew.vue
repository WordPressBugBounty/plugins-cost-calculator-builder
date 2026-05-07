<template>
  <div class="ccb-whats-new-page">
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
        <div class="ccb-admin-header__right-buttons">
          <Button
            v-if="!isProActive"
            :label="translations.getPro"
            height="30px"
            size="m"
            class="ccb-admin-header-get-pro"
            type="dark-blue"
            @click="redirectTo('cost_calculator_gopro')"
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
        <ThemeToggle v-if="!isCustomizeFlowActive" />
      </template>
    </Header>
    <div class="ccb-whats-new-content">
      <WhatsNewSlider
        @upgrade="redirectTo('cost_calculator_gopro')"
        @learnMore="openDocs"
        @skip="redirectTo('cost_calculator_builder')"
        @finish="redirectTo('cost_calculator_builder')"
      />
    </div>
  </div>
  <PopupContent v-if="popup" @close="closePopup">
    <Header>
      <template #left>
        <Logo />
      </template>
    </Header>
    <div class="ccb-templates-flow popup-content" v-if="action !== 'template'">
      <TemplateSteps @action-selected="actionSelected" />
    </div>
    <div class="ccb-templates-flow" v-if="action === 'template'">
      <TemplateList />
    </div>
  </PopupContent>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Header,
  Logo,
  PopupContent,
  ThemeToggle,
} from "@/admin/shared/ui/components";
import { Button } from "@/admin/shared/ui/UIKit";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import WhatsNewSlider from "@/admin/features/whats-new/components/WhatsNewSlider.vue";
import TemplateSteps from "@/admin/features/flow/TemplateSteps/TemplateSteps.vue";
import TemplateList from "@/admin/features/flow/TemplateList/TemplateList.vue";

const flowStore = useFlowStore();
const appStore = useAppStore();
const appearanceStore = useAppearanceStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
const popup = ref<boolean>(false);
const action = ref<string>("");
const isCustomizeFlowActive = computed(
  () => appearanceStore.getIsCustomizeFlowActive,
);
const isProActive = computed(() => flowStore.getProActive);

const clickCreateCalculator = (): void => {
  action.value = "";
  popup.value = true;
  flowStore.setSelectedIds([]);
};

const actionSelected = async (value: string): Promise<void> => {
  if (value === "calculator") {
    await appStore.createCalculator();

    if (appStore.getCalcId) {
      appStore.setCurrentPage("cost_calculator_builder");
    }

    action.value = "";
    popup.value = false;
    return;
  }

  action.value = value;
};

const closePopup = (): void => {
  action.value = "";
  popup.value = false;
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
      onClick: () => redirectTo("cost_calculator_settings"),
    },
  ];
});

const redirectTo = (page: string) => {
  const currentPage = appStore.getCurrentPage;
  if (currentPage === page) {
    return;
  }
  window.location.href = `/wp-admin/admin.php?page=${page}`;
};

const openDocs = (url: string): void => {
  const normalizedUrl = (url ?? "").trim();
  window.open(
    normalizedUrl || "https://stylemixthemes.com/cost-calculator-plugin/",
    "_blank",
  );
};

onMounted(() => {
  flowStore.fetchTemplates();
});
</script>

<style scoped lang="scss">
.ccb-whats-new-page {
  display: flex;
  flex-direction: column;
  row-gap: 15px;
  height: 100%;
  padding-right: 24px;
  padding-left: 4px;
  font-family: "Red Hat Display", sans-serif;
}

.ccb-admin-header__right-buttons {
  display: flex;
  column-gap: 8px;
}

.header__items {
  display: flex;
  column-gap: 8px;
}

.ccb-whats-new-content {
  flex: 1;
  margin-bottom: 24px;
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

.ccb-admin-header-get-pro {
  position: relative;

  &:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 12px;
    height: 12px;
    border-radius: 9px;
    box-shadow: 0 4px 4px 0 #00000029;
    background: #ff3c3c;
  }
}
</style>
