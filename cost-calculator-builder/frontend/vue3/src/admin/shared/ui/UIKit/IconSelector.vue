<template>
  <div class="ccb-icon-selector">
    <div class="ccb-icon-selector-button" @click.prevent="openMedia">
      <div class="ccb-icon-selector-button__icon">
        <i class="ccb-icon-ic_warrning"></i>
      </div>
      <div class="ccb-icon-selector-button__text">
        {{ placeholderText }}
      </div>
    </div>
    <div class="ccb-icon-selector-preview">
      <div class="ccb-icon-selector-preview__actions" v-if="thumbnailUrl">
        <i class="ccb-icon-close" @click.prevent="clearIcon"></i>
      </div>
      <div
        class="ccb-icon-selector-preview__icon"
        v-if="thumbnailUrl"
        :style="wrapperStyles"
      >
        <img :src="thumbnailUrl" alt="Icon" :style="iconStyles" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

const props = defineProps<{
  iconUrl: string | null;
  index: number;
  select_text: string;
  svg: boolean;
}>();

const emit = defineEmits<{
  // (e: 'set', value: string | null, index: number, isClear?: boolean): void;
  (e: "set", value: string | null): void;
}>();

const thumbnailUrl = ref<string>("");

watch(
  () => props.iconUrl,
  (val) => {
    if (val && val !== "undefined") {
      thumbnailUrl.value = val;
    }
  },
  { immediate: true },
);

const allowedMimes = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

function openMedia() {
  const anyWindow = window as any;
  if (
    typeof anyWindow !== "undefined" &&
    anyWindow.wp?.media &&
    anyWindow.wp?.media.editor
  ) {
    const wp = anyWindow.wp;
    wp.media.editor.open();
    wp.media.editor.send.attachment = (_props: any, attachment: any) => {
      if (allowedMimes.includes(attachment.mime)) {
        thumbnailUrl.value = attachment.url;
      }
      update();
    };

    wp.media.editor.insert = (htmlString: string) => {
      const regex = /<img[^>]+src="([^"]+)"[^>]*>/i;
      const match = htmlString.match(regex);

      if (match && match[1]) {
        thumbnailUrl.value = match[1];
        update();
      }
    };
    return;
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = updateIcon;
  input.click();
}

function clearIcon() {
  thumbnailUrl.value = "";
  // emit('set', null, props.index, true);
  emit("set", null);
}

function update() {
  // emit('set', thumbnailUrl.value, props.index);
  emit("set", thumbnailUrl.value);
}

function updateIcon(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  if (!allowedMimes.includes(file.type)) return;

  const reader = new FileReader();
  reader.onload = () => {
    thumbnailUrl.value = String(reader.result || "");
    update();
  };
  reader.readAsDataURL(file);
}

const placeholderText = computed(() => {
  return props.svg ? "Select an image" : props.select_text;
});

const iconStyles = computed(() => {
  if (!props.svg) return {};
  return {
    width: "25px",
    height: "25px",
  } as Record<string, string>;
});

const wrapperStyles = computed(() => {
  if (!props.svg) return {};
  return {
    display: "flex",
    alignItems: "center",
    left: "10px",
  } as Record<string, string>;
});
</script>

<style lang="scss">
.ccb-icon-selector {
  width: 100%;
  border-radius: 12px;
  padding: 8px 16px;
  background: var(--ccb-input-normal);
  display: flex;
  justify-content: space-between;

  &-preview {
    display: flex;
    align-items: center;
    gap: 8px;

    &__actions {
      i {
        cursor: pointer;
        color: var(--ccb-green-fg-normal);
        font-size: 16px;
      }
    }

    &__icon {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      padding: 2px;
      border: 1px solid var(--ccb-input-border);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  &-button {
    height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--ccb-bw-dull-normal);
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 99px;
    width: max-content;
    transition: var(--ccb-transition-normal);

    &:hover {
      background: var(--ccb-bw-dull-hover);
    }

    &__icon {
      color: var(--ccb-blue-fg-normal);
      font-size: 16px;
    }

    &__text {
      color: var(--ccb-bw-normal);
      font-size: 14px;
      font-weight: 500;
      font-family: "Red Hat Display", sans-serif !important;
    }
  }
}
</style>
