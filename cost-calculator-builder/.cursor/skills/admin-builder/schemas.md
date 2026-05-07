# Admin Builder - Type Schemas Reference

Detailed TypeScript type definitions for the admin builder module.

**Source**: `frontend/vue3/src/widget/shared/types/fields/`
**Import**: `import { IRangeField } from "@/widget/shared/types/fields";`

---

## Shared / Helper Types

### IOptions

```typescript
interface IOptions {
  optionText: string;
  optionValue: string;
  optionConverted: string;
  optionHint?: string;
  src?: string;       // Image URL (used by Image* fields)
  icon?: string;      // Icon name (used by Image* fields)
}
```

### IStyles

```typescript
interface IStyles {
  boxStyle?: string;
  style?: string;
  iconPath?: string;
  applyToAll?: boolean;
  textColor?: string;
  backgroundColor?: string;
}
```

### SummaryView

```typescript
type SummaryView = "show_value" | "show_label_not_calculable" | "show_label_calculable";
```

---

## IBaseField (base for all fields)

```typescript
interface IBaseField {
  id: number;
  label: string;
  fieldName: string;
  alias: string;
  hidden: boolean;
  hideAndLeaveTotal: boolean;
  required: boolean;
  isCalculable: boolean;
  description: string | undefined;
  disabled: boolean;
  useCurrency: boolean;
  additionalStyles?: string;
  defaultValue: string | number;
  displayValue: string;
  calculateHidden: boolean;
  addToSummary: boolean;
  repeaterIdx: number | undefined;
  repeaterAlias: string | undefined;
  value?: number;
  fieldCurrency: boolean;
  fieldCurrencySettings?: CurrencyFormatOptions;
  width?: string;
}
```

---

## Individual Field Interfaces

### Quantity - IQuantityField

```typescript
interface IBaseInputField extends IBaseField {
  value: number;
  round: boolean;
  sign: string;
  extraDisplayView?: string;
  step: number;
  multiply: boolean;
  unit: number;
  unitSymbol: string;
  unitPosition: "left" | "right";
}

interface IQuantityField extends IBaseInputField {
  min: number;
  max: number;
  placeholder: string;
  hideMinMax: boolean;
  enabledCurrencySettings: boolean;
  styles: { style: string };
  buttonsPosition: "right" | "both";
  separation: boolean;
  originalValue: number;
}
```

### Range - IRangeField

```typescript
interface IRangeField extends IBaseInputField {
  min: number;
  max: number;
  multipliedTotal: boolean;
  styles: { style: string };
  scalePoints: string;
  jump: boolean;
  originalValue: number;
}
```

### MultiRange - IMultiRangeField

```typescript
interface IMultiRangeField extends IRangeField {
  defaultLeft: number;
  defaultRight: number;
  values: Array<number>;
}
```

### Text - ITextField

```typescript
interface ITextField extends IBaseField {
  numberOfCharacters: number;
  placeholder: string;
}
```

### ValidationForm - IValidatedFormField

```typescript
interface IValidatedFormField extends IBaseField {
  fieldType: "email" | "phone" | "name" | "website_url";
  placeholder: string;
  defaultCountry?: string;
}
```

### Radio - ISingleOptionsField

```typescript
interface ISingleOptionsField extends IBaseField {
  options: IOptions[];
  extraDisplayView?: string;
  selectedOption?: IOptions;
  summaryView: SummaryView;
  styles: IStyles | undefined;
  round: boolean;
  showValueInOption: boolean;
  disableOptions: number[];
}
```

### Dropdown - ISingleOptionsField

Same interface as Radio (`ISingleOptionsField`).

### Checkbox - IMultiOptionsField

```typescript
interface IMultiOptionsField extends Omit<IBaseField, "displayValue"> {
  options: IOptions[];
  extraDisplayView?: string;
  selectedOption?: IOptions[];
  summaryView: SummaryView;
  displayValue: string | string[];
  styles: IStyles | undefined;
  round: boolean;
  minAllowedOptions: number;
  maxAllowedOptions: number;
  disableOptions: number[];
  showValueInOption: boolean;
}
```

