<template>
  <div class="ccb-settings-section">
    <SettingsBlock>
      <div class="ccb-settings__row">
        <div class="ccb-settings__col">
          <Toggle
            v-model="stickyEnabled"
            label="Enable Sticky Calculator"
            name="stickyEnabled"
            @change="updateProperties"
          />
          <Text
            class="ccb-settings__description"
            text="Add a sticky button that remains visible when users scroll down the page"
            size="m"
            weight="regular"
            style="padding-left: 54px"
          />
        </div>
      </div>
      <template v-if="stickyEnabled">
        <div class="ccb-settings__row">
          <div class="ccb-settings__col" style="max-width: 307px">
            <Tab
              :items="tabItems"
              v-model="displayType"
              name="displayType"
              @change="updateProperties"
            />
          </div>
        </div>
        <div class="ccb-settings__row" v-if="displayType === 'btn'">
          <div class="ccb-settings__col">
            <div class="ccb-sticky-button">
              <div class="ccb-sticky-button__header">
                <Text text="Button position" size="m" weight="regular" />
              </div>
              <div class="ccb-sticky-button__body">
                <div
                  class="ccb-sticky-button__body__item"
                  :class="{
                    'ccb-sticky-button__body__item--active':
                      stickyButtonPosition === position,
                  }"
                  v-for="position in stickyButtonPositions"
                  :key="position"
                  :style="getPositionStyle(position)"
                  :data-position="position"
                  @click="updatePosition(position)"
                ></div>
                <div
                  class="ccb-sticky-button-preview"
                  :style="getPositionStyle(stickyButtonPosition)"
                >
                  <div
                    class="ccb-sticky-button-preview__icon"
                    v-if="!stickyIconHide"
                  >
                    <template v-if="!stickyIcon">
                      <i class="ccb-icon-ic_calc"></i>
                    </template>
                    <template v-else>
                      <img
                        class="ccb-sticky-button-preview__icon--image"
                        :src="stickyIcon"
                        alt="icon svg"
                      />
                    </template>
                  </div>
                  <div class="ccb-sticky-button-preview__text">
                    {{ getTitle }}
                  </div>
                  <div class="ccb-sticky-button-preview__toggle">
                    <i class="ccb-icon-Down" style="font-size: 10px"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ccb-settings__row" v-if="displayType === 'banner'">
          <div class="flex-column" style="width: 100%">
            <div class="ccb-settings__col">
              <Radio
                label="Position"
                name="stickyBannerPosition"
                v-model="stickyBannerPosition"
                :options="stickyBannerPositions"
                @change="updateProperties"
                layout="row"
              />
            </div>
            <div class="ccb-settings__col">
              <div class="ccb-sticky-banner-preview">
                <div class="ccb-sticky-banner-preview__placeholder">
                  <Text text="Page content" size="m" weight="regular" />
                </div>
                <div
                  class="ccb-sticky-banner-preview__content"
                  :style="getBannerPositionStyle(stickyBannerPosition)"
                >
                  <div
                    class="ccb-sticky-banner-preview__icon"
                    v-if="!stickyIconHide"
                  >
                    <template v-if="!stickyIcon">
                      <i class="ccb-icon-ic_calc"></i>
                    </template>
                    <template v-else>
                      <img
                        class="ccb-sticky-banner-preview__icon--image"
                        :src="stickyIcon"
                        alt="icon svg"
                      />
                    </template>
                  </div>
                  <div class="ccb-sticky-banner-preview__text">
                    <Text :text="getTitle" size="m" weight="medium" />
                  </div>
                  <div class="ccb-sticky-banner-preview__button">
                    <Text
                      :text="stickyBannerButtonText"
                      size="m"
                      weight="medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <IconSelector
              :iconUrl="stickyIcon"
              :index="0"
              :select_text="'Select Icon'"
              :svg="false"
              @set="updateIcon"
            />
          </div>
          <div class="ccb-settings__col" style="align-content: center">
            <Toggle
              v-model="stickyIconHide"
              label="Hide Icon"
              name="stickyIconHide"
              @change="updateProperties"
            />
          </div>
        </div>

        <div class="ccb-settings__row">
          <div class="ccb-settings__col" style="max-width: 50%">
            <Dropdown
              label="Title"
              :items="titleItems"
              name="stickyTitle"
              v-model="stickyTitle"
              @change="updateProperties"
            />
          </div>
          <div class="ccb-settings__col" v-if="stickyTitle === 'custom'">
            <Input
              label="Custom Title"
              placeholder="Enter custom title"
              name="stickyTitleCustom"
              v-model="stickyTitleCustom"
              @change="updateProperties"
            />
          </div>
        </div>

        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <PaginatedSelect
              label="Not show on pages"
              :items="wpPageItems"
              :has-more="wpPagesHasMore"
              :loading="wpPagesLoading"
              :multiselect="true"
              placeholder="Select pages"
              empty-message="No pages found"
              name="stickyPagesList"
              v-model="stickyPagesList"
              @search="onWpPageSearch"
              @load-more="onWpPageLoadMore"
              @limit-change="onWpPageLimitChange"
              @select-all="onWpPageSelectAll"
              @change="updateProperties"
            />
          </div>
          <div class="ccb-settings__col">
            <MultiSelect
              label="Select Totals"
              :items="totalsItems"
              name="stickyTotalsList"
              v-model="stickyTotalsList"
            />
          </div>
        </div>

        <div class="ccb-settings__row">
          <div class="ccb-settings__col" style="max-width: 307px">
            <Dropdown
              label="Click Action"
              :items="clickActionItems"
              name="stickyClickAction"
              v-model="stickyClickAction"
              @change="updateProperties"
            />
          </div>
          <div class="ccb-settings__col" v-if="displayType === 'banner'">
            <Input
              label="Button Text"
              placeholder="Calculate Now"
              name="stickyBannerButtonText"
              v-model="stickyBannerButtonText"
              @change="updateProperties"
            />
          </div>
        </div>

        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Toggle
              label="Show Calculator in background"
              name="stickyShowCalculatorInBackground"
              v-model="stickyShowCalculatorInBackground"
              @change="updateProperties"
            />
          </div>
        </div>

        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Textarea
              label="Additional classes"
              placeholder="Enter additional classes"
              name="stickyClasses"
              v-model="stickyClasses"
              @change="updateProperties"
            />
          </div>
        </div>
      </template>
    </SettingsBlock>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";
