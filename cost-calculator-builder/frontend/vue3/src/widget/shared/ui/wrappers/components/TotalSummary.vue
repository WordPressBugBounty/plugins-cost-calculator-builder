<template>
  <div class="ccb-block ccb-subtotals-block">
    <div
      v-for="section in visibleSectionBlocks"
      :key="section.id"
      class="ccb-section ccb-section-subtotal"
    >
      <div class="ccb-subtotal-wrapper">
        <div
          v-for="item in section.items"
          :key="item.id"
          style="display: contents"
        >
          <component
            v-if="item.alias === 'total_summary'"
            :is="getComponentByAlias(item.alias)"
            v-bind="getItemProps(item.alias)"
            @toggle-details="toggleDetailsVisibility"
          />
          <component
            v-else
            :is="getComponentByAlias(item.alias)"
            v-bind="getItemProps(item.alias)"
            :item="item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import { useTotalSummaryStore } from "@/widget/app/providers/stores/totalSummaryStore.ts";
import { Field } from "@/widget/shared/types/fields";
import { ITotalSummarySection } from "@/widget/shared/types/app";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { NotificationsTypes } from "@/widget/shared/types/settings";
import { usePaymentAfterSubmitStore } from "@/widget/app/providers/stores/paymentAfterSubmit.ts";
import { useDiscounts } from "@/widget/actions/discounts/composable/useDiscounts.ts";

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
const { hasPromocodes } = useDiscounts();

const headerComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/HeaderAlias.vue"),
);
const detailsComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/DetailsAlias.vue"),
);
const totalComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/TotalAlias.vue"),
);
const couponsComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/CouponsAlias.vue"),
);
const paymentsComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/PaymentsAlias.vue"),
);
const purchaseButtonComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/PurchaseButtonAlias.vue"),
);
const pdfButtonComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/PdfButtonAlias.vue"),
);
const shareButtonComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/ShareButtonAlias.vue"),
);
const wooRedirectComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/WooRedirectAlias.vue"),
);
const notificationsComponent = defineAsyncComponent(
  () => import("./total-summary/aliases/NotificationsAlias.vue"),
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

  if (
    [
      "coupons",
      "payments",
      "purchase_button",
      "pdf_button",
      "share_button",
    ].includes(alias)
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

const detailsVisibility = computed({
  get: () => settingsStore.general?.showDetailsAccordion ?? true,
  set: (value: boolean) => {
    if (settingsStore.general) {
      settingsStore.general.showDetailsAccordion = value;
    }
  },
});

const toggleDetailsVisibility = () => {
  detailsVisibility.value = !detailsVisibility.value;
};

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
    return true;
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
</script>

<style scoped lang="scss">
@use "@/styles/widget/_mixins.scss" as mixins;

.ccb-subtotals-block {
  display: flex;
  padding: 0;
  flex-direction: column;
  row-gap: 20px;
}

.ccb-subtotal-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

.ccb-section {
  @include mixins.container;
}

.ccb-total-summary-action {
  width: 100%;
}
</style>
