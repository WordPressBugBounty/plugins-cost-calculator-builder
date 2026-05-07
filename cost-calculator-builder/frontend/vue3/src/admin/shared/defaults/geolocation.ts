import type { IGeolocationField } from "@/admin/shared/types/fields.type";

export const geolocationDefaults = (): Partial<IGeolocationField> => ({
  label: "",
  _id: null,
  _event: "click",
  _tag: "cost-geolocation",
  icon: "ccb-icon-location",
  alias: "geolocation_field_id_",
  measure: "",
  type: "geolocation",
  placeholder: "",
  geoType: "userLocation",
  costDistance: true,
  userLocation: "",
  userAddress: "",
  pricingType: "each",
  eachCost: 10,
  multiplyLocations: [
    {
      coordinates: "",
      label: "",
      addressName: "",
    },
    {
      coordinates: "",
      label: "",
      addressName: "",
    },
  ],
  distanceCostList: [
    {
      from: 0,
      to: 3,
      cost: 230,
    },
  ],
  lastDistanceCost: {
    from: 0,
    cost: 0,
  },
  selectedPoint: {},
  hidden: false,
  required: false,
  addToSummary: true,
  allowCurrency: false,
  additionalStyles: "",
  width: "100",
});
