<template>
  <div class="ccb-mobile-summary">
    <div
      v-show="!isSummaryOpen"
      class="ccb-mobile-summary__trigger"
      :class="{
        'ccb-mobile-summary__trigger--inactive': !isTriggerActive,
        'ccb-mobile-summary__trigger--in-sticky-modal': isInStickyModal,
      }"
      :style="triggerZIndexStyle"
      @click="!enoughPages === true && openSummary()"
    >
      <div class="ccb-mobile-summary-content">
        <div class="ccb-mobile-summary-content__total">
          <span
            class="ccb-mobile-summary-content__total-label"
            v-for="total in miniWidgetTotals"
            :key="total.alias"
          >
            {{ total.label }} {{ total.displayValue }}
          </span>
          <span class="ccb-mobile-summary-content__total-description">
            <i class="ccb-icon-info"></i>{{ selectedItemsText }}
          </span>
        </div>
        <div class="ccb-mobile-summary-content__actions" v-if="!enoughPages">
          <button
            class="ccb-mobile-summary-content__action"
            @click="openSummary"
          >
            Total Summary
          </button>
        </div>
        <div class="ccb-mobile-summary-content__actions" v-if="enoughPages">
          <button
            v-if="hideBackButton"
            class="ccb-mobile-summary-content__nav ccb-mobile-summary-content__nav--prev"
            type="button"
            :aria-label="prevBtnText"
            @click="pageBreakerPrevPage"
          >
            <i class="ccb-icon-Arrow-Previous"></i>
          </button>
          <button
            v-if="hideNextButton && !lastPage"
            class="ccb-mobile-summary-content__nav ccb-mobile-summary-content__nav--next"
            type="button"
            :aria-label="nextBtnText"
            :disabled="pageBreakerStore.getDisableNextButton"
            @click="pageBreakerNextPage"
          >
            <i class="ccb-icon-Arrow-Previous"></i>
          </button>
          <button
            class="ccb-mobile-summary-content__action"
            @click="openSummary"
            v-if="lastPage"
          >
            Total Summary
          </button>
        </div>
      </div>
    </div>

    <Teleport :to="teleportTarget">
      <Transition name="ccb-mobile-summary-fade">
        <div
          v-if="isSummaryOpen"
          class="ccb-mobile-summary__overlay"
          @click.self="closeSummary"
        >
          <div
            class="ccb-mobile-summary__sheet"
            role="dialog"
            aria-modal="true"
            :aria-label="activeSummaryTitle"
          >
            <div class="ccb-mobile-summary__header">
              <div
                class="ccb-mobile-summary__back"
                @click="previousPage"
                v-if="activePage > 0"
              >
                <i class="ccb-icon-Arrow-Previous"></i>
              </div>
              <div class="ccb-mobile-summary__header-title">
                {{ activeSummaryTitle }}
              </div>
              <button
                class="ccb-mobile-summary__close"
                type="button"
                :aria-label="closeLabel"
                @click="closeSummary"
              >
                <i class="ccb-icon-close"></i>
              </button>
            </div>

            <div class="ccb-mobile-summary__pages">
              <Transition :name="pageTransitionName">
                <div
                  v-if="activePage === 0"
                  key="summary"
                  class="ccb-mobile-summary__page"
                >
                  <div class="ccb-mobile-summary__body">
                    <div
                      v-if="!isPageContentReady"
                      class="ccb-mobile-summary__content-loader"
                    >
                      <Loader type="submit" />
                    </div>
                    <template v-else>
                      <div
                        v-for="section in contentSectionBlocks"
                        :key="section.id"
                        style="
                          display: contents;
                          display: flex;
                          flex-direction: column;
                          gap: 20px;
                        "
                      >
                        <div
                          v-for="item in section.items"
                          :key="item.id"
                          style="display: contents"
                        >
                          <component
                            :is="getComponentByAlias(item.alias)"
                            v-bind="getItemProps(item.alias)"
                            v-on="getItemEvents(item.alias)"
                            @toggle-details="toggleDetailsVisibility"
                            :item="item"
                          />
                        </div>
                      </div>
                    </template>
                  </div>

                  <div
                    v-if="isPageContentReady"
                    class="ccb-mobile-summary__footer"
                  >
                    <div
                      v-for="section in footerSectionBlocks"
                      :key="section.id"
                      style="display: contents"
                      class="ccb-mobile-summary__footer-sections"
                      :class="{
                        'ccb-mobile-summary__footer-sections--hidden':
                          !isMakeOrderButtonVisible,
                      }"
                    >
                      <div
                        v-for="item in section.items"
                        :key="item.id"
                        :class="[
                          'ccb-mobile-summary__footer-item',
                          `ccb-mobile-summary__footer-item--${item.alias}`,
                        ]"
                      >
                        <component
                          :is="getComponentByAlias(item.alias)"
                          v-bind="getItemProps(item.alias)"
                          v-on="getItemEvents(item.alias)"
                          :item="item"
                        />
                      </div>
                    </div>
                    <button
                      class="ccb-button success"
                      style="width: 100%"
                      v-if="isMakeOrderButtonVisible"
                      @click="nextPage"
                    >
                      Make Order
                    </button>
                  </div>
                </div>

                <div
                  v-else-if="activePage === 1"
                  key="order"
                  class="ccb-mobile-summary__page"
                >
                  <div class="ccb-mobile-summary__body">
                    <div
                      v-if="!isPageContentReady"
                      class="ccb-mobile-summary__content-loader"
                    >
                      <Loader type="submit" />
                    </div>
                    <template v-else>
                      <div
                        v-for="section in secondPageSectionBlocks"
                        :key="section.id"
                        style="display: contents"
                      >
                        <div
                          v-for="item in section.items"
                          :key="item.id"
                          style="display: contents"
                        >
                          <component
                            :is="getComponentByAlias(item.alias)"
                            v-bind="getItemProps(item.alias)"
                            v-on="getItemEvents(item.alias)"
                            :item="item"
                          />
                        </div>
                      </div>
                    </template>
                  </div>
                </div>

                <div
                  v-else-if="activePage === 2"
                  key="quote"
                  class="ccb-mobile-summary__page"
                >
                  <div class="ccb-mobile-summary__body is-quote-page">
                    <div
                      v-if="!isPageContentReady"
                      class="ccb-mobile-summary__content-loader"
                    >
                      <Loader type="submit" />
                    </div>
                    <component
                      v-else
                      :is="quotePageComponent"
                      popup-mode="mobile-summary-page"
                      @close-mobile-quote="previousPage"
                    />
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, watch } from "vue";
import Loader from "@/widget/shared/ui/components/Loader/Loader.vue";
import { useMobileSummaryActiveTrigger } from "@/widget/shared/ui/wrappers/composable/useMobileSummaryActiveTrigger.ts";
import { useTotalSummaryStore } from "@/widget/app/providers/stores/totalSummaryStore.ts";
import { Field } from "@/widget/shared/types/fields";
import { ITotalSummarySection } from "@/widget/shared/types/app";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { NotificationsTypes } from "@/widget/shared/types/settings";
import { usePaymentAfterSubmitStore } from "@/widget/app/providers/stores/paymentAfterSubmit.ts";
import { useDiscounts } from "@/widget/actions/discounts/composable/useDiscounts.ts";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useOrderFormStore } from "@/widget/app/providers/stores/orderFormStore.ts";
import { usePaymentStore } from "@/widget/app/providers/stores/paymentsStore.ts";
import { usePageBreakerStore } from "@/widget/app/providers/stores/pageBreakerStore.ts";

