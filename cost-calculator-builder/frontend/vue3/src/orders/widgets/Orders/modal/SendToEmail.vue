<template>
  <div class="ccb-send-to-email-modal-content">
    <div class="ccb-send-to-email-modal-content--header">
      <h1 style="text-transform: capitalize">
        {{ translations.sendToEmail }}
      </h1>
    </div>
    <div class="ccb-send-to-email-modal-content--body">
      <div class="ccb-send-to-email-text-box">
        <textarea v-model="emailText"></textarea>
        <span class="ccb-send-to-email-text-box--description">
          {{ translations.sendToEmailDescription }}
        </span>
      </div>
      <div class="ccb-send-to-email-items">
        <div
          class="ccb-send-to-email-item"
          v-for="email in emails"
          :key="email"
          @click="addEmail(email)"
        >
          <span>{{ email }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useOrdersStore } from "@/orders/app/providers/stores/orders";
import { useOrdersTranslationsStore } from "@/orders/app/providers/stores/useTranslations";

const ordersStore = useOrdersStore();
const translationsStore = useOrdersTranslationsStore();

const translations = translationsStore.getTranslations;
const emailText = computed({
  get: (): string => ordersStore.getEmailText,
  set: (value: string): void => ordersStore.setEmailText(value),
});

const addEmail = (email: string): void => {
  let text = emailText.value;
  if (text?.trim().length > 0) {
    text = `${text}, ${email}`;
  } else {
    text = email;
  }
  emailText.value = text;
};

const emails = computed(() => {
  return ordersStore.getEmails;
});
</script>

<style scoped lang="scss">
.ccb-send-to-email-modal-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 24px;

  &--header {
    display: flex;
    align-items: center;

    h1 {
      font-size: 20px;
      font-weight: 700;
      line-height: 1;
      color: #000;
    }
  }

  &--body {
    display: flex;
    flex-direction: column;
    row-gap: 30px;

    .ccb-send-to-email-text-box {
      width: 100%;
      display: flex;
      flex-direction: column;
      row-gap: 4px;

      textarea {
        width: 100%;
        height: 100px;
        border-radius: 4px;
        border: 1px solid #ddd !important;
        background: #fff;
        resize: vertical;
        max-height: 200px;
        min-height: 100px;
        height: 100px;
        outline: none !important;
        box-shadow: none !important;
        padding: 9px 15px;

        font-size: 13px;
        font-weight: 500;
        color: rgba(22, 36, 50, 0.85);
      }

      &--description {
        color: rgba(22, 36, 50, 0.5);
        font-size: 12px;
        font-weight: 400;
        line-height: 20px;
      }
    }
  }

  .ccb-send-to-email-items {
    display: flex;
    flex-direction: column;

    .ccb-send-to-email-item {
      color: rgba(22, 36, 50, 0.85);
      font-size: 14px;
      font-weight: 500;
      line-height: 20px;
      padding: 0 12px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      border-radius: 4px;
      background-color: #ffffff;
      transition: background 200ms linear;

      &:hover {
        background: rgba(66, 152, 239, 0.05);
      }
    }
  }
}
</style>
