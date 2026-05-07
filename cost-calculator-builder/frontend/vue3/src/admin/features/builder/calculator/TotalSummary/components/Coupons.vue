<template>
  <div class="ccb-coupons">
    <div class="ccb-coupons__title">{{ translations.haveAPromoCode }}</div>
    <div class="ccb-coupons__wrapper">
      <div class="ccb-coupons__label">
        <span class="title">{{ translations.promoCode }}</span>
        <span class="hide" @click="toggle">{{ translations.hide }}</span>
        <span class="show" @click="toggle">{{ translations.show }}</span>
      </div>
      <div class="ccb-coupons__input" v-if="show">
        <input
          type="text"
          :placeholder="translations.enterYourPromoCode"
          v-model="promoCode"
        />
        <div class="ccb-coupons__button" @click="applyPromoCode">
          {{ translations.apply }}
        </div>
      </div>
      <div class="ccb-coupons-preview" v-if="promoCodeStatus">
        <div class="ccb-coupons-preview__title">
          {{ translations.appliedPromoCodes }}:
        </div>
        <div class="ccb-coupons-preview__code">
          <span>{{ promoCode }}</span>
          <span
            class="ccb-coupons-preview__code-remove"
            @click="removePromoCode"
          >
            <i class="ccb-icon-close"></i>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const { accentColor, textColor, borderColor } = useAppearanceColors();

const promoCode = ref("");

const toggle = () => {
  show.value = !show.value;
};
const show = ref(true);
const promoCodeStatus = ref(false);

const applyPromoCode = () => {
  if (promoCode.value.length) {
    promoCodeStatus.value = true;
  }
};

const removePromoCode = () => {
  promoCodeStatus.value = false;
  promoCode.value = "";
};
</script>

<style scoped lang="scss">
.ccb-coupons {
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: "Red Hat Display", sans-serif;
}

.ccb-coupons__title {
  margin: 0;
  color: v-bind(accentColor);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 4px;
}

.ccb-coupons__wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ccb-coupons__label {
  display: flex;
  align-items: baseline;
  gap: 16px;

  .title {
    color: v-bind(textColor);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.1;
  }

  .hide,
  .show {
    color: v-bind(accentColor);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.1;
    cursor: pointer;
  }

  .show {
    display: none;
  }
}

.ccb-coupons__input {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  input {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: 1px solid v-bind(borderColor);
    background: transparent;
    outline: none;
    padding: 12px;
    font-family: inherit;
    font-size: 12px;
    color: v-bind(textColor);

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
}

.ccb-coupons__button {
  flex: 0 0 82px;
  border-radius: 4px;
  background-color: v-bind(accentColor);
  color: #fff;
  font-size: 14px;
  padding: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  height: 100%;
}

.ccb-coupons-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;

  &__title {
    color: v-bind(textColor);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.1;
  }

  &__code {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 2px 5px;
    border-radius: 4px;
    background-color: v-bind(borderColor);
  }

  &__code-remove {
    cursor: pointer;
    font-size: 10px;
    opacity: 0.7;
    transition: ease-in-out 200ms;
    line-height: 0;
  }
}
</style>
