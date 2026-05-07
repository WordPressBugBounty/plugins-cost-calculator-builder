# Admin Builder - Quick Reference

Quick lookup reference for common patterns and file locations.

## File Locations Cheat Sheet

```
Store a calculator field type?  → features/builder/calculator/CalculatorFields/{Type}/
Store a builder module?         → features/builder/{module-name}/
Store shared builder components?→ features/builder/shared/
Store a page component?         → pages/
Store a feature component?      → features/{feature-name}/
Store types?                    → shared/types/
Store UI components?            → shared/ui/components/
Store a Pinia store?            → app/providers/stores/
```

## Component Import Patterns

```typescript
// Stores
import { useBuilderStore } from '@/admin/app/providers/stores/useBuilderStore';
import { storeToRefs } from 'pinia';

// Types
import type { IField } from '@/admin/shared/types/fields.type';
import type { ICondition } from '@/admin/shared/types/conditions.type';

// Module-relative imports (inside a builder module)
import CalculatorContent from './CalculatorContent.vue';
import CalculatorToolbar from './CalculatorToolbar.vue';

// Shared builder components
import BuilderNavigation from '@/admin/features/builder/common/BuilderNavigation.vue';

// Components (absolute)
import Button from '@/admin/shared/ui/components/Button.vue';
```

## Store Usage Pattern

```typescript
// Setup
const builderStore = useBuilderStore();
const { builderFields } = storeToRefs(builderStore);

// Read state
const fields = builderStore.getBuilderFields;

// Read getter
const field = builderStore.getFieldByAlias('field_1');

// Call action
builderStore.setBuilderFields(newFields);
```

## Field Access Patterns

```typescript
// Get all fields (flat)
const allFields = builderFields.value.flatMap((page) =>
  page.groupElements.flatMap((section) => section.fields)
);

// Get field by alias
const field = builderStore.getFieldByAlias('field_1');

// Get fields from specific page
const pageFields = builderStore.getPageElementsById(1);

// Get total fields only
const totals = builderStore.getTotalElements;
```

## Common Field Properties

```typescript
// Always present
field.alias; // Unique identifier
field.label; // Display label
field.type; // Field type
field.pageId; // Parent page
field.sectionId; // Parent section

// Common optional
field.required; // Is required?
field.hidden; // Is hidden?
field.default; // Default value
field.description; // Help text
```

## VueFlow/Conditions Quick Access

```typescript
// Conditions store
import { useConditionsStore } from '@/admin/app/providers/stores/useConditionsStore';

const conditionsStore = useConditionsStore();

// Get nodes (fields)
const nodes = conditionsStore.getNodes;

// Get links (connections)
const links = conditionsStore.getLinks;

// Get spaces (groups)
const spaces = conditionsStore.getSpaces;
```

## Builder Content Types

```typescript
'calculator'; // Field builder (main)
'total-summary'; // Total display settings
'order-form'; // Contact form
'confirmation'; // Success page
'appearance'; // Visual styling/theming
```

## Calculator Module Sidebar Tabs (module-internal)

```typescript
'builder'; // Elements/widgets sidebar (CalculatorSidebar)
'layout'; // Layout settings (LayoutSidebar)
'themes'; // Theme selection (ThemesSidebar)
```

## Figma Links Quick Access

- **Calculator List**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=263-2880
- **Builder Page**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=622-36493
- **Fields Builder**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=714-59151
- **Total Summary**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=347-2590
- **Order Form**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=682-41310
- **Confirmation**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=1274-8194
- **Appearance**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=656-38999
- **Conditions**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=544-8301
- **Discounts**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=615-34024
- **Settings**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=589-27383

## Field-to-Type Lookup

Import: `import { ... } from "@/widget/shared/types/fields";`

```
Field            Interface                Source File
─────────────    ─────────────────────    ─────────────
Quantity         IQuantityField           input.type.ts
Range            IRangeField              input.type.ts
MultiRange       IMultiRangeField         input.type.ts
Text             ITextField               input.type.ts
ValidationForm   IValidatedFormField      input.type.ts
Radio            ISingleOptionsField      select.type.ts
Dropdown         ISingleOptionsField      select.type.ts
ImageRadio       ISingleOptionsField      select.type.ts
ImageDropdown    ISingleOptionsField      select.type.ts
Checkbox         IMultiOptionsField       select.type.ts
Toggle           IMultiOptionsField       select.type.ts
ImageCheckbox    IMultiOptionsField       select.type.ts
DatePicker       IDatePickerField         date.type.ts
TimePicker       ITimePickerField         date.type.ts
Divider          IDividerField            fields.type.ts
Html             IHtmlField               fields.type.ts
Geolocation      IGeolocationField        fields.type.ts
FileUpload       IFileUploadField         fields.type.ts
```

## Condition Actions Quick Reference

```typescript
'select_option'; // Select specific option
'select_option_and_disable'; // Select + disable field
'set_value'; // Set numeric/text value
'set_value_and_disable'; // Set value + disable
'hide'; // Hide completely
'hide_leave_in_total'; // Hide but calculate
'unset'; // Clear value
'unset_option'; // Clear selection
```

## Condition Logic Operators

```typescript
'=='; // Equals
'!='; // Not equals
'>='; // Greater than or equal
'<='; // Less than or equal
'in'; // Value in array
'contains'; // String contains
'not in'; // Value not in array
```

## Common Composables

```typescript
// Conditions
import { useConditionHelpers } from '@/admin/features/conditions/composable/useConditionHelpers';
import { useConditionLayout } from '@/admin/features/conditions/composable/useConditionLayout';
import { useDnD } from '@/admin/features/conditions/composable/useDnD';

// Settings
import { useCommonSettings } from '@/admin/features/settings/sections/composables/useCommonSettings';
```

## Module Status Overview

| Module          | Status             | Location                        |
| --------------- | ------------------ | ------------------------------- |
| Conditions      | ✅ Complete        | features/conditions/            |
| Settings        | ✅ Complete        | features/settings/              |
| Calculator List | ⚠️ In Development  | features/flow/                  |
| Fields Builder  | ⚠️ In Development  | features/builder/calculator/    |
| Total Summary   | ⚠️ In Development  | features/builder/total-summary/ |
| Order Form      | ⚠️ In Development  | features/builder/order-form/    |
| Confirmation    | ⚠️ In Development  | features/builder/confirmation/  |
| Appearance      | ⚠️ In Development  | features/builder/appearance/    |
| Discounts       | ❌ Not Implemented | (planned)                       |
