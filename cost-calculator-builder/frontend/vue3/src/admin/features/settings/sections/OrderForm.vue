<template>
  <div class="ccb-settings-section">
    <Notice type="warning" v-if="orderFormGlobalSettingsApplied">
      <div class="ccb-notice__content">
        <Text text="Global settings applied" size="m" weight="bold" />
        <Text
          text="If you want to set up a specific calculator, please go to Settings → Email and turn off the setting “Apply for all calculators”"
          size="m"
          weight="regular"
          :showOriginal="true"
        />
        <Button
          label="Go to Global Settings"
          type="blue"
          size="m"
          weight="regular"
          @click="goToGlobalSettings"
          :showOriginal="true"
        />
      </div>
    </Notice>
    <SettingsBlock :disabled="orderFormGlobalSettingsApplied">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Order Notification Email" size="m" weight="bold" />
          <Text
            text="Set up email notifications for incoming orders. Works across Contact Form submissions and Payment Methods."
            size="m"
            weight="regular"
            class="ccb-settings__description"
          />
        </div>
      </div>
      <div v-if="hasError('emailSubject')" class="ccb-settings__row">
        <div class="ccb-settings__col" style="width: 100%">
          <Notice type="error">
            <Text
              text="Email Subject is a required field."
              size="m"
              weight="regular"
            />
          </Notice>
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Input
            v-model="emailSubject"
            label="Subject"
            placeholder="Enter subject"
            :required="true"
            name="emailSubject"
            @change="updateProperties"
          />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Checkbox
            v-model="orderNotificationEmailSubject"
            :options="orderNotificationEmailSubjectOptions"
            template="rows"
            name="order_id_in_subject"
            @change="updateProperties"
          />
        </div>
      </div>
      <div v-if="hasError('adminEmailAddress')" class="ccb-settings__row">
        <div class="ccb-settings__col" style="width: 100%">
          <Notice type="error">
            <Text
              text="Main email address is required."
              size="m"
              weight="regular"
            />
          </Notice>
        </div>
      </div>
      <div
        v-if="hasError('adminEmailAddressInvalid')"
        class="ccb-settings__row"
      >
        <div class="ccb-settings__col" style="width: 100%">
          <Notice type="error">
            <Text
              text="Main email address is not valid."
              size="m"
              weight="regular"
            />
          </Notice>
        </div>
      </div>
      <div class="ccb-settings__row" style="margin: 4px 0">
        <div class="ccb-settings__col" style="width: 100%">
          <div class="ccb-repeater">
            <div class="ccb-repeater__header">
              <Text
                text="Send Email to"
                size="s"
                weight="medium"
                class="ccb-repeater__label"
              />
              <span class="ccb-repeater__required">*</span>
            </div>
            <div class="ccb-repeater__list">
              <div class="ccb-repeater__row">
                <div
                  class="ccb-repeater__grid"
                  style="grid-template-columns: 1fr 1fr"
                >
                  <div class="ccb-repeater__field">
                    <input
                      class="ccb-repeater__input"
                      placeholder="Enter your email"
                      v-model="adminEmailAddress"
                      @input="
                        updateProperties('adminEmailAddress', adminEmailAddress)
                      "
                    />
                    <span class="ccb-repeater__input-separator"></span>
                  </div>
                  <div class="ccb-repeater__field">
                    <input
                      class="ccb-repeater__input ccb-repeater__input--disabled"
                      placeholder="Main email"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col" style="width: 100%">
          <Repeater
            v-model="additionalEmails"
            :schema="additionalEmailsSchema"
            :minRows="0"
            :maxRows="3"
            @change="updateAdditionalEmails"
            name="emailOptions"
          />
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            v-model="orderFormEnabled"
            name="accessEmail"
            label="Enable Contact Form"
            @change="updateProperties"
          />
        </div>
        <div
          class="ccb-settings__col"
          v-if="orderFormEnabled && orderFormProvider === 'cost-calculator'"
          style="display: flex; justify-content: flex-end"
        >
          <Button
            label="Contact Form Manager"
            size="m"
            type="green-ghost"
            iconRight="ccb-icon-ic_next"
            @click="openOrderFormManager"
          />
        </div>
      </div>
      <div v-if="orderFormEnabled">
        <div v-if="hasError('applyFormId')" class="ccb-settings__row">
          <div class="ccb-settings__col" style="width: 100%">
            <Notice type="error">
              <Text text="Please select a form." size="m" weight="regular" />
            </Notice>
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Dropdown
              label="Form Provider"
              :items="formTypes"
              v-model="orderFormProvider"
              name="formType"
              @change="updateProperties"
            />
          </div>
          <div class="ccb-settings__col">
            <Dropdown
              label="Forms"
              :items="orderFormList"
              v-model="selectedForm"
              name="applyFormId"
              @change="updateProperties"
              v-if="orderFormProvider === 'cost-calculator'"
            />
            <Dropdown
              label="Contact Form7 Forms"
              :items="contactFormList"
              v-model="selectedContactForm"
              name="contactFormId"
              @change="updateProperties"
              v-if="orderFormProvider === 'contact-form'"
            />
          </div>
        </div>
        <div
          v-if="hasError('openModalBtnText') || hasError('submitBtnText')"
          class="ccb-settings__row"
        >
          <div class="ccb-settings__col" style="width: 100%">
            <Notice type="error">
              <Text
                text="Open Form Button Text and Submit Button Text are required fields."
                size="m"
                weight="regular"
              />
            </Notice>
          </div>
        </div>
        <div
          class="ccb-settings__row"
          :class="{
            'ccb-settings__row-disabled': orderFormGlobalSettingsApplied,
          }"
          v-if="orderFormProvider === 'cost-calculator'"
        >
          <div class="ccb-settings__col">
            <Input
              v-model="openButtonText"
              label="Open Form Button Text"
              placeholder="Make Purchase"
              :required="true"
              name="openModalBtnText"
              @change="updateProperties"
            />
          </div>
          <div class="ccb-settings__col">
            <Input
              v-model="submitButtonText"
              label="Submit Button Text"
              placeholder="Submit"
              :required="true"
              name="submitBtnText"
              @change="updateProperties"
            />
          </div>
        </div>

        <div
          class="ccb-settings__row"
          v-if="orderFormProvider === 'contact-form'"
        >
          <div class="ccb-settings__col">
            <Textarea
              v-model="contactFormBody"
              label="Contact Form Content"
              placeholder="Enter content"
              name="body"
              @change="updateProperties"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock v-if="orderFormEnabled">
      <div class="ccb-settings__row" style="align-items: flex-start">
        <div class="ccb-settings__col" style="width: 100%">
          <Toggle
            v-model="orderSummaryDisplayEnabled"
            label="Show Summary After Contact Info Submission"
            name="orderSummaryDisplayEnabled"
            @change="updateProperties"
          />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Notice
            type="warning"
            v-if="
              orderSummaryDisplayEnabledGlobal && orderFormGlobalSettingsApplied
            "
          >
            <div class="ccb-notice__content">
              <Text text="Global settings applied" size="m" weight="bold" />
              <Text
                text="If you want to set up a specific calculator, please go to Settings → Email and turn off the setting “Apply for all calculators”"
                size="m"
                weight="regular"
                :showOriginal="true"
              />
              <Button
                label="Go to Global Settings"
                type="blue"
                size="m"
                weight="regular"
                @click="goToGlobalSettings"
                :showOriginal="true"
              />
            </div>
          </Notice>
        </div>
      </div>
      <div v-if="orderSummaryDisplayEnabled">
        <div
          class="ccb-settings__row"
          :class="{
            'ccb-settings__row-disabled':
              orderSummaryDisplayEnabledGlobal &&
              orderFormGlobalSettingsApplied,
          }"
        >
          <div class="ccb-settings__col" style="width: 100%">
            <Input
              v-model="orderSummaryFormTitle"
              label="Contact info form title"
              placeholder="You will get a quote and invoice after submitting the form"
              :required="true"
              name="orderSummaryFormTitle"
              @change="updateProperties"
            />
          </div>
        </div>
        <div
          class="ccb-settings__row"
          :class="{
            'ccb-settings__row-disabled':
              orderSummaryDisplayEnabledGlobal &&
              orderFormGlobalSettingsApplied,
          }"
        >
          <div class="ccb-settings__col" style="width: 100%">
            <Input
              v-model="orderSummarySubmitButtonText"
              label="Submit Button Text"
              placeholder="Submit"
              :required="true"
              name="orderSummarySubmitButtonText"
              @change="updateProperties"
            />
          </div>
        </div>
        <div
          class="ccb-settings__row"
          style="margin-top: 12px"
          :class="{
            'ccb-settings__row-disabled':
              orderSummaryDisplayEnabledGlobal &&
              orderFormGlobalSettingsApplied,
          }"
        >
          <div class="ccb-settings__col" style="width: 100%">
            <Radio
              v-model="orderSummaryActionAfterSubmit"
              :options="orderSummaryActionAfterSubmitOptions"
              label="Action options after the form submission"
              name="orderSummaryActionAfterSubmit"
              @change="updateProperties"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock v-if="orderFormEnabled">
      <div class="ccb-settings__row" style="align-items: flex-start">
        <div class="ccb-settings__col" style="width: 100%">
          <Toggle
            v-model="orderTermsEnabled"
            label="Enable Terms & Conditions Agreement"
            name="orderTermsEnabled"
            @change="updateProperties"
          />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Notice
            type="warning"
            v-if="orderTermsEnabledGlobal && orderFormGlobalSettingsApplied"
          >
            <div class="ccb-notice__content">
              <Text text="Global settings applied" size="m" weight="bold" />
              <Text
                text="If you want to set up a specific calculator, please go to Settings → Email and turn off the setting “Apply for all calculators”"
                size="m"
                weight="regular"
                :showOriginal="true"
              />
              <Button
                label="Go to Global Settings"
                type="blue"
                size="m"
                weight="regular"
                @click="goToGlobalSettings"
                :showOriginal="true"
              />
            </div>
          </Notice>
        </div>
      </div>
      <div v-if="orderTermsEnabled" style="margin-top: 12px">
        <div
          class="ccb-settings__row"
          :class="{
            'ccb-settings__row-disabled':
              orderTermsEnabledGlobal && orderFormGlobalSettingsApplied,
          }"
        >
          <div class="ccb-settings__col">
            <Input
              v-model="orderTermsLabel"
              label="Checkbox Label"
              placeholder="By clicking this box, I agree to your"
              :required="true"
              :maxlength="25"
              name="orderTermsLabel"
              @change="updateProperties"
            />
          </div>
        </div>
        <div
          class="ccb-settings__row"
          style="align-items: end"
          :class="{
            'ccb-settings__row-disabled':
              orderTermsEnabledGlobal && orderFormGlobalSettingsApplied,
          }"
        >
          <div class="ccb-settings__col" style="flex: 1">
            <PaginatedSelect
              v-model="orderTermsLinkedPage"
              :items="wpPageItems"
              :has-more="wpPagesHasMore"
              :loading="wpPagesLoading"
              :multiselect="false"
              :selected-label="wpSelectedPageLabel"
              label="Choose Page to Link"
              placeholder="Select page"
              empty-message="No pages found"
              name="orderTermsLinkedPage"
              @search="onWpPageSearch"
              @load-more="onWpPageLoadMore"
              @limit-change="onWpPageLimitChange"
              @change="onWpPageChange"
            />
          </div>
          <div class="ccb-settings__col" style="flex: 1; margin-left: 16px">
            <Input
              label="Linked Page Title"
              v-model="orderTermsLinkedPageTitle"
              placeholder="Enter title"
              :maxlength="10"
              style="margin-top: 4px"
              name="orderTermsLinkedPageTitle"
              @change="updateProperties"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock v-if="orderFormEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            v-model="orderRecaptchaEnabled"
            label="Google reCAPTCHA to Prevent Bots"
            name="orderRecaptcha"
            @change="updateProperties"
          />
        </div>
      </div>
      <div
        class="ccb-settings__row"
        v-if="orderRecaptchaEnabled && recaptchaEnabled"
      >
        <div class="ccb-settings__col">
          <Notice type="success">
            <Text
              text="Captcha key has been applied from Global settings."
              size="m"
              weight="regular"
            />
            <Button
              type="green-ghost"
              size="m"
              label="Set Up Captcha"
              @click="openRecaptchaSettings"
            />
          </Notice>
        </div>
      </div>

      <div
        class="ccb-settings__row"
        v-if="orderRecaptchaEnabled && !recaptchaEnabled"
      >
        <div class="ccb-settings__col">
          <Notice type="warning">
            <Text
              text="Requires a reCAPTCHA key in Global Settings to work"
              size="m"
              weight="regular"
            />
            <Button
              type="yellow-ghost"
              size="m"
              label="Add Captcha key"
              @click="openRecaptchaSettings"
            />
          </Notice>
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock v-if="orderFormEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Total Field Element" size="l" weight="bold" />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <MultiSelect
            :items="totalFields"
            v-model="orderTotalFields"
            label="Total Field Element"
            placeholder="Select totals"
            name="orderTotalFields"
            @change="updateProperties"
          />
        </div>
      </div>
    </SettingsBlock>

    <SettingsBlock v-if="orderFormEnabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            v-model="orderPaymentGatewaysEnabled"
            label="Payment Gateways"
            name="paymentGatewaysEnabled"
            @change="updateProperties"
          />
        </div>
      </div>
      <div v-if="orderPaymentGatewaysEnabled">
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Checkbox
              v-model="orderPaymentGateways"
              :options="orderPaymentGatewaysOptions"
              label="Payment Gateways"
              template="rows"
              name="paymentGateways"
              @change="updateProperties"
            />
          </div>
        </div>
      </div>
    </SettingsBlock>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import axios from "axios";
