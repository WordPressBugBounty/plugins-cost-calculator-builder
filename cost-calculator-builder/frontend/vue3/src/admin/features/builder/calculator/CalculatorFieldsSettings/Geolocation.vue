<template>
  <div class="ccb-fields-settings-container ccb-custom-scrollbar">
    <div class="ccb-fields-settings__content ccb-custom-scrollbar">
      <!-- Geo Location: Element Name + Width / Settings toggles -->
      <div class="ccb-fields-settings ccb-field-sidebar">
        <div
          class="ccb-fields-settings-back"
          @click="builderStore.setSelectedField(null)"
        >
          <i class="ccb-icon-ic_back"></i>
          <Text text="Back to Fields" size="s" weight="medium" />
        </div>
        <div class="ccb-field-sidebar__header">
          <Text
            :text="field.label"
            size="m"
            weight="bold"
            class="ccb-field-sidebar__label"
          />
          <Text
            :text="field.alias"
            size="m"
            weight="medium"
            class="ccb-field-sidebar__alias"
          />
        </div>
        <div class="ccb-field-sidebar__tabs">
          <div class="ccb-field-sidebar__row">
            <Tab :items="fieldTabs" v-model="activeTab" type="regular" />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'element'">
          <div class="ccb-field-sidebar__item">
            <Input
              label="Element name"
              placeholder="Field label"
              v-model="draft.label"
            />
          </div>
          <div class="ccb-field-sidebar__item">
            <Range
              v-model="draft.width"
              :min="10"
              :max="100"
              :step="1"
              label="Element Width (%)"
              suffix="%"
            />
          </div>
        </div>

        <div class="ccb-field-sidebar__body" v-if="activeTab === 'settings'">
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Show in Grand Total"
              size="m"
              weight="medium"
              v-model="draft.addToSummary"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Required"
              size="m"
              weight="medium"
              v-model="draft.required"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Hidden by Default"
              size="m"
              weight="medium"
              v-model="draft.hidden"
            />
          </div>
          <div class="ccb-field-sidebar__row">
            <Toggle
              label="Calculate hidden by default"
              size="m"
              weight="medium"
              v-model="draft.calculateHidden"
            />
          </div>
        </div>
      </div>

      <template v-if="activeTab === 'element'">
        <!-- How to use location? -->
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="How to use location?" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div
              v-for="option in geoTypeOptions"
              :key="option.value"
              class="ccb-geo-type-card"
              :class="{
                'ccb-geo-type-card--active': draft.geoType === option.value,
              }"
              @click="draft.geoType = option.value"
            >
              <div class="ccb-geo-type-card__radio">
                <span
                  class="ccb-geo-type-card__dot"
                  :class="{
                    'ccb-geo-type-card__dot--active':
                      draft.geoType === option.value,
                  }"
                />
              </div>
              <div class="ccb-geo-type-card__content">
                <span class="ccb-geo-type-card__title">{{ option.label }}</span>
                <span class="ccb-geo-type-card__desc">{{
                  option.description
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Properties: userLocation — My Location + pricing -->
        <template v-if="draft.geoType === 'userLocation'">
          <div class="ccb-fields-settings ccb-field-sidebar">
            <div class="ccb-field-sidebar__header">
              <Text text="Properties" size="m" weight="bold" />
            </div>
            <div class="ccb-field-sidebar__body">
              <!-- My Location -->
              <div class="ccb-geo-location-block">
                <span class="ccb-geo-location-block__label">My Location</span>

                <!-- No location set -->
                <template v-if="!draft.userAddress">
                  <div class="ccb-geo-map-area">
                    <button
                      class="ccb-geo-select-btn"
                      type="button"
                      @click="openMapPicker('userLocation')"
                    >
                      <i class="ccb-icon-location" />
                      <span>Select Location</span>
                    </button>
                  </div>
                </template>

                <!-- Location selected -->
                <template v-else>
                  <div class="ccb-geo-map-thumb-wrap">
                    <img
                      v-if="googleApiKey && draft.userLocation"
                      :src="staticMapUrl(draft.userLocation, googleApiKey)"
                      class="ccb-geo-map-thumb"
                      alt="Location map"
                    />
                    <div
                      v-else
                      class="ccb-geo-map-thumb ccb-geo-map-thumb--placeholder"
                    />
                  </div>
                  <div class="ccb-geo-address">
                    <div class="ccb-geo-address__row">
                      <span class="ccb-geo-address__coords">{{
                        formatCoords(draft.userLocation)
                      }}</span>
                      <button
                        class="ccb-geo-address__change"
                        type="button"
                        @click="openMapPicker('userLocation')"
                      >
                        <i class="ccb-icon-Edit-Pencil" />
                        Edit
                      </button>
                    </div>
                    <span class="ccb-geo-address__name">{{
                      draft.userAddress
                    }}</span>
                  </div>
                </template>
              </div>

              <div class="ccb-field-sidebar__row">
                <Toggle
                  label="Calculate Distance Price"
                  size="m"
                  weight="medium"
                  v-model="draft.costDistance"
                />
              </div>

              <template v-if="draft.costDistance">
                <Notice type="info">
                  This option affects global settings and will affect all
                  calculators
                </Notice>
                <div class="ccb-field-sidebar__item">
                  <Dropdown
                    label="How to calculate the cost?"
                    :items="pricingTypeItems"
                    v-model="draft.pricingType"
                  />
                </div>
                <template v-if="draft.pricingType === 'each'">
                  <div class="ccb-field-sidebar__item">
                    <Input
                      label="The price per km"
                      placeholder="10"
                      v-model="draft.eachCost"
                    />
                  </div>
                </template>
                <template v-if="draft.pricingType === 'fixed'">
                  <div class="ccb-geo-range-table">
                    <div class="ccb-geo-range-table__header">
                      <span
                        class="ccb-geo-range-table__col ccb-geo-range-table__col--range"
                      >
                        Distance range ({{ draft.measure }})
                      </span>
                      <span
                        class="ccb-geo-range-table__col ccb-geo-range-table__col--price"
                      >
                        Price
                      </span>
                    </div>
                    <div class="ccb-geo-range-table__body">
                      <div
                        v-for="(row, index) in draft.distanceCostList"
                        :key="index"
                        class="ccb-geo-range-table__row"
                      >
                        <Input
                          placeholder="0"
                          :model-value="row.fromStr"
                          :disabled="true"
                          class="ccb-geo-range-table__from"
                        />
                        <Input
                          placeholder="10"
                          v-model="row.toStr"
                          class="ccb-geo-range-table__to"
                        />
                        <Input
                          placeholder="20"
                          v-model="row.costStr"
                          class="ccb-geo-range-table__cost"
                        />
                        <button
                          v-if="index > 0"
                          class="ccb-geo-range-table__delete"
                          @click="removeDistanceRow(index)"
                          type="button"
                        >
                          <i class="ccb-icon-close-x" />
                        </button>
                        <span
                          v-else
                          class="ccb-geo-range-table__delete-placeholder"
                        />
                      </div>
                      <div class="ccb-geo-range-table__row">
                        <Input
                          placeholder="0"
                          :model-value="draft.lastDistanceCost.from"
                          :disabled="true"
                          class="ccb-geo-range-table__from"
                        />
                        <Input
                          placeholder="10"
                          class="ccb-geo-range-table__to"
                          style="opacity: 0; pointer-events: none"
                        />
                        <Input
                          placeholder="0"
                          :model-value="draft.lastDistanceCost.cost"
                          class="ccb-geo-range-table__cost"
                        />
                      </div>
                    </div>
                    <div class="ccb-geo-range-table__footer">
                      <Button
                        label="Add Range"
                        size="m"
                        iconLeft="ccb-icon-ic_plus_big"
                        weight="medium"
                        type="green-ghost"
                        @click="addDistanceRow"
                      />
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </template>

        <!-- Properties: twoPointLocation — pricing only, no fixed location -->
        <template v-else-if="draft.geoType === 'twoPointLocation'">
          <div class="ccb-fields-settings ccb-field-sidebar">
            <div class="ccb-field-sidebar__header">
              <Text text="Properties" size="m" weight="bold" />
            </div>
            <div class="ccb-field-sidebar__body">
              <div class="ccb-field-sidebar__row">
                <Toggle
                  label="Calculate Distance Price"
                  size="m"
                  weight="medium"
                  v-model="draft.costDistance"
                />
              </div>

              <template v-if="draft.costDistance">
                <Notice type="info">
                  This option affects global settings and will affect all
                  calculators
                </Notice>
                <div class="ccb-field-sidebar__item">
                  <Dropdown
                    label="How to calculate the cost?"
                    :items="pricingTypeItems"
                    v-model="draft.pricingType"
                  />
                </div>
                <template v-if="draft.pricingType === 'each'">
                  <div class="ccb-field-sidebar__item">
                    <Input
                      label="The price per km"
                      placeholder="10"
                      v-model="draft.eachCost"
                    />
                  </div>
                </template>
                <template v-if="draft.pricingType === 'fixed'">
                  <div class="ccb-geo-range-table">
                    <div class="ccb-geo-range-table__header">
                      <span
                        class="ccb-geo-range-table__col ccb-geo-range-table__col--range"
                      >
                        Distance range ({{ draft.measure }})
                      </span>
                      <span
                        class="ccb-geo-range-table__col ccb-geo-range-table__col--price"
                      >
                        Price
                      </span>
                    </div>
                    <div class="ccb-geo-range-table__body">
                      <div
                        v-for="(row, index) in draft.distanceCostList"
                        :key="index"
                        class="ccb-geo-range-table__row"
                      >
                        <Input
                          placeholder="0"
                          :model-value="row.fromStr"
                          :disabled="true"
                          class="ccb-geo-range-table__from"
                        />
                        <Input placeholder="10" v-model="row.toStr" />
                        <Input placeholder="20" v-model="row.costStr" />
                        <button
                          v-if="index > 0"
                          class="ccb-geo-range-table__delete"
                          @click="removeDistanceRow(index)"
                          type="button"
                        >
                          <i class="ccb-icon-close-x" />
                        </button>
                        <span
                          v-else
                          class="ccb-geo-range-table__delete-placeholder"
                        />
                      </div>
                      <div class="ccb-geo-range-table__row">
                        <Input
                          placeholder="0"
                          :model-value="draft.lastDistanceCost.from"
                          :disabled="true"
                          class="ccb-geo-range-table__from"
                        />
                        <Input
                          placeholder="10"
                          class="ccb-geo-range-table__to"
                          style="opacity: 0; pointer-events: none"
                        />
                        <Input
                          placeholder="0"
                          :model-value="draft.lastDistanceCost.cost"
                          class="ccb-geo-range-table__cost"
                        />
                      </div>
                    </div>
                    <div class="ccb-geo-range-table__footer">
                      <Button
                        label="Add Range"
                        size="m"
                        iconLeft="ccb-icon-ic_plus_big"
                        weight="medium"
                        type="green-ghost"
                        @click="addDistanceRow"
                      />
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </template>

        <!-- Properties: multiplyLocation — list of predefined locations -->
        <template v-else-if="draft.geoType === 'multiplyLocation'">
          <div class="ccb-fields-settings ccb-field-sidebar">
            <div class="ccb-field-sidebar__header">
              <Text text="Properties" size="m" weight="bold" />
            </div>
            <div class="ccb-field-sidebar__body">
              <div
                v-for="(loc, idx) in draft.multiplyLocations"
                :key="idx"
                class="ccb-geo-multi-location"
              >
                <div class="ccb-geo-multi-location__header">
                  <div
                    class="ccb-field-sidebar__item ccb-geo-multi-location__name-input"
                    :class="{
                      'ccb-geo-multi-location__name-input--error':
                        hasMultiError(idx, 'label'),
                    }"
                  >
                    <Input
                      label="Place Name"
                      :placeholder="'Location ' + (idx + 1)"
                      v-model="loc.label"
                      @update:model-value="
                        clearMultiLocationError(idx, 'label')
                      "
                    />
                    <span
                      v-if="hasMultiError(idx, 'label')"
                      class="ccb-geo-field-error"
                      >Place name is required</span
                    >
                  </div>
                  <button
                    class="ccb-geo-multi-location__delete"
                    :class="{
                      'ccb-geo-multi-location__delete--disabled':
                        draft.multiplyLocations.length <= 2,
                    }"
                    :disabled="draft.multiplyLocations.length <= 2"
                    @click="removeLocation(idx)"
                    type="button"
                  >
                    <i class="ccb-icon-ic_cross_big" />
                  </button>
                </div>
                <!-- No location set for this entry -->
                <template v-if="!loc.addressName">
                  <div
                    class="ccb-geo-map-area ccb-geo-map-area--sm"
                    :class="{
                      'ccb-geo-map-area--error': hasMultiError(idx, 'location'),
                    }"
                  >
                    <button
                      class="ccb-geo-select-btn"
                      type="button"
                      @click="openMapPicker(idx)"
                    >
                      <i class="ccb-icon-location" />
                      <span>Select Location</span>
                    </button>
                  </div>
                  <span
                    v-if="hasMultiError(idx, 'location')"
                    class="ccb-geo-field-error"
                    >Location must be selected</span
                  >
                </template>

                <!-- Location selected for this entry -->
                <template v-else>
                  <div class="ccb-geo-map-thumb-wrap">
                    <img
                      v-if="googleApiKey && loc.coordinates"
                      :src="staticMapUrl(loc.coordinates, googleApiKey)"
                      class="ccb-geo-map-thumb"
                      alt="Location map"
                    />
                    <div
                      v-else
                      class="ccb-geo-map-thumb ccb-geo-map-thumb--placeholder"
                    />
                  </div>
                  <div class="ccb-geo-address">
                    <div class="ccb-geo-address__row">
                      <span class="ccb-geo-address__coords">{{
                        loc.coordinates
                      }}</span>
                      <button
                        class="ccb-geo-address__change"
                        type="button"
                        @click="openMapPicker(idx)"
                      >
                        <i class="ccb-icon-Edit-Pencil" />
                        Edit
                      </button>
                    </div>
                    <div
                      class="ccb-geo-address__row ccb-geo-address__row--name"
                    >
                      <span class="ccb-geo-address__name">{{
                        loc.addressName
                      }}</span>
                      <button
                        class="ccb-geo-address__remove"
                        type="button"
                        @click="clearMultiLocation(idx)"
                      >
                        <i class="ccb-icon-ic_cross_big" />
                      </button>
                    </div>
                  </div>
                </template>
              </div>

              <button
                class="ccb-geo-range-table__add-btn"
                @click="addLocation"
                type="button"
              >
                <i class="ccb-icon-ic_plus_small" />
                <span>Add Location</span>
              </button>
            </div>
          </div>
        </template>

        <!-- Measurement Unit -->
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Measurement Unit" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__row">
              <Toggle
                label="Use currency sign"
                size="m"
                weight="medium"
                v-model="draft.allowCurrency"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Additional Classes (Settings tab) -->
      <template v-if="activeTab === 'settings'">
        <div class="ccb-fields-settings ccb-field-sidebar">
          <div class="ccb-field-sidebar__header">
            <Text text="Additional Classes" size="m" weight="bold" />
          </div>
          <div class="ccb-field-sidebar__body">
            <div class="ccb-field-sidebar__row">
              <Textarea
                height="120px"
                placeholder="Enter additional classes"
                v-model="draft.additionalClasses"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Google Maps picker popup -->
    <GeoMapPicker
      :show="mapPickerVisible"
      :api-key="googleApiKey"
      :initial-coords="pickerInitialCoords"
      @save="onLocationSaved"
      @cancel="onMapPickerCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from "vue";
