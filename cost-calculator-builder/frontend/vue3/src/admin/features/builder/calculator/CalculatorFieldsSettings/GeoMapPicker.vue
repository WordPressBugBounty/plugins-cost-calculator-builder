<template>
  <Teleport to="body">
    <Transition name="ccb-geo-fade">
      <div v-if="show" class="ccb-geo-overlay" @click.self="onCancel">
        <div class="ccb-geo-modal">
          <!-- Header -->
          <div class="ccb-geo-modal__header">
            <span class="ccb-geo-modal__title">Select Location</span>
            <button
              class="ccb-geo-modal__close"
              type="button"
              @click="onCancel"
            >
              <i class="ccb-icon-ic_cross_big" />
            </button>
          </div>

          <!-- Body -->
          <div class="ccb-geo-modal__body">
            <!-- No API key configured -->
            <div v-if="!apiKey" class="ccb-geo-modal__error-state">
              <i class="ccb-icon-Warning ccb-geo-modal__error-icon" />
              <p class="ccb-geo-modal__error-title">
                Google Maps API key is missing
              </p>
              <p class="ccb-geo-modal__error-desc">
                Add your API key in
                <strong>General Settings → Geolocation</strong> and try again.
              </p>
            </div>

            <template v-else>
              <!-- Search input -->
              <div class="ccb-geo-modal__search">
                <i
                  class="ccb-icon-Search-Magnifier ccb-geo-modal__search-icon"
                />
                <input
                  ref="searchInputRef"
                  type="text"
                  class="ccb-geo-modal__search-input"
                  placeholder="Search address..."
                  autocomplete="off"
                />
              </div>

              <!-- Map -->
              <div class="ccb-geo-modal__map-wrap">
                <!-- Loader overlay -->
                <div v-if="loading" class="ccb-geo-modal__loader">
                  <span class="ccb-geo-modal__loader-spinner" />
                </div>

                <!-- Error overlay -->
                <div v-else-if="mapError" class="ccb-geo-modal__loader">
                  <div class="ccb-geo-modal__map-error">
                    <i class="ccb-icon-Warning" />
                    <span>{{ mapError }}</span>
                  </div>
                </div>

                <div ref="mapContainer" class="ccb-geo-modal__map" />
              </div>

              <!-- Selected location info -->
              <Transition name="ccb-geo-info-fade">
                <div v-if="pendingAddress" class="ccb-geo-modal__info">
                  <i class="ccb-icon-location ccb-geo-modal__info-icon" />
                  <div class="ccb-geo-modal__info-text">
                    <span class="ccb-geo-modal__info-addr">{{
                      pendingAddress
                    }}</span>
                    <span
                      v-if="pendingCoords"
                      class="ccb-geo-modal__info-coords"
                    >
                      {{ pendingCoords.lat.toFixed(6) }},
                      {{ pendingCoords.lng.toFixed(6) }}
                    </span>
                  </div>
                </div>
              </Transition>
            </template>
          </div>

          <!-- Footer -->
          <div class="ccb-geo-modal__footer">
            <button
              class="ccb-geo-modal__btn ccb-geo-modal__btn--cancel"
              type="button"
              @click="onCancel"
            >
              Cancel
            </button>
            <button
              class="ccb-geo-modal__btn ccb-geo-modal__btn--save"
              type="button"
              :disabled="!pendingAddress || !pendingCoords"
              @click="onSave"
            >
              Save Location
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

const props = defineProps<{
  show: boolean;
  apiKey: string;
  initialCoords?: string;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "save", payload: { address: string; coordinates: string }): void;
}>();

// --- Refs ---
const mapContainer = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const loading = ref(false);
const mapError = ref("");

const pendingCoords = ref<{ lat: number; lng: number } | null>(null);
const pendingAddress = ref("");

// Internal non-reactive map state
let mapInstance: google.maps.Map | null = null;
let markerInstance: google.maps.Marker | null = null;

