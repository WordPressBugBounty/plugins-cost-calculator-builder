<template>
  <div class="ccb-payment" @click="handleClick">
    <label>
      <div class="ccb-payment-header">
        <div class="ccb-payment-header__label">
          <input
            type="radio"
            :name="name"
            value="paypal"
            v-model="paymentType"
          />
          <span class="ccb-radio-label">Paypal</span>
        </div>
        <div class="calc-payment_header__img">
          <img
            :src="paypalImg"
            alt="card-payment-image"
            style="max-width: 82px"
          />
        </div>
      </div>
      <div class="calc-payment-body">
        <div
          id="ccb_stripe_397"
          class="calc-stripe-wrapper"
          style="background: transparent; display: none"
        ></div>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import paypalImg from "@/images/payments/paypal.webp";
import { useSinglePayment } from "@/widget/actions/pro-features/payments/composable/useSinglePayment.ts";
import { toRefs } from "vue";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore";
const { paymentType } = useSinglePayment();
const fieldsStore = useFieldsStore();

const props = defineProps<{
  name: string;
}>();
const { name } = toRefs(props);

const handleClick = (event: MouseEvent) => {
  if (!fieldsStore.checkRequiredFields()) {
    event.preventDefault();
  }
};
</script>

<style lang="scss"></style>