import {
  Text,
  Input,
  Dropdown,
  Toggle,
  Textarea,
  Button,
  Notice,
  Range,
} from "@/admin/shared/ui/UIKit";
import Tab from "@/admin/shared/ui/components/Tab/Tab.vue";
import { useBuilderStore } from "@/admin/app/providers/stores/useBuilderStore";
import { useSettingsStore } from "@/admin/app/providers/stores/useSettingsStore";
import type {
  IField,
  IGeolocationDistanceCost,
  IGeolocationMultiplyLocation,
} from "@/admin/shared/types/fields.type";
import { clampWidth } from "./field-settings.constants";
import { useFieldWidthSync } from "./useFieldWidthSync";
import { useAutoSyncDraft } from "./useAutoSyncDraft";
import GeoMapPicker from "./GeoMapPicker.vue";

const props = defineProps<{
  field: IField;
}>();

const builderStore = useBuilderStore();
const settingsStore = useSettingsStore();

const googleApiKey = computed(
  () => settingsStore.getGeneralSettings?.geolocation?.public_key || "",
);

const mapPickerVisible = ref(false);
const mapPickerTarget = ref<"userLocation" | number>("userLocation");

// Validation errors for multiplyLocation
const multiLocationErrors = ref<
  Record<number, { label?: boolean; location?: boolean }>
