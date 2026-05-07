<template>
  <section class="ccb-whats-new-slider">
    <div class="ccb-whats-new-slider__viewport">
      <span
        class="ccb-whats-new-slider__edge ccb-whats-new-slider__edge--left"
        :class="{ 'is-edge-hidden': isFirstSlide }"
        :aria-hidden="isFirstSlide"
        aria-label="Previous slide"
        @click="previous"
      >
        <i class="ccb-icon-ic_back"></i>
      </span>

      <Swiper
        :slides-per-view="1"
        :loop="false"
        class="ccb-whats-new-slider__swiper"
        @swiper="onSwiper"
        @slideChange="onSlideChange"
      >
        <SwiperSlide
          v-for="(slide, index) in normalizedSlides"
          :key="`${slide.title}-${index}`"
        >
          <div class="ccb-whats-new-slider__frame">
            <div class="ccb-whats-new-slider__content">
              <h2 class="ccb-whats-new-slider__title">{{ slide.title }}</h2>
              <div class="ccb-whats-new-slider__divider"></div>
              <p class="ccb-whats-new-slider__description">
                {{ slide.description }}
              </p>
              <div
                v-if="slide.upgradeBtn || slide.learnMoreBtn"
                class="ccb-whats-new-slider__actions"
              >
                <Button
                  v-if="slide.upgradeBtn && !isProActive"
                  :label="translations.getPro"
                  size="m"
                  type="dark-blue"
                  @click="emit('upgrade')"
                />
                <Button
                  v-if="slide.learnMoreBtn"
                  :label="translations.learnMore"
                  size="m"
                  type="blue"
                  @click="
                    emitLearnMore(
                      'https://stylemixthemes.com/wp/cost-calculator-4-0-everything-we-fixed-that-used-to-drive-you-crazy/',
                    )
                  "
                />
              </div>
            </div>

            <div class="ccb-whats-new-slider__preview">
              <div class="ccb-whats-new-slider__preview-media">
                <Transition name="ccb-whats-new-slider-fade" mode="out-in">
                  <img
                    :key="`${index}-${getSlideMode(index)}-${getSlideImage(slide, index)}`"
                    class="ccb-whats-new-slider__preview-image ccb-whats-new-slider__preview-image--main"
                    :class="{ 'ccb-whats-new-last': isLastSlide }"
                    :src="getSlideImage(slide, index)"
                    alt=""
                  />
                </Transition>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      <span
        class="ccb-whats-new-slider__edge ccb-whats-new-slider__edge--right"
        :class="{ 'is-edge-hidden': isLastSlide }"
        :aria-hidden="isLastSlide"
        aria-label="Next slide"
        @click="next"
      >
        <i class="ccb-icon-ic_next"></i>
      </span>
    </div>

    <div class="ccb-whats-new-slider__footer">
      <div class="ccb-whats-new-slider__dots">
        <button
          v-for="(_, index) in normalizedSlides"
          :key="index"
          type="button"
          class="ccb-whats-new-slider__dot"
          :class="{ 'is-active': index === currentIndex }"
          :aria-label="`Slide ${index + 1}`"
          @click="goTo(index)"
        ></button>
      </div>

      <div class="ccb-whats-new-slider__footer-actions">
        <template v-if="isFirstSlide && !isLastSlide">
          <Button
            :label="translations.whatsNewSkip"
            size="m"
            type="green"
            class="ccb-whats-new-slider__footer-pill"
            @click="emit('skip')"
          />
        </template>
        <template v-else-if="isLastSlide">
          <Button
            :label="translations.whatsNewFinish"
            size="m"
            type="green"
            class="ccb-whats-new-slider__footer-pill"
            @click="emit('finish')"
          />
        </template>
        <div
          v-else-if="hasCurrentBeforeAfter"
          class="ccb-whats-new-slider__compare-switch"
          role="group"
          aria-label="Before and after image switch"
        >
          <Button
            :label="translations.whatsNewBefore"
            size="m"
            class="ccb-whats-new-slider__compare-button"
            :class="[
              'ccb-whats-new-slider__compare-button--before',
              { 'is-active': getSlideMode(currentIndex) === 'before' },
            ]"
            @click="setSlideMode(currentIndex, 'before')"
          />
          <Button
            :label="translations.whatsNewAfter"
            size="m"
            class="ccb-whats-new-slider__compare-button"
            :class="[
              'ccb-whats-new-slider__compare-button--after',
              { 'is-active': getSlideMode(currentIndex) === 'after' },
            ]"
            @click="setSlideMode(currentIndex, 'after')"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFlowStore } from "@/admin/app/providers/stores/useFlowStore.ts";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { computed, ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Button } from "@/admin/shared/ui/UIKit";
