<template>
  <div class="ccb-text" :class="classes">
    {{ translatedText }}
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import type { IText } from "@/admin/shared/types/uikit.type";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { translateAdminText } from "@/admin/shared/utils/translate-admin-text.utils";

const props = defineProps<IText>();

const { text } = toRefs(props);
const translationsStore = useBuilderTranslationsStore();

const classes = computed(() => {
  return [`ccb-text-${props.size}`, `ccb-${props.weight}`];
});

const translatedText = computed(() =>
  props.showOriginal
    ? text.value
    : translateAdminText(text.value, translationsStore.getTranslations),
);
</script>

<style lang="scss">
.ccb-bold {
  font-weight: 700;
}

.ccb-medium {
  font-weight: 500;
}

.ccb-regular {
  font-weight: 400;
}

.ccb-thin {
  font-weight: 300;
}

.ccb-text-xl {
  font-size: 32px;
  line-height: 40px;
}

.ccb-text-lx {
  font-size: 24px;
  line-height: normal;
}

.ccb-text-l {
  font-size: 20px;
  line-height: 24px;
}

.ccb-text-m {
  font-size: 16px;
  line-height: 20px;
}

.ccb-text-mx {
  font-size: 18px;
  line-height: 20px;
}

.ccb-text-s {
  font-size: 14px;
  line-height: 16px;
}

.ccb-text-xs {
  font-size: 12px;
  line-height: 16px;
}
</style>
