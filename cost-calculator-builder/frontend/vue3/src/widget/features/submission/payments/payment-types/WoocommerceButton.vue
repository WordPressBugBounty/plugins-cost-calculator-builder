<template>
  <div class="ccb-payment-woocommerce">
    <button class="ccb-payment-button" @click="submitForm">
      {{ getSubmitOrderText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSinglePayment } from "@/widget/actions/pro-features/payments/composable/useSinglePayment.ts";
import { computed } from "vue";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { useSubmissionStore } from "@/widget/app/providers/stores/submissionStore.ts";
import { useOrderFormStore } from "@/widget/app/providers/stores/orderFormStore.ts";
import { useNotificationsStore } from "@/widget/app/providers/stores/notificationsStore.ts";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";

const fieldsStore = useFieldsStore();

const appStore = useAppStore();

const settings = useSettingsStore();
const submissionStore = useSubmissionStore();
const orderFormStore = useOrderFormStore();

const { paymentType } = useSinglePayment();

const showDemoNotice = ref(false);
const isLive = computed(() => {
  return appStore.getIsLive;
});

const getSubmitOrderText = computed((): string => {
  return "Add to cart";
});

const submitForm = () => {
  // IF demo or live site ( demonstration only )
  if (isLive.value) {
    showDemoNotice.value = true;
    setTimeout(() => {
      showDemoNotice.value = false;
    }, 5000);
    return;
  }
  // END| IF demo or live site ( demonstration only )

  if (!fieldsStore.checkRequiredFields()) {
    return;
  }

  const captcha = settings.getRecaptchaSettings;
  let captcha_access = true;
  const notificationsStore = useNotificationsStore();

  if (captcha?.enable) {
    if (captcha.type === "v2") {
      const token = orderFormStore.getCaptchaToken;
      if (!token) {
        notificationsStore.updateNotifications({
          status: true,
          type: "error",
          message: "reCAPTCHA verification failed",
        });
        return;
      }
    } else if (captcha.type === "v3") {
      captcha_access = false;
      window.grecaptcha?.ready(() => {
        window.grecaptcha
          ?.execute(captcha.siteKey, { action: "submit" })
          .then((token: string) => {
            orderFormStore.setCaptchaToken(token);
            captcha_access = true;
            proceedWithSubmission();
          })
          .catch((_: Error) => {
            notificationsStore.updateNotifications({
              status: true,
              type: "error",
              message: "reCAPTCHA v3 verification failed",
            });
          });
      });
      return;
    }
  }

  if (captcha_access) {
    paymentType.value = "woocommerce";
    proceedWithSubmission();
  }
};

const proceedWithSubmission = () => {
  submissionStore.submissionCreateOrder();
};
</script>

<style lang="scss">
.ccb-payment-woocommerce {
  width: 100%;
}

.ccb-payment-button {
  width: 100%;
  border: none;
  border-radius: var(--ccb-fields-border-radius);
  font-size: var(--ccb-fields-button-size);
  font-weight: var(--ccb-fields-button-weight);
  background: var(--ccb-accent-color);
  color: var(--ccb-fields-color);
  padding: 12px 20px;
  cursor: pointer;
}
</style>
