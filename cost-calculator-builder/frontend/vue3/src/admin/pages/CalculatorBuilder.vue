<template>
  <Wrapper>
    <Header>
      <template #left>
        <button
          class="ccb-back-btn"
          @click="goToCalculatorsList"
          :title="translations.calculators || 'Calculators'"
        >
          <i class="ccb-icon-ic_back"></i>
        </button>
        <Logo />
        <div class="header__items">
          <Button
            v-for="button in getButtons"
            :key="button.label"
            :label="button.label"
            :size="button.size"
            :onClick="button.onClick"
            :active="button.isActive"
          />
        </div>
      </template>
      <template #right>
        <div class="ccb-admin-header__right-buttons">
          <template v-if="showHeaderActions">
            <template v-if="isBuilderPage">
              <div class="ccb-steps-container">
                <button
                  class="ccb-steps--undo ccb-header-icon-btn"
                  :class="{ 'ccb-header-icon-btn--disabled': !canUndo }"
                  :disabled="!canUndo"
                  :title="isMac ? '⌘Z' : 'Ctrl+Z'"
                  @click="undo"
                >
                  <i class="ccb-icon-Undo-Icon"></i>
                </button>
                <button
                  class="ccb-steps--redo ccb-header-icon-btn"
                  :class="{ 'ccb-header-icon-btn--disabled': !canRedo }"
                  :disabled="!canRedo"
                  :title="isMac ? '⌘⇧Z' : 'Ctrl+Shift+Z'"
                  @click="redo"
                >
                  <i class="ccb-icon-Redo-Icon"></i>
                </button>
              </div>

              <div class="ccb-save-status" :class="saveStatusClass">
                <i v-if="saveStatusIcon" :class="saveStatusIcon"></i>
                <span class="ccb-save-status__text">{{ saveStatusText }}</span>
              </div>
            </template>
            <div class="ccb-save-split-btn" v-click-outside="closeSaveDropdown">
              <Button
                :label="saveButtonLabel"
                height="30px"
                size="m"
                :type="saveButtonType"
                :disabled="isSaving"
                :onClick="handleSave"
              />
              <button
                class="ccb-save-split-btn__caret"
                :class="{ 'ccb-save-split-btn__caret--open': showSaveTemplate }"
                :disabled="isSaving"
                @click.stop="showSaveTemplate = !showSaveTemplate"
              >
                <i class="ccb-icon-ic_caret_down"></i>
              </button>
              <ul v-if="showSaveTemplate" class="ccb-save-split-btn__dropdown">
                <li @click="handleSaveAsTemplate">
                  {{ translations.saveAsTemplate || "Save as Template" }}
                </li>
              </ul>
            </div>
            <Button
              :label="translations.embed"
              height="30px"
              size="m"
              type="green-ghost"
              iconLeft="ccb-icon-ic_embed"
              :active="true"
              :onClick="
                () => {
                  isEmbedPopupOpen = true;
                }
              "
            />
            <Button
              v-if="false"
              label=""
              height="30px"
              size="m"
              type="blue"
              iconLeft="ccb-icon-ic_play"
              :onClick="() => {}"
            />
          </template>
        </div>
        <ThemeToggle />
      </template>
    </Header>
    <div class="ccb-request-loader" v-if="calculatorStore.getRequestLoader">
      <Loader />
    </div>
    <component :is="getCurrentComponent" v-else />
    <EmbedPopup v-if="isEmbedPopupOpen" @close="isEmbedPopupOpen = false" />
  </Wrapper>
</template>

<script setup lang="ts">
import {
  onMounted,
  onUnmounted,
  computed,
  defineAsyncComponent,
  ref,
  watch,
} from "vue";
import {
  Wrapper,
  Header,
  Logo,
  ThemeToggle,
  EmbedPopup,
} from "@/admin/shared/ui/components";
import { Button, Loader } from "@/admin/shared/ui/UIKit";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { useBuilderHistory } from "@/admin/features/builder/calculator/CalculatorFieldsSettings/useBuilderHistory";
import { toast } from "vue3-toastify";
import type { CalculatorAdminPage } from "@/admin/shared/types/builder.type";

const calculatorStore = useCalculatorStore();
const appStore = useAppStore();
const builderStore = useBuilderStore();
const orderFormStore = useOrderFormStore();
const conditionsStore = useConditionsStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
const builderContent = builderStore.getBuilderContent;
const isEmbedPopupOpen = ref(false);
const showSaveTemplate = ref(false);

const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    (el as any).__clickOutsideHandler = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        binding.value();
      }
    };
    document.addEventListener("click", (el as any).__clickOutsideHandler);
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener("click", (el as any).__clickOutsideHandler);
  },
};

const closeSaveDropdown = (): void => {
  showSaveTemplate.value = false;
};

