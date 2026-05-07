<template>
  <div class="ccb-settings-section">
    <template v-if="isWooCommerceActive">
      <SettingsBlock>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Text text="Woocommerce" size="m" weight="bold" />
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Toggle
              v-model="wooProductsEnabled"
              label="Calculator for WooCommerce Products"
              name="wooProductsEnabled"
              @change="updateProperties"
            />
          </div>
        </div>
        <div v-if="wooProductsEnabled">
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <Toggle
                v-model="woocommerceProductsByCategoryEnabled"
                label="Show calculator by category"
                name="woocommerceProductsByCategoryEnabled"
                @change="onWooTypeChange"
              />
            </div>
          </div>
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <Toggle
                v-model="woocommerceProductsByProductEnabled"
                label="Show calculator by product"
                name="woocommerceProductsByProductEnabled"
                @change="onWooTypeChange"
              />
            </div>
          </div>
          <div class="ccb-settings__row">
            <div
              class="ccb-settings__col"
              v-if="woocommerceProductsByCategoryEnabled"
            >
              <PaginatedSelect
                v-model="woocommerceProductsByCategories"
                :items="wooCategoryItems"
                :has-more="wooCategoriesHasMore"
                :loading="wooCategoriesLoading"
                :multiselect="true"
                label="Product Category"
                placeholder="Select Product Category"
                empty-message="No categories found"
                name="woocommerceProductsByCategories"
                @search="onWooCategorySearch"
                @load-more="onWooCategoryLoadMore"
                @limit-change="onWooCategoryLimitChange"
                @select-all="onWooCategorySelectAll"
                @change="updateProperties"
              />
            </div>
            <div
              class="ccb-settings__col"
              v-if="woocommerceProductsByProductEnabled"
            >
              <PaginatedSelect
                v-model="woocommerceProductsByProducts"
                :items="wooProductItems"
                :has-more="wooProductsHasMore"
                :loading="wooProductsLoading"
                :multiselect="true"
                label="Product"
                placeholder="Select Product"
                empty-message="No products found"
                name="woocommerceProductsByProducts"
                @search="onWooProductSearch"
                @load-more="onWooProductLoadMore"
                @limit-change="onWooProductLimitChange"
                @select-all="onWooProductSelectAll"
                @change="updateProperties"
              />
            </div>
            <div class="ccb-settings__col">
              <Dropdown
                v-model="woocommerceProductsCalculatorPosition"
                label="Calculator Position"
                :items="woocommerceProductsCalculatorPositionOptions"
                name="woocommerceProductsCalculatorPosition"
                @change="updateProperties"
              />
            </div>
          </div>
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <Toggle
                v-model="woocommerceProductsAddToCartFormEnabled"
                label="WooCommerce Add To Cart Form"
                name="woocommerceProductsAddToCartFormEnabled"
                @change="updateProperties"
              />
            </div>
          </div>
        </div>
      </SettingsBlock>

      <SettingsBlock v-if="wooProductsEnabled">
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Text
              text="Connect WooCommerce Meta to Calculator Fields:"
              size="m"
              weight="bold"
            />
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <RepeaterDropdown
              v-model="woocommerceProductsByProductMetaFields"
              :schema="woocommerceProductsByProductMetaFieldsSchema"
              label="WooCommerce Meta Fields"
              :maxRows="3"
              name="woocommerceProductsByProductMetaFields"
              @change="updateProperties"
            />
          </div>
        </div>
      </SettingsBlock>

      <SettingsBlock>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Text text="WooCommerce Checkout" size="m" weight="bold" />
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Toggle
              v-model="woocommerceCheckoutEnabled"
              label="WooCommerce Checkout"
              name="woocommerceCheckoutEnabled"
              @change="updateProperties"
            />
          </div>
        </div>
        <div v-if="woocommerceCheckoutEnabled">
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <PaginatedSelect
                v-model="woocommerceCheckoutProductId"
                :items="checkoutProductItems"
                :has-more="checkoutProductsHasMore"
                :loading="checkoutProductsLoading"
                :multiselect="false"
                :selected-label="checkoutSelectedProductLabel"
                label="Product"
                placeholder="Select a product"
                empty-message="No products found"
                name="woocommerceCheckoutProductId"
                @search="onCheckoutProductSearch"
                @load-more="onCheckoutProductLoadMore"
                @limit-change="onCheckoutProductLimitChange"
                @change="onCheckoutProductChange"
              />
            </div>
          </div>
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <Toggle
                v-model="woocommerceCheckoutReplaceProductEnabled"
                label="Replace Product"
                name="woocommerceCheckoutReplaceProductEnabled"
                @change="updateProperties"
              />
            </div>
          </div>
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <Radio
                v-model="woocommerceCheckoutRedirectTo"
                :options="woocommerceCheckoutOptions"
                label="WooCommerce Checkout"
                layout="row"
                name="woocommerceCheckoutRedirectTo"
                @change="updateProperties"
              />
            </div>
          </div>
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <MultiSelect
                v-model="woocommerceCheckoutTotalFields"
                :items="woocommerceCheckoutTotalFieldsOptions"
                label="Total Fields"
                placeholder="Select total fields"
                name="woocommerceCheckoutTotalFields"
                @change="updateProperties"
              />
            </div>
          </div>
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <div class="ccb-settings__description">
                Connect your selling service or product to online payment
                systems using the connection shortcode. Note that the 'Total
                Name' field will be renamed to 'Total'.
                <a
                  href="https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/woo-checkout"
                  target="_blank"
                  >Learn More</a
                >
              </div>
            </div>
          </div>
        </div>
      </SettingsBlock>

      <SettingsBlock>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Text text="Dynamic Product Quantity" size="m" weight="bold" />
            <div class="ccb-settings__description">
              Choose calculator fields that will update the product quantity in
              the cart based on the user's input.
              <a
                href="https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/woo-checkout"
                target="_blank"
                >Learn More</a
              >
            </div>
          </div>
        </div>
        <div class="ccb-settings__row">
          <div class="ccb-settings__col">
            <Toggle
              v-model="woocommerceDynamicProductQuantityEnabled"
              label="Enable Dynamic Product Quantity"
              name="woocommerceDynamicProductQuantityEnabled"
              @change="updateProperties"
            />
          </div>
        </div>
        <div
          class="ccb-settings__row"
          v-if="
            !woocommerceCheckoutEnabled &&
            woocommerceDynamicProductQuantityEnabled
          "
        >
          <div class="ccb-settings__col" style="width: 100%">
            <Notice type="warning">
              <Text
                text="Please enable Woo Checkout and select a product to adjust the count dynamically."
                size="m"
                weight="regular"
              />
            </Notice>
          </div>
        </div>
        <div v-if="woocommerceDynamicProductQuantityEnabled">
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <Text
                text="Link Calculator Fields to Product Quantity:"
                size="m"
                weight="bold"
              />
            </div>
          </div>
          <div class="ccb-settings__row">
            <div class="ccb-settings__col">
              <RepeaterDropdown
                v-model="woocommerceDynamicProductQuantityFields"
                :schema="woocommerceDynamicProductQuantityFieldsSchema"
                label="Product Quantity Fields"
                :maxRows="3"
                name="woocommerceDynamicProductQuantityFields"
                @change="updateProperties"
              />
            </div>
          </div>
          <div
            class="ccb-settings__row"
            v-if="woocommerceDynamicProductQuantityFields.length > 1"
          >
            <div class="ccb-settings__col">
              <div class="ccb-settings__description">
                When two or more fields are selected, the last field that is not
                hidden will be considered for updating the product count.
              </div>
            </div>
          </div>
        </div>
      </SettingsBlock>
    </template>

    <div v-else class="ccb-woo-not-installed">
      <div class="ccb-woo-not-installed-container">
        <div class="ccb-woo-not-installed-logo">
          <img :src="wooLogoUrl" alt="woo logo" />
        </div>
        <div class="ccb-woo-not-installed-title-box">
          <span class="ccb-woo-title">WooCommerce not installed</span>
          <span class="ccb-woo-description">
            To use WooProduct and WooCheckout, please install and activate
            WooCommerce Plugin
          </span>
        </div>
        <div class="ccb-woo-not-installed-action">
          <Button
            label="Install WooCommerce"
            size="m"
            @click="installWooCommerce"
            type="green"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";
