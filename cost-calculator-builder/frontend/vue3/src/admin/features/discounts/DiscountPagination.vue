<template>
  <div class="ccb-discount-pagination">
    <div class="ccb-discount-pagination__controls">
      <button
        class="page-btn page-arrow"
        :class="{ disabled: currentPage <= 1 }"
        @click="emitPage(currentPage - 1)"
      >
        <i class="ccb-icon-Left"></i>
      </button>

      <template v-for="page in pages" :key="String(page)">
        <span v-if="page === currentPage" class="current-page">{{ page }}</span>
        <button
          v-else
          class="page-btn"
          :class="{ disabled: page === '...', 'ccb-dots': page === '...' }"
          @click="onPageClick(page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        class="page-btn page-arrow"
        :class="{ disabled: currentPage >= totalPages }"
        @click="emitPage(currentPage + 1)"
      >
        <i class="ccb-icon-Left rotated"></i>
      </button>
    </div>

    <div class="ccb-discount-pagination__per-page">
      <select :value="String(perPage)" @change="onPerPageChange">
        <option
          v-for="option in perPageOptions"
          :key="option"
          :value="String(option)"
        >
          {{ option }}
        </option>
      </select>
      <Text text="per page" size="s" weight="regular" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Text } from "@/admin/shared/ui/UIKit";

interface IDiscountPaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  perPageOptions?: number[];
}

const props = withDefaults(defineProps<IDiscountPaginationProps>(), {
  perPageOptions: () => [5, 10, 15, 20, 50],
});

const emit = defineEmits<{
  (e: "page-change", page: number): void;
  (e: "per-page-change", limit: number): void;
}>();

function getPagination(
  current: number,
  total: number,
  delta = 1,
): Array<number | "..."> {
  const range: number[] = [];
  const rangeWithDots: Array<number | "..."> = [];
  let previous: number | undefined;

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    }
  }

  for (const page of range) {
    if (previous !== undefined && page - previous > 1) {
      rangeWithDots.push("...");
    }
    rangeWithDots.push(page);
    previous = page;
  }

  return rangeWithDots;
}

const pages = computed<Array<number | "...">>(() =>
  getPagination(props.currentPage, props.totalPages),
);

const emitPage = (page: number): void => {
  if (page < 1 || page > props.totalPages) return;
  emit("page-change", page);
};

const onPageClick = (page: number | "..."): void => {
  if (page === "...") return;
  emitPage(page);
};

const onPerPageChange = (event: Event): void => {
  const value =
    Number((event.target as HTMLSelectElement).value) || props.perPage;
  emit("per-page-change", value);
};
</script>

<style scoped lang="scss">
.ccb-discount-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  background: transparent !important;
  column-gap: 12px;

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

    select {
      min-height: 24px;
      height: 32px;
      line-height: 1;
      border-radius: 20px;
      border: none;
      padding: 8px 16px;
      font-size: 13px;
      color: var(--ccb-button-bw-normal);
      background: var(--ccb-bw-dull-normal);
      box-shadow: none !important;
      outline: none !important;
      transition: var(--ccb-transition-normal);

      &:hover {
        background: var(--ccb-bw-dull-hover);
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
    pointer-events: none;
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

.rotated {
  transform: rotate(180deg);
}
</style>
