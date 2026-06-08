<template>
  <div
    class="calc-thank-you-page-container vertical"
    :class="{ mobile: isMobile, 'has-back-action': showBackToCalculators }"
  >
    <div
      class="thank-you-page"
      v-show="showThankYouPage"
      :class="{ loaded: showThankYouPage }"
    >
      <span
        class="thank-you-page-close"
        v-if="!showBackToCalculators"
        @click.prevent="backToCalculatorAction"
      >
        <span class="ccb-icon-close-x"></span>
      </span>
      <div class="thank-you-page-inner-container">
        <div
          class="thank-you-page-inner__header-mobile"
          v-if="isMobile"
          @click="backToCalculatorAction"
        >
          <div class="thank-you-page-inner__header-mobile-close">
            <span class="ccb-icon-close-x"></span>
          </div>
        </div>
        <div class="thank-you-page__icon-box">
          <span class="icon-wrapper">
            <span class="icon-content">
              <i class="ccb-icon-Octicons"></i>
            </span>
          </span>
        </div>
        <div class="thank-you-page__title-box">
          <span
            class="thank-you-page__title-box-title"
            v-text="getThankYouPageSettings?.title"
          ></span>
          <span
            class="thank-you-page__title-box-desc"
            v-text="getThankYouPageSettings?.description"
          ></span>
        </div>
        <div
          class="thank-you-page__order"
          v-if="getThankYouPageSettings?.showOrderId"
        >
          <span>
            <span v-text="getThankYouPageSettings?.orderTitle"></span>
            <span v-text="submissionStore.orderId"></span>
          </span>
        </div>
        <div class="thank-you-page__actions">
          <div class="thank-you-page__actions-wrapper">
            <!-- back calculator -->
            <div
              class="thank-you-page__action thank-you-page__action--back"
              v-if="showBackToCalculators"
            >
              <Button
                :text="getThankYouPageSettings?.backButtonText || ''"
                @click="backToCalculatorAction"
                type="light"
                icon="ccb-icon-Arrow-Previous"
                icon-position="before"
              />
            </div>

            <!-- custom button -->
            <div
              class="thank-you-page__action thank-you-page__action--custom"
              v-if="getThankYouPageSettings?.customButton"
            >
              <a
                :href="getThankYouPageSettings?.customButtonLink"
                target="_blank"
                class="ccb-button calc-secondary"
              >
                <span v-text="getThankYouPageSettings?.customButtonText"></span>
              </a>
            </div>

            <!-- download PDF -->
            <div
              class="thank-you-page__action thank-you-page__action--download"
              v-if="
                getThankYouPageSettings?.downloadButton &&
                getInvoiceSettings?.useInAll
              "
            >
              <Button
                :text="getThankYouPageSettings?.downloadButtonText"
                @click="downloadPdf"
                type="success"
              />
            </div>

            <!-- send PDF -->
            <div
              class="thank-you-page__action thank-you-page__action--share"
              v-if="
                getThankYouPageSettings?.shareButton &&
                getInvoiceSettings?.useInAll &&
                getInvoiceSettings?.emailButton
              "
            >
              <Button
                class="calc-secondary"
                @click="sendPdf"
                type="success-outlined"
                :text="getThankYouPageSettings?.shareButtonText"
              >
              </Button>
            </div>
          </div>
        </div>
      </div>
      <PdfInvoice :hide-buttons="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { useSubmissionStore } from "@/widget/app/providers/stores/submissionStore.ts";
import { useNotificationsStore } from "@/widget/app/providers/stores/notificationsStore";
import { useAppStore } from "@/widget/app/providers/stores/appStore";
import PdfInvoice from "@/widget/features/pdf-invoice/send-quote";
import Button from "@/widget/shared/ui/components/Button";
import { usePaymentAfterSubmitStore } from "@/widget/app/providers/stores/paymentAfterSubmit";
import { useOrderFormStore } from "@/widget/app/providers/stores/orderFormStore";
import { usePaymentStore } from "@/widget/app/providers/stores/paymentsStore";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore";

const isMobile = computed(() => {
  return appStore.getIsMobile;
});

const settingsStore = useSettingsStore();
const submissionStore = useSubmissionStore();
const notificationsStore = useNotificationsStore();
const appStore = useAppStore();

const showThankYouPage = ref(false);

const getThankYouPageSettings = computed(() => settingsStore.getThankYouPage);

const getInvoiceSettings = computed(() => settingsStore.getInvoice);

const showBackToCalculators = computed(
  () => getThankYouPageSettings.value?.type !== "modal",
);

