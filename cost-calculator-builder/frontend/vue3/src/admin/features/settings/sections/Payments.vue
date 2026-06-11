<template>
  <div class="ccb-settings-section">
    <SettingsBlock v-if="!orderFormEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Contact Form for Payments" size="m" weight="bold" />
          <div
            class="ccb-settings__description ccb-text-s ccb-regular"
            style="padding-left: px"
          >
            If the Contact Form is disabled, this form will be used. You can
            edit the form anytime in the
            <a @click.stop="openFormManager">Form Manager</a>
          </div>
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col" style="max-width: 288px">
          <Dropdown
            :items="paymentsForm"
            label="Form for Payments"
            v-model="selectedPaymentsForm"
            name="paymentsForm"
            @change="updateProperties"
          />
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            v-model="paypalEnabled"
            label="Enable Paypal"
            name="paypalEnabled"
            @change="updateProperties"
          />
          <div class="justify-start" style="padding-left: 54px">
            <Text
              class="ccb-settings__description"
              text="Read more about the integration on"
              size="m"
              weight="regular"
            />
            <a href="https://developer.paypal.com/" target="_blank">
              developer.paypal.com</a
            >
          </div>
        </div>
      </div>
      <template v-if="paypalEnabled && globalPaypalStatus">
        <Notice type="warning">
          <div class="ccb-notice__content">
            <Text text="Global settings applied" size="m" weight="bold" />
            <Text
              text="If you want to set up a specific calculator, please go to Settings → Currency and turn off the setting “Apply for all calculators”"
              size="m"
              weight="regular"
            />
            <Button
              label="Go to Settings"
              type="blue"
              size="m"
              weight="regular"
              @click="goToSettings"
              :showOriginal="true"
            />
          </div>
        </Notice>
      </template>
      <div v-if="paypalEnabled && !globalPaypalStatus">
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <div class="justify-start">
              <div class="ccb-paypal-ipn-setup">
                <div
                  class="ccb-paypal-ipn-setup__title ccb-text-xs ccb-regular"
                >
                  PayPal IPN Setup:
                </div>
                <div class="ccb-paypal-ipn-setup__wrapper">
                  <div class="ccb-paypal-ipn-setup__url ccb-text-m ccb-regular">
                    {{ siteUrl }}/?stm_ccb_check_ipn=1
                  </div>
                  <Button
                    size="s"
                    label="Copy"
                    type="blue-ghost"
                    class="ccb-paypal-ipn-setup__copy"
                    @click="copyIPN"
                  />
                </div>
              </div>
            </div>
            <Text
              class="ccb-settings__description"
              text="Use the URL for IPN listener settings"
              size="m"
              weight="regular"
              style="padding-left: 16px; padding-top: 4px"
            />
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Dropdown
              :items="paypalIntegrationTypes"
              name="paypalIntegrationType"
              label="Integration Type"
              @change="updateProperties"
              v-model="paypalIntegrationType"
            />
          </div>
        </div>
        <div
          class="ccb-settings__row"
          v-if="paypalIntegrationType === 'legacy'"
        >
          <div class="ccb-settings__col">
            <Input
              name="paypal_email"
              label="Email"
              placeholder="Enter PayPal email"
              @change="updateProperties"
              v-model="paypalEmail"
            />
          </div>
        </div>
        <div class="ccb-settings__row" v-if="paypalIntegrationType === 'rest'">
          <div class="ccb-settings__col">
            <Input
              name="client_id"
              label="Client ID"
              placeholder="Enter Client ID"
              @change="updateProperties"
              v-model="paypalClientId"
            />
          </div>
          <div class="ccb-settings__col">
            <Input
              name="client_secret"
              label="Client Secret"
              placeholder="Enter Client Secret"
              @change="updateProperties"
              v-model="paypalClientSecret"
            />
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Dropdown
              :items="paypalCurrencyCodes"
              name="currency_code"
              label="Currency"
              @change="updateProperties"
              v-model="paypalCurrencyCode"
            />
          </div>
          <div class="ccb-settings__col">
            <Dropdown
              :items="paypalModes"
              name="paypal_mode"
              label="Mode"
              @change="updateProperties"
              v-model="paypalMode"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Card Payments" size="m" weight="bold" />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <div class="ccb-card-payments">
            <div class="ccb-card-payments__row">
              <div class="ccb-card-payments__action">
                <Toggle
                  v-model="razorpayEnabled"
                  name="razorpayEnabled"
                  label="Razorpay"
                  @change="updateProperties"
                />
              </div>
              <div class="ccb-card-payments__setup" v-if="razorpayEnabled">
                <template v-if="globalRazorpayStatus">
                  <div class="ccb-payment-integrated">
                    <Text
                      text="Global settings are applied"
                      size="s"
                      weight="regular"
                    />
                    <Tooltip
                      target=".ccb-payment-integrated"
                      placement="top"
                      :max-width="570"
                      :offset="20"
                      :show-default-icon="false"
                      bubble-class="ccb-global-payment-tooltip-bubble"
                    >
                      <template #content>
                        <div class="ccb-global-payment-tooltip">
                          <Text
                            class="ccb-global-payment-tooltip__title"
                            text="Global settings are applied"
                            size="m"
                            weight="bold"
                            :showOriginal="true"
                          />
                          <Text
                            class="ccb-global-payment-tooltip__description"
                            text='Turn off "Apply for all calculators" from Global settings -> Payments'
                            size="xs"
                            weight="bold"
                            :showOriginal="true"
                          />
                          <Button
                            class="ccb-global-payment-tooltip__button"
                            label="Go to Global settings"
                            type="green"
                            size="s"
                            weight="regular"
                            :showOriginal="true"
                            @click="goToSettings"
                          />
                        </div>
                      </template>
                    </Tooltip>
                  </div>
                </template>
                <template v-else>
                  <Text
                    v-if="
                      razorpayKeyId.length !== 0 &&
                      razorpaySecretKey.length !== 0
                    "
                    class="ccb-card-payments__setup-text integrated"
                    text="Integrated"
                    size="s"
                    weight="regular"
                  />
                  <Text
                    v-else
                    class="ccb-card-payments__setup-text"
                    text="No integrated"
                    size="s"
                    weight="regular"
                  />

                  <Button
                    label="Setup"
                    size="s"
                    type="blue-ghost"
                    @click="openRazorpayPopup"
                  />
                </template>
                <Popup :show="razorpayPopup" :overlay="true">
                  <div class="ccb-razorpay-popup payment-popup">
                    <div class="ccb-razorpay-popup__title">
                      <Text
                        text="Razorpay Integration"
                        size="m"
                        weight="bold"
                      />
                    </div>
                    <div class="ccb-razorpay-popup__description">
                      <Text
                        text="Read our documentation about getting paid from your website."
                        size="m"
                        weight="regular"
                      />
                      <a
                        href="https://docs.stylemixthemes.com/cost-calculator-builder/payments/razorpay"
                        target="_blank"
                        class="ccb-link"
                        >How to integrate payments</a
                      >
                    </div>
                    <div class="payment-popup__row">
                      <div class="payment-popup__col">
                        <Input
                          name="razorpay_api_key"
                          label="Razorpay Key ID"
                          placeholder="Enter Key ID"
                          @change="updateProperties"
                          v-model="razorpayKeyId"
                        />
                      </div>
                      <div class="payment-popup__col">
                        <Input
                          name="razorpay_secret_key"
                          label="Razorpay Secret Key"
                          placeholder="Enter Secret Key"
                          @change="updateProperties"
                          v-model="razorpaySecretKey"
                        />
                      </div>
                    </div>
                    <div class="payment-popup__row">
                      <div class="payment-popup__col">
                        <Input
                          name="razorpay_currency"
                          label="Currency"
                          placeholder="Enter Currency"
                          @change="updateProperties"
                          v-model="razorpayCurrency"
                        />
                      </div>
                    </div>
                    <div class="payment-popup__footer">
                      <Button
                        label="Delete"
                        size="s"
                        type="red-ghost"
                        style="margin-right: auto"
                        @click="deleteRazorpay"
                      />
                      <Button
                        label="Cancel"
                        size="s"
                        type="default"
                        @click="closeRazorpayPopup"
                      />
                      <Button
                        label="Ok"
                        size="s"
                        type="blue-ghost"
                        @click="saveRazorpay"
                      />
                    </div>
                  </div>
                </Popup>
              </div>
            </div>
            <div class="ccb-card-payments__row">
              <div class="ccb-card-payments__action">
                <Toggle
                  v-model="stripeEnabled"
                  name="stripeEnabled"
                  label="Stripe"
                  @change="updateProperties"
                />
              </div>
              <div class="ccb-card-payments__setup" v-if="stripeEnabled">
                <template v-if="globalStripeStatus">
                  <div class="ccb-payment-integrated">
                    <Text
                      text="Global settings are applied"
                      size="s"
                      weight="regular"
                    />
                    <Tooltip
                      target=".ccb-payment-integrated"
                      placement="top"
                      :max-width="570"
                      :offset="20"
                      :show-default-icon="false"
                      bubble-class="ccb-global-payment-tooltip-bubble"
                    >
                      <template #content>
                        <div class="ccb-global-payment-tooltip">
                          <Text
                            class="ccb-global-payment-tooltip__title"
                            text="Global settings are applied"
                            size="m"
                            weight="bold"
                            :showOriginal="true"
                          />
                          <Text
                            class="ccb-global-payment-tooltip__description"
                            text='Turn off "Apply for all calculators" from Global settings -> Payments'
                            size="xs"
                            weight="bold"
                            :showOriginal="true"
                          />
                          <Button
                            class="ccb-global-payment-tooltip__button"
                            label="Go to Global settings"
                            type="green"
                            size="m"
                            weight="regular"
                            :showOriginal="true"
                            @click="goToSettings"
                          />
                        </div>
                      </template>
                    </Tooltip>
                  </div>
                </template>
                <template v-else>
                  <Text
                    v-if="
                      stripePublishKey.length !== 0 &&
                      stripeSecretKey.length !== 0
                    "
                    class="ccb-card-payments__setup-text integrated"
                    text="Integrated"
                    size="s"
                    weight="regular"
                  />
                  <Text
                    v-else
                    class="ccb-card-payments__setup-text"
                    text="No integrated"
                    size="s"
                    weight="regular"
                  />

                  <Button
                    label="Setup"
                    size="s"
                    type="blue-ghost"
                    @click="setupStripe"
                  />
                </template>

                <Popup :show="stripePopup" :overlay="true">
                  <div class="ccb-stripe-popup payment-popup">
                    <div class="ccb-stripe-popup__title">
                      <Text text="Stripe Integration" size="m" weight="bold" />
                    </div>
                    <div class="ccb-stripe-popup__description">
                      <Text
                        text="Read our documentation about getting paid from your website."
                        size="m"
                        weight="regular"
                      />
                      <a
                        href="https://docs.stylemixthemes.com/cost-calculator-builder/payments/stripe"
                        target="_blank"
                        class="ccb-link"
                        >How to integrate payments</a
                      >
                    </div>
                    <div class="payment-popup__row">
                      <div class="payment-popup__col">
                        <Input
                          name="stripe_publish_key"
                          label="Stripe Publish Key"
                          placeholder="Enter Key ID"
                          @change="updateProperties"
                          v-model="stripePublishKey"
                        />
                      </div>
                      <div class="payment-popup__col">
                        <Input
                          name="stripe_secret_key"
                          label="Stripe Secret Key"
                          placeholder="Enter Secret Key"
                          @change="updateProperties"
                          v-model="stripeSecretKey"
                        />
                      </div>
                    </div>
                    <div class="payment-popup__row">
                      <div class="payment-popup__col">
                        <Input
                          name="stripe_currency"
                          label="Currency"
                          placeholder="Enter Currency"
                          @change="updateProperties"
                          v-model="stripeCurrency"
                        />
                      </div>
                    </div>
                    <div class="payment-popup__footer">
                      <Button
                        label="Delete"
                        size="s"
                        type="red-ghost"
                        style="margin-right: auto"
                        @click="deleteStripe"
                      />
                      <Button
                        label="Cancel"
                        size="s"
                        type="default"
                        @click="closeStripePopup"
                      />
                      <Button
                        label="Ok"
                        size="s"
                        type="blue-ghost"
                        @click="saveStripe"
                      />
                    </div>
                  </div>
                </Popup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Cash Payment" size="m" weight="bold" />
          <Text
            class="ccb-settings__description"
            text="Your client can pay in cash for your service or product"
            size="m"
            weight="regular"
          />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            v-model="cashPaymentEnabled"
            label="Enable Cash Payment"
            @change="updateProperties"
            name="cashPaymentEnabled"
          />
        </div>
      </div>
      <template v-if="cashPaymentEnabled && globalCashPaymentStatus">
        <Notice type="warning">
          <div class="ccb-notice__content">
            <Text text="Global settings applied" size="m" weight="bold" />
            <Text
              text="If you want to set up a specific calculator, please go to Settings → Currency and turn off the setting “Apply for all calculators”"
              size="m"
              weight="regular"
            />
            <Button
              label="Go to Settings"
              type="blue"
              size="m"
              weight="regular"
              @click="goToSettings"
              :showOriginal="true"
            />
          </div>
        </Notice>
      </template>
      <div v-if="cashPaymentEnabled && !globalCashPaymentStatus">
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Input
              name="cash_payment_label"
              label="Cash Payment Label"
              placeholder="Enter Cash Payment Label"
              @change="updateProperties"
              v-model="cashPaymentLabel"
            />
          </div>
          <div class="ccb-settings__col">
            <Input
              name="cash_payment_type"
              label="Information for user"
              placeholder="Enter Information for user"
              @change="updateProperties"
              v-model="cashPaymentType"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Total Fields" size="m" weight="bold" />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <MultiSelect
            :items="totalFields"
            v-model="selectedTotalFields"
            label="Select totals"
            name="selectedTotalFields"
          />
        </div>
      </div>
    </SettingsBlock>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import SettingsBlock from "@/admin/features/settings/SettingsBlock.vue";
