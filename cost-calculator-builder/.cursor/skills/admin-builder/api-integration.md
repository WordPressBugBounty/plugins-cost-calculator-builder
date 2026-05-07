# Admin Builder - REST API Integration

Complete documentation for the frontend-backend API integration in the admin builder module.

## API Architecture Overview

The admin module uses **WordPress AJAX API** (not REST API) for all frontend-backend communication.

```
Frontend (Vue3/TypeScript)
    ↓ Axios HTTP Request
WordPress AJAX Handler (/wp-admin/admin-ajax.php)
    ↓ Action Router (CCBAjaxAction.php)
Handler Class Method (CCBCalculatorsHandler.php)
    ↓ Nonce Verification
    ↓ Permission Check (current_user_can)
    ↓ Business Logic
Database (wp_posts, wp_postmeta, wp_options)
    ↓ Response
Frontend (Success/Error handling)
```

## Frontend API Classes

### Location
```
frontend/vue3/src/admin/shared/api/
├── AdminAPI.ts    # Builder, Conditions, Settings
└── FlowAPI.ts     # Calculator List, Templates
```

### AdminAPI Class

Handles builder page operations:

```typescript
class AdminAPI {
  // Get calculator data (builder, settings, conditions)
  static async getCalculatorAdminData(params): Promise<Response>
  
  // Save all calculator data
  static async saveCalculatorAdminData(params): Promise<Response>
}
```

### FlowAPI Class

Handles calculator list and template operations:

```typescript
class FlowAPI {
  // Fetch paginated calculator list
  static async fetchCalculators(params): Promise<Response>
  
  // Fetch available templates
  static async fetchTemplates(params): Promise<Response>
  
  // Create blank calculator
  static async createCalculator(params): Promise<Response>
  
  // Edit existing calculator
  static async editCalculator(params): Promise<Response>
  
  // Create calculator from template
  static async useTemplate(params): Promise<Response>
  
  // Delete calculator(s)
  static async deleteCalculators(params): Promise<Response>
  
  // Duplicate calculator(s)
  static async duplicateCalculators(params): Promise<Response>
  
  // Toggle template favorite
  static async addFavoriteTemplate(params): Promise<Response>
}
```

## Request Flow

### 1. Frontend Request

```typescript
// Example: Fetch calculator data
import { AdminAPI } from '@/admin/shared/api/AdminAPI';

const response = await AdminAPI.getCalculatorAdminData({
  action: 'ccb_get_calculator_admin_data',
  nonce: window.ccb_nonces.get_calculator,
  calc_id: 123
});
```

### 2. HTTP Request Structure

```http
GET /wp-admin/admin-ajax.php?action=ccb_get_calculator_admin_data&nonce=abc123&calc_id=123
```

**or**

```http
POST /wp-admin/admin-ajax.php?action=calc_save_settings&nonce=abc123
Content-Type: application/json

{
  "id": 123,
  "title": "My Calculator",
  "settings": {...},
  "conditions": {...},
  "builder": {...}
}
```

### 3. Backend Processing

#### Step 1: WordPress AJAX Router
```php
// WordPress core routes to:
do_action('wp_ajax_' . $_REQUEST['action']);
// Result: wp_ajax_ccb_get_calculator_admin_data
```

#### Step 2: Action Registration
```php
// In CCBAjaxAction::init()
self::addAction(
    'ccb_get_calculator_admin_data', 
    [CCBCalculatorsHandler::class, 'get_calculator_admin_data']
);
```

#### Step 3: Handler Method
```php
// In CCBCalculatorsHandler.php
public static function get_calculator_admin_data() {
    // 1. Verify nonce
    check_ajax_referer('ccb_get_calculator_admin_data', 'nonce');
    
    // 2. Check permissions
    if (!current_user_can('manage_options')) {
        wp_send_json([
            'success' => false,
            'message' => 'Not allowed',
            'data' => []
        ]);
    }
    
    // 3. Get data from database
    $calc_id = $_GET['calc_id'];
    $data = self::fetch_calculator($calc_id);
    
    // 4. Send response
    wp_send_json([
        'success' => true,
        'message' => 'Success',
        'data' => $data
    ]);
}
```

