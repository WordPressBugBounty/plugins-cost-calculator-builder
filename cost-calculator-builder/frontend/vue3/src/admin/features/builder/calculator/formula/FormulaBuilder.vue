<template>
  <div class="ccb-edit-formula-wrapper">
    <div class="ccb-edit-field-formula">
      <div class="ccb-formula-content">
        <div
          ref="editorContainer"
          class="ccb-cm-formula-input"
          spellcheck="false"
        ></div>
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

    <div v-if="availableFields.length" class="ccb-edit-field-aliases">
      <div
        v-for="field in visibleFields"
        :key="field.alias"
        class="ccb-edit-field-alias"
        :title="field.alias"
        @click="onToolClick(' ' + field.letter + ' ')"
      >
        <div class="ccb-edit-field-letter">
          <span>{{ field.letter }}</span>
        </div>
        <div class="ccb-edit-field-label">
          <span>{{ field.label }}</span>
        </div>
      </div>
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
import { ref, computed, onMounted, watch, toRef } from "vue";
import type { IAvailableField, IToolbarItem } from "./formula.types";
import { buildDisplayFormula, buildRuntimeFormula } from "./formulaMappings";
import { useFormulaEditor } from "./useFormulaEditor";

const props = defineProps<{
  modelValue: string;
  availableFields: IAvailableField[];
  fieldAlias?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorContainer = ref<HTMLElement | null>(null);
const fieldsRef = toRef(props, "availableFields");

const {
  initEditor,
  insertAtCursor,
  getDisplayFormula,
  getDiagnostics,
  hasErrors,
  destroyEditor,
} = useFormulaEditor({
  fields: fieldsRef,
  onChange(displayFormula: string) {
    const runtime = buildRuntimeFormula(displayFormula, props.availableFields);
    emit("update:modelValue", runtime);
  },
});

defineExpose({ getDiagnostics, hasErrors });

const visibleFields = computed(() =>
  props.availableFields.filter((f) => f.alias !== "total"),
);

const toolbarItems: IToolbarItem[] = [
  { label: "+", insertText: "+", title: "Addition" },
  { label: "-", insertText: "-", title: "Subtraction" },
  { label: "/", insertText: "/", title: "Division" },
  { label: "%", insertText: "%", title: "Remainder" },
  { label: "*", insertText: "*", title: "Multiplication" },
  { label: "(", insertText: "(", title: "Open bracket" },
  { label: ")", insertText: ")", title: "Close bracket" },
  { label: "^", insertText: " POW(,) ", title: "Power" },
  { label: "\u221A", insertText: " SQRT() ", title: "Square root" },
  { label: "IF", insertText: "IF(){}", title: "IF operator" },
  { label: "IF ELSE", insertText: " IF(){}ELSE{} ", title: "IF ELSE operator" },
  { label: "AND", insertText: " AND ", title: "Boolean AND (&&)" },
  { label: "OR", insertText: " OR ", title: "Boolean OR" },
  { label: "<", insertText: "<", title: "Less than" },
  { label: ">", insertText: ">", title: "Greater than" },
  { label: "<=", insertText: "<=", title: "Less than or equal" },
  { label: ">=", insertText: ">=", title: "Greater than or equal" },
  { label: "!=", insertText: "!=", title: "Not equal" },
  { label: "==", insertText: "==", title: "Strict equal" },
  { label: "ABS", insertText: " ABS()", title: "Absolute value" },
  { label: "POW", insertText: " POW()", title: "Power" },
  { label: "ROUND", insertText: " ROUND()", title: "Round" },
  { label: "CEIL", insertText: " CEIL() ", title: "Ceil" },
  { label: "FLOOR", insertText: " FLOOR()", title: "Floor" },
  { label: "MIN", insertText: " MIN()", title: "Minimum" },
  { label: "MAX", insertText: " MAX()", title: "Maximum" },
];

function onToolClick(text: string): void {
  insertAtCursor(text);
}

function mountEditor(): void {
  if (!editorContainer.value) return;

  let displayFormula = buildDisplayFormula(
    props.modelValue,
    props.availableFields,
  );
  displayFormula = displayFormula.toUpperCase();

  initEditor(editorContainer.value, displayFormula);
}

onMounted(() => {
  mountEditor();
});

watch(
  () => props.availableFields,
  () => {
    const currentDisplay = getDisplayFormula();
    if (editorContainer.value) {
      destroyEditor();
      const display =
        currentDisplay ||
        buildDisplayFormula(
          props.modelValue,
          props.availableFields,
        ).toUpperCase();
      initEditor(editorContainer.value, display);
    }
  },
);
</script>

<style lang="scss">
@use "./formula-builder.scss";
</style>