import {
  Text,
  Dropdown,
  Toggle,
  Input,
  Button,
  MultiSelect,
  Popup,
  Notice,
  Tooltip,
} from "@/admin/shared/ui/UIKit";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { ISettings } from "@/admin/shared/types/settings.type";
import { toast } from "vue3-toastify";
import { useCommonSettings } from "@/admin/features/settings/sections/composables/useCommonSettings";
import { IFormFields } from "@/admin/shared/types/settings.type";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const builderStore = useBuilderStore();
const settingsStore = useSettingsStore();
const orderFormStore = useOrderFormStore();
const formFields = computed((): IFormFields => {
  return settingsStore.getSettings?.formFields || ({} as IFormFields);
});
const { totalFields, syncFormulas } = useCommonSettings();

const razorpayPopup = ref<boolean>(false);
const stripePopup = ref<boolean>(false);
const razorpayKeyId = ref<string>(
  settingsStore.getSettings?.payment_gateway.cards.card_payments.razorpay
    .keyId || "",
);

const razorpaySecretKey = ref<string>(
  settingsStore.getSettings?.payment_gateway.cards.card_payments.razorpay
    .secretKey || "",
);

const razorpayCurrency = ref<string>(
  settingsStore.getSettings?.payment_gateway.cards.card_payments.razorpay
    .currency || "",
);

