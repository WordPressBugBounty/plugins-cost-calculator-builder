<template>
  <div class="ccb-themes-editor__header">
    <div class="ccb-themes-editor__title-wrap">
      <Text :text="props.title" size="m" weight="bold" />
      <div
        class="ccb-themes-editor__device"
        v-if="props.showDeviceSwitch && canSwitchDevice"
      >
        <button
          class="ccb-themes-editor__device-btn"
          :class="{ active: currentDeviceType === 'desktop' }"
          @click="setDevice('desktop')"
        >
          <i class="ccb-icon-ic_desktop"></i>
        </button>
        <button
          class="ccb-themes-editor__device-btn"
          :class="{ active: currentDeviceType === 'mobile' }"
          @click="setDevice('mobile')"
        >
          <i class="ccb-icon-ic_mobile"></i>
        </button>
      </div>
    </div>
    <Button
      label="Reset"
      size="s"
      type="blue-ghost"
      textSize="s"
      textWeight="regular"
      @click="resetSection"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Text, Button } from "@/admin/shared/ui/UIKit";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";

interface IProps {
  title: string;
  sectionKey: string;
  showDeviceSwitch?: boolean;
  deviceType?: "desktop" | "mobile";
  additionalResetKeys?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  showDeviceSwitch: false,
});
const emit = defineEmits<{
  (event: "update:deviceType", value: "desktop" | "mobile"): void;
}>();

const appearanceStore = useAppearanceStore();

const currentDeviceType = computed<"desktop" | "mobile">(
  () => props.deviceType || appearanceStore.getEditorDevice,
);

const canSwitchDevice = computed(() => {
  const preset = appearanceStore.getEditingPreset as Record<string, any> | null;
  return Boolean(preset?.desktop && preset?.mobile);
});

function setDevice(device: "desktop" | "mobile"): void {
  emit("update:deviceType", device);

  if (typeof appearanceStore.setEditorDevice === "function") {
    appearanceStore.setEditorDevice(device);
    return;
  }

  appearanceStore.$patch({ editorDevice: device });
}

function resetSection(): void {
  if (
    props.sectionKey &&
    typeof appearanceStore.resetSectionToDefault === "function"
  ) {
    appearanceStore.resetSectionToDefault(
      props.sectionKey,
      props.additionalResetKeys,
    );
  }
}
</script>

<style scoped lang="scss">
.ccb-themes-editor {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__title-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__device {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__device-btn {
    border: 0;
    background: transparent;
    color: var(--ccb-font-comment);
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.active {
      color: var(--ccb-blue-fg-normal);
    }
  }
}
</style>
