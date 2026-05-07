<template>
  <div class="ccb-paginated-select" ref="rootRef">
    <div class="ccb-paginated-select__label" v-if="label">
      <Text :text="label" size="s" weight="medium" />
      <span
        class="ccb-paginated-select__tooltip"
        v-if="tooltip"
        :title="tooltip"
      >
        <i class="ccb-icon-circle-question"></i>
      </span>
    </div>

    <div
      class="ccb-paginated-select__trigger"
      :class="{ 'ccb-paginated-select__trigger--open': open }"
      @click="toggleDropdown"
    >
      <div class="ccb-paginated-select__display">
        <template v-if="displayText">
          <span
            class="ccb-paginated-select__chip"
            v-for="chip in displayChips"
            :key="chip"
            >{{ truncate(chip, 14) }}</span
          >
        </template>
        <span v-else class="ccb-paginated-select__placeholder">
          {{ placeholder || "Select..." }}
        </span>
      </div>
      <span class="ccb-paginated-select__arrow">
        <i class="ccb-icon-ic_caret_down"></i>
      </span>
    </div>

    <Teleport to="body">
      <transition name="dropdown">
        <div
          v-if="open"
          class="ccb-paginated-select__panel"
          :style="panelStyle"
          ref="panelRef"
          @click.stop
        >
          <div class="ccb-paginated-select__header">
            <input
              class="ccb-paginated-select__search"
              v-model="searchQuery"
              @input="onSearchInput"
              placeholder="Search..."
            />
            <div
              class="ccb-paginated-select__limit-wrap"
              :class="{ 'ccb-paginated-select__limit-wrap--open': limitOpen }"
            >
              <button
                type="button"
                class="ccb-paginated-select__limit"
                @click.stop="toggleLimitDropdown"
              >
                {{ limit }} per page
              </button>
              <span class="ccb-paginated-select__limit-arrow">
                <i class="ccb-icon-ic_caret_down"></i>
              </span>
              <transition name="dropdown">
                <div
                  v-if="limitOpen"
                  class="ccb-paginated-select__limit-menu"
                  @click.stop
                >
                  <button
                    v-for="opt in perPageOpts"
                    :key="opt"
                    type="button"
                    class="ccb-paginated-select__limit-option"
                    :class="{
                      'ccb-paginated-select__limit-option--active':
                        limit === opt,
                    }"
                    @click="onLimitChange(opt)"
                  >
                    {{ opt }} per page
                  </button>
                </div>
              </transition>
            </div>
          </div>

          <div class="ccb-paginated-select__list">
            <template v-if="items.length > 0">
              <div
                v-if="multiselect"
                class="ccb-paginated-select__item ccb-paginated-select__item--action"
                @click="onSelectAll"
              >
                Select / Unselect all
              </div>
              <div
                v-for="item in items"
                :key="item.id"
                class="ccb-paginated-select__item"
                :class="{
                  'ccb-paginated-select__item--selected': isSelected(item.id),
                }"
                @click="toggleItem(item)"
              >
                <span
                  class="ccb-paginated-select__checkbox"
                  :class="{
                    'ccb-paginated-select__checkbox--checked': isSelected(
                      item.id,
                    ),
                  }"
                  aria-hidden="true"
                ></span>
                <span class="ccb-paginated-select__item-label">
                  {{ truncate(item.label, 40) }}
                </span>
              </div>
            </template>
            <div v-else class="ccb-paginated-select__empty">
              {{ emptyMessage || "No items found" }}
            </div>

            <div v-if="loading" class="ccb-paginated-select__loading">
              Loading...
            </div>
          </div>

          <button
            v-if="hasMore && items.length > 0 && !loading"
            class="ccb-paginated-select__load-more"
            @click="onLoadMore"
          >
            Load more
          </button>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, toRefs } from "vue";
import Text from "./Text.vue";
import type { IPaginatedSelectItem } from "@/admin/shared/types/uikit.type";

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | Array<string | number>;
    items: IPaginatedSelectItem[];
    multiselect?: boolean;
    hasMore?: boolean;
    label?: string;
    placeholder?: string;
    emptyMessage?: string;
    tooltip?: string;
    loading?: boolean;
    name?: string;
    perPageOptions?: number[];
    selectedLabel?: string;
  }>(),
  {
    multiselect: true,
    hasMore: false,
    loading: false,
    perPageOptions: () => [5, 10, 15, 20],
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
  (e: "change", name: string, value: any): void;
  (e: "search", query: string): void;
  (e: "load-more"): void;
  (e: "limit-change", limit: number): void;
  (e: "select-all"): void;
}>();

const { items, multiselect, hasMore, label, tooltip, loading } = toRefs(props);

const perPageOpts = computed(() => props.perPageOptions);

