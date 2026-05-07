import { defineStore } from "pinia";
import { ITotalSummarySettings } from "@/admin/shared/types/settings.type";

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
    setTotalSummary(totalSummary: ITotalSummarySettings): void {
      this.totalSummary = totalSummary;
    },
  },
});
