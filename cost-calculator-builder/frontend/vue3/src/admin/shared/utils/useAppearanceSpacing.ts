import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";

interface SpacingData {
  field_side_indents?: { value?: number | string };
  field_spacing?: { value?: number | string };
  container_margin?: { value?: number[] };
  container_padding?: { value?: number[] };
  description_position?: { value?: string };
}

function px(value: unknown, fallback: string): string {
  if (value === undefined || value === null) return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : `${num}px`;
}

function arrayPx(
  arr: unknown[] | undefined,
  index: number,
  fallback: string,
): string {
  if (!Array.isArray(arr) || arr[index] === undefined) return fallback;
  return px(arr[index], fallback);
}

interface ElementsSizesData {
  field_and_buttons_height?: { value?: number | string };
}

export function useAppearanceSpacing() {
  const appearanceStore = useAppearanceStore();

  const spacingData = computed<SpacingData | undefined>(() => {
    const desktop = appearanceStore.getActivePreset?.desktop as
      | Record<string, unknown>
      | undefined;
    const section = desktop?.spacing_and_positions as
      | { data?: SpacingData }
      | undefined;
    return section?.data;
  });

  const elementsSizesData = computed<ElementsSizesData | undefined>(() => {
    const desktop = appearanceStore.getActivePreset?.desktop as
      | Record<string, unknown>
      | undefined;
    const section = desktop?.elements_sizes as
      | { data?: ElementsSizesData }
      | undefined;
    return section?.data;
  });

  const fieldButtonHeight = computed(() =>
    px(elementsSizesData.value?.field_and_buttons_height?.value, "40px"),
  );

  const fieldSideIndent = computed(() =>
    px(spacingData.value?.field_side_indents?.value, "12px"),
  );

  const fieldSpacing = computed(() =>
    px(spacingData.value?.field_spacing?.value, "20px"),
  );

  const summarySpacing = computed(() => {
    const raw = Number(spacingData.value?.field_spacing?.value ?? 20);
    return `${raw / 2}px`;
  });

  const summaryGroupSpacing = computed(() => {
    const raw = Number(spacingData.value?.field_spacing?.value ?? 20);
    return `${raw / 4}px`;
  });

  const grandTotalSpacing = computed(() => {
    const raw = Number(spacingData.value?.field_spacing?.value ?? 20);
    return `${raw / 2}px`;
  });

  // Array index mapping matches Spacing.vue: top=0, right=1, bottom=2, left=3
  const containerMarginTop = computed(() =>
    arrayPx(spacingData.value?.container_margin?.value, 0, "0px"),
  );
  const containerMarginRight = computed(() =>
    arrayPx(spacingData.value?.container_margin?.value, 1, "0px"),
  );
  const containerMarginBottom = computed(() =>
    arrayPx(spacingData.value?.container_margin?.value, 2, "0px"),
  );
  const containerMarginLeft = computed(() =>
    arrayPx(spacingData.value?.container_margin?.value, 3, "0px"),
  );

  const containerPaddingTop = computed(() =>
    arrayPx(spacingData.value?.container_padding?.value, 0, "20px"),
  );
  const containerPaddingRight = computed(() =>
    arrayPx(spacingData.value?.container_padding?.value, 1, "20px"),
  );
  const containerPaddingBottom = computed(() =>
    arrayPx(spacingData.value?.container_padding?.value, 2, "20px"),
  );
  const containerPaddingLeft = computed(() =>
    arrayPx(spacingData.value?.container_padding?.value, 3, "20px"),
  );

  return {
    fieldSideIndent,
    fieldSpacing,
    fieldButtonHeight,
    summarySpacing,
    summaryGroupSpacing,
    grandTotalSpacing,
    containerMarginTop,
    containerMarginBottom,
    containerMarginLeft,
    containerMarginRight,
    containerPaddingTop,
    containerPaddingBottom,
    containerPaddingLeft,
    containerPaddingRight,
  };
}