import SettingsBlock from "@/admin/features/settings/SettingsBlock.vue";
import {
  Text,
  Toggle,
  Dropdown,
  Radio,
  RepeaterDropdown,
  MultiSelect,
  Notice,
  PaginatedSelect,
  Button,
} from "@/admin/shared/ui/UIKit";
import {
  IRepeaterDropdownField,
  IDropdownOption,
  IPaginatedSelectItem,
} from "@/admin/shared/types/uikit.type";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { ISettings } from "@/admin/shared/types/settings.type";
import { useCommonSettings } from "@/admin/features/settings/sections/composables/useCommonSettings";

const settingsStore = useSettingsStore();
const builderStore = useBuilderStore();
const { totalFields, syncFormulas } = useCommonSettings();

const isWooCommerceActive = computed(
  () => window.ccb_ajax_window?.woo_active ?? false,
);
const wooInstallUrl = computed(
  () =>
    window.ccb_ajax_window?.woo_install_url ||
    "/wp-admin/plugin-install.php?s=woocommerce&tab=search&type=term",
);
const wooLogoUrl = computed(
  () =>
    `${window.ccb_ajax_window?.plugin_url || ""}/frontend/dist/img/woo_logo.png`,
);

const installWooCommerce = () => {
  window.location.href = wooInstallUrl.value;
};

