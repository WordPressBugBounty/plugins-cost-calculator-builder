<template>
  <div
    class="multiselect-overlay"
    v-if="showDropdown"
    @click="showDropdown = false"
  ></div>
  <div
    class="ccb-total-multiselect"
    :class="{ [className || '']: true, 'ccb-multiselect-active': showDropdown }"
  >
    <div
      class="ccb-total-multiselect__label"
      v-if="label"
      @click="toggleDropdown"
    >
      <Text :text="translatedLabel" size="s" weight="regular" />
      <span class="ccb-total-multiselect__required" v-if="required">*</span>
    </div>

    <div class="ccb-total-multiselect-input" @click="toggleDropdown">
      <div
        class="ccb-total-multiselect-input__chips"
        :class="{ 'is-empty': selectedAliases.length === 0 }"
      >
        <template v-if="selectedAliases.length">
          <div v-if="selectedAliases.length > maxItems">
            <Text :text="selectedCountText" size="m" weight="medium" />
          </div>
          <div
            v-else
            v-for="chip in selectedItems"
            :key="chip.alias"
            class="ccb-total-multiselect-chip"
            @click.stop
          >
            <i class="ccb-icon-ic_calculator"></i>
            <span class="ccb-total-multiselect-chip__text">{{
              chip.title || chip.label || ""
            }}</span>
            <button
              type="button"
              class="ccb-total-multiselect-chip__remove"
              @click="remove(getItemValue(chip))"
            ></button>
          </div>
        </template>
        <template v-else>
          <Text :text="placeholder || ''" size="m" weight="medium" />
        </template>
      </div>
      <span
        class="ccb-total-multiselect-input__icon"
        :class="{ 'is-open': showDropdown }"
      >
        <i class="ccb-icon-ic_caret_down"></i>
      </span>

      <transition name="dropdown">
        <div
          class="ccb-total-multiselect-options"
          v-if="showDropdown"
          @click.stop
          @mousedown.stop
        >
          <div
            class="ccb-total-multiselect-options__list"
            @click.stop
            @mousedown.stop
          >
            <label
              v-for="opt in checkboxOptions"
              :key="String(opt.value)"
              class="ccb-total-multiselect-option"
              :class="{
                'ccb-total-multiselect-option--disabled': isOptionDisabled(
                  opt.value,
                ),
              }"
              @click.stop
              @mousedown.stop
            >
              <input
                type="checkbox"
                class="ccb-total-multiselect-option__input"
                :checked="isChecked(opt.value)"
                :disabled="isOptionDisabled(opt.value)"
                @change="onOptionChange($event, opt.value)"
              />
              <span class="ccb-total-multiselect-option__box">
                <span
                  v-if="isChecked(opt.value)"
                  class="ccb-total-multiselect-option__checkmark"
                ></span>
              </span>
              <span class="ccb-total-multiselect-option__label">{{
                translateText(opt.label)
              }}</span>
            </label>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, watch } from "vue";
import type {
  IMultiSelect,
  IMultiSelectOption,
} from "@/admin/shared/types/uikit.type";
import Text from "./Text.vue";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { translateAdminText } from "@/admin/shared/utils/translate-admin-text.utils";

const props = defineProps<IMultiSelect>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Array<string | number>): void;
  (e: "change", name: string, value: Array<string | number>): void;
}>();

const {
  items,
  modelValue,
  label,
  required,
  placeholder,
  name,
  className,
  maxItemsShown,
  maxItemsSelected,
} = toRefs(props);
const translationsStore = useBuilderTranslationsStore();

const showDropdown = ref(false);

const selectedAliases = ref<Array<string | number>>([]);

const maxItems = computed(() => {
  if (typeof maxItemsShown.value === "undefined") {
    return (items.value || []).length;
  }
  return maxItemsShown.value;
});

const checkboxOptions = computed(() => {
  return (items.value || []).map((it) => ({
    label: it.title || it.label || "",
    value: (it.alias || it.value) as string | number,
  }));
});

const translateText = (value: string): string =>
  translateAdminText(value, translationsStore.getTranslations);

const translatedLabel = computed(() => translateText(label.value || ""));

const getItemValue = (item: IMultiSelectOption): string | number =>
  (item.alias || item.value) as string | number;

const selectedCountText = computed(
  () =>
    `${selectedAliases.value.length} ${translateText("option(s) selected")}`,
);

const selectedItems = computed((): IMultiSelectOption[] => {
  const set = new Set(selectedAliases.value);
  return (items.value || []).filter((it) => {
    return set.has(getItemValue(it));
  });
});

const emitValue = () => {
  emit("update:modelValue", [...selectedAliases.value]);
  emit("change", name.value || "", [...selectedAliases.value]);
};

