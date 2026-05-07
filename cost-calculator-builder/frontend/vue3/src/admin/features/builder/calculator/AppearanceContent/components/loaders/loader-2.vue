<template>
  <div class="ccb-loader-2">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script setup lang="ts">
import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { accentColor } = useAppearanceColors();
</script>

<style lang="scss">
.ccb-loader-2 {
  display: inline-block;
  position: relative;
  width: 60px;
  height: 60px;
  transform: scale(0.3);
  left: -8px;
}
.ccb-loader-2 div {
  animation: ccb-loader-2 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  transform-origin: 40px 40px;
}
.ccb-loader-2 div:after {
  content: " ";
  display: block;
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: v-bind(accentColor);
  margin: -4px 0 0 -4px;
}
.ccb-loader-2 div:nth-child(1) {
  animation-delay: -0.036s;
}
.ccb-loader-2 div:nth-child(1):after {
  top: 63px;
  left: 63px;
}
.ccb-loader-2 div:nth-child(2) {
  animation-delay: -0.072s;
}
.ccb-loader-2 div:nth-child(2):after {
  top: 68px;
  left: 56px;
}
.ccb-loader-2 div:nth-child(3) {
  animation-delay: -0.108s;
}
.ccb-loader-2 div:nth-child(3):after {
  top: 71px;
  left: 48px;
}
.ccb-loader-2 div:nth-child(4) {
  animation-delay: -0.144s;
}
.ccb-loader-2 div:nth-child(4):after {
  top: 72px;
  left: 40px;
}
.ccb-loader-2 div:nth-child(5) {
  animation-delay: -0.18s;
}
.ccb-loader-2 div:nth-child(5):after {
  top: 71px;
  left: 32px;
}
.ccb-loader-2 div:nth-child(6) {
  animation-delay: -0.216s;
}
.ccb-loader-2 div:nth-child(6):after {
  top: 68px;
  left: 24px;
}
.ccb-loader-2 div:nth-child(7) {
  animation-delay: -0.252s;
}
.ccb-loader-2 div:nth-child(7):after {
  top: 63px;
  left: 17px;
}
.ccb-loader-2 div:nth-child(8) {
  animation-delay: -0.288s;
}
.ccb-loader-2 div:nth-child(8):after {
  top: 56px;
  left: 12px;
}

@keyframes ccb-loader-2 {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
