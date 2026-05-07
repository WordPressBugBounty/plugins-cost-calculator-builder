import { defineStore } from "pinia";
import { OrderFormAPI } from "@/admin/shared/api/OrderFormAPI";
import {
  IOrderFormBootstrapData,
  IOrderFormBuilderField,
  IOrderFormEntity,
  IOrderFormFieldAttributeValue,
  IOrderFormFieldAttributes,
  IOrderFormRawField,
} from "@/admin/shared/types/order-form.type";
import { IOrderFormApiResponse } from "@/admin/shared/types/api/order-form.response.type";
import { IDeleteFormData } from "@/admin/shared/types/api/order-form.response.type";

interface IOrderFormStore {
  rawFields: IOrderFormRawField[];
  forms: IOrderFormEntity[];
  activeFormId: number | null;
  appliedFormId: number | null;
  draftFormId: number | null;
  fields: IOrderFormBuilderField[];
  selectedFieldId: number | string | null;
  dirty: boolean;
  isTitleDirty: boolean;
  lastSavedActiveFormName: string;
  tempIdCounter: number;
  draftFormCounter: number;
}

const ORDER_FORM_TYPE_ICON_MAP: Record<string, string> = {
  name: "ccb-icon-Subtraction-7",
  email: "ccb-icon-account-solid",
  phone: "ccb-icon-Icon-element",
  "input-textbox": "ccb-icon-Subtraction-7",
  textarea: "ccb-icon-textarea",
  number: "ccb-icon-Subtraction-6",
  dropdown: "ccb-icon-dropdown-2",
  radio: "ccb-icon-Path-3511",
  checkbox: "ccb-icon-Path-3512",
  "time-picker": "ccb-icon-ccb_time_picker",
  "date-picker": "ccb-icon-Union-19",
  "formatted-text": "ccb-icon-Path-3601",
  space: "ccb-icon-space",
};

