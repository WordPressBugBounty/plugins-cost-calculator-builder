<template>
  <div class="ccb-conditions-space-modal">
    <div class="ccb-conditions-space-modal-overlay"></div>

    <div class="ccb-conditions-space-modal-content">
      <div class="ccb-conditions-space-modal-content-header">
        <Text text="Spaces" size="mx" weight="bold" />
        <span class="ccb-space-modal-close" @click="closeModal">
          <i class="ccb-icon-ic_cross_big"></i>
        </span>
      </div>
      <div class="ccb-conditions-space-modal-content-body">
        <div class="ccb-condition-spaces" ref="parent">
          <div
            class="ccb-condition-spaces__item"
            v-for="(space, idx) in spaces_list"
            :key="`space-${space.id}`"
          >
            <div class="ccb-condition-spaces__item-inner">
              <div class="ccb-condition-spaces__item-drag">
                <i class="ccb-icon-drag-dots"></i>
              </div>
              <div class="ccb-condition-spaces__item-index">
                <Text :text="`${idx + 1}`" size="m" weight="medium" />
              </div>
              <div class="ccb-condition-spaces__item-content">
                <Input placeholder="Enter name" v-model="space.label" />
              </div>
              <div
                class="ccb-condition-spaces__item-remove"
                :class="{ 'ccb-disabled': draft.length === 1 }"
                @click="showRemoveSpace(space.slug)"
              >
                <i class="ccb-icon-close-x"></i>
              </div>
            </div>
            <div
              class="ccb-condition-spaces__item-info"
              v-if="removeSpaceState && removeSpaceSlug === space.slug"
            >
              <Text
                text="Deleting a Space will also remove all its Conditions."
                size="xs"
                weight="regular"
              />
              <div class="ccb-condition-spaces__item-info--actions">
                <Button
                  label="Cancel"
                  type="default"
                  size="xs"
                  class="ccb-custom-btn"
                  @click="cancelRemoveSpace"
                />
                <Button
                  label="Delete"
                  type="red-ghost"
                  size="xs"
                  class="ccb-custom-btn"
                  @click="removeSpace(removeSpaceSlug)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="ccb-conditions-space-modal-content-footer">
        <div class="ccb-add-space" @click="addSpace">
          <i class="ccb-icon-ic_plus_big"></i>
        </div>
        <div>
          <Button label="Done" type="default" size="m" @click="saveSpaces" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Text, Button, Input } from "@/admin/shared/ui/UIKit";
import { useConditionsStore } from "@/admin/app/providers/stores/useConditionsStore";
import { useBuilderTranslationsStore } from "@/admin/app/providers/stores/useTranslationsStore";
import { type ISpace } from "@/admin/shared/types/conditions.type";
import { useGenerateId } from "@/admin/shared/utils/useGenerateId";
import { animations } from "@formkit/drag-and-drop";
import { useDragAndDrop } from "@formkit/drag-and-drop/vue";

const conditionsStore = useConditionsStore();
const translationsStore = useBuilderTranslationsStore();
const translations = computed(() => translationsStore.getTranslations);

const draft = ref<ISpace[]>(
  JSON.parse(JSON.stringify(conditionsStore.getSpaces)),
);

const sortedDraft = computed({
  get() {
    return [...draft.value].sort((a, b) => a.sort_id - b.sort_id);
  },
  set(value: ISpace[]) {
    draft.value = value;
  },
});

defineProps<{}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const removeSpaceState = ref<boolean>(false);
const removeSpaceSlug = ref<string>("");

const removeSpace = (slug: string) => {
  sortedDraft.value = sortedDraft.value.filter((space) => space.slug !== slug);
  removeSpaceState.value = false;
  removeSpaceSlug.value = "";
};

const cancelRemoveSpace = () => {
  removeSpaceState.value = false;
  removeSpaceSlug.value = "";
};

const closeModal = () => {
  emit("close");
};

const showRemoveSpace = (slug: string) => {
  removeSpaceState.value = true;
  removeSpaceSlug.value = slug;
};