const updateProperties = (name: string, value: any) => {
  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;

  if (name === "wooProductsEnabled") {
    settings.woo_products.enable = value as boolean;
    wooProductsEnabled.value = value as boolean;
  }

  if (name === "woocommerceProductsByCategoryEnabled") {
    settings.woo_products.by_category = value as boolean;
    woocommerceProductsByCategoryEnabled.value = value as boolean;
  }

  if (name === "woocommerceProductsByProductEnabled") {
    settings.woo_products.by_product = value as boolean;
    woocommerceProductsByProductEnabled.value = value as boolean;
  }

  if (name === "woocommerceProductsAddToCartFormEnabled") {
    settings.woo_products.hide_woo_cart = value as boolean;
    woocommerceProductsAddToCartFormEnabled.value = value as boolean;
  }

  if (name === "woocommerceProductsCalculatorPosition") {
    settings.woo_products.hook_to_show = value as string;
    woocommerceProductsCalculatorPosition.value = value as string;
  }

  if (name === "woocommerceProductsByCategories") {
    settings.woo_products.category_ids = value as unknown as number[];
    woocommerceProductsByCategories.value = value as unknown as number[];
  }

  if (name === "woocommerceProductsByProducts") {
    settings.woo_products.product_ids = value as unknown as number[];
    woocommerceProductsByProducts.value = value as unknown as number[];
  }

  if (name === "woocommerceProductsByProductMetaFields") {
    settings.woo_products.meta_links = value as unknown as WooMetaLink[];
    woocommerceProductsByProductMetaFields.value =
      value as unknown as WooMetaLink[];
  }

  if (name === "woocommerceCheckoutEnabled") {
    settings.woo_checkout.enable = value as boolean;
    woocommerceCheckoutEnabled.value = value as boolean;
  }

  if (name === "woocommerceCheckoutProductId") {
    settings.woo_checkout.product_id = value as string | number;
    woocommerceCheckoutProductId.value = value as string | number;
  }

  if (name === "woocommerceCheckoutReplaceProductEnabled") {
    settings.woo_checkout.replace_product = value as boolean;
    woocommerceCheckoutReplaceProductEnabled.value = value as boolean;
  }

  if (name === "woocommerceCheckoutRedirectTo") {
    settings.woo_checkout.redirect_to = value as string;
    woocommerceCheckoutRedirectTo.value = value as string;
  }

  if (name === "woocommerceDynamicProductQuantityEnabled") {
    settings.woo_checkout.change_product_count = value as boolean;
    woocommerceDynamicProductQuantityEnabled.value = value as boolean;
  }

  if (name === "woocommerceDynamicProductQuantityFields") {
    settings.woo_checkout.stock_links = value as unknown as WooStockLink[];
    woocommerceDynamicProductQuantityFields.value =
      value as unknown as WooStockLink[];
  }

  settingsStore.setSettings(settings);
};

