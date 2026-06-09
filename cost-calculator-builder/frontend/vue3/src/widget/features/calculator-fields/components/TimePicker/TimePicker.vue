<template>
  <div
    class="ccb-field ccb-timePicker-field"
    :class="{
      required: isRequired,
      'ccb-24-hours': getFormat,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: additionalClasses,
    }"
  >
    <div class="ccb-field__label">
      <RequiredHint v-if="isRequired" :text="requiredWarningText" />
      <div class="ccb-field__title">
        {{ field.label
        }}<span v-if="field.required" class="ccb-field-required-mark">*</span
        ><ProBadge />
      </div>
    </div>
    <div
      v-if="appearanceStore.descriptionPosition === 'before'"
      class="ccb-field__descriptions ccb-before"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>

    <div class="ccb-field__input-wrapper">
      <component
        :is="currentComponents"
        v-model="selectedTime"
        :alias="field.alias"
        :format="getFormat"
        :default="'23:05'"
        :field="field"
        :min-interval="getMinInterval"
        @update:model-value="updateValue"
      />
    </div>
    <div
      v-if="appearanceStore.descriptionPosition === 'after'"
      class="ccb-field__descriptions ccb-after"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, defineAsyncComponent, onMounted, ref } from "vue";
import { ITimePickerField } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useConditionsStore } from "@/widget/app/providers/stores/conditionsStore.ts";
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";
import RequiredHint from "@/widget/shared/ui/components/Required-hint/RequiredHint.vue";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";

type Props = {
  field: ITimePickerField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const appearanceStore = useAppearanceStore();
const fieldStore = useFieldsStore();
const conditionsStore = useConditionsStore();

const requiredWarningText = computed(() => {
  const settingStore = useSettingsStore();
  return settingStore.getWarningTexts?.requiredMsg || "";
});

const getRangeType = computed(() => {
  return typeof field.value.range === "string"
    ? field.value.range === "1"
    : field.value.range;
});

const getMinInterval = computed(() => {
  if (!field.value.useInterval) return "";
  return field.value.minInterval || "1h";
});

const getFormat = computed(() => {
  return field.value.format || false;
});

const currentComponents = computed(() => {
  if (getRangeType.value) {
    return defineAsyncComponent(() => import("./styles/RangeTime.vue"));
  } else {
    return defineAsyncComponent(() => import("./styles/SingleTime.vue"));
  }
});

const isRequired = computed(() => {
  return fieldStore.checkFieldRequired(field.value);
});

const selectedTime = ref<{
  hours: number;
  minutes: number;
  seconds: number;
} | null>(null);

onMounted(() => {
  if (field.value.placeholderHours.length > 0) {
    selectedTime.value = {
      hours: Number(field.value.placeholderHours),
      minutes: Number(field.value.placeholderTime),
      seconds: 0,
    };
  }
  field.value.displayValue = getDisplayValue.value;
  fieldStore.updateField(field.value.alias, field.value, true);
});

const getDisplayValue = computed(() => {
  if (!selectedTime.value) return "";

  if (Array.isArray(selectedTime.value)) {
    const from = selectedTime.value[0];
    const to = selectedTime.value[1];

    return `${formatTime(from)} - ${formatTime(to)}`;
  } else {
    return formatTime(selectedTime.value);
  }
});

const formatTime = (time: { hours: number; minutes: number }) => {
  const { hours, minutes } = time;
  const formattedMinutes = minutes.toString().padStart(2, "0");

  if (!getFormat.value) {
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  } else {
    const formattedHours = hours.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
  }
};

const updateValue = () => {
  field.value.displayValue = getDisplayValue.value;
  fieldStore.updateField(field.value.alias, field.value);
  conditionsStore.applyConditionForField(field.value.alias);
};

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});
</script>

<style lang="scss">
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-timePicker-field {
        .ccb-range-timePicker {
          flex-direction: column;

          .ccb-range-timePicker__from {
            .ccb-time-dropdown__input {
              border-radius: var(--ccb-fields-border-radius)
                var(--ccb-fields-border-radius) 0 0;
            }
          }

          .ccb-range-timePicker__to {
            .ccb-time-dropdown__input {
              border-radius: 0 0 var(--ccb-fields-border-radius)
                var(--ccb-fields-border-radius);
            }
          }

          .ccb-range-timePicker__separator {
            justify-content: center;
            border: 1px solid var(--ccb-fields-border-color);
            border-top: none;
            border-bottom: none;

            span {
              font-size: calc(var(--ccb-fields-button-size) - 2px);
            }
          }
        }

        .ccb-time-dropdown__input {
          padding: 8px calc(var(--ccb-field-side-indent) - 4px);
          padding-left: max(24px, var(--ccb-field-side-indent) - 4px);
          font-size: calc(var(--ccb-fields-button-size) - 2px);
        }

        .ccb-time-dropdown__panel {
          width: min(320px, calc(100vw - 40px));
          padding: 16px;
        }
      }
    }
  }
}

.ccb-timePicker-field *:focus {
  outline-width: 0;
}

.ccb-icon-timepicker-light-clock {
  color: var(--ccb-text-color);
}

.ccb-timePicker-field {
  .ccb-time-dropdown__input {
    font-family: inherit;
  }
}
</style>
