<template>
  <Popup :show="show" overlay>
    <div class="ccb-discount-modal">
      <div class="ccb-discount-modal__body ccb-custom-scrollbar">
        <div class="ccb-discount-modal__section" style="width: 100%">
          <div class="ccb-discount-modal__section-header">
            <Text :text="modalTitle" size="mx" weight="bold" />
          </div>

          <div class="ccb-discount-modal__grid">
            <Input
              v-model="form.title"
              label="Discount title"
              placeholder="Enter discount title"
            />
            <Dropdown
              label="Activate discount"
              :items="periodOptions"
              v-model="form.schedule.period"
            />

            <Dropdown
              label="Show discount as"
              :items="viewTypeOptions"
              v-model="form.schedule.view_type"
            />

            <div
              class="ccb-discount-modal__date-field"
              v-if="form.schedule.period !== 'permanently'"
            >
              <Text
                text="Date"
                size="s"
                weight="regular"
                class="ccb-discount-modal__date-field-label"
              />
              <VueDatePicker
                v-model="getDateModel"
                :placeholder="getDateText"
                :range="isPeriod"
                :enable-time-picker="false"
                model-type="yyyy-MM-dd"
                :action-row="{ showPreview: false }"
                :auto-apply="true"
                :min-date="today"
              />
            </div>
          </div>
        </div>

        <div class="ccb-discount-modal__section">
          <Toggle
            v-model="form.is_promo"
            label="Add a promo code"
            size="m"
            weight="medium"
          />
          <div class="ccb-discount-modal__grid" v-if="form.is_promo">
            <Input
              v-model="form.promocode.promocode"
              label="Promocode"
              placeholder="PROMO10"
            />
            <Input
              :modelValue="String(form.promocode.promocode_count || '')"
              @update:modelValue="onPromocodeCountChange"
              label="Usage limit"
              placeholder="100"
            />
          </div>
          <Button
            v-if="form.is_promo"
            size="xs"
            type="blue-ghost"
            label="Generate a promo code"
            iconLeft="ccb-icon-ic_edit"
            @click="generateCode"
            class="ccb-discount-modal__generate-code"
          />
        </div>

        <div class="ccb-discount-modal__section">
          <div class="ccb-discount-modal__conditions-head">
            <Text text="Conditions" size="m" weight="bold" />
            <Button
              size="xs"
              type="green-ghost"
              label="Add condition"
              iconLeft="ccb-icon-ic_plus_big"
              @click="addCondition"
            />
          </div>

          <div
            class="ccb-discount-modal__condition"
            v-for="(condition, index) in form.conditions"
            :key="index"
          >
            <div class="ccb-discount-modal__condition-top">
              <Text :text="`Condition #${index + 1}`" size="m" weight="bold" />
              <button
                class="ccb-discount-modal__remove"
                @click="removeCondition(index)"
                :disabled="form.conditions.length === 1"
              >
                <i class="ccb-icon-close-x"></i>
              </button>
            </div>
            <div class="ccb-discount-modal__condition-content">
              <MultiSelect
                :modelValue="condition.totals.map((total) => total.alias)"
                @update:modelValue="onConditionTotalsChange(index, $event)"
                label="Totals"
                :items="totalsOptions"
                placeholder="Choose totals"
              />

              <div class="ccb-discount-modal__grid">
                <Dropdown
                  label="Condition"
                  :items="symbolOptions"
                  v-model="condition.condition"
                />
                <Input
                  :modelValue="String(condition.over_price)"
                  @update:modelValue="onConditionOverPriceChange(index, $event)"
                  label="Price"
                  placeholder="100"
                />
              </div>

              <div class="ccb-discount-modal__grid">
                <Dropdown
                  label="Discount type"
                  :items="discountTypeOptions"
                  v-model="condition.discount_type"
                />
                <Input
                  :modelValue="String(condition.discount_amount)"
                  @update:modelValue="onConditionAmountChange(index, $event)"
                  :label="
                    condition.discount_type === 'percent_of_amount'
                      ? 'Discount amount in %'
                      : 'Discount amount'
                  "
                  placeholder="10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ccb-discount-modal__footer">
        <div class="ccb-discount-modal__errors" v-if="errors.length">
          <Text :text="errors[0]" size="s" weight="medium" />
        </div>
        <div class="ccb-discount-modal__actions">
          <Button size="m" type="default" label="Cancel" @click="closeModal" />
          <Button size="m" type="blue" label="Save" @click="saveDiscount" />
        </div>
      </div>
    </div>
  </Popup>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useDiscountsStore } from "@/admin/app/providers/stores/useDiscountsStore";
