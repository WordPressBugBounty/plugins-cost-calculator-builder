import { computed, toRefs } from "vue";
import { IOptions, ISingleOptionsField } from "@/widget/shared/types/fields";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore.ts";
import { useSingleField } from "@/widget/actions/fields/composable/useSingleField.ts";
import { useConditionsStore } from "@/widget/app/providers/stores/conditionsStore.ts";
import { useFields } from "@/widget/actions/fields/composable/useFields.ts";
import { usePageConditions } from "@/widget/actions/conditions/composable/usePageConditions.ts";

const fieldsInstance = useFields();
const pageConditions = usePageConditions();

export function useSingleOptionFieldShared(props: {
  field: ISingleOptionsField;
}) {
  const { field } = toRefs(props);
  const conditionsStore = useConditionsStore();

  const fieldStore = useFieldsStore();
  const singleFieldInstance = useSingleField();

  const selectedOption = computed(() => field.value.selectedOption);
  const fieldValue = computed(() => selectedOption.value);
  const isRequired = computed(() => fieldStore.checkFieldRequired(field.value));
  const getKey = computed(() => selectedOption.value?.optionValue || 99999);

  const selectValue = (option?: IOptions) => {
    if (option?.optionValue !== selectedOption.value?.optionValue) {
      let value: number = 0;

      if (
        option?.optionValue &&
        field.value.summaryView !== "show_label_not_calculable"
      ) {
        const optionValue: string = option?.optionValue;
        value = +optionValue.split("_")[0] || 0;
      }

      field.value.selectedOption = option;
      field.value.value = value;

      field.value.displayValue =
        singleFieldInstance.getMultipleOptionsFieldDisplayView(
          field.value,
        ) as string;

      fieldStore.updateField(field.value.alias, field.value);
      conditionsStore.applyConditionForField(field.value.alias);

      if (
        fieldsInstance.getPageBreakEnabled() &&
        fieldsInstance.getActivePage().action === "not_skip"
      ) {
        pageConditions.checkPageFieldsConditions();
      }
    }
  };

  return {
    field,
    selectValue,
    fieldValue,
    isRequired,
    getKey,
  };
}
