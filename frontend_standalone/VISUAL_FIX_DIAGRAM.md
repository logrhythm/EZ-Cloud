# 📊 Visual Explanation: Nested Arrays Fix

## Problem: Depth Limit Blocking Visibility

```
┌─────────────────────────────────────────────────────────────────┐
│ BEFORE FIX: Old autoExpandNodes() with maxDepth=2              │
└─────────────────────────────────────────────────────────────────┘

Depth 0:  [✓] root
           │
Depth 1:  └── [✓] projects ◄────────────────── [✓ CHECKBOX VISIBLE]
                 │
Depth 2:        └── [✓] [0] (object)
                       │
Depth 3:              └── [✗] teams ◄────────── [✓ CHECKBOX VISIBLE]
                             │                   BUT needs manual expand!
Depth 4:                    └── [✗] [0] (object) ◄── HIDDEN (not expanded)
                                   │
Depth 5:                          └── [✗] members ◄── CHECKBOX NOT VISIBLE
                                         │
Depth 6:                                └── [✗] [0] (object) ◄── HIDDEN
                                               │
Depth 7:                                      └── [✗] skills ◄── CHECKBOX NOT VISIBLE

┌─────────────────────────────────────────────────────────────────┐
│ RESULT: Only 2 checkboxes visible (projects, teams)            │
│ User must manually expand teams → [0] → members to see nested  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Solution: Smart Auto-Expansion Based on Array Paths

```
┌─────────────────────────────────────────────────────────────────┐
│ AFTER FIX: autoExpandArrayContainers()                          │
│ Expands ALL parent paths that lead to arrays (no depth limit)  │
└─────────────────────────────────────────────────────────────────┘

Array Paths Detected:
  1. projects
  2. projects[0].teams
  3. projects[0].teams[0].members
  4. projects[0].teams[0].members[0].skills

Auto-Expansion Logic:
┌────────────────────────────────────────────────────────────┐
│ For each array path, extract parent container paths:      │
│                                                            │
│ Array: "projects[0].teams[0].members"                     │
│   → Expand: projects                                      │
│   → Expand: projects[0]                                   │
│   → Expand: projects[0].teams                            │
│   → Expand: projects[0].teams[0]                         │
│   → DON'T expand: projects[0].teams[0].members (the array itself) │
└────────────────────────────────────────────────────────────┘

Visual Result:

Depth 0:  [✓] root (auto-expanded)
           │
Depth 1:  └── [✓] projects ◄────────────────── [✓ CHECKBOX VISIBLE]
                 │                               (auto-expanded)
Depth 2:        └── [✓] [0] (object) ◄────────────── (auto-expanded)
                       │
Depth 3:              └── [✓] teams ◄────────── [✓ CHECKBOX VISIBLE]
                             │                   (auto-expanded)
Depth 4:                    └── [✓] [0] (object) ◄── (auto-expanded)
                                   │
Depth 5:                          └── [✓] members ◄── [✓ CHECKBOX VISIBLE]
                                         │               (auto-expanded)
Depth 6:                                └── [✓] [0] (object) ◄── (auto-expanded)
                                               │
Depth 7:                                      └── [✓] skills ◄── [✓ CHECKBOX VISIBLE]
                                                     │           (collapsed, but visible)
                                                     └── [✗] [0] (items hidden until user expands)

┌─────────────────────────────────────────────────────────────────┐
│ RESULT: All 4 checkboxes visible immediately!                  │
│ No manual expansion needed to see nested arrays                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Code Flow Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                    USER LOADS WIZARD DATA                         │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  watch(() => props.data, ...)                                     │
│  Data change detected                                             │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  expandedNodes.clear()                                            │
│  Clear previous expansions                                        │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  autoExpandNodes(newData)                                         │
│  Basic expansion to depth 2                                       │
│  Expands: root, projects, projects[0]                             │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  setTimeout(() => autoExpandArrayContainers(), 100)               │
│  Wait for arrayPaths computed property                            │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │  Wait 100ms for reactivity    │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  autoExpandArrayContainers()                                      │
│                                                                   │
│  if (selectionMode !== 'array') return                           │
│                                                                   │
│  FOR EACH arrayPath in arrayPaths:                               │
│    Parse path into segments                                      │
│    Add parent segments to pathsToExpand Set                      │
│                                                                   │
│  FOR EACH path in pathsToExpand:                                 │
│    expandedNodes.add(path)                                       │
│                                                                   │
│  Vue reactivity triggers re-render                               │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  JsonTreeNode components re-render                                │
│  isExpanded computed checks expandedNodes Set                     │
│  Nodes with matching paths show as expanded                       │
│  Nested arrays now visible                                        │
└───────────────────────────────────┬───────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│  ✅ USER SEES ALL 4 ARRAY CHECKBOXES                              │
│  ✅ projects checkbox                                             │
│  ✅ teams checkbox                                                │
│  ✅ members checkbox                                              │
│  ✅ skills checkbox                                               │
└───────────────────────────────────────────────────────────────────┘
```

---

## Path Parsing Example

```
Input arrayPath: "projects[0].teams[0].members"

