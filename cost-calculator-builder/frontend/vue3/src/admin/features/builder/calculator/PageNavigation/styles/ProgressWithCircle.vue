<template>
  <div
    class="ccb-page-nav-progress-circle"
    @click.stop="$emit('select')"
    :class="{ active: isActive }"
  >
    <div class="ccb-page-nav-progress-circle__title">Calculator title</div>
    <div class="ccb-page-nav-progress-circle__right">
      <div class="ccb-page-nav-progress-circle__ring">
        <svg viewBox="0 0 20 20">
          <circle
            class="ccb-page-nav-progress-circle__ring-bg"
            cx="10"
            cy="10"
            r="8"
          />
          <circle
            class="ccb-page-nav-progress-circle__ring-progress"
            cx="10"
            cy="10"
            r="8"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="offset"
          />
        </svg>
      </div>
      <span class="ccb-page-nav-progress-circle__count">
        Step {{ activePage + 1 }}/{{ pages.length }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";
import type {
  PageNavigationProps,
  PageNavigationEmits,
} from "@/admin/shared/types/appearance.type";

const props = defineProps<PageNavigationProps>();
defineEmits<PageNavigationEmits>();

const radius = 8;
const circumference = 2 * Math.PI * radius;

const progress = computed(() => {
  return ((props.activePage + 1) / props.pages.length) * 100;
});

const offset = computed(() => {
  return circumference - (progress.value / 100) * circumference;
});

const {
  containerColor,
  accentColor,
  formFieldsColor,
  textDefaultColor,
  containerShadow,
  containerBorder,
  containerBorderRadius,
} = useAppearanceColors();
</script>

<style scoped lang="scss">
.ccb-page-nav-progress-circle {
  width: 100%;
  padding: 8px 20px;
  background: v-bind(containerColor);
  border: 1px solid transparent;
  border-radius: 16px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: border-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  box-shadow: v-bind(containerShadow);
  border: v-bind(containerBorder);
  border-radius: v-bind(containerBorderRadius);

  &:hover {
    border-color: var(--ccb-blue-bg-normal, #0b79d0);
  }

  &.active {
    border-color: var(--ccb-blue-bg-normal, #0b79d0);
  }

  &__title {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: v-bind(textDefaultColor);
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__ring {
    width: 20px;
    height: 20px;
    flex-shrink: 0;

    svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);

      circle {
        fill: transparent;
        stroke-width: 3;
      }
    }
  }

  &__ring-bg {
    stroke: v-bind(formFieldsColor);
  }

  &__ring-progress {
    stroke: v-bind(accentColor);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.35s ease;
  }

  &__count {
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: v-bind(textDefaultColor);
  }
}
</style>