const open = ref(false);
const limitOpen = ref(false);
const searchQuery = ref("");
const limit = ref(props.perPageOptions[0] || 5);
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const panelStyle = ref<Record<string, string>>({});
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

const selectedSet = computed((): Set<string | number> => {
  if (props.multiselect) {
    const arr = Array.isArray(props.modelValue) ? props.modelValue : [];
    return new Set(
      arr.filter((v) => v !== "" && v !== null && v !== undefined),
    );
  }
  if (props.modelValue != null && props.modelValue !== "") {
    return new Set([props.modelValue as string | number]);
  }
  return new Set();
});

const isSelected = (id: string | number): boolean => selectedSet.value.has(id);

const displayText = computed((): boolean => selectedSet.value.size > 0);

const displayChips = computed((): string[] => {
  const selected = Array.from(selectedSet.value);
  if (selected.length === 0) return [];

  const labels = selected
    .map((id) => props.items.find((it) => it.id === id)?.label)
    .filter(Boolean) as string[];

  if (!props.multiselect) {
    if (labels.length > 0) return [labels[0]];
    if (props.selectedLabel) return [props.selectedLabel];
    return [];
  }

  if (labels.length === 0 && selected.length > 0) {
    return [`${selected.length} selected`];
  }
  if (labels.length <= 2) return labels;
  return [`${selected.length} selected`];
});

const truncate = (text: string, max: number): string => {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + "...";
};

