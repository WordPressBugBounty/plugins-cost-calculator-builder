<template>
  <div class="ccb-template-card">
    <div class="ccb-template-card__img">
      <img :src="template.image" alt="Template" />
      <div class="ccb-template-card__img-overlay">
        <Button label="Live Demo" size="m" type="blue" @click="openLiveDemo" />
        <Button
          label="Use This Template"
          size="m"
          type="green"
          :disabled="isProTemplate && !isProActive"
          @click="useTemplate"
        />
      </div>
    </div>
    <div class="ccb-template-card__body">
      <div class="ccb-template-card__badges">
        <Badge v-if="template.type === 'pro'" label="PRO" :type="'blue'" />
        <Text
          class="ccb-template-card__variants"
          text="Variants"
          size="s"
          weight="medium"
          v-if="template.variants"
        />
        <div class="ccb-template-card__favorite" @click="toggleFavorite">
          <i v-if="!isFavorite(template.id)" class="ccb-icon-ic_heart"></i>
          <i
            v-else
            class="ccb-template-card__favorite-icon ccb-icon-ic_heart_fill"
          ></i>
        </div>
      </div>
      <div class="ccb-template-card__title">
        <Text :text="template.title" size="l" weight="bold" />
      </div>
      <div class="ccb-template-card__description">
        <Text :text="template.description" size="m" weight="regular" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import { Text, Badge, Button } from "@/admin/shared/ui/UIKit";
import { ITemplateCard } from "@/admin/shared/types/template.type";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";

interface ITemplateCardProps {
  template: ITemplateCard;
}

const emit = defineEmits<{
  (e: "useTemplate", id: number): void;
}>();

const props = defineProps<ITemplateCardProps>();
const { template } = toRefs(props);

const flowStore = useFlowStore();

const isProActive = computed(() => flowStore.getProActive);
const isProTemplate = computed(() => template.value.type === "pro");

const isFavorite = computed(() => {
  return (templateId: number) => {
    return flowStore.getFavorites.includes(+templateId);
  };
});

const toggleFavorite = () => {
  flowStore.addFavoriteTemplate(+template.value.id);
};

const openLiveDemo = () => {
  window.open(template.value.link, "_blank");
};

const useTemplate = () => {
  emit("useTemplate", template.value.id);
};
</script>

<style scoped lang="scss">
.ccb-template-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  background-color: var(--ccb-bgr-overlay);
  padding: 8px;
  border-radius: 16px;
  width: 100%;
  max-width: none;
  cursor: pointer;
  min-height: 100%;

  &:hover {
    .ccb-template-card__img-overlay {
      opacity: 1;
    }
  }

  &__img-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--ccb-blue-bg-dull-hover);
    opacity: 0;
    transition: var(--ccb-transition-normal);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__img {
    border-radius: 8px;
    overflow: hidden;
    width: 100%;
    aspect-ratio: 312 / 220;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  &__badges {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  &__favorite {
    cursor: pointer;
    color: var(--ccb-font-comment);
    font-size: 20px;
    margin-left: auto;

    &:hover {
      color: var(--ccb-font-heads);
    }

    &-icon {
      &:last-child {
        color: var(--ccb-red-bg-normal);
      }
    }
  }

  &__variants {
    color: var(--ccb-font-comment);
  }

  &__title {
    color: var(--ccb-font-heads);
    min-width: 0;
  }

  &__description {
    color: var(--ccb-font-text);
    min-width: 0;
  }

  @media (max-width: 767px) {
    padding: 6px;
    border-radius: 14px;

    &__body {
      padding: 14px;
    }
  }
}
</style>
