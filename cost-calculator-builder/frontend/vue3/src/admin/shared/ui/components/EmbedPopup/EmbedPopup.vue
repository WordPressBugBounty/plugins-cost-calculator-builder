<template>
  <Teleport to="body">
    <div class="ccb-embed-popup-overlay" @click="close">
      <div class="ccb-embed-popup" @click.stop="onPopupClick">
        <div class="ccb-embed-popup__header">
          <Text
            :text="getTextValue(translations.embedTitle)"
            size="l"
            weight="bold"
            class="ccb-embed-popup__title"
          />
          <button class="ccb-embed-popup__close" @click="close">
            <i class="ccb-icon-close-x"></i>
          </button>
        </div>

        <div class="ccb-embed-popup__body">
          <div
            class="ccb-embed-popup__card"
            :class="{
              'ccb-embed-popup__card--active': selectedOption === 'manual',
            }"
            @click="selectOption('manual')"
          >
            <div class="ccb-embed-popup__card-icon">
              <img :src="manualImg" alt="Embed manually" />
            </div>
            <div class="ccb-embed-popup__card-text">
              <Text
                :text="getTextValue(translations.embedManually)"
                size="s"
                weight="bold"
                class="ccb-embed-popup__card-text-title"
              />
              <Text
                :text="getTextValue(translations.embedManuallyDesc)"
                size="s"
                weight="medium"
                class="ccb-embed-popup__card-desc"
              />
            </div>
          </div>

          <div
            class="ccb-embed-popup__card"
            :class="{
              'ccb-embed-popup__card--active': selectedOption === 'existing',
            }"
            @click="selectOption('existing')"
          >
            <div class="ccb-embed-popup__card-icon">
              <img :src="inpagesImg" alt="Embed to existing page" />
            </div>
            <div class="ccb-embed-popup__card-text">
              <Text
                :text="getTextValue(translations.embedToExistingPage)"
                size="s"
                weight="bold"
                class="ccb-embed-popup__card-text-title"
              />
              <Text
                :text="getTextValue(translations.embedToExistingPageDesc)"
                size="s"
                weight="medium"
                class="ccb-embed-popup__card-desc"
              />
            </div>
          </div>

          <div
            class="ccb-embed-popup__card"
            :class="{
              'ccb-embed-popup__card--active': selectedOption === 'new',
            }"
            @click="selectOption('new')"
          >
            <div class="ccb-embed-popup__card-icon">
              <img :src="newpageImg" alt="Embed to new page" />
            </div>
            <div class="ccb-embed-popup__card-text">
              <Text
                :text="getTextValue(translations.embedToNewPage)"
                size="s"
                weight="bold"
                class="ccb-embed-popup__card-text-title"
              />
              <Text
                :text="getTextValue(translations.embedToNewPageDesc)"
                size="s"
                weight="medium"
                class="ccb-embed-popup__card-desc"
              />
            </div>
          </div>
        </div>

        <div class="ccb-embed-popup__footer" v-if="selectedOption === 'manual'">
          <div class="ccb-embed-popup__shortcode-row">
            <Input
              class="ccb-embed-popup__shortcode-input ccb-text-m"
              type="text"
              :modelValue="shortcode"
              readonly
              :placeholder="getTextValue(translations.shortcodePlaceholder)"
              label="Shortcode"
              variant="innerLabel"
            />

            <button
              class="ccb-embed-popup__confirm-btn"
              :class="{
                'ccb-embed-popup__confirm-btn--active': shortcode.length > 0,
              }"
              :disabled="shortcode.length === 0"
              @click="copyShortcode"
            >
              <i class="ccb-icon-ic_duplicate" v-if="copyLabel === 'Copy'"></i>
              <i class="ccb-icon-ic_check" v-if="copyLabel === 'Copied!'"></i>
            </button>
          </div>
        </div>

        <div
          class="ccb-embed-popup__footer"
          v-if="selectedOption === 'existing'"
        >
          <div class="ccb-embed-popup__pages-row">
            <div class="ccb-embed-popup__select-wrapper" ref="selectWrapper">
              <div class="ccb-embed-popup__select" @click="toggleDropdown">
                <div class="ccb-embed-popup__select-inner">
                  <span
                    v-for="page in selectedPages"
                    :key="page.id"
                    class="ccb-embed-popup__chip"
                  >
                    {{ page.title }}
                    <i
                      class="ccb-icon-close-x"
                      @click.stop="removePage(page)"
                    ></i>
                  </span>
                  <input
                    class="ccb-embed-popup__search-input ccb-text-m"
                    type="text"
                    :placeholder="searchPlaceholder"
                    v-model="searchQuery"
                    @click.stop="isDropdownOpen = true"
                    @focus="isDropdownOpen = true"
                    ref="searchInput"
                  />
                </div>
                <i
                  class="ccb-icon-ic_caret_down ccb-embed-popup__select-arrow"
                  :class="{
                    'ccb-embed-popup__select-arrow--open': isDropdownOpen,
                  }"
                ></i>
              </div>

              <div
                class="ccb-embed-popup__dropdown ccb-custom-scrollbar"
                v-if="isDropdownOpen"
              >
                <div
                  class="ccb-embed-popup__dropdown-empty ccb-text-s"
                  v-if="filteredPages.length === 0"
                >
                  {{ translations.noPagesFound || "No pages found" }}
                </div>
                <div
                  v-for="page in filteredPages"
                  :key="page.id"
                  class="ccb-embed-popup__dropdown-item"
                  :class="{
                    'ccb-embed-popup__dropdown-item--selected':
                      isPageSelected(page),
                  }"
                  @click="togglePage(page)"
                >
                  <span
                    class="ccb-embed-popup__checkbox"
                    :class="{
                      'ccb-embed-popup__checkbox--checked':
                        isPageSelected(page),
                    }"
                  >
                    <i
                      v-if="isPageSelected(page)"
                      class="ccb-icon-ic_check"
                    ></i>
                  </span>
                  <span class="ccb-text-s">{{ page.title }}</span>
                </div>
              </div>
            </div>

            <button
              class="ccb-embed-popup__confirm-btn"
              :class="{
                'ccb-embed-popup__confirm-btn--active':
                  selectedPages.length > 0,
              }"
              :disabled="selectedPages.length === 0 || isInserting"
              @click="insertToPages"
            >
              <i class="ccb-icon-ic_check"></i>
            </button>
          </div>
        </div>

        <div class="ccb-embed-popup__footer" v-if="selectedOption === 'new'">
          <div class="ccb-embed-popup__new-page-row">
            <div class="ccb-embed-popup__new-page-input-wrapper">
              <Input
                class="ccb-embed-popup__new-page-input ccb-text-m"
                type="text"
                :placeholder="
                  String(translations.enterPageName || 'Enter page name')
                "
                v-model="newPageName"
                variant="innerLabel"
                label="Page Name"
              />
            </div>
            <button
              class="ccb-embed-popup__confirm-btn"
              :class="{
                'ccb-embed-popup__confirm-btn--green':
                  newPageName.trim().length > 0,
              }"
              :disabled="newPageName.trim().length === 0 || isCreating"
              @click="createNewPage"
            >
              <i class="ccb-icon-ic_plus_big"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Text, Input } from "@/admin/shared/ui/UIKit";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { EmbedAPI } from "@/admin/shared/api/EmbedAPI";
