<template>
  <div class="ccb-settings">
    <div class="ccb-settings__container">
      <Transition name="slide-left">
        <div class="ccb-settings__sidebar" v-show="mounted">
          <SettingsSidebar
            :activeItem="activeItem"
            @update:activeItem="handleActiveItemUpdate"
          />
        </div>
      </Transition>

      <Transition name="slide-right">
        <div
          class="ccb-settings__content ccb-custom-scrollbar"
          v-show="mounted"
        >
          <Transition name="section-swap" mode="out-in">
            <SettingsSection :key="activeItem" :activeSection="activeItem" />
          </Transition>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import SettingsSidebar from "@/admin/features/settings/SettingsSidebar.vue";
import SettingsSection from "@/admin/features/settings/sections/SettingsSection.vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";

const builderStore = useBuilderStore();

const activeItem = ref(builderStore.getSettingsActiveSection || "currency");
const mounted = ref(false);

const handleActiveItemUpdate = (slug: string) => {
  activeItem.value = slug;
  builderStore.setSettingsActiveSection(slug);
};

watch(
  () => builderStore.getSettingsActiveSection,
  (section) => {
    if (section && section !== activeItem.value) {
      activeItem.value = section;
    }
  },
);

onMounted(() => {
  requestAnimationFrame(() => {
    mounted.value = true;
  });
});
</script>

<style lang="scss">
.ccb-settings {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: row;
  height: calc(100vh - 120px);

  &__row {
    display: flex;
    flex-direction: row;
    gap: 16px;
    margin-bottom: 24px;
  }

  &__col {
    flex: 1 1 0;
    width: 100%;
    min-width: 0;
  }

  &__container {
    width: 100%;
    max-width: 940px;
    display: flex;
    flex-direction: row;
    gap: 18px;
  }

  &__content {
    flex: 1 1 0;
    width: 100%;
    min-width: 0;
    height: 100%;
    overflow-y: auto;
  }

  .flex-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .justify-start {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
  }

  .justify-end {
    display: flex;
    justify-content: flex-end;
  }

  .align-end {
    display: flex;
    align-items: flex-end;
  }
}

.slide-left-enter-active {
  transition:
    transform 0.3s ease,
    opacity 0.2s ease;
}
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(-32px);
}
.slide-left-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-right-enter-active {
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(32px);
}
.slide-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.section-swap-enter-active,
.section-swap-leave-active {
  transition:
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

.section-swap-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.section-swap-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.section-swap-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.section-swap-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