import SettingsBlock from "@/admin/features/settings/SettingsBlock.vue";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { ISettings } from "@/admin/shared/types/settings.type";
import { useCommonSettings } from "@/admin/features/settings/sections/composables/useCommonSettings";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { TabItem } from "@/admin/shared/types/template.type";
import {
  IRadioOption,
  IPaginatedSelectItem,
} from "@/admin/shared/types/uikit.type";
import {
  Toggle,
  Text,
  Input,
  Textarea,
  Radio,
  PaginatedSelect,
} from "@/admin/shared/ui/UIKit";
import { IDropdownOption } from "@/admin/shared/types/uikit.type";
import Dropdown from "@/admin/shared/ui/UIKit/Dropdown.vue";
import MultiSelect from "@/admin/shared/ui/UIKit/MultiSelect.vue";
import IconSelector from "@/admin/shared/ui/UIKit/IconSelector.vue";

const settingsStore = useSettingsStore();
const calculatorStore = useCalculatorStore();
const { totalFields, syncFormulas } = useCommonSettings();

const stickyEnabled = ref<boolean>(
  settingsStore.getSettings?.sticky_calc.enable || false,
);

const displayType = ref<string>(
  settingsStore.getSettings?.sticky_calc.display_type || "btn",
);

const tabItems = ref<TabItem[]>([
  {
    id: "btn",
    label: "Floating Button",
  },
  {
    id: "banner",
    label: "Sticky Banner",
  },
]);

const titleItems = ref<IDropdownOption[]>([
  {
    label: "Calculator Title",
    value: "calc_title",
  },
  {
    label: "Custom Title",
    value: "custom",
  },
]);

const stickyTitle = ref<string>(
  settingsStore.getSettings?.sticky_calc.title || "calc_title",
);

const stickyTitleCustom = ref<string>(
  settingsStore.getSettings?.sticky_calc.custom_text || "",
);

const getTitle = computed(() => {
  if (stickyTitle.value === "custom") {
    return stickyTitleCustom.value;
  }
  return calculatorStore.getTitle;
});

const stickyPagesList = ref<string[]>(
  settingsStore.getSettings?.sticky_calc.pages || [],
);

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
        page_ids: stickyPagesList.value.join(","),
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

const onWpPageSelectAll = (): void => {
  const allIds = wpPagesRaw.value.map((p) => p.id);
  const currentIds = stickyPagesList.value;
  const allSelected = allIds.every((id) => currentIds.includes(String(id)));

  if (allSelected) {
    stickyPagesList.value = [];
  } else {
    const merged = new Set([...currentIds, ...allIds.map(String)]);
    stickyPagesList.value = Array.from(merged);
  }

  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;
  settings.sticky_calc.pages = stickyPagesList.value;
  settingsStore.setSettings(settings);
};

