<template>
  <div class="ccb-order-form-without-pro">
    <ProBanner
      title="Contact Form Manager"
      description="Turn anonymous visitors into paying clients. Build custom contact forms that collect contact details and process orders right from the calculator"
      :image="imageUrl"
      :documentationLink="documentationLink"
      :upgradeLink="upgradeLink"
      :watchVideoLink="watchLink"
      imageMaxWidth="800px"
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
  url: "https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/form-manager",
}));

const upgradeLink = computed<IProBannerLink>(() => ({
  label: "Upgrade Now",
  url: "https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=send_form",
}));

const watchLink = computed<IProBannerLink>(() => ({
  label: "Watch Demo",
  url: "https://www.youtube.com/watch?v=0nP4aIX6-HI&feature=youtu.be",
}));

const imageUrl = computed(() => {
  return `${appStore.getCalcUrl}/frontend/dist/img/pro-features/v4/order-form-manager-banner.webp`;
});
</script>

<style scoped>
.ccb-order-form-without-pro {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  overflow: hidden;
}
</style>
