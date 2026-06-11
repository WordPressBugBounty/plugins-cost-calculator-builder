<template>
  <div class="ccb-settings-section">
    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Error messages in calculator" size="m" weight="bold" />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Input
            label="Required field message"
            placeholder="Enter message"
            name="required_msg"
            v-model="requiredMsg"
            @change="updateProperties"
          />
        </div>
      </div>
    </SettingsBlock>
    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Error messages in Contact Forms" size="m" weight="bold" />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Input
            label="Email format message"
            placeholder="Enter message"
            v-model="emailFormatMsg"
            @change="updateProperties"
            name="email_format"
          />
        </div>
        <div class="ccb-settings__col">
          <Input
            label="Email required message"
            placeholder="Enter message"
            v-model="emailRequiredMsg"
            @change="updateProperties"
            name="email_field"
          />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Input
            label="Name required message"
            placeholder="Enter message"
            v-model="nameRequiredMsg"
            name="name_field"
            @change="updateProperties"
          />
        </div>
        <div class="ccb-settings__col">
          <Input
            label="Phone required message"
            placeholder="Enter message"
            v-model="phoneRequiredMsg"
            @change="updateProperties"
            name="phone_field"
          />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Input
            label="Terms and conditions required message"
            placeholder="Enter message"
            v-model="termsAndConditionsRequiredMsg"
            @change="updateProperties"
            name="terms_and_conditions_field"
          />
        </div>
      </div>
    </SettingsBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SettingsBlock from "@/admin/features/settings/SettingsBlock.vue";
import { Text, Input } from "@/admin/shared/ui/UIKit";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { ISettings } from "@/admin/shared/types/settings.type";

const settingsStore = useSettingsStore();

const requiredMsg = ref<string>(
  settingsStore.getSettings?.texts?.required_msg || "",
);

const emailFormatMsg = ref<string>(
  settingsStore.getSettings?.texts?.form_fields?.email_format || "",
);

const emailRequiredMsg = ref<string>(
  settingsStore.getSettings?.texts?.form_fields?.email_field || "",
);

const nameRequiredMsg = ref<string>(
  settingsStore.getSettings?.texts?.form_fields?.name_field || "",
);

const phoneRequiredMsg = ref<string>(
  settingsStore.getSettings?.texts?.form_fields?.phone_field || "",
);

const termsAndConditionsRequiredMsg = ref<string>(
  settingsStore.getSettings?.texts?.form_fields?.terms_and_conditions_field ||
    "",
);

const updateProperties = (name: string, value: string | number) => {
  value = `${value}`;
  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;

  if (name === "required_msg") {
    settings.texts.required_msg = value;
    requiredMsg.value = value;
  }

  if (name === "email_format") {
    settings.texts.form_fields.email_format = value;
    emailFormatMsg.value = value;
  }

  if (name === "email_field") {
    settings.texts.form_fields.email_field = value;
    emailRequiredMsg.value = value;
  }

  if (name === "name_field") {
    settings.texts.form_fields.name_field = value;
    nameRequiredMsg.value = value;
  }

  if (name === "phone_field") {
    settings.texts.form_fields.phone_field = value;
    phoneRequiredMsg.value = value;
  }

  if (name === "terms_and_conditions_field") {
    settings.texts.form_fields.terms_and_conditions_field = value;
    termsAndConditionsRequiredMsg.value = value;
  }

  settingsStore.setSettings(settings);
};
</script>

<style scoped lang="scss"></style>
