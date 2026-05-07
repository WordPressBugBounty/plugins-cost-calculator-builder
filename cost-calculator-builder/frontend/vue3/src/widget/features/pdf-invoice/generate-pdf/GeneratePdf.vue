<template>
  <div>
    <div class="ccb-pdf-invoice" v-if="showPdfButton" ref="pdfInvoiceRef">
      <div
        class="ccb-pdf-invoice__actions"
        :class="actionsClass"
        v-if="!getButtonStatus"
      >
        <Button
          type="light"
          :text="generatePdfBtnText"
          @click="generatePdf"
          :isDemo="isDemo"
        >
        </Button>
      </div>
    </div>
    <Invoice ref="invoiceComponent" @generate-quote="sendQuote" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  toRefs,
  defineProps,
  defineExpose,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";
import { customBtoa } from "@/widget/shared/utils/custom-btoa.utils.ts";
import { useNotificationsStore } from "@/widget/app/providers/stores/notificationsStore";
import Button from "@/widget/shared/ui/components/Button";
import Invoice from "@/widget/features/pdf-invoice/invoice";

const appStore = useAppStore();

type Props = {
  hideButtons?: boolean;
  options: {
    width?: string;
  };
};

const props = defineProps<Props>();

const { hideButtons } = toRefs(props);

const quoteFields = ref({
  name: "",
  email: "",
  message: "",
  pdfName: "",
});

const invoiceComponent = ref();
const popup = ref();
const settingsStore = useSettingsStore();

const generatePdf = () => {
  invoiceComponent.value?.generate();
};

defineExpose({
  generatePdf,
});

const showPopup = () => {
  popup.value?.showPopup();
};

const sendQuote = (pdf: any) => {
  const data = quoteFields.value;

  setTimeout(async () => {
    const formData = new FormData();

    formData.append("action", "ccb_send_invoice");
    formData.append("nonce", (window as any).ccb_nonces.ccb_send_invoice);
    formData.append("pdfString", pdf.data);

    data.pdfName = pdfName.value;
    const hashData = customBtoa(data);
    formData.append("data", hashData);

    const result = await fetch((window as any).ajax_window.ajax_url, {
      method: "POST",
      body: formData,
    });

    await result.json();
  }, 3000);
};

const showPdfButton = computed(() => {
  const summaryDisplay = settingsStore.getFormSettings?.summaryDisplay;
  if (
    (summaryDisplay?.enable &&
      summaryDisplay?.actionAfterSubmit !== "show_summary_block_with_pdf") ||
    !settingsStore.getInvoice?.useInAll
  ) {
    return false;
  }

  const notificationsStore = useNotificationsStore();
  return (
    !settingsStore.getInvoice?.showAfterPayment ||
    notificationsStore.notificationType === "finish"
  );
});

const generatePdfBtnText = computed<string>(() => {
  return settingsStore.getInvoice?.pdfButtonText || "PDF Download";
});

const showShareBtn = computed(() => {
  return settingsStore.getInvoice?.emailButton;
});

const pdfName = computed(() => {
  return appStore.getCalcTitle;
});

const isDemo = computed(() => {
  return appStore.getIsLive;
});

const actionsClass = computed(() => {
  return !showShareBtn.value
    ? "ccb-pdf-invoice__actions--show-pdf"
    : "ccb-pdf-invoice__actions--show-share";
});

const handleDownload = () => {
  generatePdf();
};
const handleOpenModal = (e: Event) => {
  const calcId = (e as CustomEvent).detail?.calcId;
  if (calcId === appStore.getCalcId) showPopup();
};

const initListeners = () => {
  const listenersKey = `__ccb_pdf_listeners_${appStore.getCalcId}`;
  if ((window as any)[listenersKey]) return;

  const thankYouPageSettings = settingsStore.getThankYouPage;
  const oneClickAction = settingsStore?.stickyCalc?.oneClickAction;

  if (
    appStore.isThankYouPage ||
    (thankYouPageSettings?.enable &&
      thankYouPageSettings?.type === "modal" &&
      thankYouPageSettings?.downloadButton) ||
    oneClickAction === "pdf"
  ) {
    window.addEventListener("ccbDownLoadPdf", handleDownload);
  }
  window.addEventListener("ccbOpenModal", handleOpenModal);

  (window as any)[listenersKey] = true;
};

const getButtonStatus = computed(() => {
  if (hideButtons.value) return true;
  const notificationsStore = useNotificationsStore();
  if (settingsStore.getInvoice?.showAfterPayment) {
    return !(notificationsStore.notificationType === "finish");
  }

  return false;
});

onMounted(() => {
  initListeners();
});

onBeforeUnmount(() => {
  window.removeEventListener("ccbDownLoadPdf", handleDownload);
  window.removeEventListener("ccbOpenModal", handleOpenModal);

  const listenersKey = `__ccb_pdf_listeners_${appStore.getCalcId}`;
  if ((window as any)[listenersKey]) {
    delete (window as any)[listenersKey];
  }
});
</script>