const {
  canUndo,
  canRedo,
  isDirty,
  isSaving,
  initHistory,
  refreshBaseline,
  undo,
  redo,
  markSaved,
  setupKeyboardShortcuts,
  teardownKeyboardShortcuts,
} = useBuilderHistory();

const isMac = navigator.platform.toUpperCase().includes("MAC");

const currentPage = computed<CalculatorAdminPage>(
  () => builderStore.getCurrentCalculatorPage as CalculatorAdminPage,
);
const isBuilderPage = computed(() => currentPage.value === "builder");
const showHeaderActions = computed(
  () =>
    (currentPage.value !== "builder" ||
      builderContent.content !== "order-form") &&
    currentPage.value !== "discounts",
);

const savingDots = ref("");
let savingDotsInterval: ReturnType<typeof setInterval> | null = null;

function startSavingDots(): void {
  let count = 0;
  savingDots.value = ".";
  savingDotsInterval = setInterval(() => {
    count = (count + 1) % 3;
    savingDots.value = ".".repeat(count + 1);
  }, 400);
}

function stopSavingDots(): void {
  if (savingDotsInterval) {
    clearInterval(savingDotsInterval);
    savingDotsInterval = null;
  }
  savingDots.value = "";
}

const saveStatusClass = computed(() => {
  if (isSaving.value) return "ccb-save-status--saving";
  if (isDirty.value) return "ccb-save-status--unsaved";
  return "ccb-save-status--saved";
});

const saveStatusIcon = computed(() => {
  if (isSaving.value) return "";
  if (isDirty.value) return "ccb-save-status__dot";
  return "ccb-icon-ic_check";
});

const saveStatusText = computed(() => {
  if (isSaving.value) return `Saving${savingDots.value}`;
  if (isDirty.value) return "Unsaved changes";
  return "Saved";
});

const saveButtonLabel = computed(() => {
  if (isSaving.value) return `Saving${savingDots.value}`;
  return translations.value.save;
});

const saveButtonType = computed(() => {
  if (isSaving.value) return "default" as const;
  if (isBuilderPage.value && isDirty.value) return "green" as const;
  return "green" as const;
});

const handleSave = async (): Promise<void> => {
  isSaving.value = true;
  startSavingDots();
  await calculatorStore.saveCalculatorAdminData();
  markSaved();
  stopSavingDots();
  isSaving.value = false;
};

const handleSaveAsTemplate = async (): Promise<void> => {
  showSaveTemplate.value = false;
  isSaving.value = true;
  startSavingDots();
  await calculatorStore.saveCalculatorAdminData();
  await calculatorStore.saveAsTemplate();
  markSaved();
  stopSavingDots();
  isSaving.value = false;

  const templatesUrl = `${window.location.origin}/wp-admin/admin.php?page=cost_calculator_templates`;
  toast(translations.value.savedAsTemplate || "Saved as template", {
    type: "success",
  });
  window.location.replace(templatesUrl);
};

const canLeaveOrderFormModule = async (): Promise<boolean> => {
  if (currentPage.value !== "builder") return true;
  if (builderContent.content !== "order-form") return true;
  if (!orderFormStore.getIsTitleDirty) return true;

  const shouldApply = window.confirm(
    translations.value
      .youHaveUnsavedTitleChangesClickOkToApplyChangesOrCancelToDiscard,
  );

  if (shouldApply) {
    const success = await orderFormStore.updateForm();
    if (!success) {
      toast(translations.value.unableToApplyTitleChanges, { type: "error" });
      return false;
    }
    toast(translations.value.titleChangesApplied, { type: "success" });
    return true;
  }

  orderFormStore.discardActiveTitleChanges();
  return true;
};

const goToCalculatorsList = (): void => {
  builderStore.$reset();
  orderFormStore.$reset();
  calculatorStore.$reset();
  conditionsStore.$reset();

  appStore.setPage("flow");
  appStore.setEditMode(false);
  appStore.setCalcId(null);
  window.history.replaceState({}, "", "?page=cost_calculator_builder");
};

const handlePageChange = async (page: CalculatorAdminPage): Promise<void> => {
  if (page === currentPage.value) return;
  const canLeave = await canLeaveOrderFormModule();
  if (!canLeave) return;

  builderStore.setCurrentCalculatorPage(page);
};

const getButtons = computed(() => {
  return [
    {
      label: translations.value.builder,
      isActive: currentPage.value === "builder",
      size: "m" as const,
      onClick: () => void handlePageChange("builder"),
    },
    {
      label: translations.value.conditions,
      isActive: currentPage.value === "conditions",
      size: "m" as const,
      onClick: () => void handlePageChange("conditions"),
    },
    {
      label: translations.value.discounts,
      isActive: currentPage.value === "discounts",
      size: "m" as const,
      onClick: () => void handlePageChange("discounts"),
    },
    {
      label: translations.value.settings,
      isActive: currentPage.value === "settings",
      size: "m" as const,
      onClick: () => void handlePageChange("settings"),
    },
  ];
});

