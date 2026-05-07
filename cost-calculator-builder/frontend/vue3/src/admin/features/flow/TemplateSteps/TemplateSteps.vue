<template>
  <div class="ccb-template-steps">
    <div class="ccb-template-steps__header">
      <Text text="What you want to do?" size="xl" weight="bold" />
    </div>
    <div class="ccb-template-steps__actions">
      <CreateCard
        title="Create a new calculator"
        :img="createCardImg"
        description="Create a new calculator from scratch"
        @click="actionSelected('calculator')"
      />
      <CreateCard
        title="Use Template"
        :img="createTemplate"
        description="Use a template to create a new calculator"
        @click="actionSelected('template')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Text } from "@/admin/shared/ui/UIKit";
import { CreateCard } from "@/admin/shared/ui/components";
import createCardImg from "@/images/create/scratch.png";
import createTemplate from "@/images/create/template.png";

const emit = defineEmits<{
  (e: "action-selected", action: string): void;
}>();

const actionSelected = (action: string) => {
  emit("action-selected", action);
};
</script>

<style scoped lang="scss">
.ccb-template-steps {
  display: flex;
  flex-direction: column;
  row-gap: 72px;
  align-items: center;

  &__header {
    color: var(--ccb-font-heads);
    font-size: 40px;
    font-style: normal;
    font-weight: 700;
    line-height: normal;
  }

  &__actions {
    display: flex;
    gap: 16px;
  }

  &__action {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 16px;
    justify-content: center;
    width: 328px;
    padding: 32px 8px;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.08);

    .action-title {
      overflow: hidden;
      color: rgba(0, 0, 0, 0.9);
      text-align: center;
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
    }

    .action-description {
      color: rgba(0, 0, 0, 0.7);
      text-align: center;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.2px;
    }
  }
}
</style>
