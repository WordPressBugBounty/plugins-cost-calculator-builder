<template>
  <div
    class="ccb-page-nav-progress-bar"
    @click.stop="$emit('select')"
    :class="{ active: isActive }"
  >
    <div class="ccb-page-nav-progress-bar__title">Calculator title</div>
    <div class="ccb-page-nav-progress-bar__right">
      <span class="ccb-page-nav-progress-bar__count">
        Step {{ activePage + 1 }}/{{ pages.length }}
      </span>
      <div class="ccb-page-nav-progress-bar__track">
        <div
          class="ccb-page-nav-progress-bar__fill"
          :style="{ width: progress + '%' }"
        />
      </div>
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

const progress = computed(() => {
  return ((props.activePage + 1) / props.pages.length) * 100;
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
.ccb-page-nav-progress-bar {
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
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    max-width: 200px;
    width: 40%;
  }

  &__count {
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: v-bind(textDefaultColor);
  }

  &__track {
    width: 100%;
    height: 6px;
    border-radius: 4px;
    background: v-bind(formFieldsColor);
  }

  &__fill {
    height: 100%;
    border-radius: 4px;
    background: v-bind(accentColor);
    transition: width 0.4s ease;
  }
}
</style>
