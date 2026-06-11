import { onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";

const VISIBILITY_ATTR = "data-ccb-mobile-summary-visibility";
const CENTER_DIST_ATTR = "data-ccb-mobile-summary-center-dist";
const ACTIVE_EVENT = "ccb-mobile-summary-active-calc";
const STICKY_MODAL_Z_INDEX = 1060;

const isElementVisible = (element: HTMLElement): boolean => {
  return (
    !element.classList.contains("ccb-calc-hidden") &&
    element.getClientRects().length > 0
  );
};

const getCalculatorWidgets = (): HTMLElement[] => {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".ccb-main-widget[data-calc-id]"),
  ).filter(isElementVisible);
};

const getStickyModalElement = (calcId: number): HTMLElement | null => {
  return document.getElementById(`ccb-sticky-calc-modal-${calcId}`);
};

const isStickyModalOpen = (calcId: number): boolean => {
  return getStickyModalElement(calcId)?.classList.contains("show") ?? false;
};

const getVisibleCalculatorRoot = (calcId: number): HTMLElement | null => {
  const widgets = Array.from(
    document.querySelectorAll<HTMLElement>(
      `.ccb-main-widget[data-calc-id="${calcId}"]`,
    ),
  );

  if (!widgets.length) {
    return document.getElementById(`ccb_app_${calcId}`);
  }

  const stickyModal = getStickyModalElement(calcId);
  if (stickyModal?.classList.contains("show")) {
    const widgetInModal = widgets.find((widget) =>
      stickyModal.contains(widget),
    );
    if (widgetInModal && isElementVisible(widgetInModal)) {
      return widgetInModal;
    }
  }

  return widgets.find(isElementVisible) ?? widgets[0] ?? null;
};

const getOpenStickyModalCalcId = (): string | null => {
  const openModals = document.querySelectorAll<HTMLElement>(
    ".ccb-sticky-modal.show",
  );

  for (const modal of openModals) {
    const calcId = modal.id.replace("ccb-sticky-calc-modal-", "");
    const widget = modal.querySelector<HTMLElement>(
      `.ccb-main-widget[data-calc-id="${calcId}"]`,
    );

    if (widget && isElementVisible(widget)) {
      return calcId;
    }
  }

  return null;
};

const pickActiveCalcId = (): string | null => {
  const openModalCalcId = getOpenStickyModalCalcId();
  if (openModalCalcId) {
    return openModalCalcId;
  }

  const widgets = getCalculatorWidgets();

  if (widgets.length <= 1) {
    const widget = widgets[0];
    if (!widget) {
      return null;
    }

    const ratioAttr = widget.getAttribute(VISIBILITY_ATTR);
    if (ratioAttr === null) {
      return widget.getAttribute("data-calc-id");
    }

    const ratio = Number.parseFloat(ratioAttr);
    return ratio > 0 ? widget.getAttribute("data-calc-id") : null;
  }

  let winner: string | null = null;
  let bestRatio = -1;
  let bestCenterDist = Infinity;

  widgets.forEach((widget) => {
    const ratio = Number.parseFloat(
      widget.getAttribute(VISIBILITY_ATTR) ?? "0",
    );
    const centerDist = Number.parseFloat(
      widget.getAttribute(CENTER_DIST_ATTR) ?? "Infinity",
    );

    if (ratio <= 0) {
      return;
    }

    if (
      ratio > bestRatio ||
      (ratio === bestRatio && centerDist < bestCenterDist)
    ) {
      bestRatio = ratio;
      bestCenterDist = centerDist;
      winner = widget.getAttribute("data-calc-id");
    }
  });

  return winner;
};

const broadcastActiveCalc = (): void => {
  window.dispatchEvent(
    new CustomEvent(ACTIVE_EVENT, {
      detail: { calcId: pickActiveCalcId() },
    }),
  );
};

let scrollListenerCount = 0;
let scrollRafId: number | null = null;

const scheduleRecalculate = (): void => {
  if (scrollRafId !== null) {
    return;
  }

  scrollRafId = window.requestAnimationFrame(() => {
    scrollRafId = null;
    broadcastActiveCalc();
  });
};

