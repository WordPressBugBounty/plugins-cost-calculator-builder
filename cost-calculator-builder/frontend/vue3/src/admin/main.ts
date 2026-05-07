import { createApp, App as VueApp } from "vue";
import App from "@/admin/app/App.vue";
import { createPinia } from "pinia";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";

import "@/styles/admin/global.scss";
import "@/styles/admin/builder/styles.scss";
import "vue3-toastify/dist/index.css";

const documentElement = document.querySelector("#calculator_admin");
documentElement
  ?.closest("#wpbody-content")
  ?.classList.add("ccb-calculator-admin-page");

const calcId = documentElement?.getAttribute("data-calc-id") || null;
const actionMode = documentElement?.getAttribute("data-action-mode") || false;
const currentPage = documentElement?.getAttribute("data-page") || "calculator";
const page = !calcId || !actionMode ? "flow" : "calculator";

const app: VueApp<Element> = createApp(App)
  .provide("calcId", calcId)
  .provide("editMode", actionMode === "edit")
  .provide("page", page)
  .provide("currentPage", currentPage);

const pinia = createPinia();
app.use(pinia);

app.use(Vue3Toastify, {
  autoClose: 3000,
} as ToastContainerOptions);

app.mount("#calculator_admin");
