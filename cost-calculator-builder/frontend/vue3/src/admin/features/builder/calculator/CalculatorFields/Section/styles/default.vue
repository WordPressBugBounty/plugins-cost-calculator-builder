<template>
  <div
    class="ccb-section"
    :class="[{ collapsed }, effectiveStyle || sectionStyles?.style]"
    :style="{ '--ccb-section-text-color': sectionStyles?.textColor }"
  >
    <div class="ccb-section__header" @click="onHeaderClick">
      <div class="ccb-section__header-left">
        <slot name="headerPrepend" />
        <div class="ccb-section__icon" v-if="sectionStyles?.iconPath">
          <img :src="sectionStyles?.iconPath" alt="section icon" />
        </div>
        <h2
          v-if="showTitle"
          class="ccb-section__title"
          :style="{ color: sectionStyles?.textColor }"
        >
          {{ field.label }}
        </h2>
      </div>
      <div class="ccb-section__header-right">
        <div class="ccb-section__actions" v-if="field.collapsible">
          <div class="ccb-section__actions-item">
            <i class="ccb-icon-Path-3514"></i>
          </div>
        </div>
        <slot name="headerAppend" />
      </div>
    </div>
    <div class="ccb-section__content">
      <Transition name="fade">
        <div class="ccb-section__body">
          <slot />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import type { ISection } from "@/admin/shared/types/fields.type";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

type SectionStyles = NonNullable<ISection["styles"]> & {
  textColor?: string;
  backgroundColor?: string;
};

type Props = {
  field: ISection;
  effectiveStyle?: string;
  hasFields?: boolean;
  collapsed: boolean;
  toggleCollapse: () => void;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const sectionStyles = computed<SectionStyles | undefined>(
  () => field.value.styles as SectionStyles | undefined,
);

const showTitle = computed(() => field.value.showName !== false);

const onHeaderClick = (event: MouseEvent) => {
  if (!field.value.collapsible) return;
  const target = event.target as HTMLElement;
  if (target.closest("[data-section-no-collapse]")) return;
  props.toggleCollapse();
};

const {
  containerColor,
  containerPaddingTop,
  containerPaddingRight,
  containerPaddingBottom,
  containerPaddingLeft,
  containerBorderRadius,
  containerBorder,
  containerShadow,
} = useAppearanceColors();
</script>

<style lang="scss" scoped>
.ccb-section.default {
  box-shadow: v-bind(containerShadow);
  padding: v-bind(containerPaddingTop) v-bind(containerPaddingRight)
    v-bind(containerPaddingBottom) v-bind(containerPaddingLeft);
  border-radius: v-bind(containerBorderRadius);
  border: v-bind(containerBorder);
  background-color: v-bind(containerColor);
  backdrop-filter: var(--ccb-container-invert);
  -webkit-backdrop-filter: var(--ccb-container-invert);
  margin: var(--ccb-container-margin-top) var(--ccb-container-margin-right)
    var(--ccb-container-margin-bottom) var(--ccb-container-margin-left);

  &.collapsed {
    .ccb-section__header {
      margin-bottom: 0;
    }
    .ccb-section__content {
      display: none;
    }

    .ccb-section__actions {
      transform: rotate(180deg);
    }
  }

  .ccb-section__actions {
    transition: transform 0.3s ease-in-out;
  }

  .ccb-section__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    gap: 8px;

    .ccb-section__header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;

      .ccb-section__icon {
        width: 24px;
        height: 24px;
        display: flex;
        img {
          width: 100%;
        }
      }
      .ccb-section__title {
        font-size: 16px;
        font-weight: 700;
        color: var(--ccb-text-color);
        margin-bottom: 10px;
        margin-top: 10px;
      }
    }
  }

  .ccb-section__header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ccb-section__actions {
    cursor: pointer;
    .ccb-section__actions-item {
      display: flex;
      .ccb-section__actions-plus {
        width: 16px;
        height: 16px;
        border: 1px solid var(--ccb-section-text-color, #1ab163);
        border-radius: 4px;
        position: relative;
        &:before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 2px;
          background-color: var(--ccb-section-text-color, #1ab163);
        }
        &:after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 2px;
          height: 10px;
          background-color: var(--ccb-section-text-color, #1ab163);
        }
      }
    }
    &:hover {
      color: var(--ccb-primary-color);
    }
  }
}
</style>
