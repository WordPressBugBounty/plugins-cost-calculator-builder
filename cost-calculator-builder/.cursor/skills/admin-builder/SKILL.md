---
name: admin-builder
description: You are Senior/Lead Full Stack developer and you are working with wordpress plugin Cost Calculator Builder. Cost Calculator Builder admin module - calculator list, builder page, fields, conditions, settings. Use when working with frontend/vue3/src/admin or when the user mentions calculators, builder, admin pages, calculator fields, or calculator configuration.
---

# Admin Builder Module

The admin builder is the main management interface for creating and configuring calculators in the Cost Calculator Builder plugin.

## Module Location

```
frontend/vue3/src/admin/
├── app/
│   ├── App.vue                    # Main app entry
│   └── providers/stores/          # Pinia stores
├── features/                      # Feature modules
│   ├── builder/                   # Calculator builder
│   │   ├── modules/               # Builder modules (each self-contained)
│   │   │   ├── calculator/        # Fields builder module
│   │   │   │   ├── Calculator.vue          # Module root
│   │   │   │   ├── CalculatorContent.vue   # Drag-and-drop fields area
│   │   │   │   ├── CalculatorSidebar.vue   # Elements/widgets sidebar
│   │   │   │   ├── CalculatorToolbar.vue   # Toolbar (elements/layout/themes)
│   │   │   │   ├── LayoutSidebar.vue       # Layout settings sidebar
│   │   │   │   ├── ThemesSidebar.vue       # Themes sidebar
│   │   │   │   └── CalculatorFields/       # Field components (18 types)
│   │   │   ├── total-summary/     # Total summary module
│   │   │   ├── order-form/        # Order form module
│   │   │   ├── confirmation/      # Confirmation page module
│   │   │   └── appearance/        # Appearance/theming module
│   │   └── shared/                # Shared builder components
│   │       └── BuilderNavigation.vue  # Page tabs navigation bar
│   ├── conditions/                # Conditional logic (VueFlow)
│   ├── flow/                      # Calculator list & templates
│   ├── settings/                  # Settings & integrations
│   └── fields/                    # Field configurations
├── pages/                         # Top-level page components
│   ├── Flow.vue                   # Calculator list page
│   ├── CalculatorBuilder.vue      # Builder page
│   ├── Templates.vue              # Template selection
│   ├── Settings.vue               # Settings page
│   └── GlobalSettings.vue         # Global settings page
├── widgets/                       # Page-level widget wrappers
│   └── calculator/
│       ├── index.ts               # Widget exports
│       ├── Builder.vue            # Builder widget
│       ├── Conditions.vue         # Conditions widget
│       ├── Settings.vue           # Settings widget
│       └── Discounts.vue          # Discounts widget
└── shared/                        # Shared resources
    ├── api/                      # API classes (AdminAPI, FlowAPI)
    ├── types/                    # TypeScript interfaces
    ├── ui/components/            # Reusable UI components
    └── utils/                    # Utility functions
```

## User Flow

### 1. Calculator List (Flow Page)

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=263-2880

**Entry Point**: `pages/Flow.vue`

**Components**:

- `features/flow/CalculatorList/` - List of existing calculators
- `features/flow/TemplateSteps.vue` - Template selection modal
- `features/flow/TemplateList/` - Available templates

**Flow**:

1. User sees list of existing calculators (grid or list view)
2. Click "Create Calculator" button
3. Choose template or create blank calculator
4. Redirects to Calculator Builder page

**Key Store**: `useCalculatorListStore`, `useTemplatesStore`

### 2. Calculator Builder (Builder Page)

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=622-36493

**Status**: ⚠️ **IN DEVELOPMENT**

**Entry Point**: `pages/CalculatorBuilder.vue`

**Architecture**: Module-based. Each builder tab (Calculator, Total Summary, etc.) is a self-contained module in `features/builder/`. The `widgets/calculator/Builder.vue` async-loads the active module based on `builderStore.builderContent.content`. Each module composes its own content, sidebar, and toolbar via `BuilderContainer` slots.

**Builder Content Types** (tabs in navigation bar):

#### a) Fields Builder (Calculator)

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=714-59151

**Status**: ⚠️ In Development

**Module**: `features/builder/calculator/`

**Components**:

- `Calculator.vue` - Module root (composes BuilderContainer)
- `CalculatorContent.vue` - Drag-and-drop fields area
- `CalculatorSidebar.vue` - Elements/widgets sidebar
- `CalculatorToolbar.vue` - Toolbar (elements/layout/themes)
- `CalculatorFields/` - All 18 field type components

