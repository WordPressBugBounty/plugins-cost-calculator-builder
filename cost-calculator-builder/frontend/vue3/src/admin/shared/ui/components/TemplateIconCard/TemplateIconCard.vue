<template>
  <div
    class="ccb-template-card"
    :class="{ 'ccb-template-card--locked': isProTemplate && !isProActive }"
    role="button"
    tabindex="0"
  >
    <div class="ccb-template-card__main">
      <div
        class="ccb-template-card__icon"
        :style="{ backgroundColor: templateIconBackground }"
      >
        <i :class="templateIconClass" :style="{ color: templateIconColor }" />
      </div>

      <div class="ccb-template-card__body">
        <div class="ccb-template-card__heading">
          <div class="ccb-template-card__title-wrap">
            <Text :text="template.title" size="m" weight="bold" />
          </div>
        </div>
        <Text
          class="ccb-template-card__description"
          :text="template.description"
          size="s"
          weight="regular"
        />
      </div>
    </div>

    <div class="ccb-template-card__actions">
      <button class="demo" @click.stop="openLiveDemo" v-if="template.link">
        View Demo
      </button>
      <button
        class="use-template"
        :disabled="isProTemplate && !isProActive"
        @click.stop="useTemplate"
      >
        Use Template
      </button>
      <div class="ccb-template-card__favorite" @click.stop="toggleFavorite">
        <i v-if="!isFavorite(template.id)" class="ccb-icon-ic_heart"></i>
        <i
          v-else
          class="ccb-template-card__favorite-icon ccb-icon-ic_heart_fill"
        ></i>
      </div>
      <div class="ccb-template-card__delete" @click.stop="deleteTemplate">
        <i class="ccb-icon-Path-3503"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed } from "vue";
import { Text } from "@/admin/shared/ui/UIKit";
import { ITemplateCard } from "@/admin/shared/types/template.type";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";

interface ITemplateIcon {
  icon?: string;
  color?: string;
}

interface ITemplateIconCard extends ITemplateCard {
  icon?: string | ITemplateIcon;
}

interface ITemplateCardProps {
  template: ITemplateIconCard;
}

const emit = defineEmits<{
  (e: "useTemplate", id: number): void;
  (e: "deleteTemplate", id: number): void;
}>();

const props = defineProps<ITemplateCardProps>();
const { template } = toRefs(props);

const deleteTemplate = () => {
  const confirmed = confirm("Are you sure you want to delete this template?");
  if (confirmed) {
    emit("deleteTemplate", template.value.id);
  }
};

const flowStore = useFlowStore();

const isProActive = computed(() => flowStore.getProActive);
const isProTemplate = computed(() => template.value.type === "pro");

const isFavorite = computed(() => {
  return (templateId: number) => {
    return flowStore.getFavorites.includes(+templateId);
  };
});

const templateIconClass = computed(() => {
  if (typeof template.value.icon === "string") {
    return template.value.icon;
  }

  return template.value.icon?.icon || "ccb-icon-ic_grid_view";
});

const templateIconColor = computed(() => {
  if (typeof template.value.icon === "string") {
    return "var(--ccb-blue-bg-normal)";
  }

  return template.value.icon?.color || "var(--ccb-blue-bg-normal)";
});

const templateIconBackground = computed(() => {
  if (typeof template.value.icon === "string") {
    return "rgba(77, 124, 254, 0.12)";
  }

  if (template.value.icon?.color) {
    return `${template.value.icon.color}1F`;
  }

  return "rgba(77, 124, 254, 0.12)";
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
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e7e9ef;
  padding: 12px 16px;
  border-radius: 10px;
  width: 30%;
  min-height: 88px;
  cursor: pointer;
  transition: var(--ccb-transition-normal);
  overflow: hidden;

  &:hover {
    border-color: #d8dce6;
    box-shadow: 0 6px 20px rgba(17, 24, 39, 0.06);

    .ccb-template-card__actions {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  }

  &--locked {
    .ccb-template-card__main {
      opacity: 0.92;
    }
  }

  &__main {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    width: 100%;
  }

  &__icon {
    width: 32px;
    height: 32px;
    min-width: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    i {
      font-size: 16px;
      line-height: 1;
    }
  }

  &__actions {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.94);
    opacity: 0;
    transform: translateY(6px);
    transition:
      var(--ccb-transition-normal),
      transform 0.18s ease;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
    pointer-events: none;

    button {
      padding: 4px 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      border-radius: 6px;
      border: 1px solid var(--ccb-border-normal);
      border: none;
      cursor: pointer;

      &.demo {
        background-color: var(--ccb-blue-bg-normal);
        color: var(--ccb-w-normal);

        &:hover {
          background-color: var(--ccb-blue-bg-hover);
          color: var(--ccb-w-normal);
        }
      }

      &.use-template {
      }
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  &__heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;

    :deep(.text) {
      color: #1f232a;
      line-height: 1.2;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  &__delete {
    &:hover {
      color: var(--ccb-red-bg-normal);
    }
  }

  &__favorite {
    cursor: pointer;
    color: #98a1b2;
    font-size: 18px;
    margin-left: 4px;
    transition: color 0.2s ease;

    &:hover {
      color: #495366;
    }

    &-icon {
      &:last-child {
        color: var(--ccb-red-bg-normal);
      }
    }
  }

  &__description {
    :deep(.text) {
      color: #717a8a;
      line-height: 1.3;
      min-height: calc(1em * 1.3 * 2);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-clamp: 2;
      overflow: hidden;
    }
  }

  @media (max-width: 767px) {
    padding: 10px 12px;

    &__actions {
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
