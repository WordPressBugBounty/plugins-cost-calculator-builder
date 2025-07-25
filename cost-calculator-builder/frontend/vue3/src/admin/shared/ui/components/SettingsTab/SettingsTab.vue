<template>
  <div class="ccb-settings-tab">
    <div class="ccb-settings-tab__sidebar ccb-custom-scrollbar">
      <div
        class="ccb-settings-tab__sidebar-options"
        v-for="(option, optionIdx) in pageOptions"
        :class="{
          'ccb-settings-sticky-header': optionIdx === 0,
          'ccb-options-wrapper': optionIdx !== 0,
        }"
      >
        <div
          class="ccb-settings-tab__sidebar-options-item"
          v-if="
            option.label &&
            Array.isArray(option.pages) &&
            option.pages.length > 0
          "
        >
          <span class="ccb-otpions-header-title">{{ option.label }}</span>
        </div>
        <div
          class="ccb-settings-tab__sidebar-options-item"
          v-if="Array.isArray(option.pages)"
          v-for="page in option.pages"
          :key="page.id"
          :title="page.label"
          @click="() => clickOption(page)"
          :class="{
            'ccb-settings-tab__sidebar-options-item--active':
              getCurrentIdx === page.id,
          }"
        >
          <i :class="page.icon" v-if="page.icon"></i>
          <span class="ccb-settings-tab__sidebar-options-item-label">{{
            page.label
          }}</span>
        </div>
      </div>
    </div>
    <div class="ccb-settings-tab__content ccb-custom-scrollbar">
      <component :is="getCurrentComponent" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, shallowRef, onMounted, markRaw } from "vue";
import { AnalyticsOptions } from "@/admin/shared/types/analytics/analyticsOptions.type";
import { AnalyticsPages } from "@/admin/shared/types/analytics/analyticsPages.type";

type Props = {
  pageOptions: AnalyticsOptions[];
};

const emit = defineEmits<{
  (event: "click-option", page: AnalyticsPages): void;
}>();

const props = defineProps<Props>();
const { pageOptions } = toRefs(props);

const currentPage = shallowRef<AnalyticsPages | null>(null);
const getCurrentComponent = computed(() => {
  return currentPage.value?.component;
});

const getCurrentIdx = computed(() => {
  return currentPage.value?.id || 0;
});

const clickOption = (page: AnalyticsPages) => {
  if (currentPage.value?.id !== page.id) {
    const pageWithRawComponent = {
      ...page,
      component: markRaw(page.component),
    };
    currentPage.value = pageWithRawComponent;
    emit("click-option", page);
  }
};

onMounted(() => {
  const firstPage = pageOptions.value[0].pages[0];
  const pageWithRawComponent = {
    ...firstPage,
    component: markRaw(firstPage.component),
  };
  currentPage.value = pageWithRawComponent;
});
</script>

<style lang="scss" scoped>
.ccb-settings-tab {
  display: flex;
  height: 100%;
  width: 100%;

  &__sidebar {
    max-width: 240px;
    width: 100%;
    border-right: 1px solid #ddd;
    height: calc(100vh - 120px);
    overflow-y: auto;

    &-options {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid #ddd;
      padding: 10px 0;

      &:last-child {
        border-bottom: none;
      }

      &-item {
        display: flex;
        align-items: center;
        padding: 10px 18px 10px 15px;
        cursor: pointer;
        width: 100%;
        // background: #fff;
        // border-left: 3px solid #1ab163;
        border-left: 3px solid transparent;
        height: 40px;
        align-items: center;

        i {
          // color: #1ab163;
          font-size: 18px;
          margin-right: 8px;
        }

        &-label {
          color: #001931;
          font-size: 14px;
          font-weight: 500;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }
      }
    }
  }

  &__content {
    flex: 1;
    height: calc(100vh - 120px);
    padding: 20px;
    overflow-y: auto;
  }

  .ccb-otpions-header-title {
    color: #001931;
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
  }

  .ccb-settings-tab__sidebar-options-item--active {
    background: #fff;
    border-color: #1ab163;

    i {
      color: #1ab163;
    }
  }

  .ccb-settings-sticky-header {
    position: sticky;
    top: 0;
    z-index: 11;
    background: #eef1f7;
  }

  .ccb-options-wrapper {
    overflow-y: auto;
  }
}
</style>
