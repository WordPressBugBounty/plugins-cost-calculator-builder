<template>
  <div class="ccb-loader-5">
    <div class="ccb-loader-5-item" style="width: 50%"></div>
    <div class="ccb-loader-5-item" style="width: 70%"></div>
    <div class="ccb-loader-5-item" style="width: 40%"></div>
    <div class="ccb-loader-5-item" style="width: 30%"></div>
    <div class="ccb-loader-5-item" style="width: 80%"></div>
    <div class="ccb-loader-5-item" style="width: 90%"></div>
    <div class="ccb-loader-5-item" style="width: 100%"></div>
  </div>
</template>

<style>
.ccb-loader-5 {
  width: 20px;
  height: 20px;
}

.calc-preloader-box > div .ccb-loader-5 {
  display: flex;
  gap: 2px;
  flex-direction: column;
}
.calc-preloader-box > div .ccb-loader-5 .ccb-loader-5-item {
  height: 4px;
  border-radius: 4px;
  background: linear-gradient(100deg, #e0e0e0 30%, #f8f8f8 50%, #e0e0e0 70%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.2s infinite;
}
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
