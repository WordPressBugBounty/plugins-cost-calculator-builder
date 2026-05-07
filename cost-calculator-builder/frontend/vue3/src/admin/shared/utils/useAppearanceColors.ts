import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";
import type {
  AppearanceColorsData,
  AppearanceContainerColorField,
} from "@/admin/shared/types/appearance.type";

interface AppearanceValueField<T> {
  value?: T;
}

interface AppearanceFieldsBorderData {
  border_type?: AppearanceValueField<string>;
  border_width?: AppearanceValueField<number | string>;
  border_radius?: AppearanceValueField<number | string>;
}

type Side = "top" | "right" | "bottom" | "left";

interface AppearanceIndentField {
  value?: unknown;
  data?: Partial<Record<Side, AppearanceValueField<number | string>>>;
}

interface AppearanceSpacingFieldsData {
  container_padding?: AppearanceIndentField;
  container_margin?: AppearanceIndentField;
}

export function useAppearanceColors() {
  const appearanceStore = useAppearanceStore();

  const appearanceColorsData = computed<AppearanceColorsData | undefined>(
    () => {
      const desktop = appearanceStore.getActivePreset?.desktop as
        | Record<string, unknown>
        | undefined;
      const colors = desktop?.colors as
        | { data?: AppearanceColorsData }
        | undefined;
      return colors?.data;
    },
  );

  const containerColor = computed(() => {
    const container = appearanceColorsData.value?.container as
      | AppearanceContainerColorField
      | undefined;
    return (
      container?.data?.color?.value ??
      container?.data?.value?.color ??
      container?.value?.color ??
      ""
    );
  });

  const accentColor = computed(
    () =>
      appearanceStore.getActivePreset?.desktop?.colors?.data?.accent_color
        ?.value || {},
  );

  const accentColorAlpha = computed(() => `${accentColor.value}1A`);

  const errorColor = computed(
    () =>
      appearanceStore.getActivePreset?.desktop?.colors?.data?.error_color
        ?.value || {},
  );

  const textColor = computed(
    () =>
      appearanceStore.getActivePreset?.desktop?.colors?.data?.primary_color
        ?.value || {},
  );

  const formFieldsColor = computed(
    () =>
      appearanceStore.getActivePreset?.desktop?.colors?.data?.secondary_color
        ?.value || {},
  );

  const borderColor = computed(
    () =>
      `${appearanceStore.getActivePreset?.desktop?.colors?.data?.primary_color?.value || "#000000"}1A`,
  );

  const containerShadowData = computed(
    () =>
      (appearanceStore.getActivePreset?.desktop as any)?.shadows?.data
        ?.container_shadow?.data,
  );

  const containerDarkColor = computed(
    () =>
      `${appearanceStore.getActivePreset?.desktop?.colors?.data?.primary_color?.value || "#000000"}1D`,
  );

  const bordersData = computed(() => {
    const desktop = appearanceStore.getActivePreset?.desktop as
      | Record<string, unknown>
      | undefined;
    return (desktop?.borders as { data?: Record<string, any> } | undefined)
      ?.data;
  });

  const fieldsBorderData = computed<AppearanceFieldsBorderData | undefined>(
    () => bordersData.value?.fields_border?.data,
  );

  const borderRadius = computed(
    () => `${fieldsBorderData.value?.border_radius?.value ?? 12}px`,
  );

  const borderStyle = computed(
    () => `${fieldsBorderData.value?.border_type?.value ?? "solid"}`,
  );

  const borderWidth = computed(
    () => `${fieldsBorderData.value?.border_width?.value ?? 1}px`,
  );

  const containerBorderData = computed<AppearanceFieldsBorderData | undefined>(
    () => bordersData.value?.container_border?.data,
  );

  const containerBorderRadius = computed(
    () => `${containerBorderData.value?.border_radius?.value ?? 8}px`,
  );

  const containerBorderStyle = computed(
    () => `${containerBorderData.value?.border_type?.value ?? "solid"}`,
  );

  const containerBorderWidth = computed(
    () => `${containerBorderData.value?.border_width?.value ?? 1}px`,
  );

  const containerBorder = computed(
    () =>
      `${containerBorderWidth.value} ${containerBorderStyle.value} ${borderColor.value}`,
  );

  const shadowColor = computed(
    () => containerShadowData.value?.color?.value ?? "#cccccc",
  );
  const shadowBlur = computed(
    () => containerShadowData.value?.blur?.value ?? 0,
  );
  const shadowX = computed(() => containerShadowData.value?.x?.value ?? 0);
  const shadowY = computed(() => containerShadowData.value?.y?.value ?? 0);

  const containerShadow = computed(
    () =>
      `${shadowX.value}px ${shadowY.value}px ${shadowBlur.value}px ${shadowColor.value}`,
  );

  const textDefaultColor = computed(() => `${textColor.value}80`);
  const circleDoneColor = computed(() => `${accentColor.value}30`);
  const descriptionColor = computed(() => `${textColor.value}80`);

  const spacingFieldsData = computed<AppearanceSpacingFieldsData | undefined>(
    () => {
      const desktop = appearanceStore.getActivePreset?.desktop as
        | Record<string, unknown>
        | undefined;
      const section = desktop?.spacing_and_positions as
        | { data?: AppearanceSpacingFieldsData }
        | undefined;
      return section?.data;
    },
  );

  const SIDE_INDEX: Record<Side, number> = {
    top: 0,
    right: 1,
    bottom: 2,
    left: 3,
  };

  const toPx = (value: unknown, fallback: string): string => {
    if (value === undefined || value === null) return fallback;
    const num = Number(String(value).replace(/px$/i, "").trim());
    return Number.isNaN(num) ? fallback : `${num}px`;
  };

  const containerPaddingFor = (side: Side, fallback = "10px") =>
    computed(() => {
      const padding = spacingFieldsData.value?.container_padding;
      const nested = padding?.data?.[side]?.value;
      if (nested !== undefined && nested !== null)
        return toPx(nested, fallback);
      const arr = padding?.value;
      if (Array.isArray(arr)) return toPx(arr[SIDE_INDEX[side]], fallback);
      return fallback;
    });

  const containerPaddingTop = containerPaddingFor("top");
  const containerPaddingRight = containerPaddingFor("right");
  const containerPaddingBottom = containerPaddingFor("bottom");
  const containerPaddingLeft = containerPaddingFor("left");

  return {
    containerColor,
    accentColor,
    textColor,
    formFieldsColor,
    borderColor,
    shadowColor,
    shadowBlur,
    shadowX,
    shadowY,
    containerShadow,
    textDefaultColor,
    circleDoneColor,
    descriptionColor,
    containerDarkColor,
    borderRadius,
    borderStyle,
    borderWidth,
    containerBorderRadius,
    containerBorderStyle,
    containerBorderWidth,
    containerBorder,
    errorColor,
    accentColorAlpha,
    containerPaddingTop,
    containerPaddingRight,
    containerPaddingBottom,
    containerPaddingLeft,
  };
}