### Toggle - IMultiOptionsField

Same interface as Checkbox (`IMultiOptionsField`).

### ImageRadio - ISingleOptionsField

Currently uses `ISingleOptionsField`. Image-specific data is in `IOptions.src` and `IOptions.icon`.
Needs dedicated extended type in future (e.g., `IImageRadioField extends ISingleOptionsField`).

### ImageDropdown - ISingleOptionsField

Currently uses `ISingleOptionsField`. Image-specific data is in `IOptions.src` and `IOptions.icon`.
Needs dedicated extended type in future (e.g., `IImageDropdownField extends ISingleOptionsField`).

### ImageCheckbox - IMultiOptionsField

Currently uses `IMultiOptionsField`. Image-specific data is in `IOptions.src` and `IOptions.icon`.
Needs dedicated extended type in future (e.g., `IImageCheckboxField extends IMultiOptionsField`).

### DatePicker - IDatePickerField

```typescript
interface IPeriod {
  start: string;
  end: string;
}

interface IPeriodData {
  period: IPeriod[];
  allPast: boolean;
  current: boolean;
  daysFromCurrent: boolean;
}

interface IDatePickerField extends IBaseField {
  styles?: IStyles;
  placeholder: string;
  isHaveUnselectable: boolean;
  notAllowedWeekDays: number[];
  notAllowedDates: IPeriodData | undefined;
  daysFromCurrent: number;
  dayPrice: number;
  dayPriceEnabled: boolean;
  autoCloseEnabled: boolean;
  calculateUnselectableDays?: boolean;
  range: boolean;
  selectedDate?: Date | Date[];
  extraDisplayView?: string[];
}
```

### TimePicker - ITimePickerField

```typescript
interface ITimePickerField extends IBaseField {
  styles?: IStyles;
  useInterval: boolean;
  format: boolean;
  placeholderHours: string;
  placeholderTime: string;
  minInterval: string;
  range: boolean;
}
```

### Divider - IDividerField

```typescript
interface IDividerField extends IBaseField {
  htmlContent?: string;
  size: string;
  len: string;
  style: string;
}
```

### Html - IHtmlField

```typescript
interface IHtmlField extends IBaseField {
  htmlContent: string;
}
```

### Geolocation - IGeolocationField

```typescript
interface IGeolocationField extends IBaseField {
  type: string;
  costDistance: boolean;
  distanceCostList: Array<number>;
  distanceCostOptions: Array<number>;
  eachCost: number;
  geoType: string;
  lastDistanceCost: object;
  measure: string;
  multiplyLocations: Array<object>;
  pricingType: string;
  selectedPoint?: object;
  userAddress: string;
  userLocation: Array<number>;
  extraDisplayView?: string[];
  userSelectedOptions: object;
}
```

### FileUpload - IFileUploadField

```typescript
interface IFileUploadField extends IBaseField {
  fileFormats: string[];
  maxAttachedFiles: number;
  maxFileSize: number;
  calculatePerEach: boolean;
  uploadFromUrl: boolean;
  allowPrice: boolean;
  price: number;
  files?: File[];
  extraDisplayView?: string;
  customAlias?: string;
  inRepeater?: boolean;
  options?: { value: File[] | undefined };
}
```

---

## Structural / Container Types

### IFormulaField (Total)

```typescript
interface IFormulaField extends IBaseField {
  formula: string;
  originalFormula: string;
  originalValue?: number;
  originalDisplayView?: string;
  hasDiscount?: boolean;
  discount?: ITotalDiscount;
}
```

### IRepeaterField

```typescript
interface IRepeaterField extends IFormulaField {
  originalElements: ISourceField[];
  groupElements: Map<string, Field>[];
  sumAllAvailable: boolean;
  repeatCount: number;
  enableFormula: boolean;
  addButtonLabel: string;
  removeButtonLabel: string;
}
```

### IGroupField

```typescript
interface IGroupField extends IBaseField {
  collapse: boolean;
  accordion: boolean;
  collapsible: boolean;
  hidden: boolean;
  icon: string;
  isCalculable: boolean;
  label: string;
  showTitle: boolean;
  groupElements: Map<string, Field>[];
}
```