// WooCommerce Products -----------------------------------------------------------------
const wooProductsEnabled = ref<boolean>(
  settingsStore.getSettings?.woo_products?.enable || false,
);

const woocommerceProductsByCategoryEnabled = ref<boolean>(
  settingsStore.getSettings?.woo_products?.by_category || false,
);

const woocommerceProductsByProductEnabled = ref<boolean>(
  settingsStore.getSettings?.woo_products?.by_product || false,
);

const woocommerceProductsAddToCartFormEnabled = ref<boolean>(
  settingsStore.getSettings?.woo_products?.hide_woo_cart || false,
);

const woocommerceProductsCalculatorPosition = ref<string>(
  settingsStore.getSettings?.woo_products?.hook_to_show || "",
);

const woocommerceProductsByCategories = ref<number[]>(
  (settingsStore.getSettings?.woo_products?.category_ids || []).filter(
    (id) => !!id,
  ),
);

const woocommerceProductsByProducts = ref<number[]>(
  (settingsStore.getSettings?.woo_products?.product_ids || []).filter(
    (id) => !!id,
  ),
);

const onWooTypeChange = (name: string, value: any): void => {
  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;

  if (name === "woocommerceProductsByCategoryEnabled") {
    settings.woo_products.by_category = value as boolean;
    woocommerceProductsByCategoryEnabled.value = value as boolean;
    if (value) {
      settings.woo_products.by_product = false;
      woocommerceProductsByProductEnabled.value = false;
    }
  }

  if (name === "woocommerceProductsByProductEnabled") {
    settings.woo_products.by_product = value as boolean;
    woocommerceProductsByProductEnabled.value = value as boolean;
    if (value) {
      settings.woo_products.by_category = false;
      woocommerceProductsByCategoryEnabled.value = false;
    }
  }

  settingsStore.setSettings(settings);
};

type WooMetaLink = { woo_meta: string; action: string; calc_field: string };

const normalizeMetaLinks = (raw: unknown): WooMetaLink[] => {
  if (Array.isArray(raw)) {
    return raw.map((item) =>
      typeof item === "object" && item !== null
        ? {
            woo_meta: item.woo_meta || "",
            action: item.action || "",
            calc_field: item.calc_field || "",
          }
        : { woo_meta: "", action: "", calc_field: "" },
    );
  }
  if (raw && typeof raw === "object")
    return Object.values(raw).map((item: any) => ({
      woo_meta: item?.woo_meta || "",
      action: item?.action || "",
      calc_field: item?.calc_field || "",
    }));
  return [];
};

const woocommerceProductsByProductMetaFields = ref<WooMetaLink[]>(
  normalizeMetaLinks(settingsStore.getSettings?.woo_products?.meta_links),
);

const woocommerceProductsCalculatorPositionOptions = ref<IDropdownOption[]>([
  {
    label: "Before Single Product (At the Top of Product)",
    value: "woocommerce_before_single_product",
  },
  {
    label: "Before Add To Cart Form",
    value: "woocommerce_before_add_to_cart_form",
  },
  {
    label: "After Add To Cart Form",
    value: "woocommerce_after_add_to_cart_form",
  },
  { label: "Before Product Meta", value: "woocommerce_product_meta_start" },
  { label: "After Product Meta", value: "woocommerce_product_meta_end" },
  {
    label: "After Single Product Summary (Before Tabs)",
    value: "woocommerce_after_single_product_summary",
  },
  {
    label: "After Single Product (At the Bottom of Product)",
    value: "woocommerce_after_single_product",
  },
]);

