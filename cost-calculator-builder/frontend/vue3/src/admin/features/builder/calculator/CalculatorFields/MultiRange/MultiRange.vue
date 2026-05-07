<template>
  <div
    class="ccb-field ccb-multi-range-field"
    :class="{
      required: field.required,
      'ccb-field-disabled': field.disabled,
      [String(field.additionalStyles || '')]: true,
      [field.styles.style]: true,
    }"
  >
    <div class="ccb-field__label">
      <div class="ccb-field__title">
        <span
          class="ccb-field__title--title-box"
          style="display: flex; width: 100%; justify-content: space-between"
        >
          <span
            >{{ field.label
            }}<span v-if="field.required" class="ccb-field-required-mark"
              >*</span
            ></span
          >
          <span> {{ getSignValue }} </span>
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
import { computed, defineAsyncComponent, toRefs } from "vue";
import { IMultiRangeField } from "@/widget/shared/types/fields";
import { useAppearanceStore } from "@/admin/app/providers/stores/useAppearanceStore";

const appearanceStore = useAppearanceStore();

const props = defineProps<{
  field: IMultiRangeField;
}>();
const { field } = toRefs(props);

const getSignValue = computed(() => {
  return field.value.sign || "";
});

const currentComponents = computed(() => {
  const style = field.value.styles?.style || "default";
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

const accentColor = computed(
  () =>
    appearanceStore.getActivePreset?.desktop?.colors?.data?.accent_color
      ?.value || {},
) as any;

// const fieldBgColor = computed(
//   () =>
//     appearanceStore.getActivePreset?.desktop?.colors?.data?.secondary_color
//       ?.value || {},
// ) as any;
</script>

<style lang="scss">
.ccb-field {
  @media (min-width: 1025px) {
    &.field-width-25 {
      .ccb-multi-range-field {
        .ccb-input-multi-range-field {
          flex-direction: column;
          padding: 6px 0;
          gap: 25px;
          align-items: flex-start;
          .slider-target {
            padding: 0;
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
          &.ccb-modern-multi-range-field {
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, 24px) / 2 * -1);
              }
            }
          }
          &.ccb-flat-multi-range-field {
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, 32px) / 2 * -1);
              }
            }
          }
          &.ccb-multi-point-multi-range-field {
            .slider-origin {
              width: 100%;
            }
            .slider-base {
              .slider-handle {
                right: calc(var(--slider-handle-width, -10px) / 2 * -1);
              }
            }
          }
        }
      }
    }
  }
}
.ccb-multi-range-field {
  display: flex;
  flex-direction: column;
  padding: 20px 10px;

  .slider-base {
    background-color: v-bind(accentColor) !important;
  }

  .slider-tooltip,
  .slider-handle,
  .slider-connect {
    background-color: v-bind(accentColor) !important;
  }

  .slider-connects {
    cursor: pointer;
  }

  .slider-tooltip {
    color: var(--ccb-fields-color) !important;
    border-color: v-bind(accentColor) !important;
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
</style>
