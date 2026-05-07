<template>
  <div class="ccb-settings-section">
    <Notice v-if="currencyDisabled" type="warning">
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
    <SettingsBlock :disabled="currencyDisabled">
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Text text="Currency" size="m" weight="bold" />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Input
            placeholder="Enter currency sign"
            v-model="currencySign"
            label="Currency Sign"
            name="currency"
            @change="updateProperties"
          />
        </div>
        <div class="ccb-settings__col">
          <Dropdown
            label="Currency Position"
            :items="currencyPositionOptions"
            v-model="currencyPosition"
            name="currencyPosition"
            @change="updateProperties"
          />
        </div>
      </div>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Input
            placeholder="Enter number of decimals"
            v-model="numberOfDecimals"
            label="Number of Decimals"
            name="num_after_integer"
            @change="updateProperties"
          />
        </div>
        <div class="ccb-settings__col">
          <Dropdown
            :items="thousandsSeparatorOptions"
            v-model="thousandsSeparator"
            label="Thousands Separator"
            name="thousands_separator"
            @change="updateProperties"
          />
        </div>
        <div class="ccb-settings__col">
          <Dropdown
            :items="decimalSeparatorOptions"
            v-model="decimalSeparator"
            label="Decimal Separator"
            name="decimal_separator"
            @change="updateProperties"
          />
        </div>
      </div>
    </SettingsBlock>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import SettingsBlock from "@/admin/features/settings/SettingsBlock.vue";
import { Text, Input, Dropdown, Notice, Button } from "@/admin/shared/ui/UIKit";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { ISettings, ISettingsItems } from "@/admin/shared/types/settings.type";

const settingsStore = useSettingsStore();

const currencyDisabled = computed(() => {
  return settingsStore.getGeneralSettings?.currency.use_in_all;
});

const currencySign = ref<string>(
  settingsStore.getSettings?.currency.currency || "",
);
const currencyPosition = ref<string>(
  settingsStore.getSettings?.currency.currencyPosition || "",
);
const thousandsSeparator = ref<string>(
  settingsStore.getSettings?.currency.thousands_separator || "",
);
const numberOfDecimals = ref<string>(
  settingsStore.getSettings?.currency.num_after_integer?.toString() || "2",
);
const decimalSeparator = ref<string>(
  settingsStore.getSettings?.currency.decimal_separator || "",
);

const currencyPositionOptions = ref<ISettingsItems[]>([
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
  { label: "Left with space", value: "left_with_space" },
  { label: "Right with space", value: "right_with_space" },
]);

const thousandsSeparatorOptions = ref<ISettingsItems[]>([
  { label: "Comma", value: "," },
  { label: "Dot", value: "." },
  { label: "Apostrophe", value: "'" },
  { label: "Space", value: " " },
]);

const decimalSeparatorOptions = ref<ISettingsItems[]>([
  { label: "Comma", value: "," },
  { label: "Dot", value: "." },
]);

const updateProperties = (name: string, value: any) => {
  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;

  if (name === "currency") {
    settings.currency.currency = value;
    currencySign.value = value;
  }

  if (name === "currencyPosition") {
    settings.currency.currencyPosition = value;
    currencyPosition.value = value;
  }

  if (name === "num_after_integer") {
    settings.currency.num_after_integer = parseInt(value);
    numberOfDecimals.value = value;
  }

  if (name === "thousands_separator") {
    settings.currency.thousands_separator = value;
    thousandsSeparator.value = value;
  }

  if (name === "decimal_separator") {
    settings.currency.decimal_separator = value;
    decimalSeparator.value = value;
  }

  settingsStore.setSettings(settings);
};

const goToSettings = () => {
  window.location.href =
    "/wp-admin/admin.php?page=cost_calculator_builder_settings&option=currency";
};
</script>

<style scoped lang="scss">
.ccb-notice__content {
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 90%;
}
</style>
