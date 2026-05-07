import type { IField } from "@/admin/shared/types/fields.type";
import { quantityDefaults } from "./quantity";
import { checkboxDefaults } from "./checkbox";
import { radioDefaults } from "./radio";
import { dropdownDefaults } from "./dropdown";
import { toggleDefaults } from "./toggle";
import { rangeDefaults } from "./range";
import { multiRangeDefaults } from "./multi-range";
import { textDefaults } from "./text";
import { totalDefaults } from "./total";
import { datePickerDefaults } from "./date-picker";
import { timePickerDefaults } from "./time-picker";
import { fileUploadDefaults } from "./file-upload";
import { htmlDefaults } from "./html";
import { dividerDefaults } from "./divider";
import { geolocationDefaults } from "./geolocation";
import { validatedFormDefaults } from "./validated-form";
import { imageRadioDefaults } from "./image-radio";
import { imageCheckboxDefaults } from "./image-checkbox";
import { imageDropdownDefaults } from "./image-dropdown";
import { groupDefaults } from "./group";
import { repeaterDefaults } from "./repeater";
import { normalizeFieldTypeKey } from "./type-convert";

export const FIELD_STRUCTURE_BY_TYPE: Record<string, Partial<IField>> = {
  quantity: quantityDefaults(),
  checkbox: checkboxDefaults(),
  "radio-button": radioDefaults(),
  "drop-down": dropdownDefaults(),
  toggle: toggleDefaults(),
  "range-button": rangeDefaults(),
  "multi-range": multiRangeDefaults(),
  "text-area": textDefaults(),
  Total: totalDefaults(),
  "date-picker": datePickerDefaults(),
  "time-picker": timePickerDefaults(),
  "file-upload": fileUploadDefaults(),
  html: htmlDefaults(),
  line: dividerDefaults(),
  geolocation: geolocationDefaults(),
  "validated-form": validatedFormDefaults(),
  "radio-with-image": imageRadioDefaults(),
  "checkbox-with-image": imageCheckboxDefaults(),
  "drop-down-with-image": imageDropdownDefaults(),
  group: groupDefaults(),
  repeater: repeaterDefaults(),
};

export function getStaticFieldStructure(type: string): Partial<IField> {
  const source = FIELD_STRUCTURE_BY_TYPE[normalizeFieldTypeKey(type)] || {};
  return JSON.parse(JSON.stringify(source));
}