>({});

interface IDistanceCostDraft {
  fromStr: string;
  toStr: string;
  costStr: string;
}

interface IGeolocationDraft {
  label: string;
  fieldName: string;
  placeholder: string;
  description: string;
  width: number;
  geoType: "userLocation" | "twoPointLocation" | "multiplyLocation";
  measure: string;
  costDistance: boolean;
  pricingType: string;
  eachCost: string;
  required: boolean;
  addToSummary: boolean;
  allowCurrency: boolean;
  additionalClasses: string;
  hidden: boolean;
  calculateHidden: boolean;
  distanceCostList: IDistanceCostDraft[];
  userLocation: string | number[];
  userAddress: string;
  multiplyLocations: IGeolocationMultiplyLocation[];
  lastDistanceCost: {
    from: number;
    cost: number;
  };
}

const draft = reactive<IGeolocationDraft>({
  label: "",
  fieldName: "",
  placeholder: "",
  description: "",
  width: 100,
  geoType: "userLocation",
  measure: "km",
  costDistance: false,
  pricingType: "each",
  eachCost: "10",
  required: false,
  addToSummary: true,
  allowCurrency: false,
  additionalClasses: "",
  hidden: false,
  calculateHidden: false,
  distanceCostList: [],
  userLocation: "",
  userAddress: "",
  multiplyLocations: [],
  lastDistanceCost: {
    from: 0,
    cost: 0,
  },
});

