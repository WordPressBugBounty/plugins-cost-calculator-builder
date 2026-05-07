<template>
  <div class="ccb-rectangle-tab">
    <div class="ccb-rectangle-tab__steps">
      <div
        v-for="(page, index) in pages"
        :key="page.id"
        class="ccb-rectangle-tab__step"
        :class="{
          'is-active': index + 1 === step,
          'is-done': index + 1 < step,
        }"
      >
        <span class="ccb-rectangle-tab__rect">
          <i v-if="index + 1 < step" class="ccb-icon-radius-check"></i>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span
          class="ccb-rectangle-tab__label"
          v-if="!hideTitle"
          :title="page.label"
        >
          {{ page.title }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  pages: { id: number; label: string; title: string }[];
  step: number;
  hideTitle: boolean;
  calcTitle: string;
}>();
</script>

<style scoped lang="scss">
.ccb-rectangle-tab {
  width: 100%;
  padding: 8px 20px;
  box-sizing: border-box;

  &__steps {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    overflow-x: auto;
  }

  &__step {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    padding: 4px 8px 4px 4px;
    border-radius: 8px;
    transition: background 0.2s ease;

    &:hover {
      background: var(--ccb-wb-hover, #f3f4f6);
    }
  }

  &__rect {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    flex-shrink: 0;
    background: var(--ccb-fields-bg-color);
    color: var(--ccb-fields-description-color);
    transition: all 0.25s ease;

    i {
      font-size: 14px;
    }
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
    color: var(--ccb-fields-description-color);
    white-space: nowrap;
    transition: all 0.25s ease;
  }

  &__step.is-active &__rect {
    background: var(--ccb-accent-color);
    color: var(--ccb-container-color);
  }

  &__step.is-active &__label {
    color: var(--ccb-text-color);
    font-weight: 600;
  }

  &__step.is-done &__rect {
    background-color: var(--ccb-page-done-bg-color, var(--ccb-container-color));
    color: var(--ccb-accent-color);
  }

  &__step.is-done &__label {
    color: var(--ccb-text-color);
  }
}
</style>