import type { IEmbedPage } from "@/admin/shared/api/EmbedAPI";
import { toast } from "vue3-toastify";

import manualImg from "@/images/embed/manual.png";
import inpagesImg from "@/images/embed/inpages.png";
import newpageImg from "@/images/embed/newpage.png";

type EmbedOption = "manual" | "existing" | "new" | null;

interface IEmbedPopupProps {
  id?: number | string;
}

const props = defineProps<IEmbedPopupProps>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const calculatorStore = useCalculatorStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const getTextValue = (
  value: string | Record<string, unknown> | undefined,
): string => (typeof value === "string" ? value : "");

const selectedOption = ref<EmbedOption>(null);
const copyLabel = ref("Copy");
const searchInput = ref<HTMLInputElement | null>(null);
const selectWrapper = ref<HTMLElement | null>(null);

const pages = ref<IEmbedPage[]>([]);
const selectedPages = ref<IEmbedPage[]>([]);
const searchQuery = ref("");
const isDropdownOpen = ref(false);
const isInserting = ref(false);
const isCreating = ref(false);
const pagesLoaded = ref(false);
const newPageName = ref("");

const calculatorId = computed(() =>
  Number(props.id ?? calculatorStore.getId ?? 0),
);

const shortcode = computed(() => `[stm-calc id="${calculatorId.value}"]`);

