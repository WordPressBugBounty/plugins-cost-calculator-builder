<template>
  <div class="ccb-rich-editor">
    <label v-if="label" class="ccb-rich-editor__label">{{ label }}</label>
    <div class="ccb-rich-editor__wrapper">
      <QuillEditor
        :content="content"
        content-type="html"
        :placeholder="placeholder"
        :toolbar="toolbar"
        theme="snow"
        @update:content="onUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  label: "",
  placeholder: "Type here...",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", event: null, value: string): void;
}>();

const toolbar = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ align: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link"],
  ["clean"],
];

const content = ref<string>(props.modelValue || "");

watch(
  () => props.modelValue,
  (val) => {
    if (val !== content.value) {
      content.value = val || "";
    }
  },
);

const onUpdate = (val: string) => {
  emit("update:modelValue", val);
  emit("change", null, val);
};
</script>

<style lang="scss">
.ccb-rich-editor {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ccb-font-comment);
    line-height: 1;
    padding-left: 16px;
  }

  &__wrapper {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--ccb-border-normal);
    transition: border-color var(--ccb-transition-normal);

    &:focus-within {
      border-color: var(--ccb-blue-fg-normal);
    }

    .ql-toolbar {
      border: none;
      border-bottom: 1px solid var(--ccb-border-normal);
      background: var(--ccb-bgr-sidebar);
      padding: 6px 8px;

      .ql-formats {
        margin-right: 6px;
      }

      button,
      .ql-picker-label {
        color: var(--ccb-font-text);

        &:hover,
        &.ql-active {
          color: var(--ccb-blue-fg-normal);

          .ql-stroke {
            stroke: var(--ccb-blue-fg-normal);
          }

          .ql-fill {
            fill: var(--ccb-blue-fg-normal);
          }
        }
      }

      .ql-stroke {
        stroke: var(--ccb-font-text);
      }

      .ql-fill {
        fill: var(--ccb-font-text);
      }

      .ql-picker-options {
        background: var(--ccb-bgr-overlay);
        border: 1px solid var(--ccb-border-normal);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
    }

    .ql-container {
      border: none;
      font-family: inherit;
      font-size: 13px;
    }

    .ql-editor {
      min-height: 140px;
      max-height: 280px;
      overflow-y: auto;
      color: var(--ccb-font-text);
      line-height: 1.6;

      &.ql-blank::before {
        color: var(--ccb-font-comment);
        font-style: normal;
      }

      h1 {
        font-size: 20px;
      }
      h2 {
        font-size: 17px;
      }
      h3 {
        font-size: 15px;
      }

      blockquote {
        border-left: 3px solid var(--ccb-blue-fg-normal);
        padding-left: 10px;
        color: var(--ccb-font-comment);
      }

      pre {
        background: var(--ccb-bw-dull-normal);
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12px;
      }
    }
  }
}
</style>