Step-by-step parsing:
┌──────────────┬────────────────┬─────────────────────────────────┐
│ Token        │ currentPath    │ Action                          │
├──────────────┼────────────────┼─────────────────────────────────┤
│ "projects"   │ ""             │ currentPath = "projects"        │
│              │                │ parts.push("projects")          │
├──────────────┼────────────────┼─────────────────────────────────┤
│ "[0]"        │ "projects"     │ currentPath = "projects[0]"     │
│              │                │ parts.push("projects[0]")       │
├──────────────┼────────────────┼─────────────────────────────────┤
│ "teams"      │ "projects[0]"  │ currentPath = "projects[0].teams" │
│              │                │ parts.push("projects[0].teams") │
├──────────────┼────────────────┼─────────────────────────────────┤
│ "[0]"        │ "projects[0].teams" │ currentPath = "projects[0].teams[0]" │
│              │                │ parts.push("projects[0].teams[0]") │
├──────────────┼────────────────┼─────────────────────────────────┤
│ "members"    │ "projects[0].teams[0]" │ currentPath = "projects[0].teams[0].members" │
│              │                │ parts.push("projects[0].teams[0].members") │
└──────────────┴────────────────┴─────────────────────────────────┘

Result parts array:
[
  "projects",                       ← Expand
  "projects[0]",                    ← Expand
  "projects[0].teams",              ← Expand
  "projects[0].teams[0]",           ← Expand
  "projects[0].teams[0].members"    ← DON'T expand (it's the array itself)
]

Paths added to expandedNodes Set:
✓ "projects"
✓ "projects[0]"
✓ "projects[0].teams"
✓ "projects[0].teams[0]"
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  JsonTreeViewer.vue                         │
│  (Parent Component)                                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ expandedNodes (reactive Set)                        │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ "root"                                          │ │   │
│  │ │ "projects"                                      │ │   │
│  │ │ "projects[0]"                                   │ │   │
│  │ │ "projects[0].teams"                            │ │   │
│  │ │ "projects[0].teams[0]"                         │ │   │
│  │ │ "projects[0].teams[0].members"                 │ │   │
│  │ │ "projects[0].teams[0].members[0]"              │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  provide('expandedNodes', expandedNodes) ───────────────┐  │
│                                                          │  │
└──────────────────────────────────────────────────────────┼──┘
                                                           │
                                                           │ inject
                                                           │
┌──────────────────────────────────────────────────────────▼──┐
│                  JsonTreeNode.vue                           │
│  (Child Component - Recursive)                              │
│                                                             │
│  const expandedNodes = inject('expandedNodes')              │
│                                                             │
│  const isExpanded = computed(() =>                          │
│    expandedNodes.value.has(props.path)                      │
│  )                                                          │
│                                                             │
│  <div v-if="isExpanded && isExpandable">                    │
│    <!-- Show children -->                                   │
│    <JsonTreeNode v-for="child in children" .../>           │
│  </div>                                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

How it works:
1. Parent adds paths to expandedNodes Set
2. Child components inject and read expandedNodes
3. Child checks: is MY path in expandedNodes?
4. If yes → render children (expand)
5. If no → hide children (collapse)
```

---

## Before vs After: Visual Comparison

```
═══════════════════════════════════════════════════════════════
                    BEFORE FIX
═══════════════════════════════════════════════════════════════

Tree View:                           Checkboxes Visible:
┌──────────────────────┐            ┌────────────────────┐
│ ▼ Object             │            │ ☑ projects         │
│   ▼ projects [✓]     │            │ ☑ teams            │
│     ▼ [0]            │            └────────────────────┘
│       ▶ teams [✓]    │ ← Click!
│                      │
│ (Hidden below)       │
│   ▶ [0]              │
│     ▶ members [ ]    │ ← NOT VISIBLE
│       ▶ [0]          │
│         ▶ skills [ ] │ ← NOT VISIBLE
└──────────────────────┘

User must:
1. Click ▶ to expand teams
2. Click ▶ to expand [0]
3. See members checkbox
4. Click ▶ to expand members
5. Click ▶ to expand [0]
6. Finally see skills checkbox

═══════════════════════════════════════════════════════════════
                     AFTER FIX
═══════════════════════════════════════════════════════════════

Tree View:                           Checkboxes Visible:
┌──────────────────────┐            ┌────────────────────┐
│ ▼ Object             │            │ ☑ projects         │
│   ▼ projects [✓]     │            │ ☑ teams            │
│     ▼ [0]            │            │ ☑ members          │
│       ▼ teams [✓]    │            │ ☑ skills           │
│         ▼ [0]        │            └────────────────────┘
│           ▼ members [✓] │
│             ▼ [0]    │
│               ▼ skills [✓] │
└──────────────────────┘

User sees:
✅ All 4 checkboxes immediately
✅ No manual expansion needed
✅ Can select any array right away
```

---

## Summary: Key Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Expansion Method** | Fixed depth limit (maxDepth=2) | Smart path-based expansion (no limit) |
| **Visible Arrays** | 2 (projects, teams) | 4 (projects, teams, members, skills) |
| **Manual Steps** | Click expand 4+ times | 0 clicks needed |
| **Code Location** | autoExpandNodes() only | + autoExpandArrayContainers() |
| **Trigger** | On data load | On data load + after arrayPaths computed |
| **Performance** | Fast but incomplete | Slightly slower but complete |

---

**Visual Guide Complete**
*All nested arrays now visible without manual expansion*
