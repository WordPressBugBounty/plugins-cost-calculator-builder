<template>
  <div class="ccb-orders-modal">
    <div class="ccb-orders-modal-overlay" @click.self="closeModal"></div>

    <div class="ccb-orders-modal-content">
      <div class="ccb-settings-orders-modal">
        <div class="ccb-settings-orders-modal-content">
          <component
            :is="currentComponent"
            @clear-errors="clearErrors"
            @delete-status="deleteStatus"
            :key="updateKey"
          />
        </div>
        <div class="ccb-settings-orders-modal-footer">
          <div class="errors-list" v-if="ordersStore.getErrors.length > 0">
            <div
              class="error-item"
              v-for="error in ordersStore.getErrors"
              :key="error.key"
            >
              {{ error.message }}
            </div>
          </div>
          <div class="buttons-wrapper">
            <div
              :class="{
                'ccb-hidden':
                  settingsType === 'status' || settingsType === 'send_to_email',
              }"
            >
              <button
                type="button"
                class="restore-default-btn"
                @click="restoreDefaults"
              >
                {{ translations.resetDefaults }}
              </button>
            </div>
            <div style="display: flex; column-gap: 12px">
              <button type="button" class="cancel-btn" @click="cancelSettings">
                {{ translations.cancel }}
              </button>
              <button type="button" class="save-btn" @click="saveSettings">
                <template v-if="settingsType === 'send_to_email'">
                  {{ translations.send }}
                </template>
                <template v-else>
                  {{ translations.save }}
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref } from "vue";
import {
  SettingsOrders,
  SettingsStatus,
  SettingsTable,
  SendToEmail,
} from "./index";
import { useOrdersStore } from "@/orders/app/providers/stores/orders";
import { debounce } from "@/orders/shared/utils/useDebounce";
import { useOrdersTranslationsStore } from "@/orders/app/providers/stores/useTranslations";

const ordersStore = useOrdersStore();
const translationsStore = useOrdersTranslationsStore();

const updateKey = ref(0);

const props = defineProps<{
  settingsType: "orders" | "status" | "table" | "send_to_email";
}>();

const { settingsType } = toRefs(props);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const translations = translationsStore.getTranslations;

const debouncedSaveStatuses = debounce(() => {
  ordersStore.saveStatuses();
}, 500);

const debouncedSaveTableSettings = debounce(() => {
  ordersStore.saveTableSettings();
}, 500);

const debouncedSaveOrdersSettings = debounce(() => {
  ordersStore.saveOrdersSettings();
}, 500);

const saveSettings = () => {
  if (settingsType.value === "table") {
    const tableSettings = ordersStore.getTempTableSettings;
    ordersStore.setTableSettings(JSON.parse(JSON.stringify(tableSettings)));
    debouncedSaveTableSettings();
  }

  if (settingsType.value === "orders") {
    const ordersSettings = ordersStore.getTempOrdersSettings;
    ordersStore.setOrdersSettings(JSON.parse(JSON.stringify(ordersSettings)));
    debouncedSaveOrdersSettings();
  }

  if (settingsType.value === "status") {
    const duplicateSlugErrors = [];
    const emptyColorErrors = [];
    const emptyTitleErrors = [];

    ordersStore.setErrors([]);
    const errorsMessages = ordersStore.getErrors;
    for (let i = 0; i < ordersStore.getTempStatuses.length; i++) {
      if (ordersStore.getTempStatuses[i].color === "") {
        emptyColorErrors.push(ordersStore.getTempStatuses[i].id);
      }

      if (ordersStore.getTempStatuses[i].status_name === "") {
        emptyTitleErrors.push(ordersStore.getTempStatuses[i].id);
      }

      for (let j = i + 1; j < ordersStore.getTempStatuses.length; j++) {
        if (
          ordersStore.getTempStatuses[i].slug &&
          ordersStore.getTempStatuses[i].slug ===
            ordersStore.getTempStatuses[j].slug
        ) {
          duplicateSlugErrors.push([
            ordersStore.getTempStatuses[i].id,
            ordersStore.getTempStatuses[j].id,
          ]);
        }
      }
    }

    if (duplicateSlugErrors.length > 0) {
      ordersStore.setErrorIdx(duplicateSlugErrors);

      const error = errorsMessages.find(
        (error) => error.key === "duplicate_slug",
      );

      if (!error) {
        errorsMessages.push({
          key: "duplicate_slug",
          message: "This name is already in use",
        });
      }

      ordersStore.setErrors(errorsMessages);
    }

    if (emptyColorErrors.length > 0) {
      ordersStore.setEmptyColorErrors(emptyColorErrors);

      const error = errorsMessages.find((error) => error.key === "empty_color");

      if (!error) {
        errorsMessages.push({
          key: "empty_color",
          message: "Statuses with empty color are not allowed",
        });
      }

      ordersStore.setErrors(errorsMessages);
    }

    if (emptyTitleErrors.length > 0) {
      ordersStore.setEmptyTitleErrors(emptyTitleErrors);

      const error = errorsMessages.find((error) => error.key === "empty_title");

      if (!error) {
        errorsMessages.push({
          key: "empty_title",
          message: "Statuses with empty title are not allowed",
        });
      }

      ordersStore.setErrors(errorsMessages);
    }

    if (
      duplicateSlugErrors.length > 0 ||
      emptyColorErrors.length > 0 ||
      emptyTitleErrors.length > 0
    ) {
      return;
    }

    ordersStore.setStatuses(
      JSON.parse(JSON.stringify(ordersStore.getTempStatuses)),
      false,
    );
    debouncedSaveStatuses();
  }

  if (settingsType.value === "send_to_email") {
    const order_id = ordersStore.getCurrentOrderId;
    if (order_id) {
      const emails = ordersStore.getEmailText;
      const emailList: string[] = emails.split(",");
      ordersStore.sendToEmail(order_id, emailList);
    }

    ordersStore.setEmailText("");
  }

  closeModal();
};