type Props = {
  summaries?: Field[];
  totals?: Field[];
  showSummary?: boolean;
  formTitle?: string;
  showNotifications?: boolean;
  notificationType?: NotificationsTypes;
  notificationMessage?: string;
  notificationDescription?: string;
  showWooRedirectCart?: boolean;
  isDetailsVisible?: boolean;
};

type SectionBlock = {
  id: string;
  items: Array<{ id: string; alias: string }>;
};

const props = withDefaults(defineProps<Props>(), {
  summaries: () => [],
  totals: () => [],
  showSummary: true,
  formTitle: "",
  showNotifications: false,
  notificationType: "",
  notificationMessage: "",
  notificationDescription: "",
  showWooRedirectCart: false,
  isDetailsVisible: true,
});

const totalSummaryStore = useTotalSummaryStore();
const settingsStore = useSettingsStore();
const paymentAfterSubmitStore = usePaymentAfterSubmitStore();
const translationsStore = useTranslationsStore();
const appStore = useAppStore();
const { hasPromocodes } = useDiscounts();
const isSummaryOpen = ref(false);
const fieldsStore = useFieldsStore();
const orderFormStore = useOrderFormStore();
const paymentStore = usePaymentStore();
const pageBreakerStore = usePageBreakerStore();
const pageBreakerSettings = settingsStore.getPageBreakerSettings;
const pageHistory: number[] = [];
let isBodyScrollLocked = false;

let mainWidgetWithHiddenClass: HTMLElement | null = null;
const bodyScrollLockState = {
  scrollY: 0,
  overflow: "",
  position: "",
  top: "",
  width: "",
};

const isMakeOrderButtonVisible = computed(() => {
  return secondPageSectionBlocks.value.length > 0;
});

const teleportTarget = computed(() => {
  return `#ccb_app_${appStore.getCalcId}`;
});

const enoughPages = computed(() => {
  return fieldsStore.getPages.length > 1;
});

const normalizeValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeNumber = (value: unknown): number => {
  const numeric = Number(value ?? 0);
  return Number.isNaN(numeric) ? 0 : numeric;
};

const miniWidgetFormulas = computed(() => {
  return totalSummaryStore.getTotalSummary?.miniWidgetFormulas || [];
});

const miniWidgetTotals = computed(() => {
  return props.totals?.filter(
    (total) => miniWidgetFormulas.value.includes(total.alias) || !total.alias,
  );
});

const getSelectedOptionValues = (field: Field): string[] => {
  if (!("selectedOption" in field)) {
    return [];
  }

  const selectedOption = field.selectedOption;
  if (Array.isArray(selectedOption)) {
    return selectedOption
      .map((option) => normalizeValue(option.optionValue))
      .filter(Boolean);
  }

  return selectedOption?.optionValue
    ? [normalizeValue(selectedOption.optionValue)]
    : [];
};

const initialFieldSignatures = ref(new Map<string, string>());

