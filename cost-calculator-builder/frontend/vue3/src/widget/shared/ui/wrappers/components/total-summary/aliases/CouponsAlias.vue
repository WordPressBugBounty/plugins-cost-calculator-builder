<template>
  <Promocode v-if="show && showSummary" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDiscounts } from "@/widget/actions/discounts/composable/useDiscounts.ts";
import Promocode from "@/widget/features/discounts/components";

type Props = {
  showSummary: boolean;
};

defineProps<Props>();

const { hasPromocodes } = useDiscounts();

const show = computed(() => hasPromocodes());
</script>
