import { defineStore } from "pinia";

interface ICalculatorListStore {}

export const useCalculatorListStore = defineStore("calculator_list_store", {
  state: (): ICalculatorListStore => ({}),

  getters: {},

  actions: {},
});
