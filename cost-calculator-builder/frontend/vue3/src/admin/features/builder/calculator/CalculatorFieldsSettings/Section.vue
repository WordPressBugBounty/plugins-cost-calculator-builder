<template>
  <div class="ccb-fields-settings-container ccb-custom-scrollbar">
    <div class="ccb-fields-settings__content ccb-custom-scrollbar">
      <div class="ccb-fields-settings ccb-field-sidebar">
        <div
          class="ccb-fields-settings-back"
          @click="builderStore.setSelectedField(null)"
        >
          <i class="ccb-icon-ic_back"></i>
          <Text text="Back to Fields" size="s" weight="medium" />
        </div>
        <div class="ccb-field-sidebar__header">
          <Text
            :text="field.label"
            size="m"
            weight="bold"
            class="ccb-field-sidebar__label"
          />
          <Text
            :text="field.alias"
            size="m"
            weight="medium"
            class="ccb-field-sidebar__alias"
          />
        </div>
        <div class="ccb-field-sidebar__tabs">
          <div class="ccb-field-sidebar__row">
            <Tab :items="fieldTabs" v-model="activeTab" type="regular" />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'element'">
          <div
            class="ccb-field-sidebar__item"
            style="display: flex; gap: 10px; align-items: end"
          >
            <Input
              label="Element name"
              placeholder="Section name"
              v-model="draft.label"
            />
            <div class="ccb-section-image-field" style="width: 40%">
              <button
                type="button"
                class="ccb-section-image-field__button"
                :class="{ 'is-active': draft.image }"
                @click="openMedia"
              >
                <img
                  v-if="draft.image"
                  class="ccb-section-image-field__preview"
                  :src="draft.image"
                  alt="Section image"
                />
                <span v-else class="ccb-section-image-field__placeholder">
                  <i class="ccb-icon-ic_add-image"></i>
                  <span>Upload</span>
                </span>
              </button>

              <button
                v-if="draft.image"
                type="button"
                class="ccb-section-image-field__clear"
                @click="clearImage"
              >
                <i class="ccb-icon-ic_delete"></i>
              </button>
            </div>
          </div>

          <div class="ccb-field-sidebar__item"></div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Show Name"
              size="m"
              weight="medium"
              v-model="draft.showName"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Make this section collapsible"
              size="m"
              weight="medium"
              v-model="draft.collapsible"
            />
          </div>
          <div class="ccb-field-sidebar__row" v-if="draft.collapsible">
            <Toggle
              label="Collapse this section by default"
              size="m"
              weight="medium"
              v-model="draft.defaultCollapsed"
            />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'variants'">
          <div class="ccb-field-sidebar__row">
            <div class="ccb-section-style-card">
              <Toggle
                label="Apply this section style to all sections in this calculator"
                size="m"
                weight="medium"
                v-model="draft.applyStyleForAll"
              />
              <div class="ccb-section-style-card__colors">
                <div class="ccb-section-style-card__color-field">
                  <span class="ccb-section-style-card__color-label"
                    >Text color</span
                  >
                  <div class="ccb-section-style-card__color-control">
                    <ColorPicker
                      :model-value="draft.textColor"
                      @update:modelValue="draft.textColor = $event"
                    />
                    <span class="ccb-section-style-card__color-value">
                      {{ draft.textColor.toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div
                  class="ccb-section-style-card__color-field"
                  v-if="draft.style == 'solid'"
                >
                  <span class="ccb-section-style-card__color-label">
                    Background color
                  </span>
                  <div class="ccb-section-style-card__color-control">
                    <ColorPicker
                      :model-value="draft.backgroundColor"
                      @update:modelValue="draft.backgroundColor = $event"
                    />
                    <span class="ccb-section-style-card__color-value">
                      {{ draft.backgroundColor.toUpperCase() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="ccb-field-sidebar__row"
            v-for="variant in sectionVariants"
            :key="variant.id"
          >
            <div
              class="ccb-field-variant"
              :class="{ active: draft.style === variant.id }"
              @click="draft.style = variant.id"
            >
              <div class="ccb-field-variant__check">
                <i class="ccb-icon-ic_check"></i>
              </div>
              <div class="ccb-field-variant__title">
                <Text :text="variant.label" size="s" weight="medium" />
              </div>
              <div class="ccb-field-variant__view">
                <img :src="variant.img" alt="Section variant" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from "vue";
import { Text, Input, Toggle, ColorPicker } from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import type { ISection } from "@/admin/shared/types/fields.type";
import defaultImage from "@/images/fields-variants/sections/style-default.png";
import solidImage from "@/images/fields-variants/sections/style-solid.png";
import numberImage from "@/images/fields-variants/sections/style-number.png";
import minimalImage from "@/images/fields-variants/sections/style-minimal.png";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const props = defineProps<{
  field: ISection;
}>();

const builderStore = useBuilderStore();
const appStore = useAppStore();
const activeTab = ref<"element" | "variants">("element");

const fieldTabs = computed(() => [
  { id: "element", label: "Element" },
  {
    id: "variants",
    label: "Variants",
    isPro: !appStore.getIsPro,
    proBadge: !appStore.getIsPro,
  },
]);

const sectionVariants = computed(() => [
  { id: "default", label: "Default", img: defaultImage },
  { id: "solid", label: "Solid", img: solidImage },
  { id: "number", label: "Number", img: numberImage },
  { id: "minimal", label: "Minimal", img: minimalImage },
]);

interface ISectionDraft {
  label: string;
  showName: boolean;
  collapsible: boolean;
  defaultCollapsed: boolean;
  hidden: boolean;
  image: string;
  style: string;
  applyStyleForAll: boolean;
  textColor: string;
  backgroundColor: string;
}

type ISectionStyles = NonNullable<ISection["styles"]> & {
  applyToAll?: boolean;
  textColor?: string;
  backgroundColor?: string;
};

const draft = reactive<ISectionDraft>({
  label: "",
  showName: true,
  collapsible: false,
  defaultCollapsed: false,
  hidden: false,
  image: "",
  style: "default",
  applyStyleForAll: false,
  textColor: "#001931",
  backgroundColor: "#ffffff",
});

const allowedMimes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const setImage = (imageUrl: string): void => {
  draft.image = imageUrl;
};

const clearImage = (): void => {
  draft.image = "";
};

const openMedia = (): void => {
  const anyWindow = window as unknown as {
    wp?: {
      media?: {
        editor?: {
          open: () => void;
          send: {
            attachment?: (
              _props: unknown,
              attachment: { mime?: string; url?: string },
            ) => void;
          };
          insert?: (htmlString: string) => void;
        };
      };
    };
  };

  if (anyWindow?.wp?.media?.editor) {
    const wp = anyWindow.wp;
    wp.media?.editor?.open();

    if (wp.media?.editor?.send) {
      wp.media.editor.send.attachment = (_props, attachment) => {
        const mime = String(attachment?.mime || "");
        const url = String(attachment?.url || "");

        if (url && (!mime || allowedMimes.includes(mime))) {
          setImage(url);
        }
      };
    }

    wp.media!.editor!.insert = (htmlString: string) => {
      const regex = /<img[^>]+src="([^"]+)"[^>]*>/i;
      const match = htmlString.match(regex);

      if (match && match[1]) {
        setImage(match[1]);
      }
    };
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !allowedMimes.includes(file.type)) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };
  input.click();
};

const syncDraftFromField = (): void => {
  const source = props.field;
  const sourceStyles = (source.styles || {}) as ISectionStyles;

  draft.label = String(source.label || "");
  draft.showName = Boolean(source.showName ?? true);
  draft.collapsible = Boolean(source.collapsible);
  draft.defaultCollapsed = Boolean(source.defaultCollapsed);
  draft.hidden = Boolean(source.hidden);
  draft.image = String(sourceStyles.iconPath || "");
  draft.style = String(sourceStyles.style || "default");
  draft.applyStyleForAll = Boolean(sourceStyles.applyToAll);
  draft.textColor = String(
    sourceStyles.textColor || sourceStyles.text_color || "#001931",
  );
  draft.backgroundColor = String(
    sourceStyles.backgroundColor || sourceStyles.background_color || "#ffffff",
  );
};

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  {
    image: "styles.iconPath",
    style: "styles.style",
    applyStyleForAll: "styles.applyToAll",
    textColor: "styles.textColor",
    backgroundColor: "styles.backgroundColor",
  },
);

