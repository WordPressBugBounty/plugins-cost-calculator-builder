<template>
  <OrderForm />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import OrderForm from "@/widget/features/submission/order-form";
import { useOrderFormStore } from "@/widget/app/providers/stores/orderFormStore.ts";

const orderFormStore = useOrderFormStore();

onMounted(() => {
  orderFormStore.updateNextButtonStatus(false);
  //   orderFormStore.updateNextButton(true);
});
</script>
