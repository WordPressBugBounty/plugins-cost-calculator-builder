<template>
  <div class="ccb-default-image-checkbox">
    <template v-for="(option, idx) in field.options">
      <label
        :for="getName + '_' + idx"
        class="ccb-checkbox-image"
        :class="{
          selected: selectedOptions.includes(option.optionValue),
          'ccb-option-disabled': field.disableOptions.includes(idx),
        }"
        ><div class="ccb-checkbox-image__box">
          <img :src="option.src" alt="field-img" />
        </div>
        <div class="ccb-checkbox-image__info">
          <div class="ccb-checkbox-image__title-box">
            <span class="ccb-checkbox-image__label">{{
              option.optionText
            }}</span>
            <span class="ccb-checkbox-image__price"
              >{{ translationsStore.getTranslations.price }}:
              {{ valuePrice(Number(getPriceValue(option))) }}</span
            >
          </div>
        </div>
        <div class="ccb-checkbox-image__item">
          <input
            type="checkbox"
            :id="getName + '_' + idx"
            :name="getName"
            :value="option.optionValue"
            v-model="optionValues"
            @change="changeValue"
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
import { useCurrency } from "@/widget/actions/fields/composable/useCurrency.ts";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";

const currencyInstance = useCurrency();
const translationsStore = useTranslationsStore();

const emit = defineEmits<{
  (event: "update", value: string): void;
}>();

type Props = {
  field: IMultiOptionsField;
  values: string[];
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const valuePrice = computed(() => {
  return (option: number) => {
    return field.value.useCurrency || field.value.fieldCurrency
      ? currencyInstance.formatCurrency(
          option,
          currencyInstance.getCurrencyOptions(field.value),
        )
      : option;
  };
});

const { optionValues, changeValue, getName, getPriceValue, selectedOptions } =
  useMultiOptionChildShared(props, emit);
</script>

<style lang="scss">
.ccb-default-image-checkbox {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: var(--ccb-field-size);
  font-weight: var(--ccb-field-weight);
  color: var(--ccb-text-color);
  padding: 5px 0;

  .ccb-checkbox-image {
    border: 2px solid #eeeeee;
    display: flex;
    flex-direction: column;
    position: relative;
    border-radius: 4px;
    cursor: pointer;
    max-width: unset;
    width: 48%;
    min-height: 220px;
    padding: 0;
    margin: 0;
    box-sizing: border-box;

    &.selected {
      border-color: var(--ccb-accent-color);
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
      background-color: var(--ccb-fields-bg-color);
      border: 2px solid #dddddd;
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
      display: flex;
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
      color: var(--ccb-text-color);
      word-break: break-word;
    }

    &__price {
      font-size: calc(var(--ccb-summary-text-size) - 2px);
      color: var(--ccb-fields-description-color);
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

  label:has(input[type="checkbox"]:checked):before {
    background: var(--ccb-accent-color);
    border-color: var(--ccb-accent-color);
  }

  label:has(input[type="checkbox"]:checked):after {
    transform: rotate(-45deg) scale(1) translateY(-10%);
  }
}

.ccb-vertical-checkbox {
  flex-direction: column;
  .ccb-default-image-checkbox {
    .ccb-checkbox-image {
      width: 100%;
    }
  }
}
</style>
