import { defineStore } from "pinia";

interface IAppStore {
  appLoader: boolean;
  isThankYouPage: boolean;
  calcId: number | null;
  title: string;
  dateFormat: string;
  submissionLoader: boolean;
  isLive: boolean;
  isProActive: boolean;
}

export const useAppStore = defineStore("app", {
  state: (): IAppStore => ({
    appLoader: true,
    isThankYouPage: false,
    calcId: null,
    title: "",
    dateFormat: "",
    submissionLoader: false,
    isLive: false,
    isProActive: false,
  }),

  getters: {
    getDateFormat: (state: IAppStore): string => state.dateFormat,
    getCalcTitle: (state: IAppStore): string => state.title,
    getCalcId: (state: IAppStore): number | null => state.calcId,
    getAppLoader: (state: IAppStore): boolean => state.appLoader,
    getThankYoyPageStatus: (state: IAppStore): boolean => state.isThankYouPage,
    getSubmissionLoader: (state: IAppStore): boolean => state.submissionLoader,
    getIsLive: (state: IAppStore): boolean => state.isLive,
    getProStatus: (state: IAppStore): boolean => state.isProActive,
  },

  actions: {
    setSubmissionLoader(value: boolean): void {
      this.submissionLoader = value;
    },

    setDateFormat(format: string): void {
      this.dateFormat = format;
    },

    setCalcId(id: number | null): void {
      this.calcId = id;
    },

    setCalcTitle(title: string): void {
      this.title = title;
    },

    updateAppLoader(value: boolean): void {
      this.appLoader = value;
    },

    updateThankYouPageStatus(value: boolean): void {
      this.isThankYouPage = value;
    },

    checkIfLive(): void {
      const currentUrl = window.location.href;
      const keywords = ["stylemixthemes"];

      this.isLive = keywords.some((keyword) => currentUrl.includes(keyword));
    },

    setProStatus(value: boolean): void {
      this.isProActive = value;
    },
  },
});
