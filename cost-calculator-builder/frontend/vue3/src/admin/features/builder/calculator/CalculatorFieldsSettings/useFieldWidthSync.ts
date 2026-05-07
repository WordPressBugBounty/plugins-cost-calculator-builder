import { watch } from "vue";
import type { IField } from "@/admin/shared/types/fields.type";
import { clampWidth } from "./field-settings.constants";

/**
 * Two-way sync between draft.width (sidebar Tab) and field.width (store).
 * - Drag resize in CalculatorContent updates field.width → draft picks it up.
 * - Sidebar Tab changes draft.width → field.width updates immediately.
 *
 * Width is compared numerically to avoid false writes from type coercion
 * (e.g. string "100" vs number 100).
 */
export function useFieldWidthSync(
  getField: () => IField,
  draft: { width: number },
) {
  watch(
    () => Number(getField().width),
    (storeWidth) => {
      const w = clampWidth(storeWidth);
      if (draft.width !== w) {
        draft.width = w;
      }
    },
  );

  watch(
    () => draft.width,
    (draftWidth) => {
      const field = getField();
      const w = clampWidth(draftWidth);
      if (Number(field.width) !== w) {
        field.width = w;
      }
    },
  );
}