const fieldTabs = [
  { id: "element", label: "Element" },
  { id: "settings", label: "Settings" },
];

const activeTab = ref<string>("element");

useFieldWidthSync(() => props.field, draft);

const { suppressAutoSync, restoredVersion } = useAutoSyncDraft(
  () => props.field,
  draft,
  { additionalClasses: "additionalStyles" },
);

const geoTypeOptions: Array<{
  value: IGeolocationDraft["geoType"];
  label: string;
  description: string;
}> = [
  {
    value: "userLocation",
    label: "Ask for user's location",
    description:
      "Let users calculate the distance from their location to your place",
  },
  {
    value: "twoPointLocation",
    label: "Ask to choose start and destination points",
    description:
      "Let users calculate the distance between two points on the map",
  },
  {
    value: "multiplyLocation",
    label: "Ask to choose from multiple locations",
    description:
      "Let users calculate the distance between multiple locations and select one",
  },
];

const pricingTypeItems = [
  { value: "each", label: "Fixed price per km" },
  { value: "fixed", label: "Ranged price by distance" },
];

// --- Distance range helpers ---
const recalcFromValues = (): void => {
  draft.distanceCostList.forEach((row, index) => {
    if (index === 0) {
      row.fromStr = "0";
    } else {
      const prevTo = Number(draft.distanceCostList[index - 1].toStr) || 0;
      row.fromStr = String(prevTo + 1);
    }
  });

  const list = draft.distanceCostList;
  const lastTo = list.length > 0 ? Number(list[list.length - 1].toStr) || 0 : 0;
  draft.lastDistanceCost.from = lastTo;
};

