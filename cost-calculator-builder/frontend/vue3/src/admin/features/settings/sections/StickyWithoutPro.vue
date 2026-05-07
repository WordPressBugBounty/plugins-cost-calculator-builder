<template>
  <div class="ccb-settings-section">
    <ProBanner
      title="Sticky Calculator"
      description="Keep your calculator one click away at all times. Add a floating button or banner so visitors can get a quote from anywhere on the page"
      :image="imageUrl"
      :documentationLink="documentationLink"
      :upgradeLink="upgradeLink"
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
  url: "https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/sticky-calculator",
}));

const upgradeLink = computed<IProBannerLink>(() => ({
  label: "Upgrade Now",
  url: "https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=sticky_calculator",
}));

const imageUrl = computed(() => {
  return `${appStore.getCalcUrl}/frontend/dist/img/pro-features/v4/sticky-banner.webp`;
});
</script>
