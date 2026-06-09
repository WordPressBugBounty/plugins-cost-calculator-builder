import { ref, computed, watch, type WatchStopHandle } from "vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import type { IPageBreaker } from "@/admin/shared/types/fields.type";
import type { ISettings } from "@/admin/shared/types/settings.type";

const MAX_HISTORY = 50;

interface IHistorySnapshotPayload {
  fields: IPageBreaker[];
  settings: ISettings | null;
}

/**
 * The undo stack stores snapshots of previous states (builder fields + settings).
 * `lastKnownSnapshot` tracks the state before the most recent change,
 * so we can push it onto the undo stack when the next change arrives.
 */
const undoStack = ref<string[]>([]);
const redoStack = ref<string[]>([]);
const savedBaseline = ref<string>("");
const lastKnownSnapshot = ref<string>("");
const isSaving = ref(false);
const isRestoring = ref(false);
const restoredVersion = ref(0);
let snapshotTimer: ReturnType<typeof setTimeout> | null = null;
let stopFieldsWatcher: WatchStopHandle | null = null;
let stopSettingsWatcher: WatchStopHandle | null = null;

function currentSnapshot(): string {
  const builderStore = useBuilderStore();
  const settingsStore = useSettingsStore();
  const payload: IHistorySnapshotPayload = {
    fields: builderStore.getBuilderFields,
    settings: settingsStore.getSettings,
  };
  return JSON.stringify(payload);
}

function parseSnapshot(snapshot: string): IHistorySnapshotPayload {
  const parsed: unknown = JSON.parse(snapshot);

  if (
    parsed &&
    typeof parsed === "object" &&
    "fields" in parsed &&
    Array.isArray((parsed as IHistorySnapshotPayload).fields)
  ) {
    const payload = parsed as IHistorySnapshotPayload;
    return {
      fields: payload.fields,
      settings: payload.settings ?? null,
    };
  }

  // Legacy snapshots stored only builder fields as a JSON array.
  if (Array.isArray(parsed)) {
    return { fields: parsed as IPageBreaker[], settings: null };
  }

  throw new Error("Invalid builder history snapshot");
}

function restoreSnapshot(snapshot: string): void {
  const builderStore = useBuilderStore();
  const settingsStore = useSettingsStore();
  const { fields, settings } = parseSnapshot(snapshot);

  isRestoring.value = true;
  builderStore.builderFields = fields;

  if (settings !== null) {
    settingsStore.setSettings(settings);
  }

  if (builderStore.selectedFieldAlias) {
    const stillExists = builderStore.getSelectedField;
    if (!stillExists) {
      builderStore.setSelectedField(null);
    }
  }

  lastKnownSnapshot.value = snapshot;
  isRestoring.value = false;
  restoredVersion.value++;
}

function commitPending(): void {
  if (snapshotTimer) {
    clearTimeout(snapshotTimer);
    snapshotTimer = null;
  }

  const snap = currentSnapshot();
  if (snap === lastKnownSnapshot.value) return;

  undoStack.value.push(lastKnownSnapshot.value);
  if (undoStack.value.length > MAX_HISTORY) {
    undoStack.value.shift();
  }
  redoStack.value = [];
  lastKnownSnapshot.value = snap;
}

export function useBuilderHistory() {
  const builderStore = useBuilderStore();
  const settingsStore = useSettingsStore();

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  const isDirty = computed(() => {
    if (!savedBaseline.value) return false;
    return currentSnapshot() !== savedBaseline.value;
  });

  function initHistory(): void {
    const snap = currentSnapshot();
    savedBaseline.value = snap;
    lastKnownSnapshot.value = snap;
    undoStack.value = [];
    redoStack.value = [];

    if (stopFieldsWatcher) stopFieldsWatcher();
    if (stopSettingsWatcher) stopSettingsWatcher();

    stopFieldsWatcher = watch(
      () => builderStore.builderFields,
      () => {
        if (isRestoring.value) return;
        pushSnapshot();
      },
      { deep: true },
    );

    stopSettingsWatcher = watch(
      () => settingsStore.settings,
      () => {
        if (isRestoring.value) return;
        pushSnapshot();
      },
      { deep: true },
    );
  }

  function refreshBaseline(): void {
    const snap = currentSnapshot();
    savedBaseline.value = snap;
    lastKnownSnapshot.value = snap;
  }

  function pushSnapshot(): void {
    if (isRestoring.value) return;

    if (snapshotTimer) {
      clearTimeout(snapshotTimer);
    }

    snapshotTimer = setTimeout(() => {
      snapshotTimer = null;
      commitPending();
    }, 300);
  }

  function pushSnapshotImmediate(): void {
    if (isRestoring.value) return;
    if (snapshotTimer) {
      clearTimeout(snapshotTimer);
      snapshotTimer = null;
    }
    commitPending();
  }

  function undo(): void {
    if (!canUndo.value) return;

    if (snapshotTimer) {
      clearTimeout(snapshotTimer);
      snapshotTimer = null;
    }

    redoStack.value.push(lastKnownSnapshot.value);
    const previous = undoStack.value.pop()!;
    restoreSnapshot(previous);
  }

  function redo(): void {
    if (!canRedo.value) return;

    if (snapshotTimer) {
      clearTimeout(snapshotTimer);
      snapshotTimer = null;
    }

    undoStack.value.push(lastKnownSnapshot.value);
    const next = redoStack.value.pop()!;
    restoreSnapshot(next);
  }

  function markSaved(): void {
    if (snapshotTimer) {
      clearTimeout(snapshotTimer);
      snapshotTimer = null;
    }
    const snap = currentSnapshot();
    savedBaseline.value = snap;
    lastKnownSnapshot.value = snap;
    undoStack.value = [];
    redoStack.value = [];
  }

  function handleKeydown(e: KeyboardEvent): void {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (!mod) return;

    if (e.key === "z" || e.key === "Z") {
      if (e.shiftKey) {
        e.preventDefault();
        redo();
      } else {
        e.preventDefault();
        undo();
      }
    }
  }

  function setupKeyboardShortcuts(): void {
    document.addEventListener("keydown", handleKeydown);
  }

  function teardownKeyboardShortcuts(): void {
    document.removeEventListener("keydown", handleKeydown);
    if (stopFieldsWatcher) {
      stopFieldsWatcher();
      stopFieldsWatcher = null;
    }
    if (stopSettingsWatcher) {
      stopSettingsWatcher();
      stopSettingsWatcher = null;
    }
  }

  return {
    canUndo,
    canRedo,
    isDirty,
    isSaving,
    isRestoring,
    restoredVersion,
    initHistory,
    refreshBaseline,
    pushSnapshot,
    pushSnapshotImmediate,
    undo,
    redo,
    markSaved,
    setupKeyboardShortcuts,
    teardownKeyboardShortcuts,
  };
}
