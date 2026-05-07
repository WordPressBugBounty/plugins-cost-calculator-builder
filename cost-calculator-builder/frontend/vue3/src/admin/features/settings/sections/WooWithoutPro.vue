<template>
  <div class="ccb-settings-section">
    <ProBanner
      title="Woo Products & Checkout"
      description="Sell custom-priced products through WooCommerce. Attach your calculator to any product and send the calculated price straight to cart and checkout"
      :image="imageUrl"
      :documentationLink="documentationLink"
      :upgradeLink="upgradeLink"
      :watchVideoLink="watchVideoLink"
      imageMaxWidth="592px"
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
  url: "https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/woo-checkout",
}));

const upgradeLink = computed<IProBannerLink>(() => ({
  label: "Upgrade Now",
  url: "https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=woo_checkout",
}));

const watchVideoLink = computed<IProBannerLink>(() => ({
  label: "Watch Video",
  url: "https://www.youtube.com/watch?v=vO-JlXKvwes&feature=youtu.be",
}));

const imageUrl = computed(() => {
  return `${appStore.getCalcUrl}/frontend/dist/img/pro-features/v4/woo-banner.webp`;
});
</script>