const searchPlaceholder = computed(() => {
  if (selectedPages.value.length === 0) {
    return String(translations.value.selectPage || "Select page");
  }
  return String(translations.value.typingToSearch || "Typing to search");
});

const filteredPages = computed(() => {
  if (!searchQuery.value) return pages.value;
  const query = searchQuery.value.toLowerCase();
  return pages.value.filter((page) => page.title.toLowerCase().includes(query));
});

const isPageSelected = (page: IEmbedPage): boolean => {
  return selectedPages.value.some((p) => p.id === page.id);
};

const close = () => {
  emit("close");
};

const selectOption = async (option: EmbedOption) => {
  selectedOption.value = selectedOption.value === option ? null : option;

  if (option === "existing" && !pagesLoaded.value) {
    await loadPages();
  }
};

const loadPages = async () => {
  try {
    pages.value = await EmbedAPI.getPages();
    pagesLoaded.value = true;
  } catch {
    toast(translations.value.errorLoadingPages || "Error loading pages", {
      type: "error",
    });
  }
};

const togglePage = (page: IEmbedPage) => {
  if (isPageSelected(page)) {
    removePage(page);
  } else {
    selectedPages.value.push(page);
  }
  searchQuery.value = "";
};

const removePage = (page: IEmbedPage) => {
  selectedPages.value = selectedPages.value.filter((p) => p.id !== page.id);
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) {
    setTimeout(() => searchInput.value?.focus(), 0);
  }
};

const insertToPages = async () => {
  if (selectedPages.value.length === 0 || isInserting.value) return;

  isInserting.value = true;
  try {
    await EmbedAPI.insertPages(selectedPages.value, calculatorId.value);
    toast(translations.value.embedSuccess || "Successfully embedded!", {
      type: "success",
    });
    selectedPages.value = [];
    close();
  } catch {
    toast(translations.value.embedError || "Error embedding calculator", {
      type: "error",
    });
  } finally {
    isInserting.value = false;
  }
};

const createNewPage = async () => {
  if (newPageName.value.trim().length === 0 || isCreating.value) return;

  isCreating.value = true;
  try {
    const result = await EmbedAPI.createPage(
      newPageName.value.trim(),
      calculatorId.value,
    );
    if (result.url) {
      window.open(result.url, "_blank");
    }
    newPageName.value = "";
    close();
  } catch {
    toast(translations.value.embedError || "Error creating page", {
      type: "error",
    });
  } finally {
    isCreating.value = false;
  }
};

const copyShortcode = async () => {
  const value = shortcode.value;
  if (!value) return;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!ok) throw new Error("execCommand copy failed");
    }

    copyLabel.value = "Copied!";
    toast(translations.value.copied || "Copied!", { type: "success" });
    setTimeout(() => {
      copyLabel.value = "Copy";
    }, 2000);
  } catch {
    toast(
      translations.value.unableToCopyPromocode || "Unable to copy shortcode",
      { type: "error" },
    );
  }
};

const onPopupClick = (e: MouseEvent) => {
  if (selectWrapper.value && !selectWrapper.value.contains(e.target as Node)) {
    isDropdownOpen.value = false;
  }
};
</script>

