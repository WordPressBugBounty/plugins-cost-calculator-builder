<template>
  <div class="ccb-notifications" :class="type">
    <component
      :is="getCurrentComponents"
      :message="normalizedMessage"
      :description="description"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, toRefs, h } from "vue";
import { NotificationsTypes } from "@/widget/shared/types/settings";
import { useSettingsStore } from "@/widget/app/providers/stores/settingsStore.ts";
import { IThankYouPage } from "@/widget/shared/types/settings";

type Props = {
  type: NotificationsTypes;
  message: string;
  description?: string;
};

const props = defineProps<Props>();
const { type, message, description } = toRefs(props);

const settingsStore = useSettingsStore();
type ExtendedThankYouPage = IThankYouPage & { completeMsg?: string };
const normalizedMessage = computed(() => {
  const thankYouPage =
    settingsStore.getThankYouPage as ExtendedThankYouPage | null;
  const completeMsg = thankYouPage?.completeMsg?.trim();
  if (type.value === "finish" && completeMsg) {
    return completeMsg;
  }
  return message.value;
});

const getCurrentComponents = computed(() => {
  if (type.value !== "error") {
    return defineAsyncComponent(
      () =>
        import(
          "@/widget/shared/ui/components/Notifications/styles/Success.vue"
        ),
    );
  } else if (type.value === "error") {
    return defineAsyncComponent(
      () =>
        import("@/widget/shared/ui/components/Notifications/styles/Error.vue"),
    );
  }

  return h("div");
});
</script>

<style scoped lang="scss">
.ccb-notifications {
  padding: 20px;
  border-radius: 8px;
  margin-top: 10px;
  box-shadow: 0 0 0 #cccccc !important;
  &.finish,
  &.success {
    background-color: var(--ccb-orders-notice-color);
  }
}
</style>
