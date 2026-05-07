import { computed } from "vue";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";

export const useAppearanceTypography = () => {
  const appearanceStore = useAppearanceStore();

  const typographyData = computed(() => {
    return appearanceStore.getActivePreset?.desktop?.typography as Record<
      string,
      any
    >;
  });

  const headerFontSize = computed(() => {
    return (typographyData.value?.data?.header_font_size?.value +
      "px") as string;
  });

  const headerFontWeight = computed(() => {
    return typographyData.value?.data?.header_font_weight?.value as number;
  });

  const labelFontSize = computed(() => {
    return (typographyData.value?.data?.label_font_size?.value +
      "px") as string;
  });

  const labelFontWeight = computed(() => {
    return typographyData.value?.data?.label_font_weight?.value as number;
  });

  const descriptionFontSize = computed(() => {
    return (typographyData.value?.data?.description_font_size?.value +
      "px") as string;
  });

  const descriptionFontWeight = computed(() => {
    return typographyData.value?.data?.description_font_weight?.value as number;
  });

  const totalFieldFontSize = computed(() => {
    return (typographyData.value?.data?.total_font_size?.value +
      "px") as string;
  });

  const totalFieldFontWeight = computed(() => {
    return typographyData.value?.data?.total_font_weight?.value as number;
  });

  const fieldsBtnFontSize = computed(() => {
    return (typographyData.value?.data?.fields_btn_font_size?.value +
      "px") as string;
  });

  const fieldsBtnFontWeight = computed(() => {
    return typographyData.value?.data?.fields_btn_font_weight?.value as number;
  });

  const summaryHeaderFontSize = computed(() => {
    return (typographyData.value?.data?.summary_header_size?.value +
      "px") as string;
  });

  const summaryHeaderFontWeight = computed(() => {
    return typographyData.value?.data?.summary_header_font_weight
      ?.value as number;
  });

  const summaryFieldFontSize = computed(() => {
    return (typographyData.value?.data?.total_field_font_size?.value +
      "px") as string;
  });

  const summaryFieldFontWeight = computed(() => {
    return typographyData.value?.data?.total_field_font_weight?.value as number;
  });

  const summaryOptionsFontSize = computed(() => {
    const totalFieldFontSize =
      typographyData.value?.data?.total_field_font_size?.value;
    if (!totalFieldFontSize) return "0px";
    return (totalFieldFontSize - 2 + "px") as string;
  });

  const summaryTextTransform = computed(() => {
    return typographyData.value?.data?.total_text_transform?.value as string;
  });

  return {
    headerFontSize,
    headerFontWeight,
    labelFontSize,
    labelFontWeight,
    descriptionFontSize,
    descriptionFontWeight,
    totalFieldFontSize,
    totalFieldFontWeight,
    fieldsBtnFontSize,
    fieldsBtnFontWeight,
    summaryHeaderFontSize,
    summaryHeaderFontWeight,
    summaryFieldFontSize,
    summaryFieldFontWeight,
    summaryOptionsFontSize,
    summaryTextTransform,
  };
};

export default useAppearanceTypography;
