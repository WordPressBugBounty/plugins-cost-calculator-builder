<template>
  <div class="ccb-rectangle-with-line">
    <div class="ccb-rectangle-with-line__steps">
      <div
        v-for="(page, index) in pages"
        :key="page.id"
        class="ccb-rectangle-with-line__item"
      >
        <div
          class="ccb-rectangle-with-line__step"
          :class="{
            'is-active': index + 1 === step,
            'is-done': index + 1 < step,
          }"
        >
          <span class="ccb-rectangle-with-line__rect">
            <i v-if="index + 1 < step" class="ccb-icon-radius-check"></i>
            <span v-else>{{ index + 1 }}</span>
          </span>
          <span class="ccb-rectangle-with-line__label" v-if="!hideTitle">
            {{ page.title }}
          </span>
        </div>

        <div
          v-if="index < pages.length - 1"
          class="ccb-rectangle-with-line__line"
          :class="{ 'is-done': index + 1 < step }"
        />
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
.ccb-rectangle-with-line {
  width: 100%;
  padding: 8px 20px;
  box-sizing: border-box;

  &__steps {
    display: flex;
    align-items: flex-start;
    width: 100%;
  }

  &__item {
    display: contents;
  }

  &__step {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    min-width: 80px;
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
    border: 2px solid var(--ccb-fields-bg-color);
    background: var(--ccb-container-color);
    color: var(--ccb-fields-description-color);
    transition: all 0.25s ease;

    i {
      font-size: 14px;
    }
  }

  &__label {
    margin-top: 8px;
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
    color: var(--ccb-fields-description-color);
    white-space: nowrap;
    transition: all 0.25s ease;
  }

  &__step.is-active &__rect {
    background: var(--ccb-accent-color);
    border-color: var(--ccb-accent-color);
    color: var(--ccb-container-color);
  }

  &__step.is-active &__label {
    color: var(--ccb-accent-color);
    font-weight: 600;
  }

  &__step.is-done &__rect {
    background-color: var(--ccb-page-done-bg-color, var(--ccb-container-color));
    border-color: var(--ccb-accent-color);
    color: var(--ccb-accent-color);
  }

  &__step.is-done &__label {
    color: var(--ccb-text-color);
  }

  &__line {
    flex: 1;
    height: 2px;
    background: var(--ccb-fields-bg-color);
    margin: 17px 4px 0;
    transition: background 0.25s ease;

    &.is-done {
      background: var(--ccb-accent-color);
    }
  }
}
</style>