watch(
  () => [props.field.alias, restoredVersion.value],
  () => suppressAutoSync(() => syncDraftFromField()),
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";

.ccb-field-sidebar {
  &__row-description {
    width: 100%;
    display: flex;
    gap: 8px;
    color: var(--ccb-font-comment);
    padding-left: 54px;
  }
}

.ccb-section-image-field {
  display: flex;
  gap: 6px;
  height: 36px;
  width: 100%;

  &__button {
    background: var(--ccb-input-normal);
    transition: var(--ccb-transition-normal);
    border: none;
    border-radius: 12px;
    width: 100%;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;

    &.is-active {
      width: 38px;
      flex: 0 0 38px;
    }

    &:hover {
      border-color: var(--ccb-green-bg-normal);
    }
  }

  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--ccb-font-comment);
    font-size: 12px;
    font-weight: 500;

    i {
      font-size: 18px;
    }
  }

  &__preview {
    object-fit: cover;
    display: block;
    width: 36px;
    height: 36px;
    border-radius: 8px;
  }

  &__clear {
    background: var(--ccb-red-bg-dull-normal);
    color: var(--ccb-red-bg-normal);
    transition: var(--ccb-transition-normal);
    border: none;
    border-radius: 12px;
    min-height: 32px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    flex: 1 1 auto;

    &:hover {
      background: var(--ccb-red-bg-dull-normal);
      border-color: var(--ccb-red-bg-normal);
    }
  }
}

.ccb-section-style-card {
  width: 100%;
  border: 1px solid var(--ccb-input-border);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__colors {
    display: grid;
    gap: 16px;
  }

  &__color-field {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__color-label {
    color: var(--ccb-font-labels);
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
  }

  &__color-control {
    min-height: 48px;
    background: var(--ccb-input-normal);
    border: 1px solid var(--ccb-input-border);
    border-radius: 12px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__color-value {
    color: var(--ccb-font-labels);
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0.2px;
    text-transform: uppercase;
  }
}
</style>