import SettingsBlock from "@/admin/features/settings/SettingsBlock.vue";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { ISettings } from "@/admin/shared/types/settings.type";
import { useCommonSettings } from "@/admin/features/settings/sections/composables/useCommonSettings";
import { IFormFields } from "@/admin/shared/types/settings.type";

import {
  Toggle,
  Button,
  Dropdown,
  Input,
  Text,
  Radio,
  Checkbox,
  Notice,
  Repeater,
  MultiSelect,
  Textarea,
  PaginatedSelect,
} from "@/admin/shared/ui/UIKit";
import type {
  ICheckboxOption,
  IPaginatedSelectItem,
  IRadioOption,
} from "@/admin/shared/types/uikit.type";

import {
  formTypes,
  additionalEmailsSchema,
  contactFormList,
} from "@/admin/features/settings/sections/consts/settings.consts";
import { IGeneralSettings } from "@/admin/shared/types/general-settings.type";

const settingsStore = useSettingsStore();
const builderStore = useBuilderStore();
const orderFormStore = useOrderFormStore();
const { totalFields, syncFormulas } = useCommonSettings();

const orderFormList = computed(() =>
  orderFormStore.getForms.map((form) => ({
    label: form.name,
    value: String(form.id),
  })),
);

const globalSettings = computed((): IGeneralSettings => {
  return settingsStore.getGeneralSettings || ({} as IGeneralSettings);
});

