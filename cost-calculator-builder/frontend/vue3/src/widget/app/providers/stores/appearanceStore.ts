import { defineStore } from "pinia";

export interface AppearanceStore {
  boxStyle: string;
  descriptionPosition: string;
  loaderType: "";
  accentColor: string;
  svgColor: string;
  titleHide: boolean;
}

export const useAppearanceStore = defineStore("appearance", {
  state: (): AppearanceStore => ({
    boxStyle: "vertical",
    descriptionPosition: "after",
    accentColor: "",
    svgColor: "",
    loaderType: "",
    titleHide: false,
  }),

  getters: {
    getAppearanceBoxStyle: (state: AppearanceStore): string => state.boxStyle,
    getAppearanceDescriptionPosition: (state: AppearanceStore): string =>
      state.descriptionPosition,
    getAppearanceLoaderType: (state: AppearanceStore): string =>
      state.loaderType,
    getAppearanceAccentColor: (state: AppearanceStore): string =>
      state.accentColor,
    getAppearanceSvgColor: (state: AppearanceStore): string => state.svgColor,
    getAppearanceTitleHide: (state: AppearanceStore): boolean =>
      state.titleHide,
  },

  actions: {
    initAppearanceStore(data: AppearanceStore) {
      this.boxStyle = data.boxStyle;
      this.descriptionPosition = data.descriptionPosition;
      this.loaderType = data.loaderType;
      this.accentColor = data.accentColor;
      this.svgColor = data.svgColor;
      this.titleHide = data.titleHide;
    },
  },
});
