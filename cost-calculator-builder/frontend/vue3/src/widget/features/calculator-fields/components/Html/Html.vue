<template>
  <div
    class="ccb-field"
    ref="rootEl"
    v-html="field.htmlContent"
    :class="{ [additionalClasses]: true }"
  ></div>
</template>

<script setup lang="ts">
import { toRefs, computed, ref, onMounted, watch, nextTick } from "vue";
import { IHtmlField } from "@/widget/shared/types/fields";

type Props = {
  field: IHtmlField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});

const rootEl = ref<HTMLElement | null>(null);

function executeInlineScripts(container: HTMLElement) {
  const scripts = Array.from(container.querySelectorAll("script"));
  for (const oldScript of scripts) {
    const newScript = document.createElement("script");
    for (const { name, value } of Array.from(oldScript.attributes)) {
      try {
        newScript.setAttribute(name, value);
      } catch (_) {}
    }
    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent || "";
    }
    oldScript.parentNode?.replaceChild(newScript, oldScript);
  }
}

async function runScriptsIfAny() {
  if (!rootEl.value) return;
  await nextTick();
  executeInlineScripts(rootEl.value);
}

onMounted(() => {
  runScriptsIfAny();
});

watch(
  () => field.value?.htmlContent,
  () => {
    runScriptsIfAny();
  },
);
</script>

<style lang="scss">
.ccb-field {
  img {
    max-width: 100%;
    max-height: 100%;
    height: auto;
    width: auto;
    display: block;
  }
}
</style>
