<template>
  <div class="ccb-calculator-row-wrapper">
    <div
      class="ccb-calculator-row"
      :class="{
        'ccb-calculator-row--checked': isChecked,
        'ccb-calculator-row--dropdown-open': showDropdown,
      }"
    >
      <Transition name="bounce">
        <div class="ccb-calculator-row__checkbox">
          <Checkbox
            :modelValue="isChecked"
            @change-single="toggleSelectCalculator(calculator.id)"
          />
        </div>
      </Transition>
      <div class="ccb-calculator-row__id">
        <Text
          :text="calculator.id ? calculator.id.toString() : ''"
          size="m"
          weight="regular"
        />
      </div>
      <div class="ccb-calculator-row__icon">
        <img :src="calculator.icon" alt="Calculator Preview" />
      </div>
      <div class="ccb-calculator-row__title" @click="editCalculator">
        <Text :text="calculator.title" size="l" weight="bold" />
      </div>
      <div class="ccb-calculator-row__actions">
        <div
          class="ccb-calculator-row__action ccb-dropdown-menu"
          @click.stop="toggleDropdown"
        >
          <i class="ccb-icon-ic_menu_v"></i>
          <Submenu
            :items="dropdownItems"
            :position="dropdownPosition"
            v-if="showDropdown"
            @close-dropdown="toggleDropdown"
          />
        </div>
        <div
          class="ccb-calculator-row__action edit"
          @click.stop="editCalculator"
        >
          <i class="ccb-icon-ic_edit"></i>
          <span>Edit</span>
        </div>
      </div>
    </div>

    <EmbedPopup
      v-if="isEmbedPopupOpen"
      :id="calculator.id"
      @close="isEmbedPopupOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from "vue";
import { Checkbox, Text, Submenu } from "@/admin/shared/ui/UIKit";
import { EmbedPopup } from "@/admin/shared/ui/components/EmbedPopup";
import { ICalculator } from "@/admin/shared/types/calculator.type";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";

interface ICalculatorRowProps {
  calculator: ICalculator;
}

const flowStore = useFlowStore();

const props = defineProps<ICalculatorRowProps>();
const { calculator } = toRefs(props);

const emit = defineEmits<{
  (e: "toggle-select-calculator", id: number): void;
  (e: "delete-calculator", id: number): void;
  (e: "duplicate-calculator", id: number): void;
  (e: "edit-calculator", id: number): void;
}>();

const showDropdown = ref<boolean>(false);
const isEmbedPopupOpen = ref<boolean>(false);
const dropdownPosition = ref({
  top: 2,
  right: 2,
});

const dropdownItems = ref([
  {
    label: "Embed",
    icon: "ccb-icon-ic_embed",
    onClick: () => {
      showDropdown.value = false;
      isEmbedPopupOpen.value = true;
    },
  },
  {
    label: "Duplicate",
    icon: "ccb-icon-ic_duplicate",
    onClick: () => {
      emit("duplicate-calculator", calculator.value.id);
    },
  },
  {
    label: "Delete",
    icon: "ccb-icon-ic_delete",
    type: "red-ghost",
    onClick: () => {
      emit("delete-calculator", calculator.value.id);
    },
  },
]);

const editCalculator = (): void => {
  emit("edit-calculator", calculator.value.id);
};

const toggleDropdown = (): void => {
  showDropdown.value = !showDropdown.value;
};

const isChecked = computed<boolean>(() => {
  return flowStore.getSelectedIds.includes(+calculator.value.id);
});

const toggleSelectCalculator = (id: number): void => {
  emit("toggle-select-calculator", id);
};
</script>

<style lang="scss">
.ccb-calculator-row-wrapper {
  width: 100%;
}

.ccb-calculator-row {
  display: flex;
  position: relative;
  z-index: 1;
  justify-content: flex-start;
  align-items: center;
  padding: 16px 24px;
  border-radius: 12px;
  background-color: transparent;
  color: var(--ccb-font-heads);
  cursor: pointer;
  transition: background-color var(--ccb-transition-normal);

  &__id {
    padding-left: 16px;
    min-width: 80px;
  }

  &--checked {
    background-color: var(--ccb-blue-bg-dull-normal);
  }

  &--dropdown-open {
    background-color: var(--ccb-bgr-overlay);
    z-index: 2;

    .ccb-calculator-row__actions {
      opacity: 1;
    }
  }

  &:hover {
    background-color: var(--ccb-bgr-overlay);

    .ccb-calculator-row__actions {
      opacity: 1;
    }
  }

  &__title {
    transition: color var(--ccb-transition-normal);
    color: var(--ccb-font-heads);
    padding-left: 40px;
  }

  &__actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 40px;
    margin-left: auto;
    opacity: 0;
    transition: opacity var(--ccb-transition-normal);
  }

  &__action {
    cursor: pointer;
    transition: color var(--ccb-transition-normal);
    color: var(--ccb-button-bw-normal);

    &:hover {
      color: var(--ccb-button-bw-hover);
    }

    &.ccb-dropdown-menu {
      position: relative;
    }

    &.edit {
      color: var(--ccb-blue-fg-normal);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;

      &:hover {
        color: var(--ccb-blue-fg-hover);
      }
    }
  }
}
</style>
