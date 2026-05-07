<template>
  <div class="ccb-amdin-conditions">
    <ProBanner
      title="Conditional System"
      description="Make your calculator smart. Show, hide, or adjust fields dynamically based on user selections with a visual drag-and-connect builder"
      :image="imageUrl"
      :documentationLink="documentationLink"
      :upgradeLink="upgradeLink"
      :watchVideoLink="watchVideoLink"
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
  url: "https://docs.stylemixthemes.com/cost-calculator-builder/conditional-system/introduction",
}));

const upgradeLink = computed<IProBannerLink>(() => ({
  label: "Upgrade Now",
  url: "https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=conditions",
}));

const watchVideoLink = computed<IProBannerLink>(() => ({
  label: "Watch Video",
  url: "https://www.youtube.com/watch?v=xUwxooRP9Mg",
}));

const imageUrl = computed(() => {
  return `${appStore.getCalcUrl}/frontend/dist/img/pro-features/v4/conditions-banner.webp`;
});
</script>

<style scoped>
.ccb-amdin-conditions {
  width: 100%;
  height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
  row-gap: 1px;
  margin-top: 8px;
  overflow-x: hidden;
}
</style>