const pdfDisabled = computed((): boolean => {
  return !globalSettings.value.invoice?.use_in_all;
});

const orderSummaryActionAfterSubmitOptions = computed<IRadioOption[]>(() => [
  {
    label: "Send a quote and invoice to customer's email",
    value: "send_to_email",
  },
  { label: "Show calculations on Summary block", value: "show_summary_block" },
  {
    label:
      "Show calculations on Summary block with buttons to Download PDF and Share Quotes",
    value: "show_summary_block_with_pdf",
    disable: pdfDisabled.value,
  },
]);

const recaptchaEnabled = computed((): boolean => {
  const recaptcha = globalSettings.value.recaptcha;
  if (!recaptcha || !recaptcha.type) return false;

  if (recaptcha.type === "v2") {
    return !!recaptcha.v2?.siteKey;
  }

  if (recaptcha.type === "v3") {
    return !!recaptcha.v3?.siteKey;
  }

  return false;
});

const openRecaptchaSettings = (): void => {
  const href = `${window.location.origin}/wp-admin/admin.php?page=cost_calculator_builder_settings&option=captcha`;
  window.open(href, "_blank");
};

const goToGlobalSettings = (): void => {
  const href = `${window.location.origin}/wp-admin/admin.php?page=cost_calculator_builder_settings&option=email`;
  window.open(href);
};

