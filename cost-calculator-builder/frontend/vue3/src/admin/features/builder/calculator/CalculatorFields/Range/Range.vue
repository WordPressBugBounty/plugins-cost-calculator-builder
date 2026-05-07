<template>
  <div
    class="ccb-field ccb-range-field"
    :class="{
      required: isRequired,
      'ccb-field-disabled': field.disabled,
      [additionalClasses]: true,
      [field.styles?.style]: true,
    }"
  >
    <div class="ccb-field__label">
      <div class="ccb-field__title">
        <span class="ccb-field__title--title-box">
          <span
            >{{ field.label
            }}<span v-if="field.required" class="ccb-field-required-mark"
              >*</span
            ></span
          >
          <span>
            {{ getSignValue }}
          </span>
        </span>
      </div>
      <div class="ccb-field__hidden" v-if="field.hidden">
        <i class="ccb-icon-ic_eye_crossed"></i>
      </div>
    </div>

    <div class="ccb-field-input__wrapper">
      <component :is="currentComponents" :field="field" />
    </div>

    <div class="ccb-field__descriptions ccb-after">
      <div v-if="field.description" class="ccb-field__description">
        {{ field.description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs, computed, defineAsyncComponent } from "vue";
import { IRangeField } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";

const appearanceStore = useAppearanceStore();
const accentColor = computed(
  () =>
    appearanceStore.getActivePreset?.desktop?.colors?.data?.accent_color
      ?.value || {},
) as any;

const props = defineProps<{
  field: IRangeField;
}>();
const { field } = toRefs(props);

import "@vueform/slider/themes/default.css";

const getSignValue = computed(() => {
  return field.value.sign || "";
});

const currentComponents = computed(() => {
  const style = field.value.styles?.style || "small";
  if (style === "default") {
    return defineAsyncComponent(() => import("./styles/Default.vue"));
  } else if (style === "small") {
    return defineAsyncComponent(() => import("./styles/Small.vue"));
  } else if (style === "flat-minimal") {
    return defineAsyncComponent(() => import("./styles/Flat.vue"));
  } else if (style === "modern") {
    return defineAsyncComponent(() => import("./styles/Modern.vue"));
  } else if (style === "input") {
    return defineAsyncComponent(() => import("./styles/Input.vue"));
  } else if (style === "multi-point") {
    return defineAsyncComponent(() => import("./styles/MultiPoint.vue"));
  }

  return "";
});

const isRequired = computed(() => {
  return field.value.required || false;
});

const additionalClasses = computed(() => {
  return field.value.additionalStyles || "";
});
</script>

<style lang="scss">
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-range-field {
        .ccb-input-range-field {
          flex-direction: column;
          padding: 6px 0;
          gap: 25px;
          align-items: flex-start;
          .custom-slider {
            width: 100%;
            padding-left: 0;
            .slider-handle {
              width: 20px !important;
              height: 20px !important;
              top: calc(
                (
                    var(--slider-handle-height, 16px) - var(
                        --slider-height,
                        6px
                      )
                  ) /
                  2 * -1 - 1px
              ) !important;
              box-shadow: 0px 5px 15px 0px rgba(0, 0, 0, 0.1);
            }
          }
        }
        .ccb-field__title--title-box {
          flex-direction: column;
        }
        .slider-wrapper {
          &.ccb-multi-point-range-field {
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, 16px) / 2 * -1);
              }
            }
          }
          &.ccb-modern-range-field {
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, 24px) / 2 * -1);
              }
            }
          }
          &.ccb-flat-range-field {
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, 32px) / 2 * -1);
              }
            }
          }
        }
      }
    }
  }
}
.ccb-range-field {
  display: flex;
  flex-direction: column;
  padding: 20px 10px;

  .slider-base {
    background-color: var(--ccb-fields-border-color) !important;
  }

  .slider-tooltip,
  .slider-handle,
  .slider-connect {
    background-color: v-bind(accentColor);
  }

  .slider-connects {
    cursor: pointer;
  }

  .slider-tooltip {
    color: var(--ccb-fields-color) !important;
    border-color: var(--ccb-accent-color) !important;
  }

  @media (max-width: 1024px) {
    .slider-tooltip {
      display: none !important;
    }

    .slider-handle.slider-active .slider-tooltip {
      display: block !important;
    }
  }

  .slider-handle:focus {
    box-shadow: none !important;
  }
  &.default {
    .ccb-field__descriptions {
      margin-top: 15px;
    }
  }
}

.ccb-field__title {
  &--title-box {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
}

:root {
  --slider-tooltip-min-width: 30px;
  --slider-connect-bg: var(--ccb-accent-color);
  --slider-bg: var();
  --slider-tooltip-bg: var(--ccb-accent-color);
  --slider-tooltip-color: var(--ccb-fields-text-color);
}
</style>
