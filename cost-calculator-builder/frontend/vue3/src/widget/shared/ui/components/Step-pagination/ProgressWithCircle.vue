<template>
  <div class="ccb-progress-with-circle">
    <div class="ccb-progress-with-circle__title">
      {{ calcTitle.length > 25 ? calcTitle.slice(0, 22) + "..." : calcTitle }}
    </div>
    <div class="ccb-progress-with-circle__right">
      <div class="ccb-progress-with-circle__ring">
        <svg viewBox="0 0 20 20">
          <circle
            class="ccb-progress-with-circle__ring-bg"
            cx="10"
            cy="10"
            r="8"
          />
          <circle
            class="ccb-progress-with-circle__ring-progress"
            cx="10"
            cy="10"
            r="8"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="offset"
          />
        </svg>
      </div>
      <div class="ccb-progress-with-circle__count">
        {{ translationsStore.getTranslations.step }} {{ step }}/{{ count }}
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
  return (Number(step.value) / Number(count.value)) * 100;
});

const radius = 8;
const circumference = 2 * Math.PI * radius;

const offset = computed(() => {
  return circumference - (progress.value / 100) * circumference;
});
</script>
<style scoped lang="scss">
.ccb-progress-with-circle {
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
    stroke: var(--ccb-fields-bg-color);
  }

  &__ring-progress {
    stroke: var(--ccb-accent-color);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.35s ease;
  }

  &__count {
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    color: var(--ccb-fields-description-color);
  }
}
</style>