const formFields = computed((): IFormFields => {
  return settingsStore.getSettings?.formFields || ({} as IFormFields);
});

const orderFormEnabled = ref<boolean>(formFields.value.accessEmail || false);
const orderFormProvider = ref<string>(formFields.value.formType || "");
const selectedForm = ref<string>(formFields.value.applyFormId || "");
const selectedContactForm = ref<string>(formFields.value.contactFormId || "");

if (
  selectedForm.value &&
  orderFormList.value.length > 0 &&
  !orderFormList.value.some((item) => item.value === selectedForm.value)
) {
  selectedForm.value = String(orderFormList.value[0].value);
}

const openButtonText = ref<string>(formFields.value.openModalBtnText || "");
const submitButtonText = ref<string>(formFields.value.submitBtnText || "");
const emailSubject = ref<string>(formFields.value.emailSubject || "");

const orderNotificationEmailSubject = ref<boolean>(
  formFields.value.order_id_in_subject || false,
);

const orderNotificationEmailSubjectOptions = ref<ICheckboxOption[]>([
  { label: "Add Order ID to Subject", value: true },
]);

const adminEmailAddress = ref<string>(formFields.value.adminEmailAddress || "");

const settings = computed(() => settingsStore.getSettings);

type EmailOption = { adminEmailAddress: string; emailDescription: string };