let razorpaySnapshot = { keyId: "", secretKey: "", currency: "" };

const openRazorpayPopup = () => {
  razorpaySnapshot = {
    keyId: razorpayKeyId.value,
    secretKey: razorpaySecretKey.value,
    currency: razorpayCurrency.value,
  };
  razorpayPopup.value = true;
};

const closeRazorpayPopup = () => {
  razorpayKeyId.value = razorpaySnapshot.keyId;
  razorpaySecretKey.value = razorpaySnapshot.secretKey;
  razorpayCurrency.value = razorpaySnapshot.currency;

  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;
  settings.payment_gateway.cards.card_payments.razorpay.keyId =
    razorpaySnapshot.keyId;
  settings.payment_gateway.cards.card_payments.razorpay.secretKey =
    razorpaySnapshot.secretKey;
  settings.payment_gateway.cards.card_payments.razorpay.currency =
    razorpaySnapshot.currency;
  settingsStore.setSettings(settings);

  razorpayPopup.value = false;
};

const openFormManager = () => {
  builderStore.setCurrentCalculatorPage("builder");
  builderStore.setBuilderContent("order-form");
};

const saveRazorpay = () => {
  updateProperties("razorpayKeyId", razorpayKeyId.value);
  updateProperties("razorpaySecretKey", razorpaySecretKey.value);
  updateProperties("razorpayCurrency", razorpayCurrency.value);
  razorpayPopup.value = false;
};

