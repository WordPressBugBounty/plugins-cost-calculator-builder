<template>
  <div class="ccb-template-sidebar">
    <div class="ccb-template-sidebar__search">
      <Input
        placeholder="Search templates"
        class="ccb-medium ccb-text-m"
        iconRight="ccb-icon-ic_search"
        :radius="true"
        :border="true"
        :value="searchInput"
        @change="handleSearchInputChange"
      />
    </div>
    <div class="ccb-template-sidebar__items ccb-custom-scrollbar">
      <div
        class="ccb-template-sidebar__item"
        v-for="category in categories"
        :key="category.id"
        @click="handleCategoryClick(category.slug)"
        :class="{ active: category.slug === activeCategory }"
      >
        <div class="ccb-template-sidebar__item-icon">
          <i
            v-if="category.icon"
            :style="{ color: category.iconColor }"
            :class="category.icon"
          ></i>
          <i v-else class="ccb-icon-ic_oval"></i>
        </div>
        <div class="ccb-template-sidebar__item-title">
          <Text :text="String(category.title)" size="m" weight="medium" />
        </div>
        <div class="ccb-template-sidebar__item-count">
          <Text :text="String(category.count)" size="m" weight="medium" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref } from "vue";
import { Text, Input } from "@/admin/shared/ui/UIKit";
import { ITemplateCategory } from "@/admin/shared/types/template.type";

interface ITemplateSidebarProps {
  categories: ITemplateCategory[];
  searchInput: string;
}

const props = defineProps<ITemplateSidebarProps>();
const { categories, searchInput } = toRefs(props);

const activeCategory = ref<string>("all");

const emit = defineEmits<{
  (e: "categoryChanged", slug: string): void;
  (e: "changeSearchInput", input: string): void;
}>();

const handleCategoryClick = (slug: string) => {
  activeCategory.value = slug;
  emit("categoryChanged", slug);
};

const handleSearchInputChange = (_name: string, value: string) => {
  emit("changeSearchInput", value);
};
</script>

<style scoped lang="scss">
.ccb-template-sidebar {
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  width: 100%;

  background-color: var(--ccb-bgr-sidebar);
  padding: 24px 8px;
  border-radius: 16px;

  &__items {
    max-height: calc(100vh - 282px);
    overflow-x: auto;
    padding-right: 2px;
  }

  &__item {
    display: flex;
    align-items: center;
    column-gap: 8px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: var(--ccb-transition-normal);
    color: var(--ccb-font-labels);

    &.active {
      background-color: var(--ccb-blue-bg-dull-hover);
    }

    &:hover {
      background-color: var(--ccb-blue-bg-dull-hover);
    }

    &-count {
      color: var(--ccb-font-comment);
      margin-left: auto;
    }
  }
}
</style>