const addDistanceRow = (): void => {
  const list = draft.distanceCostList;
  const lastTo = list.length > 0 ? Number(list[list.length - 1].toStr) || 0 : 0;
  list.push({
    fromStr: String(lastTo + 1),
    toStr: String(lastTo + 10),
    costStr: "0",
  });
};

const removeDistanceRow = (index: number): void => {
  draft.distanceCostList.splice(index, 1);
  recalcFromValues();
};

watch(
  () => draft.distanceCostList.map((r) => r.toStr),
  () => recalcFromValues(),
);

const distanceCostToDraft = (
  list: IGeolocationDistanceCost[],
): IDistanceCostDraft[] =>
  (list || []).map((r) => ({
    fromStr: String(r.from ?? 0),
    toStr: String(r.to ?? 0),
    costStr: String(r.cost ?? 0),
  }));

// --- Multiple locations helpers ---
const addLocation = (): void => {
  draft.multiplyLocations.push({ label: "", coordinates: "", addressName: "" });
};

const removeLocation = (idx: number): void => {
  if (draft.multiplyLocations.length <= 2) return;
  draft.multiplyLocations.splice(idx, 1);
  // Shift errors down for removed index
  const updated: typeof multiLocationErrors.value = {};
  Object.entries(multiLocationErrors.value).forEach(([key, val]) => {
    const i = Number(key);
    if (i < idx) updated[i] = val;
    else if (i > idx) updated[i - 1] = val;
  });
  multiLocationErrors.value = updated;
};

