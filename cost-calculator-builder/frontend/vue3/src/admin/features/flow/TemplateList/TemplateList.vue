<template>
  <div class="ccb-templates">
    <div class="ccb-templates__header">
      <i
        :class="getCategoryIconBySlug(templateType)"
        :style="{ color: getCategoryIconColorBySlug(templateType) }"
      />
      <Text
        v-if="templateType === 'all'"
        text="All Templates"
        size="xl"
        weight="bold"
      />
      <Text
        v-else
        :text="getCategoryTitleBySlug(templateType)"
        size="xl"
        weight="bold"
      />
    </div>
    <div v-if="isLoading" class="ccb-templates__loader">
      <Loader />
    </div>
    <div v-else class="ccb-templates__content">
      <div
        class="ccb-templates__list ccb-custom-scrollbar"
        v-if="templates.length > 0"
      >
        <TemplateIconCard
          v-for="(template, index) in templates"
          class="ccb-templates__list-item"
          :style="{ animationDelay: `${index * 40}ms` }"
          :key="template.id"
          :template="template"
          @useTemplate="handleUseTemplate"
          @deleteTemplate="handleDeleteTemplate"
        />
      </div>
      <div class="ccb-templates__list ccb-templates__list-empty" v-else>
        <EmptyContent
          title="No templates were found"
          description="Try changing the search criteria"
          icon="ccb-icon-ic_warrning"
        />
      </div>
      <div class="ccb-templates__sidebar">
        <TemplateSidebar
          :categories="categories"
          :searchInput="searchInput"
          @categoryChanged="handleTypeChange"
          @changeSearchInput="handleSearchInputChanged"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore";
import {
  ITemplate,
  ITemplateCategory,
} from "@/admin/shared/types/template.type";
import { Text, EmptyContent, Loader } from "@/admin/shared/ui/UIKit";
import TemplateSidebar from "@/admin/features/flow/TemplateSidebar/TemplateSidebar.vue";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";
import { useTemplatesStore } from "@/admin/app/providers/stores/useTemplatesStroe";
import { TemplateIconCard } from "@/admin/shared/ui/components/TemplateIconCard";

const appStore = useAppStore();
const flowStore = useFlowStore();
const templatesStore = useTemplatesStore();
const templateType = ref<string>("all");
const searchInput = ref<string>("");
const isLoading = ref<boolean>(false);

const templates = computed<ITemplate[]>(() => {
  let templates = [];
  if (templateType.value === "all") {
    templates = flowStore.getTemplates;
  } else if (templateType.value === "favorites") {
    const favorites = flowStore.getFavorites;
    templates = flowStore.getTemplates.filter((template) =>
      favorites.includes(+template.id),
    );
  } else if (templateType.value === "popular") {
    templates = flowStore.getTemplates.filter((template) =>
      templatesStore.getPopularTemplates.includes(template.title),
    );
  } else {
    templates = flowStore.getTemplates.filter(
      (template) => template.category === templateType.value,
    );
  }

  if (searchInput.value.length > 0) {
    templates = templates.filter((template) =>
      template.title.toLowerCase().includes(searchInput.value.toLowerCase()),
    );
  }

  return templates;
});

const handleDeleteTemplate = async (id: number) => {
  isLoading.value = true;
  try {
    await flowStore.deleteTemplate(id);
  } finally {
    isLoading.value = false;
  }
};

const categories = computed<ITemplateCategory[]>(() => {
  const customCategories: ITemplateCategory[] = [
    {
      id: -1,
      title: "All Templates",
      slug: "all",
      icon: "ccb-icon-ic_flame",
      iconColor: "var(--ccb-orange-bg-normal)",
      count: flowStore.getTemplates?.length || 0,
    },
    {
      id: -1,
      title: "Popular Templates",
      slug: "popular",
      icon: "ccb-icon-ic_flame",
      iconColor: "var(--ccb-orange-bg-normal)",
      count: templatesStore.getPopularTemplates.length || 0,
    },
    {
      id: -1,
      title: "Favorites",
      slug: "favorites",
      icon: "ccb-icon-ic_heart_fill",
      iconColor: "var(  --ccb-red-bg-normal )",
      count: flowStore.getFavorites?.length || 0,
    },
  ];
  return [...customCategories, ...flowStore.getCategories];
});

const handleTypeChange = (type: string) => {
  templateType.value = type;
};

const getCategoryTitleBySlug = computed(() => {
  return (slug: string) => {
    return (
      categories.value.find((category) => category.slug === slug)?.title || ""
    );
  };
});

const getCategoryIconBySlug = computed(() => {
  return (slug: string) => {
    return (
      categories.value.find((category) => category.slug === slug)?.icon || ""
    );
  };
});

const getCategoryIconColorBySlug = computed(() => {
  return (slug: string) => {
    return categories.value.find((category) => category.slug === slug)
      ?.iconColor;
  };
});

const handleUseTemplate = async (id: number) => {
  isLoading.value = true;
  try {
    await appStore.useTemplate(id);
  } finally {
    isLoading.value = false;
  }
};

const handleSearchInputChanged = (input: string) => {
  searchInput.value = input;
};
</script>

<style scoped lang="scss">
.ccb-templates {
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  width: 100%;
  height: 100%;

  &__header {
    display: flex;
    align-items: center;
    flex-direction: row;
    width: 100%;
    color: var(--ccb-font-heads);
    gap: 8px;

    i {
      font-size: 34px;
    }

    span {
      color: rgba(0, 0, 0, 0.9);
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
    }
  }

  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 16px;
    height: 100%;
    min-height: 0;
    align-items: start;
  }

  &__sidebar {
    min-width: 0;
    width: 100%;
  }

  &__list {
    width: 100%;
    max-height: calc(100vh - 180px);
    min-height: 0;
    overflow-y: auto;
    padding-bottom: 116px;
    min-width: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: start;
    gap: 24px;
    padding-right: 10px;

    &-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      row-gap: 10px;
      margin-top: 100px;
    }
  }
}

@keyframes itemIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