### ISectionField

```typescript
interface ISectionField extends IBaseField {
  fields: Map<string, Field>;
  collapsible: boolean;
  defaultCollapsed: boolean;
  showName: boolean;
  styles: IStyles;
}
```

### IPageBreakerField

```typescript
interface IPageBreakerField extends IBaseField {
  groupElements: Map<string, Field>[];
  conditions: Record<string, IConditionRule[]>;
  nextBtnLabel: string;
  previousBtnLabel: string;
  alias: string;
  condition: string;
  action: string;
  pageTo: string;
  type: string;
}
```

### Field Union Type

```typescript
type Field =
  | IQuantityField
  | ITextField
  | IRangeField
  | IMultiRangeField
  | ISingleOptionsField
  | IMultiOptionsField
  | IDatePickerField
  | ITimePickerField
  | IFileUploadField
  | IFormulaField
  | IRepeaterField
  | IDividerField
  | IHtmlField
  | IGeolocationField
  | IPageBreakerField
  | IGroupField
  | ISectionField
  | IValidatedFormField;
```

---

## Admin-Specific Types (admin/shared/types/)

### Builder Structure (admin/shared/types/fields.type.ts)

```typescript
interface ISection {
  fields: IField[];
  alias: string;
  description: string;
  label: string;
  letter: string;
  type: string;
  _id: number;
}

interface IPageBreaker {
  alias: string;
  description: string;
  groupElements: ISection[];
  label: string;
  letter: string;
  type: string;
  _id: number;
}
```

## Condition Schemas

### Condition Rule

```typescript
interface IConditionRule {
  checkedValues: number[];           // Selected option IDs
  condition: ConditionLogic;         // Logic operator
  key: number;                       // Rule ID
  logicalOperator: ConditionLogicalOperator; // && or ||
  sort: number;                      // Display order
  value: string;                     // Comparison value
}

type ConditionLogic = 
  | "=="           // Equals
  | "!="           // Not equals
  | ">="           // Greater or equal
  | "<="           // Less or equal
  | "in"           // In array
  | "contains"     // Contains substring
  | "not in"       // Not in array
  | "!= & distance"
  | "<= & distance"
  | ">= & distance";

type ConditionLogicalOperator = "||" | "&&";
```

### Condition Definition

```typescript
interface ICondition {
  index: boolean;                    // ???
  optionFrom: string;                // Source field alias
  optionTo: string;                  // Target field alias
  setOptions: string;                // Options to set (JSON)
  setVal: string | number;           // Value to set
  sort: number;                      // Display order
  type: ConditionType;               // Field type
  conditions: IConditionRule[];      // Array of rules
  action: ConditionAction;           // Action to perform
  hide: boolean;                     // Hide when condition met
  open: boolean;                     // Expanded in UI
}

type ConditionAction =
  | "select_option"              // Select specific option
  | "select_option_and_disable"  // Select and disable
  | "set_value"                  // Set field value
  | "set_value_and_disable"      // Set value and disable
  | "hide"                       // Hide field
  | "unset"                      // Clear field value
  | "hide_leave_in_total"        // Hide but keep in calculations
  | "unset_option"               // Clear selected options
  | "";                          // No action
```

### VueFlow Node Structure

```typescript
interface IRawNode {
  id: string;        // Node ID (field alias)
  data: {
    alias: string;       // Field alias
    calculable: boolean; // Can be used in formulas
    icon: string;        // Icon name
    label: string;       // Display label
    old_id: number;      // Legacy ID
    space: string;       // Space/group slug
  };
  position: {
    x: number;         // X coordinate
    y: number;         // Y coordinate
  };
  type: string;        // Node type
}
```

### VueFlow Link Structure

```typescript
interface IRawLink {
  id: string;          // Link ID
  source: string;      // Source node ID
  sourceHandle: string;// Source connection point
  target: string;      // Target node ID
  targetHandle: string;// Target connection point
  type: string;        // Link type
  data: {
    space: string;          // Space slug
    condition: ICondition[]; // Condition definitions
    options_from: string;    // Source options
    options_to: string;      // Target options
  };
}
```