## Security Layer

### 1. Nonces (CSRF Protection)

**What**: WordPress nonces prevent Cross-Site Request Forgery attacks

**Frontend Setup**:
```typescript
// Nonces injected via PHP
declare global {
  interface Window {
    ccb_nonces: {
      fetch_calculators: string;
      fetch_templates: string;
      get_calculator: string;
      save_calculator: string;
      // ... more nonces
    }
  }
}

// Usage in request
const nonce = window.ccb_nonces.fetch_calculators;
```

**Backend Verification**:
```php
// Verifies nonce or dies with 403
check_ajax_referer('ccb_fetch_calculators', 'nonce');
```

**Nonce Generation** (PHP side):
```php
// In enqueue script
wp_localize_script('admin-app', 'ccb_nonces', [
    'fetch_calculators' => wp_create_nonce('ccb_fetch_calculators'),
    'fetch_templates' => wp_create_nonce('ccb_fetch_templates'),
    'get_calculator' => wp_create_nonce('ccb_get_calculator_admin_data'),
    // ... more nonces
]);
```

### 2. Capability Checks

**What**: WordPress capability system controls user permissions

**Common Checks**:
```php
// Check if user can manage options (admin only)
if (!current_user_can('manage_options')) {
    wp_send_json([
        'success' => false,
        'message' => __('Not allowed', 'cost-calculator-builder')
    ]);
}
```

**Capabilities Used**:
- `manage_options` - Administrator only (all admin actions)
- No public (`nopriv`) endpoints for admin module

## Data Storage

### 1. Calculator Storage (wp_posts)

Calculators stored as custom post type:

```php
// Create calculator
wp_insert_post([
    'post_type' => 'cost-calc',
    'post_status' => 'draft' // or 'publish'
]);
```

**Fields**:
- `ID` - Calculator ID
- `post_title` - Calculator title (not used, title in meta)
- `post_status` - draft/publish
- `post_type` - 'cost-calc'

### 2. Calculator Data (wp_postmeta)

All calculator configuration stored in postmeta:

```php
// Get calculator data
$builder = get_post_meta($calc_id, 'stm-fields', true);
$settings = get_post_meta($calc_id, 'stm-settings', true);
$conditions = get_post_meta($calc_id, 'stm-conditions', true);

// Save calculator data
update_post_meta($calc_id, 'stm-fields', $builder_data);
update_post_meta($calc_id, 'stm-settings', $settings_data);
update_post_meta($calc_id, 'stm-conditions', $conditions_data);
```

**Meta Keys**:
- `stm-fields` - Builder structure (pages, sections, fields)
- `stm-settings` - Settings & integrations
- `stm-conditions` - Conditional logic (VueFlow nodes/links)
- `stm-name` - Calculator title
- `stm-status` - Calculator status
- `stm-icon` - Calculator icon
- `stm-image` - Calculator preview image

**Data Format**: JSON strings serialized in database

### 3. Global Settings (wp_options)

Plugin-wide settings stored in options table:

```php
// Get option
$favorites = get_option('ccb_template_favorites', []);

// Update option
update_option('ccb_template_favorites', $favorites);
```

**Options Used**:
- `ccb_template_favorites` - User's favorite templates
- `ccb_general_settings` - Global plugin settings
- Plugin config and cache data

## API Endpoints Documentation

### Flow API Endpoints

#### 1. Fetch Calculators

**Action**: `ccb_fetch_calculators`

**Method**: GET

**Request**:
```typescript
{
  action: 'ccb_fetch_calculators',
  nonce: string,
  limit: number,        // Items per page
  page: number,         // Current page
  sort_by: string,      // 'date' | 'title'
  direction: string     // 'asc' | 'desc'
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    calculators: ICalculator[],
    total: number
  }
}
```

**Backend Handler**: `CCBCalculatorsHandler::ccb_fetch_calculators()`

**Database**: Queries `wp_posts` WHERE `post_type='cost-calc'`

#### 2. Fetch Templates

**Action**: `ccb_fetch_templates`

**Method**: GET