import type { Swiper as SwiperType } from "swiper";
import "swiper/swiper-bundle.css";
import nextGeneration from "@/images/whats-new/next-generation.png";
import conditionalBefore from "@/images/whats-new/conditional-before.png";
import conditionalAfter from "@/images/whats-new/conditional-after.png";
import multiStepBefore from "@/images/whats-new/multi-step-before.png";
import multiStepAfter from "@/images/whats-new/multi-step-after.png";
import totalSummary from "@/images/whats-new/total-summary.png";
import newAtGlance from "@/images/whats-new/new-at-glance.png";
import buildCalcAfter from "@/images/whats-new/build-calc-after.png";
import buildCalcBefore from "@/images/whats-new/build-calc-before.png";

const flowStore = useFlowStore();
const translationsStore = useBuilderTranslationsStore();

const translations = computed(() => translationsStore.getTranslations);
const isProActive = computed(() => flowStore.getProActive);

interface SlideItem {
  title: string;
  description: string;
  upgradeBtn?: boolean;
  learnMoreBtn?: boolean;
  img?: string;
  beforeImg?: string;
  afterImg?: string;
}

type SlideImageMode = "before" | "after";

const props = withDefaults(
  defineProps<{
    slides?: SlideItem[];
  }>(),
  {
    slides: () => [
      {
        title: "Cost Calculator 4.0: The Next Generation",
        description:
          "Everything you need to build, customize, and manage calculators - now faster, more flexible, and completely reimagined.",
        upgradeBtn: true,
        learnMoreBtn: true,
        img: nextGeneration,
      },
      {
        title: "New Way to Build Calculators",
        description:
          "No more switching between edit and preview. Elements in the builder now look exactly the way they appear on your website, complete with layout controls and live styling.",
        upgradeBtn: true,
        learnMoreBtn: true,
        beforeImg: buildCalcBefore,
        afterImg: buildCalcAfter,
      },
      {
        title: "Take Full Control of Total Summary",
        description:
          "The Total Summary block is no longer locked into a fixed layout. Split it into sections, place each element exactly where it belongs, and build a structure around your business flow.",
        upgradeBtn: true,
        learnMoreBtn: true,
        img: totalSummary,
      },
      {
        title: "Reimagined Conditions",
        description:
          "Smart connection routing, zoom and auto-alignment controls, drag-and-drop support, and dedicated workspaces to split your logic into clean, separate groups.",
        upgradeBtn: true,
        learnMoreBtn: true,
        beforeImg: conditionalBefore,
        afterImg: conditionalAfter,
      },
      {
        title: "A Smoother Multi-Step Experience",
        description:
          "The multi-step workflow has been redesigned to feel native to the builder. Full visibility across pages, a cleaner navigation, and a more connected editing experience.",
        upgradeBtn: true,
        learnMoreBtn: true,
        beforeImg: multiStepBefore,
        afterImg: multiStepAfter,
      },
      {
        title: "Everything New at a Glance",
        description:
          "And there's more. Cost Calculator 4.0 brings a wave of improvements across the entire plugin.",
        upgradeBtn: true,
        learnMoreBtn: true,
        img: newAtGlance,
      },
    ],
  },
);

const emit = defineEmits<{
  (event: "upgrade"): void;
  (event: "learnMore", url: string): void;
  (event: "skip"): void;
  (event: "finish"): void;
}>();

const swiperInstance = ref<SwiperType | null>(null);
const currentIndex = ref(0);
const slideModes = ref<Record<number, SlideImageMode>>({});
const normalizedSlides = computed(() => props.slides ?? []);

const currentSlide = computed(
  () => normalizedSlides.value[currentIndex.value] ?? null,
);

const hasCurrentBeforeAfter = computed(() =>
  currentSlide.value ? hasBeforeAfterImages(currentSlide.value) : false,
);

const isFirstSlide = computed(() => currentIndex.value === 0);

const isLastSlide = computed(
  () =>
    normalizedSlides.value.length > 0 &&
    currentIndex.value === normalizedSlides.value.length - 1,
);

const hasBeforeAfterImages = (slide: SlideItem): boolean => {
  const before = (slide.beforeImg ?? "").trim();
  const after = (slide.afterImg ?? "").trim();
  return Boolean(before && after && before !== after);
};

const getSlideMode = (index: number): SlideImageMode =>
  slideModes.value[index] ?? "after";

const setSlideMode = (index: number, mode: SlideImageMode): void => {
  slideModes.value[index] = mode;
};

const getSlideImage = (slide: SlideItem, index: number): string => {
  if (hasBeforeAfterImages(slide)) {
    const currentMode = getSlideMode(index);
    const selectedImage =
      currentMode === "after" ? slide.afterImg : slide.beforeImg;
    return selectedImage || slide.beforeImg || slide.afterImg || "";
  }

  return slide.img || slide.beforeImg || slide.afterImg || "";
};

const onSwiper = (swiper: SwiperType): void => {
  swiperInstance.value = swiper;
  currentIndex.value = swiper.realIndex;
};

