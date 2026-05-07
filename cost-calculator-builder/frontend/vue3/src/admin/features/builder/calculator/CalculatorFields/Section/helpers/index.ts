import { computed } from "vue";
import type { IField } from "@/admin/shared/types/fields.type";

type FieldWithMeta = IField & { hideAndLeaveTotal?: boolean };

export const useIsFieldHidden = () => {
  return computed(() => {
    return (field: FieldWithMeta) => {
      if (field?.hidden) {
        return !field.hidden;
      }

      if (field?.hideAndLeaveTotal) {
        return !field.hideAndLeaveTotal;
      }

      return true;
    };
  });
};