import type {
  IDiscountConditionForm,
  IDiscountForm,
  IDiscountTotalOption,
} from "@/admin/shared/types/discounts.type";
import {
  Popup,
  Text,
  Input,
  Button,
  Dropdown,
  Toggle,
  MultiSelect,
} from "@/admin/shared/ui/UIKit";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

interface IDiscountModalProps {
  show: boolean;
  calcId: number;
  modelValue: IDiscountForm | null;
}

const props = defineProps<IDiscountModalProps>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const discountsStore = useDiscountsStore();
const form = ref<IDiscountForm>(discountsStore.getDefaultDiscountForm());
const errors = ref<string[]>([]);

const cloneForm = (value: IDiscountForm): IDiscountForm =>
  JSON.parse(JSON.stringify(value)) as IDiscountForm;

watch(
  () => props.modelValue,
  (value) => {
    form.value = value
      ? cloneForm(value)
      : cloneForm(discountsStore.getDefaultDiscountForm());
    errors.value = [];
  },
  { immediate: true, deep: true },
);

const modalTitle = computed(() =>
  form.value.discount_id
    ? `Discount #${form.value.discount_id}`
    : "New discount",
);

const totalsOptions = computed<IDiscountTotalOption[]>(() =>
  discountsStore.getTotalsOptions(),
);

const periodOptions = [
  { label: "With a period", value: "period" },
  { label: "Single day", value: "single_day" },
  { label: "Forever", value: "permanently" },
];

const viewTypeOptions = [
  { label: "Text above total", value: "show_with_title" },
  { label: "Only discount value", value: "show_without_title" },
];

const symbolOptions = [
  { label: "Is over than", value: ">" },
  { label: "Is less than", value: "<" },
  { label: "Is equal", value: "=" },
];

const discountTypeOptions = [
  { label: "% of amount", value: "percent_of_amount" },
  { label: "Fixed amount", value: "fixed_amount" },
];

const normalizeDbDate = (value: string): string => {
  const raw = value.trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split("/");
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateModel = computed({
  get: () => {
    if (isPeriod.value) {
      const start = form.value.schedule.period_date.start;
      const end = form.value.schedule.period_date.end;
      if (
        (typeof start === "string" || typeof end === "string") &&
        start.trim() &&
        end.trim()
      ) {
        const normalizedStart = normalizeDbDate(start);
        const normalizedEnd = normalizeDbDate(end);
        return normalizedStart && normalizedEnd
          ? [normalizedStart, normalizedEnd]
          : [];
      }
      return [];
    }
    if (
      typeof form.value.schedule.single_date === "string" &&
      form.value.schedule.single_date.trim()
    ) {
      return normalizeDbDate(form.value.schedule.single_date);
    }
    return null;
  },
  set: (value: string | string[] | null) => {
    onDateChange(value);
  },
});

const today = computed(() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
});

const getDateText = computed(() => {
  return form.value.schedule.period === "period"
    ? "Choose period"
    : "Choose the day";
});

const isPeriod = computed(() => form.value.schedule.period === "period");

const onPromocodeCountChange = (value: string | number): void => {
  form.value.promocode.promocode_count = Number(value) || 0;
};

const onConditionTotalsChange = (
  index: number,
  value: Array<string | number>,
): void => {
  const aliases = value.map((item) => String(item));
  const condition = form.value.conditions[index];
  if (!condition) return;

  condition.totals = totalsOptions.value.filter((option) =>
    aliases.includes(option.alias),
  );
};

const onConditionOverPriceChange = (
  index: number,
  value: string | number,
): void => {
  const condition = form.value.conditions[index];
  if (!condition) return;
  condition.over_price = Number(value) || 0;
};

const onConditionAmountChange = (
  index: number,
  value: string | number,
): void => {
  const condition = form.value.conditions[index];
  if (!condition) return;
  condition.discount_amount = Number(value) || 0;
};

const onDateChange = (value: string | string[] | null): void => {
  if (Array.isArray(value)) {
    form.value.schedule.period_date.start = normalizeDbDate(value[0] || "");
    form.value.schedule.period_date.end = normalizeDbDate(value[1] || "");
  } else if (value) {
    form.value.schedule.single_date = normalizeDbDate(value);
  } else {
    form.value.schedule.period_date.start = "";
    form.value.schedule.period_date.end = "";
    form.value.schedule.single_date = "";
  }
};

const closeModal = (): void => {
  emit("close");
};