const deleteStatus = (id: number) => {
  ordersStore.setDeleteOrderIds(id);
};

const cancelSettings = () => {
  if (settingsType.value === "table") {
    ordersStore.setTempTableSettings(
      JSON.parse(JSON.stringify(ordersStore.getTableSettings)),
    );
  }

  if (settingsType.value === "orders") {
    ordersStore.setTempOrdersSettings(
      JSON.parse(JSON.stringify(ordersStore.getOrdersSettings)),
    );
  }

  if (settingsType.value === "status") {
    ordersStore.resetStatuses();
  }

  if (settingsType.value === "send_to_email") {
    ordersStore.setEmailText("");
  }

  closeModal();
};

const restoreDefaults = () => {
  if (settingsType.value === "table") {
    ordersStore.restoreTableSettings().then(() => {
      updateKey.value++;
    });
  }

  if (settingsType.value === "orders") {
    ordersStore.restoreOrdersSettings().then(() => {
      updateKey.value++;
    });
  }
};

const clearErrors = () => {
  ordersStore.resetDeleteOrderIds();
  ordersStore.setErrors([]);
  ordersStore.setErrorIdx([]);
  ordersStore.setEmailText("");
  ordersStore.setEmptyColorErrors([]);
  ordersStore.setEmptyTitleErrors([]);
};

const currentComponent = computed(() => {
  switch (settingsType.value) {
    case "orders":
      return SettingsOrders;
    case "status":
      return SettingsStatus;
    case "table":
      return SettingsTable;
    case "send_to_email":
      return SendToEmail;
    default:
      return SettingsOrders;
  }
});

const closeModal = () => {
  clearErrors();
  emit("close");
};
</script>

<style lang="scss" scoped>
.ccb-orders-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ccb-orders-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}

.ccb-orders-modal-content {
  position: relative;
  z-index: 111;
  max-width: 360px;
  width: 100%;
  height: max-content;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 5px 30px 0 rgba(0, 0, 0, 0.15);
  padding: 24px;
}

.ccb-settings-orders-modal {
  display: flex;
  flex-direction: column;
  row-gap: 24px;

  &-footer {
    .buttons-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .errors-list {
      display: flex;
      flex-direction: column;
      row-gap: 10px;
      padding: 10px;
      width: 100%;
      margin-bottom: 24px;
      border-radius: 6px;
      background: #ffd6d6;

      .error-item {
        color: #001931;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .save-btn,
    .cancel-btn,
    .restore-default-btn {
      height: 32px;
      padding: 0 12px;
      cursor: pointer;
      transition: 200ms linear;

      color: rgba(22, 36, 50, 0.85);
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 1;
    }

    .save-btn {
      border-radius: 8px;
      border: none;
      background: rgba(22, 36, 50, 0.05);

      &:hover {
        background: rgba(22, 36, 50, 0.1);
      }
    }

    .restore-default-btn,
    .cancel-btn {
      border-radius: 8px;
      background-color: #fff;
      border: 2px solid rgba(22, 36, 50, 0.05);

      &:hover {
        border-color: rgba(22, 36, 50, 0.1);
      }
    }
  }

  .ccb-hidden {
    opacity: 0;
    visibility: hidden;
    cursor: not-allowed;
  }
}
</style>