**Request**:
```typescript
{
  action: 'ccb_fetch_templates',
  nonce: string
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    templates: ITemplate[],
    categories: ICategory[],
    favorites: number[],
    admin_email: string,
    pro_active: boolean,
    unlock: boolean
  }
}
```

**Backend Handler**: `CCBCalculatorsHandler::ccb_fetch_templates()`

#### 3. Create Calculator

**Action**: `calc_create_id`

**Method**: POST

**Request**:
```typescript
{
  action: 'calc_create_id',
  nonce: string
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    id: number,
    url: string
  }
}
```

**Backend Handler**: `CCBCalculatorsHandler::create_calc_id()`

**Database**: 
- Creates post in `wp_posts` with `post_type='cost-calc'`
- Returns new post ID

#### 4. Use Template

**Action**: `calc_use_template`

**Method**: POST

**Request**:
```typescript
{
  action: 'calc_use_template',
  nonce: string,
  template_id: number
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    id: number  // New calculator ID
  }
}
```

**Backend Handler**: `CCBCalculatorsHandler::use_template()`

**Database**:
- Duplicates template calculator
- Creates new `wp_posts` entry
- Copies all postmeta from template

#### 5. Delete Calculators

**Action**: `ccb_delete_calc`

**Method**: POST

**Request**:
```typescript
{
  action: 'ccb_delete_calc',
  nonce: string,
  ids: number[]  // Array of calculator IDs
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {}
}
```

**Backend Handler**: `CCBCalculatorsHandler::delete_calc()`

**Database**:
- Deletes posts from `wp_posts`
- WordPress auto-deletes associated postmeta

#### 6. Duplicate Calculators

**Action**: `ccb_duplicate_calc`

**Method**: POST

**Request**:
```typescript
{
  action: 'ccb_duplicate_calc',
  nonce: string,
  ids: number[]  // Array of calculator IDs
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    duplicated: number[]  // New calculator IDs
  }
}
```

**Backend Handler**: `CCBCalculatorsHandler::duplicate_calc()`

**Database**:
- Creates new posts in `wp_posts`
- Duplicates all postmeta

### Admin API Endpoints

#### 1. Get Calculator Admin Data

**Action**: `ccb_get_calculator_admin_data`

**Method**: GET

**Request**:
```typescript
{
  action: 'ccb_get_calculator_admin_data',
  nonce: string,
  calc_id: number
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {
    id: number,
    title: string,
    status: string,
    builder: {
      fields: IPageBreaker[],
      rawFields: ICalculatorRawFields[]
    },
    settings: ISettings,
    conditions: {
      nodes: IRawNode[],
      links: IRawLink[],
      spaces: ISpace[]
    }
  }
}
```

**Backend Handler**: `CCBCalculatorsHandler::get_calculator_admin_data()`

**Database**:
```php
$builder = get_post_meta($calc_id, 'stm-fields', true);
$settings = get_post_meta($calc_id, 'stm-settings', true);
$conditions = get_post_meta($calc_id, 'stm-conditions', true);
```

#### 2. Save Calculator Admin Data

**Action**: `calc_save_settings`

**Method**: POST

**Request**:
```typescript
{
  action: 'calc_save_settings',
  nonce: string,
  id: number,
  title: string,
  status: string,
  builder: {
    fields: IPageBreaker[]
  },
  settings: ISettings,
  conditions: {
    nodes: IRawNode[],
    links: IRawLink[],
    spaces: ISpace[]
  }
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string,
  data: {}
}
```

**Backend Handler**: `CCBCalculatorsHandler::save_settings()`

**Database**:
```php
update_post_meta($id, 'stm-fields', $builder);
update_post_meta($id, 'stm-settings', $settings);
update_post_meta($id, 'stm-conditions', $conditions);
update_post_meta($id, 'stm-name', $title);
update_post_meta($id, 'stm-status', $status);
```

## Response Format

All responses follow this structure:

```typescript
interface ApiResponse<T = any> {
  success: boolean;      // Operation success/failure
  message: string;       // User-friendly message (i18n)
  data: T;              // Response payload
}
```

### Success Response Example
```json
{
  "success": true,
  "message": "Calculator saved successfully",
  "data": {
    "id": 123
  }
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "You are not allowed to run this action",
  "data": {}
}
```