const orderFormEnabled = ref<boolean>(formFields.value.accessEmail || false);

const deleteRazorpay = () => {
  razorpayKeyId.value = "";
  razorpaySecretKey.value = "";
  razorpayCurrency.value = "";
  razorpayEnabled.value = false;

  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;
  settings.payment_gateway.cards.card_payments.razorpay.keyId = "";
  settings.payment_gateway.cards.card_payments.razorpay.secretKey = "";
  settings.payment_gateway.cards.card_payments.razorpay.currency = "";
  settings.payment_gateway.cards.card_payments.razorpay.enable = false;
  settingsStore.setSettings(settings);

  razorpayPopup.value = false;
};

let stripeSnapshot = { publishKey: "", secretKey: "", currency: "" };

const setupStripe = () => {
  stripeSnapshot = {
    publishKey: stripePublishKey.value,
    secretKey: stripeSecretKey.value,
    currency: stripeCurrency.value,
  };
  stripePopup.value = true;
};

const stripePublishKey = ref<string>(
  settingsStore.getSettings?.payment_gateway.cards.card_payments.stripe
    .publishKey || "",
);

const stripeSecretKey = ref<string>(
  settingsStore.getSettings?.payment_gateway.cards.card_payments.stripe
    .secretKey || "",
);

const stripeCurrency = ref<string>(
  settingsStore.getSettings?.payment_gateway.cards.card_payments.stripe
    .currency || "",
);

