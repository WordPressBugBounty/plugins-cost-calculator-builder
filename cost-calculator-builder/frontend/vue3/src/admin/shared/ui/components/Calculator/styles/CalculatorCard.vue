<template>
  <div class="ccb-calculator-card-wrapper">
    <div
      class="ccb-calculator-card"
      :class="{
        'ccb-calculator-card--checked': isChecked,
        'ccb-calculator-card--dropdown-open': showDropdown,
      }"
    >
      <div class="ccb-calculator-card__preview">
        <img :src="calculator.image" alt="Calculator Preview" />
      </div>
      <div class="ccb-calculator-card__footer">
        <div class="ccb-calculator-card__title">
          <Transition name="bounce">
            <Checkbox
              :modelValue="isChecked"
              @change-single="toggleSelectCalculator(calculator.id)"
            />
          </Transition>
          <Text :text="calculator.title" size="l" weight="bold" />
        </div>
        <div class="ccb-calculator-card__actions">
          <div
            class="ccb-calculator-card__action edit"
            @click.stop="editCalculator"
          >
            <i class="ccb-icon-ic_edit"></i>
            <span>Edit</span>
          </div>
          <div
            class="ccb-calculator-card__action ccb-dropdown-menu"
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
import { Submenu, Text, Checkbox } from "@/admin/shared/ui/UIKit";
import { EmbedPopup } from "@/admin/shared/ui/components/EmbedPopup";
import { ICalculator } from "@/admin/shared/types/calculator.type";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";

interface ICalculatorCardProps {
  calculator: ICalculator;
}

const flowStore = useFlowStore();

const props = defineProps<ICalculatorCardProps>();
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
  right: 0,
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
.ccb-calculator-card-wrapper {
  width: 100%;
}

.ccb-calculator-card {
  display: flex;
  position: relative;
  z-index: 1;
  flex-direction: column;
  border-radius: 16px;
  padding: 8px;
  background-color: var(--ccb-bgr-overlay);
  max-width: 290px;
  max-height: 290px;
  transition: background-color var(--ccb-transition-normal);
  cursor: pointer;

  &--checked {
    background-color: var(--ccb-blue-bg-dull-normal);
  }

  &--dropdown-open {
    z-index: 2;
  }

  &:hover {
    background-color: var(--ccb-blue-bg-dull-normal);
  }

  &__title {
    transition: color var(--ccb-transition-normal);
    color: var(--ccb-font-heads);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__preview {
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__footer {
    padding: 16px;
  }

  &__title {
    color: var(--ccb-font-heads);
    transition: color var(--ccb-transition-normal);
    margin-bottom: 8px;
  }

  &__actions {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  &__action {
    transition: color var(--ccb-transition-normal);
    cursor: pointer;
    color: var(--ccb-button-bw-normal);

    &:hover {
      color: var(--ccb-button-bw-hover);
    }

    &.ccb-dropdown-menu {
      position: relative;
    }

    &.edit {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      color: var(--ccb-blue-fg-normal);

      &:hover {
        color: var(--ccb-blue-fg-hover);
      }
    }
  }
}
</style>