<style scoped lang="scss">
.ccb-embed-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ccb-embed-popup {
  background: var(--ccb-page-left);
  border-radius: 16px;
  width: 720px;
  max-width: 95vw;
  overflow: visible;
  box-shadow: 0 24px 48px var(--ccb-sidebar-shadow);
  padding: 32px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 32px;
  }

  &__title {
    color: var(--ccb-font-labels);
  }

  &__close {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--ccb-bw-dull-normal);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ccb-font-labels);
    font-size: 12px;
    transition: var(--ccb-transition-normal);

    &:hover {
      background: var(--ccb-bw-dull-hover);
    }
  }

  &__body {
    display: flex;
    gap: 8px;
  }

  &__card {
    flex: 1;
    cursor: pointer;
    border-radius: 12px;
    border: 1px solid #eee;
    transition: var(--ccb-transition-normal);
    background: var(--ccb-wb-normal);
    padding: 16px;
    color: var(--ccb-font-labels);

    &:hover {
      border-color: var(--ccb-border-hover);
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    }

    &--active {
      border-color: var(--ccb-blue-bg-normal);

      &:hover {
        border-color: var(--ccb-blue-bg-normal);
      }
    }
  }

  &__card-icon {
    width: 100%;
    height: 112px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ccb-input-normal);
    border-radius: 8px;
    margin-bottom: 16px;

    img {
      max-width: 80%;
      max-height: 80%;
      object-fit: contain;
    }
  }

  &__card-text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  &__card-desc {
    color: var(--ccb-font-comment);
  }

  &__footer {
    padding-top: 32px;
  }

  &__shortcode-row {
    display: flex;
    gap: 10px;
    align-items: stretch;

    button {
      height: 48px;
    }
  }

  &__shortcode-input {
    flex: 1;
    height: 48px;
  }

  &__pages-row {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  &__select-wrapper {
    flex: 1;
    position: relative;
  }

  &__select {
    display: flex;
    align-items: center;
    background: var(--ccb-input-normal);
    border-radius: 12px;
    padding: 8px 12px;
    max-height: 48px;
    cursor: pointer;
    transition: var(--ccb-transition-normal);

    &:hover {
      border-color: var(--ccb-border-hover);
    }
  }

  &__select-inner {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1;
    align-items: center;
  }

  &__select-arrow {
    font-size: 12px;
    color: var(--ccb-font-comment);
    transition: transform 0.2s ease;
    flex-shrink: 0;
    margin-left: 8px;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--ccb-blue-bg-dull-normal);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 13px;
    color: var(--ccb-font-labels);
    white-space: nowrap;
    min-height: 32px;

    i {
      font-size: 8px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.15s;
      color: var(--ccb-font-comment);
      margin-left: 6px;
      margin-top: 2px;

      &:hover {
        opacity: 1;
      }
    }
  }

  &__search-input {
    border: none;
    outline: none;
    background: transparent;
    color: var(--ccb-font-labels);
    min-width: 120px;
    flex: 1;
    padding: 4px 0;
    height: 30px;
    font-size: 14px;

    &:focus {
      outline: none;
      box-shadow: none;
    }

    &::placeholder {
      color: var(--ccb-font-comment);
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--ccb-page-left);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    max-height: 240px;
    overflow-y: auto;
    z-index: 10;
    padding: 4px;
  }

  &__dropdown-empty {
    padding: 12px 16px;
    color: var(--ccb-font-comment);
    text-align: center;
  }

  &__dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;
    color: var(--ccb-font-labels);

    &:hover {
      background: var(--ccb-input-normal);
    }

    &--selected {
      background: var(--ccb-blue-bg-dull-normal);

      &:hover {
        background: var(--ccb-blue-bg-dull-hover);
      }
    }
  }

  &__checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid var(--ccb-border-normal);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: var(--ccb-transition-normal);

    &--checked {
      background: var(--ccb-blue-bg-normal);
      border-color: var(--ccb-blue-bg-normal);
      color: #fff;

      i {
        font-size: 10px;
      }
    }
  }

  &__new-page-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }

  &__new-page-input-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 48px;

    .ccb-input {
      height: 100%;
    }
  }

  &__new-page-input {
    transition: var(--ccb-transition-normal);

    &:focus,
    &:active {
      outline: none;
      box-shadow: none;
    }

    &::placeholder {
      color: var(--ccb-font-comment);
    }
  }

  &__confirm-btn {
    width: 100px;
    height: 48px;
    border: none;
    border-radius: 98px;
    background: var(--ccb-bw-dull-normal);
    color: var(--ccb-font-comment);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: not-allowed;
    transition: var(--ccb-transition-normal);
    flex-shrink: 0;

    i {
      font-size: 20px;
    }

    &--active {
      background: var(--ccb-blue-bg-normal);
      color: #fff;
      cursor: pointer;

      &:hover {
        background: var(--ccb-blue-bg-hover);
      }
    }

    &--green {
      background: var(--ccb-green-bg-normal);
      color: #fff;
      cursor: pointer;

      &:hover {
        background: var(--ccb-green-bg-hover);
      }
    }

    &:disabled {
      opacity: 0.6;
    }
  }
}
</style>