const addSpace = () => {
  const newSpace = useGenerateId();
  const ids = draft.value.map((space) => space.id);
  const sort_ids = draft.value.map((space) => space.sort_id);
  const maxID = (Math.max(...ids) || 1) + 1;
  const maxSortID = (Math.max(...sort_ids) || 0) + 1;

  sortedDraft.value = [
    ...sortedDraft.value,
    {
      id: maxID,
      label: `${translations.value.space} ${maxID}`,
      slug: newSpace,
      sort_id: maxSortID,
    },
  ];
};

const saveSpaces = () => {
  conditionsStore.setSpaces(draft.value);
  conditionsStore.checkCurrentSpace();
  conditionsStore.syncNodesAndEdgesToSpaces();
  closeModal();
};

const [parent, spaces_list] = useDragAndDrop<ISpace>(sortedDraft.value, {
  plugins: [animations()],
  dragHandle: ".ccb-condition-spaces__item-drag",
  dragEffectAllowed: "move",
  dragDropEffect: "none",

  onSort(event: any): void {
    const spacesClone: ISpace[] = [];
    for (let i = 0; i < event.values.length; i++) {
      event.values[i].sort_id = i + 1;
      spacesClone.push(event.values[i]);
    }
    sortedDraft.value = [...spacesClone];
  },
});

watch(
  sortedDraft,
  (next) => {
    const current = spaces_list.value;
    const structureChanged =
      next.length !== current.length ||
      next.some((s, i) => s.slug !== current[i]?.slug);
    if (structureChanged) {
      spaces_list.value = JSON.parse(JSON.stringify(next));
    }
  },
  { immediate: true },
);

watch(
  spaces_list,
  (list) => {
    for (const item of list) {
      const source = draft.value.find((s) => s.slug === item.slug);
      if (source && source.label !== item.label) {
        source.label = item.label;
      }
    }
  },
  { deep: true },
);
</script>

<style lang="scss">
.ccb-conditions-space-modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ccb-conditions-space-modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  cursor: pointer;
}

.ccb-conditions-space-modal-content {
  position: relative;
  z-index: 1;
  max-width: 360px;
  width: 100%;
  height: max-content;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 5px 30px 0 rgba(0, 0, 0, 0.15);
  padding: 24px;
  min-height: 300px;
  max-height: 500px;
  position: relative;
  top: -50px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  row-gap: 16px;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-body {
    display: flex;
    flex-direction: column;
    max-height: 400px;
    overflow-y: auto;
    flex: 1;

    .ccb-condition-spaces {
      display: flex;
      flex-direction: column;
      row-gap: 4px;

      &__item {
        width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 4px;

        &-info {
          width: 100%;
          height: 48px;
          border-radius: 16px;
          background: rgba(0, 0, 0, 0.04);
          padding: 0 16px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          & > div {
            flex: 1;
          }

          &--actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            column-gap: 8px;
            overflow: hidden;
            white-space: nowrap;
          }
        }

        &-inner {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          border-radius: 16px;
          background: rgba(0, 122, 198, 0.08);
          padding: 4px 8px;
          column-gap: 8px;
        }

        &-drag {
          width: 16px;
          height: 16px;
          margin-left: 8px;
          cursor: grab;

          i {
            font-size: 16px;
            color: rgba(0, 0, 0, 0.8);
          }
        }

        &-index {
          min-width: 32px;
        }

        &-content {
          flex: 1;
        }

        &-remove {
          width: 16px;
          height: 16px;

          i {
            font-size: 10px;
            cursor: pointer;
            color: rgba(0, 0, 0, 0.5);
            transition: color 200ms linear;

            &:hover {
              color: rgba(0, 0, 0, 0.85);
            }
          }
        }

        .ccb-input input {
          height: 40px !important;
        }
      }
    }
  }

  &-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    padding: 0;
  }

  .ccb-add-space {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100%;
    cursor: pointer;
    transition: background 0.3s ease;
    background: rgba(0, 143, 60, 0.08);

    i {
      color: #008f3c;
      font-size: 16px;
    }
  }
}

.ccb-space-modal-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  background: rgba(0, 0, 0, 0.04);
  transition: background 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  i {
    font-size: 10px;
    color: #000000;
    opacity: 0.8;
    transition: 200ms linear;
    font-weight: 400;
  }
}

.ccb-hidden {
  opacity: 0;
  visibility: hidden;
  cursor: not-allowed;
}

.ccb-disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
}
</style>
