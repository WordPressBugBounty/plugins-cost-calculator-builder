<template>
  <div class="loader ccb-loader"></div>
</template>

<script setup lang="ts">
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { accentColor } = useAppearanceColors();
</script>

<style lang="scss">
.ccb-loader {
  border: 2px solid #d2d8e5;
  border-top: 2px solid v-bind(accentColor);
  top: 25%;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