const totalsItems = totalFields;

const stickyTotalsList = computed({
  get() {
    const saved = settingsStore.getSettings?.sticky_calc.formulas || [];
    const synced = syncFormulas(saved);
    return synced.map((f) => f.alias);
  },
  set(value: string[]) {
    const available = totalFields.value;
    const matched = available.filter((t) => value.includes(t.alias));

    const settings = JSON.parse(
      JSON.stringify(settingsStore.getSettings),
    ) as ISettings;
    settings.sticky_calc.formulas = matched.map((t) => ({
      idx: t.idx,
      alias: t.alias,
      title: t.title,
    }));
    settings.sticky_calc.formulas_list = matched.map((t) => t.alias);
    settingsStore.setSettings(settings);
  },
});

const clickActionItems = computed<IDropdownOption[]>(() => {
  const disableBackgroundActions = !stickyShowCalculatorInBackground.value;

  return [
    {
      label: "Scroll to calculator",
      value: "scroll_to",
    },
    {
      label: "Open a pop-up",
      value: "open_modal",
    },
    {
      label: "Pop up order form or payments",
      value: "pro_features",
    },
    {
      label: "Download PDF",
      value: "pdf",
      disabled: disableBackgroundActions,
    },
    {
      label: "Share invoice",
      value: "invoice",
      disabled: disableBackgroundActions,
    },
    {
      label: "WooCheckout action after submit",
      value: "woo_checkout",
    },
    {
      label: "WooProduct as open modal",
      value: "woo_product_as_modal",
    },
    {
      label: "WooProduct with redirect",
      value: "woo_product_with_redirect",
    },
  ];
});

const stickyClickAction = ref<string>(
  settingsStore.getSettings?.sticky_calc.one_click_action || "scroll_to",
);

const stickyShowCalculatorInBackground = ref<boolean>(
  settingsStore.getSettings?.sticky_calc.show_calculator || false,
);

const stickyBannerButtonText = ref<string>(
  settingsStore.getSettings?.sticky_calc.btn_text || "Calculate Now",
);

const stickyClasses = ref<string>(
  settingsStore.getSettings?.sticky_calc.classes || "",
);

const stickyButtonPosition = ref<string>(
  settingsStore.getSettings?.sticky_calc.btn_position || "bottom_left",
);

const stickyIcon = ref<string | null>(
  settingsStore.getSettings?.sticky_calc.icon || "",
);

const stickyIconHide = ref<boolean>(
  settingsStore.getSettings?.sticky_calc.hide_icon || false,
);

const updateIcon = (value: string | null) => {
  stickyIcon.value = value || null;
  updateProperties("stickyIcon", value);
};

const stickyButtonPositions = ref<string[]>([
  "bottom_left",
  "bottom_right",
  "top_left",
  "top_right",
  "center_left",
  "center_right",
  "bottom_center",
  "top_center",
]);

const getPositionStyle = (position: string) => {
  const positions = [
    {
      position: "bottom_left",
      style: {
        bottom: "0",
        left: "0",
        right: "auto",
        top: "auto",
      },
    },
    {
      position: "bottom_right",
      style: {
        left: "auto",
        top: "auto",
        bottom: "0",
        right: "0",
      },
    },
    {
      position: "top_left",
      style: {
        right: "auto",
        bottom: "auto",
        top: "0",
        left: "0",
      },
    },
    {
      position: "top_right",
      style: {
        left: "auto",
        bottom: "auto",
        top: "0",
        right: "0",
      },
    },
    {
      position: "center_left",
      style: {
        top: "50%",
        transform: "translateY(-50%)",
        left: "0",
        right: "auto",
        bottom: "auto",
      },
    },
    {
      position: "center_right",
      style: {
        top: "50%",
        right: "0",
        bottom: "auto",
        left: "auto",
        transform: "translateY(-50%)",
      },
    },
    {
      position: "top_center",
      style: {
        top: "0",
        right: "50%",
        left: "auto",
        bottom: "auto",
        transform: "translateX(50%)",
      },
    },
    {
      position: "bottom_center",
      style: {
        bottom: "0",
        left: "50%",
        right: "auto",
        top: "auto",
        transform: "translateX(-50%)",
      },
    },
  ];

  return positions.find((p) => p.position === position)?.style || {};
};

const updatePosition = (position: string) => {
  stickyButtonPosition.value = position;
  updateProperties("stickyButtonPosition", position);
};

const stickyBannerPosition = ref<string>(
  settingsStore.getSettings?.sticky_calc.banner_position || "top",
);