const onSlideChange = (swiper: SwiperType): void => {
  currentIndex.value = swiper.realIndex;
};

const next = (): void => {
  swiperInstance.value?.slideNext();
};

const previous = (): void => {
  swiperInstance.value?.slidePrev();
};

const goTo = (index: number): void => {
  if (!swiperInstance.value) return;
  swiperInstance.value.slideTo(index);
};

const emitLearnMore = (url?: string): void => {
  const normalizedUrl = (url ?? "").trim();
  if (!normalizedUrl) return;

  emit("learnMore", normalizedUrl);
};
</script>

<style scoped lang="scss">
.ccb-whats-new-slider {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  background: var(--ccb-input-normal);
  padding: 40px 0;

  &__viewport {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__swiper {
    width: calc(100% - 96px);
  }

  &__frame {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    min-height: 640px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 840px;
    text-align: center;
  }

  &__title {
    margin: 0;
    color: var(--ccb-font-labels);
    font-size: 32px;
    line-height: 1.323;
    font-weight: 700;
    font-family: "Red Hat Display", sans-serif;
  }

  &__divider {
    width: 100%;
    height: 1px;
    background: rgba(0, 0, 0, 0.16);
  }

  &__description {
    margin: 0;
    color: var(--ccb-font-text);
    font-size: 20px;
    line-height: 1.2;
    letter-spacing: 0.01em;
    font-weight: 500;
    font-family: "Red Hat Display", sans-serif;
  }

  &__actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  &__preview {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    width: 100%;
    max-width: 1024px;
    min-height: 478px;
    overflow: hidden;
  }

  &__preview-media {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  &__preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;

    &--main {
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 478px;
      object-fit: contain;
    }
  }

  &__footer {
    position: relative;
    width: 100%;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 24px;
    box-sizing: border-box;
    max-width: 1024px;
    margin: 16px auto 0;
  }

  &__footer-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;
    margin-left: auto;
    z-index: 1;
  }

  &__footer-pill {
    width: auto;
    min-width: 88px;
    height: 40px;
    min-height: 40px;
    border-radius: 99px;
    font-family: "Red Hat Display", sans-serif;
    font-size: 16px;
    line-height: 1.25;
    letter-spacing: 0.0125em;
    font-weight: 500;
  }

  &__dots {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 0;
    pointer-events: auto;
  }

  &__compare-switch {
    display: inline-flex;
    align-items: center;
    gap: 16px;
  }

  &__compare-button {
    width: 88px;
    min-width: 88px;
    height: 40px;
    min-height: 40px;
    border: 1px solid transparent;
    background: transparent;
    padding: 8px 16px;
    border-radius: 99px;
    font-family: "Red Hat Display", sans-serif;
    font-size: 16px;
    line-height: 1.25;
    letter-spacing: 0.0125em;
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;

    &--before {
      background: rgba(227, 48, 48, 0.08);
      color: var(--ccb-red-bg-normal);
    }

    &--after {
      background: rgba(0, 143, 60, 0.08);
      color: var(--ccb-green-bg-normal);
    }

    &.is-active {
      color: var(--ccb-button-w-normal);
    }

    &--before.is-active {
      background: var(--ccb-red-bg-normal);
      border-color: var(--ccb-red-bg-normal);
    }

    &--after.is-active {
      background: var(--ccb-green-bg-normal);
      border-color: var(--ccb-green-bg-normal);
    }
  }

  &__edge {
    width: 48px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--ccb-page-left);
    border-radius: 50%;
    flex: 0 0 48px;
    align-self: center;
    line-height: 1;
    cursor: pointer;
    margin: 0;
    position: relative;
    z-index: 2;
    opacity: 1;
    visibility: visible;
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease;

    &.is-edge-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      cursor: default;
    }

    i {
      color: var(--ccb-font-labels);
    }

    &--left {
      left: 80px;
    }

    &--right {
      right: 80px;
    }
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    padding: 0;
    background: var(--ccb-bw-disabled);
    cursor: pointer;

    &.is-active {
      background: var(--ccb-blue-bg-normal);
    }
  }

  @media screen and (max-width: 1120px) {
    padding: 24px 16px;

    &__edge {
      display: none;
    }

    &__swiper {
      width: 100%;
    }

    &__frame {
      min-height: auto;
    }

    &__title {
      font-size: 28px;
    }

    &__preview {
      min-height: 300px;
    }
  }
}

html[ccb-theme="dark"] {
  .ccb-whats-new-last {
    filter: invert(1);
  }
}

.ccb-whats-new-slider-fade-enter-active,
.ccb-whats-new-slider-fade-leave-active {
  transition: opacity 0.15s ease-in-out;
}

.ccb-whats-new-slider-fade-enter-from,
.ccb-whats-new-slider-fade-leave-to {
  opacity: 0;
}
</style>
