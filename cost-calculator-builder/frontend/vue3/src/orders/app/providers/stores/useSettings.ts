import { defineStore } from "pinia";
import { fetchPdfSettings } from "@/orders/shared/api/fetchSettings";
import { IFetchPdfSettingsResponse } from "@/orders/shared/types/api/response.type";
import { IPdfSettings } from "@/widget/shared/types/settings";
import { convertKeysToCamelCase } from "@/widget/shared/utils/convert-case-to-camel-case.utils";

interface ISettingsStore {
  pdfSettings: IPdfSettings;
}

export const useSettingsStore = defineStore("settings_store", {
  state: (): ISettingsStore => ({
    pdfSettings: {} as IPdfSettings,
  }),

  getters: {
    getPdfSettings: (state: ISettingsStore): IPdfSettings => state.pdfSettings,
  },

  actions: {
    setPdfSettings(settings: IPdfSettings): void {
      this.pdfSettings = convertKeysToCamelCase(settings) as IPdfSettings;
    },

    async fetchPdfSettingsData() {
      const response: IFetchPdfSettingsResponse = (await fetchPdfSettings({
        action: "ccb_get_pdf_settings",
        nonce: window?.ccb_nonces?.ccb_get_pdf_settings || "",
      })) as IFetchPdfSettingsResponse;

      if (response.success) {
        this.setPdfSettings(response.data.settings as IPdfSettings);
      }
    },
  },
});
