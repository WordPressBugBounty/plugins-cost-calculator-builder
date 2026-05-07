<template>
  <div class="ccb-calculator-loader">
    <div class="ccb-calculator-loader-item"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style>
.ccb-calculator-loader-item {
  width: 48px;
  height: 48px;
  border: 5px solid var(--ccb-accent-color);
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
