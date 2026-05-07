# Admin Builder - Common Workflows

This document provides step-by-step workflows for common tasks in the admin builder module.

## Workflow 1: Adding a New Field to the Calculator

### Step 1: Access the Field in the Store

```typescript
import { useBuilderStore } from '@/admin/app/providers/stores/useBuilderStore';
import { storeToRefs } from 'pinia';

const builderStore = useBuilderStore();
const { builderFields } = storeToRefs(builderStore);
```

### Step 2: Create the New Field Object

```typescript
const newField: IQuantityField = {
  id: Date.now(),
  _id: `field_${Date.now()}`,
  alias: `field_${Date.now()}`,
  label: 'New Field',
  fieldName: 'new_field',
  type: 'Quantity',
  hidden: false,
  _tag: 'cost-quantity',
  icon: 'ccb-icon-quantity',
  pageId: '0', // First page
  sectionId: '0', // First section
  index: 0,
  width: 100,
  letter: 'A',
  // Quantity-specific properties
  addToSummary: true,
  required: false,
  default: 1,
  step: 1,
  placeholder: 'Enter value',
  // ... other properties
};
```

### Step 3: Add to Builder Structure

```typescript
// Add to specific section in specific page
builderFields.value[pageIndex].groupElements[sectionIndex].fields.push(
  newField
);

// Or use store action
builderStore.setBuilderFields(updatedFields);
```

## Workflow 2: Creating a New Calculator from Template

### Step 1: User Clicks "Create Calculator"

```vue
<!-- In CalculatorList.vue -->
<button @click="showTemplateModal = true">
  Create Calculator
</button>
```

### Step 2: Template Selection Modal Opens

```vue
<!-- TemplateSteps.vue component -->
<template>
  <TemplateList :templates="templates" @select="handleTemplateSelect" />
</template>
```

### Step 3: Template Selected or Blank

```typescript
// In template selection handler
async function handleTemplateSelect(templateId: number | null) {
  const templateStore = useTemplatesStore();

  if (templateId === null) {
    // Create blank calculator
    await createBlankCalculator();
  } else {
    // Create from template
    await createFromTemplate(templateId);
  }

  // Redirect to builder
  window.location.href = `/wp-admin/admin.php?page=calculator-builder&id=${newCalcId}`;
}
```

### Step 4: Initialize Builder Store

```typescript
// In CalculatorBuilder.vue onMounted
onMounted(async () => {
  const calcId = appStore.getCalcId;

  // Fetch calculator data
  const response = await api.getCalculator(calcId);

  // Set builder fields
  builderStore.setBuilderFields(response.data.fields);
  builderStore.setRawFields(response.data.rawFields);
});
```

## Workflow 3: Implementing a Condition

### Step 1: Open Conditions Page

User clicks "Conditions" button in toolbar → Opens VueFlow editor

### Step 2: Add Nodes (Fields)

```typescript
// Fields are automatically loaded as nodes from builderStore
const nodes = builderFields.value.flatMap((page) =>
  page.groupElements.flatMap((section) =>
    section.fields.map((field) => ({
      id: field.alias,
      data: {
        alias: field.alias,
        label: field.label,
        icon: field.icon,
        calculable: field.type !== 'Html',
        space: 'default',
      },
      position: { x: 0, y: 0 },
      type: 'custom',
    }))
  )
);
```

### Step 3: Create Link Between Nodes

```typescript
// User drags from source to target node
function onConnect(connection) {
  const newLink: IRawLink = {
    id: `link_${Date.now()}`,
    source: connection.source, // Source field alias
    target: connection.target, // Target field alias
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'custom',
    data: {
      space: currentSpace.value,
      condition: [],
      options_from: '',
      options_to: '',
    },
  };

  // Open modal to configure condition
  openLinkModal(newLink);
}
```

### Step 4: Configure Condition Rules

