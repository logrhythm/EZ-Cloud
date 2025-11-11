# Multiline Log Fanout & JSON Conversion Specification

## Overview
Enable Step 3 of the wizard to support BOTH single-sample JSON and multi-line (multiple JSON objects, one per line) samples. Step 2 already determines whether the uploaded sample represents one log or many; expose that as a boolean flag `isMultiLineLog` passed into Step 3.

## Inputs
- `sampleData.parsedData`:
  - Single log mode: an Object (or root Array already supported by existing logic).
  - Multi-line mode: an Array of Objects (each element is one log line parsed from a multi-line file).
- `isMultiLineLog` (Boolean): supplied from Step 2 detection logic.

## Behaviour Matrix
| Mode | isMultiLineLog | Source Records | Processing Strategy |
|------|----------------|----------------|---------------------|
| Single | false | 1 object (or root array) | Use existing (current) logic unchanged. |
| Multi  | true  | N objects (N > 1)        | Aggregate / union structures across all objects before deriving candidates. |

## Step 2 Responsibilities
1. Detect multi-line vs single-line (logic already exists – reuse it).
2. Store result in wizard state (e.g. `wizard.sampleData.isMultiLineLog`).
3. Pass `isMultiLineLog` as a prop or via store to Step 3.

## Step 3 Adjustments
Only modify behaviour when `isMultiLineLog === true`.

### 1. Fanout (Array) Candidates
Current (single) approach walks a single structure.

Multi-line approach:
- Walk EACH record.
- Collect every array path (normalized) and associated metadata.
- Normalization Rules:
  - Replace numeric indices with `[0]` for canonical representation (e.g. `$[2].data.users[5].orders` -> `$[0].data.users[0].orders`).
  - Maintain original root `$` prefix if existing logic expects it.
- Merge metadata:
  - `isHomogeneous`: true only if all encountered arrays at that path were homogeneous.
  - `elementType`: first non-null consensus type of elements if homogeneous, else `mixed`.
  - `sampleSize`: number of DISTINCT array instances inspected (cap at e.g. 25 for performance).
  - `parentPath`: keep shortest/normalized parent path.

### 2. Convert-to-JSON (Stringified JSON) Candidates
Current approach inspects values for strings that look like JSON and parse successfully.

Multi-line approach:
- Scan all records.
- If a path qualifies in ANY record, include it.
- Keep a counter of successes vs failures to parse (for potential UI hint) but still include if at least one valid parse and majority not failures (>50%).

### 3. Aggregated Structure for `JsonTreeViewer`
Single mode: unchanged.
Multi-line mode: build a synthetic representative object:
```
representative = deepUnion(record[0], record[1], ...)
```
Union Logic:
- When both sides are objects: union keys; recurse.
- When both sides are arrays of objects: take first element of each; union recursively; resulting representative array becomes `[unionedFirstElement]`.
- When arrays of primitives: keep shortest non-empty example (or first encountered).
- Prefer earlier record's value on primitive conflicts.

### 4. Performance Safeguards
- Limit processed records to first `MAX_RECORDS = 50` (configurable) for aggregation.
- Limit per-array element inspection to first `MAX_ARRAY_SAMPLE = 5` elements.

### 5. Error Handling
- Skip lines that fail JSON.parse; log a warning once with a count of skipped lines.
- If all lines fail: fallback to existing single-object flow with first successfully parsed object (if any) or show an error message.

### 6. UI Indicators
When in multi-line mode:
- Show a subtle badge “Aggregated (Multi-line Sample)” near the JSON structure header.
- (Optional) Tooltip: “Array & JSON candidates derived from multiple log lines.”

### 7. Acceptance Criteria
- Single log behaviour remains identical (no regression).
- Multi-line sample produces union of array paths (no duplicates, canonicalized indices).
- Convert-to-JSON candidate list is the union across lines.
- Large multi-line (e.g. 100 lines) processes quickly (< 2s in browser) given safeguards.
- Selecting a fanout array reflects normalized path consistent with existing downstream usage.

### 8. Pseudocode Snippets
```js
function normalizeArrayPath(path) {
  return path.replace(/\[(\d+)\]/g, '[0]')
}

function collectFromRecord(obj, basePath = '$', accum) {
  // existing traversal; push into accum.arrays / accum.jsonStrings
}

function aggregate(records) {
  const arrays = new Map() // key = normalizedPath
  const jsonCandidates = new Set()
  const limit = Math.min(records.length, MAX_RECORDS)
  for (let i=0; i<limit; i++) {
    collectFromRecord(records[i], '$', { arrays, jsonCandidates })
  }
  return { arrays: Array.from(arrays.values()), jsonCandidates: Array.from(jsonCandidates) }
}
```

### 9. Implementation Steps
1. Add `isMultiLineLog` to store if not already.
2. Pass into Step3 (prop or computed from store).
3. In `analyzeSampleData()` branch:
   - if `!isMultiLineLog`: existing code.
   - else: run multi-line aggregation pipeline then set `convertToJsonCandidates` & `fanoutCandidates` from aggregated outputs.
4. Build representative structure for `fanoutArrayTreeData` only when multi-line; fallback when single.
5. Add UI badge.
6. Add unit tests (if test infra exists) for:
   - Single vs multi detection unaffected.
   - Path normalization.
   - Union of arrays across differing records.

### 10. Future Enhancements (Optional)
- Track frequency (#records containing each array) and display as a badge.
- Allow toggling “Show only arrays present in ALL records”.
- Provide diff view of structural variance.

## Out of Scope
- Persisting aggregated structure server-side.
- Deep statistical analysis of distributions.

## Summary
Introduce a controlled, non-breaking enhancement: multi-line mode aggregates structures & candidates while preserving original single-line logic. The `isMultiLineLog` flag is the switch; when true, use union-based discovery and representative structure generation.