const closeStripePopup = () => {
  stripePublishKey.value = stripeSnapshot.publishKey;
  stripeSecretKey.value = stripeSnapshot.secretKey;
  stripeCurrency.value = stripeSnapshot.currency;

  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;
  settings.payment_gateway.cards.card_payments.stripe.publishKey =
    stripeSnapshot.publishKey;
  settings.payment_gateway.cards.card_payments.stripe.secretKey =
    stripeSnapshot.secretKey;
  settings.payment_gateway.cards.card_payments.stripe.currency =
    stripeSnapshot.currency;
  settingsStore.setSettings(settings);

  stripePopup.value = false;
};

const saveStripe = () => {
  updateProperties("stripePublishKey", stripePublishKey.value);
  updateProperties("stripeSecretKey", stripeSecretKey.value);
  updateProperties("stripeCurrency", stripeCurrency.value);
  stripePopup.value = false;
};

const deleteStripe = () => {
  stripePublishKey.value = "";
  stripeSecretKey.value = "";
  stripeCurrency.value = "";
  stripeEnabled.value = false;

  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;
  settings.payment_gateway.cards.card_payments.stripe.publishKey = "";
  settings.payment_gateway.cards.card_payments.stripe.secretKey = "";
  settings.payment_gateway.cards.card_payments.stripe.currency = "";
  settings.payment_gateway.cards.card_payments.stripe.enable = false;
  settingsStore.setSettings(settings);

  stripePopup.value = false;
};

