<template>
  <div class="ccb-confirmation-content" v-if="thankYouPage">
    <div class="ccb-confirmation-content__header ccb-text-l ccb-bold">
      Confirmation Page
    </div>
    <div class="ccb-confirmation-notice" v-if="!thankYouPage.enable">
      <div class="ccb-confirmation-notice__icon">
        <div class="ccb-confirmation-notice__icon-inner">
          <i class="ccb-icon-Octicons"></i>
        </div>
      </div>
      <div class="ccb-confirmation-notice__text">
        {{ thankYouPage.complete_msg }}
      </div>
    </div>

    <div
      class="ccb-confirmation-preview"
      :class="{ disabled: !thankYouPage.enable }"
      v-if="thankYouPage.enable"
    >
      <div class="ccb-confirmation-preview__icon">
        <span class="ccb-confirmation-preview__icon-inner">
          <i class="ccb-icon-Octicons"></i>
        </span>
      </div>

      <div class="ccb-confirmation-preview__text">
        <div class="ccb-confirmation-preview__title">
          {{ thankYouPage.title || "Thank you for your order!" }}
        </div>
        <div class="ccb-confirmation-preview__subtitle">
          {{
            thankYouPage.description ||
            "Your order has been placed and will be processed shortly."
          }}
        </div>
      </div>

      <div
        v-if="thankYouPage.showOrderId"
        class="ccb-confirmation-preview__order ccb-text-m ccb-medium"
      >
        <span>{{ thankYouPage.order_title || "Order ID" }}:</span>
        <span>#12345</span>
      </div>

      <div class="ccb-confirmation-preview__buttons">
        <button
          type="button"
          class="ccb-confirmation-preview__button ccb-confirmation-preview__button--light"
        >
          {{ thankYouPage.back_button_text || "Back to calculator" }}
        </button>

        <button
          v-if="thankYouPage.download_button"
          type="button"
          class="ccb-confirmation-preview__button ccb-confirmation-preview__button--primary"
        >
          {{ thankYouPage.download_button_text || "Download PDF" }}
        </button>

        <button
          v-if="thankYouPage.share_button"
          type="button"
          class="ccb-confirmation-preview__button ccb-confirmation-preview__button--secondary"
        >
          {{ thankYouPage.share_button_text || "Send PDF to" }}
        </button>

        <a
          v-if="thankYouPage.custom_button"
          :href="thankYouPage.custom_button_link || '#'"
          target="_blank"
          class="ccb-confirmation-preview__button ccb-confirmation-preview__button--secondary"
        >
          {{ thankYouPage.custom_button_text || "Go to website" }}
        </a>
      </div>

      <div
        v-if="!thankYouPage.enable"
        class="ccb-confirmation-preview__disabled-note ccb-text-s ccb-medium"
      >
        Confirmation page is disabled
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { IThankYouPage } from "@/admin/shared/types/settings.type";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";

const appearanceStore = useAppearanceStore();

const appearanceColorsData = computed<AppearanceColorsData | undefined>(() => {
  const desktop = appearanceStore.getActivePreset?.desktop as
    | Record<string, unknown>
    | undefined;
  const colors = desktop?.colors as { data?: AppearanceColorsData } | undefined;
  return colors?.data;
});

type AppearanceContainerColorField = {
  value?: { color?: string };
  data?: {
    color?: { value?: string };
    value?: { color?: string };
  };
};

type AppearanceColorsData = Record<string, unknown>;

type AppearanceBorderColorField = {
  value?: { color?: string };
  data?: {
    color?: { value?: string };
    value?: { color?: string };
  };
};

type AppearanceTextColorField = {
  value?: string;
  data?: { value?: string };
};

type AppearanceAccentColorField = {
  value?: string;
  data?: { value?: string };
};

const containerColor = computed(() => {
  const container = appearanceColorsData.value?.container as
    | AppearanceContainerColorField
    | undefined;
  return (
    container?.data?.color?.value ??
    container?.data?.value?.color ??
    container?.value?.color ??
    ""
  );
});