const normalizeEmailOptions = (raw: unknown): EmailOption[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") return Object.values(raw);
  return [];
};

const additionalEmails = ref<EmailOption[]>(
  normalizeEmailOptions(settings.value?.emailOptions),
);

const syncCustomEmailAddresses = (): void => {
  const allEmails = additionalEmails.value
    .map((opt) => opt.adminEmailAddress)
    .filter((e) => e?.trim());

  const s = JSON.parse(JSON.stringify(settingsStore.getSettings)) as ISettings;
  s.formFields.customEmailAddresses = allEmails.map((email) => ({
    email,
    description: "",
  }));
  s.emailOptions = additionalEmails.value as unknown as string[];
  settingsStore.setSettings(s);
};

const updateAdditionalEmails = (): void => {
  syncCustomEmailAddresses();
};

const contactFormBody = ref<string>(formFields.value.body || "");

const orderSummaryDisplayEnabled = ref<boolean>(
  formFields.value.summary_display.enable || false,
);

const orderSummaryFormTitle = ref<string>(
  formFields.value.summary_display.form_title || "",
);

const orderSummarySubmitButtonText = ref<string>(
  formFields.value.summary_display.submit_btn_text || "",
);

const orderSummaryActionAfterSubmit = ref<string>(
  formFields.value.summary_display.action_after_submit || "",
);

const orderTermsEnabled = ref<boolean>(
  formFields.value.accessTermsEmail || false,
);

const orderTermsLabel = ref<string>(
  formFields.value.terms_and_conditions.text || "",
);

const orderTermsLinkedPage = ref<number>(
  formFields.value.terms_and_conditions.page_id || 0,
);

interface WpPageRaw {
  id: number;
  title: string;
  link: string;
  tooltip?: string;
}

const wpPagesRaw = ref<WpPageRaw[]>([]);
const wpPagesLoading = ref(false);
const wpPagesHasMore = ref(false);
const wpPageSearch = ref("");
const wpPageLimit = ref(5);
const wpPagePage = ref(1);
const wpPagesFetched = ref(false);

const fetchWpPages = async (reset = false): Promise<void> => {
  wpPagesLoading.value = true;
  if (reset) {
    wpPagePage.value = 1;
    wpPagesRaw.value = [];
  }

  try {
    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
    const response = await axios.get(ajaxUrl, {
      params: {
        action: "calc_get_wp_pages",
        nonce: (window as any).ccb_nonces?.calc_load_pages || "",
        page: wpPagePage.value,
        per_page: wpPageLimit.value,
        search: wpPageSearch.value,
        page_ids: orderTermsLinkedPage.value
          ? String(orderTermsLinkedPage.value)
          : "",
      },
    });

    if (response.data?.success) {
      const pages: WpPageRaw[] = response.data.pages || [];
      if (reset || wpPagePage.value === 1) {
        wpPagesRaw.value = pages;
      } else {
        const existingIds = new Set(wpPagesRaw.value.map((p) => p.id));
        const newPages = pages.filter((p) => !existingIds.has(p.id));
        wpPagesRaw.value = [...wpPagesRaw.value, ...newPages];
      }
      wpPagesHasMore.value = !!response.data.has_more;
      initWpPageLabel();
    }
    wpPagesFetched.value = true;
  } catch {
    wpPagesRaw.value = [];
    wpPagesHasMore.value = false;
  } finally {
    wpPagesLoading.value = false;
  }
};

