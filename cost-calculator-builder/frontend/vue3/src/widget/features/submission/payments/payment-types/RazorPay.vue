<template>
  <div class="ccb-payment" @click="handleClick">
    <label>
      <div class="ccb-payment-header">
        <div class="ccb-payment-header__label">
          <input
            type="radio"
            :name="name"
            value="razorpay"
            v-model="paymentType"
          />
          <span class="ccb-radio-label">Razorpay</span>
        </div>
        <div class="calc-payment_header__img">
          <img
            :src="razorpayImg"
            alt="card-payment-image"
            style="max-width: 112px"
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
import razorpayImg from "@/images/payments/card_payment.webp";
import { useSinglePayment } from "@/widget/actions/pro-features/payments/composable/useSinglePayment.ts";
import { toRefs } from "vue";
import { useFieldsStore } from "@/widget/app/providers/stores/fieldsStore";

const fieldsStore = useFieldsStore();
const props = defineProps<{
  name: string;
}>();
const { name } = toRefs(props);

const { paymentType } = useSinglePayment();
const handleClick = (event: MouseEvent) => {
  if (!fieldsStore.checkRequiredFields()) {
    event.preventDefault();
  }
};
</script>

<style lang="scss"></style>