export const useOrderFormStore = defineStore("order_form_store", {
  state: (): IOrderFormStore => ({
    rawFields: [],
    forms: [],
    activeFormId: null,
    appliedFormId: null,
    draftFormId: null,
    fields: [],
    selectedFieldId: null,
    dirty: false,
    isTitleDirty: false,
    lastSavedActiveFormName: "",
    tempIdCounter: 0,
    draftFormCounter: -1,
  }),

  getters: {
    getRawFields: (state): IOrderFormRawField[] => state.rawFields,
    getForms: (state): IOrderFormEntity[] => state.forms,
    getActiveFormId: (state): number | null => state.activeFormId,
    getAppliedFormId: (state): number | null => state.appliedFormId,
    getDraftFormId: (state): number | null => state.draftFormId,
    getIsDraftActiveForm: (state): boolean =>
      state.activeFormId !== null &&
      state.draftFormId !== null &&
      Number(state.activeFormId) === Number(state.draftFormId),
    getFields: (state): IOrderFormBuilderField[] => state.fields,
    getSelectedFieldId: (state): number | string | null =>
      state.selectedFieldId,
    getSelectedField: (state): IOrderFormBuilderField | null => {
      if (state.selectedFieldId === null) return null;
      return (
        state.fields.find(
          (field) =>
            field.id === state.selectedFieldId ||
            field.tempId === state.selectedFieldId,
        ) || null
      );
    },
    getDirty: (state): boolean => state.dirty,
    getIsTitleDirty: (state): boolean => state.isTitleDirty,
  },

  actions: {
    privateMapFields(
      fields: IOrderFormBuilderField[],
    ): IOrderFormBuilderField[] {
      return (fields || []).map((field, index) => ({
        ...field,
        icon: field.icon || ORDER_FORM_TYPE_ICON_MAP[field.type] || "",
        sort_id: index,
      }));
    },

    setActiveFormId(formId: number | null): void {
      this.activeFormId = formId;
      const activeForm = this.privateGetActiveForm();
      this.setActiveFormTitleSavedState(activeForm?.name || "");
      this.dirty = false;
    },

    setActiveFormTitleSavedState(formName: string): void {
      this.lastSavedActiveFormName = formName;
      this.isTitleDirty = false;
    },

    privateGetActiveForm(): IOrderFormEntity | null {
      return (
        this.forms.find(
          (form) => Number(form.id) === Number(this.activeFormId),
        ) || null
      );
    },

    renameFormName(formId: number, formName: string): boolean {
      const index = this.forms.findIndex(
        (form) => Number(form.id) === Number(formId),
      );
      if (index < 0) return false;

      this.forms[index] = {
        ...this.forms[index],
        name: formName,
      };

      this.isTitleDirty = formName !== this.lastSavedActiveFormName;
      this.dirty = this.isTitleDirty;
      return true;
    },

    discardActiveTitleChanges(): void {
      const activeForm = this.privateGetActiveForm();
      if (!activeForm) return;

      this.renameFormName(
        Number(activeForm.id),
        this.lastSavedActiveFormName || activeForm.name,
      );
      this.isTitleDirty = false;
      this.dirty = false;
    },

    async discardActiveChanges(): Promise<void> {
      if (this.getIsDraftActiveForm) {
        const draftId = this.draftFormId;
        this.forms = this.forms.filter(
          (form) => Number(form.id) !== Number(draftId),
        );
        this.draftFormId = null;

        const fallbackFormId =
          this.appliedFormId !== null
            ? Number(this.appliedFormId)
            : this.forms.length
              ? Number(this.forms[0].id)
              : null;

        this.activeFormId = fallbackFormId;
        if (fallbackFormId) {
          await this.fetchActiveFormFields(fallbackFormId);
          const activeForm = this.privateGetActiveForm();
          this.setActiveFormTitleSavedState(activeForm?.name || "");
        } else {
          this.fields = [];
          this.selectedFieldId = null;
          this.lastSavedActiveFormName = "";
          this.isTitleDirty = false;
          this.dirty = false;
        }
        return;
      }

      if (!this.activeFormId) return;
      await this.fetchActiveFormFields(this.activeFormId);
      this.discardActiveTitleChanges();
      this.selectedFieldId = null;
      this.dirty = false;
      this.isTitleDirty = false;
    },

    initFromAdminData(data: IOrderFormBootstrapData): void {
      const orderFormManager = OrderFormAPI.mapBootstrapData(data);
      this.rawFields = orderFormManager.order_form_fields || [];
      this.forms = orderFormManager.order_forms || [];
      this.activeFormId = orderFormManager.active_form_id
        ? Number(orderFormManager.active_form_id)
        : null;
      this.appliedFormId = this.activeFormId;

      this.fields = this.privateMapFields(
        orderFormManager.order_active_form_fields || [],
      );

      this.draftFormId = null;
      this.selectedFieldId = null;
      this.dirty = false;
      this.isTitleDirty = false;
      const activeForm = this.privateGetActiveForm();
      this.lastSavedActiveFormName = activeForm?.name || "";
      this.tempIdCounter = 0;
      this.draftFormCounter = -1;
    },

    setSelectedField(fieldId: number | string | null): void {
      this.selectedFieldId = fieldId;
    },

    setDirty(value: boolean): void {
      this.dirty = value;
    },

    privateNormalizeSort(): void {
      this.fields = this.fields.map((field, index) => ({
        ...field,
        sort_id: index,
      }));
    },

    privateBuildDraftDefaultFields(): IOrderFormBuilderField[] {
      const fallbackAttributesByType: Record<
        string,
        IOrderFormFieldAttributes
      > = {
        name: {
          required: "1",
          label: "Name",
          placeholder: "Type your name",
        },
        email: {
          required: "1",
          label: "Email",
          placeholder: "Type your email",
          confirmation: "1",
          confirmation_label: "Confirm your email",
          confirmation_placeholder: "",
          position: "Vertical",
          primary: "1",
        },
        phone: {
          required: "1",
          label: "Phone",
          placeholder: "Type your phone",
        },
        textarea: {
          required: "1",
          label: "Message",
          placeholder: "Type your text",
          character_limit: "400",
        },
      };

      const defaultTypes = ["name", "email", "phone", "textarea"];
      return defaultTypes.map((type, index) => {
        const rawField = this.rawFields.find((field) => field.type === type);
        if (rawField) {
          const fromRaw = this.createFieldFromRaw(rawField);
          return {
            ...fromRaw,
            sort_id: index,
            field_width: 12,
            attributes: {
              ...fromRaw.attributes,
              required: fromRaw.attributes.required || "1",
            },
          };
        }

        return {
          type,
          icon: ORDER_FORM_TYPE_ICON_MAP[type] || "",
          field_width: 12,
          sort_id: index,
          tempId: `temp_${this.tempIdCounter++}`,
          attributes: JSON.parse(
            JSON.stringify(fallbackAttributesByType[type] || {}),
          ) as IOrderFormFieldAttributes,
        };
      });
    },

    addDraftForm(): number {
      if (this.draftFormId !== null) {
        this.forms = this.forms.filter(
          (form) => Number(form.id) !== Number(this.draftFormId),
        );
      }

      const draftId = this.draftFormCounter--;
      const draftName = "New Form";

      this.forms.push({
        id: draftId,
        name: draftName,
      });

      this.draftFormId = draftId;
      this.activeFormId = draftId;
      this.fields = this.privateBuildDraftDefaultFields();
      this.selectedFieldId = null;
      this.lastSavedActiveFormName = "";
      this.isTitleDirty = true;
      this.dirty = true;

      return draftId;
    },

    createFieldFromRaw(rawField: IOrderFormRawField): IOrderFormBuilderField {
      const attributes = JSON.parse(
        JSON.stringify(rawField.attributes || {}),
      ) as IOrderFormFieldAttributes;
      return {
        type: rawField.type,
        icon: rawField.icon || ORDER_FORM_TYPE_ICON_MAP[rawField.type] || "",
        field_width: rawField.field_width || "12",
        attributes,
        tempId: `temp_${this.tempIdCounter++}`,
        sort_id: this.fields.length,
      };
    },

    addField(rawField: IOrderFormRawField): void {
      const newField = this.createFieldFromRaw(rawField);
      if (this.selectedFieldId !== null) {
        const index = this.fields.findIndex(
          (field) =>
            field.id === this.selectedFieldId ||
            field.tempId === this.selectedFieldId,
        );
        if (index >= 0) {
          this.fields.splice(index + 1, 0, newField);
        } else {
          this.fields.push(newField);
        }
      } else {
        this.fields.push(newField);
      }

      this.privateNormalizeSort();
      this.setSelectedField(newField.tempId || null);
      this.ensureSinglePrimaryEmail();
      this.dirty = true;
    },

    addFieldAt(rawField: IOrderFormRawField, index: number): void {
      const newField = this.createFieldFromRaw(rawField);
      const safeIndex = Math.max(0, Math.min(index, this.fields.length));
      this.fields.splice(safeIndex, 0, newField);
      this.privateNormalizeSort();
      this.setSelectedField(newField.tempId || null);
      this.ensureSinglePrimaryEmail();
      this.dirty = true;
    },

    setFields(fields: IOrderFormBuilderField[]): void {
      this.fields = fields;
      this.privateNormalizeSort();
      this.dirty = true;
    },

    duplicateField(fieldId: number | string): void {
      const index = this.fields.findIndex(
        (field) => field.id === fieldId || field.tempId === fieldId,
      );
      if (index < 0) return;

      const source = this.fields[index];
      const clone: IOrderFormBuilderField = {
        ...JSON.parse(JSON.stringify(source)),
        id: undefined,
        tempId: `temp_${this.tempIdCounter++}`,
      };

      this.fields.splice(index + 1, 0, clone);
      this.privateNormalizeSort();
      this.setSelectedField(clone.tempId || null);
      this.ensureSinglePrimaryEmail();
      this.dirty = true;
    },

    deleteField(fieldId: number | string): void {
      this.fields = this.fields.filter(
        (field) => field.id !== fieldId && field.tempId !== fieldId,
      );
      if (this.selectedFieldId === fieldId) {
        this.selectedFieldId = null;
      }
      this.privateNormalizeSort();
      this.dirty = true;
    },

    updateSelectedFieldAttributes(
      patch: Record<string, IOrderFormFieldAttributeValue>,
    ): void {
      const selectedField = this.getSelectedField;
      if (!selectedField) return;

      selectedField.attributes = {
        ...selectedField.attributes,
        ...patch,
      };

      if (Object.prototype.hasOwnProperty.call(patch, "primary")) {
        this.ensureSinglePrimaryEmail(selectedField);
      }

      this.dirty = true;
    },

    updateSelectedFieldWidth(width: string | number): void {
      const selectedField = this.getSelectedField;
      if (!selectedField) return;
      selectedField.field_width = width;
      this.dirty = true;
    },

    updateFieldWidthById(
      fieldId: string | number,
      width: string | number,
    ): void {
      const field = this.fields.find(
        (f) => f.id === fieldId || f.tempId === fieldId,
      );
      if (!field) return;
      field.field_width = width;
      this.dirty = true;
    },

    ensureSinglePrimaryEmail(targetField?: IOrderFormBuilderField): void {
      const selected = targetField || this.getSelectedField;
      if (!selected || selected.type !== "email") return;

      const selectedPrimary = selected.attributes.primary;
      if (selectedPrimary !== true && selectedPrimary !== "1") return;

      this.fields = this.fields.map((field) => {
        if (field === selected || field.type !== "email") return field;
        return {
          ...field,
          attributes: {
            ...field.attributes,
            primary: "0",
          },
        };
      });
    },

    async fetchFormsExisting(): Promise<void> {
      const response = await OrderFormAPI.getFormsList({
        action: "calc_forms_list",
        nonce: window?.ccb_nonces?.ccb_get_forms || "",
      });
      this.forms = response.data || [];
    },

    async fetchActiveFormFields(formId: number): Promise<void> {
      const response = await OrderFormAPI.getActiveFormFields({
        action: "calc_active_form_fields",
        nonce: window?.ccb_nonces?.ccb_get_active_form_fields || "",
        form_id: formId,
      });
      this.fields = this.privateMapFields(response.data || []);
      this.selectedFieldId = null;
      this.dirty = false;
    },

    async setSelectedForm(formId: number): Promise<void> {
      await this.fetchActiveFormFields(formId);
      this.activeFormId = formId;
      const activeForm = this.privateGetActiveForm();
      this.setActiveFormTitleSavedState(activeForm?.name || "");
      this.dirty = false;
    },

    async applyFormToCalculator(formId: number, calcId: number): Promise<void> {
      const response = await OrderFormAPI.applyFormId({
        action: "calc_apply_form_id",
        nonce: window?.ccb_nonces?.ccb_apply_form_id || "",
        calc_id: calcId,
        form_id: formId,
      });

      if (response.success) {
        this.draftFormId = null;
        this.activeFormId = formId;
        this.appliedFormId = formId;
        this.fields = this.privateMapFields(
          response.data?.order_form_fields || [],
        );
        this.selectedFieldId = null;
        this.dirty = false;
        const activeForm = this.privateGetActiveForm();
        this.setActiveFormTitleSavedState(activeForm?.name || "");
      }
    },

    async createDefaultForm(): Promise<number | null> {
      const response = await OrderFormAPI.createDefaultForm({
        action: "calc_create_default_form",
        nonce: window?.ccb_nonces?.ccb_create_default_form || "",
      });
      if (!response.success || !response.data) return null;

      this.forms = response.data.forms || [];
      this.activeFormId = Number(response.data.form_id);
      this.draftFormId = null;
      await this.fetchActiveFormFields(this.activeFormId);
      this.selectedFieldId = null;
      this.dirty = true;
      const activeForm = this.privateGetActiveForm();
      this.setActiveFormTitleSavedState(activeForm?.name || "");
      return this.activeFormId;
    },

    async duplicateForm(formId: number): Promise<number | null> {
      const response = await OrderFormAPI.duplicateForm({
        action: "calc_duplicate_form",
        nonce: window?.ccb_nonces?.ccb_duplicate_form || "",
        form_id: formId,
      });
      if (!response.success || !response.data) return null;

      this.forms = response.data.forms || [];
      this.activeFormId = Number(response.data.form_id);
      this.draftFormId = null;
      await this.fetchActiveFormFields(this.activeFormId);
      this.selectedFieldId = null;
      this.dirty = true;
      const activeForm = this.privateGetActiveForm();
      this.setActiveFormTitleSavedState(activeForm?.name || "");
      return this.activeFormId;
    },

    async deleteForm(
      formId: number,
      calcId: number,
    ): Promise<IOrderFormApiResponse<IDeleteFormData>> {
      const response = await OrderFormAPI.deleteForm({
        action: "calc_delete_form",
        nonce: window?.ccb_nonces?.ccb_delete_form || "",
        form_id: formId,
        calc_id: calcId,
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message || "Unable to delete form",
        };
      }

      this.forms = response.data.forms || [];
      this.activeFormId = Number(response.data.active_form_id) || null;
      this.appliedFormId = Number(response.data.active_form_id) || null;
      this.draftFormId = null;
      this.fields = this.privateMapFields(response.data.active_fields || []);
      this.selectedFieldId = null;
      this.dirty = false;
      const activeForm = this.privateGetActiveForm();
      this.setActiveFormTitleSavedState(activeForm?.name || "");
      return {
        success: true,
        message:
          response.message ||
          `The form #${response.data.form_id} has been deleted`,
      };
    },

    async updateForm(): Promise<boolean> {
      if (!this.activeFormId) return false;

      this.privateNormalizeSort();

      const selectedFormBeforeSave = this.forms.find(
        (form) => Number(form.id) === Number(this.activeFormId),
      );
      const draftFormName = selectedFormBeforeSave?.name || "Default Form";
      const draftFieldsSnapshot = JSON.parse(
        JSON.stringify(this.fields),
      ) as IOrderFormBuilderField[];

      if (this.getIsDraftActiveForm) {
        const createdFormId = await this.createDefaultForm();
        if (!createdFormId) return false;

        const createdFormIndex = this.forms.findIndex(
          (form) => Number(form.id) === Number(createdFormId),
        );
        if (createdFormIndex >= 0) {
          this.forms[createdFormIndex] = {
            ...this.forms[createdFormIndex],
            name: draftFormName,
          };
        }

        this.activeFormId = createdFormId;
        this.fields = this.privateMapFields(draftFieldsSnapshot);
      }

      const selectedForm = this.forms.find(
        (form) => Number(form.id) === Number(this.activeFormId),
      );
      const formName = selectedForm?.name || draftFormName || "Default Form";

      const response = await OrderFormAPI.updateForm({
        action: "calc_update_form",
        nonce: window?.ccb_nonces?.ccb_update_form || "",
        form_id: Number(this.activeFormId),
        form_name: formName,
        form_builder_data: JSON.stringify(this.fields),
      });

      if (response.success) {
        this.draftFormId = null;
        await this.fetchActiveFormFields(this.activeFormId);
        this.dirty = false;
        const activeForm = this.privateGetActiveForm();
        this.setActiveFormTitleSavedState(activeForm?.name || "");
        return true;
      }

      return false;
    },
  },
});