const getFieldSignature = (field: Field): string => {
  if ("selectedOption" in field) {
    return getSelectedOptionValues(field).sort().join("|");
  }

  if (field.fieldName === "file_upload" && "files" in field) {
    return Array.isArray(field.files) ? String(field.files.length) : "0";
  }

  if (
    field.fieldName === "text" ||
    field.fieldName === "validated_form" ||
    field.fieldName === "datePicker" ||
    field.fieldName === "timePicker" ||
    field.fieldName === "geolocation"
  ) {
    return normalizeValue(field.displayValue);
  }

  return String(normalizeNumber(field.value));
};

const toggleDetailsVisibility = () => {
  detailsVisibility.value = !detailsVisibility.value;
};

const isFieldChanged = (field: Field): boolean => {
  if (field.hidden || !field.addToSummary) {
    return false;
  }

  const signature = getFieldSignature(field);
  if (!initialFieldSignatures.value.has(field.alias)) {
    initialFieldSignatures.value.set(field.alias, signature);
    return false;
  }

  return initialFieldSignatures.value.get(field.alias) !== signature;
};

const selectedItemsCount = computed(() => {
  return fieldsStore.getSummaryBase.filter(isFieldChanged).length;
});

const selectedItemsText = computed(() => {
  const count = selectedItemsCount.value;
  const itemLabel = count === 1 ? "item" : "items";
  return `${count} ${itemLabel} selected`;
});

const activePageIndex = computed(() => {
  return fieldsStore.getActivePageIndex;
});

const prevBtnText = computed(() => {
  const page = fieldsStore.getActivePage;
  return page ? page.previousBtnLabel : translationsStore.getTranslations.back;
});

const nextBtnText = computed(() => {
  const page = fieldsStore.getActivePage;
  return page?.nextBtnLabel || translationsStore.getTranslations.next;
});

const summaryLastPage = computed(() => {
  return pageBreakerSettings?.summaryAfterLastPage;
});

const lastPage = computed(() => {
  return fieldsStore.getPages.length - 1 === activePageIndex.value;
});

const hideBackButton = computed(() => {
  return activePageIndex.value !== 0;
});

const hideNextButton = computed(() => {
  const length = summaryLastPage.value
    ? fieldsStore.getPages.length
    : fieldsStore.getPages.length - 1;

  return activePageIndex.value !== length;
});

const activePageConditionAction = computed(() => {
  return fieldsStore.getActivePage?.action;
});

const pageBreakFields = computed(() => {
  const activeCalcPage = fieldsStore.getActivePage;
  if (!activeCalcPage?.groupElements) {
    return [];
  }

  const fields = Array.from(activeCalcPage.groupElements.values());
  return fieldsStore.getFields.filter((field: Field) => {
    return fields.some((groupElement: any) => {
      return groupElement.alias === field.alias;
    });
  });
});

const pageBreakerNextPage = () => {
  const pageConditionResult = pageBreakerStore.checkPageFieldsConditions();

  if (!fieldsStore.checkPageRequiredFields(pageBreakFields.value)) {
    return;
  }

  if (pageConditionResult) {
    if (activePageConditionAction.value === "not_skip") {
      return;
    }

    if (activePageConditionAction.value === "skip") {
      const length = summaryLastPage.value
        ? fieldsStore.getPages.length + 1
        : fieldsStore.getPages.length;
      const nextPageIndex = activePageIndex.value + 2;

      if (nextPageIndex < length) {
        pageHistory.push(activePageIndex.value);
        fieldsStore.updateActivePageIndex(nextPageIndex);
      }
      return;
    }

    if (activePageConditionAction.value === "jump_to") {
      const pageIndex = fieldsStore.getPageIndex(
        fieldsStore.getActivePage.pageTo,
      );
      if (pageIndex !== undefined) {
        pageHistory.push(activePageIndex.value);
        fieldsStore.updateActivePageIndex(pageIndex);
      }
      return;
    }
  }

  const length = summaryLastPage.value
    ? fieldsStore.getPages.length + 1
    : fieldsStore.getPages.length;
  const nextPageIndex = activePageIndex.value + 1;

  if (nextPageIndex < length) {
    pageHistory.push(activePageIndex.value);
    fieldsStore.updateActivePageIndex(nextPageIndex);
  }
};

const pageBreakerPrevPage = () => {
  if (pageHistory.length > 0) {
    const prevPageIndex = pageHistory.pop();
    if (prevPageIndex !== undefined) {
      fieldsStore.updateActivePageIndex(prevPageIndex);
    }
  }
};

const activePage = ref(0);
const previousPageTarget = ref(0);
const pageTransitionDirection = ref<"left" | "right">("left");
const pageTransitionName = computed(() => {
  return `ccb-mobile-summary-slide-${pageTransitionDirection.value}`;
});

const nextPage = () => {
  if (activePage.value >= 1) return;

  if (fieldsStore.checkRequiredFields()) {
    orderFormStore.updateNextButtonStatus(false);
    orderFormStore.updateNextButton(true);
    pageTransitionDirection.value = "left";
    previousPageTarget.value = activePage.value;
    activePage.value = 1;
  } else {
    isSummaryOpen.value = false;
    orderFormStore.updateNextButtonStatus(true);
    orderFormStore.updateNextButton(false);
  }
};

const openQuotePage = () => {
  pageTransitionDirection.value = "left";
  previousPageTarget.value = activePage.value;
  activePage.value = 2;
};

const previousPage = () => {
  if (activePage.value === 0) return;

  pageTransitionDirection.value = "right";
  activePage.value = previousPageTarget.value;
  previousPageTarget.value = 0;
};