const copyIPN = () => {
  const ipn = document.querySelector(".ccb-paypal-ipn-setup__url");
  if (ipn) {
    const textarea = document.createElement("textarea");
    textarea.value = ipn.textContent ?? "";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    toast.success("IPN copied to clipboard");
  }
};

const paypalIntegrationTypes = ref<Array<{ label: string; value: string }>>([
  { label: "PayPal Legacy", value: "legacy" },
  { label: "PayPal REST API", value: "rest" },
]);

const paypalCurrencyCodes = ref<Array<{ label: string; value: string }>>([
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
  { label: "JPY", value: "JPY" },
  { label: "AUD", value: "AUD" },
  { label: "CAD", value: "CAD" },
  { label: "CHF", value: "CHF" },
]);

const paypalModes = ref<Array<{ label: string; value: string }>>([
  { label: "Sandbox", value: "sandbox" },
  { label: "Live", value: "live" },
]);

const paypalEnabled = ref<boolean>(
  settingsStore.getSettings?.payment_gateway.paypal.enable || false,
);

const selectedPaymentsForm = ref<string>(
  settingsStore.getSettings?.formFields.applyFormId || "",
);

const selectedTotalFields = computed({
  get() {
    const saved = (
      settingsStore.getSettings?.payment_gateway.formulas || []
    ).map((f: any) =>
      typeof f === "string" ? { idx: 0, title: f, alias: f } : f,
    );
    const synced = syncFormulas(saved);
    return synced.map((f) => f.alias);
  },

  set(value: string[]) {
    const available = totalFields.value;
    const matched = available.filter((t) => value.includes(t.alias));

    const settings = JSON.parse(
      JSON.stringify(settingsStore.getSettings),
    ) as ISettings;

    if (settings?.payment_gateway) {
      settings.payment_gateway.formulas = matched.map((t) => ({
        idx: t.idx,
        alias: t.alias,
        title: t.title,
      }));
      settingsStore.setSettings(settings);
    }
  },
});

watch(
  selectedTotalFields,
  (aliases) => {
    const stored = (
      settingsStore.getSettings?.payment_gateway.formulas || []
    ).map((f: any) => (typeof f === "string" ? f : f?.alias));
    const isSame =
      stored.length === aliases.length &&
      aliases.every((a, i) => a === stored[i]);
    if (!isSame) {
      selectedTotalFields.value = aliases;
    }
  },
  { immediate: true },
);

const paymentsForm = computed(() =>
  orderFormStore.getForms.map((form) => ({
    label: form.name,
    value: String(form.id),
  })),
);

const paypalIntegrationType = ref<string>(
  settingsStore.getSettings?.payment_gateway.paypal.integration_type ||
    "legacy",
);

const paypalEmail = ref<string>(
  settingsStore.getSettings?.payment_gateway.paypal.paypal_email || "",
);

const paypalCurrencyCode = ref<string>(
  settingsStore.getSettings?.payment_gateway.paypal.currency_code || "",
);

const paypalClientId = ref<string>(
  settingsStore.getSettings?.payment_gateway.paypal.client_id || "",
);

const paypalClientSecret = ref<string>(
  settingsStore.getSettings?.payment_gateway.paypal.client_secret || "",
);