const separatePageEnable = computed(() => {
  return getThankYouPageSettings.value?.type === "separate_page";
});

const backToCalculatorAction = () => {
  if (separatePageEnable) {
    const previousPage = localStorage.getItem("ccb_previous_page");
    if (previousPage) {
      localStorage.removeItem("ccb_previous_page");
      window.location.href = previousPage;
    }
  }

  const paymentStore = usePaymentStore();
  paymentStore.updatePaymentType("");

  const paymentAfterSubmitStore = usePaymentAfterSubmitStore();
  paymentAfterSubmitStore.setIsPaymentAfterSubmit(false);

  const settingsStore = useSettingsStore();
  settingsStore.updateTermsValue(false);

  const orderFormStore = useOrderFormStore();
  orderFormStore.resetBtnData();

  const fieldsStore = useFieldsStore();
  fieldsStore.updateActivePageIndex(0);

  showThankYouPage.value = false;
  appStore.updateThankYouPageStatus(false);
  notificationsStore.resetNotifications();
};

const downloadPdf = () => {
  window.dispatchEvent(new CustomEvent("ccbDownLoadPdf"));
};

const sendPdf = () => {
  window.dispatchEvent(
    new CustomEvent("ccbOpenModal", { detail: { calcId: appStore.getCalcId } }),
  );
};

onMounted(() => {
  showThankYouPage.value = true;
});
</script>