Drag-and-drop interface for building calculator fields with:

- Pages (page breakers)
- Sections (group elements)
- Fields (calculator elements)

**Structure**:

```typescript
IPageBreaker → ISection[] → IField[]
```

#### b) Total Summary Builder

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=347-2590

**Status**: ⚠️ In Development

**Module**: `features/builder/total-summary/`

**Components**:

- `TotalSummary.vue` - Module root
- `TotalSummaryContent.vue` - Content area
- `TotalSummarySidebar.vue` - Sidebar

Configure the calculator's total display and summary information.

#### c) Order Form Manager

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=682-41310

**Status**: ⚠️ In Development

**Module**: `features/builder/order-form/`

**Components**:

- `OrderForm.vue` - Module root
- `OrderFormContent.vue` - Content area
- `OrderFormSidebar.vue` - Sidebar

Configure contact form fields for collecting customer information.

#### d) Confirmation Page

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=1274-8194

**Status**: ⚠️ In Development

**Module**: `features/builder/confirmation/`

**Components**:

- `Confirmation.vue` - Module root
- `ConfirmationContent.vue` - Content area
- `ConfirmationSidebar.vue` - Sidebar

Configure the success/confirmation page shown after submission.

#### e) Appearance

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=656-38999

**Status**: ⚠️ In Development

**Module**: `features/builder/appearance/`

**Components**:

- `Appearance.vue` - Module root
- `AppearanceContent.vue` - Content area
- `AppearanceSidebar.vue` - Sidebar

Visual styling and theming options for the calculator.

**Key Store**: `useBuilderStore`, `useAppearanceStore`

### 3. Conditions (VueFlow)

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=544-8301

**Status**: ✅ Already implemented and working

**Entry Point**: `features/conditions/`

**Library**: VueFlow (visual node-based editor)

**Components**:

- `Custom/CustomNode.vue` - Field nodes
- `Link/LinkModal.vue` - Condition configuration
- `Space/Spaces.vue` - Condition grouping
- `Search/SearchToolbar.vue` - Node search

**Purpose**: Visual interface for creating conditional logic between calculator fields.

**Key Store**: `useConditionsStore`, `useFlowStore`

### 4. Discounts

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=615-34024

**Status**: ❌ **NOT IMPLEMENTED** - Planned for future development

**Key Store**: `useDiscountsStore` (exists but functionality not complete)

### 5. Settings & Integrations

**Figma**: https://www.figma.com/design/QtYzoNnvM3aLlkzmYWICbw/Amirsoy?node-id=589-27383

**Status**: ✅ Already implemented

**Entry Point**: `features/settings/`

**Components**:

- `SettingsBlock.vue` - Main settings container
- `SettingsSidebar.vue` - Settings navigation
- `sections/` - Individual setting sections:
  - Currency.vue
  - OrderForm.vue
  - Confirmation.vue
  - Payments.vue
  - Webhooks.vue
  - Woocommerce.vue
  - etc.

**Key Store**: `useSettingsStore`

## Field Types

Components: `features/builder/calculator/CalculatorFields/`
Types imported from: `@/widget/shared/types/fields`

All fields extend `IBaseField` (id, label, alias, hidden, required, value, width, etc.)

### Quantity

- **Interface**: `IQuantityField` (extends IBaseInputField)
- **Unique**: min, max, step, placeholder, hideMinMax, buttonsPosition, separation, enabledCurrencySettings
- **Styles**: Default, Buttons

### Range

- **Interface**: `IRangeField` (extends IBaseInputField)
- **Unique**: min, max, multipliedTotal, scalePoints, jump
- **Styles**: Default, Small, Flat, Modern, Input, MultiPoint

### MultiRange

- **Interface**: `IMultiRangeField` (extends IRangeField)
- **Unique**: defaultLeft, defaultRight, values (Array)
- **Styles**: Default, Small, Flat, Modern, Input, MultiPoint

### Text

- **Interface**: `ITextField`
- **Unique**: numberOfCharacters, placeholder
- **Styles**: Default

### Radio

- **Interface**: `ISingleOptionsField`
- **Unique**: options (IOptions[]), selectedOption, summaryView, styles, showValueInOption, disableOptions, round
- **Styles**: Default, Box, BoxRadio

### Dropdown

- **Interface**: `ISingleOptionsField`
- **Unique**: options (IOptions[]), selectedOption, summaryView, styles, showValueInOption, disableOptions, round
- **Styles**: Default

### Checkbox

