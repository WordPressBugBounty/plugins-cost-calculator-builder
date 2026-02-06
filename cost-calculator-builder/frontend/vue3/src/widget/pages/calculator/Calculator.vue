<template>
  <BoxStyles v-if="appStore.getIsLive && !pageBreakEnabled" />
  <PageBreaker v-else-if="pageBreakEnabled" />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import PageBreaker from "@/widget/widgets/page-breaker";
import BoxStyles from "@/widget/shared/ui/components/Box-styles/BoxStyles.vue";
import { useAppStore } from "@/widget/app/providers/stores/appStore.ts";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";

const appStore = useAppStore();
const fieldsStore = useFieldsStore();
const pageBreakEnabled = computed(() => fieldsStore.getPageBreakEnabled);
</script>