const aliasChunkLoaders = {
  total_summary: () => import("./total-summary/aliases/HeaderAlias.vue"),
  details: () => import("./total-summary/aliases/DetailsAlias.vue"),
  total: () => import("./total-summary/aliases/TotalAlias.vue"),
  coupons: () => import("./total-summary/aliases/CouponsAlias.vue"),
  payments: () => import("./total-summary/aliases/PaymentsAlias.vue"),
  purchase_button: () =>
    import("./total-summary/aliases/PurchaseButtonAlias.vue"),
  pdf_button: () => import("./total-summary/aliases/PdfButtonAlias.vue"),
  share_button: () => import("./total-summary/aliases/ShareButtonAlias.vue"),
  woo_redirect: () => import("./total-summary/aliases/WooRedirectAlias.vue"),
  notifications: () => import("./total-summary/aliases/NotificationsAlias.vue"),
  quote: () => import("../../../../features/pdf-invoice/send-quote"),
} as const;

type AliasChunkKey = keyof typeof aliasChunkLoaders;

const nestedChunkLoaders: Partial<
  Record<AliasChunkKey, Array<() => Promise<unknown>>>
> = {
  details: [
    () => import("@/widget/shared/ui/total-summary/lists/SummaryList.vue"),
    () => import("@/widget/shared/ui/total-summary/items/SummaryItem.vue"),
    () => import("@/widget/shared/ui/total-summary/items/RepeaterItem.vue"),
    () => import("@/widget/shared/ui/total-summary/items/GroupItem.vue"),
  ],
  total: [
    () => import("@/widget/shared/ui/total-summary/lists/TotalsList.vue"),
    () => import("@/widget/shared/ui/total-summary/items/TotalItem.vue"),
  ],
  coupons: [() => import("@/widget/features/discounts/components")],
  purchase_button: [() => import("@/widget/features/submission/order-form")],
  payments: [
    () => import("@/widget/features/submission/payments/PaymentList.vue"),
  ],
};

const headerComponent = defineAsyncComponent(aliasChunkLoaders.total_summary);
const detailsComponent = defineAsyncComponent(aliasChunkLoaders.details);
const totalComponent = defineAsyncComponent(aliasChunkLoaders.total);
const couponsComponent = defineAsyncComponent(aliasChunkLoaders.coupons);
const paymentsComponent = defineAsyncComponent(aliasChunkLoaders.payments);
const purchaseButtonComponent = defineAsyncComponent(
  aliasChunkLoaders.purchase_button,
);
const pdfButtonComponent = defineAsyncComponent(aliasChunkLoaders.pdf_button);
const shareButtonComponent = defineAsyncComponent(
  aliasChunkLoaders.share_button,
);
const quotePageComponent = defineAsyncComponent(aliasChunkLoaders.quote);
const wooRedirectComponent = defineAsyncComponent(
  aliasChunkLoaders.woo_redirect,
);
const notificationsComponent = defineAsyncComponent(
  aliasChunkLoaders.notifications,
);

const getItemProps = (alias: string): Record<string, unknown> => {
  if (alias === "total_summary") {
    return {
      showSummary: props.showSummary,
      formTitle: props.formTitle,
      isDetailsVisible: detailsVisibility.value,
    };
  }

  if (alias === "details") {
    return {
      showSummary: props.showSummary,
      summaries: props.summaries,
      isDetailsVisible: detailsVisibility.value,
    };
  }

  if (alias === "total") {
    return {
      showSummary: props.showSummary,
      totals: props.totals,
    };
  }

  if (alias === "share_button") {
    return {
      showSummary: props.showSummary,
      popupMode: "mobile-summary",
    };
  }

  if (
    ["coupons", "payments", "purchase_button", "pdf_button"].includes(alias)
  ) {
    return {
      showSummary: props.showSummary,
    };
  }

  if (alias === "notifications") {
    return {
      showNotifications: props.showNotifications,
      notificationType: props.notificationType,
      notificationMessage: props.notificationMessage,
      notificationDescription: props.notificationDescription,
    };
  }

  if (alias === "woo_redirect") {
    return {
      showWooRedirectCart: props.showWooRedirectCart,
    };
  }

  return {};
};

const getItemEvents = (alias: string): Record<string, () => void> => {
  if (alias === "share_button") {
    return {
      "open-mobile-quote": openQuotePage,
    };
  }

  return {};
};

const detailsVisibility = computed({
  get: () => settingsStore.general?.showDetailsAccordion ?? true,
  set: (value: boolean) => {
    if (settingsStore.general) {
      settingsStore.general.showDetailsAccordion = value;
    }
  },
});

const calculatorId = computed(() => {
  return appStore.getCalcId;
});

const { isTriggerActive, isInStickyModal, stickyModalZIndex } =
  useMobileSummaryActiveTrigger(calculatorId, isSummaryOpen);

const triggerZIndexStyle = computed(() => {
  if (!isInStickyModal.value) {
    return undefined;
  }

  return { zIndex: stickyModalZIndex };
});

const openSummary = () => {
  isSummaryOpen.value = true;

  const stickyModule = document.getElementById(
    `ccb-sticky-calc-modal-${calculatorId.value}`,
  );

  if (stickyModule instanceof HTMLElement) {
    if (stickyModule.classList.contains("show")) {
      stickyModule.style.display = "none";
    }
  }
};

