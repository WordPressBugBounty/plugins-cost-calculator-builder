<template>
  <div class="ccb-pro-banner">
    <div class="ccb-pro-banner__content">
      <div class="ccb-pro-banner__text">
        <div class="ccb-pro-banner__title-box">
          <Text :text="title" size="xl" weight="bold" />
        </div>
        <div class="ccb-pro-banner__divider"></div>
        <div class="ccb-pro-banner__description-box">
          <Text :text="description" size="l" weight="regular" />
        </div>
      </div>

      <div class="ccb-pro-banner__actions">
        <Button
          :label="upgradeLink.label"
          :href="upgradeLink.url"
          target="_blank"
          rel="noopener noreferrer"
          size="m"
          type="blue"
          showOriginal
          @click="handleUpgrade"
        />
        <Button
          v-if="watchVideoLink && watchVideoLink.url"
          :label="watchVideoLink.label"
          :href="watchVideoLink.url"
          target="_blank"
          rel="noopener noreferrer"
          size="m"
          type="red"
          showOriginal
          iconLeft="ccb-icon-ic_play"
          @click="handleWatchVideo"
        />
        <Button
          :label="documentationLink.label"
          :href="documentationLink.url"
          target="_blank"
          rel="noopener noreferrer"
          size="m"
          type="blue-ghost"
          showOriginal
          @click="handleDocumentation"
        />
      </div>
    </div>

    <div class="ccb-pro-banner__image-box" :style="imageStyles">
      <img :src="image" :alt="title" class="ccb-pro-banner__image" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import Button from "@/admin/shared/ui/UIKit/Button.vue";
import Text from "@/admin/shared/ui/UIKit/Text.vue";
import type { IProBanner } from "@/admin/shared/types/uikit.type";

const props = defineProps<IProBanner>();

const {
  title,
  description,
  image,
  documentationLink,
  upgradeLink,
  watchVideoLink,
  imageMaxWidth,
  imageMaxHeight,
} = toRefs(props);

const imageStyles = computed(() => {
  return {
    maxWidth: imageMaxWidth.value ? imageMaxWidth.value : "100%",
    maxHeight: imageMaxHeight.value ? imageMaxHeight.value : "100%",
  };
});

const handleUpgrade = () => {
  if (upgradeLink.value?.url) {
    window.open(upgradeLink.value.url, "_blank");
  }
};

const handleWatchVideo = () => {
  if (watchVideoLink.value?.url) {
    window.open(watchVideoLink.value.url, "_blank");
  }
};

const handleDocumentation = () => {
  if (documentationLink.value?.url) {
    window.open(documentationLink.value.url, "_blank");
  }
};
</script>

<style lang="scss" scoped>
.ccb-pro-banner {
  background-color: var(--ccb-bgr-overlay);
  border-radius: 24px;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  justify-content: center;
  color: var(--ccb-font-labels);

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  &__text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  &__title {
    font-size: 32px;
    font-weight: 700;
    line-height: normal;
    color: var(--ccb-font-heads);
    margin: 0;
    white-space: nowrap;
  }

  &__description-box,
  &__title-box {
    max-width: 730px;
    text-align: center;
  }

  &__divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--ccb-border-normal) 50%,
      transparent 100%
    );
  }

  &__description {
    font-size: 20px;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: 0.2px;
    color: var(--ccb-font-text);
    text-align: center;
    max-width: 592px;
    margin: 0;
  }

  &__actions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  &__btn {
    height: 40px;
    padding: 10px 16px;
    border-radius: 99px;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0.2px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: var(--ccb-transition-normal);
    white-space: nowrap;
    box-sizing: border-box;

    &--upgrade {
      background-color: var(--ccb-ultra-bg-normal);
      color: var(--ccb-button-w-normal);
      font-weight: 700;

      &:hover {
        opacity: 0.9;
        color: var(--ccb-button-w-hover);
      }
    }

    &--docs {
      background-color: var(--ccb-blue-bg-dull-normal);
      color: var(--ccb-blue-fg-normal);
      font-weight: 500;

      &:hover {
        background-color: var(--ccb-blue-bg-dull-hover);
        color: var(--ccb-blue-fg-hover);
      }
    }
  }

  &__image-box {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__image {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
  }
}
</style>
