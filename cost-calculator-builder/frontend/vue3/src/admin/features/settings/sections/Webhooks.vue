<template>
  <div class="ccb-settings-section">
    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Webhooks" size="m" weight="bold" />
          <Text
            class="ccb-settings__description"
            text="Enables custom webhooks for different events."
            size="m"
            weight="regular"
          />
        </div>
      </div>
    </SettingsBlock>

    <!-- Order Form Webhooks -->
    <SettingsBlock v-if="orderFormEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            name="enableSendForms"
            @change="updateProperties"
            v-model="enableSendForms"
            label="When user submits Order form"
          />
        </div>
      </div>
      <div v-if="enableSendForms">
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Input
              name="send_form_url"
              placeholder="Enter Webhook link"
              label="Webhook link"
              @change="updateProperties"
              v-model="sendFormUrl"
            />
          </div>
          <div class="ccb-settings__col align-end justify-end">
            <Button
              label="Send demo data"
              iconLeft="ccb-icon-ic_add"
              size="s"
              type="green-ghost"
              @click="sendDemoData('send-form')"
            />
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Input
              name="secret_key_send_form"
              placeholder="Enter Secret key"
              label="Secret key or Token (optional)"
              inputType="password"
              @change="updateProperties"
              v-model="secretKeySendForm"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock v-if="!orderFormEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <div class="ccb-webhooks-info">
            <div class="ccb-webhooks-info__icon">
              <i class="ccb-icon-Lock-filled"></i>
            </div>
            <div class="ccb-webhooks-info__content">
              <Text
                text="When user submits Order form"
                size="m"
                weight="bold"
              />
              <span
                >This webhook will be available after you
                <span style="font-weight: bold">enable</span> Order Form.
                <a
                  href="https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/webhooks#when-contact-form-submitted"
                  target="_blank"
                  >Learn more</a
                ></span
              >
            </div>
          </div>
        </div>
      </div>
    </SettingsBlock>
    <!-- Order Form Webhooks End -->

    <!-- Payments Webhooks -->
    <SettingsBlock v-if="paymentsEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            name="enablePaymentBtn"
            @change="updateProperties"
            v-model="enablePaymentBtn"
            label="When user clicks Payment button"
          />
        </div>
      </div>
      <div v-if="enablePaymentBtn">
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Input
              name="payment_btn_url"
              placeholder="Enter Webhook link"
              label="Webhook link"
              @change="updateProperties"
              v-model="paymentBtnUrl"
            />
          </div>
          <div class="ccb-settings__col align-end justify-end">
            <Button
              label="Send demo data"
              iconLeft="ccb-icon-ic_add"
              size="s"
              type="green-ghost"
              @click="sendDemoData('send-payment')"
            />
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Input
              name="secret_key_payment_btn"
              placeholder="Enter Secret key"
              label="Secret key or Token (optional)"
              inputType="password"
              @change="updateProperties"
              v-model="secretKeyPaymentBtn"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock v-if="!paymentsEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <div class="ccb-webhooks-info">
            <div class="ccb-webhooks-info__icon">
              <i class="ccb-icon-Lock-filled"></i>
            </div>
            <div class="ccb-webhooks-info__content">
              <Text
                text="When user clicks Payment button"
                size="m"
                weight="bold"
              />
              <span
                >This webhook will be available after you
                <span style="font-weight: bold">enable</span> Payment method.
                <a
                  href="https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/webhooks#when-a-user-clicks-the-payment-button"
                  target="_blank"
                  >Learn more</a
                ></span
              >
            </div>
          </div>
        </div>
      </div>
    </SettingsBlock>
    <!-- Payments Webhooks End -->

    <!-- Email Quote Webhooks -->
    <SettingsBlock v-if="emailQuoteEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            name="enableEmailQuote"
            @change="updateProperties"
            v-model="enableEmailQuote"
            label="When users submit Share Quote form"
          />
        </div>
      </div>
      <div v-if="enableEmailQuote">
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Input
              name="email_quote_url"
              placeholder="Enter Webhook link"
              label="Webhook link"
              @change="updateProperties"
              v-model="emailQuoteUrl"
            />
          </div>
          <div class="ccb-settings__col align-end justify-end">
            <Button
              label="Send demo data"
              iconLeft="ccb-icon-ic_add"
              size="s"
              type="green-ghost"
              @click="sendDemoData('send-email-quote')"
            />
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Input
              name="secret_key_email_quote"
              placeholder="Enter Secret key"
              label="Secret key or Token (optional)"
              inputType="password"
              @change="updateProperties"
              v-model="secretKeyEmailQuote"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock v-if="!emailQuoteEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <div class="ccb-webhooks-info">
            <div class="ccb-webhooks-info__icon">
              <i class="ccb-icon-Lock-filled"></i>
            </div>
            <div class="ccb-webhooks-info__content">
              <Text
                text="When users submit Share Quote form"
                size="m"
                weight="bold"
              />
              <span
                >This webhook will be available after you
                <span style="font-weight: bold">enable</span> Share Quote form.
                <a
                  href="https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/webhooks#when-pdf-quote-is-emailed"
                  target="_blank"
                  >Learn more</a
                ></span
              >
            </div>
          </div>
        </div>
      </div>
    </SettingsBlock>

    <!-- Email Quote Webhooks End -->

    <Notice type="success">
      <Text
        text="Important! If you add or remove fields in your calculator, you must resubmit the data and update the settings in the automation service."
        size="m"
        weight="regular"
      />
      <a
        href="https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/webhooks"
        target="_blank"
        >Find out more.</a
      >
    </Notice>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { toast } from "vue3-toastify";