<style lang="scss">
.ccb-pdf-invoice {
  width: 100%;

  button {
    width: 100%;
    position: relative;
    .is-pro {
      position: absolute;
      top: -9px;
      right: -15px;
      margin: 0;
      &:hover {
        overflow: visible;
        .pro-tooltiptext {
          overflow: visible;
        }
      }
      .pro-tooltip {
        margin: 0;
        font-weight: 700;
      }
    }
  }

  .ccb-pdf-invoice__actions--show-pdf {
  }

  .ccb-pdf-invoice__actions--show-share {
    display: flex;
    gap: 10px;
    justify-content: space-between;

    @media (max-width: 350px) {
      flex-direction: column;
    }
  }
}

.ccb-pdf-sendquote {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 55px;
  min-width: 410px;
  max-width: 410px;
  top: 50%;
  transform: translate(-50%, -50%);
  left: 50%;
  position: absolute;
  min-height: 486px;
  z-index: 999999;
  border-radius: 20px;
  background-color: var(--ccb-container-color);
  @media (max-width: 420px) {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 340px;
    min-width: 340px;
    margin-left: 0;
    padding: 40px 25px;
  }

  &.quote-success {
    min-height: 341px;
    padding-top: 0;
    padding-bottom: 0;
    max-width: 410px;
    button {
      width: fit-content;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    width: 100%;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    font-style: normal;
    letter-spacing: normal;
    line-height: 21px;
    color: var(--ccb-text-color);
  }

  &__close {
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--ccb-container-dark-color);
    border-radius: 50%;
    font-size: 12px;
    color: var(--ccb-text-color);
    transition: all 0.3s ease;
    opacity: 0.7;

    &:hover {
      background-color: var(--ccb-accent-color);
      color: var(--ccb-fields-color);
    }
  }

  &__body,
  &__footer {
    width: 100%;

    .ccb-button {
      width: 100%;
    }
  }

  &__error {
    padding: 8px 14px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background-color: #fbebeb;
    border-radius: 10px;
    margin-top: 20px;
    span {
      color: #d94141;
      font-size: 14px;
      font-weight: 700;
      margin-right: 10px;
    }
  }

  &__success {
    display: flex;
    flex-direction: column;
    align-items: center;
    &-icon {
      border-radius: 50%;
      width: 60px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
      color: #00b163;
      background-color: #00b1631a;
      font-size: 16px;
    }
    .message {
      color: #001931;
      font-size: 20px;
      font-weight: 700;
      font-style: normal;
      letter-spacing: normal;
      line-height: 26px;
      text-align: center;
      margin-bottom: 30px;
      padding: 0 50px;
      color: var(--ccb-text-color);
    }
  }

  &__input {
    display: flex;
    flex-direction: column;

    label {
      font-size: var(--ccb-field-size);
      font-weight: var(--ccb-field-weight);
      color: var(--ccb-text-color);
      line-height: 1.3;
      cursor: pointer;
      line-height: 21.99px;

      @media only screen and (max-width: 480px) {
        font-size: var(--ccb-mobile-field-size);
        font-weight: var(--ccb-mobile-field-weight);
      }

      &.required {
        &:after {
          content: "*";
          color: red;
        }
      }
    }

    input,
    textarea {
      border: var(--ccb-fields-border) var(--ccb-fields-border-style)
        var(--ccb-fields-border-color);
      border-radius: var(--ccb-fields-border-radius);
      padding: 0 var(--ccb-field-side-indent);
      min-height: var(--ccb-field-button-height);
      background-color: var(--ccb-fields-bg-color);
      font-size: var(--ccb-fields-button-size);
      font-weight: var(--ccb-field-weight);
      box-sizing: border-box;
      width: 100%;
      resize: none;
      color: var(--ccb-text-color);
      margin-bottom: 20px;
      height: 40px;
      outline: none;
      @media only screen and (max-width: 480px) {
        padding: 0 var(--ccb-mobile-field-side-indent);
        min-height: var(--ccb-mobile-field-button-height);
        font-weight: var(--ccb-mobile-field-weight);
        font-size: var(--ccb-mobile-fields-button-size);
      }
      &:focus {
        border-color: var(--ccb-accent-color);
      }
    }
    textarea {
      height: 130px;
      padding-top: 12px;
      padding-bottom: 12px;
    }
  }

  &__file {
    background-color: var(--ccb-container-dark-color);
    padding: 10px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 20px;
    word-break: break-all;
    border-radius: 5px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ccb-text-color);

    span {
      font-size: 14px;
      font-weight: 500;
      font-style: normal;
      letter-spacing: normal;
      line-height: 21px;
      opacity: 0.7;
      margin-left: 8px;
    }
    i {
      font-size: 18px;
      color: var(--cbb-text-color);
      opacity: 0.5;
    }
  }
}
</style>