const wpPageItems = computed((): IPaginatedSelectItem[] => {
  if (!wpPagesFetched.value && !wpPagesLoading.value) {
    fetchWpPages();
  }
  return wpPagesRaw.value.map((p) => ({
    id: p.id,
    label: p.tooltip || p.title,
  }));
});

const onWpPageSearch = (query: string): void => {
  wpPageSearch.value = query;
  fetchWpPages(true);
};

const onWpPageLoadMore = (): void => {
  wpPagePage.value += 1;
  fetchWpPages();
};

const onWpPageLimitChange = (newLimit: number): void => {
  wpPageLimit.value = newLimit;
  fetchWpPages(true);
};

const wpSelectedPageLabel = ref("");

const initWpPageLabel = (): void => {
  const found = wpPagesRaw.value.find(
    (p) => p.id === orderTermsLinkedPage.value,
  );
  if (found && !wpSelectedPageLabel.value) {
    wpSelectedPageLabel.value = found.tooltip || found.title;
  }
};

const onWpPageChange = (name: string, value: any): void => {
  const found = wpPagesRaw.value.find((p) => p.id === value);
  wpSelectedPageLabel.value = found ? found.tooltip || found.title : "";
  updateProperties(name, value);
  updateProperties("orderTermsLinkedPageLink", found ? found.link : "");
};

const orderTermsLinkedPageLink = ref<string>(
  formFields.value.terms_and_conditions.link || "",
);

const orderTermsLinkedPageTitle = ref<string>(
  formFields.value.terms_and_conditions.link_text || "",
);

const orderRecaptchaEnabled = ref<boolean>(
  settingsStore.getSettings?.recaptcha?.enable || false,
);

const orderTotalFields = computed({
  get() {
    const saved = (formFields.value.formulas || []).map((f: any) =>
      typeof f === "string" ? { idx: 0, title: f, alias: f } : f,
    );
    const synced = syncFormulas(saved);
    return synced.map((f) => f.alias);
  },
  set(value: string[]) {
    const available = totalFields.value;
    const matched = available.filter((t) => value.includes(t.alias));

    const s = JSON.parse(
      JSON.stringify(settingsStore.getSettings),
    ) as ISettings;
    s.formFields.formulas = matched.map((t) => t.alias) as unknown as string[];
    s.formFields.formulas_list = matched.map((t) => t.alias);
    settingsStore.setSettings(s);
  },
});

watch(
  orderTotalFields,
  (aliases) => {
    const stored = (formFields.value.formulas || []).map((f: any) =>
      typeof f === "string" ? f : f?.alias,
    );
    const isSame =
      stored.length === aliases.length &&
      aliases.every((a, i) => a === stored[i]);
    if (!isSame) {
      orderTotalFields.value = aliases;
    }
  },
  { immediate: true },
);

const orderPaymentGatewaysEnabled = ref<boolean>(
  formFields.value.payment || false,
);

const orderPaymentGateways = ref<Array<string | number | boolean>>(
  formFields.value.paymentMethods || [],
);

interface PaymentGatewayDef {
  slug: string;
  name: string;
  requiredSettingFields: string[];
}

const paymentGatewayDefs: PaymentGatewayDef[] = [
  { slug: "paypal", name: "PayPal", requiredSettingFields: [] },
  {
    slug: "stripe",
    name: "Stripe",
    requiredSettingFields: ["secretKey", "publishKey"],
  },
  {
    slug: "razorpay",
    name: "Razorpay",
    requiredSettingFields: ["keyId", "secretKey"],
  },
  {
    slug: "woo_checkout",
    name: "Woo Checkout",
    requiredSettingFields: ["product_id"],
  },
  { slug: "cash_payment", name: "Cash Payment", requiredSettingFields: [] },
];

