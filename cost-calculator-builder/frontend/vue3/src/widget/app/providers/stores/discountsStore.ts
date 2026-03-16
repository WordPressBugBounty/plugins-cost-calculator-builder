import { defineStore } from "pinia";
import {
  IDiscount,
  OriginalDiscountsStore,
  DiscountsStore,
} from "@/widget/shared/types/discounts";
import { useDiscounts } from "@/widget/actions/discounts/composable/useDiscounts.ts";
import { convertKeysToCamelCase } from "@/widget/shared/utils/convert-case-to-camel-case.utils.ts";
import { IFormulaField } from "@/widget/shared/types/fields";
interface IDiscountsStore {
  discounts: DiscountsStore;
  promocodes: string[];
  originalDiscounts: OriginalDiscountsStore;
  originalPromocodes: string[];
}

export const useDiscountsStore = defineStore("discounts_store", {
  state: (): IDiscountsStore => ({
    discounts: {},
    promocodes: [],
    originalPromocodes: [],
    originalDiscounts: {},
  }),

  getters: {
    getUsedPromocodes(): string[] {
      return this.promocodes;
    },
    getOriginalPromocodes(): string[] {
      return this.originalPromocodes;
    },
    getOriginalDiscounts(): OriginalDiscountsStore {
      return this.originalDiscounts;
    },
    getDiscounts(): DiscountsStore {
      return this.discounts;
    },
    getPromocodes(): string[] {
      return this.promocodes;
    },
  },

  actions: {
    initDiscounts(discounts: IDiscount[] = []): void {
      const discountInstance = useDiscounts();
      discounts = convertKeysToCamelCase(discounts);
      discountInstance.addDiscounts(discounts);
    },

    applyDiscount(field: IFormulaField): IFormulaField {
      const discountInstance = useDiscounts();
      return discountInstance.applyDiscounts(field);
    },
    setPromocodes(promocodes: string[]): void {
      this.promocodes = promocodes;
    },
    setOriginalPromocodes(originalPromocodes: string[]): void {
      this.originalPromocodes = originalPromocodes;
    },
    setOriginalDiscounts(originalDiscounts: OriginalDiscountsStore): void {
      this.originalDiscounts = originalDiscounts;
    },
    setDiscounts(discounts: DiscountsStore): void {
      this.discounts = discounts;
    },
  },
});