const IGNORED_ALIAS_PREFIXES = [
  "text",
  "line",
  "html",
  "validated_form",
  "total",
  "file_upload",
  "datePicker",
  "timePicker",
  "geolocation",
  "group",
  "page_break",
  "repeater",
];

const getAliasPrefix = (alias: string): string =>
  alias.replace(/_field_id.*/, "");

const allBuilderFields = computed(() => {
  const result: { label: string; alias: string }[] = [];
  const pages = builderStore.getBuilderFields;

  for (const page of pages) {
    for (const section of page.groupElements) {
      for (const field of section.fields) {
        if (!field.alias) continue;
        if (!field.alias.includes("repeater")) {
          result.push({ label: field.label, alias: field.alias });
        }
        if (
          "groupElements" in field &&
          Array.isArray((field as any).groupElements)
        ) {
          for (const inner of (field as any).groupElements) {
            if (inner.alias) {
              result.push({ label: inner.label, alias: inner.alias });
            }
          }
        }
      }
    }
  }

  return result;
});

const allCalcFields = computed(() =>
  allBuilderFields.value.filter((f) => {
    const prefix = getAliasPrefix(f.alias);
    return !IGNORED_ALIAS_PREFIXES.includes(prefix);
  }),
);

const quantityAndRangeFields = computed(() =>
  allBuilderFields.value.filter(
    (f) => f.alias.startsWith("quantity") || f.alias.startsWith("range"),
  ),
);

const getCalcFieldOptionsForMeta = (
  row: Record<string, any>,
): IDropdownOption[] => {
  const source =
    row.woo_meta === "quantity"
      ? quantityAndRangeFields.value
      : allCalcFields.value;
  return source.map((f) => ({ label: f.label, value: f.alias }));
};

const woocommerceProductsByProductMetaFieldsSchema = computed(
  (): IRepeaterDropdownField[] => [
    {
      key: "woo_meta",
      options: [
        { label: "Product Price", value: "price" },
        { label: "Product Quantity", value: "quantity" },
      ],
      width: "1fr",
      required: true,
    },
    {
      key: "action",
      options: [
        { label: "Set Value", value: "set_value" },
        { label: "Set Value and Disable", value: "set_value_disable" },
      ],
      width: "1fr",
      required: true,
    },
    {
      key: "calc_field",
      options: getCalcFieldOptionsForMeta,
      width: "1fr",
      required: true,
    },
  ],
);

interface WooCategoryRaw {
  term_id: number;
  name: string;
  slug: string;
}

const wooCategoriesRaw = ref<WooCategoryRaw[]>([]);
const wooCategoriesLoading = ref(false);
const wooCategoriesHasMore = ref(false);
const wooCategorySearch = ref("");
const wooCategoryLimit = ref(5);
const wooCategoryPage = ref(1);
const wooCategoriesFetched = ref(false);

const fetchWooCategories = async (reset = false): Promise<void> => {
  wooCategoriesLoading.value = true;
  if (reset) {
    wooCategoryPage.value = 1;
    wooCategoriesRaw.value = [];
  }

  try {
    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
    const response = await axios.get(ajaxUrl, {
      params: {
        action: "calc_get_woo_categories",
        nonce: (window as any).ccb_nonces?.calc_load_woo_categories || "",
        page: wooCategoryPage.value,
        per_page: wooCategoryLimit.value,
        search: wooCategorySearch.value,
        category_ids: woocommerceProductsByCategories.value.join(","),
      },
    });

    if (response.data?.success) {
      const categories: WooCategoryRaw[] = response.data.categories || [];
      if (reset || wooCategoryPage.value === 1) {
        wooCategoriesRaw.value = categories;
      } else {
        const existingIds = new Set(
          wooCategoriesRaw.value.map((c) => c.term_id),
        );
        const newCategories = categories.filter(
          (c) => !existingIds.has(c.term_id),
        );
        wooCategoriesRaw.value = [...wooCategoriesRaw.value, ...newCategories];
      }
      wooCategoriesHasMore.value = !!response.data.has_more;
    }
    wooCategoriesFetched.value = true;
  } catch {
    wooCategoriesRaw.value = [];
    wooCategoriesHasMore.value = false;
  } finally {
    wooCategoriesLoading.value = false;
  }
};