const getCurrentComponent = computed(() => {
  switch (currentPage.value) {
    case "builder":
      return defineAsyncComponent(
        () => import("@/admin/widgets/calculator/Builder.vue"),
      );
    case "conditions":
      if (appStore.getIsPro) {
        return defineAsyncComponent(
          () => import("@/admin/widgets/calculator/Conditions/Conditions.vue"),
        );
      } else {
        return defineAsyncComponent(
          () =>
            import(
              "@/admin/widgets/calculator/Conditions/ConditionsWithoutPro.vue"
            ),
        );
      }
    case "discounts":
      if (appStore.getIsPro) {
        return defineAsyncComponent(
          () => import("@/admin/widgets/calculator/Discounts/Discounts.vue"),
        );
      } else {
        return defineAsyncComponent(
          () =>
            import(
              "@/admin/widgets/calculator/Discounts/DiscountsWithoutPro.vue"
            ),
        );
      }
    case "settings":
      return defineAsyncComponent(
        () => import("@/admin/widgets/calculator/Settings.vue"),
      );
    default:
      return null;
  }
});

watch(
  () => calculatorStore.getRequestLoader,
  (loading, wasLoading) => {
    if (wasLoading && !loading) {
      initHistory();
      setTimeout(() => refreshBaseline(), 500);
    }
  },
);

onMounted(() => {
  calculatorStore.getCalculatorAdminData(appStore.getCalcId || 0);
  setupKeyboardShortcuts();
});

onUnmounted(() => {
  teardownKeyboardShortcuts();
  stopSavingDots();
});
</script>

<style scoped lang="scss">
.ccb-back-btn {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: var(--ccb-bw-dull-normal);
  color: var(--ccb-font-labels);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  transition: var(--ccb-transition-normal, 0.2s ease);

  &:hover {
    background: var(--ccb-bw-dull-hover, #f5f5f5);
  }
}

.ccb-steps-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.ccb-admin-header__right-buttons {
  display: flex;
  column-gap: 8px;
  align-items: center;
}

.header__items {
  display: flex;
  column-gap: 8px;
}

.ccb-request-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  font-size: 16px;
  font-weight: 600;
  padding: 10px;
  border-radius: 4px;
}

.ccb-header-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 0;
  background: var(--ccb-bw-dull-normal);
  cursor: pointer;
  color: var(--ccb-font-labels, #373737);
  transition: var(--ccb-transition-normal, 0.2s ease);
  flex-shrink: 0;

  &.ccb-steps--undo {
    border-radius: 20px 0 0 20px;
  }

  &.ccb-steps--redo {
    border-radius: 0 20px 20px 0;
  }

  i {
    font-size: 14px;
  }

  &:hover:not(:disabled) {
    background-color: var(--ccb-bw-dull-hover, #f5f5f5);
  }

  &--disabled,
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    background-color: var(--ccb-bw-dull-disabled);
  }
}

.ccb-save-split-btn {
  position: relative;
  display: flex;
  align-items: center;

  :deep(.ccb-button) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding-right: 12px;
  }

  &__caret {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    width: 28px;
    border: none;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    background-color: var(--ccb-green-bg-normal);
    color: var(--ccb-button-w-normal);
    border-radius: 0 99px 99px 0;
    cursor: pointer;
    transition: var(--ccb-transition-normal);
    padding-right: 2px;

    i {
      font-size: 12px;
      transition: transform 0.2s ease;
    }

    &--open i {
      transform: rotate(180deg);
    }

    &:hover {
      background-color: var(--ccb-green-bg-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 100;
    min-width: 170px;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    background: var(--ccb-bg-primary, #fff);
    border: 1px solid var(--ccb-border-normal, #e0e0e0);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    li {
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 500;
      color: var(--ccb-font-labels, #373737);
      cursor: pointer;
      white-space: nowrap;
      transition: background-color 0.15s ease;

      &:hover {
        background-color: var(--ccb-bw-dull-hover, #f5f5f5);
      }
    }
  }
}

.ccb-save-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  height: 32px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 99px;
  user-select: none;
  flex-shrink: 0;

  &__text {
    line-height: 1;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #f5a623;
    display: inline-block;
    flex-shrink: 0;
  }

  &--saved {
    color: var(--ccb-green-fg-normal, #1aab56);

    i {
      font-size: 14px;
    }
  }

  &--unsaved {
    color: #f5a623;
    background-color: rgba(245, 166, 35, 0.08);
  }

  &--saving {
    color: var(--ccb-blue-fg-normal, #1e73be);
    background-color: var(--ccb-blue-bg-dull-normal, rgba(30, 115, 190, 0.08));

    .ccb-save-status__text {
      display: inline-block;
      min-width: 62px;
      text-align: left;
    }
  }
}
</style>
