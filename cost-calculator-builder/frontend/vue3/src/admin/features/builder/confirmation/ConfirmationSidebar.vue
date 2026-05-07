<template>
  <div
    class="ccb-confirmation-sidebar ccb-sidebar ccb-custom-scrollbar"
    :class="{ 'ccb-block-sidebar': !appStore.getIsPro }"
  >
    <div class="ccb-sidebar__body">
      <div class="ccb-confirmation-sidebar__block">
        <Toggle
          :modelValue="thankYouPage.enable"
          label="Enable confirmation page"
          size="m"
          weight="medium"
          @update:modelValue="updateThankYouPage({ enable: $event })"
        />
        <template
          v-if="thankYouPage.enable && thankYouPage.type !== 'custom_page'"
        >
          <Dropdown
            label="Show this page on"
            :items="showPageOnItems"
            :modelValue="thankYouPage.type"
            @update:modelValue="
              (value) => updateThankYouPage({ type: value as string })
            "
          />
          <Dropdown
            v-if="thankYouPage.type === 'separate_page'"
            label="Select page"
            placeholder="Select page"
            :items="[]"
            :modelValue="thankYouPage.page_id"
            @update:modelValue="
              (value) => updateThankYouPage({ page_id: value as number })
            "
          />
          <Input
            label="Title"
            placeholder="Enter title"
            :modelValue="thankYouPage.title"
            @update:modelValue="
              updateThankYouPage({ title: String($event || '') })
            "
          />

          <Textarea
            label="Description"
            placeholder="Enter description"
            :rows="4"
            :modelValue="thankYouPage.description"
            @update:modelValue="
              updateThankYouPage({ description: String($event || '') })
            "
          />

          <Toggle
            :modelValue="thankYouPage.showOrderId"
            label="Show Order ID"
            size="m"
            weight="medium"
            @update:modelValue="updateThankYouPage({ showOrderId: $event })"
          />

          <Input
            v-if="thankYouPage.showOrderId"
            label="Order ID label"
            placeholder="Enter label"
            :modelValue="thankYouPage.order_title"
            @update:modelValue="
              updateThankYouPage({ order_title: String($event || '') })
            "
          />

          <Input
            v-if="
              thankYouPage.type === 'same_page' ||
              thankYouPage.type === 'separate_page'
            "
            label="Back to Calculator text"
            placeholder="Back to calculator"
            :modelValue="thankYouPage.back_button_text"
            @update:modelValue="
              updateThankYouPage({ back_button_text: String($event || '') })
            "
          />

          <Toggle
            :modelValue="thankYouPage.download_button"
            label="Download PDF button"
            size="m"
            weight="medium"
            @update:modelValue="updateThankYouPage({ download_button: $event })"
          />

          <Input
            v-if="thankYouPage.download_button"
            label="Download PDF button text"
            placeholder="Download PDF"
            :modelValue="thankYouPage.download_button_text"
            @update:modelValue="
              updateThankYouPage({ download_button_text: String($event || '') })
            "
          />

          <Toggle
            :modelValue="thankYouPage.share_button"
            label="Share PDF button"
            size="m"
            weight="medium"
            @update:modelValue="updateThankYouPage({ share_button: $event })"
          />

          <Input
            v-if="thankYouPage.share_button"
            label="Share PDF button text"
            placeholder="Enter button text"
            :modelValue="thankYouPage.share_button_text"
            @update:modelValue="
              updateThankYouPage({ share_button_text: String($event || '') })
            "
          />

          <Toggle
            :modelValue="thankYouPage.custom_button"
            label="Custom Website button"
            size="m"
            weight="medium"
            @update:modelValue="updateThankYouPage({ custom_button: $event })"
          />

          <Input
            v-if="thankYouPage.custom_button"
            label="Custom Website button text"
            placeholder="Enter button text"
            :modelValue="thankYouPage.custom_button_text"
            @update:modelValue="
              updateThankYouPage({ custom_button_text: String($event || '') })
            "
          />

          <Input
            v-if="thankYouPage.custom_button"
            label="Custom button link"
            placeholder="https://"
            :modelValue="thankYouPage.custom_button_link"
            @update:modelValue="
              updateThankYouPage({ custom_button_link: String($event || '') })
            "
          />
        </template>
        <template
          v-else-if="thankYouPage.enable && thankYouPage.type === 'custom_page'"
        >
          <Dropdown
            label="Show this page on"
            :items="showPageOnItems"
            :modelValue="thankYouPage.type"
            @update:modelValue="
              (value) => updateThankYouPage({ type: value as string })
            "
          />
          <Input
            label="Custom page link"
            placeholder="https://"
            :modelValue="thankYouPage.custom_page_link"
            @update:modelValue="
              updateThankYouPage({ custom_page_link: String($event || '') })
            "
          />
        </template>
        <template v-else>
          <Textarea
            label="Order completion message"
            placeholder="Enter message"
            :rows="4"
            :modelValue="thankYouPage.complete_msg"
            @update:modelValue="
              updateThankYouPage({ complete_msg: String($event || '') })
            "
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { IThankYouPage } from "@/admin/shared/types/settings.type";
import { Input, Toggle, Dropdown, Textarea } from "@/admin/shared/ui/UIKit";

const appStore = useAppStore();

const settingsStore = useSettingsStore();

const showPageOnItems = [
  { label: "The Same page as calculator", value: "same_page" },
  { label: "Popup above calculator", value: "modal" },
  { label: "Separate page", value: "separate_page" },
  { label: "Custom page", value: "custom_page" },
];

const thankYouPage = computed<IThankYouPage>(() => {
  return settingsStore.getSettings?.thankYouPage as IThankYouPage;
});

const updateThankYouPage = (partial: Partial<IThankYouPage>): void => {
  const settings = settingsStore.getSettings;
  if (!settings) return;

  settingsStore.setSettings({
    ...settings,
    thankYouPage: {
      ...settings.thankYouPage,
      ...partial,
    },
  });
};
</script>

<style scoped lang="scss">
.ccb-confirmation-sidebar {
  width: 100%;
  height: calc(100vh - 175px);
  color: var(--ccb-font-labels);
  overflow-y: auto;

  &__block {
    display: flex;
    flex-direction: column;
    row-gap: 14px;
    border-radius: 12px;
    background-color: var(--ccb-bgr-sidebar);
    padding: 24px 16px;
  }
}

.ccb-block-sidebar {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
</style>