const wooCategoryItems = computed((): IPaginatedSelectItem[] => {
  if (!wooCategoriesFetched.value && !wooCategoriesLoading.value) {
    fetchWooCategories();
  }
  return wooCategoriesRaw.value.map((c) => ({
    id: c.term_id,
    label: c.name,
  }));
});

const onWooCategorySearch = (query: string): void => {
  wooCategorySearch.value = query;
  fetchWooCategories(true);
};

const onWooCategoryLoadMore = (): void => {
  wooCategoryPage.value += 1;
  fetchWooCategories();
};

const onWooCategoryLimitChange = (newLimit: number): void => {
  wooCategoryLimit.value = newLimit;
  fetchWooCategories(true);
};

const onWooCategorySelectAll = (): void => {
  const allIds = wooCategoriesRaw.value.map((c) => c.term_id);
  const currentIds = woocommerceProductsByCategories.value;
  const allSelected = allIds.every((id) => currentIds.includes(id));

  if (allSelected) {
    woocommerceProductsByCategories.value = [];
  } else {
    const merged = new Set([...currentIds, ...allIds]);
    woocommerceProductsByCategories.value = Array.from(merged);
  }

  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;
  settings.woo_products.category_ids = woocommerceProductsByCategories.value;
  settingsStore.setSettings(settings);
};

interface WooProductRaw {
  ID: number;
  post_title: string;
}

const wooProductsRaw = ref<WooProductRaw[]>([]);
const wooProductsLoading = ref(false);
const wooProductsHasMore = ref(false);
const wooProductSearch = ref("");
const wooProductLimit = ref(5);
const wooProductPage = ref(1);
const wooProductsFetched = ref(false);

const fetchWooProducts = async (reset = false): Promise<void> => {
  wooProductsLoading.value = true;
  if (reset) {
    wooProductPage.value = 1;
    wooProductsRaw.value = [];
  }

  try {
    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
    const response = await axios.get(ajaxUrl, {
      params: {
        action: "calc_get_products",
        nonce: (window as any).ccb_nonces?.calc_load_more_products || "",
        page: wooProductPage.value,
        per_page: wooProductLimit.value,
        search: wooProductSearch.value,
        product_ids: woocommerceProductsByProducts.value.join(","),
        called_by: "woo_products",
      },
    });

    if (response.data?.success) {
      const products: WooProductRaw[] = response.data.products || [];
      if (reset || wooProductPage.value === 1) {
        wooProductsRaw.value = products;
      } else {
        const existingIds = new Set(wooProductsRaw.value.map((p) => p.ID));
        const newProducts = products.filter((p) => !existingIds.has(p.ID));
        wooProductsRaw.value = [...wooProductsRaw.value, ...newProducts];
      }
      wooProductsHasMore.value = !!response.data.has_more;
    }
    wooProductsFetched.value = true;
  } catch {
    wooProductsRaw.value = [];
    wooProductsHasMore.value = false;
  } finally {
    wooProductsLoading.value = false;
  }
};

const wooProductItems = computed((): IPaginatedSelectItem[] => {
  if (!wooProductsFetched.value && !wooProductsLoading.value) {
    fetchWooProducts();
  }
  return wooProductsRaw.value.map((p) => ({
    id: p.ID,
    label: p.post_title,
  }));
});

const onWooProductSearch = (query: string): void => {
  wooProductSearch.value = query;
  fetchWooProducts(true);
};

const onWooProductLoadMore = (): void => {
  wooProductPage.value += 1;
  fetchWooProducts();
};

const onWooProductLimitChange = (newLimit: number): void => {
  wooProductLimit.value = newLimit;
  fetchWooProducts(true);
};