- **Interface**: `IMultiOptionsField`
- **Unique**: options (IOptions[]), selectedOption[], summaryView, styles, minAllowedOptions, maxAllowedOptions, disableOptions, showValueInOption
- **Styles**: DefaultStyle, Box, BoxWithCheckbox, BoxWithCheckboxAndDescription, BoxWithHeadingCheckboxAndDescription

### Toggle

- **Interface**: `IMultiOptionsField`
- **Unique**: options (IOptions[]), selectedOption[], summaryView, styles, minAllowedOptions, maxAllowedOptions, disableOptions
- **Styles**: Default, BoxToggleWithDescription

### ImageRadio

- **Interface**: `ISingleOptionsField` (needs extending for image props)
- **Unique**: same as Radio + options have `src` and `icon` properties (via IOptions)
- **Styles**: DefaultStyle, WithIcon

### ImageDropdown

- **Interface**: `ISingleOptionsField` (needs extending for image props)
- **Unique**: same as Dropdown + options have `src` and `icon` properties (via IOptions)
- **Styles**: Default

### ImageCheckbox

- **Interface**: `IMultiOptionsField` (needs extending for image props)
- **Unique**: same as Checkbox + options have `src` and `icon` properties (via IOptions)
- **Styles**: Default, WithIcon

### DatePicker

- **Interface**: `IDatePickerField`
- **Unique**: isHaveUnselectable, notAllowedWeekDays, notAllowedDates (IPeriodData), daysFromCurrent, dayPrice, dayPriceEnabled, autoCloseEnabled, calculateUnselectableDays, range

### TimePicker

- **Interface**: `ITimePickerField`
- **Unique**: useInterval, format, placeholderHours, placeholderTime, minInterval, range
- **Styles**: SingleTime, RangeTime

### Divider

- **Interface**: `IDividerField`
- **Unique**: size, len, style, htmlContent
- **Styles**: Default

### Html

- **Interface**: `IHtmlField`
- **Unique**: htmlContent
- **Styles**: Default

### Geolocation

- **Interface**: `IGeolocationField`
- **Unique**: type, costDistance, distanceCostList, distanceCostOptions, eachCost, geoType, measure, pricingType, multiplyLocations, userAddress, userLocation, userSelectedOptions
- **Styles**: UserLocation, TwoPoints, MultiplyLocation

### FileUpload

- **Interface**: `IFileUploadField`
- **Unique**: fileFormats, maxAttachedFiles, maxFileSize, calculatePerEach, uploadFromUrl, allowPrice, price
- **Styles**: Default

### ValidationForm

- **Interface**: `IValidatedFormField`
- **Unique**: fieldType ("email" | "phone" | "name" | "website_url"), placeholder, defaultCountry
- **Components**: Email, Name, Phone, WebsiteUrl

**See [schemas.md](schemas.md) for full interface definitions.**

## API Integration

### Frontend API Classes

Located in `shared/api/`:

- **AdminAPI.ts** - Builder, Settings, Conditions operations
- **FlowAPI.ts** - Calculator List, Templates operations

### Request Flow

```
Vue Component → API Class → Axios
  ↓
WordPress AJAX (/wp-admin/admin-ajax.php)
  ↓
Action Router (CCBAjaxAction.php)
  ↓
Handler Method (CCBCalculatorsHandler.php)
  ↓ Nonce verification (check_ajax_referer)
  ↓ Permission check (current_user_can)
  ↓ Business logic
Database (wp_posts, wp_postmeta)
  ↓
JSON Response → Vue Component
```

### Key Endpoints

**Flow API:**

- `ccb_fetch_calculators` - Get calculator list
- `ccb_fetch_templates` - Get available templates
- `calc_create_id` - Create blank calculator
- `calc_use_template` - Create from template
- `ccb_delete_calc` - Delete calculator(s)
- `ccb_duplicate_calc` - Duplicate calculator(s)

**Admin API:**

- `ccb_get_calculator_admin_data` - Load calculator data
- `calc_save_settings` - Save calculator data

### Security

- **Nonces**: CSRF protection via `window.ccb_nonces`
- **Capabilities**: All endpoints require `current_user_can('manage_options')`
- **Sanitization**: Input sanitized via `apply_filters('stm_ccb_sanitize_array')`

### Data Storage

- **Calculators**: Custom post type `cost-calc` in `wp_posts`
- **Configuration**: JSON strings in `wp_postmeta`:
  - `stm-fields` - Builder structure
  - `stm-settings` - Settings
  - `stm-conditions` - Conditions
- **Global Settings**: `wp_options` table

**See [api-integration.md](api-integration.md) for complete API documentation.**

## Key Type Definitions

