<template>
  <component
    :is="styleComponent"
    :field="effectiveField"
    :effective-style="resolvedStyle"
    :has-fields="hasFields"
    :collapsed="collapsed"
    :toggle-collapse="toggleCollapse"
  />
</template>

<script setup lang="ts">
import { computed, toRefs, defineAsyncComponent, ref } from "vue";
import { ISectionField, Field } from "@/widget/shared/types/fields";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore";

type Props = {
  field: ISectionField;
};

const props = defineProps<Props>();
const { field } = toRefs(props);

const collapsed = ref(field.value.defaultCollapsed);
const toggleCollapse = () => {
  if (!field.value.collapsible) return;
  collapsed.value = !collapsed.value;
};

const isGlobalSection = (f: Field): f is ISectionField => {
  return f.fieldName === "section" && !!(f as ISectionField).styles?.applyToAll;
};

const getFirstGlobalSection = (): ISectionField | undefined => {
  const fieldsStore = useFieldsStore();
  const allFields = fieldsStore.getFields;
  return allFields.find(isGlobalSection);
};

const resolvedStyle = computed(() => {
  let styleKey = field.value?.styles?.style || "default";
  const firstGlobal = getFirstGlobalSection();
  if (firstGlobal?.styles?.style) {
    styleKey = firstGlobal.styles.style;
  }
  return styleKey;
});

const effectiveField = computed<ISectionField>(() => {
  const current = field.value;
  const firstGlobal = getFirstGlobalSection();
  if (firstGlobal?.styles) {
    const g = firstGlobal.styles as Record<string, any>;
    const c = (current.styles || {}) as Record<string, any>;
    const mergedStyles = {
      ...c,
      style: g.style ?? c.style,
      textColor: g.textColor ?? c.textColor,
      backgroundColor: g.backgroundColor ?? c.backgroundColor,
    };
    return { ...current, styles: mergedStyles };
  }
  return current;
});

const hasFields = computed(() => {
  return (
    field.value.fields.size > 0 &&
    Array.from(field.value.fields.values()).some(
      (child: Field) => !child.hidden && !child.alias.includes("total"),
    )
  );
});

const styleComponent = computed(() => {
  const styleKey = resolvedStyle.value;
  const map: Record<string, () => Promise<any>> = {
    default: () =>
      import(
        "@/widget/features/calculator-fields/components/Section/styles/default.vue"
      ),
    solid: () =>
      import(
        "@/widget/features/calculator-fields/components/Section/styles/solid.vue"
      ),
    number: () =>
      import(
        "@/widget/features/calculator-fields/components/Section/styles/number.vue"
      ),
    minimal: () =>
      import(
        "@/widget/features/calculator-fields/components/Section/styles/minimal.vue"
      ),
  };
  const loader = map[styleKey] || map.default;
  return defineAsyncComponent(loader);
});
</script>

<style lang="scss">
.ccb-section__fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20%, 1fr));
  gap: 20px;

  .field-width-25 {
    grid-column: span 1;
    @media (max-width: 1024px) {
      grid-column: span 4;
    }

    @media (max-width: 540px) {
      grid-column: span 4;
    }
  }
  .field-width-50 {
    grid-column: span 2;

    @media (max-width: 540px) {
      grid-column: span 4;
    }
  }
  .field-width-75 {
    grid-column: span 3;

    @media (max-width: 540px) {
      grid-column: span 4;
    }
  }
  .field-width-100 {
    grid-column: span 4;
  }
}
</style>
