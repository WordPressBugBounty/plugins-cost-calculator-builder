<template>
  <WooRedirectCart v-if="showWooRedirectCart" />
</template>

<script setup lang="ts">
import WooRedirectCart from "@/widget/shared/ui/wrappers/components/WooRedirectCart.vue";

type Props = {
  showWooRedirectCart: boolean;
};

defineProps<Props>();
</script>
