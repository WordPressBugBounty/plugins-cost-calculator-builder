import { computed, ref, watch } from "vue";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import type {
  IOrderFormBuilderField,
  IOrderFormFieldAttributeValue,
  IOrderFormFieldOption,
} from "@/admin/shared/types/order-form.type";

const draftSelectedField = ref<IOrderFormBuilderField | null>(null);
const draftSelectedFieldKey = ref<number | string | null>(null);
const snapshotSelectedField = ref<IOrderFormBuilderField | null>(null);
let suppressAutosave = false;

const cloneField = (
  field: IOrderFormBuilderField | null,
): IOrderFormBuilderField | null => {
  if (!field) return null;
  return JSON.parse(JSON.stringify(field)) as IOrderFormBuilderField;
};

const parseStoredOptionIndex = (value: string | number): number | null => {
  const match = String(value).match(/_(\d+)$/);
  if (!match) return null;

  const parsedIndex = Number(match[1]);
  return Number.isInteger(parsedIndex) ? parsedIndex : null;
};

export const useOrderFormFieldBindings = () => {
  const orderFormStore = useOrderFormStore();

  const selectedField = computed<IOrderFormBuilderField | null>(
    () => orderFormStore.getSelectedField,
  );

  watch(
    selectedField,
    (field) => {
      if (!field) {
        draftSelectedField.value = null;
        draftSelectedFieldKey.value = null;
        snapshotSelectedField.value = null;
        return;
      }

      const nextKey = field.id ?? field.tempId ?? null;
      if (!nextKey) return;

      const keyChanged = draftSelectedFieldKey.value !== nextKey;
      const storeDataChanged =
        !keyChanged &&
        JSON.stringify(field) !== JSON.stringify(snapshotSelectedField.value);

      if (keyChanged || storeDataChanged) {
        suppressAutosave = true;
        draftSelectedField.value = cloneField(field);
        draftSelectedFieldKey.value = nextKey;
        snapshotSelectedField.value = cloneField(field);
      }
    },
    { immediate: true, deep: true },
  );

  watch(
    () => selectedField.value?.field_width,
    (newWidth) => {
      if (draftSelectedField.value && newWidth !== undefined) {
        draftSelectedField.value.field_width = newWidth;
      }
    },
  );

  watch(
    draftSelectedField,
    (draft) => {
      if (suppressAutosave) {
        suppressAutosave = false;
        return;
      }
      if (!draft || !selectedField.value) return;
      const key = draft.id ?? draft.tempId ?? null;
      if (key !== draftSelectedFieldKey.value) return;

      orderFormStore.updateSelectedFieldAttributes(draft.attributes);
      orderFormStore.updateSelectedFieldWidth(draft.field_width);
      snapshotSelectedField.value = cloneField(draft);
    },
    { deep: true },
  );

  const hasAttribute = (name: string): boolean => {
    if (!draftSelectedField.value) return false;
    return Object.prototype.hasOwnProperty.call(
      draftSelectedField.value.attributes,
      name,
    );
  };

  const stringAttribute = (name: string): string => {
    if (!draftSelectedField.value) return "";
    const value = draftSelectedField.value.attributes[name];
    return typeof value === "string" ? value : String(value || "");
  };

  const numberAttribute = (name: string): number => {
    if (!draftSelectedField.value) return 0;
    const value = draftSelectedField.value.attributes[name];
    return Number(value || 0);
  };

  const booleanAttribute = (name: string): boolean => {
    if (!draftSelectedField.value) return false;
    const value = draftSelectedField.value.attributes[name];
    return value === true || value === "1";
  };

  const optionsList = computed<IOrderFormFieldOption[]>(() => {
    const selected = draftSelectedField.value;
    if (!selected) return [];
    const options = selected.attributes.options;
    if (!Array.isArray(options)) return [];
    return options as IOrderFormFieldOption[];
  });

  const optionLabel = (
    option: IOrderFormFieldOption,
    index: number,
  ): string => {
    return String(
      option.optionText || option.optionValue || `Option ${index + 1}`,
    );
  };

  const optionStoredValue = (
    option: IOrderFormFieldOption,
    index: number,
  ): string => {
    return `${optionLabel(option, index)}_${index}`;
  };

  const optionItems = computed(() => {
    return optionsList.value.map((option, index) => ({
      value: optionStoredValue(option, index),
      label: optionLabel(option, index),
    }));
  });

  const arrayAttribute = (name: string): Array<string | number | boolean> => {
    if (!draftSelectedField.value) return [];

    const value = draftSelectedField.value.attributes[name];
    if (Array.isArray(value)) {
      return value.filter(
        (item): item is string | number | boolean =>
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean",
      );
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value === "" ? [] : [value];
    }

    return [];
  };

  const resolveOptionIndex = (
    value: string | number | boolean,
    options: IOrderFormFieldOption[],
  ): number | null => {
    const normalizedValue = String(value || "").trim();
    if (!normalizedValue) return null;

    const exactMatchIndex = options.findIndex((option, index) => {
      return optionStoredValue(option, index) === normalizedValue;
    });

    if (exactMatchIndex >= 0) return exactMatchIndex;

    const parsedIndex = parseStoredOptionIndex(normalizedValue);
    const rawLabel = normalizedValue.replace(/_\d+$/, "");
    const labelMatchIndex = options.findIndex((option, index) => {
      return optionLabel(option, index) === rawLabel;
    });

    if (labelMatchIndex >= 0) return labelMatchIndex;
    if (parsedIndex !== null && options[parsedIndex]) return parsedIndex;

    return null;
  };

  const normalizeDefaultValues = (
    value: Array<string | number | boolean>,
    options: IOrderFormFieldOption[] = optionsList.value,
  ): string[] => {
    const normalized = value
      .map((item) => {
        const optionIndex = resolveOptionIndex(item, options);
        if (optionIndex === null) return null;
        return optionStoredValue(options[optionIndex], optionIndex);
      })
      .filter((item): item is string => Boolean(item));

    return Array.from(new Set(normalized));
  };

  const defaultValueList = computed<string[]>(() => {
    return normalizeDefaultValues(arrayAttribute("default_value"));
  });

  const defaultValue = computed<string>(() => {
    return defaultValueList.value[0] || "";
  });

  const fieldWidth = computed<number>(() => {
    if (!draftSelectedField.value) return 12;
    return Number(draftSelectedField.value.field_width) || 12;
  });

  const fieldBoxStyle = computed<string>(() => {
    if (!draftSelectedField.value) return "Vertical";
    return String(draftSelectedField.value.attributes.display || "Vertical");
  });

  const updateDefaultValue = (
    value: string | number | Array<string | number>,
  ) => {
    if (!draftSelectedField.value) return;

    const values = Array.isArray(value) ? value : [value];

    draftSelectedField.value.attributes = {
      ...draftSelectedField.value.attributes,
      default_value: normalizeDefaultValues(values),
    };
  };

  const updateAttribute = (
    key: string,
    value: IOrderFormFieldAttributeValue,
  ) => {
    if (!draftSelectedField.value) return;
    draftSelectedField.value.attributes = {
      ...draftSelectedField.value.attributes,
      [key]: value,
    };
  };

  const updateFieldWidth = (value: string | number) => {
    if (!draftSelectedField.value) return;
    const width = Number(value) || 12;
    draftSelectedField.value.field_width = width;
    orderFormStore.updateSelectedFieldWidth(width);
  };

  const updateOption = (index: number, optionText: string) => {
    if (!draftSelectedField.value) return;
    const options = [...optionsList.value];
    options[index] = {
      ...options[index],
      optionText,
    };
    draftSelectedField.value.attributes = {
      ...draftSelectedField.value.attributes,
      default_value: normalizeDefaultValues(
        arrayAttribute("default_value"),
        options,
      ),
      options,
    };
  };

  const addOption = () => {
    if (!draftSelectedField.value) return;
    const options = [...optionsList.value, { optionText: "" }];
    draftSelectedField.value.attributes = {
      ...draftSelectedField.value.attributes,
      default_value: normalizeDefaultValues(
        arrayAttribute("default_value"),
        options,
      ),
      options,
    };
  };

  const removeOption = (index: number) => {
    if (!draftSelectedField.value) return;
    const options = [...optionsList.value];
    options.splice(index, 1);
    draftSelectedField.value.attributes = {
      ...draftSelectedField.value.attributes,
      default_value: normalizeDefaultValues(
        arrayAttribute("default_value"),
        options,
      ),
      options,
    };
  };

  const reorderOptions = (fromIndex: number, toIndex: number) => {
    if (!draftSelectedField.value) return;
    const options = [...optionsList.value];
    const [moved] = options.splice(fromIndex, 1);
    if (moved) {
      options.splice(toIndex, 0, moved);
      draftSelectedField.value.attributes = {
        ...draftSelectedField.value.attributes,
        default_value: normalizeDefaultValues(
          arrayAttribute("default_value"),
          options,
        ),
        options,
      };
    }
  };

  const saveSelectedFieldChanges = () => {
    if (!selectedField.value || !draftSelectedField.value) return;
    orderFormStore.updateSelectedFieldAttributes(
      draftSelectedField.value.attributes,
    );
    orderFormStore.updateSelectedFieldWidth(
      draftSelectedField.value.field_width,
    );
  };

  const cancelSelectedFieldChanges = () => {
    if (snapshotSelectedField.value && selectedField.value) {
      orderFormStore.updateSelectedFieldAttributes(
        snapshotSelectedField.value.attributes,
      );
      orderFormStore.updateSelectedFieldWidth(
        snapshotSelectedField.value.field_width,
      );
    }
    draftSelectedField.value = cloneField(snapshotSelectedField.value);
  };

  const duplicateSelectedField = () => {
    if (!selectedField.value) return;
    const selectedId = selectedField.value.id || selectedField.value.tempId;
    if (!selectedId) return;
    orderFormStore.duplicateField(selectedId);
  };

  const deleteSelectedField = () => {
    if (!selectedField.value) return;
    const selectedId = selectedField.value.id || selectedField.value.tempId;
    if (!selectedId) return;
    orderFormStore.deleteField(selectedId);
  };

  const closeSelectedField = () => {
    draftSelectedField.value = null;
    draftSelectedFieldKey.value = null;
    snapshotSelectedField.value = null;
    orderFormStore.setSelectedField(null);
  };

  return {
    selectedField,
    hasAttribute,
    stringAttribute,
    numberAttribute,
    booleanAttribute,
    arrayAttribute,
    fieldWidth,
    fieldBoxStyle,
    optionsList,
    optionItems,
    defaultValue,
    defaultValueList,
    updateDefaultValue,
    updateAttribute,
    updateFieldWidth,
    updateOption,
    addOption,
    removeOption,
    reorderOptions,
    saveSelectedFieldChanges,
    cancelSelectedFieldChanges,
    duplicateSelectedField,
    deleteSelectedField,
    closeSelectedField,
  };
};
