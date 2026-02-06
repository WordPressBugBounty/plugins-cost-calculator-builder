import { defineStore } from "pinia";
import { convertKeysToCamelCase } from "@/widget/shared/utils/convert-case-to-camel-case.utils";
import { IOrdersTranslations } from "@/orders/shared/types/translations.type";

type TranslationsState = {
  translations: IOrdersTranslations;
};

export const useOrdersTranslationsStore = defineStore(
  "orders_translations_store",
  {
    state: (): TranslationsState => ({
      translations: {} as IOrdersTranslations,
    }),
    actions: {
      initTranslations(translations: IOrdersTranslations): void {
        this.translations = convertKeysToCamelCase(translations);
      },
    },
    getters: {
      getTranslations: (state: TranslationsState): IOrdersTranslations =>
        state.translations,
    },
  },
);
