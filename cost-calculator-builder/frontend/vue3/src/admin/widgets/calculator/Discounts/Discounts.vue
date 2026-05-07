<template>
  <div class="ccb-calculator-discounts">
    <DiscountLists
      :calcId="calcId"
      @create="openCreate"
      @edit="openEdit"
      class="ccb-calculator-discounts__list"
    />

    <DiscountPagination
      class="ccb-calculator-discounts__pagination"
      :currentPage="currentPage"
      :totalPages="totalPages"
      :perPage="discountsStore.getDiscountList.limit"
      @page-change="setPage"
      @per-page-change="setPerPage"
      v-if="discountsStore.getDiscountsCount > 0"
    />

    <DiscountModal
      :show="discountsStore.getIsModalOpen"
      :modelValue="discountsStore.getActiveDiscount"
      :calcId="calcId"
      @close="discountsStore.closeModal()"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCalculatorStore } from "@/admin/app/providers/stores/useCalculatorStore";
import { useDiscountsStore } from "@/admin/app/providers/stores/useDiscountsStore";
import DiscountLists from "@/admin/features/discounts/DiscountLists.vue";
import DiscountModal from "@/admin/features/discounts/DiscountModal.vue";
import DiscountPagination from "@/admin/features/discounts/DiscountPagination.vue";

const calculatorStore = useCalculatorStore();
const discountsStore = useDiscountsStore();

const calcId = computed<number>(() => Number(calculatorStore.getId) || 0);
const currentPage = computed<number>(() => discountsStore.getDiscountList.page);
const totalPages = computed<number>(() => discountsStore.getTotalPages);

const openCreate = (): void => {
  discountsStore.openCreateModal();
};

const openEdit = (id: number): void => {
  discountsStore.openEditModal(id);
};

const onSaved = (): void => {
  discountsStore.closeModal();
};

const setPage = async (page: number): Promise<void> => {
  if (page < 1 || page > totalPages.value) return;
  if (page === currentPage.value) return;
  discountsStore.setPage(page);
  if (calcId.value) {
    await discountsStore.fetchDiscounts(calcId.value);
  }
};

const setPerPage = async (value: number): Promise<void> => {
  discountsStore.setLimit(value);
  if (calcId.value) {
    await discountsStore.fetchDiscounts(calcId.value);
  }
};

onMounted(async () => {
  if (!calcId.value) return;
  if (discountsStore.getIsLoaded) return;
  await discountsStore.fetchDiscounts(calcId.value);
});
</script>

<style scoped lang="scss">
.ccb-calculator-discounts {
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  overflow: hidden;

  &__list {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
}
</style>
