<template>
  <div
    class="ccb-field ccb-dropdown-img-field"
    :class="{
      active: isBodyVisible,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
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
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'before'"
      class="ccb-field__descriptions ccb-before"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>

    <div class="ccb-field__input-wrapper" ref="dropdownWrapper">
      <div class="ccb-dropdown">
        <div class="ccb-dropdown__input">
          <div v-if="firstOption" class="ccb-dropdown__label">
            <img
              :src="firstOption.src || placeholderImg"
              alt="first-option-image"
            />
            <span>{{ firstOption.optionText }}</span>
          </div>
          <div v-else class="ccb-dropdown__label">
            <img :src="defaultImg" alt="#" />
            <span> {{ translationsStore.getTranslations.selectValue }} </span>
          </div>
          <span class="ccb-dropdown__icon">
            <i class="ccb-icon-Path-3485"></i>
          </span>
        </div>

        <div class="ccb-dropdown__list">
          <ul>
            <li @click.prevent="() => selectValue(undefined, true)">
              <img :src="defaultImg" alt="" />
              <span>{{ translationsStore.getTranslations.selectValue }}</span>
            </li>
            <li
              v-for="(option, idx) in fieldOptions"
              :key="option.optionValue"
              @click.prevent="() => selectValue(option)"
              :class="{
                'ccb-option-disabled': field.disableOptions.includes(idx),
              }"
            >
              <img :src="option.src || placeholderImg" alt="#" />
              <span class="ccb-dropdown--option">
                <span class="ccb-dropdown--option-label">
                  {{ option.optionText }}
                </span>
                <span
                  class="ccb-dropdown--option-converted"
                  v-if="field.showValueInOption"
                >
                  {{ translationsStore.getTranslations.price }}:
                  {{ option.optionConverted }}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div
      v-if="appearanceStore.getAppearanceDescriptionPosition === 'after'"
      class="ccb-field__descriptions ccb-after"
    >
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, computed } from "vue";
import defaultImg from "@/images/static/close.png";
import { useAppearanceStore } from "@/widget/app/providers/stores/appearanceStore.ts";
import { IImageDropdownField } from "@/widget/shared/types/fields";
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";
import placeholderImg from "@/images/placeholder.png";

const props = defineProps<{
  field: IImageDropdownField;
}>();
const { field } = toRefs(props);

const appearanceStore = useAppearanceStore();
const translationsStore = useTranslationsStore();

const isBodyVisible = ref<boolean>(false);

const dropdownWrapper = ref<HTMLElement | null>(null);

const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownWrapper.value &&
    "contains" in dropdownWrapper.value &&
    !dropdownWrapper.value.contains(event.target as Node)
  ) {
    isBodyVisible.value = false;
    document.removeEventListener("click", handleClickOutside);
  }
};

const fieldOptions = computed(() => {
  return field.value.options?.map((f: any) => {
    return {
      ...f,
    };
  });
});

const firstOption = computed(() => {
  const options = fieldOptions.value;
  return options && options.length > 0 ? options[0] : null;
});

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
});

const selectValue = (option?: any, isReset = false) => {
  field.value.selectedOption = isReset ? undefined : option;
  isBodyVisible.value = false;
};
</script>

<style lang="scss" scoped>
@use "@/styles/widget/_mixins.scss" as mixins;

.ccb-dropdown {
  position: relative;

  &__label {
    padding-left: 0px;
  }

  &--option {
    display: flex;
    flex-direction: column;
    align-items: flex-start !important;
    padding: 10px 7px !important;
  }

  &--option-label {
    font-size: 14px;
  }

  &--option-converted {
    font-size: calc(var(--ccb-summary-text-size) - 2px);
    color: var(--ccb-text-color);

    @media only screen and (max-width: 480px) {
      font-size: calc(var(--ccb-mobile-summary-text-size) - 2px);
    }
  }

  &__input {
    @include mixins.field;
  }

  &__input {
    padding-right: 10px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    justify-content: space-between;
    cursor: pointer;
    min-width: 0;
    overflow: hidden;

    @media only screen and (max-width: 480px) {
      padding: 0 var(--ccb-mobile-field-side-indent);
      min-height: var(--ccb-mobile-field-button-height);
    }
  }

  &__icon {
    font-size: 8px;
    display: grid;
    place-items: center;
    transition: 300ms ease;
  }

  &__list {
    margin-top: 5px;
    border-radius: 4px;
    background: #ffffff;
    border-color: transparent;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    max-height: 261px;
    position: absolute;
    top: 55px;
    left: 0;
    width: 100%;
    z-index: 100;
    visibility: hidden;
    opacity: 0;
    transition: 200ms ease;
    overflow-y: auto;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      background: var(--ccb-fields-bg-color);

      li {
        margin: 0;
        background: var(--ccb-fields-bg-color);
        color: var(--ccb-text-color);
        font-size: 15px;
        font-weight: var(--ccb-field-weight);

        padding: 10px;
        border-bottom: 1px solid var(--ccb-fields-border-color);
        cursor: pointer;

        display: flex;
        align-items: center;

        @media only screen and (max-width: 480px) {
          font-weight: var(--ccb-mobile-field-weight);
        }

        img {
          width: 50px;
          height: 50px;
          margin-right: 10px;
        }

        &:hover {
          background: var(--ccb-fields-hover-color) !important;
        }
      }
    }
  }
}

.ccb-dropdown-img-field {
  .ccb-dropdown__label {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;

    img {
      width: 30px;
      height: 30px;
      margin-right: 10px;
      flex-shrink: 0;
    }

    > span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  &.active {
    .ccb-dropdown__input {
      border-color: var(--ccb-accent-color);
    }
    .ccb-dropdown__list {
      visibility: visible;
      opacity: 1;
      top: 55px;
    }

    .ccb-dropdown__icon {
      transform: rotate(180deg);
    }
  }
}
</style>