const ensureGlobalListeners = (): void => {
  if (scrollListenerCount !== 0) {
    return;
  }

  window.addEventListener("scroll", scheduleRecalculate, { passive: true });
  window.addEventListener("resize", scheduleRecalculate, { passive: true });
};

const releaseGlobalListeners = (): void => {
  if (scrollListenerCount !== 0) {
    return;
  }

  window.removeEventListener("scroll", scheduleRecalculate);
  window.removeEventListener("resize", scheduleRecalculate);
};

export const useMobileSummaryActiveTrigger = (
  calcId: Ref<number | null>,
  isSummaryOpen: Ref<boolean>,
) => {
  const isTriggerActive = ref(true);
  const isInStickyModal = ref(false);

  let observer: IntersectionObserver | null = null;
  let stickyModalElement: HTMLElement | null = null;

  const updateStickyModalState = (): void => {
    if (calcId.value === null) {
      isInStickyModal.value = false;
      return;
    }

    const modalOpen = isStickyModalOpen(calcId.value);
    isInStickyModal.value = modalOpen && !isSummaryOpen.value;
  };

  const syncTriggerVisibility = (activeCalcId: string | null): void => {
    updateStickyModalState();

    if (isSummaryOpen.value || isInStickyModal.value) {
      isTriggerActive.value = true;
      return;
    }

    if (!activeCalcId || calcId.value === null) {
      isTriggerActive.value = false;
      return;
    }

    isTriggerActive.value = String(calcId.value) === activeCalcId;
  };

  const handleActiveChange = (event: Event): void => {
    const detail = (event as CustomEvent<{ calcId: string | null }>).detail;
    syncTriggerVisibility(detail?.calcId ?? null);
  };

  const handleStickyModalShown = (): void => {
    updateStickyModalState();
    isTriggerActive.value = true;
    broadcastActiveCalc();
  };

  const handleStickyModalHidden = (): void => {
    updateStickyModalState();
    broadcastActiveCalc();
  };

  watch(isSummaryOpen, (isOpen) => {
    updateStickyModalState();

    if (isOpen) {
      isTriggerActive.value = true;
      return;
    }

    broadcastActiveCalc();
  });

  onMounted(() => {
    if (typeof window === "undefined" || calcId.value === null) {
      return;
    }

    const root = getVisibleCalculatorRoot(calcId.value);
    if (!root) {
      return;
    }

    updateStickyModalState();

    stickyModalElement = getStickyModalElement(calcId.value);
    stickyModalElement?.addEventListener(
      "shown.bs.modal",
      handleStickyModalShown,
    );
    stickyModalElement?.addEventListener(
      "hidden.bs.modal",
      handleStickyModalHidden,
    );

    if (isStickyModalOpen(calcId.value)) {
      isTriggerActive.value = true;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          target.setAttribute(VISIBILITY_ATTR, String(entry.intersectionRatio));

          const rect = entry.boundingClientRect;
          const centerDist = Math.abs(
            (rect.top + rect.bottom) / 2 - window.innerHeight / 2,
          );
          target.setAttribute(CENTER_DIST_ATTR, String(centerDist));
        });

        scheduleRecalculate();
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    observer.observe(root);
    window.addEventListener(ACTIVE_EVENT, handleActiveChange);
    ensureGlobalListeners();
    scrollListenerCount += 1;
    broadcastActiveCalc();
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
    window.removeEventListener(ACTIVE_EVENT, handleActiveChange);

    stickyModalElement?.removeEventListener(
      "shown.bs.modal",
      handleStickyModalShown,
    );
    stickyModalElement?.removeEventListener(
      "hidden.bs.modal",
      handleStickyModalHidden,
    );

    scrollListenerCount = Math.max(0, scrollListenerCount - 1);
    releaseGlobalListeners();
    scheduleRecalculate();
  });

  return {
    isTriggerActive,
    isInStickyModal,
    stickyModalZIndex: STICKY_MODAL_Z_INDEX,
  };
};
