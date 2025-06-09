import { defineStore } from "pinia";
import {
  ICondition,
  IConditionList,
  IConditionsStore,
} from "@/widget/shared/types/app";
import { useConditions } from "@/widget/actions/conditions/composable/useConditions.ts";
import { WooMetaAction } from "@/widget/shared/types/fields";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { useWooProducts } from "@/widget/actions/woo-products/composable/useWooProducts.ts";

interface IConditionsStoreResult {
  conditions: IConditionsStore;
  conditionsHistory: ICondition[];
}

const conditionInstance = useConditions();

export const useConditionsStore = defineStore("conditions", {
  state: (): IConditionsStoreResult => ({
    conditions: {} as IConditionsStore,
    conditionsHistory: [],
  }),

  actions: {
    setConditions(conditions: IConditionsStore): void {
      this.conditions = conditions;
    },

    initConditions(conditions: IConditionList[] = []): void {
      conditionInstance.addConditions(conditions);
    },

    initWooProductsConditions(): void {
      const settingsStore = useSettingsStore();
      const wooProducts = useWooProducts();
      const wooActions: WooMetaAction[] =
        settingsStore.getWooProductsSettings?.metaLinks || [];

      setTimeout(() => wooProducts.applyWooMetaActions(wooActions));
    },

    applyConditionForField(alias: string): void {
      conditionInstance.applyConditionForField(alias);
    },

    triggerCondition(): void {
      conditionInstance.triggerCondition();
    },

    updateConditionHistory(conditions: ICondition[]): void {
      this.conditionsHistory = conditions;
    },
  },

  getters: {
    getConditionHistory(): ICondition[] {
      return this.conditionsHistory;
    },
  },
});
