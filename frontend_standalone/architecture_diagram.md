# JSON Policy Builder - Application Architecture Diagram

```
+-------------------------------------------------------------------------------------------------+
|                                JSON Policy Builder (Frontend Standalone)                         |
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
|  +-------------------+        +------------------+        +-------------------+                  |
|  |     Main Layout   |------->|  Mapping Edit    |<------>| Settings Dialog   |                  |
|  | (MainLayout.vue)  |        | (MappingEdit.vue)|        | (Settings.vue)    |                  |
|  +-------------------+        +------------------+        +-------------------+                  |
|           |                          |    |                       |                              |
|           v                          v    |                       |                              |
|  +-------------------+        +---------------------+     +-------------------+                  |
|  |    Vue Router     |        | JSON Log Processing |     |    i18n System    |                  |
|  |  (router/index.js)|        | - Queue Management  |     | (Multi-language)  |                  |
|  +-------------------+        | - Path Extraction   |     +-------------------+                  |
|           |                   | - Field Mapping     |              |                             |
|           |                   +---------------------+              |                             |
|           v                          |    ^                        v                             |
|  +-------------------+               |    |                +-------------------+                 |
|  |   Vuex Store     |<--------------+    |                | Global Constants  |                 |
|  | (store/mainStore)|                     |                | (boot/*)         |                 |
|  +-------------------+                     |                +-------------------+                 |
|           ^                                |                        |                             |
|           |                                |                        v                             |
|  +-------------------+                     |                +-------------------+                 |
|  |     Mixins       |---------------------+                | Custom Components |                 |
|  | - BuildSmaPolicy |                                      | - ConfirmDialog   |                 |
|  | - DarkMode       |                                      | - Toggle          |                 |
|  | - RightToLeft    |                                      +-------------------+                 |
|  +-------------------+                                                                           |
|                                                                                                  |
+-------------------------------------------------------------------------------------------------+
                          |                                     ^
                          v                                     |
          +------------------------------+       +---------------------------------+
          | JSON File Import/Export      |       |    SMA Policy Generation       |
          | - Manual Entry               |       | - Transform Rules               |
          | - File Upload                |       | - Field Mappings                |
          | - JSON Parsing               |       | - Sub Rule Creation             |
          +------------------------------+       +---------------------------------+
```

## Application Overview

The JSON Policy Builder is a Vue.js-based standalone frontend application that allows users to create and configure JSON policies for LogRhythm's SMA (System Monitor Agent). The application analyzes JSON log samples, extracts fields, and lets users map these fields to schema fields for policy generation.

## Core Components

### User Interface Components
- **MainLayout.vue**: Primary layout wrapper for the application
- **MappingEdit.vue**: Main interface for mapping JSON fields and generating policies
- **Settings.vue**: Configuration dialog for application settings

### Data Processing
- **JSON Log Processing**: 
  - Queue management system for handling log processing
  - Field path extraction algorithm
  - Field mapping system for SMA schema

### State Management
- **Vuex Store**: Centralized state management for:
  - Application settings
  - User preferences
  - Field mappings

### Utility Components
- **Mixins**:
  - BuildSmaPolicy: Logic for generating SMA policy JSONs
  - DarkMode: Dark/Light theme management
  - RightToLeft: Support for RTL languages
  
- **i18n System**: Multi-language support with translations for:
  - English (US/UK)
  - French, German, Spanish, Italian
  - Japanese, Korean, Chinese, Arabic, Hebrew

## Data Flow

1. **Input**:
   - Manual JSON entry
   - File upload (single JSON, JSON array, or line-separated JSONs)
   - LogRhythm header detection and stripping

2. **Processing**:
   - Background queue processing of JSON logs
   - Field path extraction and frequency analysis
   - Field type detection and mapping

3. **Output**:
   - SMA policy JSON generation
   - Policy export functionality
   - Field mapping visualization

## Key Features

- Dark mode support
- Multi-language internationalization
- JSON path extraction and visualization
- Field mapping to LogRhythm schema
- SMA policy generation
- File import/export capabilities