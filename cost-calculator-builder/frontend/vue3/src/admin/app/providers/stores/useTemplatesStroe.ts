import { defineStore } from "pinia";

interface ITemplatesStore {
  popularTemplates: string[];
}

export const useTemplatesStore = defineStore("templates_store", {
  state: (): ITemplatesStore => ({
    popularTemplates: [
      "ROI Calculator",
      "Cleaning Company",
      "Simple Mortgage Calculator",
      "Advanced Mortgage Calculator",
      "Loan Calculator",
      "Compound Interest Calculator",
      "Daily Calorie Intake Calculator",
      "Interior Design Quote",
      "BMI (Body Mass Index) Calculator",
      "Wedding Planner Estimate",
      "Car Wash",
      "Conversion Calculator",
      "Renovation",
      "Car Rental Form",
      "Discount Calculator",
      "Insurance Booking",
      "School Trip PayPal Payment",
      "Insurance Booking",
      "Venue Rental",
      "Savings and Investment Calculator",
      "Fuel Cost Calculator",
      "VAT Calculator",
      "Tip Calculator",
      "Funeral Home Company",
      "School Residential Payment",
      "Graphic Designing",
      "Property Viewing Booking Form",
    ],
  }),

  getters: {
    getPopularTemplates: (state: ITemplatesStore): string[] =>
      state.popularTemplates,
  },

  actions: {},
});
