<template>
  <div class="ccb-pdf-layout__item order_block" :style="getTableStyles">
    <div
      class="ccb-pdf-layout__item--wrapper order_block"
      data-id="order_block"
      :style="getBorders"
    >
      <div class="pdf-total-summary" style="padding: 20px 30px">
        <div
          class="pdf-total-summary--header"
          :style="getHeadingStyles"
          v-if="showHeading"
        >
          <span class="pdf-total-summary--header-name" style="width: 46%">{{
            getName
          }}</span>
          <span class="pdf-total-summary--header-unit" style="width: 34%">{{
            getOptionUnit
          }}</span>
          <span
            class="pdf-total-summary--header-total"
            style="width: 20%; text-align: right"
            >{{ getValue }}</span
          >
        </div>
        <div class="pdf-total-summary--body">
          <div class="pdf-total-summary--body-items">
            <div
              class="pdf-total-summary--body-item pdf-keep"
              v-for="detail in getOrderDetails"
              :key="detail.label"
              :style="getLines"
            >
              <span
                class="pdf-total-summary--body-item-name"
                style="width: 46%"
              >
                <span class="pdf-total-summary--body-item-name-title">{{
                  detail.label
                }}</span>
                <template
                  v-if="
                    detail.alias.includes('checkbox') ||
                    detail.alias.includes('toggle')
                  "
                >
                  <span
                    class="pdf-total-summary--body-item-name-extra"
                    v-if="
                      detail.summary_view === 'show_value' &&
                      'options' in detail &&
                      Array.isArray(detail.options) &&
                      detail.options.length > 0
                    "
                  >
                    <span
                      class="ccb-pdf-extra-wrap"
                      v-for="option in detail.options"
                      :key="option.label"
                      style="padding-left: 10px"
                    >
                      <span class="ccb-pdf-extra-wrap-label">{{
                        option.label
                      }}</span>
                      <span
                        class="ccb-pdf-extra-wrap-value"
                        style="white-space: nowrap"
                        >{{ option.value }}</span
                      >
                    </span>
                  </span>
                </template>
                <template v-else>
                  <span
                    class="pdf-total-summary--body-item-name-extra"
                    v-if="'option_unit' in detail && detail.option_unit"
                  >
                    <span class="ccb-pdf-extra-wrap" style="padding-left: 10px">
                      <span class="ccb-pdf-extra-wrap-label">{{
                        detail.option_unit
                      }}</span>
                    </span>
                  </span>
                </template>
              </span>
              <span
                class="pdf-total-summ ary--body-item-total"
                style="width: 46%; text-align: right; font-weight: 700"
              >
                <template
                  v-if="
                    detail.alias.includes('checkbox') ||
                    detail.alias.includes('toggle')
                  "
                >
                  <template v-if="detail.summary_view === 'show_value'">
                    {{ detail.converted }}
                  </template>
                  <template v-else>
                    <ul style="list-style: none">
                      <li
                        v-for="option in detail.options"
                        :key="option.optionValue"
                      >
                        {{ option.label }}
                      </li>
                    </ul>
                  </template>
                </template>
                <template v-else>
                  {{ detail.value }}
                </template>
              </span>
            </div>
            <div class="pdf-total-summary--body-item-box pdf-keep">
              <div class="pdf-order-block-qr-code" v-if="showQrCode">
                <img :src="qrCodeDataUrl" alt="QR Code" />
              </div>
              <div class="pdf-order-block-payment-info pdf-keep">
                <div class="pdf-order-block-payment-info--totals">
                  <span
                    v-for="total in getTotals"
                    :key="total.label"
                    class="pdf-order-block-payment-info--totals-item pdf-keep"
                    style="box-sizing: border-box"
                  >
                    <span
                      v-if="total.has_discount && total.discount"
                      class="total-item-discount"
                      :class="{
                        'with-badge':
                          total?.discount?.discount_view ===
                          'show_without_title',
                      }"
                    >
                      <span class="total-item-discount__title-box">
                        <span class="total-item-discount__title-box-label"
                          >Discount:
                        </span>
                        <span class="total-item-discount__title-box-value">{{
                          getDiscountAmount(total)
                        }}</span>
                      </span>
                      <span class="total-item-discount__value">{{
                        formatCurrencyFromTotal(
                          total.discount.before_discount_value || 0,
                        )
                      }}</span>
                    </span>
                    <span class="pdf-order-block-total-info">
                      <span
                        style="
                          display: flex;
                          column-gap: 4px;
                          align-items: center;
                        "
                      >
                        {{ total.label }}
                      </span>
                      <span>{{ total.converted }}</span>
                    </span>
                  </span>
                </div>
                <div
                  class="pdf-order-block-payment-info--payment"
                  :style="paymentBorderStyles"
                >
                  <span
                    class="pdf-order-block-payment-info--payment-item"
                    style="box-sizing: border-box"
                  >
                    <span v-if="showPaymentMethod && getPaymentMethodType">
                      Payment method: {{ getPaymentMethodType }}
                    </span>
                    <span v-if="showGrandTotal">{{ getGrandTotalAmount }}</span>
                  </span>
                </div>
                <div
                  class="pdf-order-block-promocodes"
                  v-if="getPromocodes && getPromocodes.length > 0"
                  style="opacity: 0.7; padding: 0 10px"
                >
                  <span>Applied promocodes: </span>
                  <span>
                    <span
                      v-for="(promocode, index) in getPromocodes"
                      :key="index"
                    >
                      {{ promocode
                      }}{{ index < getPromocodes.length - 1 ? ", " : "" }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div class="ccb-payment-info-images">
              <div class="ccb-payment-info-image">
                <img
                  :src="getStampImage"
                  alt="stamp-image"
                  :style="stampStyles"
                  v-if="getStampImage"
                />
              </div>
              <div class="ccb-payment-info-image">
                <img
                  :src="getSignatureImage"
                  alt="signature-image"
                  :style="signatureStyles"
                  v-if="getSignatureImage"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, ref } from "vue";
