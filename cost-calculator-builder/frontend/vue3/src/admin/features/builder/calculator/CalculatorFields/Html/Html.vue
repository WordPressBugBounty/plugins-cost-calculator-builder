<template>
  <div
    v-if="isEmpty"
    class="ccb-field ccb-field--html-empty"
    :class="{ [additionalClasses]: true }"
  >
    <div class="ccb-field__empty-placeholder">
      <p class="ccb-field__empty-text" style="padding: 10px">
        No HTML content yet. Open the <strong>HTML field settings</strong> and
        add your custom content.
      </p>
    </div>
  </div>
  <div
    v-else
    class="ccb-field"
    ref="rootEl"
    v-html="field.htmlContent"
    :class="{ [additionalClasses]: true }"
  ></div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick, toRefs } from "vue";
import { IHtmlField } from "@/admin/shared/types/fields.type";

const props = defineProps<{
  field: IHtmlField;
}>();

const { field } = toRefs(props);

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
});

const isEmpty = computed(() => {
  const content = field.value.htmlContent;
  if (!content) return true;
  const stripped = content.replace(/<[^>]*>/g, "").trim();
  return (
    stripped.length === 0 &&
    !/<(img|iframe|video|audio|canvas|svg|embed|object)\b/i.test(content)
  );
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
  () => field.value.htmlContent,
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

.ccb-field--html-empty {
  .ccb-field__empty-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px dashed #d0d5dd;
    border-radius: 8px;
    background-color: #f9fafb;
    text-align: center;
    min-height: 50px;
    column-gap: 8px;
    cursor: pointer;
  }

  .ccb-field__empty-icon {
    font-size: 16px;
    font-weight: 600;
    color: #98a2b3;
    font-family: monospace;
  }

  .ccb-field__empty-text {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #667085;

    strong {
      color: #344054;
    }
  }
}
</style>