// --- Helpers ---
const parseCoords = (str: string): { lat: number; lng: number } | null => {
  if (!str?.trim()) return null;
  const [lat, lng] = str.split(",").map((s) => Number(s.trim()));
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
};

const GOOGLE_MAPS_SCRIPT_SELECTOR =
  'script[src*="maps.googleapis.com/maps/api/js"]';

const getScriptApiKey = (script: HTMLScriptElement | null): string => {
  if (!script?.src) return "";
  try {
    return new URL(script.src).searchParams.get("key")?.trim() || "";
  } catch {
    return "";
  }
};

const removeGoogleMapsScripts = () => {
  document
    .querySelectorAll<HTMLScriptElement>(GOOGLE_MAPS_SCRIPT_SELECTOR)
    .forEach((script) => script.remove());
};

const resetGoogleMapsGlobal = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (win.google) {
    try {
      delete win.google;
    } catch {
      win.google = undefined;
    }
  }
};

/**
 * Loads Google Maps via direct <script> injection — completely bypasses
 * @googlemaps/js-api-loader so there are no "Loader called again with different
 * options" conflicts from other components.
 */
const ensureGoogleMaps = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const expectedApiKey = props.apiKey?.trim();
    if (!expectedApiKey) {
      reject(new Error("Google Maps API key is empty"));
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      GOOGLE_MAPS_SCRIPT_SELECTOR,
    );
    const existingApiKey = getScriptApiKey(existingScript);
    const hasConflictingScript =
      !!existingScript && existingApiKey !== expectedApiKey;

    if (hasConflictingScript) {
      removeGoogleMapsScripts();
      resetGoogleMapsGlobal();
    }

    // Already fully loaded — reuse
    if (
      !hasConflictingScript &&
      typeof google !== "undefined" &&
      google?.maps?.Map
    ) {
      resolve();
      return;
    }

    // Script already in DOM but still loading — wait for it
    const existing = document.querySelector<HTMLScriptElement>(
      GOOGLE_MAPS_SCRIPT_SELECTOR,
    );
    if (existing) {
      const done = () => resolve();
      const fail = () => reject(new Error("Google Maps script failed to load"));
      existing.addEventListener("load", done, { once: true });
      existing.addEventListener("error", fail, { once: true });
      return;
    }

    // Inject our own script with the correct API key
    const cbName = `__ccbGeoMapsReady_${Date.now()}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[cbName] = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[cbName];
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${expectedApiKey}&libraries=places&v=weekly&callback=${cbName}&loading=async`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any)[cbName];
      reject(new Error("Failed to inject Google Maps script"));
    };
    document.head.appendChild(script);
  });

// --- Marker ---
const clearMarker = () => {
  if (!markerInstance) return;
  markerInstance.setMap(null);
  markerInstance = null;
};

const placeMarker = (latLng: { lat: number; lng: number }) => {
  if (!mapInstance) return;
  clearMarker();

  markerInstance = new google.maps.Marker({
    position: latLng,
    map: mapInstance,
    animation: google.maps.Animation.DROP,
  });

  pendingCoords.value = latLng;
  mapInstance.panTo(latLng);
};

// --- Geocoding ---
const reverseGeocode = (latLng: google.maps.LatLng): Promise<string> =>
  new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        resolve(results[0].formatted_address);
      } else {
        resolve(`${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`);
      }
    });
  });

