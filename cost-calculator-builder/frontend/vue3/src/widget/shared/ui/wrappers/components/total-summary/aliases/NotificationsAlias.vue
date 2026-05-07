<template>
  <Notifications
    v-if="showNotifications"
    :type="notificationType"
    :message="notificationMessage"
    :description="notificationDescription"
  />
</template>

<script setup lang="ts">
import Notifications from "@/widget/shared/ui/components/Notifications";
import { NotificationsTypes } from "@/widget/shared/types/settings";

type Props = {
  showNotifications: boolean;
  notificationType: NotificationsTypes;
  notificationMessage: string;
  notificationDescription?: string;
  item?: any;
};

defineProps<Props>();
</script>
