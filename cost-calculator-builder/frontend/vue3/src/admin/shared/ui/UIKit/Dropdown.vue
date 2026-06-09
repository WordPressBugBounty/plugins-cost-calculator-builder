<template>
  <div
    class="ccb-dropdown"
    :class="{
      'ccb-dropdown-open': showDropdown,
      'ccb-dropdown-variant-innerLabel': variant === 'innerLabel',
    }"
    ref="rootRef"
  >
    <div class="ccb-dropdown__label" @click="toggleDropdown" v-if="label">
      <Text :text="label" size="s" weight="regular" />
      <span class="ccb-dropdown__required" v-if="required">*</span>
    </div>

    <div class="ccb-dropdown-input">
      <div class="ccb-dropdown-input__wrapper" @click="toggleDropdown">
        <Text
          :text="getText(modelValue)"
          class="ccb-dropdown-input__text"
          size="m"
          weight="medium"
          :showOriginal="true"
        />
        <span class="ccb-dropdown-input__icon">
          <i class="ccb-icon-ic_caret_down"></i>
        </span>
      </div>

      <Teleport to="body">
        <transition name="dropdown">
          <div
            class="ccb-dropdown-options ccb-custom-scrollbar"
            v-if="showDropdown"
            :style="dropdownStyle"
            ref="optionsRef"
          >
            <div
              class="ccb-dropdown-options__item"
              :class="{ 'ccb-dropdown-options__item--disabled': item.disabled }"
              v-for="item in items"
              :key="item.value"
              @click="selectItem(item)"
            >
              <Text
                :text="item.label"
                size="m"
                weight="medium"
                :showOriginal="showOriginal"
              />
            </div>
          </div>
        </transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  toRefs,
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  nextTick,
} from "vue";
import Text from "./Text.vue";
import { IDropdown } from "@/admin/shared/types/uikit.type";

const props = defineProps<IDropdown>();
const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "change", name: string, value: any): void;
}>();

const { label, items, modelValue, required, name, variant, showOriginal } =
  toRefs(props);

const showDropdown = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const optionsRef = ref<HTMLElement | null>(null);

const dropdownStyle = ref<Record<string, string>>({});

const DROPDOWN_OFFSET = 4;
const DROPDOWN_VIEWPORT_PADDING = 8;
const DROPDOWN_OPEN_THRESHOLD = 120;

const updateDropdownPosition = () => {
  const inputEl = rootRef.value?.querySelector(".ccb-dropdown-input");
  if (!inputEl) return;

  const rect = inputEl.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const optionsEl = optionsRef.value;
  const estimatedHeight = optionsEl?.offsetHeight || 220;
  const availableBottom =
    viewportHeight - rect.bottom - DROPDOWN_VIEWPORT_PADDING;
  const availableTop = rect.top - DROPDOWN_VIEWPORT_PADDING;
  const openUpwards =
    availableBottom < Math.min(estimatedHeight, DROPDOWN_OPEN_THRESHOLD) &&
    availableTop > availableBottom;
  const availableSpace = openUpwards ? availableTop : availableBottom;
  const maxHeight = Math.max(availableSpace - DROPDOWN_OFFSET, 0);

  dropdownStyle.value = {
    position: "fixed",
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: "99999",
    maxHeight: `${maxHeight}px`,
    overflowY: "auto",
    top: openUpwards ? "auto" : `${rect.bottom + DROPDOWN_OFFSET}px`,
    bottom: openUpwards
      ? `${viewportHeight - rect.top + DROPDOWN_OFFSET}px`
      : "auto",
  };
};

const handleViewportChange = () => {
  if (!showDropdown.value) return;
  updateDropdownPosition();
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
};

const selectItem = (item: { value: string | number; disabled?: boolean }) => {
  if (item.disabled) return;

  const value = item.value;

  emit("update:modelValue", value);
  emit("change", name.value || "", value);

  showDropdown.value = false;
};

const onDocumentClick = (e: MouseEvent) => {
  if (!showDropdown.value) return;
  const root = rootRef.value;
  const options = optionsRef.value;
  if (e.target instanceof Node) {
    const clickedInsideRoot = root?.contains(e.target);
    const clickedInsideOptions = options?.contains(e.target);
    if (!clickedInsideRoot && !clickedInsideOptions) {
      showDropdown.value = false;
    }
  }
};

const onDocumentKeydown = (e: KeyboardEvent) => {
  if (!showDropdown.value) return;
  if (e.key === "Escape") {
    showDropdown.value = false;
  }
};

const getText = computed(() => {
  return (value: string | number) => {
    return (
      items.value.find((item) => item.value.toString() === value.toString())
        ?.label || "Select item"
    );
  };
});

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("scroll", handleViewportChange, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onDocumentKeydown);
  window.removeEventListener("resize", handleViewportChange);
  window.removeEventListener("scroll", handleViewportChange, true);
});
</script>

<style lang="scss">
.ccb-dropdown {
  &__label {
    color: var(--ccb-font-comment);
    cursor: pointer;
    transition: var(--ccb-transition-normal);
    padding-left: 16px;
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  &__required {
    color: var(--ccb-red-bg-normal);
    padding-left: 4px;
  }

  &-input {
    position: relative;
    background-color: var(--ccb-input-normal);
    transition: var(--ccb-transition-normal);
    border-radius: 12px;
    border: 1px solid var(--ccb-input-border);
    padding: 8px 16px;
    cursor: pointer;
    color: var(--ccb-font-labels);

    &__wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    &__icon {
      font-size: 10px;
      color: var(--ccb-font-comment);
      transition: var(--ccb-transition-normal);
    }

    &__text {
      color: var(--ccb-font-normal);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 100%;
      display: block;
    }
  }

  &-options {
    border-radius: 16px;
    overflow: hidden;
    background-color: var(--ccb-bgr-menu);
    padding: 8px;

    &__item {
      padding: 14px 16px;
      cursor: pointer;
      transition: var(--ccb-transition-normal);
      color: var(--ccb-font-labels);
      border-radius: 8px;

      &:hover {
        background-color: var(--ccb-blue-bg-dull-hover);
      }

      &--disabled {
        cursor: not-allowed;
        opacity: 0.5;
        pointer-events: none;

        &:hover {
          background-color: transparent;
        }
      }
    }
  }

  &.ccb-dropdown-open {
    .ccb-dropdown-input {
      .ccb-dropdown-input__icon {
        transform: rotate(180deg);
      }
    }
  }
}

.ccb-dropdown-variant-innerLabel {
  background: var(--ccb-input-normal);
  border-radius: 12px;

  .ccb-dropdown__label {
    padding-top: 4px;
    margin-bottom: 0;
  }

  .ccb-dropdown-input {
    padding: 4px 8px 4px 16px;
    background: transparent;
    border: none;
  }
}

/* Transition for dropdown options */
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