// --- Map init ---
const initMap = async () => {
  if (!mapContainer.value || !props.apiKey) return;

  loading.value = true;
  mapError.value = "";

  try {
    await ensureGoogleMaps();

    const existingCoords = parseCoords(props.initialCoords ?? "");
    const center = existingCoords ?? { lat: 48.8566, lng: 2.3522 };

    mapInstance = new google.maps.Map(mapContainer.value, {
      zoom: existingCoords ? 14 : 3,
      center,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: true,
    });

    // Pre-place marker + reverse geocode if initial coords exist
    if (existingCoords) {
      placeMarker(existingCoords);
      const latLngObj = new google.maps.LatLng(
        existingCoords.lat,
        existingCoords.lng,
      );
      pendingAddress.value = await reverseGeocode(latLngObj);
    }

    // Search autocomplete
    if (searchInputRef.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const placesLib = (google.maps as any).places;

      if (placesLib?.Autocomplete) {
        // Classic Autocomplete (still works, deprecated only for new billing accounts)
        const autocomplete = new placesLib.Autocomplete(searchInputRef.value, {
          fields: ["geometry", "formatted_address"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place?.geometry?.location) return;

          const latLng = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          placeMarker(latLng);
          pendingAddress.value = place.formatted_address ?? "";
          mapInstance?.setZoom(14);
        });
      } else if (placesLib?.PlaceAutocompleteElement) {
        // New PlaceAutocompleteElement fallback
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const autocompleteEl = new placesLib.PlaceAutocompleteElement() as any;
        searchInputRef.value.replaceWith(autocompleteEl);

        autocompleteEl.addEventListener(
          "gmp-placeselect",
          async (event: Event) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const place = (event as any).place;
            if (!place) return;

            await place.fetchFields({
              fields: ["location", "formattedAddress"],
            });
            if (!place.location) return;

            const latLng = {
              lat: place.location.lat(),
              lng: place.location.lng(),
            };
            placeMarker(latLng);
            pendingAddress.value = place.formattedAddress ?? "";
            mapInstance?.setZoom(14);
          },
        );
      }
    }

    // Map click — place marker + reverse geocode
    mapInstance.addListener(
      "click",
      async (event: google.maps.MapMouseEvent) => {
        const latLng = event.latLng;
        if (!latLng) return;

        placeMarker({ lat: latLng.lat(), lng: latLng.lng() });
        pendingAddress.value = await reverseGeocode(latLng);
      },
    );
  } catch (e) {
    console.error("[GeoMapPicker]", e);
    mapError.value =
      "Failed to load Google Maps. Please check your API key and try again.";
  } finally {
    loading.value = false;
  }
};

const destroyMap = () => {
  clearMarker();
  mapInstance = null;
  pendingCoords.value = null;
  pendingAddress.value = "";
  mapError.value = "";
  if (searchInputRef.value) searchInputRef.value.value = "";
};

// --- Lifecycle ---
watch(
  () => props.show,
  async (visible) => {
    if (visible) {
      destroyMap();
      await nextTick();
      await initMap();
    } else {
      destroyMap();
    }
  },
);

// --- Actions ---
const onCancel = () => emit("cancel");

const onSave = () => {
  if (!pendingCoords.value || !pendingAddress.value) return;
  emit("save", {
    address: pendingAddress.value,
    coordinates: `${pendingCoords.value.lat},${pendingCoords.value.lng}`,
  });
};
</script>

<!-- Google Places Autocomplete dropdown is appended to <body> — must be global -->
<style lang="scss">
.pac-container {
  z-index: 100001 !important;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border: 1px solid #e0e0e0;
  font-family: inherit;
  margin-top: 4px;
  overflow: hidden;
}
.pac-item {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  line-height: 1.4;
  &:hover {
    background: #f5f5f5;
  }
}
.pac-item-query {
  font-size: 13px;
  font-weight: 500;
}
.pac-matched {
  font-weight: 600;
}
</style>

<style scoped lang="scss">
.ccb-geo-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 16px;
}