```typescript
// In LinkModal.vue
const condition: ICondition = {
  optionFrom: sourceField.alias,
  optionTo: targetField.alias,
  type: sourceField.type as ConditionType,
  action: 'select_option',
  conditions: [
    {
      key: 1,
      condition: '==',
      value: 'option_1',
      checkedValues: [1],
      logicalOperator: '&&',
      sort: 0,
    },
  ],
  setOptions: '',
  setVal: '',
  sort: 0,
  hide: false,
  open: true,
};
```

### Step 5: Save Condition

```typescript
// Save to conditions store
const conditionsStore = useConditionsStore();
conditionsStore.addLink(newLink);

// Sync to backend
await api.saveConditions(calcId, {
  nodes: conditionsStore.getNodes,
  links: conditionsStore.getLinks,
  spaces: conditionsStore.getSpaces,
});
```

## Workflow 4: Customizing Field Appearance

### Step 1: Navigate to Field Settings

User clicks on field in builder → Sidebar shows field settings

### Step 2: Modify Field Properties

```vue
<!-- In field settings component -->
<template>
  <div class="field-settings">
    <input v-model="field.label" placeholder="Field Label" />

    <select v-model="field.width">
      <option :value="100">Full Width</option>
      <option :value="50">Half Width</option>
      <option :value="33">Third Width</option>
    </select>

    <textarea v-model="field.description" placeholder="Field Description" />

    <select v-model="field.desc_option">
      <option value="before">Description Before</option>
      <option value="after">Description After</option>
    </select>
  </div>
</template>
```

### Step 3: Update Field in Store

```typescript
function updateField(updatedField: IField) {
  // Find and update field in builderFields
  const pageIndex = builderFields.value.findIndex(
    (page) => page._id.toString() === updatedField.pageId
  );

  const sectionIndex = builderFields.value[pageIndex].groupElements.findIndex(
    (section) => section._id.toString() === updatedField.sectionId
  );

  const fieldIndex = builderFields.value[pageIndex].groupElements[
    sectionIndex
  ].fields.findIndex((f) => f.alias === updatedField.alias);

  builderFields.value[pageIndex].groupElements[sectionIndex].fields[
    fieldIndex
  ] = updatedField;
}
```

## Workflow 5: Switching Between Builder Modules

### Step 1: User Clicks Tab in Navigation Bar

The `BuilderNavigation.vue` (shared component) shows page tabs and module tabs (Total Summary, Order Form, Confirmation). Clicking a module tab updates the store:

```typescript
function handleTotalSummary() {
  builderStore.setBuilderContent('total-summary');
}
```

### Step 2: Update Builder Content State

```typescript
function switchContent(content: builderContentType) {
  builderStore.setBuilderContent(content);
}
```

### Step 3: Entire Module Switches via Async Component

```vue
<!-- widgets/calculator/Builder.vue -->
<template>
  <div class="ccb-calculator-page-container">
    <Transition name="fade" mode="out-in">
      <component :is="activeModule" :key="builderContent.content" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
const builderStore = useBuilderStore();
const builderContent = builderStore.getBuilderContent;

const activeModule = computed(() => {
  switch (builderContent.content) {
    case 'calculator':
      return defineAsyncComponent(
        () => import('@/admin/features/builder/calculator/Calculator.vue')
      );
    case 'total-summary':
      return defineAsyncComponent(
        () => import('@/admin/features/builder/total-summary/TotalSummary.vue')
      );
    // ... other modules
  }
});
</script>
```

Each module root (e.g., `Calculator.vue`) composes `BuilderContainer` with its own content, sidebar, and toolbar. The entire module (content + sidebar + toolbar) loads as a single async unit.

## Workflow 6: Saving Calculator Changes

### Step 1: User Clicks Save Button

```vue
<button @click="saveCalculator" :disabled="saving">
  {{ saving ? 'Saving...' : 'Save Calculator' }}
</button>
```

### Step 2: Prepare Data for API

