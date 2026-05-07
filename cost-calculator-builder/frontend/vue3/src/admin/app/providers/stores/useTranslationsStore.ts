import { defineStore } from "pinia";
import { convertKeysToCamelCase } from "@/widget/shared/utils/convert-case-to-camel-case.utils";
import type { IBuilderTranslations } from "@/admin/shared/types/translations.type";

type TranslationsState = {
  translations: IBuilderTranslations;
};

export const useBuilderTranslationsStore = defineStore(
  "builder_translations_store",
  {
    state: (): TranslationsState => ({
      translations: {} as IBuilderTranslations,
    }),
    actions: {
      initTranslations(translations: IBuilderTranslations): void {
        this.translations = convertKeysToCamelCase(translations);
      },
    },
    getters: {
      getTranslations: (state: TranslationsState): IBuilderTranslations =>
        state.translations,
    },
  },
);