import QRCode from "qrcode";
import { IPdfSettings } from "@/widget/shared/types/settings";
import { useOrdersStore } from "@/orders/app/providers/stores/orders";
import { currencyConvertor } from "@/orders/shared/utils/useCurrencyConvertor";
import { IOrders } from "@/orders/shared/types/orders.type";
import { ITotals } from "@/orders/shared/types/orders.type";

const ordersStore = useOrdersStore();

type Props = {
  pdf: IPdfSettings;
  item: {
    tabs: {
      design?: {
        data: {
          tableBackground?: { data: { status: boolean }; value: string };
          tableText?: { data: { status: boolean }; value: string };
          fontSize?: { value: number };
          headingBackground?: { data: { status: boolean }; value: string };
          headingText?: { data: { status: boolean }; value: string };
          titleFontSize?: { value: number };
        };
      };
      lines?: {
        data: {
          showBorder?: { value: boolean };
          borderBorderSize?: { value: number };
          borderColor?: { value: string };
          borderStyle?: { value: string };
          angleBorderSize?: { value: number };
          showLines?: { value: boolean };
          lineBorderSize?: { value: number };
          lineBorderStyle?: { value: string };
          lineBorderColor?: { value: string };
        };
      };
      images?: {
        data: {
          signatureImage?: { value: string };
          signatureSize?: { value: number };
          stampImage?: { value: string };
          stampSize?: { value: number };
        };
      };
      content?: {
        data: {
          showHeading?: { value: boolean };
          headingName?: { value: string };
          headingUnit?: { value: string };
          headingValue?: { value: string };
          showQrCode?: { value: boolean };
          qrCodeLink?: { value: string };
          showPaymentMethod?: { value: boolean };
          showGrandTotal?: { value: boolean };
        };
      };
    };
  };
  content: {
    paymentMethodType?: string;
    promocodes?: string[];
    total?: number;
    totals?: Array<{
      label: string;
      value: number;
      hidden?: boolean;
      hasDiscount?: boolean;
      discount?: {
        discountView?: string;
        discountTitle?: string;
        discountValue?: string;
        originalConverted?: string;
      };
    }>;
  };
};

const props = defineProps<Props>();
const { item, content } = toRefs(props);

const qrCodeDataUrl = ref("");

const generateQRCode = (link: string) => {
  QRCode.toDataURL(link).then((url: string) => {
    qrCodeDataUrl.value = url;
  });
};

const formatCurrency = (order: IOrders): string => {
  return currencyConvertor(Number(order.total_amount), {
    currency: order.currency.currency_sign,
    currencyPosition: order.currency.currency_position,
    numAfterInteger: order.currency.number_of_decimals,
    thousandsSeparator: order.currency.thousand_separator,
    decimalSeparator: order.currency.decimal_separator,
  });
};

const formatCurrencyFromTotal = computed(() => {
  return (total: number | string): string => {
    const order = ordersStore.getCurrentOrder as IOrders;
    return currencyConvertor(Number(total), {
      currency: order.currency.currency_sign,
      currencyPosition: order.currency.currency_position,
      numAfterInteger: order.currency.number_of_decimals,
      thousandsSeparator: order.currency.thousand_separator,
      decimalSeparator: order.currency.decimal_separator,
    });
  };
});

const getDiscountAmount = computed(() => {
  return (total: ITotals) => {
    if (total.discount.discount_view === "show_with_title") {
      return total.discount.discount_title || "Discount";
    }

    if (total.discount.discount_type === "percent_of_amount") {
      return `${total.discount.discount_amount}%`;
    }

    const formattedValue = formatCurrencyFromTotal.value(
      Number(total.discount.discount_amount || 0),
    );

    if (total.discount.discount_view === "show_with_title") {
      return `-${formattedValue}`;
    }

    return `-${formattedValue} off`;
  };
});

const getGrandTotalAmount = computed(() => {
  return formatCurrency(ordersStore.getCurrentOrder as IOrders);
});

