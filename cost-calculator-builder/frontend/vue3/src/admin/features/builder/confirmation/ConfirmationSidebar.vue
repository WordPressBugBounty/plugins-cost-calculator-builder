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
            @update:modelValue="updateThankYouPageType"
          />
          <PaginatedSelect
            v-if="thankYouPage.type === 'separate_page'"
            label="Select page"
            :items="wpPageItems"
            :has-more="wpPagesHasMore"
            :loading="wpPagesLoading"
            :multiselect="false"
            :selected-label="wpSelectedPageLabel"
            placeholder="Select page"
            empty-message="No pages found"
            name="thankYouPagePageId"
            v-model="thankYouPagePageId"
            @search="onWpPageSearch"
            @load-more="onWpPageLoadMore"
            @limit-change="onWpPageLimitChange"
            @change="onWpPageChange"
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
            @update:modelValue="updateThankYouPageType"
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
import { computed, ref } from "vue";
import axios from "axios";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { IThankYouPage } from "@/admin/shared/types/settings.type";
import { IPaginatedSelectItem } from "@/admin/shared/types/uikit.type";
import {
  Input,
  Toggle,
  Dropdown,
  Textarea,
  PaginatedSelect,
} from "@/admin/shared/ui/UIKit";

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

const thankYouPagePageId = computed<number | null>({
  get() {
    return thankYouPage.value.page_id || null;
  },
  set(value) {
    updateThankYouPage({ page_id: value || 0 });
  },
});

interface WpPageRaw {
  id: number;
  title: string;
  link: string;
  tooltip?: string;
}

const wpPagesRaw = ref<WpPageRaw[]>([]);
const wpPagesLoading = ref(false);
const wpPagesHasMore = ref(false);
const wpPageSearch = ref("");
const wpPageLimit = ref(5);
const wpPagePage = ref(1);
const wpPagesFetched = ref(false);
const wpSelectedPageLabel = ref("");

const fetchWpPages = async (reset = false): Promise<void> => {
  wpPagesLoading.value = true;
  if (reset) {
    wpPagePage.value = 1;
    wpPagesRaw.value = [];
  }

  try {
    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
    const response = await axios.get(ajaxUrl, {
      params: {
        action: "calc_get_wp_pages",
        nonce: (window as any).ccb_nonces?.calc_load_pages || "",
        page: wpPagePage.value,
        per_page: wpPageLimit.value,
        search: wpPageSearch.value,
        page_ids: thankYouPage.value.page_id
          ? String(thankYouPage.value.page_id)
          : "",
      },
    });

    if (response.data?.success) {
      const pages: WpPageRaw[] = response.data.pages || [];
      if (reset || wpPagePage.value === 1) {
        wpPagesRaw.value = pages;
      } else {
        const existingIds = new Set(wpPagesRaw.value.map((p) => p.id));
        const newPages = pages.filter((p) => !existingIds.has(p.id));
        wpPagesRaw.value = [...wpPagesRaw.value, ...newPages];
      }
      wpPagesHasMore.value = !!response.data.has_more;
      initWpPageLabel();
    }
    wpPagesFetched.value = true;
  } catch {
    wpPagesRaw.value = [];
    wpPagesHasMore.value = false;
  } finally {
    wpPagesLoading.value = false;
  }
};

const wpPageItems = computed((): IPaginatedSelectItem[] => {
  if (!wpPagesFetched.value && !wpPagesLoading.value) {
    fetchWpPages();
  }
  return wpPagesRaw.value.map((p) => ({
    id: p.id,
    label: p.tooltip || p.title,
  }));
});

const onWpPageSearch = (query: string): void => {
  wpPageSearch.value = query;
  fetchWpPages(true);
};

const onWpPageLoadMore = (): void => {
  wpPagePage.value += 1;
  fetchWpPages();
};

const onWpPageLimitChange = (newLimit: number): void => {
  wpPageLimit.value = newLimit;
  fetchWpPages(true);
};

const initWpPageLabel = (): void => {
  const found = wpPagesRaw.value.find(
    (p) => p.id === thankYouPage.value.page_id,
  );
  if (found && !wpSelectedPageLabel.value) {
    wpSelectedPageLabel.value = found.tooltip || found.title;
  }
};

const onWpPageChange = (_name: string, value: number): void => {
  const found = wpPagesRaw.value.find((p) => p.id === value);
  wpSelectedPageLabel.value = found ? found.tooltip || found.title : "";
};

const updateThankYouPageType = (value: unknown): void => {
  updateThankYouPage({ type: String(value || "") });
};

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
