<template>
  <div class="ccb-submenu-wrapper" ref="wrapperRef">
    <div
      class="ccb-submenu"
      :style="{
        top: position.top ? position.top + 'px' : undefined,
        left: position.left ? position.left + 'px' : undefined,
        right: position.right ? position.right + 'px' : undefined,
        bottom: position.bottom ? position.bottom + 'px' : undefined,
      }"
    >
      <div class="ccb-submenu__list">
        <div
          class="ccb-submenu__list-item"
          :class="{
            [item.type as string]: true,
            'ccb-item-disabled': item.disabled,
          }"
          v-for="item in items"
          :key="item.label"
          @click="handleItemClick(item.onClick)"
        >
          <template v-if="!item.href">
            <div class="ccb-submenu__text">
              <i :class="item.icon" v-if="item.icon"></i>
              <Text :text="item.label" size="m" weight="medium" />
            </div>
          </template>
          <template v-else>
            <a
              :href="item.href"
              class="ccb-submenu__href"
              @click="closeDropdown"
            >
              <i :class="item.icon" v-if="item.icon"></i>
              <Text :text="item.label" size="m" weight="medium" />
            </a>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRefs } from "vue";
import Text from "./Text.vue";
import { ISubmenu } from "@/admin/shared/types/uikit.type";

const props = defineProps<ISubmenu>();
const emit = defineEmits<{
  (e: "close-dropdown"): void;
}>();
const { items, position } = toRefs(props);
const wrapperRef = ref<HTMLElement | null>(null);
let bindEventsTimeout: number | null = null;

const closeDropdown = () => {
  emit("close-dropdown");
};

const handleItemClick = (onClick?: () => void) => {
  onClick?.();
  closeDropdown();
};

const handleDocumentClick = (event: MouseEvent) => {
  if (!(event.target instanceof Node)) return;
  if (!wrapperRef.value?.contains(event.target)) {
    closeDropdown();
  }
};

const handleDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeDropdown();
  }
};

onMounted(() => {
  bindEventsTimeout = window.setTimeout(() => {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);
  }, 0);
});

onBeforeUnmount(() => {
  if (bindEventsTimeout !== null) {
    window.clearTimeout(bindEventsTimeout);
  }

  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleDocumentKeydown);
});
</script>

<style lang="scss" scoped>
.ccb-submenu-wrapper {
  position: relative;
  z-index: 9999;
}

.ccb-submenu {
  position: absolute;
  padding: 8px;
  transition: var(--ccb-transition-normal);
  background-color: var(--ccb-bgr-menu);
  border-radius: 8px;
  box-shadow: 0px 0px 32px 0px rgba(0, 0, 0, 0.25);
  top: 5px;
  z-index: 100000;

  &__list {
    &-item {
      color: var(--ccb-font-labels);
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 12px;
      width: 100%;
      border-radius: 8px;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background-color: var(--ccb-blue-bg-dull-hover);
      }

      &.red-ghost {
        color: var(--ccb-red-bg-normal);

        &:hover {
          background-color: var(--ccb-red-bg-dull-hover);
        }
      }
    }
  }

  .ccb-item-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__href {
    text-decoration: none;
    color: inherit !important;
    outline: none !important;
    box-shadow: none !important;
    height: 100%;
    width: 100%;
    padding: 14px 24px;
    display: inline-block;
  }

  &__text {
    padding: 14px 24px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
  }
}
</style>
