import { defineStore, acceptHMRUpdate } from "pinia";
import axios from "axios";
import { AdminAPI } from "@/admin/shared/api/AdminAPI";
import type {
  IAppearanceActivePreset,
  IAppearanceData,
  IAppearancePresetData,
} from "@/admin/shared/types/api/admin.response.type";
import { toast } from "vue3-toastify";

interface IAppearanceStore {
  presets: IAppearancePresetData[];
  activePreset: IAppearanceActivePreset | null;
  editingPreset: IAppearanceActivePreset | null;
  editingRevision: number;
  selectedPresetKey: string;
  isPresetEditorOpen: boolean;
  editingPresetId: string | null;
  editorDevice: "desktop" | "mobile";
  editorSection: string;
  isCustomizeFlowActive: boolean;
  customizeSourcePresetId: string | null;
  customizeSnapshot: ICustomizeSnapshot | null;
}

const BRAND_PRESET_IDS = ["default", "orange", "sky", "black", "dark_blue"];

interface ICustomizeSnapshot {
  activePreset: IAppearanceActivePreset | null;
  selectedPresetKey: string;
  isPresetEditorOpen: boolean;
  editingPresetId: string | null;
  editorDevice: "desktop" | "mobile";
  editorSection: string;
}

export const useAppearanceStore = defineStore("appearance_store", {
  state: (): IAppearanceStore => ({
    presets: [],
    activePreset: null,
    editingPreset: null,
    editingRevision: 0,
    selectedPresetKey: "default",
    isPresetEditorOpen: false,
    editingPresetId: null,
    editorDevice: "desktop",
    editorSection: "colors",
    isCustomizeFlowActive: false,
    customizeSourcePresetId: null,
    customizeSnapshot: null,
  }),

  getters: {
    getPresets: (state: IAppearanceStore): IAppearancePresetData[] =>
      state.presets,
    getActivePreset: (
      state: IAppearanceStore,
    ): IAppearanceActivePreset | null => state.activePreset,
    getEditingPreset: (
      state: IAppearanceStore,
    ): IAppearanceActivePreset | null => state.editingPreset,
    getEditingRevision: (state: IAppearanceStore): number =>
      state.editingRevision,
    getSelectedPresetKey: (state: IAppearanceStore): string =>
      state.selectedPresetKey,
    getIsPresetEditorOpen: (state: IAppearanceStore): boolean =>
      state.isPresetEditorOpen,
    getEditingPresetId: (state: IAppearanceStore): string | null =>
      state.editingPresetId,
    getEditorDevice: (state: IAppearanceStore): "desktop" | "mobile" =>
      state.editorDevice,
    getEditorSection: (state: IAppearanceStore): string => state.editorSection,
    getIsCustomizeFlowActive: (state: IAppearanceStore): boolean =>
      state.isCustomizeFlowActive,
    getBrandPresets: (state: IAppearanceStore): IAppearancePresetData[] =>
      state.presets.filter((preset) => BRAND_PRESET_IDS.includes(preset.id)),
    getMyPresets: (state: IAppearanceStore): IAppearancePresetData[] =>
      state.presets.filter((preset) => !BRAND_PRESET_IDS.includes(preset.id)),
  },

  actions: {
    initAppearance(data?: IAppearanceData): void {
      if (!data) {
        this.presets = [];
        this.activePreset = null;
        this.editingPreset = null;
        this.selectedPresetKey = "default";
        this.isPresetEditorOpen = false;
        this.editingPresetId = null;
        this.editorDevice = "desktop";
        this.editorSection = "colors";
        this.isCustomizeFlowActive = false;
        this.customizeSourcePresetId = null;
        this.customizeSnapshot = null;
        return;
      }

      this.presets = Array.isArray(data.presets) ? data.presets : [];
      this.activePreset =
        data.active_preset &&
        typeof data.active_preset === "object" &&
        typeof data.active_preset.preset_key === "string"
          ? data.active_preset
          : null;

      this.selectedPresetKey =
        typeof data.selected_preset_key === "string" &&
        data.selected_preset_key.length > 0
          ? data.selected_preset_key
          : "default";

      this.editorSection = "colors";
      this.isCustomizeFlowActive = false;
      this.customizeSourcePresetId = null;
      this.customizeSnapshot = null;
    },

    openPresetEditor(presetId: string): void {
      this.isPresetEditorOpen = true;
      this.editingPresetId = presetId;
      this.editorSection = "colors";
      this.editorDevice = "desktop";
    },

    async closePresetEditor(calcId?: number): Promise<void> {
      const presetId = this.editingPresetId;
      const preset = this.editingPreset;

      if (
        calcId &&
        presetId &&
        preset &&
        !BRAND_PRESET_IDS.includes(presetId)
      ) {
        try {
          const response = await AdminAPI.saveCalculatorCustomAppearance({
            action: "calc_save_custom",
            nonce: window?.ccb_nonces?.ccb_save_custom || "",
            id: calcId,
            selectedIdx: presetId,
            appearance: preset,
          });
          const appearance = response.data?.appearance;
          if (response.success && appearance) {
            this.presets = Array.isArray(appearance.presets)
              ? appearance.presets
              : this.presets;
            this.activePreset = appearance.active_preset || this.activePreset;
            this.selectedPresetKey = String(
              appearance.selected_preset_key ||
                appearance.active_preset?.preset_key ||
                this.selectedPresetKey,
            );
          }
        } catch (e) {
          console.error("Failed to save edited preset on close", e);
        }
      }

      this.isPresetEditorOpen = false;
      this.editingPresetId = null;
      this.editingPreset = null;
    },

    async loadEditingPreset(
      calcId: number,
      presetId: string,
    ): Promise<boolean> {
      const nonce = window?.ccb_nonces?.ccb_get_preset || "";
      const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

      try {
        const params = new URLSearchParams({
          action: "ccb_get_preset",
          nonce,
          calc_id: String(calcId),
          selectedIdx: presetId,
        });

        const response = await axios.get(`${ajaxUrl}?${params.toString()}`);
        if (response.data?.success) {
          const data = {
            ...(response.data.data || {}),
            preset_key: presetId,
          };
          this.editingPreset = data;
          this.activePreset = data;
          return true;
        }
      } catch (e) {
        console.error("Failed to load editing preset", e);
      }
      return false;
    },

    updateEditingPresetField(
      sectionKey: string,
      fieldKey: string,
      value: unknown,
      nestedKey?: string,
      deepNestedKey?: string,
    ): void {
      if (!this.editingPreset) return;

      const deviceData = this.editingPreset[this.editorDevice] as
        | Record<string, unknown>
        | undefined;
      if (!deviceData || typeof deviceData !== "object") return;

      const section = deviceData[sectionKey] as
        | { data?: Record<string, unknown> }
        | undefined;
      const field = section?.data?.[fieldKey] as
        | { value?: unknown; data?: Record<string, unknown> }
        | undefined;

      if (!field) return;

      if (nestedKey && deepNestedKey && field.data?.[nestedKey]) {
        const deepField = field.data[nestedKey] as {
          data?: Record<string, unknown>;
        };
        if (deepField?.data?.[deepNestedKey]) {
          const node = deepField.data[deepNestedKey] as { value?: unknown };
          node.value = value;
        }
      } else if (nestedKey && field.data?.[nestedKey]) {
        const nestedField = field.data[nestedKey] as { value?: unknown };
        nestedField.value = value;
      } else {
        field.value = value;
      }

      this.activePreset = this.editingPreset;
      this.editingRevision++;
    },

    extractPresetColors(
      preset: IAppearanceActivePreset | Record<string, any>,
    ): string[] {
      const COLOR_KEYS = [
        "container",
        "primary_color",
        "accent_color",
        "secondary_color",
        "error_color",
      ];
      const colorsData = (preset as Record<string, any>)?.desktop?.colors?.data;
      if (!colorsData || typeof colorsData !== "object") return [];

      return COLOR_KEYS.map((key) => {
        const field = colorsData[key];
        if (!field) return "";
        if (field.data?.color?.value) return String(field.data.color.value);
        let val = field.value;
        if (val && typeof val === "object" && "color" in val) val = val.color;
        return typeof val === "string" ? val : "";
      });
    },

    setEditorSection(section: string): void {
      this.editorSection = section;
    },

    setEditorDevice(device: "desktop" | "mobile"): void {
      this.editorDevice = device;
    },

    createCustomizeSnapshot(): ICustomizeSnapshot {
      return {
        activePreset: this.activePreset
          ? JSON.parse(JSON.stringify(this.activePreset))
          : null,
        selectedPresetKey: this.selectedPresetKey,
        isPresetEditorOpen: this.isPresetEditorOpen,
        editingPresetId: this.editingPresetId,
        editorDevice: this.editorDevice,
        editorSection: this.editorSection,
      };
    },

    applyCustomizeSnapshot(snapshot: ICustomizeSnapshot): void {
      this.activePreset = snapshot.activePreset
        ? JSON.parse(JSON.stringify(snapshot.activePreset))
        : null;
      this.selectedPresetKey = snapshot.selectedPresetKey;
      this.isPresetEditorOpen = snapshot.isPresetEditorOpen;
      this.editingPresetId = snapshot.editingPresetId;
      this.editorDevice = snapshot.editorDevice;
      this.editorSection = snapshot.editorSection;
    },

    normalizePresets(rawPresets: unknown[]): IAppearancePresetData[] {
      return rawPresets
        .map((preset) => {
          const item = preset as Record<string, unknown>;
          const id = String(item.id ?? item.key ?? "");
          if (!id) return null;

          const colors = Array.isArray(item.colors)
            ? item.colors
                .filter((color): color is string => typeof color === "string")
                .slice(0, 5)
            : [];

          return {
            id,
            name: String(item.name ?? item.title ?? id),
            colors,
          };
        })
        .filter((preset): preset is IAppearancePresetData => preset !== null);
    },

    async startCustomizeFlow(
      calcId: number,
      presetId: string,
    ): Promise<boolean> {
      if (!calcId) return false;

      const snapshot = this.createCustomizeSnapshot();
      const previewed = await this.previewPreset(calcId, presetId);
      if (!previewed) return false;

      this.customizeSnapshot = snapshot;
      this.isCustomizeFlowActive = true;
      this.customizeSourcePresetId = presetId;
      this.openPresetEditor(presetId);
      return true;
    },

    async saveCustomizeFlow(calcId: number): Promise<boolean> {
      if (!calcId || !this.activePreset) return false;

      try {
        const response = await AdminAPI.saveCalculatorCustomAppearance({
          action: "calc_save_custom",
          nonce: window?.ccb_nonces?.ccb_save_custom || "",
          id: calcId,
          selectedIdx: "saved",
          appearance: this.activePreset,
        });
        const appearance = response.data?.appearance;

        if (!response.success || !appearance) return false;

        this.presets = Array.isArray(appearance.presets)
          ? appearance.presets
          : [];
        this.activePreset = appearance.active_preset || null;
        this.selectedPresetKey = String(
          appearance.selected_preset_key ||
            appearance.active_preset?.preset_key ||
            "default",
        );

        this.closePresetEditor();
        this.isCustomizeFlowActive = false;
        this.customizeSourcePresetId = null;
        this.customizeSnapshot = null;
        return true;
      } catch (e) {
        console.error("Failed to save customized preset", e);
        return false;
      }
    },

    async persistEditedPresetForSettingsSave(calcId: number): Promise<boolean> {
      if (!calcId || !this.activePreset) return true;
      if (this.isCustomizeFlowActive || !this.isPresetEditorOpen) return true;

      const presetId = String(this.activePreset.preset_key || "");
      if (!presetId || BRAND_PRESET_IDS.includes(presetId)) return true;

      try {
        const response = await AdminAPI.saveCalculatorCustomAppearance({
          action: "calc_save_custom",
          nonce: window?.ccb_nonces?.ccb_save_custom || "",
          id: calcId,
          selectedIdx: presetId,
          appearance: this.activePreset,
        });
        const appearance = response.data?.appearance;

        if (!response.success || !appearance) return false;

        this.presets = Array.isArray(appearance.presets)
          ? appearance.presets
          : this.presets;
        this.activePreset = appearance.active_preset || this.activePreset;
        this.editingPreset = appearance.active_preset || this.editingPreset;
        this.selectedPresetKey = String(
          appearance.selected_preset_key ||
            appearance.active_preset?.preset_key ||
            this.selectedPresetKey,
        );
        return true;
      } catch (e) {
        console.error("Failed to persist edited preset on settings save", e);
        return false;
      }
    },

    cancelCustomizeFlow(): void {
      if (this.customizeSnapshot) {
        this.applyCustomizeSnapshot(this.customizeSnapshot);
      } else {
        this.closePresetEditor();
      }

      this.isCustomizeFlowActive = false;
      this.customizeSourcePresetId = null;
      this.customizeSnapshot = null;
    },

    updateActivePresetField(
      sectionKey: string,
      fieldKey: string,
      value: unknown,
      nestedKey?: string,
      deepNestedKey?: string,
    ): void {
      if (!this.activePreset) return;

      const deviceData = this.activePreset[this.editorDevice] as
        | Record<string, unknown>
        | undefined;
      if (!deviceData || typeof deviceData !== "object") return;

      const section = deviceData[sectionKey] as
        | { data?: Record<string, unknown> }
        | undefined;
      const field = section?.data?.[fieldKey] as
        | { value?: unknown; data?: Record<string, unknown> }
        | undefined;

      if (!field) return;

      if (nestedKey && deepNestedKey && field.data?.[nestedKey]) {
        const deepField = field.data[nestedKey] as {
          data?: Record<string, unknown>;
        };
        if (deepField?.data?.[deepNestedKey]) {
          const node = deepField.data[deepNestedKey] as { value?: unknown };
          node.value = value;
        }
        return;
      }

      if (nestedKey && field.data?.[nestedKey]) {
        const nestedField = field.data[nestedKey] as { value?: unknown };
        nestedField.value = value;
        return;
      }

      field.value = value;
    },

    async previewPreset(calcId: number, presetId: string): Promise<boolean> {
      const nonce = window?.ccb_nonces?.ccb_get_preset || "";
      const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

      try {
        const params = new URLSearchParams({
          action: "ccb_get_preset",
          nonce,
          calc_id: String(calcId),
          selectedIdx: presetId,
        });

        const response = await axios.get(`${ajaxUrl}?${params.toString()}`);
        if (response.data?.success) {
          this.activePreset = {
            ...(response.data.data || {}),
            preset_key: presetId,
          };
          return true;
        }
      } catch (e) {
        console.error("Failed to apply preset", e);
      }

      return false;
    },

    async duplicatePresetOnly(
      calcId: number,
      presetId: string,
    ): Promise<string | null> {
      try {
        const nonce = window?.ccb_nonces?.ccb_duplicate_preset || "";
        const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
        const params = new URLSearchParams({
          action: "ccb_duplicate_preset",
          nonce,
          calc_id: String(calcId),
          selectedIdx: presetId,
        });
        const response = await axios.get(`${ajaxUrl}?${params.toString()}`);

        if (response.data?.success) {
          if (Array.isArray(response.data.list)) {
            this.presets = this.normalizePresets(response.data.list);
          }
          return response.data.new_preset_key || null;
        }
      } catch (e) {
        console.error("Failed to duplicate preset", e);
      }
      return null;
    },

    async extendBrandTheme(calcId: number, presetId: string): Promise<boolean> {
      try {
        const nonce = window?.ccb_nonces?.ccb_duplicate_preset || "";
        const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";
        const params = new URLSearchParams({
          action: "ccb_duplicate_preset",
          nonce,
          calc_id: String(calcId),
          selectedIdx: presetId,
        });
        const response = await axios.get(`${ajaxUrl}?${params.toString()}`);

        if (response.data?.success) {
          if (Array.isArray(response.data.list)) {
            this.presets = this.normalizePresets(response.data.list);
          }

          const newKey = response.data.new_preset_key;
          if (newKey) {
            await this.previewPreset(calcId, newKey);
            await this.selectPreset(calcId, newKey);
          }

          toast.success("Theme duplicated successfully");
          return true;
        }
      } catch (e) {
        console.error("Failed to duplicate preset", e);
      }

      return false;
    },

    async selectPreset(calcId: number, presetId: string): Promise<boolean> {
      const nonce = window?.ccb_nonces?.ccb_select_preset || "";
      const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

      try {
        const params = new URLSearchParams({
          action: "ccb_select_preset",
          nonce,
          calc_id: String(calcId),
          selectedIdx: presetId,
        });
        const response = await axios.get(`${ajaxUrl}?${params.toString()}`);

        if (response.data?.success) {
          this.selectedPresetKey = String(
            response.data?.data?.selected_preset_key || presetId,
          );
          return true;
        }
      } catch (e) {
        console.error("Failed to select preset", e);
      }

      return false;
    },

    async deleteCustomPreset(
      calcId: number,
      presetId: string,
    ): Promise<boolean> {
      const nonce = window?.ccb_nonces?.ccb_delete_preset || "";
      const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

      try {
        const params = new URLSearchParams({
          action: "ccb_delete_preset",
          nonce,
          calc_id: String(calcId),
          selectedIdx: presetId,
        });
        const response = await axios.get(`${ajaxUrl}?${params.toString()}`);

        if (response.data?.success) {
          this.presets = this.presets.filter((item) => item.id !== presetId);

          const wasActive =
            this.selectedPresetKey === presetId ||
            this.activePreset?.preset_key === presetId;

          if (wasActive) {
            this.activePreset = {
              ...(response.data.data || {}),
              preset_key: "default",
            };
            this.selectedPresetKey = "default";
          }

          toast.success("Theme deleted successfully");
          return true;
        }
      } catch (e) {
        console.error("Failed to delete preset", e);
      }

      return false;
    },

    async resetSectionToDefault(
      sectionKey: string,
      additionalKeys?: string[],
    ): Promise<boolean> {
      const target = this.editingPreset ?? this.activePreset;
      if (!target) return false;

      const device = this.editorDevice;
      const nonce = window?.ccb_nonces?.ccb_get_preset || "";
      const ajaxUrl = (window as any).ajaxurl || "/wp-admin/admin-ajax.php";

      try {
        const params = new URLSearchParams({
          action: "ccb_get_preset",
          nonce,
          calc_id: "0",
          selectedIdx: "default",
        });

        const response = await axios.get(`${ajaxUrl}?${params.toString()}`);
        if (!response.data?.success || !response.data?.data) return false;

        const defaultPresetData = response.data.data;
        const preset = target as Record<string, any>;
        if (!preset[device] || typeof preset[device] !== "object") return false;

        const keysToReset = [sectionKey, ...(additionalKeys || [])];
        for (const key of keysToReset) {
          const defaultSection = defaultPresetData?.[device]?.[key];
          if (defaultSection) {
            preset[device][key] = JSON.parse(JSON.stringify(defaultSection));
          }
        }

        toast.success("Section reset to default");
        return true;
      } catch (e) {
        console.error("Failed to reset section", e);
        return false;
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppearanceStore, import.meta.hot));
}
