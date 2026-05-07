import { computed, watch } from "vue";

export interface IPricingRange {
  minQty: number;
  maxQty: number;
  unitPrice: number;
}

export type PricingStructure =
  | "no_discounts"
  | "tiered_discounts"
  | "cumulative_discounts"
  | "flat_rate_discounts";

export type BadgeVariant = "outlined" | "primary" | "solid";
export type BadgeFormat = "percent" | "symbol" | "symbol_and_percent";

export interface IPricingDraftSlice {
  pricingStructure: PricingStructure;
  pricingRanges: IPricingRange[];
  badgeText: string;
  badgeVariant: BadgeVariant;
  badgeFormat: BadgeFormat;
}

export const PRICING_STRUCTURE_ITEMS = [
  { value: "no_discounts", label: "Default" },
  { value: "tiered_discounts", label: "All Units Pricing" },
  { value: "cumulative_discounts", label: "Tiered Pricing" },
  { value: "flat_rate_discounts", label: "Flat Unit Price per Range" },
];

export const BADGE_FORMAT_ITEMS = (currency: string) => [
  { value: "percent", label: "%" },
  { value: "symbol", label: currency },
  { value: "symbol_and_percent", label: `${currency} & %` },
];

export const BADGE_VARIANT_ITEMS = [
  { value: "outlined", label: "Outlined" },
  { value: "primary", label: "Primary" },
  { value: "solid", label: "Solid" },
];

export function usePricingRanges(
  draft: IPricingDraftSlice,
  getMin: () => string,
  getMax: () => string,
) {
  const canAddPricingRange = computed<boolean>(() => {
    if (!Array.isArray(draft.pricingRanges)) return true;
    if (!draft.pricingRanges.length) return true;
    const last = draft.pricingRanges[draft.pricingRanges.length - 1];
    const lastMax = parseFloat(String(last.maxQty));
    const maxValue = parseFloat(getMax());
    if (!Number.isFinite(lastMax) || !Number.isFinite(maxValue)) return false;
    return lastMax < maxValue;
  });

  function clampPricingRange(
    idx: number,
    key: "maxQty" | "unitPrice",
    event?: Event,
  ): void {
    if (!Array.isArray(draft.pricingRanges)) return;

    const minValue = parseFloat(getMin());
    const maxValue = parseFloat(getMax());

    let raw: string | number =
      event && (event.target as HTMLInputElement)?.value != null
        ? (event.target as HTMLInputElement).value
        : draft.pricingRanges[idx][key];
    let val = parseFloat(String(raw));

    if (Number.isFinite(minValue) && !isNaN(val) && val < minValue) {
      val = minValue;
    }
    if (Number.isFinite(maxValue) && !isNaN(val) && val > maxValue) {
      val = maxValue;
    }

    if (key === "maxQty") {
      const curr = draft.pricingRanges[idx] || ({} as IPricingRange);
      const currMin = parseFloat(String(curr.minQty));
      if (Number.isFinite(currMin) && !isNaN(val) && val <= currMin) {
        const candidate = currMin + 1;
        val = Number.isFinite(maxValue)
          ? Math.min(candidate, maxValue)
          : candidate;
      }

      const nextIdx = idx + 1;
      if (draft.pricingRanges[nextIdx]) {
        let nextMin = Number.isFinite(val) ? val + 1 : currMin + 1;
        if (Number.isFinite(maxValue)) nextMin = Math.min(nextMin, maxValue);
        draft.pricingRanges[nextIdx].minQty = nextMin;

        const nextMax = parseFloat(String(draft.pricingRanges[nextIdx].maxQty));
        if (!Number.isFinite(nextMax) || nextMax < nextMin) {
          draft.pricingRanges[nextIdx].maxQty = nextMin;
        }
      }
    }

    draft.pricingRanges[idx][key] = val;
  }

  function addPricingRange(): void {
    if (!Array.isArray(draft.pricingRanges)) {
      draft.pricingRanges = [];
    }

    const minValue = parseFloat(getMin());
    const maxValue = parseFloat(getMax());

    if (!draft.pricingRanges.length) {
      const firstMax = Number.isFinite(maxValue) ? Math.min(maxValue, 10) : 10;
      draft.pricingRanges.push({
        minQty: Number.isFinite(minValue) ? minValue : 0,
        maxQty: firstMax,
        unitPrice: 0,
      });
      return;
    }

    const prev = draft.pricingRanges[draft.pricingRanges.length - 1];
    const prevMax = parseFloat(String(prev.maxQty)) || 0;
    const nextMin = prevMax + 1;
    const nextMax = Number.isFinite(maxValue) ? maxValue : prevMax + 10;
    if (Number.isFinite(maxValue) && nextMin > maxValue) return;

    draft.pricingRanges.push({
      minQty: nextMin,
      maxQty: nextMax,
      unitPrice: 0,
    });
  }

  function removePricingRange(idx: number): void {
    if (Array.isArray(draft.pricingRanges) && idx > 0) {
      draft.pricingRanges.splice(idx, 1);
    }
  }

  watch(getMin, (newMin) => {
    if (!Array.isArray(draft.pricingRanges) || !draft.pricingRanges.length)
      return;

    const minValue = parseFloat(String(newMin));
    const maxValue = parseFloat(getMax());
    if (!Number.isFinite(minValue)) return;

    draft.pricingRanges[0].minQty = minValue;

    let firstMax = parseFloat(String(draft.pricingRanges[0].maxQty));
    let minRequired = Number.isFinite(maxValue)
      ? Math.min(minValue + 1, maxValue)
      : minValue + 1;
    if (!Number.isFinite(firstMax) || firstMax < minRequired) {
      firstMax = minRequired;
    }
    if (Number.isFinite(maxValue) && firstMax > maxValue) {
      firstMax = maxValue;
    }
    draft.pricingRanges[0].maxQty = firstMax;

    for (let i = 1; i < draft.pricingRanges.length; i++) {
      const prevMax = parseFloat(String(draft.pricingRanges[i - 1].maxQty));
      let nextMin = Number.isFinite(prevMax)
        ? prevMax + 1
        : Number.isFinite(minValue)
          ? minValue + 1
          : 0;
      if (Number.isFinite(maxValue)) nextMin = Math.min(nextMin, maxValue);
      draft.pricingRanges[i].minQty = nextMin;

      let nextMax = parseFloat(String(draft.pricingRanges[i].maxQty));
      let nextMinRequired = Number.isFinite(maxValue)
        ? Math.min(nextMin + 1, maxValue)
        : nextMin + 1;
      if (!Number.isFinite(nextMax) || nextMax < nextMinRequired) {
        nextMax = nextMinRequired;
      }
      if (Number.isFinite(maxValue) && nextMax > maxValue) {
        nextMax = maxValue;
      }
      draft.pricingRanges[i].maxQty = nextMax;
    }
  });

  return {
    canAddPricingRange,
    clampPricingRange,
    addPricingRange,
    removePricingRange,
  };
}
