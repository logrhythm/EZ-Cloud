# JSON Path Extraction Fix for Multiline Data (NDJSON/JSONL)

## Problem Statement
When users upload multiline JSON data (NDJSON/JSONL format) in Step 2, Step 5 is incorrectly treating the entire dataset as an array, resulting in wrong JSON path syntax.

## Current Behavior (INCORRECT)

### Input Format: Multiline JSON (NDJSON/JSONL)
Each line is a separate, complete JSON object:
```json
{"id":101,"name":"SampleRecord","description":"This is a simple JSON with 20 attributes.","active":true,"count":42,"price":199.99,"rating":4.7,"createdAt":"2025-02-15T10:30:00Z","updatedAt":"2025-02-16T12:45:00Z","category":"General","status":"Available","priority":3,"tags":["alpha","beta","gamma"],"owner":"Manish","isVerified":false,"location":"USA","nestedObject":{"code":"N123","valid":true,"level":5},"numbersList":[10,20,30,40,50],"remarks":"All fields populated successfully."}
{"id":102,"name":"SampleRecord2","description":"This is a simple JSON with 20 attributes.","active":false,"count":55,"price":149.49,"rating":4.5,"createdAt":"2025-03-01T08:20:00Z","updatedAt":"2025-03-02T09:10:00Z","category":"General","status":"OutOfStock","priority":2,"tags":["delta","epsilon","zeta"],"owner":"Manish","isVerified":true,"location":"Canada","nestedObject":{"code":"N456","valid":false,"level":3},"numbersList":[5,15,25,35],"remarks":"Record updated with variations."}
{"id":103,"name":"SampleRecord3","description":"This is a simple JSON with 20 attributes.","active":true,"count":88,"price":249.00,"rating":4.9,"createdAt":"2025-04-10T12:00:00Z","updatedAt":"2025-04-10T12:30:00Z","category":"Premium","status":"Available","priority":1,"tags":["theta","lambda","omega"],"owner":"Manish","isVerified":true,"location":"UK","nestedObject":{"code":"N789","valid":true,"level":9},"numbersList":[100,200,300],"remarks":"High priority premium record."}
{"id":104,"name":"SampleRecord4","description":"This is a simple JSON with 20 attributes.","active":false,"count":23,"price":89.99,"rating":3.8,"createdAt":"2025-05-22T14:55:00Z","updatedAt":"2025-05-22T15:10:00Z","category":"Basic","status":"Archived","priority":4,"tags":["red","green","blue"],"owner":"Manish","isVerified":false,"location":"India","nestedObject":{"code":"N321","valid":true,"level":1},"numbersList":[2,4,6,8,10],"remarks":"Archived due to low usage."}
{"id":105,"name":"SampleRecord5","description":"This is a simple JSON with 20 attributes.","active":true,"count":67,"price":179.75,"rating":4.2,"createdAt":"2025-06-05T09:40:00Z","updatedAt":"2025-06-05T10:00:00Z","category":"Standard","status":"Available","priority":2,"tags":["one","two","three"],"owner":"Manish","isVerified":true,"location":"Germany","nestedObject":{"code":"N654","valid":false,"level":7},"numbersList":[12,24,36,48],"remarks":"Standard record with mid-level priority."}
```

### Current (Wrong) Field Dropdown Values:
The system is treating this as an array of objects and generating paths like:
- `$.[*].id` ❌
- `$.[*].description` ❌
- `$.[*].tags[*]` ❌
- `$.[*].nestedObject.code` ❌
- `$.[*].active` ❌
- `$.[*].location` ❌

**Issue**: The system wraps everything with `$.[*].` because it incorrectly assumes the multiline data is an array at the root level.

## Expected Behavior (CORRECT)

### Correct JSON Path Generation:
For multiline NDJSON/JSONL data, each line is an **individual** JSON object, NOT an array element. Therefore, paths should be:
- `$.id` ✅
- `$.description` ✅
- `$.tags[*]` ✅ (tags itself is an array within each object)
- `$.nestedObject.code` ✅
- `$.active` ✅
- `$.location` ✅
- `$.numbersList[*]` ✅

**Rationale**: Each line is processed independently. When the system processes one record at a time, it should reference fields from the root of that single object, not from an array index.

## Root Cause Analysis

### Single-line JSON (Working Correctly) ✅
When user provides a single JSON object or manually inputs JSON:
```json
{"id":101,"name":"SampleRecord","description":"Test"}
```
The system correctly generates: `$.id`, `$.name`, `$.description`

### Multiline JSON (Currently Broken) ❌
When user uploads multiline JSON (NDJSON), the system:
1. Parses the data as an array of objects: `[{...}, {...}, ...]`
2. Treats the root as an array with `$.[*]` prefix
3. This is incorrect for NDJSON format where each line is independent

