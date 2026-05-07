<template>
  <component
    :is="styleComponent"
    :field="effectiveField"
    :effective-style="resolvedStyle"
    :has-fields="hasFields"
    :collapsed="collapsed"
    :toggle-collapse="toggleCollapse"
  >
    <template #headerPrepend>
      <slot name="headerPrepend" />
    </template>
    <template #headerAppend>
      <slot name="headerAppend" />
    </template>
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, toRefs, defineAsyncComponent, ref } from "vue";
import type { ISection, IField } from "@/admin/shared/types/fields.type";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

type SectionStyles = NonNullable<ISection["styles"]> & {
  textColor?: string;
  backgroundColor?: string;
};

type Props = {
  field: ISection;
};

const props = defineProps<Props>();
const { field } = toRefs(props);
const builderStore = useBuilderStore();

const collapsed = ref<boolean>(Boolean(field.value.defaultCollapsed));

const toggleCollapse = () => {
  if (!field.value.collapsible) return;
  collapsed.value = !collapsed.value;
};

const isGlobalSection = (s: ISection): boolean => {
  return (
    s.type === "section" && Boolean((s.styles as SectionStyles)?.applyToAll)
  );
};

const getFirstGlobalSection = (): ISection | undefined => {
  for (const page of builderStore.builderFields) {
    const found = page.groupElements.find(isGlobalSection);
    if (found) return found;
  }
  return undefined;
};

const resolvedStyle = computed<string>(() => {
  const firstGlobal = getFirstGlobalSection();
  const globalStyle = (firstGlobal?.styles as SectionStyles | undefined)?.style;
  if (globalStyle) return globalStyle;
  return (field.value?.styles as SectionStyles | undefined)?.style || "default";
});

const effectiveField = computed<ISection>(() => {
  const current = field.value;
  const firstGlobal = getFirstGlobalSection();
  if (firstGlobal?.styles) {
    const g = firstGlobal.styles as SectionStyles;
    const c = (current.styles || {}) as SectionStyles;
    const mergedStyles: SectionStyles = {
      ...c,
      style: g.style ?? c.style,
      textColor: g.textColor ?? c.textColor,
      backgroundColor: g.backgroundColor ?? c.backgroundColor,
    };
    return { ...current, styles: mergedStyles as ISection["styles"] };
  }
  return current;
});

const hasFields = computed<boolean>(() => {
  const fields = field.value.fields || [];
  return fields.some(
    (child: IField) => !child.hidden && !child.alias?.includes("total"),
  );
});

const sectionTextColor = computed<string>(() => {
  return (
    (field.value.styles as SectionStyles | undefined)?.textColor || "#001931"
  );
});

const styleComponent = computed(() => {
  const styleKey = resolvedStyle.value;
  const map: Record<string, () => Promise<unknown>> = {
    default: () =>
      import(
        "@/admin/features/builder/calculator/CalculatorFields/Section/styles/default.vue"
      ),
    solid: () =>
      import(
        "@/admin/features/builder/calculator/CalculatorFields/Section/styles/solid.vue"
      ),
    number: () =>
      import(
        "@/admin/features/builder/calculator/CalculatorFields/Section/styles/number.vue"
      ),
    minimal: () =>
      import(
        "@/admin/features/builder/calculator/CalculatorFields/Section/styles/minimal.vue"
      ),
  };
  const loader = map[styleKey] || map.default;
  return defineAsyncComponent(loader as () => Promise<never>);
});
</script>

<style lang="scss">
.ccb-section__handle {
  color: v-bind(sectionTextColor);
}

.ccb-section__fields {
  display: flex;
  flex-wrap: wrap;
  row-gap: var(--ccb-field-spacing);

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
