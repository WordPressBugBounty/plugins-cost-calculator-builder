import { computed, ref, type Ref, type ComputedRef } from "vue";
import { toast } from "vue3-toastify";
import { useOrderFormStore } from "@/admin/app/providers/stores/useOrderFormStore";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import {
  IOrderFormBuilderField,
  IOrderFormEntity,
  IOrderFormRawField,
} from "@/admin/shared/types/order-form.type";

export type ActiveTab = "fields" | "forms";
export type Tab = { id: ActiveTab; label: string };

interface IOrderFormSidebar {
  activeTab: Ref<ActiveTab>;
  tabs: ComputedRef<Tab[]>;
  selectedField: ComputedRef<IOrderFormBuilderField | null>;
  activeFormId: ComputedRef<number | null>;
  appliedFormId: ComputedRef<number | null>;
  activeForm: ComputedRef<IOrderFormEntity | null>;
  forms: ComputedRef<IOrderFormEntity[]>;
  dirty: ComputedRef<boolean>;
  isTitleDirty: ComputedRef<boolean>;
  rawFields: ComputedRef<IOrderFormRawField[]>;

  selectForm: (formId: number) => Promise<void>;
  applyFormChanges: () => Promise<void>;
  applyForm: (formId: number) => Promise<void>;
  createForm: () => Promise<void>;
  addRawField: (field: IOrderFormRawField) => void;
  onRawFieldDragStart: (field: IOrderFormRawField, event: DragEvent) => void;
  duplicateForm: (formId: number) => Promise<void>;
  deleteForm: (formId: number) => Promise<void>;
}

export const useOrderFormSidebar = (): IOrderFormSidebar => {
  const orderFormStore = useOrderFormStore();
  const calculatorStore = useCalculatorStore();
  const translationsStore = useBuilderTranslationsStore();
  const translations = computed(() => translationsStore.getTranslations);

  const activeTab = ref<ActiveTab>("fields");
  const tabs = computed<Tab[]>(() => [
    { id: "fields", label: translations.value.fields },
    { id: "forms", label: translations.value.formManager },
  ]);

  const selectedField = computed(() => orderFormStore.getSelectedField);
  const activeFormId = computed(() => orderFormStore.getActiveFormId);
  const activeForm = computed<IOrderFormEntity | null>(
    () =>
      orderFormStore.getForms.find(
        (form) => Number(form.id) === Number(activeFormId.value),
      ) || null,
  );
  const dirty = computed(() => orderFormStore.getDirty);
  const appliedFormId = computed(() => orderFormStore.getAppliedFormId);
  const isTitleDirty = computed(() => orderFormStore.getIsTitleDirty);
  const rawFields = computed(() => orderFormStore.getRawFields);

  const forms = computed(() => {
    const appliedId = Number(appliedFormId.value);
    const draftId = orderFormStore.getDraftFormId;
    return [...orderFormStore.getForms]
      .filter((form) => draftId === null || Number(form.id) !== Number(draftId))
      .sort((a, b) => {
        const aPriority = Number(a.id) === appliedId ? 1 : 0;
        const bPriority = Number(b.id) === appliedId ? 1 : 0;
        return bPriority - aPriority;
      });
  });

  const withUnsavedGuard = async (callback: () => Promise<void>) => {
    if (dirty.value) {
      const shouldSave = window.confirm(
        translations.value.youHaveUnsavedChangesClickOkToSaveOrCancelToDiscard,
      );
      if (shouldSave) {
        const success = await orderFormStore.updateForm();
        if (!success) return;
      } else {
        await orderFormStore.discardActiveChanges();
      }
    }
    await callback();
  };

  const selectForm = async (formId: number) => {
    if (Number(formId) === activeFormId.value) return;
    await withUnsavedGuard(async () => {
      await orderFormStore.setSelectedForm(Number(formId));
    });
  };

  const applyForm = async (formId: number) => {
    const calcId = calculatorStore.getId;
    if (!calcId) return;
    await orderFormStore.applyFormToCalculator(Number(formId), Number(calcId));
    toast(translations.value.formApplied, { type: "success" });
  };

  const applyFormChanges = async () => {
    if (!dirty.value) return;
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

  const createForm = async () => {
    orderFormStore.addDraftForm();
    toast(translations.value.draftFormCreatedClickApplyToSave, {
      type: "info",
    });
  };

  const addRawField = (field: IOrderFormRawField) => {
    orderFormStore.addField(field);
  };

  const onRawFieldDragStart = (field: IOrderFormRawField, event: DragEvent) => {
    if (!event.dataTransfer) return;
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/x-ccb-order-field-type",
      field.type,
    );
    event.dataTransfer.setData("text/plain", field.type);
  };

  const duplicateForm = async (formId: number) => {
    const duplicatedFormId = await orderFormStore.duplicateForm(Number(formId));
    if (duplicatedFormId) {
      toast(translations.value.formDuplicated, { type: "success" });
    }
  };

  const deleteForm = async (formId: number) => {
    const calcId = calculatorStore.getId;
    if (!calcId) return;

    if (forms.value.length < 2) {
      toast(translations.value.atLeastOneFormMustRemain, { type: "warning" });
      return;
    }

    const confirmed = window.confirm(translations.value.deleteSelectedForm);
    if (!confirmed) return;

    const result = await orderFormStore.deleteForm(
      Number(formId),
      Number(calcId),
    );
    if (!result.success) {
      toast(result.message || translations.value.unableToDeleteForm, {
        type: "warning",
      });
      return;
    }

    toast(translations.value.formDeleted, { type: "success" });
  };

  // const handleUpdateForm = async () => {
  //   const success = await orderFormStore.updateForm();
  //   if (success) {
  //     toast('Form updated', { type: 'success' });
  //     return;
  //   }
  //   toast('Unable to update form', { type: 'error' });
  // };

  return {
    activeTab,
    tabs,
    selectedField,
    activeFormId,
    appliedFormId,
    activeForm,
    forms,
    dirty,
    isTitleDirty,
    rawFields,
    selectForm,
    applyFormChanges,
    applyForm,
    createForm,
    addRawField,
    onRawFieldDragStart,
    duplicateForm,
    deleteForm,
  };
};
