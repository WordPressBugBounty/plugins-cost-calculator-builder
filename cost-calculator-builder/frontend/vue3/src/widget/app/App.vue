<template>
  <div class="ccb-app-container">
    <div v-show="!appStore.getAppLoader">
      <component :is="currentComponent" />
    </div>
    <Loader v-show="appStore.getAppLoader" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, defineAsyncComponent, computed, inject } from "vue";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useConditionsStore } from "@/widget/app/providers/stores/conditionsStore.ts";
import { useDiscountsStore } from "@/widget/app/providers/stores/discountsStore.ts";
import { IncomingData } from "@/widget/shared/types/app";
import { useOrderFormStore } from "@/widget/app/providers/stores/orderFormStore.ts";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore.ts";
import Loader from "@/widget/shared/ui/components/Loader/index.ts";
import "@vueform/slider/themes/default.css";
import { useSubmissionStore } from "@/widget/app/providers/stores/submissionStore.ts";
import { useMainStore } from "@/widget/app/providers/stores/mainStore.ts";
import { usePageBreakerStore } from "@/widget/app/providers/stores/pageBreakerStore.ts";

const appStore = useAppStore();
const appearanceStore = useAppearanceStore();
const settingsStore = useSettingsStore();
const fieldsStore = useFieldsStore();
const conditionsStore = useConditionsStore();
const discountsStore = useDiscountsStore();
const orderFormStore = useOrderFormStore();
const pageBreakerStore = usePageBreakerStore();
const translationsStore = useTranslationsStore();
const submissonStore = useSubmissionStore();
const mainStore = useMainStore();

const calcId = inject("calc_id") as number;
const key: any = `calc_data_${calcId}`;
const calcData = window[key] as unknown as IncomingData;

if ("settings" in calcData) {
  mainStore.setCalcId(+calcId);
  appStore.setProStatus(calcData.pro_active);
  appStore.setCalcId(+calcId);
  appStore.setCalcId(calcData.settings.calc_id);
  appStore.setDateFormat(calcData.dateFormat);
  appStore.setCalcTitle(calcData.settings.title);
  settingsStore.initSettingsStore(calcData.settings);
  appearanceStore.initAppearanceStore(calcData.appearance);
  orderFormStore.initOrderForm(calcData.form_fields);
  settingsStore.initGeolocationSettingsStore(calcData.geolocation);
  settingsStore.initPdfSettings(calcData.pdf_settings);
  settingsStore.initQuoteSettings(calcData.quote_settings);
  translationsStore.initTranslations(calcData.translations);
  appStore.setCustomThankYouPage(calcData.is_custom_thank_you_page);
  submissonStore.setOrderId(calcData.order_id);
  submissonStore.setOrderData(calcData.order_data);
}

const currentComponent = computed(() => {
  return appStore.isThankYouPage
    ? defineAsyncComponent(() => import("@/widget/pages/thank-you-page"))
    : defineAsyncComponent(() => import("@/widget/pages/calculator"));
});

onMounted(() => {
  appStore.checkIfLive();
  conditionsStore.initConditions(calcData.conditions);
  settingsStore.initLang(calcData.language);
  conditionsStore.initWooProductsConditions();
  fieldsStore.initFields(calcData.fields);
  fieldsStore.initPageBreaker(calcData.fields);
  discountsStore.initDiscounts(calcData.discounts);
  pageBreakerStore.initPageConditions();

  window.addEventListener("load", () => {
    setTimeout(() => appStore.updateAppLoader(false), 0);
  });
});
</script>

<style lang="scss">
.ccb-calc-hidden {
  display: none !important;
}
</style>