<style scoped lang="scss">
.calc-thank-you-page-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0 auto;
  max-width: var(--ccb-container-max-width);

  .thank-you-page {
    width: 100%;
    border-radius: 6px;
    border: 1px solid var(--ccb-container-border-color);
    background: var(--ccb-container-color);
    padding: 45px 30px 40px 35px;
    opacity: 0;
    visibility: visible;
    position: relative;
    color: var(--ccb-text-color);

    &-close {
      box-sizing: border-box;
      cursor: pointer;
      display: flex;
      padding: 3px;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      position: absolute;
      top: 14px;
      right: 14px;
      background-color: #eef1f7;
      transition: background 200ms linear;

      span {
        font-size: 13px;
        color: #00193166;
      }

      @media screen and (max-width: 768px) {
        width: 20px;
        height: 20px;

        span {
          font-size: 12px;
          color: #00193166;
        }
      }
    }

    &.loaded {
      visibility: visible;
      opacity: 1;
    }

    @media screen and (max-width: 480px) {
      & {
        padding: 20px 15px;
      }
    }

    .thank-you-page-inner-container {
      max-width: 420px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      row-gap: 20px;
      margin: 0 auto;
    }

    &__icon-box {
      .icon-wrapper {
        width: 114px;
        height: 114px;
        border-radius: 50%;
        background-color: rgba(26, 177, 99, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;

        .icon-content {
          width: 64px;
          height: 64px;
          background-color: var(--ccb-accent-color);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;

          i {
            font-size: 20px;
            color: var(--ccb-fields-bg-color);
          }
        }

        @media screen and (max-width: 480px) {
          width: 98px;
          height: 98px;

          .icon-content {
            width: 48px;
            height: 48px;
          }
        }
      }
    }

    &__title-box {
      display: flex;
      flex-direction: column;

      & span {
        word-break: break-all;
      }

      &-title {
        color: var(--ccb-text-color);
        text-align: center;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 22px;
      }

      &-desc {
        color: var(--ccb-text-color);
        text-align: center;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
      }
    }

    &__order {
      span {
        display: flex;
        column-gap: 5px;
        span {
          &:first-child {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 300px;
            width: 100%;
            display: inline-block;
          }

          color: var(--ccb-text-color);
          text-align: center;
          font-size: 14px;
          font-style: normal;
          font-weight: 500;
        }
      }
    }

    &__actions {
      width: 100%;
      display: flex;
      justify-content: center;

      &-wrapper {
        max-width: 420px;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        row-gap: 15px;
        column-gap: 8px;
        width: 100%;

        @media screen and (max-width: 480px) {
          column-gap: 5px;
          row-gap: 10px;
        }

        .back-button {
          color: var(--ccb-text-color) !important;
          background: var(--ccb-fields-bg-color) !important;
          border-color: var(--ccb-fields-border-color) !important;
        }

        div {
          width: 49%;

          @media screen and (max-width: 480px) {
            width: 45%;
          }

          a,
          button {
            box-sizing: border-box;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 10px;
            border-radius: 4px;
            border: 1px solid #0019310d;
            width: 100%;
            height: 40px;
            font-weight: var(--ccb-fields-button-weight);
            font-family: inherit;
            font-size: var(--ccb-fields-button-size);
            outline: none !important;
            box-shadow: none !important;
            text-decoration: none !important;
            transition: all linear 200ms;

            @media screen and (max-width: 480px) {
              padding: 0;
              font-size: var(--ccb-mobile-fields-button-size);
              font-weight: var(--ccb-mobile-fields-button-weight);
            }

            span {
              width: max-content;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              padding: 0 8px;

              font-size: var(--ccb-fields-button-size);
              font-style: normal;
              font-weight: 700;

              @media only screen and (max-width: 480px) {
                font-size: var(--ccb-mobile-fields-button-size);
              }
            }

            i {
              position: relative;
              left: -2px;
            }

            &.calc-primary {
              border-color: #eef1f7;
              background: #eef1f7;
              color: #011a30;
            }

            &.calc-secondary {
              border-color: var(--ccb-accent-color) !important;
              background: var(--ccb-fields-bg-color);
              color: var(--ccb-accent-color);

              &:hover {
                background: var(--ccb-accent-color);
                color: var(--ccb-fields-bg-color);
              }
            }

            &.calc-success {
              border-color: var(--ccb-accent-color);
              background: var(--ccb-accent-color);
              color: var(--ccb-text-color);
            }

            &.light {
              background: var(--ccb-button-light-bg);
              border-color: var(--ccb-button-light-bg);

              &:hover {
                background: var(--ccb-button-light-bg-alpha);
                border-color: var(--ccb-button-light-bg-alpha);
              }
            }
          }
        }
      }
    }
  }

  &.mobile {
    position: fixed;
    inset: 0;
    z-index: 999999;
    align-items: flex-end;
    max-width: none;
    background: rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);

    .thank-you-page {
      width: 100%;
      max-height: calc(100dvh - 72px);
      margin-top: auto;
      padding: 30px 20px 20px;
      overflow: auto;
      border: 0;
      border-top: 1px solid rgba(0, 0, 0, 0.16);
      border-radius: 20px 20px 0 0;
      background: var(--ccb-container-color);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);

      &-close {
        top: 30px;
        right: 30px;
        width: 24px;
        height: 24px;
        padding: 0;
        background: var(--ccb-container-dark-color);

        span {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.8);
        }
      }

      .thank-you-page-inner-container {
        max-width: 360px;
        row-gap: 0;
      }

      .thank-you-page-inner__header-mobile {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        margin-bottom: 16px;
      }

      .thank-you-page-inner__header-mobile-close {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 24px;
        padding: 0;
        background: var(--ccb-container-dark-color);
        border: 0;
        border-radius: 50%;
        cursor: pointer;
        color: var(--ccb-text-color);
        font-size: 10px;
      }

      &__icon-box {
        order: 1;
        margin-bottom: 16px;

        .icon-wrapper {
          width: 64px;
          height: 64px;
          background-color: rgba(0, 143, 60, 0.08);

          .icon-content {
            width: 40px;
            height: 40px;
            background-color: var(--ccb-accent-color);

            i {
              font-size: 16px;
              color: var(--ccb-fields-color);
            }
          }
        }
      }

      &__title-box {
        order: 3;
        margin-bottom: 40px;
        gap: 4px;

        & span {
          word-break: normal;
        }

        &-title {
          font-size: 18px;
          line-height: 1;
          color: var(--ccb-text-color);
        }

        &-desc {
          font-size: 14px;
          line-height: 16px;
          font-weight: 400;
          color: var(--ccb-text-color);
          opacity: 0.7;
          letter-spacing: 0.2px;
        }
      }

      &__order {
        order: 2;
        margin-bottom: 24px;
        padding: 6px 24px;
        border: 1px solid rgba(0, 0, 0, 0.16);

        span {
          column-gap: 4px;

          span {
            max-width: 130px;
            font-size: 14px;
            line-height: 16px;
            font-weight: 400;
            color: var(--ccb-text-color);
            opacity: 0.7;
            letter-spacing: 0.2px;

            &:first-child {
              max-width: 130px;
            }
          }
        }
      }

      &__actions {
        order: 4;

        &-wrapper {
          max-width: 360px;
          flex-direction: column;
          flex-wrap: nowrap;
          gap: 8px;

          .thank-you-page__action {
            width: 100%;
          }

          .thank-you-page__action--back {
            display: flex;
            align-items: center;
            height: 72px;
            background: var(--ccb-container-color);
            order: 1;
          }

          .thank-you-page__action--back {
            button {
              i {
                display: none;
              }

              span {
                font-size: 14px;
                font-weight: 700;
                color: var(--ccb-text-color);
              }
            }
          }
        }
      }
    }
  }
}
</style>
