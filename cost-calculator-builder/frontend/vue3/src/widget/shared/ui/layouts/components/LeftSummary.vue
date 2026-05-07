<template>
  <div
    class="ccb-vertical-layout"
    :class="{
      'enough-pages': enoughPages,
      'summary-last-page': summaryLastPage,
    }"
  >
    <Wrapper
      v-if="!summaryLastPage"
      wrapper="subtotal"
      class="ccb-subtotals-block ccb-subtotals-block-summary"
      :id="getStickyId"
    >
      <TotalSummary
        :summaries="
          fieldsStore.getSummaryList.filter(
            (summary) =>
              !summary.hidden &&
              activePageFieldsAliases.includes(summary.alias),
          )
        "
        :totals="fieldsStore.getTotalsList.filter((summary) => !summary.hidden)"
        :show-summary="formDisplaySummaryStatus"
        :form-title="settingsStore.getFormSettings?.summaryDisplay?.formTitle"
        :show-notifications="showNotifications"
        :notification-type="notificationsStore.notificationType"
        :notification-message="notificationsStore.message"
        :show-woo-redirect-cart="showWooRedirectCart"
      />
    </Wrapper>

    <Wrapper wrapper="fields">
      <Grid grid="list">
        <template
          v-for="(page, index) in fieldsStore.getPages"
          :key="page.alias"
        >
          <template
            v-if="
              index === activePageIndex && 'groupElements' in page && 'alias'
            "
          >
            <template v-for="inPage in page.groupElements">
              <template
                v-for="field in fieldsStore.getFields"
                :key="field.alias"
              >
                <Transition name="fade">
                  <CalculatorField
                    v-if="
                      isFieldHidden(field) &&
                      'alias' in inPage &&
                      inPage.alias === field.alias &&
                      !field.alias.includes('total')
                    "
                    :name="field.fieldName"
                    :field="field"
                    :key="field.alias"
                  />
                </Transition>
              </template>
            </template>
          </template>
        </template>

        <template v-if="activePageIndex === fieldsStore.getPages.length">
          <Wrapper
            wrapper="subtotal"
            class="ccb-subtotals-block"
            :id="getStickyId"
          >
            <TotalSummary
              :summaries="
                fieldsStore.getSummaryList.filter((summary) => !summary.hidden)
              "
              :totals="
                fieldsStore.getTotalsList.filter((summary) => !summary.hidden)
              "
              :show-summary="formDisplaySummaryStatus"
              :form-title="
                settingsStore.getFormSettings?.summaryDisplay?.formTitle
              "
              :show-notifications="notificationsStore.notificationStatus"
              :notification-type="notificationsStore.notificationType"
              :notification-message="notificationsStore.message"
              :show-woo-redirect-cart="showWooRedirectCart"
            />
          </Wrapper>
        </template>
      </Grid>
      <slot />
    </Wrapper>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Wrapper from "@/widget/shared/ui/wrappers/Wrapper.vue";
import CalculatorField from "@/widget/features/calculator-fields/CalculatorField.vue";
import Grid from "@/widget/shared/ui/grids/Grid.vue";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import TotalSummary from "@/widget/shared/ui/wrappers/components/TotalSummary.vue";
import { useNotificationsStore } from "@/widget/app/providers/stores/notificationsStore.ts";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { Field } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";

const notificationsStore = useNotificationsStore();

const fieldsStore = useFieldsStore();
const settingsStore = useSettingsStore();
const appearanceStore = useAppearanceStore();
const appStore = useAppStore();

const showNotifications = computed((): boolean => {
  return (
    notificationsStore.notificationStatus &&
    (notificationsStore.notificationType !== "finish" ||
      !settingsStore.hasThankYouPage) &&
    !getWooStayOnPage.value
  );
});

const enoughPages = computed(() => {
  return fieldsStore.getPages.length > 1;
});

const activePageFieldsAliases = computed(() => {
  const allAliases: string[] = [];

  for (let i = 0; i <= activePageIndex.value; i++) {
    const page = fieldsStore.getPages[i];
    if ("groupElements" in page && page.groupElements) {
      page.groupElements.forEach((section: any) => {
        if ("fields" in section && Array.isArray(section.fields)) {
          section.fields.forEach((field: Field) => {
            if (field.alias) {
              if (
                "groupElements" in field &&
                field.groupElements &&
                Array.isArray(field.groupElements)
              ) {
                if (field.alias.includes("repeater")) {
                  allAliases.push(field.alias);
                }
                field.groupElements.forEach((groupElement: any) => {
                  if (groupElement.alias) {
                    allAliases.push(groupElement.alias);
                  }
                });
              } else {
                allAliases.push(field.alias);
              }
            }
          });
        }
      });
    }
  }

  return allAliases;
});

const isFieldHidden = computed(() => {
  return (field: Field) => {
    if (field?.hidden) {
      return !field.hidden;
    }

    if (field?.hideAndLeaveTotal) {
      return !field.hideAndLeaveTotal;
    }

    return true;
  };
});

const pageBreakerSettings = settingsStore.getPageBreakerSettings;

const showWooRedirectCart = computed((): boolean => {
  return (
    notificationsStore.notificationType === "success" && getWooStayOnPage.value
  );
});

const activePageIndex = computed(() => {
  return fieldsStore.getActivePageIndex;
});

const getWooStayOnPage = computed((): boolean => {
  return (
    settingsStore.getWooCheckoutSettings?.redirectTo === "stay" &&
    notificationsStore.message === "Stay on page"
  );
});

const formDisplaySummaryStatus = computed(() => {
  const summaryDisplay = settingsStore.getFormSettings?.summaryDisplay;
  if (
    summaryDisplay?.enable &&
    settingsStore.getFormSettings?.accessEmail === true
  ) {
    if (
      ["show_summary_block", "show_summary_block_with_pdf"].includes(
        summaryDisplay?.actionAfterSubmit,
      )
    ) {
      return settingsStore.summaryDisplayShowSummary;
    }

    return false;
  }

  return true;
});

const summaryLastPage = computed(() => {
  return enoughPages.value && pageBreakerSettings?.summaryAfterLastPage;
});

const getStickyId = computed(() => {
  const stickyStatus = settingsStore.general?.sticky;
  if (appearanceStore.getAppearanceBoxStyle === "horizontal" || !stickyStatus) {
    if (window.$ccbSticky) window.$ccbSticky.destroy();
    return null;
  }

  if (window.$ccbSticky) window.$ccbSticky.initialize();

  return `ccb_summary_sticky_${appStore.getCalcId}`;
});
</script>

<style lang="scss">
.ccb-vertical-layout {
  display: flex;
  flex-direction: row;
  gap: 20px;

  @media (max-width: 540px) {
    flex-direction: column;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  &.summary-last-page {
    grid-template-columns: 1fr;
  }
}
</style>