const paypalMode = ref<string>(
  settingsStore.getSettings?.payment_gateway.paypal.paypal_mode || "",
);

const cashPaymentEnabled = ref<boolean>(
  settingsStore.getSettings?.payment_gateway.cash_payment.enable || false,
);

const cashPaymentLabel = ref<string>(
  settingsStore.getSettings?.payment_gateway.cash_payment.label || "",
);

const cashPaymentType = ref<string>(
  settingsStore.getSettings?.payment_gateway.cash_payment.type || "",
);

const stripeEnabled = ref<boolean>(
  settingsStore.getSettings?.payment_gateway.cards.card_payments.stripe
    .enable || false,
);

const razorpayEnabled = ref<boolean>(
  settingsStore.getSettings?.payment_gateway.cards.card_payments.razorpay
    .enable || false,
);

const siteUrl = ref<string>(window.location.origin);

const updateProperties = (name: string, value: string | boolean | number) => {
  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;

  if (name === "paypalEnabled") {
    settings.payment_gateway.paypal.enable = value as boolean;
    paypalEnabled.value = value as boolean;
  }

  if (name === "paymentsForm") {
    settings.formFields.applyFormId = value as unknown as string;
    selectedPaymentsForm.value = value as unknown as string;
  }

  if (name === "selectedTotalFields") {
    settings.formFields.formulas = value as unknown as string[];
    selectedTotalFields.value = value as unknown as string[];
  }

  if (name === "paypalIntegrationType") {
    settings.payment_gateway.paypal.integration_type = value as string;
    paypalIntegrationType.value = value as string;
  }

  if (name === "paypal_email") {
    settings.payment_gateway.paypal.paypal_email = value as string;
    paypalEmail.value = value as string;
  }

  if (name === "currency_code") {
    settings.payment_gateway.paypal.currency_code = value as string;
    paypalCurrencyCode.value = value as string;
  }

  if (name === "client_id") {
    settings.payment_gateway.paypal.client_id = value as string;
    paypalClientId.value = value as string;
  }

  if (name === "client_secret") {
    settings.payment_gateway.paypal.client_secret = value as string;
    paypalClientSecret.value = value as string;
  }

  if (name === "paypal_mode") {
    settings.payment_gateway.paypal.paypal_mode = value as string;
    paypalMode.value = value as string;
  }

  if (name === "cashPaymentEnabled") {
    settings.payment_gateway.cash_payment.enable = value as boolean;
    cashPaymentEnabled.value = value as boolean;
  }

  if (name === "cash_payment_label") {
    settings.payment_gateway.cash_payment.label = value as string;
    cashPaymentLabel.value = value as string;
  }

  if (name === "cash_payment_type") {
    settings.payment_gateway.cash_payment.type = value as string;
    cashPaymentType.value = value as string;
  }

  if (name === "stripeEnabled") {
    settings.payment_gateway.cards.card_payments.stripe.enable =
      value as boolean;
    stripeEnabled.value = value as boolean;
  }

  if (name === "razorpayEnabled") {
    settings.payment_gateway.cards.card_payments.razorpay.enable =
      value as boolean;
    razorpayEnabled.value = value as boolean;
  }

  if (name === "razorpayKeyId") {
    settings.payment_gateway.cards.card_payments.razorpay.keyId =
      value as string;
    razorpayKeyId.value = value as string;
  }

  if (name === "razorpaySecretKey") {
    settings.payment_gateway.cards.card_payments.razorpay.secretKey =
      value as string;
    razorpaySecretKey.value = value as string;
  }

  if (name === "razorpayCurrency") {
    settings.payment_gateway.cards.card_payments.razorpay.currency =
      value as string;
    razorpayCurrency.value = value as string;
  }

  if (name === "stripePublishKey") {
    settings.payment_gateway.cards.card_payments.stripe.publishKey =
      value as string;
    stripePublishKey.value = value as string;
  }

  if (name === "stripeSecretKey") {
    settings.payment_gateway.cards.card_payments.stripe.secretKey =
      value as string;
    stripeSecretKey.value = value as string;
  }

  if (name === "stripeCurrency") {
    settings.payment_gateway.cards.card_payments.stripe.currency =
      value as string;
    stripeCurrency.value = value as string;
  }

  settingsStore.setSettings(settings);
};

