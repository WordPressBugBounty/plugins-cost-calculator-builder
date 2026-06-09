<template>
  <div class="ccb-input" :class="classes">
    <i
      :class="iconLeft"
      class="ccb-input__icon ccb-input__icon-left ccb-text-m"
      v-if="iconLeft"
    ></i>
    <label class="ccb-input__label ccb-text-m">
      <span class="ccb-input__label-text ccb-text-s ccb-medium" v-if="label">{{
        translatedLabel
      }}</span>
      <span class="ccb-input__required-mark" v-if="required">*</span>
      <input
        :type="props.inputType || 'text'"
        :placeholder="translatedPlaceholder"
        class="ccb-text-m"
        :disabled="props.disabled"
        :inputmode="getInputMode"
        :pattern="getPattern"
        :max="max"
        :min="min"
        :value="
          modelValue === null || modelValue === undefined ? '' : modelValue
        "
        @input="handleInputChange"
        @blur="handleInputBlur"
        @keydown="handleKeyDown"
      />
    </label>
    <i
      :class="iconRight"
      class="ccb-input__icon ccb-input__icon-right ccb-text-m"
      v-if="iconRight"
    ></i>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import { IInput } from "@/admin/shared/types/uikit.type";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { translateAdminText } from "@/admin/shared/utils/translate-admin-text.utils";

const props = defineProps<IInput>();
const {
  name,
  iconLeft,
  iconRight,
  border,
  label,
  required,
  variant,
  max,
  min,
} = toRefs(props);
const modelValue = defineModel<string | number>();
const translationsStore = useBuilderTranslationsStore();

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "change", name: string, value: any): void;
}>();

const classes = computed(() => {
  return [
    iconLeft.value ? "ccb-input-icon-left" : "",
    iconRight.value ? "ccb-input-icon-right" : "",
    border.value ? "ccb-input-border" : "",
    variant.value ? "ccb-input-variant-" + variant.value : "",
  ];
});

const getInputMode = computed(() =>
  props.onlyDigits || props.allowDecimal ? "decimal" : undefined,
);

const getPattern = computed(() => {
  if (props.onlyDigits) return "[0-9]*";
  if (props.allowDecimal) return "^[0-9]*([.,][0-9]*)?$";
  return undefined;
});

const sanitizeDigits = (value: string): string => value.replace(/\D+/g, "");
const sanitizeDecimal = (value: string): string => {
  const normalized = value.replace(/,/g, ".");
  const clean = normalized.replace(/[^\d.]/g, "");
  const [integerPart, ...fractionParts] = clean.split(".");

  if (!fractionParts.length) return integerPart;
  return `${integerPart}.${fractionParts.join("")}`;
};

const hasMin = computed(() => min.value !== undefined && min.value !== null);
const hasMax = computed(() => max.value !== undefined && max.value !== null);
const hasNumberLimits = computed(() => hasMin.value || hasMax.value);

const clampByLimits = (value: string, applyMin = false): string => {
  if (!hasNumberLimits.value || value === "") return value;

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;

  if (hasMax.value && numericValue > Number(max.value)) {
    return String(max.value);
  }

  if (applyMin && hasMin.value && numericValue < Number(min.value)) {
    return String(min.value);
  }

  return value;
};

const normalizeInputValue = (value: string, applyMin = false): string => {
  const sanitizedValue = props.onlyDigits
    ? sanitizeDigits(value)
    : props.allowDecimal
      ? sanitizeDecimal(value)
      : value;

  return clampByLimits(sanitizedValue, applyMin);
};

const updateInputValue = (input: HTMLInputElement, value: string): void => {
  if (input.value !== value) {
    input.value = value;
  }

  modelValue.value = value;
  emit("change", name.value || "", value);
};

const handleKeyDown = (event: KeyboardEvent): void => {
  if (!props.onlyDigits && !props.allowDecimal) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
    "Home",
    "End",
  ];

  if (allowedKeys.includes(event.key)) return;
  if (/^\d$/.test(event.key)) return;

  if (
    props.allowDecimal &&
    (event.key === "." || event.key === ",") &&
    event.target instanceof HTMLInputElement
  ) {
    const input = event.target;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const selected = input.value.slice(start, end);
    const hasSeparator = /[.,]/.test(input.value);
    const selectionHasSeparator = /[.,]/.test(selected);

    if (!hasSeparator || selectionHasSeparator) return;
  }

  if (props.onlyDigits || props.allowDecimal) {
    event.preventDefault();
  }
};

const handleInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const nextValue = normalizeInputValue(input.value);

  updateInputValue(input, nextValue);
};

const handleInputBlur = (event: FocusEvent) => {
  const input = event.target as HTMLInputElement;
  const nextValue = normalizeInputValue(input.value, true);

  updateInputValue(input, nextValue);
};

const translatedLabel = computed(() =>
  translateAdminText(label.value || "", translationsStore.getTranslations),
);

const translatedPlaceholder = computed(() =>
  translateAdminText(
    props.placeholder || "",
    translationsStore.getTranslations,
  ),
);
</script>

<style lang="scss">
.ccb-input {
  position: relative;

  &.ccb-input-icon-left {
    input {
      padding-left: 32px;
    }
    .ccb-input__icon-left {
      position: absolute;
      left: 8px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--ccb-font-labels);
      transition: var(--ccb-transition-normal);
    }
  }

  &.ccb-input-icon-right {
    input {
      padding-right: 32px;
    }
    .ccb-input__icon-right {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--ccb-font-labels);
      transition: var(--ccb-transition-normal);
    }
  }

  &.ccb-input-border {
    input {
      border: 1px solid var(--ccb-input-border);
    }
  }

  &__label-text {
    color: var(--ccb-font-comment);
    padding-left: 16px;
    padding-bottom: 4px;
    cursor: pointer;
    transition: var(--ccb-transition-normal);
  }

  &__required-mark {
    color: var(--ccb-red-bg-normal);
    padding-left: 4px;
  }

  input {
    border: none;
    outline: none;
    background: var(--ccb-input-normal);
    width: 100%;
    // height: 100%; // brokes discount input height
    color: var(--ccb-font-labels);
    padding: 8px 8px 8px 16px;
    transition: var(--ccb-transition-normal);
    border-radius: 12px;

    min-height: unset !important;
    line-height: unset !important;

    &:active,
    &:focus {
      outline: none;
      box-shadow: none;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.ccb-input-variant-innerLabel {
  background: var(--ccb-input-normal);
  border-radius: 12px;
  overflow: hidden;

  .ccb-input__label {
    padding: 0;
    line-height: 14px;
  }

  input {
    border-radius: 0;
    padding: 0px 8px 0px 16px;
    background: transparent;
  }
}

.nowrap {
  .ccb-input__label-text {
    white-space: nowrap !important;
  }
}
</style>
