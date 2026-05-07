<template>
  <div class="ccb-pagination">
    <div class="ccb-pagination__controls">
      <button
        class="page-btn page-arrow"
        :class="{ disabled: currentPage === 1 }"
        @click="prevPage"
      >
        <i class="ccb-icon-Left"></i>
      </button>
      <template v-for="page in pages" :key="page">
        <template v-if="page === currentPage">
          <span class="current-page">{{ page }}</span>
        </template>
        <template v-else>
          <button
            class="page-btn"
            :class="{ disabled: page === '...', 'ccb-dots': page === '...' }"
            @click="setPage(page as number)"
          >
            {{ page }}
          </button>
        </template>
      </template>
      <button
        class="page-btn page-arrow"
        :class="{ disabled: currentPage === totalPages }"
        @click="nextPage"
      >
        <i class="ccb-icon-Left" style="transform: rotate(180deg)"></i>
      </button>
    </div>
    <div class="ccb-pagination__per-page">
      <div
        ref="dropdownRef"
        class="ccb-page-size-select"
        :class="{ open: isDropdownOpen }"
      >
        <button class="ccb-page-size-select__trigger" @click="toggleDropdown">
          <span>{{ pageSize }}</span>
          <i
            class="ccb-icon-ic_caret_up"
            :class="{ rotated: isDropdownOpen }"
          ></i>
        </button>
        <ul v-if="isDropdownOpen" class="ccb-page-size-select__menu">
          <li
            v-for="option in pageSizeOptions"
            :key="option"
            :class="{ active: pageSize === option }"
            @click="selectPageSize(option)"
          >
            {{ option }}
          </li>
        </ul>
      </div>
      <Text text="per page" size="s" weight="regular" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { debounce } from "@/common/shared/utils/useDebounce";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import { Text } from "@/admin/shared/ui/UIKit";

const flowStore = useFlowStore();

const pageSize = ref<number>(10);
const currentPage = ref<number>(1);
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const pageSizeOptions = [10, 20, 50, 100];

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectPageSize = (option: number) => {
  pageSize.value = option;
  isDropdownOpen.value = false;
  updateCurrentPage();
};

const onClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  const savedPage = localStorage.getItem("flow_current_page");
  const savedPageSize = localStorage.getItem("flow_page_size");
  if (savedPage) currentPage.value = parseInt(savedPage, 10) || 1;
  if (savedPageSize) pageSize.value = parseInt(savedPageSize, 10) || 10;
  document.addEventListener("click", onClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", onClickOutside);
});

const handleUpdateCurrentPage = debounce(() => {
  localStorage.setItem("flow_current_page", String(currentPage.value));
  localStorage.setItem("flow_page_size", String(pageSize.value));
  flowStore.fetchCalculators();
}, 500);

const updateCurrentPage = () => {
  handleUpdateCurrentPage();
};

const totalPages = computed(() => {
  const size = Math.ceil(flowStore.getTotal / pageSize.value);
  if (currentPage.value > size) {
    currentPage.value = 1;
    updateCurrentPage();
  }
  return size > 0 ? size : 1;
});

function getPagination(
  current: number,
  total: number,
  delta = 1,
): (number | "...")[] {
  const range: number[] = [];
  const rangeWithDots: (number | "...")[] = [];
  let l: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l !== undefined && i - l > 1) {
      rangeWithDots.push("...");
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

const pages = computed(() =>
  getPagination(currentPage.value, totalPages.value),
);

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    updateCurrentPage();
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    updateCurrentPage();
  }
};

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;

    updateCurrentPage();
  }
};
</script>

<style scoped lang="scss">
.ccb-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0px;
  background: transparent !important;
  flex: 1;
  position: absolute;
  bottom: 0;

  &__controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__per-page {
    display: flex;
    align-items: center;
    gap: 8px;

    .ccb-text {
      color: var(--ccb-bw-disabled);
    }

    .ccb-page-size-select {
      position: relative;

      &__trigger {
        display: flex;
        align-items: center;
        gap: 6px;
        min-height: 24px;
        height: 32px;
        line-height: 1;
        border-radius: 20px;
        border: none;
        padding: 8px 16px;
        font-size: 13px;
        color: var(--ccb-button-bw-normal);
        background: var(--ccb-bw-dull-normal);
        cursor: pointer;
        transition: var(--ccb-transition-normal);

        i {
          font-size: 8px;
          transition: transform 0.2s;
        }

        &:hover {
          background: var(--ccb-bw-dull-hover);
        }
      }

      .rotated {
        transform: rotate(180deg);
      }

      &__menu {
        position: absolute;
        bottom: calc(100% + 4px);
        left: 0;
        min-width: 100%;
        background: var(--ccb-bgr-menu);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        padding: 4px 0;
        margin: 0;
        list-style: none;
        z-index: 10;

        li {
          padding: 6px 16px;
          font-size: 13px;
          cursor: pointer;
          color: var(--ccb-button-bw-normal);
          transition: background 0.15s;

          &:hover {
            background: var(--ccb-bw-dull-hover);
          }

          &.active {
            color: var(--ccb-blue-fg-normal);
            background: var(--ccb-blue-bg-dull-normal);
          }
        }
      }
    }
  }

  .page-btn {
    padding: 0 8px;
    height: 32px;
    min-width: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: var(--ccb-font-labels);
    border-radius: 50%;
    border: none;
    background: transparent;
    &:hover {
      background: var(--ccb-blue-bg-dull-hover);
    }

    i {
      font-size: 8px;
    }

    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
    }

    &.ccb-dots {
      border: none;
      background: transparent;
      color: #6b7280;
    }

    &.page-arrow {
      background: var(--ccb-bw-dull-normal);
      margin: 0 12px;

      &:hover {
        background: var(--ccb-bw-dull-hover);
      }
    }
  }

  .current-page {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ccb-blue-fg-normal);
    background: var(--ccb-blue-bg-dull-normal);
    border: none;
  }
}
</style>
