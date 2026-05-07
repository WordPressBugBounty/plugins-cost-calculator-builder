import { computed } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import type { ITotalForSettings } from "@/admin/shared/types/fields.type";

const DEFAULT_FORMULA: ITotalForSettings = {
  idx: 0,
  title: "Total",
  alias: "default_total",
  pageId: "",
  sectionId: "",
};

export function useCommonSettings() {
  const builderStore = useBuilderStore();

  const totalFields = computed((): ITotalForSettings[] => {
    const elements = builderStore.getTotalElements;
    if (elements.length > 0) return elements;
    return [DEFAULT_FORMULA];
  });

  const isDefaultFormula = computed(
    (): boolean => builderStore.getTotalElements.length === 0,
  );

  const syncFormulas = (
    saved: { idx: number; title: string; alias?: string }[],
  ): { idx: number; title: string; alias: string }[] => {
    const available = totalFields.value;

    if (isDefaultFormula.value) {
      return [
        {
          idx: DEFAULT_FORMULA.idx,
          title: DEFAULT_FORMULA.title,
          alias: DEFAULT_FORMULA.alias,
        },
      ];
    }

    const cleaned = saved
      .map((f) => available.find((a) => a.alias === f.alias))
      .filter(Boolean) as ITotalForSettings[];

    if (cleaned.length > 0) {
      return cleaned.map((f) => ({
        idx: f.idx,
        title: f.title,
        alias: f.alias,
      }));
    }

    return [
      {
        idx: available[0].idx,
        title: available[0].title,
        alias: available[0].alias,
      },
    ];
  };

  return {
    totalFields,
    isDefaultFormula,
    syncFormulas,
  };
}