const addCondition = (): void => {
  form.value.conditions.push(discountsStore.getDefaultCondition());
};

const removeCondition = (index: number): void => {
  if (form.value.conditions.length <= 1) return;
  form.value.conditions = form.value.conditions.filter(
    (_, idx) => idx !== index,
  );
};

const generateCode = (): void => {
  form.value.promocode.promocode = discountsStore.generatePromoCode(10);
};

const normalizeCondition = (
  condition: IDiscountConditionForm,
): IDiscountConditionForm => ({
  totals: condition.totals,
  condition: condition.condition,
  over_price: Number(condition.over_price) || 0,
  discount_type: condition.discount_type,
  discount_amount:
    condition.discount_type === "free"
      ? 0
      : Number(condition.discount_amount) || 0,
});

const validate = (): boolean => {
  errors.value = [];

  if (form.value.is_promo) {
    if (!form.value.promocode.promocode.trim()) {
      errors.value.push("Promocode is required when promo mode is enabled");
    }
    if (Number(form.value.promocode.promocode_count) <= 0) {
      errors.value.push("Usage limit must be greater than 0");
    }
  }

  if (form.value.schedule.period === "period") {
    if (
      !form.value.schedule.period_date.start.trim() ||
      !form.value.schedule.period_date.end.trim()
    ) {
      errors.value.push("Start and end date are required for period mode");
    }
  }

  if (
    form.value.schedule.period === "single_day" &&
    !form.value.schedule.single_date.trim()
  ) {
    errors.value.push("Date is required for single day mode");
  }

  form.value.conditions.forEach((condition, index) => {
    if (!condition.totals.length) {
      errors.value.push(
        `Condition ${index + 1}: at least one total is required`,
      );
    }
    if (Number.isNaN(Number(condition.over_price))) {
      errors.value.push(`Condition ${index + 1}: price must be a valid number`);
    }
    if (
      condition.discount_type !== "free" &&
      Number.isNaN(Number(condition.discount_amount))
    ) {
      errors.value.push(
        `Condition ${index + 1}: discount amount must be a valid number`,
      );
    }
  });

  return errors.value.length === 0;
};

const saveDiscount = async (): Promise<void> => {
  if (!props.calcId) return;
  if (!validate()) return;

  const payload: IDiscountForm = {
    ...form.value,
    conditions: form.value.conditions.map((condition) =>
      normalizeCondition(condition),
    ),
  };

  const isUpdated = Boolean(payload.discount_id);
  const success = isUpdated
    ? await discountsStore.updateDiscount(props.calcId, payload)
    : await discountsStore.createDiscount(props.calcId, payload);

  if (!success) return;

  emit("saved");
};
</script>

<style scoped lang="scss">
.ccb-discount-modal {
  max-height: calc(100vh - 164px);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--ccb-font-labels);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--ccb-bw-dull-normal);
  }

  &__close {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--ccb-font-comment);
    cursor: pointer;
  }

  &__body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    padding-right: 2px;
  }

  &__section {
    background: var(--ccb-bgr-sidebar);
    border-radius: 12px;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__date-field {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
  }

  &__date-field-label {
    color: var(--ccb-font-comment);
    padding-left: 16px;
  }

  &__conditions-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__condition {
    border: 1px solid var(--ccb-bw-dull-normal);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    background: var(--ccb-input-normal);
  }

  &__condition-content {
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    border-radius: var(--box, 16px);
    background: rgba(68, 80, 207, 0.08);
    padding: 12px;
  }

  &__condition-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
  }

  &__remove {
    border: none;
    background: transparent;
    color: var(--ccb-font-comment);
    cursor: pointer;
  }

  &__generate-code {
    width: max-content;
    padding: 0 20px;
  }

  &__footer {
    flex: 0 0 auto;
    border-top: 1px solid var(--ccb-bw-dull-normal);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 12px;
  }

  &__errors {
    color: var(--ccb-red-bg-normal);
  }

  &__actions {
    display: flex;
    align-items: center;
    column-gap: 8px;
    margin-left: auto;
  }
}

:deep(.dp__input_wrap) {
  .dp__input {
    min-height: 40px;
    border-radius: 12px;
    border: 1px solid var(--ccb-input-border);
    background: var(--ccb-input-normal);
    color: var(--ccb-font-labels);
    font-size: 14px;
    line-height: 20px;
  }
}

@media (max-width: 860px) {
  .ccb-discount-modal {
    &__grid {
      grid-template-columns: 1fr;
    }
  }
}

.dp-input {
  border: none !important;
}
</style>
