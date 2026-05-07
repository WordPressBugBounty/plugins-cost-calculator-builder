import { watch, nextTick } from "vue";
import { useBuilderHistory } from "./useBuilderHistory";

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split(".");
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] == null || typeof current[keys[i]] !== "object") {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = value;
}

/**
 * Watches the draft object deeply and syncs every change back to the
 * field in the store immediately. History tracking is handled by
 * useBuilderHistory's own deep watcher on builderFields.
 *
 * Returns a `suppressAutoSync` wrapper: call it around any code that
 * re-seeds the draft (e.g. syncDraftFromField) so the watcher does not
 * echo those writes back to the field as user changes.
 *
 * @param getField - accessor returning the live store field/section reference
 * @param draft    - the reactive draft object bound to sidebar controls
 * @param keyMap   - maps draft keys → field keys (supports dot-notation for
 *                   nested paths, e.g. "styles.elementColumns")
 */
export function useAutoSyncDraft<
  F extends object,
  D extends Record<string, unknown>,
>(getField: () => F, draft: D, keyMap?: Record<string, string>) {
  const { isRestoring, restoredVersion } = useBuilderHistory();
  let suppressed = false;

  async function suppressAutoSync(fn: () => void): Promise<void> {
    suppressed = true;
    fn();
    await nextTick();
    await nextTick();
    suppressed = false;
  }

  watch(
    () => JSON.parse(JSON.stringify(draft)) as D,
    (newDraft) => {
      if (suppressed || isRestoring.value) return;

      const field = getField() as unknown as Record<string, unknown>;
      if (!field) return;

      for (const draftKey of Object.keys(newDraft)) {
        const fieldKey = keyMap?.[draftKey] ?? draftKey;
        const serialized = JSON.stringify(newDraft[draftKey]);
        if (JSON.stringify(getNestedValue(field, fieldKey)) !== serialized) {
          setNestedValue(field, fieldKey, JSON.parse(serialized));
        }
      }
    },
    { deep: true },
  );

  return { suppressAutoSync, restoredVersion };
}
