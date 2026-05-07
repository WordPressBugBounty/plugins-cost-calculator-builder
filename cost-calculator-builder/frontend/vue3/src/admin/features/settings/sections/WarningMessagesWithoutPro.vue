<template>
  <div class="ccb-settings-section">
    <ProBanner
      title="Warning messages"
      description="Guide users, don't confuse them. Write custom warning and error messages that match your brand voice and language"
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
  url: "https://docs.stylemixthemes.com/cost-calculator-builder/cost-calculator-settings/calculator-settings/warning-texts",
}));

const upgradeLink = computed<IProBannerLink>(() => ({
  label: "Upgrade Now",
  url: "https://stylemixthemes.com/cost-calculator-plugin/pricing/?utm_source=calcwpadmin&utm_medium=freetoprobutton&utm_campaign=warning-texts",
}));

const imageUrl = computed(() => {
  return `${appStore.getCalcUrl}/frontend/dist/img/pro-features/v4/warning-texts-banner.webp`;
});
</script>