const borderColor = computed(() => {
  const border = appearanceColorsData.value?.border as
    | AppearanceBorderColorField
    | undefined;
  return (
    border?.data?.color?.value ??
    border?.data?.value?.color ??
    border?.value?.color ??
    ""
  );
});

const textColor = computed(() => {
  const text = appearanceColorsData.value?.primary_color as
    | AppearanceTextColorField
    | undefined;
  return text?.data?.value ?? text?.value ?? "";
});

const accentColor = computed(() => {
  const accent = appearanceColorsData.value?.accent_color as
    | AppearanceAccentColorField
    | undefined;
  return accent?.data?.value ?? accent?.value ?? "";
});

const orderNoticeColor = computed(() => {
  return `${accentColor.value}30`;
});

const orderNoticeLightColor = computed(() => {
  return `${accentColor.value}30`;
});

const settingsStore = useSettingsStore();

const thankYouPage = computed<IThankYouPage>(() => {
  return settingsStore.getSettings?.thankYouPage as IThankYouPage;
});
</script>

<style scoped lang="scss">
.ccb-confirmation-content {
  width: 100%;
  height: calc(100vh - 280px);
  display: flex;
  flex-direction: column;
  column-gap: 18px;
  margin: 20px 0;

  &__header {
    color: var(--ccb-font-labels);
    margin-left: 40px;
  }
}

.ccb-confirmation-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: v-bind(orderNoticeColor);
  padding: 12px 20px;
  color: v-bind(accentColor) !important;
  border-radius: 12px;
  width: fit-content;
  margin-left: 38px;
  margin-top: 38px;

  &__text {
    font-size: 20px;
    font-weight: 600;
  }

  &__icon-inner {
    background-color: v-bind(accentColor) !important;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 8px;
    }
  }

  &__icon {
    width: 42px;
    height: 42px;
    color: #fff;
    background-color: v-bind(orderNoticeLightColor) !important;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.ccb-confirmation-preview {
  margin: auto;
  width: 100%;
  height: 100%;
  border: 1px solid v-bind(borderColor);
  background: v-bind(containerColor);
  border-radius: 12px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 16px;
  transition: opacity 0.2s ease;
  margin: 40px;

  &.disabled {
    opacity: 0.6;
  }

  &__icon {
    width: 108px;
    height: 108px;
    border-radius: 50%;
    background: v-bind(orderNoticeLightColor);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon-inner {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    background: v-bind(accentColor);
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      color: v-bind(containerColor);
      font-size: 22px;
    }
  }

  &__text {
    text-align: center;
    display: flex;
    flex-direction: column;
    row-gap: 6px;
  }

  &__title {
    color: v-bind(textColor);
    font-size: 18px;
    font-weight: 700;
    line-height: 24px;
  }

  &__subtitle {
    color: v-bind(textColor);
    font-size: 14px;
    line-height: 20px;
    max-width: 420px;
  }

  &__order {
    display: flex;
    gap: 8px;
    color: v-bind(textColor);
  }

  &__buttons {
    width: 100%;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__button {
    min-width: 170px;
    text-align: center;
    border-radius: 8px;
    padding: 10px 14px;
    border: 1px solid transparent;
    font-weight: 600;
    font-size: 13px;
    line-height: 1;
    text-decoration: none;
    cursor: default;

    &--light {
      background: var(--ccb-input-normal);
      border-color: var(--ccb-input-normal);
      color: var(--ccb-text-color);
    }

    &--primary {
      background: v-bind(accentColor);
      border-color: v-bind(accentColor);
      color: #fff;
    }

    &--secondary {
      background: transparent;
      border-color: v-bind(accentColor);
      color: v-bind(accentColor);
    }
  }

  &__disabled-note {
    color: v-bind(textColor);
  }
}
</style>
