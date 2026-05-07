<template>
  <div>
    <h1>{{ translations.settings }}</h1>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
</script>

<style scoped lang="scss"></style>
