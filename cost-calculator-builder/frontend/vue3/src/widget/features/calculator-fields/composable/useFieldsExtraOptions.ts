import { computed, type Ref, type ComputedRef } from "vue";
import formatNumber from "@/widget/shared/utils/format-number";
import { IBaseField } from "@/widget/shared/types/fields/base.type";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore";

interface IFieldsExtraOptions {
  formatMinMax: ComputedRef<(value: number) => string>;
}

export const useFieldsExtraOptions = (
  field: Ref<IBaseField>,
): IFieldsExtraOptions => {
  const formatMinMax = computed(() => {
    let decimalSep = "";
    let thousandSep = "";
    let numAfterInteger = 0;

    const settingsStore = useSettingsStore();

    if (field.value.fieldCurrency) {
      decimalSep = field.value.fieldCurrencySettings?.decimalSeparator || ".";
      thousandSep =
        field.value.fieldCurrencySettings?.thousandsSeparator || ",";
      numAfterInteger = field.value.fieldCurrencySettings?.numAfterInteger || 0;
    }

    if (field.value.useCurrency) {
      decimalSep = settingsStore.getCurrencySettings?.decimalSeparator || ".";
      thousandSep =
        settingsStore.getCurrencySettings?.thousandsSeparator || ",";
      numAfterInteger = settingsStore.getCurrencySettings?.numAfterInteger || 0;
    }

    return (value: number): string => {
      if (value < 1000) return value.toString();
      return formatNumber(value, thousandSep, numAfterInteger, decimalSep);
    };
  });

  return {
    formatMinMax,
  };
};
