<template>
  <section class="ccb-total-summary-empty">
    <header class="ccb-total-summary-empty__header">
      <h3 class="ccb-total-summary-empty__title">
        {{ translations.totalSummary }}
      </h3>
      <span class="ccb-total-summary-empty__toggle" aria-hidden="true">
        <i class="ccb-total-summary-empty__caret" />
      </span>
    </header>

    <div class="ccb-total-summary-empty__details">
      <div
        class="ccb-total-summary-empty__row ccb-total-summary-empty__row--first"
      >
        <span
          class="ccb-total-summary-empty__line ccb-total-summary-empty__line--left"
        />
        <span class="ccb-total-summary-empty__spacer" />
        <span
          class="ccb-total-summary-empty__line ccb-total-summary-empty__line--right ccb-total-summary-empty__line--40"
        />
      </div>

      <div
        class="ccb-total-summary-empty__row ccb-total-summary-empty__row--second"
      >
        <span
          class="ccb-total-summary-empty__line ccb-total-summary-empty__line--left"
        />
        <span class="ccb-total-summary-empty__spacer" />
        <span
          class="ccb-total-summary-empty__line ccb-total-summary-empty__line--right ccb-total-summary-empty__line--32"
        />
      </div>

      <div
        class="ccb-total-summary-empty__row ccb-total-summary-empty__row--third"
      >
        <span
          class="ccb-total-summary-empty__line ccb-total-summary-empty__line--left"
        />
        <span class="ccb-total-summary-empty__spacer" />
        <span
          class="ccb-total-summary-empty__line ccb-total-summary-empty__line--right ccb-total-summary-empty__line--40"
        />
      </div>

      <div
        class="ccb-total-summary-empty__row ccb-total-summary-empty__row--fourth"
      >
        <span
          class="ccb-total-summary-empty__line ccb-total-summary-empty__line--left"
        />
        <span class="ccb-total-summary-empty__spacer" />
        <span
          class="ccb-total-summary-empty__line ccb-total-summary-empty__line--right ccb-total-summary-empty__line--32"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";

const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);
</script>

<style scoped lang="scss">
.ccb-total-summary-empty {
  width: 100%;
  min-height: 286px;
  border-radius: 16px;
  border: 1px solid #eef1f7;
  background: var(--ccb-bgr-overlay, #fff);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ccb-total-summary-empty__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ccb-total-summary-empty__title {
  margin: 0;
  color: var(--ccb-font-heads, rgba(0, 0, 0, 0.9));
  font-family: "Red Hat Display", sans-serif;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 100%;
}

.ccb-total-summary-empty__toggle {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 99px;
  background: var(--ccb-bw-dull-normal, rgba(0, 0, 0, 0.04));
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ccb-total-summary-empty__caret {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 6px solid var(--ccb-font-heads, rgba(0, 0, 0, 0.9));
}

.ccb-total-summary-empty__details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ccb-total-summary-empty__row {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
}

.ccb-total-summary-empty__line {
  display: inline-block;
  height: 16px;
  border-radius: 99px;
  background: var(--ccb-bw-dull-normal, rgba(0, 0, 0, 0.04));
}

.ccb-total-summary-empty__line--left {
  width: 100%;
}

.ccb-total-summary-empty__line--right {
  justify-self: end;
}

.ccb-total-summary-empty__line--40 {
  width: 40px;
}

.ccb-total-summary-empty__line--32 {
  width: 32px;
}

.ccb-total-summary-empty__row--first .ccb-total-summary-empty__spacer {
  width: 64px;
}

.ccb-total-summary-empty__row--second .ccb-total-summary-empty__spacer {
  width: 104px;
}

.ccb-total-summary-empty__row--third .ccb-total-summary-empty__spacer {
  width: 96px;
}

.ccb-total-summary-empty__row--fourth .ccb-total-summary-empty__spacer {
  width: 40px;
}
</style>
