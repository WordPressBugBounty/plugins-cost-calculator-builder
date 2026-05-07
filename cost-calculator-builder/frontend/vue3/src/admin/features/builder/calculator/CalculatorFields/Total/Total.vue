<template>
  <div class="ccb-total-field">
    <div class="ccb-total-field__icon">
      <i class="ccb-icon-ic_formula"></i>
    </div>
    <div class="ccb-total-field__content">
      <div class="ccb-total-field__label">
        <Text :text="field.label" size="s" weight="medium" />
      </div>
      <div class="ccb-total-field__description">
        <Text :text="field.description || ''" size="s" weight="regular" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from "vue";
import type { ITotalField } from "@/admin/shared/types/fields.type";
import Text from "@/admin/shared/ui/UIKit/Text.vue";

import { useAppearanceColors } from "@/admin/shared/utils/useAppearanceColors";

const { textColor } = useAppearanceColors();

const props = defineProps<{
  field: ITotalField;
}>();

const { field } = toRefs(props);
</script>

<style scoped lang="scss">
.ccb-total-field {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  border-radius: 5px;
  width: 100%;
  color: v-bind(textColor);

  &__icon {
    border-radius: 50%;
    font-size: 24px;
    margin-right: 10px;
  }
}
</style>