.ccb-geo-modal {
  background: var(--ccb-bgr-popup, #fff);
  border-radius: 16px;
  width: 680px;
  max-width: 100%;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--ccb-input-border, #f0f0f0);
    flex-shrink: 0;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--ccb-font-labels, #373737);
  }

  &__close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ccb-font-comment, #9d9d9d);
    border-radius: 6px;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--ccb-font-labels, #373737);
      background: var(--ccb-input-normal, #f5f5f5);
    }

    i {
      font-size: 14px;
    }
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px 24px;
    gap: 12px;
    overflow: hidden;
  }

  // No API key state
  &__error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 48px 24px;
    text-align: center;
  }

  &__error-icon {
    font-size: 36px;
    color: var(--ccb-yellow-bg-normal, #f5a623);
  }

  &__error-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--ccb-font-labels, #373737);
    margin: 0;
  }

  &__error-desc {
    font-size: 13px;
    color: var(--ccb-font-comment, #9d9d9d);
    margin: 0;
    line-height: 1.5;

    strong {
      color: var(--ccb-font-labels, #373737);
    }
  }

  // Search
  &__search {
    position: relative;
    flex-shrink: 0;
    z-index: 2;
  }

  &__search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: var(--ccb-font-comment, #9d9d9d);
    pointer-events: none;
    z-index: 1;
  }

  &__search-input {
    width: 100%;
    height: 42px;
    border: 1.5px solid var(--ccb-input-border, #e0e0e0);
    border-radius: 10px;
    padding: 0 14px 0 38px;
    font-size: 13px;
    color: var(--ccb-font-labels, #373737);
    background: var(--ccb-input-normal, #f7f7f7);
    outline: none;
    transition:
      border-color 0.2s,
      background 0.2s;
    box-sizing: border-box;

    &::placeholder {
      color: var(--ccb-font-comment, #9d9d9d);
    }

    &:focus {
      border-color: var(--ccb-blue-bg-normal, #1e73be);
      background: #fff;
    }
  }

  // Map wrapper
  &__map-wrap {
    position: relative;
    flex: 1;
    min-height: 340px;
    border-radius: 12px;
    overflow: hidden;
    background: var(--ccb-input-normal, #f0f0f0);
  }

  &__map {
    width: 100%;
    height: 100%;
    min-height: 340px;
  }

  // Loader / error overlay
  &__loader {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px;
  }

  &__loader-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--ccb-input-border, #e0e0e0);
    border-top-color: var(--ccb-blue-bg-normal, #1e73be);
    border-radius: 50%;
    animation: ccb-spin 0.7s linear infinite;
  }

  &__map-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--ccb-red-bg-normal, #e74c3c);
    font-size: 13px;
    text-align: center;
    padding: 24px;

    i {
      font-size: 28px;
    }
  }

  // Selected info bar
  &__info {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    background: var(--ccb-blue-bg-dull-normal, #f0f6ff);
    border-radius: 10px;
  }

  &__info-icon {
    font-size: 16px;
    color: var(--ccb-blue-bg-normal, #1e73be);
    flex-shrink: 0;
    margin-top: 1px;
  }

  &__info-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__info-addr {
    font-size: 13px;
    font-weight: 500;
    color: var(--ccb-font-labels, #373737);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__info-coords {
    font-size: 11px;
    color: var(--ccb-font-comment, #9d9d9d);
  }

  // Footer
  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 24px;
    border-top: 1px solid var(--ccb-input-border, #f0f0f0);
    flex-shrink: 0;
  }

  &__btn {
    height: 40px;
    padding: 0 22px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition:
      background-color 0.2s,
      opacity 0.2s;

    &--cancel {
      background: var(--ccb-input-normal, #f0f0f0);
      color: var(--ccb-font-labels, #373737);

      &:hover {
        background: var(--ccb-input-border, #e0e0e0);
      }
    }

    &--save {
      background: var(--ccb-green-bg-normal, #008000);
      color: #fff;

      &:hover:not(:disabled) {
        opacity: 0.85;
      }

      &:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
    }
  }
}

// Overlay fade
.ccb-geo-fade-enter-active,
.ccb-geo-fade-leave-active {
  transition: opacity 0.22s ease;
}
.ccb-geo-fade-enter-from,
.ccb-geo-fade-leave-to {
  opacity: 0;
}

// Info panel slide-up
.ccb-geo-info-fade-enter-active,
.ccb-geo-info-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.ccb-geo-info-fade-enter-from,
.ccb-geo-info-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@keyframes ccb-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
