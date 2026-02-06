<template>
  <div class="ccb-header-title">
    <img
      :src="icon"
      v-if="icon"
      width="20"
      height="20"
      alt="ccb total summary icon"
    />
    <span>{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";

type Props = {
  title: string | undefined;
  icon?: string | undefined;
};

const props = defineProps<Props>();
const { title, icon } = toRefs(props);
</script>

<style lang="scss">
.ccb-header-title {
  font-size: var(--ccb-header-size);
  font-weight: var(--ccb-header-weight);
  color: var(--ccb-text-color);
  text-align: left;
  display: flex;
  align-items: center;
  column-gap: 10px;

  &.ccb-calculator-name {
    display: var(--ccb-header-display);
  }

  @media only screen and (max-width: 480px) {
    font-size: var(--ccb-mobile-header-size);
    font-weight: var(--ccb-mobile-header-weight);
  }
}
</style>
