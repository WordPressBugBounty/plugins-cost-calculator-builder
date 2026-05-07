<template>
  <div class="ccb-confirmation-without-pro">
    <ProBanner
      title="Confirmation Page"
      description="Don't leave clients guessing after they order. Show a custom confirmation page with order summary, PDF download, and next steps"
      :image="imageUrl"
      :documentationLink="documentationLink"
      :upgradeLink="upgradeLink"
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
  url: "https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/confirmation-page",
}));

const upgradeLink = computed<IProBannerLink>(() => ({
  label: "Upgrade Now",
  url: "https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=confirmationpage",
}));

const imageUrl = computed(() => {
  return `${appStore.getCalcUrl}/frontend/dist/img/pro-features/v4/confirm-banner.webp`;
});
</script>

<style scoped>
.ccb-confirmation-without-pro {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  overflow: hidden;
}
</style>