const onWooProductSelectAll = (): void => {
  const allIds = wooProductsRaw.value.map((p) => p.ID);
  const currentIds = woocommerceProductsByProducts.value;
  const allSelected = allIds.every((id) => currentIds.includes(id));

  if (allSelected) {
    woocommerceProductsByProducts.value = [];
  } else {
    const merged = new Set([...currentIds, ...allIds]);
    woocommerceProductsByProducts.value = Array.from(merged);
  }

  const settings = JSON.parse(
    JSON.stringify(settingsStore.getSettings),
  ) as ISettings;
  settings.woo_products.product_ids = woocommerceProductsByProducts.value;
  settingsStore.setSettings(settings);
};

// WooCommerce products end ------------------------------------------------------------

// WooCommerce Checkout -----------------------------------------------------------------
const woocommerceCheckoutEnabled = ref<boolean>(
  settingsStore.getSettings?.woo_checkout?.enable || false,
);

const rawProductId = settingsStore.getSettings?.woo_checkout?.product_id;
const woocommerceCheckoutProductId = ref<string | number>(
  rawProductId ? rawProductId : "",
);

const checkoutProductsRaw = ref<WooProductRaw[]>([]);
const checkoutProductsLoading = ref(false);
const checkoutProductsHasMore = ref(false);
const checkoutProductSearch = ref("");
const checkoutProductLimit = ref(5);
const checkoutProductPage = ref(1);
const checkoutProductsFetched = ref(false);

const fetchCheckoutProducts = async (reset = false): Promise<void> => {
  checkoutProductsLoading.value = true;
  if (reset) {
    checkoutProductPage.value = 1;
    checkoutProductsRaw.value = [];
  }

  try {
    const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
    const response = await axios.get(ajaxUrl, {
      params: {
        action: "calc_get_products",
        nonce: (window as any).ccb_nonces?.calc_load_more_products || "",
        page: checkoutProductPage.value,
        per_page: checkoutProductLimit.value,
        search: checkoutProductSearch.value,
        product_ids: woocommerceCheckoutProductId.value
          ? String(woocommerceCheckoutProductId.value)
          : "",
        called_by: "woo_checkout",
      },
    });

    if (response.data?.success) {
      const products: WooProductRaw[] = response.data.products || [];
      if (reset || checkoutProductPage.value === 1) {
        checkoutProductsRaw.value = products;
      } else {
        const existingIds = new Set(checkoutProductsRaw.value.map((p) => p.ID));
        const newProducts = products.filter((p) => !existingIds.has(p.ID));
        checkoutProductsRaw.value = [
          ...checkoutProductsRaw.value,
          ...newProducts,
        ];
      }
      checkoutProductsHasMore.value = !!response.data.has_more;
      initCheckoutProductLabel();
    }
    checkoutProductsFetched.value = true;
  } catch {
    checkoutProductsRaw.value = [];
    checkoutProductsHasMore.value = false;
  } finally {
    checkoutProductsLoading.value = false;
  }
};

const checkoutProductItems = computed((): IPaginatedSelectItem[] => {
  if (!checkoutProductsFetched.value && !checkoutProductsLoading.value) {
    fetchCheckoutProducts();
  }
  return [
    { id: "current_product", label: "%Current Woo Product%" },
    ...checkoutProductsRaw.value.map((p) => ({
      id: p.ID,
      label: p.post_title,
    })),
  ];
});

const checkoutSelectedProductLabel = ref("");

const initCheckoutProductLabel = (): void => {
  const id = woocommerceCheckoutProductId.value;
  if (!id) return;
  const found = checkoutProductsRaw.value.find((p) => p.ID === Number(id));
  if (found && !checkoutSelectedProductLabel.value) {
    checkoutSelectedProductLabel.value = found.post_title;
  }
};

const onCheckoutProductSearch = (query: string): void => {
  checkoutProductSearch.value = query;
  fetchCheckoutProducts(true);
};

const onCheckoutProductLoadMore = (): void => {
  checkoutProductPage.value += 1;
  fetchCheckoutProducts();
};

const onCheckoutProductLimitChange = (newLimit: number): void => {
  checkoutProductLimit.value = newLimit;
  fetchCheckoutProducts(true);
};

const onCheckoutProductChange = (name: string, value: any): void => {
  const found = checkoutProductsRaw.value.find((p) => p.ID === value);
  checkoutSelectedProductLabel.value = found ? found.post_title : "";
  updateProperties(name, value);
};

