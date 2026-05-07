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
      <textarea
        :rows="rows || 3"
        type="text"
        :placeholder="translatedPlaceholder"
        class="ccb-text-m"
        @input="handleInputChange"
        v-model="modelValue"
        :style="{ height: height }"
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
import { ITextarea } from "@/admin/shared/types/uikit.type";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { translateAdminText } from "@/admin/shared/utils/translate-admin-text.utils";

const props = defineProps<ITextarea>();
const { name, iconLeft, iconRight, border, label, required, rows, height } =
  toRefs(props);
const modelValue = defineModel<string>();
const translationsStore = useBuilderTranslationsStore();

const emit = defineEmits<{
  (e: "change", name: string, value: string): void;
}>();

const classes = computed(() => {
  return [
    iconLeft.value ? "ccb-input-icon-left" : "",
    iconRight.value ? "ccb-input-icon-right" : "",
    border.value ? "ccb-input-border" : "",
  ];
});

const handleInputChange = (event: Event) => {
  emit(
    "change",
    name.value || "",
    (event.target as HTMLInputElement).value as string,
  );
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
  width: 100%;

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

  textarea {
    border: none;
    outline: none;
    background: var(--ccb-input-normal);
    width: 100%;
    height: 100%;
    color: var(--ccb-font-labels);
    padding: 8px 8px 8px 16px;
    border-radius: 0;
    transition: var(--ccb-transition-normal);
    border-radius: 12px;

    &:active,
    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
}
</style>
