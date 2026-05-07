<template>
  <div class="ccb-progress-with-bar">
    <div class="ccb-progress-with-bar__title">
      {{ calcTitle.length > 25 ? calcTitle.slice(0, 22) + "..." : calcTitle }}
    </div>
    <div class="ccb-progress-with-bar__right">
      <div class="ccb-progress-with-bar__count">
        {{ translationsStore.getTranslations.step }} {{ step }}/{{ count }}
      </div>
      <div class="ccb-progress-with-bar__track">
        <span
          class="ccb-progress-with-bar__fill"
          :style="calculateProgressWith"
        ></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRefs, defineProps, computed } from "vue";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore.ts";

type Props = {
  pages: [];
  step: number;
  hideTitle: boolean;
  calcTitle: string;
};

const props = defineProps<Props>();
const translationsStore = useTranslationsStore();

const { pages, step, calcTitle } = toRefs(props);

const count = computed(() => pages.value.length);

const progress = computed(() => {
  return (step.value / count.value) * 100;
});

const calculateProgressWith = computed(() => {
  return `width: ${progress.value}%`;
});
</script>

<style scoped lang="scss">
.ccb-progress-with-bar {
  width: 100%;
  padding: 8px 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__title {
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--ccb-fields-description-color);
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
    color: var(--ccb-fields-description-color);
  }

  &__track {
    width: 100%;
    height: 6px;
    border-radius: 4px;
    background: var(--ccb-fields-bg-color);
  }

  &__fill {
    display: block;
    background: var(--ccb-accent-color);
    height: 100%;
    width: 0;
    border-radius: 4px;
    transition: width 0.4s ease;
  }
}
</style>
