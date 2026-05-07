<template>
  <div class="ccb-default-image-checkbox-withicon ccb-image-checkbox-grid">
    <template v-for="(option, idx) in field.options">
      <label
        :for="getName + '_' + idx + '_' + generateId"
        class="ccb-checkbox-image"
        :class="{
          selected: idx === 0,
          'ccb-option-disabled': field.disableOptions.includes(idx),
        }"
        v-if="option.optionText"
        ><div class="ccb-checkbox-image__box">
          <img
            :src="option.icon || placeholderImg"
            alt="field-img"
            :style="getImageStyles"
          />
        </div>
        <div class="ccb-checkbox-image__info">
          <div class="ccb-checkbox-image__title-box">
            <span class="ccb-checkbox-image__label">
              {{ option.optionText }}
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
import { useMultiOptionChildShared } from "@/widget/actions/fields/composable/useMultiOptionChildShared.ts";
import placeholderImg from "@/images/placeholder.png";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
const {
  borderColor,
  formFieldsColor,
  textColor,
  accentColor,
  accentColorAlpha,
} = useAppearanceColors();

const emit = defineEmits<{
  (event: "update", value: string): void;
}>();

type Props = {
  field: IMultiOptionsField;
  values: string[];
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const generateId = computed(() => {
  return Math.random().toString(36).substring(2, 15);
});

const { getName, getImageStyles } = useMultiOptionChildShared(props, emit);
</script>

<style lang="scss" scoped>
.ccb-default-image-checkbox-withicon {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: v-bind(textColor);
  flex-direction: flex-start;
  pointer-events: none;

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-field-size);
    font-weight: var(--ccb-mobile-field-weight);
  }

  .ccb-checkbox-image {
    border: 1px solid v-bind(borderColor);
    background: v-bind(formFieldsColor);
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 4px;
    cursor: pointer;
    padding: 10px 18px;
    row-gap: 7px;

    &.selected {
      border-color: v-bind(accentColor);
      background: v-bind(accentColorAlpha);
    }

    &__box {
      line-height: 0.7;
      display: flex;
      justify-content: center;
      flex: 1;
      width: 100%;
      height: 100%;
      box-sizing: border-box;

      img {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        object-fit: cover;
        aspect-ratio: 1 / 1;
      }
    }

    &__info {
      position: relative;
      word-break: break-word;
    }

    &__title-box {
      display: flex;
      justify-content: center;
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
      font-size: var(--ccb-field-size-2);
      color: v-bind(textColor);

      @media only screen and (max-width: 480px) {
        font-size: var(--ccb-mobile-field-size);
      }
    }
  }

  label {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    margin: 0;
    text-align: center;
    cursor: pointer;
    line-height: 1;

    input {
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      outline: none;
      max-width: 20px;
      min-width: 20px;
      max-height: 20px;
      min-height: 20px;
      border-radius: 50%;
      position: relative;
      border: 2px solid v-bind(borderColor);
      background-color: v-bind(formFieldsColor);
      -webkit-appearance: none;
      margin-right: 7px;
      margin-top: 0;
      outline: none !important;
      box-shadow: none !important;
      box-sizing: border-box;
      padding: 0px;
      margin: 0px;
      margin-right: 7px;
      transition: 300ms ease;

      &[type="checkbox"]:checked {
        border-color: v-bind(accentColor);
        background-color: v-bind(accentColor);
      }

      &:before {
        content: "";
        width: 10px;
        min-width: 10px;
        height: 10px;
        display: block;
        border-radius: 50%;
        background-color: v-bind(formFieldsColor) !important;
      }
    }

    .ccb-checkbox-label {
      word-break: break-word;
    }
  }
}
</style>
