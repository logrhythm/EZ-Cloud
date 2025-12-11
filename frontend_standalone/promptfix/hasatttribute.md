# Feature Request: Add "Has Attribute / Exists" Operator for Filter Conditions

## Overview
Add a new operator **"Has Attribute"** or **"Exists"** to Step 4 (Filter Configuration) and Step 6 (SubTransform Conditions) to allow users to check if a specific JSON attribute exists, regardless of its value.

## Business Requirement
Customers need to filter or process logs based on whether a specific JSON attribute is present in the data, without checking its actual value. This is useful for:
- Validating log structure before processing
- Handling optional fields that may or may not be present
- Creating conditional logic based on attribute presence
- Filtering logs by schema completeness

## Functional Requirements

### 1. Operator Name
- **Display Name:** "Has Attribute" or "Exists"
- **Internal Value:** `hasAttribute` or `exists`
- **Expression Syntax:** `$.attributeName` (without comparison operator or value)

### 2. UI Behavior

#### When User Selects "Has Attribute" Operator:
1. **Hide or Disable Value Input Field**
   - The value textbox should be hidden or disabled since no comparison value is needed
   - Only the field selection dropdown should be active

2. **Field Selection**
   - User selects the JSON path they want to check (e.g., `$.active`, `$.tags`, `$.user.email`)
   - Standard field dropdown with autocomplete/suggestions

3. **Expression Generation**
   - Generate expression as: `$.attributeName` (just the path, no operator or value)
   - Example: `$.active` (checks if `active` attribute exists)

### 3. Expression Examples

#### Example JSON:
```json
{
  "id": 1,
  "name": "Sample",
  "active": true,
  "tags": ["alpha", "beta", "gamma"]
}
```

#### Valid Filter Expressions:
1. **Check if attribute exists:**
   - `$.active` → TRUE (attribute exists)
   
2. **Combined with other conditions (AND):**
   - `$.id == 1 && $.active` → TRUE if id is 1 AND active attribute exists
   
3. **Combined with other conditions (OR):**
   - `$.name == "Sample" || $.tags` → TRUE if name is "Sample" OR tags attribute exists
   
4. **Multiple existence checks:**
   - `$.id && $.name && $.active` → TRUE if all three attributes exist
   
5. **Nested attribute check:**
   - `$.user.email` → TRUE if nested email attribute exists within user object
   
6. **Complex expression:**
   - `($.id == 1 || $.id == 2) && $.active && $.tags` → TRUE if id is 1 or 2, AND both active and tags attributes exist

### 4. Implementation Locations

#### Step 4: Filter Configuration (`Step4_FilterConfig.vue`)
- Add "Has Attribute" to the operator dropdown
- When selected:
  - Keep field selector visible
  - Hide/disable value input
  - Generate expression without comparison operator
  
#### Step 6: SubTransform Conditions (`Step6_SubTransform.vue`)
- Same behavior as Step 4
- Allow conditions like: "Only apply this subtransform if $.optionalField exists"

### 5. Validation Rules

1. **Valid Expressions:**
   - `$.attributeName` ✅
   - `$.nested.attribute.path` ✅
   - `$.array[*]` ✅
   - Combined with logical operators: `$.a && $.b` ✅

2. **Invalid Expressions:**
   - Empty path ❌
   - Path without $ prefix ❌
   - Malformed JSON path ❌

### 6. Backend Processing
The generated expression should be evaluated by the backend to check if the specified attribute exists in the JSON object, returning:
- **TRUE** if the attribute exists (regardless of its value, even if null/false/empty)
- **FALSE** if the attribute does not exist in the JSON structure

## User Experience Flow

### Step 4 - Filter Configuration:
1. User clicks "Add Condition"
2. User selects field from dropdown (e.g., `$.active`)
3. User selects operator: **"Has Attribute"**
4. Value field is automatically hidden/disabled
5. Expression is displayed: `$.active`
6. User can combine with other conditions using AND/OR operators
7. Final expression example: `$.id == 1 && $.active`

### Step 6 - SubTransform Conditions:
1. User adds a condition to a subtransform
2. User selects field (e.g., `$.optionalData`)
3. User selects operator: **"Has Attribute"**
4. Value field is hidden
5. Subtransform only executes if `$.optionalData` exists in the log

## Benefits
1. **Flexible Filtering:** Handle logs with varying schemas
2. **Error Prevention:** Avoid processing logs missing required fields
3. **Conditional Logic:** Enable sophisticated data processing workflows
4. **Schema Validation:** Ensure log completeness before processing
5. **Better UX:** Clear, intuitive way to check for attribute presence

## Technical Notes
- The operator should be added to the existing operator list alongside `==`, `!=`, `contains`, etc.
- **This operator is applicable for all data types** - it works regardless of whether the attribute contains a string, number, boolean, null, object, or array
- No changes needed to the expression evaluator backend - it should already support attribute existence checks
- The UI should clearly indicate when a condition is checking for existence vs. comparing a value
- Consider adding a tooltip: "Checks if the attribute exists in the JSON, regardless of its value or data type"

## Testing Scenarios
1. **Simple Existence Check:** `$.active` on JSON with `active` field → TRUE
2. **Missing Attribute:** `$.missing` on JSON without `missing` field → FALSE
3. **Null Value:** `$.field` where `field: null` → TRUE (exists but null)
4. **Empty String:** `$.name` where `name: ""` → TRUE (exists but empty)
5. **Nested Path:** `$.user.email` on nested object → TRUE/FALSE based on presence
6. **Array Check:** `$.tags` on JSON with array → TRUE
7. **Combined Conditions:** `$.id == 1 && $.active` → TRUE only if both conditions met
8. **Complex Expression:** `($.a || $.b) && $.c` → TRUE if (a exists OR b exists) AND c exists

