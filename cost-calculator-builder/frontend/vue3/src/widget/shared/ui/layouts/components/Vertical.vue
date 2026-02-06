<template>
  <div
    class="ccb-vertical-layout"
    :class="{
      'enough-pages': enoughPages,
      'summary-last-page': summaryLastPage,
    }"
  >
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
            <template v-slot:default>
              <template v-if="formDisplaySummaryStatus">
                <TotalSummaryList list-type="summary">
                  <template
                    v-for="summary in fieldsStore.getSummaryList"
                    :key="summary.alias"
                  >
                    <Transition name="fade">
                      <TotalSummaryItem
                        v-if="!summary.hidden"
                        :item-type="getFieldItemType(summary)"
                        :summary="summary"
                      ></TotalSummaryItem>
                    </Transition>
                  </template>
                </TotalSummaryList>

                <TotalSummaryList list-type="total">
                  <template
                    v-for="summary in fieldsStore.getTotalsList"
                    :key="summary.alias"
                  >
                    <Transition name="fade">
                      <TotalSummaryItem
                        v-if="!summary.hidden"
                        item-type="total"
                        :summary="summary"
                      ></TotalSummaryItem>
                    </Transition>
                  </template>
                </TotalSummaryList>
              </template>
              <template v-else>
                <HeaderTitle
                  :title="
                    settingsStore.getFormSettings?.summaryDisplay?.formTitle
                  "
                />
              </template>

              <Promocode v-if="hasPromocodes()" />

              <WooRedirectCart v-if="showWooRedirectCart" />

              <div
                class="ccb-actions"
                :class="activeActionCount"
                :style="
                  !orderFormStore.getNextButtonStatus
                    ? 'flex-direction: column;'
                    : ''
                "
                ref="actionsRef"
              >
                <Submission class="ccb-actions__item" />
                <PdfInvoice class="ccb-actions__item" />
              </div>
            </template>

            <template v-slot:notifications>
              <Notifications
                v-if="notificationsStore.notificationStatus"
                :type="notificationsStore.notificationType"
                :message="notificationsStore.message"
              />
            </template>
          </Wrapper>
        </template>
      </Grid>
    </Wrapper>
    <Wrapper
      v-if="!summaryLastPage"
      wrapper="subtotal"
      class="ccb-subtotals-block ccb-subtotals-block-summary"
      :id="getStickyId"
    >
      <template v-slot:default>
        <template v-if="formDisplaySummaryStatus">
          <TotalSummaryList list-type="summary">
            <template
              v-for="summary in fieldsStore.getSummaryList"
              :key="summary.alias"
            >
              <Transition name="fade">
                <TotalSummaryItem
                  v-if="
                    !summary.hidden &&
                    activePageFieldsAliases.includes(summary.alias)
                  "
                  :item-type="getFieldItemType(summary)"
                  :summary="summary"
                ></TotalSummaryItem>
              </Transition>
            </template>
          </TotalSummaryList>

          <TotalSummaryList list-type="total">
            <template
              v-for="summary in fieldsStore.getTotalsList"
              :key="summary.alias"
            >
              <Transition name="fade">
                <TotalSummaryItem
                  v-if="!summary.hidden"
                  item-type="total"
                  :summary="summary"
                ></TotalSummaryItem>
              </Transition>
            </template>
          </TotalSummaryList>
        </template>
        <template v-else>
          <HeaderTitle
            :title="settingsStore.getFormSettings?.summaryDisplay?.formTitle"
          />
        </template>

        <Promocode v-if="hasPromocodes()" />

        <WooRedirectCart v-if="showWooRedirectCart" />

        <div
          class="ccb-actions"
          :class="activeActionCount"
          :style="
            !orderFormStore.getNextButtonStatus ? 'flex-direction: column;' : ''
          "
          ref="actionsRef"
        >
          <Submission class="ccb-actions__item" />
          <PdfInvoice class="ccb-actions__item" />
        </div>
      </template>

      <template v-slot:notifications>
        <Notifications
          v-if="showNotifications"
          :type="notificationsStore.notificationType"
          :message="notificationsStore.message"
        />
      </template>
    </Wrapper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Wrapper from "@/widget/shared/ui/wrappers/Wrapper.vue";
import CalculatorField from "@/widget/features/calculator-fields/CalculatorField.vue";
import Grid from "@/widget/shared/ui/grids/Grid.vue";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import TotalSummaryList from "@/widget/shared/ui/total-summary/TotalSummaryList.vue";
import TotalSummaryItem from "@/widget/shared/ui/total-summary/TotalSummaryItem.vue";
import Promocode from "@/widget/features/discounts/components";
import { useDiscounts } from "@/widget/actions/discounts/composable/useDiscounts.ts";
import { useNotificationsStore } from "@/widget/app/providers/stores/notificationsStore.ts";
import Submission from "@/widget/features/submission";
import Notifications from "@/widget/shared/ui/components/Notifications";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { Field } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";
import HeaderTitle from "@/widget/shared/ui/wrappers/components/HeaderTitle.vue";
import PdfInvoice from "@/widget/features/pdf-invoice/send-quote";
import WooRedirectCart from "@/widget/shared/ui/wrappers/components/WooRedirectCart.vue";
import { useOrderFormStore } from "@/widget/app/providers/stores/orderFormStore.ts";

const notificationsStore = useNotificationsStore();

const fieldsStore = useFieldsStore();
const settingsStore = useSettingsStore();
const appearanceStore = useAppearanceStore();
const appStore = useAppStore();
const { hasPromocodes } = useDiscounts();
const orderFormStore = useOrderFormStore();

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

const getFieldItemType = computed(() => {
  return (summary: Field): "summary" | "repeater" | "group" | "total" => {
    const types: { [key: string]: "repeater" | "group" | "total" } = {
      repeater: "repeater",
      group: "group",
      total: "total",
    };
    return types[summary.fieldName as keyof typeof types] || "summary";
  };
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

const actionsRef = ref<HTMLElement | null>(null);

const activeActionCount = computed(() => {
  const getActionsCount = (): number => {
    if (actionsRef.value) {
      return actionsRef.value.children.length;
    }
    return 0;
  };

  return showShareBtn.value
    ? `button-${getActionsCount()} has-share`
    : `button-${getActionsCount()} `;
});

const showShareBtn = computed(() => {
  return settingsStore.getInvoice?.emailButton;
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
  return pageBreakerSettings?.summaryAfterLastPage;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  counter-reset: ccb-section;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  &.summary-last-page {
    grid-template-columns: 1fr;
  }

  &.enough-pages {
    background-color: var(--ccb-container-color);
  }
}
</style>