```typescript
async function saveCalculator() {
  const builderStore = useBuilderStore();
  const settingsStore = useSettingsStore();
  const conditionsStore = useConditionsStore();

  const calculatorData = {
    id: appStore.getCalcId,
    title: calculatorStore.getTitle,
    fields: builderStore.getBuilderFields,
    settings: settingsStore.getAllSettings,
    conditions: {
      nodes: conditionsStore.getNodes,
      links: conditionsStore.getLinks,
      spaces: conditionsStore.getSpaces,
    },
    appearance: appearanceStore.getAppearanceSettings,
  };

  // Call API
  await api.saveCalculator(calculatorData);
}
```

### Step 3: Handle Response

```typescript
try {
  saving.value = true;
  const response = await api.saveCalculator(calculatorData);

  if (response.success) {
    // Show success message
    toast.success('Calculator saved successfully');
  } else {
    throw new Error(response.message);
  }
} catch (error) {
  console.error('Save failed:', error);
  toast.error('Failed to save calculator');
} finally {
  saving.value = false;
}
```

## Workflow 7: Working with Pages and Sections

### Add New Page

```typescript
function addPage() {
  const newPage: IPageBreaker = {
    _id: builderFields.value.length,
    alias: `page_${Date.now()}`,
    label: `Page ${builderFields.value.length + 1}`,
    type: 'page-break',
    letter: '',
    description: '',
    groupElements: [
      // Add default section
      {
        _id: 0,
        alias: `section_${Date.now()}`,
        label: 'Section 1',
        type: 'Group',
        letter: '',
        description: '',
        fields: [],
      },
    ],
  };

  builderFields.value.push(newPage);
}
```

### Add New Section to Page

```typescript
function addSection(pageIndex: number) {
  const page = builderFields.value[pageIndex];
  const sectionCount = page.groupElements.length;

  const newSection: ISection = {
    _id: sectionCount,
    alias: `section_${Date.now()}`,
    label: `Section ${sectionCount + 1}`,
    type: 'Group',
    letter: '',
    description: '',
    fields: [],
  };

  page.groupElements.push(newSection);
}
```

### Move Field Between Sections

```typescript
function moveField(
  field: IField,
  fromPageId: string,
  fromSectionId: string,
  toPageId: string,
  toSectionId: string
) {
  // Remove from source
  const sourcePage = builderFields.value.find(
    (p) => p._id.toString() === fromPageId
  );
  const sourceSection = sourcePage?.groupElements.find(
    (s) => s._id.toString() === fromSectionId
  );
  const fieldIndex = sourceSection?.fields.findIndex(
    (f) => f.alias === field.alias
  );

  if (fieldIndex !== undefined && fieldIndex > -1) {
    sourceSection?.fields.splice(fieldIndex, 1);
  }

  // Add to target
  const targetPage = builderFields.value.find(
    (p) => p._id.toString() === toPageId
  );
  const targetSection = targetPage?.groupElements.find(
    (s) => s._id.toString() === toSectionId
  );

  field.pageId = toPageId;
  field.sectionId = toSectionId;
  targetSection?.fields.push(field);
}
```

## Common Pitfalls

### 1. Losing Reactivity

```typescript
// ❌ Bad - Loses reactivity
const { rawFields } = builderStore;

// ✅ Good - Maintains reactivity
const { rawFields } = storeToRefs(builderStore);
```

### 2. Incorrect Field Structure

```typescript
// ❌ Bad - Missing required properties
const field = { label: 'Test', type: 'Range' };

// ✅ Good - All required properties
const field: IField = {
  id: Date.now(),
  _id: `field_${Date.now()}`,
  alias: `field_${Date.now()}`,
  label: 'Test',
  type: 'Range',
  // ... all other required properties
};
```

### 3. Direct State Mutation

```typescript
// ❌ Bad - Direct mutation
builderStore.builderFields[0].label = 'New Label';

// ✅ Good - Use actions or reactive refs
const { builderFields } = storeToRefs(builderStore);
builderFields.value[0].label = 'New Label';
```

## Testing Conditions

To test if a condition works correctly:

1. Create source and target fields in builder
2. Open conditions page
3. Connect fields with a link
4. Configure condition rules
5. Save and preview calculator
6. Test by changing source field value
7. Verify target field behavior matches configured action