const globalPaymentsStatus = computed(() => {
  return (
    settingsStore.getGeneralSettings?.payment_gateway.cards.use_in_all || false
  );
});

const globalPaypalStatus = computed(() => {
  return (
    settingsStore.getGeneralSettings?.payment_gateway.paypal.use_in_all || false
  );
});

const globalStripeStatus = computed(() => {
  return (
    (globalPaymentsStatus.value &&
      settingsStore.getGeneralSettings?.payment_gateway.cards.card_payments
        .stripe.enable) ||
    false
  );
});

const globalRazorpayStatus = computed(() => {
  return (
    (globalPaymentsStatus.value &&
      settingsStore.getGeneralSettings?.payment_gateway.cards.card_payments
        .razorpay.enable) ||
    false
  );
});

const globalCashPaymentStatus = computed(() => {
  return (
    (globalPaymentsStatus.value &&
      settingsStore.getGeneralSettings?.payment_gateway.cash_payment
        .use_in_all) ||
    false
  );
});

const goToSettings = () => {
  window.location.href = "admin.php?page=cost_calculator_builder_settings";
};
</script>

<style lang="scss">
.ccb-settings-section {
  .ccb-settings__row {
    .ccb-settings__col {
      .ccb-settings__description {
        color: var(--ccb-font-comment);
      }
    }
  }
}

.ccb-paypal-ipn-setup {
  display: flex;
  flex-direction: row;
  flex-direction: column;
  padding: 8px 16px;
  width: 100%;
  background-color: var(--ccb-input-normal);
  transition: var(--ccb-transition-normal);
  border-radius: 12px;

  &__title {
    color: var(--ccb-font-comment);
  }

  &__copy {
    position: absolute;
    right: -4px;
    top: -18px;
  }

  &__wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }
}

.ccb-card-payments {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    gap: 10px;
  }

  &__info {
    margin-left: auto;
  }

  &__setup {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;

    .ccb-payment-integrated {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      border-radius: 999px;
      background-color: var(--ccb-green-bg-dull-normal);
      color: var(--ccb-green-fg-normal);
      cursor: help;

      .ccb-text {
        color: inherit;
        font-weight: 700;
      }

      &__check {
        width: 18px;
        height: 10px;
        border-left: 3px solid currentColor;
        border-bottom: 3px solid currentColor;
        transform: rotate(-45deg) translateY(-2px);
      }
    }
  }
}

.ccb-global-payment-tooltip-bubble {
  background: var(--ccb-payment-tooltip-bg, #001f3a);
  border-radius: 6px;
  padding: 0;

  .ccb-tooltip__arrow {
    background: var(--ccb-payment-tooltip-bg, #001f3a);
  }
}

.ccb-global-payment-tooltip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  box-sizing: border-box;

  padding: 20px;
  color: var(--ccb-button-w-normal);

  &__title {
    color: var(--ccb-button-w-normal);
  }

  &__description {
    max-width: 460px;
    color: rgba(255, 255, 255, 0.74);
    line-height: 1.55;
    margin-bottom: 10px;
  }

  &__button {
    min-width: 325px;
    height: 80px;
    border-radius: 8px;
  }
}

.payment-popup {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__title {
    color: var(--ccb-font-heads);
  }

  &__description {
    color: var(--ccb-font-text);
  }

  &__row {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
  }

  &__col {
    width: 100%;
  }

  &__footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding-top: 16px;
  }
}

.ccb-notice__content {
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 90%;
}
</style>