const remove = (value: string | number) => {
  selectedAliases.value = selectedAliases.value.filter(
    (v) => String(v) !== String(value),
  );
  emitValue();
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const isChecked = (value: string | number) => {
  return selectedAliases.value.some((x) => x === value);
};

const isMaxSelected = computed(() => {
  if (typeof maxItemsSelected.value === "undefined") {
    return false;
  }
  return selectedAliases.value.length >= maxItemsSelected.value;
});

const isOptionDisabled = (value: string | number) => {
  if (typeof maxItemsSelected.value === "undefined") {
    return false;
  }
  if (isChecked(value)) {
    return false;
  }
  return isMaxSelected.value;
};

const onOptionChange = (e: Event, value: string | number) => {
  const target = e.target as HTMLInputElement;
  const checked = target.checked;
  if (checked) {
    if (isChecked(value)) {
      return;
    }
    if (isMaxSelected.value) {
      target.checked = false;
      return;
    }
    selectedAliases.value = [...selectedAliases.value, value];
  } else {
    selectedAliases.value = selectedAliases.value.filter((x) => x !== value);
  }
  emitValue();
};

watch(
  () => modelValue.value,
  (value) => {
    const next = Array.isArray(value) ? value : [];
    const allowed = new Set((items.value || []).map((i) => i.alias || i.value));
    let filtered = next.filter((a) => allowed.has(a)) as Array<string | number>;

    if (
      typeof maxItemsSelected.value !== "undefined" &&
      filtered.length > maxItemsSelected.value
    ) {
      filtered = filtered.slice(0, maxItemsSelected.value);
    }

    selectedAliases.value = filtered;
  },
  { immediate: true, deep: true },
);
</script>

<style lang="scss">
.multiselect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 999;
}

.ccb-total-multiselect {
  position: relative;
  width: 100%;

  &.ccb-multiselect-active {
    z-index: 9999;
  }

  &__label {
    color: var(--ccb-font-comment);
    cursor: pointer;
    transition: var(--ccb-transition-normal);
    padding-left: 16px;
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    gap: 4px;
  }

  &__required {
    color: var(--ccb-red-bg-normal);
  }
}

.ccb-total-multiselect-input {
  position: relative;
  background-color: var(--ccb-input-normal);
  transition: var(--ccb-transition-normal);
  border-radius: 12px;
  border: 1px solid var(--ccb-input-border);
  padding: 6px 8px 6px 16px;
  cursor: pointer;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    width: 100%;

    &.is-empty {
      .ccb-total-multiselect-input__placeholder {
        color: var(--ccb-font-comment);
      }
    }
  }

  &__placeholder {
    color: var(--ccb-font-comment);
    padding-left: 4px;
  }

  &__icon {
    font-size: 12px;
    color: var(--ccb-font-comment);
    transition: var(--ccb-transition-normal);
  }

  &__icon.is-open {
    transform: rotate(180deg);
  }
}

.ccb-total-multiselect-options {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 100%;
  background-color: var(--ccb-bgr-menu);
  border-radius: 12px;
  border: 1px solid var(--ccb-input-border);
  overflow: hidden;
  z-index: 9;
  padding: 8px;
}

.ccb-total-multiselect-options__list {
  display: grid;
  gap: 8px;
}

.ccb-total-multiselect-option {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  padding: 14px 16px;
  border-radius: 8px;

  &:hover {
    background-color: var(--ccb-blue-bg-dull-hover);
  }

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      background-color: transparent;
    }
  }

  &__input {
    opacity: 0;
    position: absolute;
    width: 0;
    height: 0;
    margin: 0;
  }

  &__box {
    width: 18px;
    height: 18px;
    border: 2px solid var(--ccb-border-normal);
    border-radius: 6px;
    background: var(--ccb-input-normal);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    transition: var(--ccb-transition-normal);
  }

  &__checkmark {
    position: absolute;
    display: block;
    width: 9px;
    height: 5px;
    border: solid var(--ccb-font-labels);
    border-width: 0 0px 1px 1px;
    transform: rotate(-45deg);
    top: 23%;
    left: 3px;
    transition: border-color var(--ccb-transition-normal);
  }

  &__label {
    font-size: 14px;
    color: var(--ccb-font-labels);
  }
}

.ccb-total-multiselect-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--ccb-blue-bg-dull-hover);
  border-radius: 10px;
  padding: 6px 8px;
  line-height: 1;

  &__text {
    font-size: 14px;
    color: var(--ccb-font-labels);
  }

  &__remove {
    border: none;
    background: transparent;
    color: var(--ccb-font-comment);
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
  }
}

/* Transition like Dropdown */
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition: var(--ccb-transition-normal);
}
.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
