<template>
  <div class="ccb-edit-formula-wrapper">
    <div class="ccb-edit-field-formula">
      <div class="ccb-formula-content">
        <div class="ccb-input-wrapper">
          <textarea
            ref="textareaRef"
            class="ccb-legacy-formula-textarea"
            placeholder="Enter your formula"
            :value="modelValue"
            @input="onInput"
            @change="onChange"
          />
        </div>
      </div>

      <div class="ccb-formula-tools">
        <span
          v-for="tool in toolbarItems"
          :key="tool.label"
          class="ccb-formula-tool"
          :title="tool.title ?? tool.label"
          @click="onToolClick(tool.insertText)"
        >
          <span v-if="tool.label === '+'" class="plus">+</span>
          <span v-else-if="tool.label === '*'" class="multiple">*</span>
          <template v-else>{{ tool.label }}</template>
        </span>
      </div>
    </div>

    <div class="ccb-edit-field-aliases">
      <template v-if="availableFields.length">
        <div
          v-for="field in visibleFields"
          :key="field.alias"
          class="ccb-edit-field-alias"
          :title="field.alias"
          @click="onToolClick(field.alias)"
        >
          <div class="ccb-edit-field-label">
            <span>{{ field.label }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="ccb-no-fields-message">No available fields yet!</p>
      </template>
    </div>

    <div class="ccb-edit-field-info" style="margin-top: 5px">
      <a
        class="ccb-documentation-link"
        href="https://docs.stylemixthemes.com/cost-calculator-builder/calculator-elements/total"
        target="_blank"
      >
        How does it work?
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { IAvailableField, IToolbarItem } from "./formula.types";

const props = defineProps<{
  modelValue: string;
  availableFields: IAvailableField[];
  fieldAlias?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const visibleFields = computed(() =>
  props.availableFields.filter((f) => f.alias !== "total"),
);

const toolbarItems: IToolbarItem[] = [
  { label: "+", insertText: "+", title: "Addition" },
  { label: "-", insertText: "-", title: "Subtraction" },
  { label: "/", insertText: "/", title: "Division" },
  { label: "%", insertText: "%", title: "Remainder" },
  { label: "*", insertText: "*", title: "Multiplication" },
  { label: "pow", insertText: "Math.pow(", title: "Power" },
  { label: "sqrt", insertText: "Math.sqrt(", title: "Square root" },
  { label: "abs", insertText: "Math.abs(", title: "Absolute value" },
  { label: "round", insertText: "Math.round(", title: "Round" },
  { label: "ceil", insertText: "Math.ceil(", title: "Ceil" },
  { label: "floor", insertText: "Math.floor(", title: "Floor" },
];

function insertAtCursor(text: string): void {
  const el = textareaRef.value;
  if (!el) return;

  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const before = el.value.substring(0, start);
  const after = el.value.substring(end);

  const newValue = `${before} ${text} ${after}`;
  emit("update:modelValue", newValue);

  requestAnimationFrame(() => {
    if (!textareaRef.value) return;
    const cursorPos = start + text.length + 2;
    textareaRef.value.focus();
    textareaRef.value.setSelectionRange(cursorPos, cursorPos);
  });
}

function onToolClick(text: string): void {
  insertAtCursor(text);
}

function onInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}

function onChange(event: Event): void {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}
</script>

<style lang="scss">
@use "./formula-builder.scss";

.ccb-legacy-formula-textarea {
  width: 100%;
  min-height: 120px;
  border: none !important;
  outline: none;
  resize: vertical;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.5;
}

.ccb-no-fields-message {
  color: #999;
  font-size: 13px;
  padding: 6px;
  margin: 0;
}
</style>