import SettingsBlock from "@/admin/features/settings/SettingsBlock.vue";
import { Text, Toggle, Input, Button, Notice } from "@/admin/shared/ui/UIKit";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { ISettings } from "@/admin/shared/types/settings.type";

const settingsStore = useSettingsStore();
const calculatorStore = useCalculatorStore();

const orderFormEnabled = computed((): boolean => {
  const s = settingsStore.getSettings;
  const gs = settingsStore.getGeneralSettings;
  return !!(s?.formFields?.accessEmail || gs?.form_fields?.use_in_all);
});

const paymentsEnabled = computed((): boolean => {
  const s = settingsStore.getSettings;
  const gs = settingsStore.getGeneralSettings;
  if (!s || !gs) return false;

  return !!(
    s.payment_gateway?.paypal?.enable ||
    s.payment_gateway?.cards?.card_payments?.stripe?.enable ||
    s.payment_gateway?.cards?.card_payments?.razorpay?.enable ||
    s.payment_gateway?.cash_payment?.enable ||
    gs.payment_gateway?.paypal?.use_in_all ||
    gs.payment_gateway?.cash_payment?.use_in_all ||
    (gs.payment_gateway?.cards?.use_in_all &&
      gs.payment_gateway?.cards?.card_payments?.stripe?.enable) ||
    (gs.payment_gateway?.cards?.use_in_all &&
      gs.payment_gateway?.cards?.card_payments?.razorpay?.enable)
  );
});

const emailQuoteEnabled = computed((): boolean => {
  const gs = settingsStore.getGeneralSettings;
  return !!gs?.invoice?.emailButton;
});

const enableEmailQuote = ref<boolean>(
  settingsStore.getSettings?.webhooks.enableEmailQuote || false,
);

const emailQuoteUrl = ref<string>(
  settingsStore.getSettings?.webhooks.email_quote_url || "",
);

const secretKeyEmailQuote = ref<string>(
  settingsStore.getSettings?.webhooks.secret_key_email_quote || "",
);

const enablePaymentBtn = ref<boolean>(
  settingsStore.getSettings?.webhooks.enablePaymentBtn || false,
);

const paymentBtnUrl = ref<string>(
  settingsStore.getSettings?.webhooks.payment_btn_url || "",
);

const enableSendForms = ref<boolean>(
  settingsStore.getSettings?.webhooks.enableSendForms || false,
);

const sendFormUrl = ref<string>(
  settingsStore.getSettings?.webhooks.send_form_url || "",
);

const secretKeySendForm = ref<string>(
  settingsStore.getSettings?.webhooks.secret_key_send_form || "",
);

const secretKeyPaymentBtn = ref<string>(
  settingsStore.getSettings?.webhooks.secret_key_payment_btn || "",
);

const sendDemoData = async (type: string): Promise<void> => {
  let url = "";

  if (type === "send-form") {
    url = sendFormUrl.value?.trim();
  } else if (type === "send-payment") {
    url = paymentBtnUrl.value?.trim();
  } else if (type === "send-email-quote") {
    url = emailQuoteUrl.value?.trim();
  }

  if (!url) {
    toast("Please check the url you provided", { type: "error" });
    return;
  }

  const calcId = calculatorStore.getId || 0;
  const formData = new FormData();
  formData.append("action", "ccb_send_demo_webhook");
  formData.append("nonce", (window as any).ccb_nonces?.ccb_webhook_nonce || "");
  formData.append("data", JSON.stringify({ calc_id: calcId, type, url }));
  formData.append("calc_id", String(calcId));

  try {
    const response = await fetch(
      (window as any).ccb_ajax_window?.ajax_url || "/wp-admin/admin-ajax.php",
      { method: "POST", body: formData },
    );

    if (response.ok) {
      toast("Demo data has been sent", { type: "success" });
    } else {
      toast("Failed to send demo data", { type: "error" });
    }
  } catch {
    toast("Failed to send demo data", { type: "error" });
  }
};

const updateProperties = (name: string, value: string | boolean | number) => {
  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;

  if (name === "enableSendForms") {
    settings.webhooks.enableSendForms = value as boolean;
    enableSendForms.value = value as boolean;
  }

  if (name === "send_form_url") {
    settings.webhooks.send_form_url = value as string;
    sendFormUrl.value = value as string;
  }

  if (name === "secret_key_send_form") {
    settings.webhooks.secret_key_send_form = value as string;
    secretKeySendForm.value = value as string;
  }

  if (name === "enablePaymentBtn") {
    settings.webhooks.enablePaymentBtn = value as boolean;
    enablePaymentBtn.value = value as boolean;
  }

  if (name === "payment_btn_url") {
    settings.webhooks.payment_btn_url = value as string;
    paymentBtnUrl.value = value as string;
  }

  if (name === "secret_key_payment_btn") {
    settings.webhooks.secret_key_payment_btn = value as string;
    secretKeyPaymentBtn.value = value as string;
  }

  if (name === "enableEmailQuote") {
    settings.webhooks.enableEmailQuote = value as boolean;
    enableEmailQuote.value = value as boolean;
  }

  if (name === "email_quote_url") {
    settings.webhooks.email_quote_url = value as string;
    emailQuoteUrl.value = value as string;
  }

  if (name === "secret_key_email_quote") {
    settings.webhooks.secret_key_email_quote = value as string;
    secretKeyEmailQuote.value = value as string;
  }

  settingsStore.setSettings(settings);
};
</script>

<style scoped lang="scss">
.ccb-webhooks-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;

  &__icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--ccb-orange-bg-normal);
    border-radius: 50%;
    font-size: 20px;
  }
}
</style>
