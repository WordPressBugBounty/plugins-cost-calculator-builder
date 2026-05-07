import { defineStore } from "pinia";

interface IFieldsStore {}

export const useFieldsStore = defineStore("fields_store", {
  state: (): IFieldsStore => ({}),

  getters: {},

  actions: {},
});