const closeSummary = () => {
  const wasOnOrderPage = activePage.value >= 1;

  isSummaryOpen.value = false;
  activePage.value = 0;
  previousPageTarget.value = 0;

  if (wasOnOrderPage) {
    orderFormStore.updateNextButtonStatus(true);
    orderFormStore.updateNextButton(false);
    paymentStore.reset();
  }

  const stickyModule = document.getElementById(
    `ccb-sticky-calc-modal-${calculatorId.value}`,
  );

  if (stickyModule instanceof HTMLElement) {
    if (stickyModule.classList.contains("show")) {
      stickyModule.style.display = "block";
    }
  }
};

const lockBodyScroll = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (isBodyScrollLocked) {
    return;
  }

  bodyScrollLockState.scrollY = window.scrollY;
  bodyScrollLockState.overflow = document.body.style.overflow;
  bodyScrollLockState.position = document.body.style.position;
  bodyScrollLockState.top = document.body.style.top;
  bodyScrollLockState.width = document.body.style.width;

  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${bodyScrollLockState.scrollY}px`;
  document.body.style.width = "100%";
  isBodyScrollLocked = true;
};

const unlockBodyScroll = () => {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    !isBodyScrollLocked
  ) {
    return;
  }

  const { scrollY, overflow, position, top, width } = bodyScrollLockState;

  document.body.style.overflow = overflow;
  document.body.style.position = position;
  document.body.style.top = top;
  document.body.style.width = width;
  window.scrollTo(0, scrollY);
  isBodyScrollLocked = false;
};

const showHiddenMainWidget = () => {
  if (typeof document === "undefined") {
    return;
  }

  const mainWidget = document.querySelector<HTMLElement>(".ccb-main-widget");
  if (!mainWidget?.classList.contains("ccb-calc-hidden")) {
    mainWidgetWithHiddenClass = null;
    return;
  }

  mainWidget.classList.remove("ccb-calc-hidden");
  mainWidgetWithHiddenClass = mainWidget;
};

const restoreHiddenMainWidget = () => {
  if (!mainWidgetWithHiddenClass) {
    return;
  }

  mainWidgetWithHiddenClass.classList.add("ccb-calc-hidden");
  mainWidgetWithHiddenClass = null;
};

watch(isSummaryOpen, (isOpen, _previousValue, onCleanup) => {
  if (isOpen) {
    lockBodyScroll();
    showHiddenMainWidget();
    onCleanup(() => {
      unlockBodyScroll();
      restoreHiddenMainWidget();
    });
    return;
  }

  unlockBodyScroll();
  restoreHiddenMainWidget();
});

const summaryTitle = computed(() => {
  if (!props.showSummary && props.formTitle) {
    return props.formTitle;
  }

  return settingsStore.getGeneralSettings?.headerTitle || "Total Summary";
});

const closeLabel = computed(() => {
  return translationsStore.getTranslations?.close || "Close";
});

const activeSummaryTitle = computed(() => {
  if (activePage.value === 2) {
    return translationsStore.getTranslations?.emailQuote || "Email Quote";
  }

  return summaryTitle.value;
});

const aliasRegistry: Record<string, any> = {
  total_summary: headerComponent,
  details: detailsComponent,
  total: totalComponent,
  coupons: couponsComponent,
  notifications: notificationsComponent,
  payments: paymentsComponent,
  purchase_button: purchaseButtonComponent,
  pdf_button: pdfButtonComponent,
  share_button: shareButtonComponent,
  woo_redirect: wooRedirectComponent,
};

const getComponentByAlias = (alias: string) => {
  return aliasRegistry[alias];
};

const arrangementSections = computed<ITotalSummarySection[]>(() => {
  const totalSummary = totalSummaryStore.getTotalSummary as
    | ITotalSummarySection[]
    | {
        arrangementSections?: ITotalSummarySection[];
        arrangement_sections?: ITotalSummarySection[];
      }
    | null;

  const sectionList = Array.isArray(totalSummary)
    ? totalSummary
    : totalSummary?.arrangementSections ||
      totalSummary?.arrangement_sections ||
      [];

  return [...sectionList].sort((a, b) => {
    const aSort = Number(a.sortId ?? a.sort_id ?? 0);
    const bSort = Number(b.sortId ?? b.sort_id ?? 0);
    return aSort - bSort;
  });
});

const fallbackItems = [
  { id: "summary_item_total_summary", alias: "total_summary" },
  { id: "summary_item_details", alias: "details" },
  { id: "summary_item_coupons", alias: "coupons" },
  { id: "summary_item_total", alias: "total" },
  { id: "summary_item_notifications", alias: "notifications" },
  { id: "summary_item_purchase_button", alias: "purchase_button" },
  { id: "summary_item_pdf_button", alias: "pdf_button" },
  { id: "summary_item_share_button", alias: "share_button" },
  { id: "summary_item_payments", alias: "payments" },
  { id: "summary_item_woo_redirect", alias: "woo_redirect" },
];

const getPaymentsStatus = computed(() => {
  return (
    settingsStore.getPaymentGateway?.cards.cardPayments.stripe.enable ||
    settingsStore.getPaymentGateway?.cards.cardPayments.razorpay.enable ||
    settingsStore.getPaymentGateway?.paypal.enable ||
    settingsStore.getPaymentGateway?.cashPayment.enable ||
    settingsStore.getWooCheckoutSettings?.enable ||
    false
  );
});

const isItemVisible = (alias: string): boolean => {
  if (alias === "total_summary") return true;

  if (alias === "details") {
    return props.showSummary && detailsVisibility.value;
  }

  if (["total", "pdf_button", "share_button"].includes(alias)) {
    return props.showSummary;
  }

  if (alias === "coupons") {
    return hasPromocodes() && props.showSummary;
  }

  if (alias === "payments") {
    const summaryBlockActive =
      settingsStore.getFormSettings?.summaryDisplay?.enable &&
      ["show_summary_block", "show_summary_block_with_pdf"].includes(
        settingsStore.getFormSettings?.summaryDisplay?.actionAfterSubmit || "",
      ) &&
      settingsStore.summaryDisplayShowSummary;

    if (summaryBlockActive) return true;

    if (!props.showSummary) {
      if (
        settingsStore.getFormSettings?.summaryDisplay?.enable &&
        paymentAfterSubmitStore.isPaymentAfterSubmit
      ) {
        return paymentAfterSubmitStore.getSubmit;
      }
      return false;
    }
    if (paymentAfterSubmitStore.isPaymentAfterSubmit) {
      return paymentAfterSubmitStore.getSubmit;
    }

    if (getPaymentsStatus.value) {
      return true;
    }

    return false;
  }

  if (alias === "purchase_button") {
    if (
      !props.showSummary &&
      settingsStore.getFormSettings?.summaryDisplay?.enable
    ) {
      return !!settingsStore.getFormSettings?.accessEmail;
    }
    return props.showSummary && !!settingsStore.getFormSettings?.accessEmail;
  }

  if (alias === "notifications") {
    return props.showNotifications;
  }

  if (alias === "woo_redirect") {
    return props.showWooRedirectCart;
  }

  return true;
};

const sectionBlocks = computed<SectionBlock[]>(() => {
  if (!arrangementSections.value.length) {
    return [
      {
        id: "summary_section_default",
        items: fallbackItems,
      },
    ];
  }

  const sections = arrangementSections.value;
  const hasWooRedirectAnywhere = sections.some((section) =>
    (section.items || []).some((item) => item.alias === "woo_redirect"),
  );

  const result = sections.map((section, index) => {
    const sectionItems = (section.items || [])
      .map((item, itemIndex) => ({
        id: item.id || `summary_item_${index}_${itemIndex}`,
        alias: item.alias,
        options: item.options,
      }))
      .filter((item) => Boolean(getComponentByAlias(item.alias)));

    const isLastSection = index === sections.length - 1;
    if (isLastSection && !hasWooRedirectAnywhere && sectionItems.length > 0) {
      sectionItems.push({
        id: `summary_item_woo_redirect_${index}`,
        alias: "woo_redirect",
        options: {},
      });
    }

    return {
      id: section.id || `summary_section_${index}`,
      items: sectionItems,
    };
  });

  let notificationsInjected = false;
  for (const section of result) {
    const purchaseIdx = section.items.findIndex(
      (item) => item.alias === "purchase_button",
    );
    if (purchaseIdx !== -1) {
      section.items.splice(purchaseIdx, 0, {
        id: "summary_item_notifications_auto",
        alias: "notifications",
        options: {},
      });
      notificationsInjected = true;
      break;
    }
  }

  if (!notificationsInjected) {
    for (const section of result) {
      const paymentsIdx = section.items.findIndex(
        (item) => item.alias === "payments",
      );
      if (paymentsIdx !== -1) {
        section.items.splice(paymentsIdx, 0, {
          id: "summary_item_notifications_auto",
          alias: "notifications",
          options: {},
        });
        notificationsInjected = true;
        break;
      }
    }
  }

  if (!notificationsInjected && result.length > 0) {
    const lastSection = result[result.length - 1];
    lastSection.items.push({
      id: "summary_item_notifications_auto",
      alias: "notifications",
      options: {},
    });
  }

  return result;
});

const visibleSectionBlocks = computed<SectionBlock[]>(() => {
  return sectionBlocks.value
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isItemVisible(item.alias)),
    }))
    .filter((section) => section.items.length > 0);
});

const contentAliases = ["details", "coupons", "notifications", "total"];

const footerAliases = ["share_button", "pdf_button"];

const secondPageAliases = ["payments", "woo_redirect", "purchase_button"];

const contentSectionBlocks = computed<SectionBlock[]>(() => {
  return visibleSectionBlocks.value
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        contentAliases.includes(item.alias),
      ),
    }))
    .filter((section) => section.items.length > 0);
});

const secondPageSectionBlocks = computed<SectionBlock[]>(() => {
  return visibleSectionBlocks.value
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        secondPageAliases.includes(item.alias),
      ),
    }))
    .filter((section) => section.items.length > 0);
});

const footerSectionBlocks = computed<SectionBlock[]>(() => {
  return visibleSectionBlocks.value
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => footerAliases.includes(item.alias)),
    }))
    .filter((section) => section.items.length > 0);
});

const isPageContentReady = ref(true);
const preloadedPages = new Set<number>();
let pageContentLoadToken = 0;

const getVisibleAliasesForPage = (page: number): string[] => {
  if (page === 2) {
    return ["quote"];
  }

  const blocks =
    page === 0
      ? [...contentSectionBlocks.value, ...footerSectionBlocks.value]
      : secondPageSectionBlocks.value;

  return [
    ...new Set(
      blocks.flatMap((section) => section.items.map((item) => item.alias)),
    ),
  ];
};

const preloadPageChunks = async (page: number): Promise<void> => {
  const loaders: Array<() => Promise<unknown>> = [];

  for (const alias of getVisibleAliasesForPage(page)) {
    if (!(alias in aliasChunkLoaders)) {
      continue;
    }

    const aliasKey = alias as AliasChunkKey;
    loaders.push(aliasChunkLoaders[aliasKey]);

    const nestedLoaders = nestedChunkLoaders[aliasKey];
    if (nestedLoaders?.length) {
      loaders.push(...nestedLoaders);
    }
  }

  if (!loaders.length) {
    return;
  }

  await Promise.all(loaders.map((loader) => loader()));
};

const ensurePageContentReady = async (page: number) => {
  if (preloadedPages.has(page)) {
    isPageContentReady.value = true;
    return;
  }

  const loadToken = ++pageContentLoadToken;
  isPageContentReady.value = false;

  try {
    await preloadPageChunks(page);

    if (loadToken !== pageContentLoadToken) {
      return;
    }

    preloadedPages.add(page);
    isPageContentReady.value = true;
  } catch {
    if (loadToken !== pageContentLoadToken) {
      return;
    }

    isPageContentReady.value = true;
  }
};

watch([isSummaryOpen, activePage], ([isOpen, page]) => {
  if (isOpen) {
    void ensurePageContentReady(page);
  }
});

onMounted(() => {
  void preloadPageChunks(0).then(() => preloadedPages.add(0));
  void preloadPageChunks(1).then(() => preloadedPages.add(1));
});
</script>

<style scoped lang="scss">
.ccb-mobile-summary {
  width: 100%;

  &__trigger {
    position: fixed;
    left: 0px;
    right: 0px;
    bottom: 0px;
    z-index: 9999;
    width: auto;
    transform: translateY(0);
    visibility: visible;
    transition:
      transform 0.3s cubic-bezier(0.32, 0.72, 0, 1),
      opacity 0.3s ease,
      visibility 0s linear 0s;

    &--inactive {
      visibility: hidden;
      opacity: 0;
      transform: translateY(100%);
      pointer-events: none;
      z-index: 9998;
      transition:
        transform 0.3s cubic-bezier(0.32, 0.72, 0, 1),
        opacity 0.3s ease,
        visibility 0s linear 0.3s;
    }

    &--in-sticky-modal {
      z-index: 1060;
    }
    border-top: 1px solid var(--ccb-container-border-color);
    background: var(--ccb-container-color);
    color: var(--ccb-text-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    cursor: pointer;

    .ccb-mobile-summary-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }

    .ccb-mobile-summary-content__total {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;

      .ccb-mobile-summary-content__total-label {
        line-height: 1.2;
        font-size: 12px;
        font-weight: 700;
        color: var(--ccb-text-color);
      }

      .ccb-mobile-summary-content__total-description {
        font-size: 10px;
        font-weight: 400;
        color: var(--ccb-fields-description-color);

        i {
          color: var(--ccb-accent-color);
        }
      }
    }

    .ccb-mobile-summary-content__actions {
      display: flex;
      align-items: center;
      gap: 8px;

      .ccb-mobile-summary-content__action {
        font-size: 14px;
        font-weight: 500;
        color: var(--ccb-fields-color);
        background: var(--ccb-accent-color);
        border: 0;
        border-radius: 4px;
        padding: 10px 18px;
        white-space: nowrap;
        height: 40px;

        &:focus,
        &:active {
          outline: none;
        }
      }

      .ccb-mobile-summary-content__nav {
        width: 88px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        padding: 0;
        border: 0;
        border-radius: 5px;
        cursor: pointer;
        color: var(--ccb-accent-color);
        background: color-mix(
          in srgb,
          var(--ccb-accent-color) 10%,
          transparent
        );
        transition:
          opacity 0.2s ease,
          transform 0.2s ease;

        i {
          font-size: 26px;
          line-height: 1;
        }

        &:focus,
        &:active {
          outline: none;
        }

        &:active:not(:disabled) {
          transform: scale(0.98);
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }
      }

      .ccb-mobile-summary-content__nav--next {
        color: var(--ccb-fields-color);
        background: var(--ccb-accent-color);

        i {
          transform: rotate(180deg);
        }
      }
    }
  }

  &__overlay {
    position: fixed;
    inset: 0;
    z-index: 999999;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  &__sheet {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 30px 20px 20px 20px;
    background: var(--ccb-container-color);
    color: var(--ccb-text-color);
    box-sizing: border-box;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
    transform-origin: bottom center;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    overflow: hidden;
  }

  &__pages {
    position: relative;
    overflow: hidden;
  }

  &__page {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 16px;
    margin-bottom: 18px;
    font-family: inherit;

    .ccb-mobile-summary__header-title {
      margin: 0;
      font-size: 20px;
      line-height: 1.3;
      font-weight: 700;
      color: var(--ccb-text-color);
    }
  }

  &__close {
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: 50%;
    display: grid;
    place-items: center;
    padding: 0;
    background: var(--ccb-container-dark-color);
    color: #0f172a;
    cursor: pointer;
    font-size: 10px;
    margin-left: auto;
    color: var(--ccb-text-color);
  }

  &__body {
    flex: 1;
    overflow: auto;
    max-height: min(700px, calc(100dvh - 305px));
    -ms-overflow-style: none;
    scrollbar-width: none;

    .ccb-woo-product {
      box-sizing: border-box;
      margin-top: 10px;
    }

    &.is-quote-page {
      max-height: min(700px, calc(100dvh - 212px));
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__content-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    width: 100%;
  }

  &__footer {
    display: flex;
    gap: 6px;
    padding-top: 18px;
    margin-top: 10px;
  }

  &__sheet :deep(.ccb-summary-list__titles) {
    padding: 5px 10px;
    border-radius: 4px;
  }

  &__sheet :deep(.ccb-summary-list__wrapper) {
    gap: 0;
    padding-top: 0;
  }

  &__sheet :deep(.ccb-summary-item) {
    padding: 10px 0;
    gap: 12px;
  }

  &__sheet :deep(.ccb-summary-item__value),
  &__sheet :deep(.ccb-summary-item__values) {
    text-align: right;
  }

  &__sheet :deep(.ccb-summary-item__title .description) {
    color: var(--ccb-summary-description-color);
    opacity: 0.75;
  }

  &__sheet :deep(.ccb-totals-list) {
    width: 100%;
    padding-bottom: 14px;
    border-bottom: 0;
  }

  &__sheet :deep(.ccb-total-row__item) {
    align-items: center;
  }

  &__sheet :deep(.ccb-total-row__name) {
    font-size: 20px;
  }

  &__sheet :deep(.ccb-total-row__value) {
    font-size: 24px;
    font-weight: 700;
  }

  &__footer-sections--hidden {
    .ccb-mobile-summary__footer-item {
      width: 50%;
    }

    .ccb-mobile-summary__footer-item
      :deep(.ccb-pdf-invoice__actions .ccb-button) {
      width: 100%;
    }
  }

  &__footer-item {
    display: contents;
  }

  &__footer-item--share_button,
  &__footer-item--pdf_button,
  &__footer-item--purchase_button,
  &__footer-item--payments,
  &__footer-item--woo_redirect {
    display: block;
  }

  &__footer-item--purchase_button,
  &__footer-item--payments,
  &__footer-item--woo_redirect {
    flex: 1;
    min-width: 0;
  }

  &__sheet :deep(.ccb-total-summary-action) {
    width: auto !important;
  }

  &__sheet :deep(.ccb-pdf-invoice__actions),
  &__sheet :deep(.ccb-order-form__submit) {
    width: 100%;
  }

  &__sheet :deep(.ccb-pdf-invoice__actions .ccb-button) {
    width: 56px;
    min-width: 56px;
    padding: 0;
    background: var(--ccb-container-dark-color);
    border: 0;

    span {
      display: none;
    }
  }

  &__footer-item--share_button :deep(.ccb-button)::before,
  &__footer-item--pdf_button :deep(.ccb-button)::before {
    font-family: "ccb-fonts";
    color: var(--ccb-text-color);
    font-size: 22px;
    font-weight: 400;
  }

  &__footer-item--share_button :deep(.ccb-button)::before {
    content: "\eac5";
  }

  &__footer-item--pdf_button :deep(.ccb-button)::before {
    content: "\eac6";
  }

  &__sheet :deep(.ccb-order-form) {
    flex: 1;
    width: auto !important;
  }

  &__sheet :deep(.ccb-order-form .ccb-button) {
    width: 100%;
  }
}

.ccb-mobile-summary-fade-enter-active,
.ccb-mobile-summary-fade-leave-active {
  transition: opacity 0.25s ease;
}

.ccb-mobile-summary-fade-enter-active .ccb-mobile-summary__sheet,
.ccb-mobile-summary-fade-leave-active .ccb-mobile-summary__sheet {
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.24s ease;
}

.ccb-mobile-summary-fade-enter-from,
.ccb-mobile-summary-fade-leave-to {
  opacity: 0;
}

.ccb-mobile-summary-fade-enter-from .ccb-mobile-summary__sheet,
.ccb-mobile-summary-fade-leave-to .ccb-mobile-summary__sheet {
  opacity: 0;
  transform: translateY(100%) scale(0.98);
}

.ccb-mobile-summary-fade-enter-to .ccb-mobile-summary__sheet,
.ccb-mobile-summary-fade-leave-from .ccb-mobile-summary__sheet {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.ccb-mobile-summary-slide-left-enter-active,
.ccb-mobile-summary-slide-left-leave-active,
.ccb-mobile-summary-slide-right-enter-active,
.ccb-mobile-summary-slide-right-leave-active {
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  backface-visibility: hidden;
  will-change: transform;
}

.ccb-mobile-summary-slide-left-leave-active,
.ccb-mobile-summary-slide-right-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

.ccb-mobile-summary-slide-left-enter-from,
.ccb-mobile-summary-slide-right-leave-to {
  transform: translateX(100%);
}

.ccb-mobile-summary-slide-left-leave-to,
.ccb-mobile-summary-slide-right-enter-from {
  transform: translateX(-100%);
}

.ccb-mobile-summary-slide-left-enter-to,
.ccb-mobile-summary-slide-left-leave-from,
.ccb-mobile-summary-slide-right-enter-to,
.ccb-mobile-summary-slide-right-leave-from {
  transform: translateX(0);
}
</style>