### Space (Condition Group)

```typescript
interface ISpace {
  id: number;        // Space ID
  label: string;     // Display label
  slug: string;      // URL-safe slug
  sort_id: number;   // Display order
}
```

## Builder Content State

```typescript
interface IBuilderContent {
  content: builderContentType;          // Current content tab
  activeTab: builderActiveTabType;      // Active sidebar tab
  sidebarCollapse: boolean;             // Sidebar collapsed state
  sidebarContent: builderSidebarContentType; // Sidebar content type
}

type builderContentType = 
  | "calculator"      // Fields builder
  | "confirmation"    // Confirmation page
  | "order-form"      // Order form
  | "total-summary";  // Total summary

type builderActiveTabType = 
  | "elements"        // Field elements tab
  | "layout"          // Layout settings tab
  | "themes";         // Theme selection tab

type builderSidebarContentType = 
  | "builder"         // Builder sidebar
  | "themes";         // Theme sidebar
```

## Calculator Definition

```typescript
interface ICalculator {
  id: number;          // Calculator ID
  title: string;       // Calculator title
  icon?: string;       // Icon URL
  image?: string;      // Preview image URL
  created_at: string;  // Creation timestamp
}
```

## Raw Fields (From Backend)

```typescript
interface ICalculatorRawFields {
  alias: string;       // Field alias template
  description: string; // Field description
  icon: string;        // Icon identifier
  name: string;        // Field type name
  sort_type: string;   // Sort category
  tag: string;         // HTML tag
  type: string;        // Field type
  width: number;       // Default width
}
```

## Store State Examples

### Builder Store State

```typescript
interface IBuilderStore {
  rawFields: ICalculatorRawFields[];  // Available field types
  builderFields: IPageBreaker[];      // Calculator structure
  builderContent: IBuilderContent;    // UI state
}
```

### Example Data Structure

```typescript
// Example calculator structure
const calculatorData: IPageBreaker[] = [
  {
    _id: 0,
    alias: "page_1",
    label: "Page 1",
    type: "page-break",
    groupElements: [
      {
        _id: 0,
        alias: "section_1",
        label: "Section 1",
        type: "Group",
        fields: [
          {
            _id: "field_1",
            alias: "field_1",
            type: "Range",
            label: "Select Amount",
            pageId: "0",
            sectionId: "0",
            // ... more properties
          }
        ]
      }
    ]
  }
];
```

## Field Type Categories

### Input Fields
- Quantity - Numeric input
- Text - Static text display
- Html - Custom HTML content

### Selection Fields
- Dropdown - Single select dropdown
- Radio - Single select radio buttons
- Checkbox - Multi-select checkboxes
- Toggle - On/off switch
- ImageDropdown - Dropdown with images
- ImageRadio - Radio with images
- ImageCheckbox - Checkbox with images

### Range Fields
- Range - Single-handle slider
- MultiRange - Multi-handle slider

### Date/Time Fields
- DatePicker - Date selection
- TimePicker - Time selection

### Special Fields
- FileUpload - File upload input
- Geolocation - Location picker
- ValidationForm - Form validation
- Divider - Visual separator

## Common Field Properties by Type

### All Fields (IBaseField)
- Required: id, label, alias, type, _id, pageId, sectionId

### Calculation Fields (Total, Quantity)
- Additional: letter, formulaFieldView, additionalStyles

### Input Fields (Quantity, Dropdown, etc.)
- Additional: required, placeholder, default, description

### Selection Fields (Radio, Checkbox, Dropdown)
- Additional: options (array), default (selected value)

## Navigation Flow

```
Flow Page (Calculator List)
  ↓ Click "Create Calculator"
  ↓ Select Template or Blank
  ↓
Calculator Builder Page
  ├── Calculator Tab (Fields)
  ├── Total Summary Tab
  ├── Order Form Tab
  ├── Confirmation Tab
  └── Appearance Tab
  
  Toolbar Actions:
  ├── Conditions (Opens VueFlow editor)
  ├── Discounts (Opens discounts page)
  └── Settings (Opens settings page)
```