const woocommerceCheckoutReplaceProductEnabled = ref<boolean>(
  settingsStore.getSettings?.woo_checkout?.replace_product || false,
);

const woocommerceCheckoutRedirectTo = ref<string>(
  settingsStore.getSettings?.woo_checkout?.redirect_to || "cart",
);

const woocommerceCheckoutOptions = ref<IDropdownOption[]>([
  { label: "Redirect to Cart Page", value: "cart" },
  { label: "Redirect to Checkout Page", value: "checkout" },
  { label: "Stay on Page", value: "stay" },
]);

const woocommerceCheckoutTotalFieldsOptions = totalFields;

const woocommerceCheckoutTotalFields = computed({
  get() {
    const saved = settingsStore.getSettings?.woo_checkout?.formulas || [];
    const synced = syncFormulas(saved);
    return synced.map((f) => f.alias);
  },
  set(value: string[]) {
    const available = totalFields.value;
    const matched = available.filter((t) => value.includes(t.alias));

    const settings = JSON.parse(
      JSON.stringify(settingsStore.getSettings),
    ) as ISettings;
    settings.woo_checkout.formulas = matched.map((t) => ({
      idx: t.idx,
      alias: t.alias,
      title: t.title,
    }));
    settings.woo_checkout.formulas_list = matched.map((t) => t.alias);
    settingsStore.setSettings(settings);
  },
});

const woocommerceDynamicProductQuantityEnabled = ref<boolean>(
  settingsStore.getSettings?.woo_checkout?.change_product_count || false,
);

type WooStockLink = { calc_field: string };

const normalizeStockLinks = (raw: unknown): WooStockLink[] => {
  if (Array.isArray(raw)) {
    return raw.map((item) =>
      typeof item === "object" && item !== null
        ? { calc_field: (item as any).calc_field || "" }
        : { calc_field: "" },
    );
  }
  if (raw && typeof raw === "object") {
    return Object.values(raw).map((item: any) => ({
      calc_field: item?.calc_field || "",
    }));
  }
  return [];
};

const woocommerceDynamicProductQuantityFields = ref<WooStockLink[]>(
  normalizeStockLinks(settingsStore.getSettings?.woo_checkout?.stock_links),
);

const STOCK_IGNORED_ALIAS_PREFIXES = [
  "text",
  "line",
  "html",
  "validated_form",
  "total",
  "file_upload",
  "datePicker",
  "timePicker",
  "geolocation",
  "dropDown_with_img",
  "radio_with_img",
  "toggle",
  "checkbox",
  "checkbox_with_img",
];

const stockLinkCalcFields = computed(() =>
  allBuilderFields.value.filter((f) => {
    const prefix = getAliasPrefix(f.alias);
    return !STOCK_IGNORED_ALIAS_PREFIXES.includes(prefix);
  }),
);

const woocommerceDynamicProductQuantityFieldsSchema = computed(
  (): IRepeaterDropdownField[] => [
    {
      key: "calc_field",
      options: stockLinkCalcFields.value.map((f) => ({
        label: f.label,
        value: f.alias,
      })),
      width: "1fr",
      required: true,
    },
  ],
);
</script>

<style lang="scss" scoped>
.ccb-woo-not-installed {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;

  &-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    row-gap: 30px;
  }

  &-logo {
    background-color: #7f54b31a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    border-radius: 50%;
    width: 120px;
    height: 120px;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &-title-box {
    text-align: center;
    display: flex;
    flex-direction: column;
    row-gap: 17px;
    color: var(--ccb-text-color);
  }

  .ccb-woo-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--ccb-font-labels);
  }

  .ccb-woo-description {
    font-size: 14px;
    font-weight: 500;
    color: var(--ccb-font-comment);
  }

  &-action {
    display: flex;
  }

  &-button {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0 20px;
    border-radius: 5px;
    background-color: #00b163;
    color: #fff;
  }

  &-button:hover {
    background-color: #009955;
  }
}
</style>