const getTableStyles = computed(() => {
  let styles: {
    flex: number;
    backgroundColor?: string;
    color?: string;
    fontSize?: string;
  } = { flex: 1 };

  if (item.value?.tabs?.design) {
    const design = item.value.tabs.design;

    if (design.data?.tableBackground?.data?.status) {
      const color = design.data?.tableBackground?.value;
      styles = {
        flex: 1,
        backgroundColor: color,
      };
    }
    if (design.data?.tableText?.data?.status) {
      styles.color = design.data?.tableText?.value;
    }
    if (design.data?.fontSize?.value) {
      styles.fontSize = `${design.data.fontSize.value}px`;
    }
  }

  return styles;
});

const getBorders = computed(() => {
  let styles: {
    padding: number;
    height: string;
    border?: string;
    borderRadius?: string;
  } = { padding: 0, height: "max-content" };

  if (item.value?.tabs?.lines?.data?.showBorder?.value) {
    const size = item.value?.tabs?.lines?.data?.borderBorderSize?.value;
    const color = item.value?.tabs?.lines?.data?.borderColor?.value;
    const style = item.value?.tabs?.lines?.data?.borderStyle?.value || "solid";
    const radius = item.value?.tabs?.lines?.data?.angleBorderSize?.value;
    styles.border = `${size}px ${style} ${color}`;
    styles.borderRadius = `${radius}px`;
  }

  return styles;
});

const getSignatureImage = computed(() => {
  return item.value?.tabs?.images?.data?.signatureImage?.value || "";
});

const signatureStyles = computed(() => {
  return {
    width: `${item.value?.tabs?.images?.data?.signatureSize?.value || 0}px`,
  };
});

const stampStyles = computed(() => {
  return {
    width: `${item.value?.tabs?.images?.data?.stampSize?.value || 0}px`,
  };
});

const getStampImage = computed(() => {
  return item.value?.tabs?.images?.data?.stampImage?.value || "";
});

const getHeadingStyles = computed(() => {
  let styles: { color?: string; fontSize?: string; backgroundColor?: string } =
    {};

  if (item.value?.tabs?.design) {
    const design = item.value.tabs.design;

    if (design.data?.headingBackground?.data?.status) {
      const color = design.data?.headingBackground?.value;
      styles = {
        backgroundColor: color,
      };
    }

    if (design.data?.headingText?.data?.status) {
      styles.color = design.data?.headingText?.value;
    }

    if (design.data?.titleFontSize?.value) {
      styles.fontSize = `${design.data.titleFontSize.value}px`;
    }
  }

  return styles;
});

const getPromocodes = computed(() => {
  return content.value?.promocodes || [];
});

const showHeading = computed(() => {
  return item.value?.tabs?.content?.data?.showHeading?.value || false;
});

const getName = computed(() => {
  return item.value?.tabs?.content?.data?.headingName?.value || "";
});

const getOptionUnit = computed(() => {
  return item.value?.tabs?.content?.data?.headingUnit?.value || "";
});

const getValue = computed(() => {
  return item.value?.tabs?.content?.data?.headingValue?.value || "";
});

const getOrderDetails = computed(() => {
  return (ordersStore.getCurrentOrder?.calculator_fields || [])
    .sort((a, b) => a.sort_id - b.sort_id)
    .filter((f) => !f.alias.includes("repeater"));
});

const getLines = computed(() => {
  let styles = {};
  if (item.value?.tabs?.lines?.data?.showLines?.value) {
    const size = item.value?.tabs?.lines?.data?.lineBorderSize?.value;
    const style = item.value?.tabs?.lines?.data?.lineBorderStyle?.value;
    const color = item.value?.tabs?.lines?.data?.lineBorderColor?.value;
    styles = {
      borderBottom: `${size}px ${style} ${color}`,
    };
  }
  return styles;
});

const showQrCode = computed(() => {
  const status = item.value?.tabs?.content?.data?.showQrCode?.value || false;
  if (status) {
    const link =
      item.value?.tabs?.content?.data?.qrCodeLink?.value ||
      "https://google.com";
    generateQRCode(link);
  }
  return status;
});

const getTotals = computed((): ITotals[] => {
  const totals = ordersStore.getCurrentOrder?.totals || [];
  const otherTotals = ordersStore.getCurrentOrder?.other_totals || [];
  return [...otherTotals, ...totals] as ITotals[];
});

const showPaymentMethod = computed(() => {
  return item.value?.tabs?.content?.data?.showPaymentMethod?.value || false;
});

const showGrandTotal = computed(() => {
  return item.value?.tabs?.content?.data?.showGrandTotal?.value || false;
});

const paymentBorderStyles = computed(() => {
  let styles = {};
  if (!showPaymentMethod.value && !showGrandTotal.value) return styles;
  if (!getTotals.value?.length) return styles;

  if (item.value?.tabs?.lines?.data?.showLines?.value) {
    const size = item.value?.tabs?.lines?.data?.lineBorderSize?.value;
    const style = item.value?.tabs?.lines?.data?.lineBorderStyle?.value;
    const color = item.value?.tabs?.lines?.data?.lineBorderColor?.value;
    styles = {
      borderTop: `${size}px ${style} ${color}`,
    };
  }
  return styles;
});

const getPaymentMethodType = computed(() => {
  return ordersStore?.getCurrentOrder?.payment_type_label || "";
});
</script>
