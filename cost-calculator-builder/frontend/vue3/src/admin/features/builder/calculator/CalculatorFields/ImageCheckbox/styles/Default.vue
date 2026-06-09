<template>
  <div class="ccb-default-checkbox-image ccb-image-checkbox-grid">
    <template v-for="(option, idx) in field.options">
      <label
        :for="getName + '_' + idx + '_' + generateId"
        class="ccb-checkbox-image"
        :class="{
          selected: selectedOptions.includes(option.optionValue),
          'ccb-option-disabled': field.disableOptions.includes(idx),
          'ccb-option-checked': idx === 0,
        }"
        v-if="option.optionText"
        ><div class="ccb-checkbox-image__box">
          <img :src="option.src || placeholderImg" alt="field-img" />
        </div>
        <div class="ccb-checkbox-image__info">
          <div class="ccb-checkbox-image__title-box">
            <span class="ccb-checkbox-image__label">{{
              option.optionText
            }}</span>
            <span class="ccb-checkbox-image__price" v-if="showValueInOption">
              Price:
              {{ option.optionValue }}
            </span>
          </div>
        </div>
        <div class="ccb-checkbox-image__item">
          <input
            type="checkbox"
            :id="getName + '_' + idx + '_' + generateId"
            :name="getName"
            :value="option.optionValue"
            :checked="idx === 0"
          />
          <label :id="getName + '_' + idx"></label></div
      ></label>
    </template>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import { IMultiOptionsField } from "@/widget/shared/types/fields";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import placeholderImg from "@/images/placeholder.png";
const { borderColor, formFieldsColor, textColor, accentColor } =
  useAppearanceColors();

type Props = {
  field: IMultiOptionsField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const generateId = computed(() => {
  return Math.random().toString(36).substring(2, 15);
});

const getName = computed(() => {
  return field.value.alias || "";
});

const selectedOptions = computed(() => {
  const selected = field.value.selectedOption || [];
  return selected.map((item: any) =>
    typeof item === "string" ? item : String(item?.optionValue || ""),
  );
});

const showValueInOption = computed(() => {
  return field.value.show_value_in_option || false;
});
</script>

<style scoped lang="scss">
.ccb-default-checkbox-image {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: var(--ccb-field-size);
  font-weight: var(--ccb-field-weight);
  color: v-bind(textColor);
  padding: 5px 0;
  pointer-events: none;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-field-size);
    font-weight: var(--ccb-mobile-field-weight);
  }

  .ccb-checkbox-image {
    border: 2px solid v-bind(borderColor);
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 4px;
    cursor: pointer;
    max-width: unset;
    width: 100%;
    padding: 0;
    margin: 0;
    box-sizing: border-box;

    &.selected {
      border-color: v-bind(accentColor);
    }

    &:before {
      bottom: 10px;
      right: 10px;
      content: "";
      max-width: 20px;
      min-width: 20px;
      max-height: 20px;
      min-height: 20px;
      height: 20px;
      width: 20px;
      position: absolute;
      margin: 0 !important;
      background-color: v-bind(formFieldsColor);
      border: 2px solid v-bind(borderColor);
      transition: transform 0.28s ease;
      box-sizing: border-box;
      border-radius: 3px;
    }

    &:after {
      bottom: 19px;
      right: 14px;
      height: 5px;
      width: 10px;
      content: "";
      display: block;
      position: absolute;
      border-left: 2px solid #fff;
      border-bottom: 2px solid #fff;
      transition: transform ease 0.25s;
      transform: rotate(-45deg) scale(0) translateY(-10%);
      box-sizing: border-box;
    }

    &__box {
      padding: 18px;
      line-height: 0.7;
      width: 100%;
      height: 100%;
      box-sizing: border-box;

      img {
        width: 100%;
        height: auto;
        border-radius: 4px;
        object-fit: cover;
        aspect-ratio: 1 / 1;
      }
    }

    &__info {
      width: 90%;
      padding: 5px 10px 12px 10px;
      position: relative;
    }

    &__title-box {
      display: flex;
      flex-direction: column;
      row-gap: 10px;
    }

    &__label {
      font-size: var(--ccb-field-size);
      font-weight: var(--ccb-field-weight);
      color: v-bind(textColor);
      word-break: break-word;

      @media only screen and (max-width: 480px) {
        font-size: var(--ccb-mobile-field-size);
        font-weight: var(--ccb-mobile-field-weight);
      }
    }

    &__price {
      font-size: calc(var(--ccb-summary-text-size) - 2px);
      color: var(--ccb-fields-description-color);

      @media only screen and (max-width: 480px) {
        font-size: calc(var(--ccb-mobile-summary-text-size) - 2px);
      }
    }

    &__item {
      display: flex;
      justify-content: start;
      align-items: center;
      width: 100%;
      position: absolute;
      bottom: 10px;
      right: 2px;
      min-height: 18px;
      max-width: fit-content;

      input {
        display: none;
      }
    }
  }

  label.ccb-option-checked {
    border-color: v-bind(accentColor);
  }

  label:has(input[type="checkbox"]:checked):before {
    background: v-bind(accentColor);
    border-color: v-bind(accentColor);
  }

  label:has(input[type="checkbox"]:checked):after {
    transform: rotate(-45deg) scale(1) translateY(-10%);
  }
}
</style>