const clearMultiLocation = (idx: number): void => {
  draft.multiplyLocations[idx].coordinates = "";
  draft.multiplyLocations[idx].addressName = "";
};

const clearMultiLocationError = (
  idx: number,
  field: "label" | "location",
): void => {
  if (multiLocationErrors.value[idx]?.[field]) {
    const err = { ...multiLocationErrors.value[idx] };
    delete err[field];
    if (Object.keys(err).length) {
      multiLocationErrors.value = { ...multiLocationErrors.value, [idx]: err };
    } else {
      const updated = { ...multiLocationErrors.value };
      delete updated[idx];
      multiLocationErrors.value = updated;
    }
  }
};

const hasMultiError = (idx: number, field: "label" | "location"): boolean =>
  !!multiLocationErrors.value[idx]?.[field];

const pickerInitialCoords = computed((): string => {
  if (mapPickerTarget.value === "userLocation") {
    return String(draft.userLocation || "");
  }
  const idx = mapPickerTarget.value as number;
  return String(draft.multiplyLocations[idx]?.coordinates || "");
});

const openMapPicker = (target: "userLocation" | number): void => {
  mapPickerTarget.value = target;
  mapPickerVisible.value = true;
};

const onLocationSaved = (payload: {
  address: string;
  coordinates: string;
}): void => {
  if (mapPickerTarget.value === "userLocation") {
    draft.userAddress = payload.address;
    draft.userLocation = payload.coordinates;
  } else {
    const idx = mapPickerTarget.value as number;
    draft.multiplyLocations[idx].addressName = payload.address;
    draft.multiplyLocations[idx].coordinates = payload.coordinates;
    clearMultiLocationError(idx, "location");
  }
  mapPickerVisible.value = false;
};

const onMapPickerCancel = (): void => {
  mapPickerVisible.value = false;
};

// --- Format coords for display ---
const formatCoords = (loc: string | number[]): string => {
  if (Array.isArray(loc)) return loc.join(", ");
  return String(loc);
};

