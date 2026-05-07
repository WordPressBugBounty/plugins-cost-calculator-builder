import { ref } from "vue";
import type {
  IDropdownOption,
  IRepeaterField,
} from "@/admin/shared/types/uikit.type";

export const formProviders = ref<IDropdownOption[]>([
  { label: "Cost Calculator", value: "cost-calculator" },
  { label: "Contact Form", value: "order-form" },
]);

export const formTypes = ref<IDropdownOption[]>([
  { label: "Cost Calculator", value: "cost-calculator" },
  { label: "Contact Form7", value: "contact-form" },
]);

export const orderSendEmailToSchema = ref<IRepeaterField[]>([
  {
    key: "email",
    placeholder: "Email",
    required: true,
    width: "1fr",
  },
  {
    key: "description",
    placeholder: "Description",
    width: "1fr",
    required: true,
  },
]);

export const additionalEmailsSchema = ref<IRepeaterField[]>([
  {
    key: "adminEmailAddress",
    placeholder: "Enter your email",
    required: true,
    width: "1fr",
  },
  {
    key: "emailDescription",
    placeholder: "Description",
    required: false,
    width: "1fr",
  },
]);

export const contactFormList = ref<IDropdownOption[]>([]);