### Builder UI State (`admin/shared/types/builder.type.ts`)

```typescript
type builderContentType =
  | 'calculator'
  | 'confirmation'
  | 'order-form'
  | 'total-summary'
  | 'appearance';
type builderActiveTabType = 'elements' | 'layout' | 'themes';
type builderSidebarContentType = 'builder' | 'themes' | 'layout'; // calculator-module-internal
```

### Builder Hierarchy (`admin/shared/types/fields.type.ts`)

```
IPageBreaker → ISection[] → IField[]
```

### Field Types

All field interfaces in `@/widget/shared/types/fields` - see Field Types section above.

### Condition Types (`admin/shared/types/conditions.type.ts`)

See [schemas.md](schemas.md) for full condition interfaces (ICondition, IRawNode, IRawLink, ISpace).

## Pinia Stores

### useBuilderStore

- **State**: `builderFields` (IPageBreaker[]), `rawFields`, `builderContent`
- **Getters**: `getFieldByAlias`, `getTotalElements`, `getPages`
- **Actions**: `setBuilderFields`, `setBuilderContent`, `setRawFields`

### useConditionsStore

- **Purpose**: Manages VueFlow nodes, links, and spaces
- **State**: Condition nodes, links, and space groupings

### useCalculatorListStore

- **Purpose**: Manages calculator list and pagination
- **State**: List of calculators, filters, view mode

### useTemplatesStore

- **Purpose**: Template selection and creation
- **State**: Available templates

### useSettingsStore

- **Purpose**: Global calculator settings
- **State**: Currency, payment, integration settings

### useAppStore

- **Purpose**: Application-level state
- **State**: Current page, calculator ID, edit mode

## Navigation Between Pages

The app uses a page-based navigation system:

```typescript
// Set in App.vue
appStore.setPage(inject("page") as Page);

// Page types
type Page = "flow" | "calculator";

// Pages load dynamically
if (page === "flow") → Load Flow.vue (calculator list)
if (page === "calculator") → Load CalculatorBuilder.vue
```

## Common Tasks

### Adding a New Field Type

1. Create folder in `features/builder/calculator/CalculatorFields/NewField/`
2. Create `NewField.vue` component
3. Create `styles/` folder with style variants
4. Register field in `CalculatorContent.vue` field component map
5. Add icon and configuration

### Modifying Field Sidebar

Edit `features/builder/calculator/CalculatorSidebar.vue`:

- Contains tabs: Elements, HTML Widgets
- Elements tab shows draggable field types grouped by category

### Adding a New Builder Module

1. Create folder in `features/builder/new-module/`
2. Create `NewModule.vue` (module root using `BuilderContainer` slots)
3. Create `NewModuleContent.vue` and `NewModuleSidebar.vue`
4. Add the content type to `builderContentType` in `shared/types/builder.type.ts`
5. Add async import case in `widgets/calculator/Builder.vue`

### Working with Conditions

The conditions feature uses VueFlow library:

- Nodes = Calculator fields
- Edges/Links = Conditional relationships
- Spaces = Logical groupings

Key files:

- `features/conditions/Custom/CustomNode.vue` - Node rendering
- `features/conditions/Link/LinkModal.vue` - Condition editor
- Composables: `useConditionHelpers.ts`, `useConditionLayout.ts`, `useDnD.ts`

### Accessing Field Data

```typescript
import { useBuilderStore } from '@/admin/app/providers/stores/useBuilderStore';

const builderStore = useBuilderStore();

// Get all fields
const fields = builderStore.getBuilderFields;

// Get specific field
const field = builderStore.getFieldByAlias('field_1');

// Get fields by page
const pageFields = builderStore.getPageElementsById(1);
```

## Important Notes

- All stores use Pinia with TypeScript
- Components use Composition API with `<script setup lang="ts">`
- Path alias `@/admin` points to `frontend/vue3/src/admin/`
- Figma designs are reference - actual implementation may vary

### Implementation Status

**✅ Complete & Functional:**

- Conditions module (VueFlow-based conditional logic)
- Settings & Integrations module

**⚠️ In Active Development:**

- Calculator List / Flow page
- Builder page (Fields, Total Summary, Order Form, Confirmation, Appearance)
- All 18 field types and components

**❌ Not Implemented:**

- Discounts module (planned)

## Related Files

For complete API/backend integration, see [api-integration.md](api-integration.md)
For detailed type schemas, see [schemas.md](schemas.md)
For step-by-step workflows, see [workflows.md](workflows.md)
For quick lookups, see [quick-reference.md](quick-reference.md)