const getPaymentSettingsForSlug = (
  slug: string,
): Record<string, any> | null => {
  const s = settingsStore.getSettings;
  const gs = settingsStore.getGeneralSettings;
  if (!s) return null;

  if (slug === "paypal") {
    const data = { ...s.payment_gateway?.paypal };
    if (data.enable && gs?.payment_gateway?.paypal) {
      return { ...gs.payment_gateway.paypal, enable: data.enable };
    }
    return data;
  }

  if (slug === "woo_checkout") {
    return s.woo_checkout as unknown as Record<string, any>;
  }

  if (slug === "cash_payment") {
    return s.payment_gateway?.cash_payment as unknown as Record<string, any>;
  }

  const cardPayments = s.payment_gateway?.cards?.card_payments;
  if (slug === "stripe" || slug === "razorpay") {
    const card = cardPayments?.[slug];
    if (!card) return null;
    const gsCard =
      gs?.payment_gateway?.cards?.card_payments?.[
        slug as "stripe" | "razorpay"
      ];
    if (card.enable && gsCard?.enable) {
      return { ...gsCard, enable: card.enable };
    }
    return card as unknown as Record<string, any>;
  }

  return null;
};

const orderPaymentGatewaysOptions = computed((): ICheckboxOption[] => {
  const enabledSlugs: string[] = [];

  const options = paymentGatewayDefs.map((gw) => {
    const ps = getPaymentSettingsForSlug(gw.slug);
    let isDisabled = true;

    if (ps?.enable) {
      if (gw.requiredSettingFields.length === 0) {
        isDisabled = false;
      } else {
        const hasAllKeys = gw.requiredSettingFields.some(
          (field) => !!ps[field],
        );
        if (hasAllKeys) isDisabled = false;
      }
    }

    if (!isDisabled) enabledSlugs.push(gw.slug);

    return {
      label: gw.name,
      value: gw.slug,
      disabled: isDisabled,
    };
  });

  const cleaned = orderPaymentGateways.value.filter((v) =>
    enabledSlugs.includes(String(v)),
  );
  if (cleaned.length !== orderPaymentGateways.value.length) {
    orderPaymentGateways.value = cleaned;

    const s = JSON.parse(
      JSON.stringify(settingsStore.getSettings),
    ) as ISettings;
    s.formFields.paymentMethods = cleaned as unknown as string[];
    settingsStore.setSettings(s);
  }

  return options;
});

const validationTriggered = computed(
  () => settingsStore.getOrderFormValidationTriggered,
);

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isAdminEmailInvalid = computed(() => {
  const email = adminEmailAddress.value?.trim() || "";

  return Boolean(email) && !isValidEmail(email);
});

const fieldErrors = computed((): Record<string, boolean> => {
  if (!validationTriggered.value || !orderFormEnabled.value) {
    return {
      adminEmailAddressInvalid: isAdminEmailInvalid.value,
    };
  }

  return {
    applyFormId: !selectedForm.value?.trim(),
    contactFormId: !selectedContactForm.value?.trim(),
    openModalBtnText: !openButtonText.value?.trim(),
    submitBtnText: !submitButtonText.value?.trim(),
    emailSubject: !emailSubject.value?.trim(),
    adminEmailAddress: !adminEmailAddress.value?.trim(),
    adminEmailAddressInvalid: isAdminEmailInvalid.value,
  };
});

const hasError = (field: string): boolean => {
  return !!fieldErrors.value[field];
};

