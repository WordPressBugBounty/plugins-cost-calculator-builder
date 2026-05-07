import { defineStore } from "pinia";
import { convertKeysToCamelCase } from "@/widget/shared/utils/convert-case-to-camel-case.utils.ts";
import { ITotalSummarySettings } from "@/widget/shared/types/app";

interface ITotalSummaryStore {
  totalSummary: ITotalSummarySettings | null;
}

export const useTotalSummaryStore = defineStore("total_summary_store", {
  state: (): ITotalSummaryStore => ({
    totalSummary: null,
  }),

  getters: {
    getTotalSummary: (
      state: ITotalSummaryStore,
    ): ITotalSummarySettings | null => state.totalSummary,
  },

  actions: {
    initTotalSummary(totalSummary: ITotalSummarySettings = {}): void {
      const convertedData = convertKeysToCamelCase(totalSummary);
      this.totalSummary = convertedData as ITotalSummarySettings;
    },
  },
});
