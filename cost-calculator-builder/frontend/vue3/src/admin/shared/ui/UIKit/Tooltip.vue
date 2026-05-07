<template>
  <span class="ccb-tooltip" ref="wrapperRef">
    <slot v-if="hasTrigger || showDefaultIcon">
      <i
        class="ccb-tooltip__icon ccb-icon-circle-question"
        tabindex="0"
        :aria-label="text"
      ></i>
    </slot>

    <Teleport to="body">
      <transition name="ccb-tooltip-fade">
        <div
          v-if="visible && hasContent"
          ref="bubbleRef"
          class="ccb-tooltip__bubble"
          :class="[
            `ccb-tooltip__bubble--${placement}`,
            bubbleClass,
            {
              'ccb-tooltip__bubble--interactive': interactive,
            },
          ]"
          :style="bubbleStyle"
          role="tooltip"
          @mouseenter="onBubbleMouseEnter"
          @mouseleave="onBubbleMouseLeave"
        >
          <slot name="content">
            <span class="ccb-tooltip__text">{{ text }}</span>
          </slot>
          <span class="ccb-tooltip__arrow" :style="arrowStyle"></span>
        </div>
      </transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useSlots, watch } from "vue";

type TooltipPlacement = "top" | "bottom" | "left" | "right";
type TooltipTarget = HTMLElement | string;

const props = withDefaults(
  defineProps<{
    text?: string;
    placement?: TooltipPlacement;
    maxWidth?: number;
    offset?: number;
    disabled?: boolean;
    target?: TooltipTarget;
    interactive?: boolean;
    hideDelay?: number;
    showDefaultIcon?: boolean;
    bubbleClass?: string;
  }>(),
  {
    placement: "top",
    maxWidth: 240,
    offset: 8,
    disabled: false,
    interactive: true,
    hideDelay: 80,
    showDefaultIcon: true,
  },
);

const slots = useSlots();
const wrapperRef = ref<HTMLElement | null>(null);
const bubbleRef = ref<HTMLElement | null>(null);
const visible = ref(false);
const bubbleStyle = ref<Record<string, string>>({});
const arrowStyle = ref<Record<string, string>>({});
const targetElement = ref<HTMLElement | null>(null);
const isTargetHovered = ref(false);
const isBubbleHovered = ref(false);
let hideTimer: number | null = null;

const hasContent = computed(() => Boolean(props.text || slots.content));
const hasTrigger = computed(() => Boolean(slots.default));

const clearHideTimer = (): void => {
  if (hideTimer) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }
};

const resolveTargetElement = (): HTMLElement | null => {
  if (props.target instanceof HTMLElement) {
    return props.target;
  }

  const wrapper = wrapperRef.value;
  if (!props.target) {
    return wrapper;
  }

  return (
    wrapper?.closest<HTMLElement>(props.target) ||
    document.querySelector<HTMLElement>(props.target)
  );
};

const computePosition = (): void => {
  const anchor = targetElement.value || wrapperRef.value;
  if (!anchor) return;

  const rect = anchor.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const margin = 8;
  const bubbleWidth = bubbleRef.value?.offsetWidth || props.maxWidth;

  const style: Record<string, string> = {
    position: "fixed",
    maxWidth: `${props.maxWidth}px`,
    zIndex: "100000",
  };

  let left = 0;
  let top = 0;
  const arrow: Record<string, string> = {};

  switch (props.placement) {
    case "bottom":
      top = rect.bottom + props.offset;
      left = rect.left + rect.width / 2;
      style.transform = "translateX(-50%)";
      arrow.left = "50%";
      arrow.top = "-4px";
      arrow.transform = "translateX(-50%) rotate(45deg)";
      break;
    case "left":
      top = rect.top + rect.height / 2;
      left = rect.left - props.offset;
      style.transform = "translate(-100%, -50%)";
      arrow.top = "50%";
      arrow.right = "-4px";
      arrow.transform = "translateY(-50%) rotate(45deg)";
      break;
    case "right":
      top = rect.top + rect.height / 2;
      left = rect.right + props.offset;
      style.transform = "translateY(-50%)";
      arrow.top = "50%";
      arrow.left = "-4px";
      arrow.transform = "translateY(-50%) rotate(45deg)";
      break;
    case "top":
    default:
      top = rect.top - props.offset;
      left = rect.left + rect.width / 2;
      style.transform = "translate(-50%, -100%)";
      arrow.left = "50%";
      arrow.bottom = "-4px";
      arrow.transform = "translateX(-50%) rotate(45deg)";
      break;
  }

  style.top = `${top}px`;
  style.left = `${left}px`;

  if (props.placement === "top" || props.placement === "bottom") {
    const halfWidth = bubbleWidth / 2;
    if (left - halfWidth < margin) {
      style.left = `${margin}px`;
      style.transform =
        props.placement === "top" ? "translateY(-100%)" : "translateY(0)";
      arrow.left = `${rect.left + rect.width / 2 - margin}px`;
    } else if (left + halfWidth > viewportWidth - margin) {
      style.left = `${viewportWidth - margin}px`;
      style.transform =
        props.placement === "top"
          ? "translate(-100%, -100%)"
          : "translateX(-100%)";
      arrow.left = "auto";
      arrow.right = `${viewportWidth - margin - (rect.left + rect.width / 2) - 4}px`;
    }
  }

  bubbleStyle.value = style;
  arrowStyle.value = arrow;
};

