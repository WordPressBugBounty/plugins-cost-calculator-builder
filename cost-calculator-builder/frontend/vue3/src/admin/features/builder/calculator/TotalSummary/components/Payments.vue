<template>
  <div class="ccb-summary-payments">
    <div class="ccb-summary-payments__title">
      {{ translations.paymentMethods }}
    </div>
    <div class="ccb-summary-payments__list" v-if="false">
      <div class="ccb-summary-payments__item" v-if="paypal">
        <div class="ccb-summary-payments__item__icon">
          <i class="ccb-icon-paypal-p"></i>
        </div>
        <div class="ccb-summary-payments__item__title">
          {{ translations.paypal }}
        </div>
      </div>
      <div class="ccb-summary-payments__item" v-if="stripe">
        <div class="ccb-summary-payments__item__icon">
          <i class="ccb-icon-ic_credit-card"></i>
        </div>
        <div class="ccb-summary-payments__item__title">
          {{ translations.card }}
        </div>
      </div>
      <div class="ccb-summary-payments__item" v-if="cash">
        <div class="ccb-summary-payments__item__icon">
          <i class="ccb-icon-ic_cash"></i>
        </div>
        <div class="ccb-summary-payments__item__title">
          {{ translations.cash }}
        </div>
      </div>
      <div class="ccb-summary-payments__item" v-if="wooCommerce">
        <div class="ccb-summary-payments__item__icon">
          <i class="ccb-icon-woo"></i>
        </div>
        <div class="ccb-summary-payments__item__title">
          {{ translations.woo || "woo" }}
        </div>
      </div>
    </div>
    <div class="ccb-summary-payments__list--vertical" v-else>
      <div class="ccb-summary-payments__row" v-if="paypal">
        <div class="ccb-summary-payments__row-left">
          <span class="ccb-summary-payments__radio"></span>
          <span class="ccb-summary-payments__row-title">{{
            translations.paypal
          }}</span>
        </div>
        <div class="ccb-summary-payments__row-icon">
          <i class="ccb-icon-paypal-p"></i>
        </div>
      </div>
      <div class="ccb-summary-payments__row" v-if="stripe">
        <div class="ccb-summary-payments__row-left">
          <span class="ccb-summary-payments__radio"></span>
          <span class="ccb-summary-payments__row-title">{{
            translations.card
          }}</span>
        </div>
        <div class="ccb-summary-payments__row-icon">
          <i class="ccb-icon-ic_credit-card"></i>
        </div>
      </div>
      <div class="ccb-summary-payments__row" v-if="wooCommerce">
        <div class="ccb-summary-payments__row-left">
          <span class="ccb-summary-payments__radio"></span>
          <span class="ccb-summary-payments__row-title">{{
            translations.woo || "woo"
          }}</span>
        </div>
        <div class="ccb-summary-payments__row-icon">
          <i class="ccb-icon-woo"></i>
        </div>
      </div>
      <div class="ccb-summary-payments__row" v-if="cash">
        <div class="ccb-summary-payments__row-left">
          <span class="ccb-summary-payments__radio"></span>
          <span class="ccb-summary-payments__row-title">{{
            translations.cash
          }}</span>
        </div>
        <div class="ccb-summary-payments__row-icon">
          <i class="ccb-icon-ic_cash"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";

const settingsStore = useSettingsStore();

const settings = computed(() => settingsStore.getSettings || null);

const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const { textColor, borderColor, accentColor, formFieldsColor } =
  useAppearanceColors();

const iconBgr = computed(() => `${accentColor.value}1A`);

const paypal = computed(
  () => settings.value?.payment_gateway?.paypal?.enable || false,
);
const stripe = computed(
  () =>
    settings.value?.payment_gateway?.cards?.card_payments?.stripe?.enable ||
    false,
);
const cash = computed(
  () => settings.value?.payment_gateway?.cash_payment?.enable || false,
);
const wooCommerce = computed(
  () => settings.value?.woo_checkout?.enable || false,
);
</script>

<style scoped lang="scss">
.ccb-summary-payments {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 12px 0px;

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: v-bind(textColor);
  }

  &__list {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__list--vertical {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-radius: 12px;
    background-color: v-bind(formFieldsColor);
    width: 100%;
    color: v-bind(textColor);
  }

  &__row-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__radio {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid v-bind(borderColor);
    flex-shrink: 0;
  }

  &__row-title {
    font-size: 14px;
    font-weight: 500;
    color: v-bind(textColor);
  }

  &__row-icon {
    display: flex;
    align-items: center;
    font-size: 20px;

    i {
      color: v-bind(accentColor);
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 18px;
    border-radius: 12px;
    border: 1px solid v-bind(borderColor);
    gap: 8px;

    &__icon {
      width: 32px;
      height: 32px;
      border-radius: 12px;
      font-size: 16px;
      background-color: v-bind(iconBgr);
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        color: v-bind(accentColor);
      }
    }

    &__title {
      font-size: 14px;
      font-weight: 600;
      color: v-bind(textColor);
    }
  }
}
</style>
