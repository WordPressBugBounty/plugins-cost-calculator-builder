<template>
  <BoxStyles v-if="appStore.getIsLive && !pageBreakEnabled" />
  <LegacyCalculator v-if="!pageBreakEnabled || !appStore.isProActive" />
  <PageBreaker v-else-if="pageBreakEnabled && appStore.isProActive" />
</template>

<script lang="ts" setup>
import LegacyCalculator from "@/widget/widgets/legacy-calculator";
import PageBreaker from "@/widget/widgets/page-breaker";
import { useFields } from "@/widget/actions/fields/composable/useFields.ts";
import BoxStyles from "@/widget/shared/ui/components/Box-styles/BoxStyles.vue";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";

const appStore = useAppStore();
const fieldsInstance = useFields();
const pageBreakEnabled = fieldsInstance.getPageBreakEnabled();
</script>
