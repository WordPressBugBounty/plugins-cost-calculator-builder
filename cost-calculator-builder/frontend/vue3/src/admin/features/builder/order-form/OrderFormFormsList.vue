<template>
  <div class="ccb-order-form-sidebar__forms">
    <div class="ccb-order-form-sidebar__forms-current" v-if="activeFormName">
      <Text :text="activeFormName" size="m" weight="medium" />
      <i class="ccb-icon-radius-check"></i>
    </div>

    <div class="ccb-order-form-sidebar__forms-list ccb-custom-scrollbar">
      <div
        class="ccb-order-form-sidebar__form-item"
        :class="{ selected: Number(form.id) === activeFormId }"
        v-for="form in forms"
        :key="form.id"
        @click="selectForm(Number(form.id))"
      >
        <Text :text="form.name" size="m" weight="medium" />

        <div
          class="ccb-order-form-sidebar__form-actions"
          v-if="Number(form.id) === activeFormId"
        >
          <button
            class="ccb-order-form-sidebar__form-action ccb-order-form-sidebar__form-action--delete"
            type="button"
            @click.stop="deleteForm"
          >
            <i class="ccb-icon-ic_delete"></i>
          </button>
          <button
            class="ccb-order-form-sidebar__form-action"
            type="button"
            @click.stop="duplicateForm"
          >
            <i class="ccb-icon-ic_duplicate"></i>
          </button>
          <Button
            label="Apply"
            type="blue"
            size="xs"
            @click.stop="applyForm(Number(form.id))"
          />
        </div>
      </div>
    </div>

    <button
      class="ccb-order-form-sidebar__add-form"
      type="button"
      @click="createForm"
    >
      <i class="ccb-icon-ic_plus_small"></i>
      <Text text="Add Form" size="m" weight="medium" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Button, Text } from "@/admin/shared/ui/UIKit";
import type { IOrderFormEntity } from "@/admin/shared/types/order-form.type";

const props = defineProps<{
  forms: IOrderFormEntity[];
  activeFormId: number | null;
  createForm: () => Promise<void>;
  duplicateForm: () => Promise<void>;
  deleteForm: () => Promise<void>;
  selectForm: (formId: number) => Promise<void>;
  applyForm: (formId: number) => Promise<void>;
}>();

const activeFormName = computed(
  () =>
    props.forms.find((form) => Number(form.id) === props.activeFormId)?.name ||
    "",
);
</script>
