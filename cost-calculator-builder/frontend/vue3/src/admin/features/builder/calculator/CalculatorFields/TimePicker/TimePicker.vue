<template>
  <div
    class="ccb-field ccb-timePicker-field"
    :class="{
      'ccb-24-hours': getFormat,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: additionalClasses,
    }"
  >
    <div class="ccb-field__label">
      <div class="ccb-field__title">
        {{ field.label
        }}<span v-if="field.required" class="ccb-field-required-mark">*</span
        ><ProBadge />
      </div>
      <div class="ccb-field__hidden" v-if="field.hidden">
        <i class="ccb-icon-ic_eye_crossed"></i>
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
import { toRefs, computed, defineAsyncComponent, ref, onMounted } from "vue";
import { ITimePickerField } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const { borderColor, formFieldsColor, textColor, accentColor } =
  useAppearanceColors();

const props = defineProps<{
  field: ITimePickerField;
}>();
const { field } = toRefs(props);

const appearanceStore = useAppearanceStore();

const getRangeType = computed(() => {
  return typeof field.value.range === "string"
    ? field.value.range === "1"
    : field.value.range;
});

const getMinInterval = computed(() => {
  if (!field.value.useInterval) return "";
  return field.value.minInterval || "1h";
});

const getDefaultValue = computed(() => {
  const hours =
    field.value.placeholderHours.length > 0
      ? field.value.placeholderHours
      : new Date().getHours();
  const minutes =
    field.value.placeholderTime.length > 0
      ? field.value.placeholderTime
      : new Date().getMinutes();

  return { hours: hours, minutes: minutes, seconds: 0 };
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

const selectedTime = ref<{
  hours: number;
  minutes: number;
  seconds: number;
} | null>(null);

onMounted(() => {
  selectedTime.value = {
    hours: Number(getDefaultValue.value.hours),
    minutes: Number(getDefaultValue.value.minutes),
    seconds: 0,
  };
  field.value.displayValue = getDisplayValue.value;
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

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
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
            .dp__input {
              border-radius: var(--ccb-fields-border-radius)
                var(--ccb-fields-border-radius) 0 0;
            }
          }
          .ccb-range-timePicker__to {
            .dp__input {
              border-radius: 0 0 var(--ccb-fields-border-radius)
                var(--ccb-fields-border-radius);
            }
          }
          .ccb-range-timePicker__separator {
            min-height: 24px;
            justify-content: center;
            border: 1px solid var(--ccb-fields-border-color);
            border-top: none;
            border-bottom: none;
            span {
              font-size: calc(var(--ccb-fields-button-size) - 2px);
            }
          }
        }
        .dp__input_wrap {
          .dp__input {
            padding: 10px calc(var(--ccb-field-side-indent) - 4px);
            padding-left: max(
              24px,
              var(--ccb-field-side-indent) - 4px
            ) !important;
            font-size: calc(var(--ccb-fields-button-size) - 2px);
          }
          .dp__input_icon {
            padding: 6px;
            font-size: 14px;
          }
        }
      }
    }
  }
}
.ccb-timePicker-field *:focus {
  outline-width: 0;
}
.ccb-icon-timepicker-light-clock {
  color: v-bind(textColor);
}
.ccb-timePicker-field {
  input {
    color: v-bind(textColor);
    padding: 0 var(--ccb-field-side-indent);
    padding-left: max(30px, var(--ccb-field-side-indent));
    min-height: var(--ccb-field-button-height);

    @media only screen and (max-width: 480px) {
      padding-left: max(30px, var(--ccb-mobile-field-side-indent));
    }

    &.dp__input_focus {
      border-color: v-bind(accentColor);
    }
  }

  .dp__input_icon {
    display: flex;
    justify-content: center;
    align-items: center;
    color: v-bind(textColor);
  }

  .dp__overlay {
    height: 130px !important;
  }

  .dp__menu {
    color: v-bind(textColor);
    border: none;
  }

  .dp__action_cancel {
    padding: 10px;
    margin: 0;
    border: none;
    flex: 1;
    border-radius: var(--ccb-fields-border-radius);
    cursor: pointer;
    transition: 300ms ease;
    font-size: var(--ccb-fields-button-size);
    font-weight: var(--ccb-fields-button-weight);
    border: 1px solid (v-bind(borderColor));
    margin-right: 10px;
    background: v-bind(formFieldsColor);
    color: v-bind(textColor);

    @media only screen and (max-width: 480px) {
      font-size: var(--ccb-mobile-fields-button-size);
      font-weight: var(--ccb-mobile-fields-button-weight);
    }

    &:hover {
      background: color-mix(in srgb, v-bind(accentColor), transparent 50%);
    }
  }

  .dp__action_select {
    padding: 10px;
    margin: 0;
    border: none;
    flex: 1;
    border-radius: var(--ccb-fields-border-radius);
    cursor: pointer;
    transition: 300ms ease;
    font-size: var(--ccb-fields-button-size);
    font-weight: var(--ccb-fields-button-weight);
    background: v-bind(accentColor) !important;
    color: var(--ccb-fields-bg-color);

    @media only screen and (max-width: 480px) {
      font-size: var(--ccb-mobile-fields-button-size);
      font-weight: var(--ccb-mobile-fields-button-weight);
    }

    &:hover {
      background: hsl(from v-bind(accentColor) h s calc(l - 5));
    }
  }

  .dp__selection_preview {
    color: v-bind(textColor);
  }

  .dp__menu,
  .dp__overlay_row,
  .dp__arrow_top,
  .dp__arrow_bottom {
    background: v-bind(formFieldsColor);
    border: none;
  }
  .dp__outer_menu_wrap {
    box-shadow: 0 10px 30px 0 rgba(0, 0, 0, 0.25);
  }

  .dp__pm_am_button {
    background: v-bind(accentColor);
    color: var(--ccb-fields-bg-color);
  }

  .dp__btn {
    background: v-bind(formFieldsColor);
    transform: 300ms easy;

    &:hover {
      background: v-bind(accentColor);
      color: v-bind(textColor);
    }
  }

  .dp__overlay_cell {
    color: v-bind(textColor);
    &:hover {
      background: color-mix(in srgb, v-bind(accentColor), transparent 50%);
      color: var(--ccb-text-color);
    }
  }

  .dp__input_icon {
    padding: 10px;
    font-size: 16px;
    color: v-bind(textColor);
  }

  .dp__time_col {
    color: v-bind(textColor);
    gap: 5px;
    button {
      color: v-bind(textColor);
      background: v-bind(formFieldsColor);
      border-radius: 4px;
      min-width: 42px;
      border: 1px solid transparent;

      &:hover {
        background: color-mix(in srgb, v-bind(accentColor), transparent 50%);
        border-color: var(--ccb-accent-color);
        color: var(--ccb-text-color);
      }
    }
  }
}
</style>