// --- Static map thumbnail ---
const staticMapUrl = (coords: string | number[], apiKey: string): string => {
  const coordStr = Array.isArray(coords) ? coords.join(",") : String(coords);
  const [lat, lng] = coordStr.split(",");
  return (
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}&zoom=14&size=600x200` +
    `&markers=color:red%7C${lat},${lng}` +
    `&key=${apiKey}`
  );
};

// --- Sync draft from field ---
const syncDraftFromField = (): void => {
  const source = props.field as IField & {
    placeholder?: string;
    geoType?: IGeolocationDraft["geoType"];
    measure?: string;
    costDistance?: boolean;
    pricingType?: string;
    eachCost?: number | string;
    required?: boolean;
    addToSummary?: boolean;
    allowCurrency?: boolean;
    additionalStyles?: string;
    hidden?: boolean;
    calculateHidden?: boolean;
    distanceCostList?: IGeolocationDistanceCost[];
    userLocation?: string | number[];
    userAddress?: string;
    multiplyLocations?: IGeolocationMultiplyLocation[];
    lastDistanceCost?: {
      from: number;
      cost: number;
    };
  };

  draft.label = String(source.label || "");
  draft.fieldName = String(source.fieldName || "");
  draft.placeholder = String(source.placeholder || "");
  draft.description = String(source.description || "");
  draft.width = clampWidth(source.width);
  draft.geoType = source.geoType || "userLocation";
  draft.measure = String(source.measure || "km");
  draft.costDistance = Boolean(source.costDistance);
  draft.pricingType = String(source.pricingType || "each");
  draft.eachCost = String(source.eachCost ?? 10);
  draft.required = Boolean(source.required);
  draft.addToSummary = Boolean(source.addToSummary);
  draft.allowCurrency = Boolean(source.allowCurrency);
  draft.additionalClasses = String(source.additionalStyles || "");
  draft.hidden = Boolean(source.hidden);
  draft.calculateHidden = Boolean(source.calculateHidden);
  draft.distanceCostList = distanceCostToDraft(source.distanceCostList || []);
  draft.userLocation = source.userLocation || "";
  draft.userAddress = String(source.userAddress || "");
  const locs = (source.multiplyLocations || []).map((loc) => ({
    label: String(loc.label || ""),
    coordinates: String(loc.coordinates || ""),
    addressName: String(loc.addressName || ""),
  }));
  draft.lastDistanceCost = {
    from: Number(source.lastDistanceCost?.from || 0),
    cost: Number(source.lastDistanceCost?.cost || 0),
  };
  recalcFromValues();
  // Ensure at least 2 locations
  while (locs.length < 2)
    locs.push({ label: "", coordinates: "", addressName: "" });
  draft.multiplyLocations = locs;
  multiLocationErrors.value = {};
};

watch(
  () => [props.field.alias, restoredVersion.value],
  () => {
    suppressAutoSync(() => syncDraftFromField());
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
@use "@/admin/features/builder/field-settings";

// --- Geo Type Cards ---
.ccb-geo-type-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1.5px solid var(--ccb-input-border, #e8e8e8);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--ccb-blue-bg-normal, #1e73be);
  }

  &--active {
    border-color: var(--ccb-blue-bg-normal, #1e73be);
    background-color: var(--ccb-blue-bg-dull-normal, #f0f6ff);
  }

  &__radio {
    flex: 0 0 auto;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--ccb-input-border, #d0d0d0);
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease;

    &--active {
      border-color: var(--ccb-blue-bg-normal, #1e73be);
      background-color: var(--ccb-blue-bg-normal, #1e73be);
      box-shadow: inset 0 0 0 3px var(--ccb-blue-bg-dull-normal, #f0f6ff);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--ccb-font-labels, #373737);
    line-height: 1.3;
  }

  &__desc {
    font-size: 12px;
    color: var(--ccb-font-comment, #9d9d9d);
    line-height: 1.4;
  }
}

// --- My Location block ---
.ccb-geo-location-block {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ccb-font-comment, #9d9d9d);
    padding-left: 16px;
  }
}

.ccb-geo-map-area {
  width: 100%;
  height: 88px;
  border-radius: 12px;
  background: var(--ccb-input-normal, #f5f5f5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--ccb-font-comment, #9d9d9d);

  &--sm {
    height: 72px;
  }

  &--error {
    border: 1.5px solid var(--ccb-red-bg-normal, #e74c3c);
    background: var(--ccb-red-bg-dull-normal, #fef5f5);
  }

  &__icon {
    font-size: 24px;
  }

  &__hint {
    font-size: 12px;
  }
}

.ccb-geo-select-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background: var(--ccb-green-bg-dull-normal, #e6f9f0);
  color: var(--ccb-green-fg-normal, #1aab56);
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--ccb-green-bg-normal, #c8f2dc);
  }

  i {
    font-size: 15px;
  }
}

.ccb-geo-map-thumb-wrap {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  height: 88px;
  background: var(--ccb-input-normal, #f5f5f5);
}

.ccb-geo-map-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;

  &--placeholder {
    background: var(--ccb-input-normal, #f5f5f5);
  }
}

.ccb-geo-address {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 4px;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    &--name {
      justify-content: flex-start;
      gap: 8px;
    }
  }

  &__coords {
    font-size: 13px;
    color: var(--ccb-font-labels, #373737);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__name {
    font-size: 12px;
    color: var(--ccb-font-comment, #9d9d9d);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__change {
    flex: 0 0 auto;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    color: var(--ccb-blue-bg-normal, #1e73be);
    padding: 2px 4px;
    border-radius: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--ccb-blue-bg-dull-normal, #f0f6ff);
    }
  }

  &__remove {
    flex: 0 0 auto;
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    color: var(--ccb-font-comment, #9d9d9d);
    display: flex;
    align-items: center;
    border-radius: 4px;
    transition: color 0.2s ease;

    &:hover {
      color: var(--ccb-red-bg-normal, #e74c3c);
    }

    i {
      font-size: 12px;
    }
  }
}

// --- Multiple locations ---
.ccb-geo-multi-location {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ccb-input-border, #e8e8e8);

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }

  &__header {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }

  &__name-input {
    flex: 1;
    min-width: 0;

    &--error {
      :deep(.ccb-input input) {
        border-color: var(--ccb-red-bg-normal, #e74c3c) !important;
      }
    }
  }

  &__delete {
    flex: 0 0 auto;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    margin-bottom: 2px;
    color: var(--ccb-font-comment, #9d9d9d);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover:not(:disabled) {
      color: var(--ccb-red-bg-normal, #e74c3c);
      background-color: var(--ccb-red-bg-dull-normal, #fef5f5);
    }

    &--disabled,
    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    i {
      font-size: 14px;
    }
  }
}

// Inline field error message
.ccb-geo-field-error {
  display: block;
  font-size: 11px;
  color: var(--ccb-red-bg-normal, #e74c3c);
  margin-top: 4px;
  line-height: 1.3;
}

// --- Distance range table ---
.ccb-geo-range-table {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &__header {
    display: flex;
    gap: 4px;
    padding: 0 4px;
  }

  &__col {
    font-size: 12px;
    color: var(--ccb-font-comment, #9d9d9d);
    font-weight: 500;

    &--range {
      flex: 2;
      max-width: 157px;
    }

    &--price {
      flex: 1;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: var(--ccb-blue-bg-dull-normal);
    border-radius: 16px;
    padding: 4px;

    .ccb-input {
      flex: 1;
      max-width: 75px;
      min-width: 0;
    }
  }

  &__to {
    :deep(input) {
      border-radius: 4px !important;
    }
  }

  &__cost {
    :deep(input) {
      border-radius: 4px;
      border-top-right-radius: 16px !important;
      border-bottom-right-radius: 16px !important;
    }
  }

  &__from {
    // Disabled "from" field — muted look
    pointer-events: none;
    opacity: 0.9;

    :deep(input) {
      background: var(--ccb-input-border, #f0f0f0) !important;
      color: var(--ccb-font-comment, #9d9d9d) !important;
      cursor: default !important;
      border-top-right-radius: 4px !important;
      border-bottom-right-radius: 4px !important;
    }
  }

  &__delete-placeholder {
    // Same width as the delete button to keep columns aligned
    flex: 0 0 auto;
    width: 26px;
    height: 26px;
    display: block;
  }

  &__delete {
    flex: 0 0 auto;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: var(--ccb-font-comment, #9d9d9d);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      color: var(--ccb-red-bg-normal, #e74c3c);
      background-color: var(--ccb-red-bg-dull-normal, #fef5f5);
    }

    i {
      font-size: 10px;
    }
  }

  &__footer {
    padding-top: 4px;
  }

  &__add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px 4px;
    color: var(--ccb-blue-bg-normal, #1e73be);
    font-size: 13px;
    font-weight: 500;
    border-radius: 8px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: var(--ccb-blue-bg-dull-normal, #f0f6ff);
    }

    i {
      font-size: 14px;
    }
  }
}
</style>