const updateProperties = (name: string, value: any): void => {
  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;

  if (name === "accessEmail") {
    settings.formFields.accessEmail = value as boolean;
    orderFormEnabled.value = value as boolean;
  }

  if (name === "formType") {
    settings.formFields.formType = value as string;
    orderFormProvider.value = value as string;
  }

  if (name === "applyFormId") {
    settings.formFields.applyFormId = value as string;
    selectedForm.value = value as string;
  }

  if (name === "contactFormId") {
    settings.formFields.contactFormId = value as string;
    selectedContactForm.value = value as string;
  }

  if (name === "openModalBtnText") {
    settings.formFields.openModalBtnText = value as string;
    openButtonText.value = value as string;
  }

  if (name === "submitBtnText") {
    settings.formFields.submitBtnText = value as string;
    submitButtonText.value = value as string;
  }

  if (name === "emailSubject") {
    settings.formFields.emailSubject = value as string;
    emailSubject.value = value as string;
  }

  if (name === "order_id_in_subject") {
    settings.formFields.order_id_in_subject = value as boolean;
    orderNotificationEmailSubject.value = value as boolean;
  }

  if (name === "adminEmailAddress") {
    settings.formFields.adminEmailAddress = value as string;
    adminEmailAddress.value = value as string;
  }

  if (name === "orderSummaryDisplayEnabled") {
    settings.formFields.summary_display.enable = value as boolean;
    orderSummaryDisplayEnabled.value = value as boolean;
  }

  if (name === "orderSummaryFormTitle") {
    settings.formFields.summary_display.form_title = value as string;
    orderSummaryFormTitle.value = value as string;
  }

  if (name === "orderSummarySubmitButtonText") {
    settings.formFields.summary_display.submit_btn_text = value as string;
    orderSummarySubmitButtonText.value = value as string;
  }

  if (name === "orderSummaryActionAfterSubmit") {
    settings.formFields.summary_display.action_after_submit = value as string;
    orderSummaryActionAfterSubmit.value = value as string;
  }

  if (name === "orderTermsLinkedPageLink") {
    settings.formFields.terms_and_conditions.link = value as string;
    orderTermsLinkedPageLink.value = value as string;
  }

  if (name === "orderTermsEnabled") {
    settings.formFields.accessTermsEmail = value as boolean;
    orderTermsEnabled.value = value as boolean;
  }

  if (name === "orderTermsLabel") {
    settings.formFields.terms_and_conditions.text = value as string;
    orderTermsLabel.value = value as string;
  }

  if (name === "orderTermsLinkedPageTitle") {
    settings.formFields.terms_and_conditions.link_text = value as string;
    orderTermsLinkedPageTitle.value = value as string;
  }

  if (name === "orderTermsLinkedPage") {
    settings.formFields.terms_and_conditions.page_id =
      value as unknown as number;
    orderTermsLinkedPage.value = value as unknown as number;
  }

  if (name === "paymentGatewaysEnabled") {
    settings.formFields.payment = value as boolean;
    orderPaymentGatewaysEnabled.value = value as boolean;
  }

  if (name === "paymentGateways") {
    settings.formFields.paymentMethods = value as unknown as string[];
    orderPaymentGateways.value = value as unknown as string[];
  }

  if (name === "orderRecaptcha") {
    settings.recaptcha.enable = value as boolean;
    orderRecaptchaEnabled.value = value as boolean;
  }

  settingsStore.setSettings(settings);
};

const openOrderFormManager = (): void => {
  builderStore.setCurrentCalculatorPage("builder");
  builderStore.setBuilderContent("order-form");
};

const orderFormGlobalSettingsApplied = computed((): boolean => {
  return settingsStore.getGeneralSettings?.form_fields?.use_in_all || false;
});

const orderSummaryDisplayEnabledGlobal = computed((): boolean => {
  return (
    settingsStore.getGeneralSettings?.form_fields?.summary_display
      ?.use_in_all || false
  );
});

const orderTermsEnabledGlobal = computed((): boolean => {
  return (
    settingsStore.getGeneralSettings?.form_fields?.terms_use_in_all || false
  );
});
</script>

<style lang="scss">
.ccb-settings-section .ccb-repeater {
  display: grid;
  gap: 4px;

  .ccb-repeater__header {
    display: flex;
    gap: 4px;
    align-items: baseline;
  }

  .ccb-repeater__label {
    color: var(--ccb-font-comment);
    padding-left: 16px;
  }

  .ccb-repeater__required {
    color: var(--ccb-red-bg-normal);
  }

  .ccb-repeater__list {
    display: grid;
    gap: 4px;
  }

  .ccb-repeater__row {
    display: grid;
    align-items: start;
    position: relative;
  }

  .ccb-repeater__grid {
    display: grid;
    gap: 0px;
    border-radius: 16px;
    overflow: hidden;
    border: 4px solid var(--ccb-blue-bg-dull-disabled);
  }

  .ccb-repeater__field {
    display: flex;
    align-items: center;
  }

  .ccb-repeater__input {
    width: 100%;
    border: none;
    padding: 0 12px;
    font-size: 14px;
    height: 40px;
    background: var(--ccb-input-normal);

    &:focus {
      outline: none;
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .ccb-repeater__input-separator {
    width: 4px;
    height: 40px;
    background: var(--ccb-blue-bg-dull-disabled);
  }
}

.ccb-notice__content {
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 90%;
}

.ccb-settings__row-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