const show = async (): Promise<void> => {
  if (props.disabled || !hasContent.value) return;
  clearHideTimer();
  visible.value = true;
  await nextTick();
  computePosition();
};

const hide = (): void => {
  clearHideTimer();
  visible.value = false;
  isTargetHovered.value = false;
  isBubbleHovered.value = false;
};

const scheduleHide = (): void => {
  clearHideTimer();
  hideTimer = window.setTimeout(() => {
    if (!isTargetHovered.value && !isBubbleHovered.value) {
      hide();
    }
  }, props.hideDelay);
};

const onTargetMouseEnter = (): void => {
  isTargetHovered.value = true;
  void show();
};

const onTargetMouseLeave = (): void => {
  isTargetHovered.value = false;
  scheduleHide();
};

const onTargetFocusIn = (): void => {
  void show();
};

const onTargetFocusOut = (event: FocusEvent): void => {
  const nextTarget = event.relatedTarget as Node | null;

  if (
    nextTarget &&
    (targetElement.value?.contains(nextTarget) ||
      bubbleRef.value?.contains(nextTarget))
  ) {
    return;
  }

  scheduleHide();
};

const onBubbleMouseEnter = (): void => {
  if (!props.interactive) return;

  isBubbleHovered.value = true;
  clearHideTimer();
};

const onBubbleMouseLeave = (): void => {
  if (!props.interactive) return;

  isBubbleHovered.value = false;
  scheduleHide();
};

const removeTargetListeners = (): void => {
  if (!targetElement.value) return;

  targetElement.value.removeEventListener("mouseenter", onTargetMouseEnter);
  targetElement.value.removeEventListener("mouseleave", onTargetMouseLeave);
  targetElement.value.removeEventListener("focusin", onTargetFocusIn);
  targetElement.value.removeEventListener("focusout", onTargetFocusOut);
};

const bindTargetListeners = async (): Promise<void> => {
  await nextTick();
  removeTargetListeners();
  targetElement.value = resolveTargetElement();

  if (!targetElement.value) return;

  targetElement.value.addEventListener("mouseenter", onTargetMouseEnter);
  targetElement.value.addEventListener("mouseleave", onTargetMouseLeave);
  targetElement.value.addEventListener("focusin", onTargetFocusIn);
  targetElement.value.addEventListener("focusout", onTargetFocusOut);
};

const onScrollOrResize = (): void => {
  if (visible.value) computePosition();
};

watch(
  () => props.target,
  () => {
    void bindTargetListeners();
  },
);

watch(visible, (value) => {
  if (value) {
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
  } else {
    window.removeEventListener("scroll", onScrollOrResize, true);
    window.removeEventListener("resize", onScrollOrResize);
  }
});

void bindTargetListeners();

onBeforeUnmount(() => {
  clearHideTimer();
  removeTargetListeners();
  window.removeEventListener("scroll", onScrollOrResize, true);
  window.removeEventListener("resize", onScrollOrResize);
});
</script>

<style lang="scss">
.ccb-tooltip {
  display: inline-flex;
  align-items: center;
  line-height: 1;

  &__icon {
    color: var(--ccb-font-comment);
    cursor: help;
    font-size: 14px;
    line-height: 1;
    outline: none;
    transition: color 0.15s ease-in-out;

    &:hover,
    &:focus-visible {
      color: var(--ccb-font-labels, #111827);
    }
  }

  &__bubble {
    background: var(--ccb-tooltip-bg, #1f2937);
    color: var(--ccb-tooltip-fg, #ffffff);
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    pointer-events: none;
    word-wrap: break-word;

    &--interactive {
      pointer-events: auto;
    }
  }

  &__text {
    display: block;
    max-width: 100%;
    min-width: 200px;
    white-space: normal;
    word-wrap: break-word;
  }

  &__arrow {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--ccb-tooltip-bg, #1f2937);
  }
}

.ccb-tooltip-fade-enter-active,
.ccb-tooltip-fade-leave-active {
  transition:
    opacity 0.12s ease-in-out,
    transform 0.12s ease-in-out;
}

.ccb-tooltip-fade-enter-from,
.ccb-tooltip-fade-leave-to {
  opacity: 0;
}
</style>
