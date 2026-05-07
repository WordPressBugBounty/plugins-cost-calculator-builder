import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  type ComponentPublicInstance,
} from "vue";
import { toast } from "vue3-toastify";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import type { IOrderFormBuilderField } from "@/admin/shared/types/order-form.type";

export const useOrderFormContent = () => {
  const orderFormStore = useOrderFormStore();
  const calculatorStore = useCalculatorStore();
  const translationsStore = useBuilderTranslationsStore();
  const translations = computed(() => translationsStore.getTranslations);

  const fields = computed(() => orderFormStore.getFields);
  const activeForm = computed(
    () =>
      orderFormStore.getForms.find(
        (form) => Number(form.id) === Number(orderFormStore.getActiveFormId),
      ) || null,
  );
  const isDirty = computed(() => orderFormStore.getDirty);
  const isEditingFormName = ref(false);
  const editableFormName = ref("");
  const formNameInputRef = ref<HTMLInputElement | null>(null);
  const setFormNameInputRef = (
    element: Element | ComponentPublicInstance | null,
  ) => {
    formNameInputRef.value = element as HTMLInputElement | null;
  };

  const startEditFormName = async () => {
    if (!activeForm.value) return;
    editableFormName.value = activeForm.value.name || "";
    isEditingFormName.value = true;
    await nextTick();
    formNameInputRef.value?.focus();
    formNameInputRef.value?.select();
  };

  const cancelEditFormName = () => {
    isEditingFormName.value = false;
    editableFormName.value = activeForm.value?.name || "";
  };

  const saveFormName = () => {
    if (!activeForm.value) return;
    const newName = editableFormName.value.trim();
    if (!newName) {
      toast(translations.value.formNameCannotBeEmpty, { type: "warning" });
      return;
    }

    const updated = orderFormStore.renameFormName(
      Number(activeForm.value.id),
      newName,
    );
    if (!updated) {
      toast(translations.value.unableToUpdateFormName, { type: "error" });
      return;
    }

    isEditingFormName.value = false;
    toast(translations.value.titleUpdatedClickApplyToSaveChanges, {
      type: "info",
    });
  };

  const onFieldsReorder = (value: IOrderFormBuilderField[]) => {
    orderFormStore.setFields(value);
  };

  const selectField = (field: IOrderFormBuilderField) => {
    orderFormStore.setSelectedField(field.id || field.tempId || null);
  };

  const isSelected = (field: IOrderFormBuilderField): boolean => {
    const id = field.id || field.tempId;
    return (
      id !== undefined &&
      id !== null &&
      id === orderFormStore.getSelectedFieldId
    );
  };

  const duplicateField = (field: IOrderFormBuilderField) => {
    const id = field.id || field.tempId;
    if (!id) return;
    orderFormStore.duplicateField(id);
  };

  const deleteField = (field: IOrderFormBuilderField) => {
    const id = field.id || field.tempId;
    if (!id) return;
    orderFormStore.deleteField(id);
  };

  const dragOverIndex = ref<number | null>(null);

  const isSidebarDrag = (event: DragEvent): boolean => {
    if (!event.dataTransfer) return false;
    return Array.from(event.dataTransfer.types).includes(
      "application/x-ccb-order-field-type",
    );
  };

  const onFieldDragEnter = (index: number, event: DragEvent) => {
    if (!isSidebarDrag(event)) return;
    dragOverIndex.value = index;
  };

  const onBodyDragEnter = (event: DragEvent) => {
    if (!isSidebarDrag(event)) return;
    if (dragOverIndex.value === null) {
      dragOverIndex.value = -1;
    }
  };

  const onBodyDragLeave = (event: DragEvent) => {
    const body = event.currentTarget as HTMLElement;
    if (!body.contains(event.relatedTarget as Node)) {
      dragOverIndex.value = null;
    }
  };

  const onRawFieldDrop = (event: DragEvent) => {
    event.preventDefault();
    dragOverIndex.value = null;
    const fieldType =
      event.dataTransfer?.getData("application/x-ccb-order-field-type") ||
      event.dataTransfer?.getData("text/plain");

    if (!fieldType) return;
    const rawField = orderFormStore.getRawFields.find(
      (field) => field.type === fieldType,
    );
    if (!rawField) return;
    orderFormStore.addField(rawField);
  };

  const onRawFieldDropAfter = (index: number, event: DragEvent) => {
    event.preventDefault();
    dragOverIndex.value = null;
    const fieldType =
      event.dataTransfer?.getData("application/x-ccb-order-field-type") ||
      event.dataTransfer?.getData("text/plain");
    if (!fieldType) return;

    const rawField = orderFormStore.getRawFields.find(
      (field) => field.type === fieldType,
    );
    if (!rawField) return;

    orderFormStore.addFieldAt(rawField, index + 1);
  };

  const ALLOWED_WIDTHS = [4, 6, 8, 10, 12];

  const snapToAllowedWidth = (value: number): number => {
    return ALLOWED_WIDTHS.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
    );
  };

  const fieldListRef = ref<HTMLElement | null>(null);
  const resizingFieldId = ref<string | number | null>(null);
  const resizeStartX = ref(0);
  const resizeStartSpan = ref(12);

  const onResizeStart = (event: MouseEvent, field: IOrderFormBuilderField) => {
    event.preventDefault();
    event.stopPropagation();

    const id = field.id != null ? field.id : (field.tempId ?? null);
    if (!id) return;

    resizingFieldId.value = id;
    resizeStartX.value = event.clientX;
    resizeStartSpan.value = snapToAllowedWidth(Number(field.field_width) || 12);

    orderFormStore.setSelectedField(id);

    document.addEventListener("mousemove", onResizeMove);
    document.addEventListener("mouseup", onResizeEnd);
  };

  const onResizeMove = (event: MouseEvent) => {
    if (!resizingFieldId.value || !fieldListRef.value) return;

    // body has 24px padding each side, grid column gap is 16px
    const gridWidth = fieldListRef.value.offsetWidth - 48;
    const colUnit = (gridWidth - 11 * 16) / 12 + 16;
    const deltaX = event.clientX - resizeStartX.value;
    const rawSpan = resizeStartSpan.value + deltaX / colUnit;
    const newWidth = snapToAllowedWidth(Math.min(12, Math.max(4, rawSpan)));

    orderFormStore.updateFieldWidthById(resizingFieldId.value, newWidth);
  };

  const onResizeEnd = () => {
    resizingFieldId.value = null;
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeEnd);
  };

  onBeforeUnmount(() => {
    document.removeEventListener("mousemove", onResizeMove);
    document.removeEventListener("mouseup", onResizeEnd);
  });

  const applyFormChanges = async () => {
    if (!isDirty.value) return;

    const isDraftApply = orderFormStore.getIsDraftActiveForm;
    const success = await orderFormStore.updateForm();
    if (!success) {
      toast(translations.value.unableToApplyChanges, { type: "error" });
      return;
    }

    if (isDraftApply) {
      const calcId = calculatorStore.getId;
      const createdFormId = orderFormStore.getActiveFormId;
      if (calcId && createdFormId) {
        await orderFormStore.applyFormToCalculator(
          Number(createdFormId),
          Number(calcId),
        );
        toast(translations.value.formCreatedSavedAndApplied, {
          type: "success",
        });
        return;
      }
      toast(translations.value.formCreatedAndSaved, { type: "success" });
      return;
    }

    toast(translations.value.changesApplied, { type: "success" });
  };

  const discardFormChanges = async () => {
    if (!isDirty.value) return;
    await orderFormStore.discardActiveChanges();
    toast(translations.value.changesDiscarded || "Changes discarded", {
      type: "info",
    });
  };

  return {
    activeForm,
    fields,
    isDirty,
    isEditingFormName,
    editableFormName,
    dragOverIndex,
    fieldListRef,
    resizingFieldId,
    setFormNameInputRef,
    startEditFormName,
    cancelEditFormName,
    saveFormName,
    applyFormChanges,
    discardFormChanges,
    onRawFieldDrop,
    onRawFieldDropAfter,
    onFieldDragEnter,
    onBodyDragEnter,
    onBodyDragLeave,
    onFieldsReorder,
    selectField,
    isSelected,
    duplicateField,
    deleteField,
    onResizeStart,
  };
};
