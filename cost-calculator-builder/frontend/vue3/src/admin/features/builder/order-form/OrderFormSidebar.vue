<template>
  <div
    class="ccb-order-form-sidebar ccb-sidebar"
    :class="{ 'ccb-block-sidebar': !appStore.getIsPro }"
  >
    <div class="ccb-order-form-sidebar__header">
      <Text text="Add Fields" size="mx" weight="bold" />
      <Tab :items="tabs" v-model="activeTab" />
    </div>
    <div
      class="ccb-order-form-sidebar__body ccb-custom-scrollbar"
      v-if="activeTab === 'fields'"
    >
      <div class="ccb-order-form-sidebar__body-item">
        <div class="ccb-order-form-sidebar__body-item-list">
          <div
            class="ccb-order-form-sidebar__body-item-list-item"
            v-for="field in rawFields"
            :key="field.name"
            :data-field-type="field.type"
            draggable="true"
            @click="addRawField(field)"
            @dragstart="onRawFieldDragStart(field, $event)"
          >
            <div class="ccb-order-form-sidebar__body-item-list-item-label">
              <i :class="field.icon"></i>
              <Text :text="field.name" size="m" weight="medium" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="ccb-order-form-sidebar__body" v-if="activeTab === 'forms'">
      <div class="ccb-order-form-sidebar__forms-layout">
        <div
          class="ccb-order-form-sidebar__body-item-list ccb-custom-scrollbar"
        >
          <div
            class="ccb-order-form-sidebar__body-item-list-item ccb-forms"
            :class="{
              'ccb-forms-selected':
                Number(form.id) === Number(activeFormId) &&
                Number(form.id) !== Number(appliedFormId),
            }"
            v-for="form in forms"
            :key="form.id"
            @click="selectForm(Number(form.id))"
          >
            <div class="ccb-order-form-sidebar__body-item-list-item-label">
              <Text :text="form.name" size="m" weight="medium" />
            </div>
            <div
              class="ccb-order-form-sidebar__body-item-list-item-actions"
              :class="{
                'ccb-forms-active': Number(form.id) === Number(activeFormId),
              }"
            >
              <i
                class="ccb-icon-ic_delete ccb-action-delete"
                @click.stop="deleteForm(Number(form.id))"
              ></i>
              <i
                class="ccb-icon-ic_duplicate"
                @click.stop="duplicateForm(Number(form.id))"
              ></i>
              <Button
                :label="
                  Number(form.id) === Number(appliedFormId)
                    ? 'Selected'
                    : 'Select'
                "
                size="s"
                type="blue"
                textSize="xs"
                textWeight="regular"
                class="ccb-custom-btn"
                :disabled="Number(form.id) === Number(appliedFormId)"
                @click.stop="applyForm(form.id)"
              />
            </div>
            <i
              class="ccb-icon-radius-check ccb-action-active"
              v-if="Number(form.id) === Number(appliedFormId)"
            ></i>
          </div>
        </div>
        <div class="ccb-order-form-sidebar__forms-footer">
          <Button
            label="Add Form"
            size="s"
            type="blue-ghost"
            textSize="s"
            textWeight="regular"
            class="ccb-normal-btn ccb-order-form-sidebar__add-form-btn"
            @click="createForm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Text, Button } from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { useOrderFormSidebar } from "@/admin/features/builder/order-form/composables/useOrderFormSidebar";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";

const appStore = useAppStore();

const {
  activeTab,
  tabs,
  activeFormId,
  appliedFormId,
  forms,
  selectForm,
  rawFields,
  applyForm,
  createForm,
  addRawField,
  onRawFieldDragStart,
  duplicateForm,
  deleteForm,
} = useOrderFormSidebar();
</script>

<style scoped lang="scss">
.ccb-order-form-sidebar {
  width: 100%;
  border-radius: 16px;
  background: var(--ccb-bgr-sidebar);
  padding: 24px 16px;
  color: var(--ccb-font-labels);

  &__header {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__body {
    width: 100%;
    height: calc(100vh - 300px);
    overflow-x: auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 16px;
    padding-top: 20px;

    &-item {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      color: var(--ccb-font-labels);
      transition: var(--ccb-transition-normal);

      &-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        row-gap: 4px;
      }

      &-list-item {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;
        padding: 12px;
        border-radius: 8px;
        cursor: grab;
        transition: background 0.15s ease;

        &:hover {
          background: var(--ccb-wb-hover, #f3f4f6);
        }

        &:active {
          cursor: grabbing;
        }

        &-label {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 16px;

          i {
            font-size: 20px;
            color: var(--ccb-font-comment);
          }
        }

        &-actions {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          gap: 16px;
          visibility: hidden;
          opacity: 0;
          transition: var(--ccb-transition-normal);

          i {
            cursor: pointer;
            font-size: 16px;
          }

          .ccb-action-delete {
            color: var(--ccb-red-bg-normal);
          }
        }

        .ccb-action-active {
          font-size: 10px;
          color: var(--ccb-blue-bg-normal);
        }

        &.ccb-forms {
          width: 100%;
          justify-content: space-between;
          border-radius: 8px;

          &:hover,
          &.ccb-forms-selected {
            background: var(--ccb-blue-bg-dull-hover, rgba(0, 122, 198, 0.1));

            .ccb-order-form-sidebar__body-item-list-item-actions {
              visibility: visible;
              opacity: 1;
            }

            .ccb-action-active {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
            }
          }
        }
      }
    }
  }

  &__forms-layout {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .ccb-order-form-sidebar__body-item-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
  }

  &__forms-footer {
    position: sticky;
    bottom: 0;
    z-index: 2;
    border-top: 1px solid var(--ccb-border-normal);
    padding: 12px 0 0;
    margin-top: 8px;
  }

  &__add-form-btn {
    width: 100%;
  }
}

.ccb-block-sidebar {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
</style>