## Error Handling

### Frontend Error Handling

```typescript
try {
  const response = await AdminAPI.saveCalculatorAdminData(params);
  
  if (response.success) {
    // Handle success
    toast.success(response.message);
  } else {
    // Handle logical error
    toast.error(response.message);
  }
} catch (error) {
  // Handle network/axios error
  if (axios.isAxiosError(error)) {
    console.error('Network error:', error.message);
    toast.error('Network error occurred');
  }
}
```

### Backend Error Handling

```php
// Always send JSON response
public static function some_action() {
    check_ajax_referer('action_name', 'nonce');
    
    $result = [
        'success' => false,
        'message' => __('Default error', 'cost-calculator-builder'),
        'data' => []
    ];
    
    // Permission check
    if (!current_user_can('manage_options')) {
        wp_send_json($result);  // Dies after sending
    }
    
    // Validation
    if (empty($_POST['required_field'])) {
        $result['message'] = __('Required field missing', 'cost-calculator-builder');
        wp_send_json($result);
    }
    
    // Business logic
    try {
        $data = do_something();
        $result['success'] = true;
        $result['message'] = __('Success', 'cost-calculator-builder');
        $result['data'] = $data;
    } catch (Exception $e) {
        $result['message'] = $e->getMessage();
    }
    
    wp_send_json($result);
}
```

## Request/Response Examples

### Example 1: Load Calculator in Builder

**Frontend**:
```typescript
// On CalculatorBuilder page mount
const calcId = appStore.getCalcId;

const response = await AdminAPI.getCalculatorAdminData({
  action: 'ccb_get_calculator_admin_data',
  nonce: window.ccb_nonces.get_calculator,
  calc_id: calcId
});

if (response.success) {
  builderStore.setBuilderFields(response.data.builder.fields);
  settingsStore.setSettings(response.data.settings);
  conditionsStore.setConditions(response.data.conditions);
}
```

**Backend Flow**:
1. Nonce verified
2. Permission checked (`manage_options`)
3. Data fetched:
   ```php
   $calc_id = $_GET['calc_id'];
   $fields = json_decode(get_post_meta($calc_id, 'stm-fields', true), true);
   $settings = json_decode(get_post_meta($calc_id, 'stm-settings', true), true);
   $conditions = json_decode(get_post_meta($calc_id, 'stm-conditions', true), true);
   ```
4. Response sent

### Example 2: Save Calculator

**Frontend**:
```typescript
async function saveCalculator() {
  const response = await AdminAPI.saveCalculatorAdminData({
    action: 'calc_save_settings',
    nonce: window.ccb_nonces.save_calculator,
    id: calcId,
    title: calculatorTitle,
    status: 'publish',
    builder: {
      fields: builderStore.getBuilderFields
    },
    settings: settingsStore.getAllSettings,
    conditions: {
      nodes: conditionsStore.getNodes,
      links: conditionsStore.getLinks,
      spaces: conditionsStore.getSpaces
    }
  });
  
  if (response.success) {
    toast.success('Calculator saved!');
  }
}
```

**Backend Flow**:
1. Nonce verified
2. Permission checked
3. Request body parsed:
   ```php
   $request_body = file_get_contents('php://input');
   $data = json_decode($request_body, true);
   ```
4. Data sanitized:
   ```php
   $data = apply_filters('stm_ccb_sanitize_array', $data);
   ```
5. Data saved:
   ```php
   update_post_meta($data['id'], 'stm-fields', json_encode($data['builder']));
   update_post_meta($data['id'], 'stm-settings', json_encode($data['settings']));
   update_post_meta($data['id'], 'stm-conditions', json_encode($data['conditions']));
   ```

## Important Notes

- **No REST API**: Uses WordPress AJAX (`admin-ajax.php`), not WP REST API
- **Nonce Required**: Every request must include valid nonce
- **Admin Only**: All endpoints require `manage_options` capability
- **JSON Serialization**: Complex data stored as JSON strings in postmeta
- **Custom Post Type**: Calculators use `cost-calc` post type
- **Always JSON Response**: Backend always uses `wp_send_json()`
- **i18n**: All messages use WordPress translation functions `__()`
