<template>
  <div class="ccb-calculator-discounts">
    <ProBanner
      title="Discounts"
      description="Turn browsers into buyers. Add promo codes and discounts directly to your calculator and encourage clients to buy"
      :image="imageUrl"
      :documentationLink="documentationLink"
      :upgradeLink="upgradeLink"
      imageMaxWidth="1024px"
      imageMaxHeight="500px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IProBannerLink } from "@/admin/shared/types/uikit.type";
import ProBanner from "@/admin/shared/ui/UIKit/ProBanner.vue";
import { useAppStore } from "@/admin/app/providers/stores/useAppStore";

const appStore = useAppStore();

const documentationLink = computed<IProBannerLink>(() => ({
  label: "Learn More",
  url: "https://docs.stylemixthemes.com/cost-calculator-builder/pro-plugin-features/discounts",
}));

const upgradeLink = computed<IProBannerLink>(() => ({
  label: "Upgrade Now",
  url: "https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=wpadmin&utm_medium=promo_calc&utm_campaign=promo-codes-and-discounts",
}));

const imageUrl = computed(() => {
  return `${appStore.getCalcUrl}/frontend/dist/img/pro-features/v4/discounts-banner.webp`;
});
</script>

<style scoped>
.ccb-calculator-discounts {
  width: 100%;
  height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  overflow: hidden;
}
</style>
