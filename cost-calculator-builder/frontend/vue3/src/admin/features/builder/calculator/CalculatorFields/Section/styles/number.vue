<template>
  <div
    class="ccb-section"
    :class="[{ collapsed }, effectiveStyle || sectionStyles?.style]"
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
            <i
              class="ccb-icon-Path-3398"
              :style="{ color: sectionStyles?.textColor }"
            ></i>
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

const {
  containerColor,
  borderColor,
  containerBorder,
  containerShadow,
  containerPaddingTop,
  containerPaddingRight,
  containerPaddingBottom,
  containerPaddingLeft,
  containerBorderRadius,
} = useAppearanceColors();

const onHeaderClick = (event: MouseEvent) => {
  if (!field.value.collapsible) return;
  const target = event.target as HTMLElement;
  if (target.closest("[data-section-no-collapse]")) return;
  props.toggleCollapse();
};
</script>

<style lang="scss" scoped>
.ccb-section.number {
  padding: v-bind(containerPaddingTop) v-bind(containerPaddingRight)
    v-bind(containerPaddingBottom) v-bind(containerPaddingLeft);
  background-color: v-bind(containerColor);
  backdrop-filter: var(--ccb-container-invert);
  -webkit-backdrop-filter: var(--ccb-container-invert);
  border-bottom: 1px solid v-bind(borderColor);
  box-shadow: v-bind(containerShadow);
  counter-increment: ccb-section;
  border: v-bind(containerBorder);
  border-radius: v-bind(containerBorderRadius);

  .ccb-section__header-left {
    position: relative;
    padding-left: 40px;

    &::before {
      content: counter(ccb-section);
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #0f2a3d;
      color: #fff;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

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
      i {
        transform: rotate(270deg);
        color: var(--ccb-text-color, #fff);
      }
    }
    &:hover {
      color: var(--ccb-primary-color);
    }
  }
}
</style>