const stickyBannerPositions = ref<IRadioOption[]>([
  {
    label: "On The Top",
    value: "top",
  },
  {
    label: "At The Bottom",
    value: "bottom",
  },
]);

const getBannerPositionStyle = (position: string) => {
  return {
    [position]: "0",
  };
};

const updateProperties = (
  name: string,
  value: boolean | string | number | TabItem | null,
) => {
  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;

  if (name === "stickyEnabled") {
    settings.sticky_calc.enable = value as boolean;
    stickyEnabled.value = value as boolean;
  }

  if (name === "displayType") {
    settings.sticky_calc.display_type = value as string;
    displayType.value = value as string;
  }

  if (name === "stickyTitle") {
    settings.sticky_calc.title = value as string;
    stickyTitle.value = value as string;
  }

  if (name === "stickyTitleCustom") {
    settings.sticky_calc.custom_text = value as string;
    stickyTitleCustom.value = value as string;
  }

  if (name === "stickyPagesList") {
    settings.sticky_calc.pages = value as unknown as string[];
    stickyPagesList.value = value as unknown as string[];
  }

  if (name === "stickyClickAction") {
    settings.sticky_calc.one_click_action = value as string;
    stickyClickAction.value = value as string;
  }

  if (name === "stickyShowCalculatorInBackground") {
    settings.sticky_calc.show_calculator = value as boolean;
    stickyShowCalculatorInBackground.value = value as boolean;
  }

  if (name === "stickyBannerButtonText") {
    settings.sticky_calc.btn_text = value as string;
    stickyBannerButtonText.value = value as string;
  }

  if (name === "stickyClasses") {
    settings.sticky_calc.classes = value as string;
    stickyClasses.value = value as string;
  }

  if (name === "stickyButtonPosition") {
    settings.sticky_calc.btn_position = value as string;
    stickyButtonPosition.value = value as string;
  }

  if (name === "stickyBannerPosition") {
    settings.sticky_calc.banner_position = value as string;
    stickyBannerPosition.value = value as string;
  }

  if (name === "stickyIconHide") {
    settings.sticky_calc.hide_icon = value as boolean;
    stickyIconHide.value = value as boolean;
  }

  if (name === "stickyIcon") {
    settings.sticky_calc.icon = value as string;
    stickyIcon.value = value as string;
  }

  settingsStore.setSettings(settings);
};
</script>

<style lang="scss">
.ccb-settings-section {
  .ccb-settings__row {
    .ccb-settings__col {
      .ccb-settings__description {
        color: var(--ccb-font-comment);
      }
    }

    .ccb-sticky-banner-preview {
      position: relative;
      width: 100%;
      height: 208px;
      background: var(--ccb-bw-dull-normal);
      border-radius: 12px;
      overflow: hidden;

      &__placeholder {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--ccb-font-labels);
      }

      &__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        position: absolute;
        left: auto;
        right: auto;
        width: 100%;
        padding: 12px 16px;
        z-index: 1;
        background: var(--ccb-wb-normal);
      }

      &__icon {
        color: var(--ccb-green-fg-normal);
        font-size: 24px;

        &--image {
          width: 24px;
          height: 24px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid var(--ccb-input-border);
        }
      }

      &__text {
        color: var(--ccb-font-labels);
      }

      &__button {
        background: var(--ccb-green-bg-normal);
        color: var(--ccb-w-normal);
        padding: 8px 16px;
        margin-left: auto;
        border-radius: 99px;
      }
    }

    .ccb-sticky-button {
      padding: 16px 24px;
      border-radius: 12px;
      background: var(--ccb-bw-dull-normal);

      .ccb-sticky-button__header {
        padding-bottom: 16px;
        color: var(--ccb-font-labels);
      }

      .ccb-sticky-button-preview {
        position: absolute;
        top: 0;
        left: 0;
        width: 232px;
        padding: 0 16px;
        background: var(--ccb-wb-normal);
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 16px;
        height: 40px;

        &__icon {
          color: var(--ccb-green-fg-normal);
          font-size: 24px;

          &--image {
            width: 24px;
            height: 24px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid var(--ccb-input-border);
          }
        }

        &__text {
          color: var(--ccb-font-labels);
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &__toggle {
          color: var(--ccb-green-fg-normal);
          font-size: 14px;
          margin-left: auto;
        }
      }

      .ccb-sticky-button__body {
        display: flex;
        height: 152px;
        position: relative;

        &__item {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          position: absolute;
          cursor: pointer;
          background: var(--ccb-wb-normal);

          &--active {
            opacity: 0;
          }
        }
      }
    }
  }
}
</style>
