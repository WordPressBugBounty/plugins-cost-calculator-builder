<template>
  <div
    class="ccb-group"
    :class="{ 'ccb-group-collapsed': collapsed, [additionalClasses]: true }"
  >
    <div class="ccb-group__header" @click="toggleCollapse">
      <div class="ccb-group__icon" v-if="collapsible">
        <i class="ccb-icon-Path-3514"></i>
      </div>
      <div class="ccb-group__label" v-if="showName">{{ groupLabel }}</div>
      <ProBadge />
    </div>
    <Transition name="fade">
      <div class="ccb-group__body" v-if="!collapsed">
        <div class="ccb-group__fields" ref="fields">
          <template v-for="groupFieldMap in field.groupElements">
            <template v-for="groupElement in getFieldsFromMap(groupFieldMap)">
              <CalculatorField
                :name="groupElement.fieldName"
                :field="groupElement"
              />
            </template>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, onMounted } from "vue";
import CalculatorField from "@/widget/features/calculator-fields/CalculatorField.vue";
import { IGroupField, Field } from "@/widget/shared/types/fields";
import ProBadge from "@/widget/shared/ui/components/Pro-badge/ProBadge.vue";

type Props = {
  field: IGroupField;
};

onMounted(() => {
  if (collapsedDefault.value) {
    collapsed.value = true;
  }
});

const props = defineProps<Props>();
const { field } = toRefs(props);
const collapsed = ref(false);

const groupLabel = computed(() => {
  return field.value.label ? field.value.label : "Group";
});

const getFieldsFromMap = computed(() => {
  return (data: Map<string, Field>): Field[] => {
    return Array.from(data.values());
  };
});

const showName = computed(() => {
  return field.value.showTitle;
});

const collapsible = computed(() => {
  return field.value.collapsible;
});

const collapsedDefault = computed(() => {
  return field.value.collapse;
});

const toggleCollapse = () => {
  if (collapsible.value) {
    collapsed.value = !collapsed.value;
  }
};

const additionalClasses = computed(() => {
  return field.value?.additionalStyles || "";
});
</script>

<style lang="scss">
.ccb-group {
  border-bottom: 2px solid var(--ccb-container-dark-color);
  padding-bottom: 20px;

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &.ccb-group-collapsed {
    .ccb-group__icon {
      transform: rotate(180deg);
    }
  }

  &__header {
    color: var(--ccb-text-color);
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    margin-block: 10px;
  }

  &__label {
    font-size: var(--ccb-field-size);
    font-weight: var(--ccb-field-label-weight);
    color: var(--ccb-text-color);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: 300ms ease;
  }
}
</style>