const updatePanelPosition = () => {
  const trigger = rootRef.value?.querySelector(
    ".ccb-paginated-select__trigger",
  );
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  panelStyle.value = {
    position: "fixed",
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${Math.max(rect.width, 280)}px`,
    zIndex: "99999",
  };
};

const toggleDropdown = () => {
  open.value = !open.value;
  if (open.value) {
    updatePanelPosition();
  } else {
    searchQuery.value = "";
    limitOpen.value = false;
  }
};

const toggleItem = (item: IPaginatedSelectItem) => {
  if (!props.multiselect) {
    emit("update:modelValue", item.id);
    emit("change", props.name || "", item.id);
    open.value = false;
    return;
  }

  const current = new Set(selectedSet.value);
  if (current.has(item.id)) {
    current.delete(item.id);
  } else {
    current.add(item.id);
  }
  const next = Array.from(current);
  emit("update:modelValue", next);
  emit("change", props.name || "", next);
};

const onSelectAll = () => {
  emit("select-all");
};

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    emit("search", searchQuery.value);
  }, 300);
};

const onLoadMore = () => {
  emit("load-more");
};

const toggleLimitDropdown = () => {
  limitOpen.value = !limitOpen.value;
};

const onLimitChange = (nextLimit: number) => {
  limit.value = nextLimit;
  limitOpen.value = false;
  emit("limit-change", limit.value);
};

const onDocumentClick = (e: MouseEvent) => {
  if (!open.value) return;
  if (!(e.target instanceof Node)) return;
  const clickedRoot = rootRef.value?.contains(e.target);
  const clickedPanel = panelRef.value?.contains(e.target);
  if (!clickedRoot && !clickedPanel) {
    open.value = false;
    limitOpen.value = false;
    searchQuery.value = "";
    emit("search", "");
  }
};

const onDocumentScroll = (e: Event) => {
  if (!open.value) return;
  const target = e.target;
  if (!(target instanceof Node)) return;
  const scrolledInsideRoot = rootRef.value?.contains(target);
  const scrolledInsidePanel = panelRef.value?.contains(target);
  if (scrolledInsideRoot || scrolledInsidePanel) return;
  open.value = false;
  limitOpen.value = false;
  searchQuery.value = "";
  emit("search", "");
};

const onDocumentKeydown = (e: KeyboardEvent) => {
  if (open.value && e.key === "Escape") {
    if (limitOpen.value) {
      limitOpen.value = false;
      return;
    }
    open.value = false;
    searchQuery.value = "";
  }
};

onMounted(() => {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
  document.addEventListener("scroll", onDocumentScroll, true);
  window.addEventListener("resize", onDocumentScroll);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocumentClick);
  document.removeEventListener("keydown", onDocumentKeydown);
  document.removeEventListener("scroll", onDocumentScroll, true);
  window.removeEventListener("resize", onDocumentScroll);
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<style lang="scss">
.ccb-paginated-select {
  position: relative;
  width: 100%;

  &__label {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-left: 16px;
    padding-bottom: 4px;
    color: var(--ccb-font-comment);
  }

  &__tooltip {
    color: var(--ccb-font-comment);
    cursor: help;
    font-size: 14px;
  }

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--ccb-input-normal);
    border-radius: 12px;
    padding: 8px 12px 8px 16px;
    cursor: pointer;
    min-height: 38px;
    transition: var(--ccb-transition-normal);
    border: 1px solid transparent;

    &:hover {
      background: var(--ccb-input-hover, var(--ccb-input-normal));
      border-color: var(--ccb-border-normal, #d1d5db);
    }

    &--open {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }

  &__display {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
    overflow: hidden;
  }

  &__chip {
    background: var(--ccb-blue-bg-dull-normal, #dbeafe);
    color: var(--ccb-font-labels);
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.4;
    white-space: nowrap;
  }

  &__placeholder {
    color: var(--ccb-font-comment);
    font-size: 14px;
  }

  &__arrow {
    color: var(--ccb-font-comment);
    font-size: 12px;
    flex-shrink: 0;
    margin-left: 8px;
    transition: var(--ccb-transition-normal);
  }

  &__trigger--open &__arrow {
    transform: rotate(180deg);
  }

  &__panel {
    background: var(--ccb-bgr-menu, #fff);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--ccb-blue-bg-dull-disabled, #e5e7eb);
  }

  &__search {
    flex: 1;
    border: 1px solid var(--ccb-border-normal, #d1d5db);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 13px;
    outline: none;
    background: var(--ccb-input-normal);
    color: var(--ccb-font-labels);
    min-width: 0;

    &:focus {
      border-color: var(--ccb-blue-bg-normal, #3b82f6);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.16);
    }
  }

  &__limit-wrap {
    position: relative;
    min-width: 118px;
    flex-shrink: 0;

    &--open .ccb-paginated-select__limit {
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.16);
    }

    &--open .ccb-paginated-select__limit-arrow {
      transform: translateY(-50%) rotate(180deg);
    }
  }

  &__limit {
    width: 100%;
    border: 1px solid var(--ccb-border-normal, #d1d5db);
    border-radius: 10px;
    padding: 7px 30px 7px 10px;
    font-size: 12px;
    font-weight: 500;
    background: var(--ccb-input-normal);
    color: var(--ccb-font-labels);
    cursor: pointer;
    outline: none;
    text-align: left;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  &__limit-arrow {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    pointer-events: none;
    color: var(--ccb-font-comment);
    font-size: 10px;
    transition:
      transform 0.2s ease,
      color 0.2s ease;
  }

  &__limit-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    left: 0;
    border: 1px solid var(--ccb-border-normal, #d1d5db);
    border-radius: 10px;
    overflow: hidden;
    background: var(--ccb-bgr-menu, #fff);
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
    z-index: 2;
  }

  &__limit-option {
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    padding: 8px 10px;
    font-size: 12px;
    color: var(--ccb-font-labels);
    cursor: pointer;
    transition:
      background 0.15s ease,
      color 0.15s ease;

    &:hover {
      background: var(--ccb-blue-bg-dull-normal, #eff6ff);
    }

    &--active {
      background: var(--ccb-blue-bg-dull-normal, #eff6ff);
      color: var(--ccb-blue-bg-normal, #3b82f6);
      font-weight: 600;
    }
  }

  &__list {
    max-height: 240px;
    overflow-y: auto;
    padding: 4px 0;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 13px;
    color: var(--ccb-font-labels);
    transition:
      background 0.15s ease,
      color 0.15s ease;

    &:hover {
      background: var(--ccb-blue-bg-dull-normal, #eff6ff);
    }

    &--selected {
      background: var(--ccb-blue-bg-dull-normal, #eff6ff);
      color: var(--ccb-font-default);
    }

    &--action {
      color: var(--ccb-blue-fg-normal, #3b82f6);
      font-weight: 500;
      border-bottom: 1px solid var(--ccb-blue-bg-dull-disabled, #e5e7eb);
    }
  }

  &__checkbox {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    position: relative;
    border-radius: 5px;
    border: 1px solid var(--ccb-border-normal, #cbd5e1);
    background: var(--ccb-input-normal, #fff);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease;

    &::after {
      content: "";
      width: 5px;
      height: 9px;
      border: solid var(--ccb-blue-bg-normal, #3b82f6);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) scale(0.7);
      opacity: 0;
      transition:
        transform 0.18s ease,
        opacity 0.18s ease;
    }

    &--checked {
      &::after {
        opacity: 1;
      }
    }
  }

  &__item-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ccb-font-labels);
  }

  &__empty,
  &__loading {
    padding: 16px 12px;
    text-align: center;
    color: var(--ccb-font-comment);
    font-size: 13px;
  }

  &__load-more {
    display: block;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-top: 1px solid var(--ccb-blue-bg-dull-disabled, #e5e7eb);
    background: transparent;
    color: var(--ccb-green-fg-normal, #16a34a);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    text-align: center;
    transition: background 0.15s;

    &:hover {
      background: var(--ccb-blue-bg-dull-normal, #eff6ff);
    }
  }
}
</style>
