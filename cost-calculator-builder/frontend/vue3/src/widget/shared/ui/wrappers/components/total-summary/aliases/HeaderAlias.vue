<template>
  <div class="ccb-summary-list__header" style="width: 100%">
    <HeaderTitle :title="title" :icon="iconPath" />

    <button
      v-if="settingsStore.general?.descriptions"
      class="ccb-summary-list__accordion-btn"
      @click="toggleBody"
      @keydown.enter.prevent="toggleBody"
      @keydown.space.prevent="toggleBody"
      type="button"
      :aria-label="
        translationsStore.getTranslations?.details || 'Toggle details'
      "
      :aria-expanded="isDetailsVisible"
      :class="{ rotated: !isDetailsVisible }"
    >
      <i class="ccb-icon-Path-3485"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import HeaderTitle from "@/widget/shared/ui/wrappers/components/HeaderTitle.vue";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { useTranslationsStore } from "@/widget/app/providers/stores/translationsStore";

type Props = {
  showSummary: boolean;
  formTitle?: string;
  isDetailsVisible: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  isDetailsVisible: true,
});

const settingsStore = useSettingsStore();
const translationsStore = useTranslationsStore();
const emit = defineEmits<{
  (e: "toggle-details"): void;
}>();

const title = computed(() => {
  if (!props.showSummary && props.formTitle) {
    return props.formTitle;
  }

  return settingsStore.getGeneralSettings?.headerTitle;
});

const iconPath = computed(() => {
  return props.showSummary ? settingsStore.general?.iconPath : undefined;
});

const isDetailsVisible = computed(() => props.isDetailsVisible);

const toggleBody = () => {
  emit("toggle-details");
};
</script>

<style lang="scss" scoped>
.ccb-summary-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ccb-summary-list__accordion-btn {
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  background: var(--ccb-container-dark-color);
  color: var(--ccb-text-color);
  border-radius: 20px;
  font-size: 8px;
  border: none;
  padding: 0;
  line-height: 1;
  outline: none;

  transition: transform 0.4s;

  &.rotated {
    transform: rotate(180deg);
  }
}
</style>
