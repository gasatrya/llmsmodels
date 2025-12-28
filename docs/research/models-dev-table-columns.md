# Research: models.dev Table Columns Structure

**Date:** 2025-12-29
**Version Verified:** Latest (dev branch)

## 1. Executive Summary

The models.dev website uses a static HTML table with **27 columns** to display AI model information. The table is server-side rendered using Hono JSX, with data generated from TOML provider/model definitions. All columns are sortable, and there's a search/filter feature, but **no column visibility control** is currently implemented.

## 2. Table Column Structure

### Complete Column List (in order of appearance)

| #   | Column Name       | Data Type          | Description                          |
| --- | ----------------- | ------------------ | ------------------------------------ |
| 1   | Provider          | Text               | Provider name with logo              |
| 2   | Model             | Text               | Model display name                   |
| 3   | Family            | Text               | Model family (e.g., GPT-4)           |
| 4   | Provider ID       | Text               | Provider identifier (e.g., "openai") |
| 5   | Model ID          | Text               | Unique model ID (with copy button)   |
| 6   | Tool Call         | Boolean            | Supports tool calling (Yes/No)       |
| 7   | Reasoning         | Boolean            | Supports reasoning/CoT (Yes/No)      |
| 8   | Input             | Modalities (Icons) | Supported input types                |
| 9   | Output            | Modalities (Icons) | Supported output types               |
| 10  | Input Cost        | Number/Cost        | Cost per 1M tokens (USD)             |
| 11  | Output Cost       | Number/Cost        | Cost per 1M tokens (USD)             |
| 12  | Reasoning Cost    | Number/Cost        | Cost per 1M tokens (USD)             |
| 13  | Cache Read Cost   | Number/Cost        | Cost per 1M tokens (USD)             |
| 14  | Cache Write Cost  | Number/Cost        | Cost per 1M tokens (USD)             |
| 15  | Audio Input Cost  | Number/Cost        | Cost per 1M tokens (USD)             |
| 16  | Audio Output Cost | Number/Cost        | Cost per 1M tokens (USD)             |
| 17  | Context Limit     | Number             | Maximum context window               |
| 18  | Input Limit       | Number             | Maximum input tokens                 |
| 19  | Output Limit      | Number             | Maximum output tokens                |
| 20  | Structured Output | Boolean            | Supports structured output (Yes/No)  |
| 21  | Temperature       | Boolean            | Supports temperature (Yes/No)        |
| 22  | Weights           | Text               | Open/Closed weights                  |
| 23  | Knowledge         | Text               | Knowledge cutoff date                |
| 24  | Release Date      | Text               | First public release date            |
| 25  | Last Updated      | Text               | Most recent update date              |

### Column Data Types

1. **Text (7 columns)**
   - Provider, Model, Family, Provider ID, Model ID, Weights, Knowledge, Release Date, Last Updated
   - Font: Rubik (standard) or IBM Plex Mono (for technical columns)
   - Case: Mixed, with uppercase for IDs

2. **Boolean (4 columns)**
   - Tool Call, Reasoning, Structured Output, Temperature
   - Values: "Yes" or "No"
   - Some may show "-" if undefined

3. **Number (9 columns)**
   - All cost columns (Input, Output, Reasoning, Cache Read/Write, Audio Input/Output)
   - Context/Input/Output limits
   - Formatting: `toLocaleString()` for limits, `$X.XX` for costs
   - Missing values show as "-"

4. **Modalities (2 columns)**
   - Input, Output
   - Icon-based display with tooltips
   - Multiple icons can be displayed per cell

## 3. Implementation Details

### Table Rendering Code

```tsx
<table>
  <thead>
    <tr>
      <th class="sortable" data-type="text">
        Provider <span class="sort-indicator"></span>
      </th>
      <th class="sortable" data-type="text">
        Model <span class="sort-indicator"></span>
      </th>
      {/* ... 27 total columns ... */}
    </tr>
  </thead>
  <tbody>
    {Object.entries(Providers).flatMap(([providerId, provider]) =>
      Object.entries(provider.models)
        .filter(([, model]) => model.status !== 'alpha')
        .map(([modelId, model]) => (
          <tr key={`${providerId}-${modelId}`}>{/* Row cells */}</tr>
        )),
    )}
  </tbody>
</table>
```

### Special Column Types

#### 1. Provider Column (with Logo)

```tsx
<td>
  <div class="provider-cell">
    {renderProviderLogo(providerId)}
    <span>{provider.name}</span>
  </div>
</td>
```

- **Type:** Text + SVG Icon
- **Features:** Provider logo (loaded at build time), name display
- **Logo Path:** `/providers/{providerId}/logo.svg` or default

#### 2. Model ID Column (with Copy Button)

```tsx
<td>
  <div class="model-id-cell">
    <span class="model-id-text">{modelId}</span>
    <button class="copy-button" onclick={`copyModelId(this, '${modelId}')`}>
      {/* Copy and check icons */}
    </button>
  </div>
</td>
```

- **Type:** Text + Action Button
- **Features:** Click to copy, visual feedback (checkmark), hover effect
- **Font:** IBM Plex Mono, uppercase

#### 3. Modality Columns (Icon-based)

```tsx
<td>
  <div class="modalities">
    {model.modalities.input.map((modality) => getModalityIcon(modality))}
  </div>
</td>
```

- **Type:** Array of Icons
- **Supported Types:** text, image, audio, video, pdf
- **Features:** SVG icons with tooltips on hover
- **Icon Size:** 16x16px
- **Tooltip:** Uppercase, small font, appears on hover

#### 4. Cost Columns

```tsx
const renderCost = (cost?: number) => {
  return cost === undefined ? '-' : `$${cost.toFixed(2)}`
}
```

- **Type:** Number with currency formatting
- **Format:** `$X.XX` (2 decimal places)
- **Missing values:** "-"
- **All 7 cost types:** input, output, reasoning, cache_read, cache_write, input_audio, output_audio

#### 5. Boolean Columns

```tsx
<td>{model.tool_call ? 'Yes' : 'No'}</td>
```

- **Type:** Boolean → Text
- **Values:** "Yes" or "No"
- **Columns:** Tool Call, Reasoning, Structured Output, Temperature
- **Optional:** Structured Output can be undefined, shows "-"

#### 6. Limit Columns

```tsx
<td>{model.limit.context.toLocaleString()}</td>
<td>{model.limit.input?.toLocaleString() ?? "-"}</td>
```

- **Type:** Number with locale formatting
- **Format:** Thousands separators (e.g., "128,000")
- **Font:** IBM Plex Mono
- **Missing values:** "-" for optional fields

#### 7. Weights Column

```tsx
<td>{model.open_weights ? 'Open' : 'Closed'}</td>
```

- **Type:** Boolean → Text
- **Values:** "Open" or "Closed"
- **Indicates:** Whether model weights are publicly available

#### 8. Knowledge Column

```tsx
<td>{model.knowledge ? model.knowledge.substring(0, 7) : '-'}</td>
```

- **Type:** String (date)
- **Format:** Truncated to 7 characters (YYYY-MM)
- **Missing values:** "-"

## 4. Column Formatting Patterns

### CSS Classes by Column Type

```css
/* Standard text cells */
tbody td {
  color: var(--color-text-tertiary);
}

/* Highlighted cells (more prominent) */
tbody td:nth-child(1),  /* Provider */
tbody td:nth-child(2),  /* Model */
tbody td:nth-child(5),  /* Model ID */
tbody td:nth-child(6),  /* Tool Call */
tbody td:nth-child(9),  /* Input Cost */
tbody td:nth-child(10), /* Output Cost */
tbody td:nth-child(11), /* Reasoning Cost */
tbody td:nth-child(12), /* Cache Read Cost */
tbody td:nth-child(13), /* Cache Write Cost */
tbody td:nth-child(14), /* Audio Input Cost */
tbody td:nth-child(15), /* Audio Output Cost */
tbody td:nth-child(18) {
  /* Input Limit */
  color: var(--color-text);
}

/* Monospace cells (technical data) */
tbody td:nth-child(3),  /* Family */
tbody td:nth-child(4),  /* Provider ID */
tbody td:nth-child(9),  /* Input Cost */
tbody td:nth-child(10), /* Output Cost */
tbody td:nth-child(11), /* Reasoning Cost */
tbody td:nth-child(12), /* Cache Read Cost */
tbody td:nth-child(13), /* Cache Write Cost */
tbody td:nth-child(14), /* Audio Input Cost */
tbody td:nth-child(15), /* Audio Output Cost */
tbody td:nth-child(16), /* Audio Input Cost */
tbody td:nth-child(17) {
  /* Audio Output Cost */
  font-size: 0.8125rem;
  font-family: var(--font-mono);
}
```

### Special Column Features

1. **Provider Cell**
   - Flexbox layout (icon + text)
   - SVG logo: 1rem x 1rem
   - Hover state: No special hover on logo

2. **Model ID Cell**
   - Flexbox layout (text + button)
   - Copy button: Hidden by default, shows on hover
   - Icons: 14px x 14px
   - Transition: 0.2s ease for opacity and color

3. **Modality Icons**
   - Size: 20px x 20px
   - Border: 1px solid
   - Background: Theme background
   - Tooltip on hover
   - Tooltip style: Full uppercase, 0.625rem font

4. **Cost Headers**
   - Two-line layout with description
   - Example:
     ```
     Input Cost
     per 1M tokens
     ```

## 5. Sorting and Filtering Integration

### Sortable Columns

**All 27 columns are sortable**, with different data types:

```tsx
<th class="sortable" data-type="text">
<th class="sortable" data-type="boolean">
<th class="sortable" data-type="modalities">
<th class="sortable" data-type="number">
```

**Sort Indicators:**

- ↑ (ascending)
- ↓ (descending)
- Empty (unsorted)

**Sorting Logic:**

```typescript
function sortTable(column: number, direction: 'asc' | 'desc') {
  const columnType = header.getAttribute('data-type')

  rows.sort((a, b) => {
    const aValue = getCellValue(a.cells[column], columnType)
    const bValue = getCellValue(b.cells[column], columnType)

    // Handle undefined values - always sort to bottom
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return 1
    if (bValue === undefined) return -1

    let comparison = 0
    if (columnType === 'number' || columnType === 'modalities') {
      comparison = (aValue as number) - (bValue as number)
    } else if (columnType === 'boolean') {
      comparison = (aValue as string).localeCompare(bValue as string)
    } else {
      comparison = (aValue as string).localeCompare(bValue as string)
    }

    return direction === 'asc' ? comparison : -comparison
  })
}
```

**Sort Types:**

- **Text:** Alphabetical comparison
- **Number:** Numeric comparison
- **Boolean:** String comparison ("Yes" < "No")
- **Modalities:** Count-based (number of icons)

### URL State Management

Sorting state is persisted in URL:

```typescript
// URL format: ?sort=input-cost&order=asc
updateQueryParams({
  sort: getColumnNameForURL(header),
  order: direction,
})

// Column name for URL: lowercase, first 2 words, hyphenated
// Example: "Input Cost" → "input-cost"
```

### Search/Filter Feature

```typescript
function filterTable(value: string) {
  const lowerCaseValues = value
    .toLowerCase()
    .split(',')
    .filter((str) => str.trim() !== '')
  const rows = document.querySelectorAll('table tbody tr')

  rows.forEach((row) => {
    const cellTexts = Array.from(row.cells).map((cell) =>
      cell.textContent!.toLowerCase(),
    )
    const isVisible =
      lowerCaseValues.length === 0 ||
      lowerCaseValues.some((lowerCaseValue) =>
        cellTexts.some((text) => text.includes(lowerCaseValue)),
      )
    row.style.display = isVisible ? '' : 'none'
  })

  updateQueryParams({ search: value || null })
}
```

**Search Features:**

- Comma-separated values (AND logic across different terms)
- Case-insensitive
- Searches all cells in each row
- Keyboard shortcut: ⌘K / Ctrl+K to focus
- Escape key to clear search

## 6. Column Visibility

### Current Implementation

**Status: NOT IMPLEMENTED**

There is **no column visibility feature** in the current codebase. All 27 columns are always displayed.

**Evidence:**

- No UI controls for toggling columns
- No "Show/Hide Columns" button
- No checkbox dropdown for column selection
- No URL state for column visibility
- All cells are always rendered with no conditional display

### Technical Considerations

To implement column visibility, you would need to:

1. **Add UI Controls**
   - Button in header to open column selector
   - Checkbox list of all 27 columns
   - "Reset to default" option

2. **Add URL State**

   ```typescript
   // URL format: ?cols=provider,model,tool-call,input-cost
   updateQueryParams({ cols: selectedColumns.join(',') })
   ```

3. **Add CSS Classes**

   ```css
   .column-hidden {
     display: none;
   }
   ```

4. **Add JavaScript to Toggle**

   ```typescript
   function toggleColumn(columnIndex: number, isVisible: boolean) {
     const headers = document.querySelectorAll('th')
     const cells = document.querySelectorAll(`td:nth-child(${columnIndex + 1})`)

     if (isVisible) {
       headers[columnIndex].classList.remove('column-hidden')
       cells.forEach((cell) => cell.classList.remove('column-hidden'))
     } else {
       headers[columnIndex].classList.add('column-hidden')
       cells.forEach((cell) => cell.classList.add('column-hidden'))
     }
   }
   ```

## 7. Column Grouping

### Current Implementation

**Status: NO COLUMN GROUPING**

There is **no column grouping** in the current implementation. All 27 columns are at the same level in a single `<thead><tr>`.

**Potential Groupings (not implemented):**

- **Cost Grouping:** Input Cost, Output Cost, Reasoning Cost, Cache Read/Write Cost, Audio Input/Output Cost (7 columns)
- **Limit Grouping:** Context Limit, Input Limit, Output Limit (3 columns)
- **Capability Grouping:** Tool Call, Reasoning, Structured Output, Temperature (4 columns)
- **Modality Grouping:** Input, Output (2 columns)

## 8. Data Source Structure

### Model Schema (from TOML)

```toml
name = "Model Display Name"
attachment = true           # or false
reasoning = false           # or true
tool_call = true            # or false
structured_output = true    # or false - optional
temperature = true          # or false - optional
knowledge = "2024-04"       # YYYY-MM or YYYY-MM-DD - optional
release_date = "2025-02-19" # YYYY-MM or YYYY-MM-DD
last_updated = "2025-02-19" # YYYY-MM or YYYY-MM-DD
open_weights = true         # or false
status = "beta"             # alpha, beta, deprecated - optional

[cost]
input = 3.00                # per 1M tokens (USD)
output = 15.00              # per 1M tokens (USD)
reasoning = 15.00           # per 1M tokens (USD) - optional
cache_read = 0.30           # per 1M tokens (USD) - optional
cache_write = 3.75          # per 1M tokens (USD) - optional
input_audio = 1.00          # per 1M tokens (USD) - optional
output_audio = 10.00        # per 1M tokens (USD) - optional

[limit]
context = 400_000           # Maximum context window (tokens)
input = 272_000             # Maximum input tokens (optional)
output = 8_192              # Maximum output tokens

[modalities]
input = ["text", "image"]   # text, image, audio, video, pdf
output = ["text"]           # text, image, audio, video, pdf

[interleaved]
field = "reasoning_content" # optional
```

### Provider Schema (from TOML)

```toml
name = "Provider Name"
npm = "@ai-sdk/provider"
env = ["PROVIDER_API_KEY"]
doc = "https://example.com/docs/models"
api = "https://api.example.com/v1" # optional, for OpenAI-compatible
```

## 9. Modality Icon Details

### Supported Modality Types

| Type  | Icon       | SVG Description          |
| ----- | ---------- | ------------------------ |
| Text  | Text icon  | Lines + T-shape          |
| Image | Image icon | Rect + circle + mountain |
| Audio | Audio icon | Speaker + waves          |
| Video | Video icon | Play button + rect       |
| PDF   | PDF icon   | Document with lines      |

### Icon Rendering Function

```tsx
const getModalityIcon = (modality: string) => {
  switch (modality) {
    case 'text':
      return (
        <span class="modality-icon" data-tooltip="Text">
          {/* SVG */}
        </span>
      )
    case 'image':
      return (
        <span class="modality-icon" data-tooltip="Image">
          {/* SVG */}
        </span>
      )
    case 'audio':
      return (
        <span class="modality-icon" data-tooltip="Audio">
          {/* SVG */}
        </span>
      )
    case 'video':
      return (
        <span class="modality-icon" data-tooltip="Video">
          {/* SVG */}
        </span>
      )
    case 'pdf':
      return (
        <span class="modality-icon" data-tooltip="PDF">
          {/* SVG */}
        </span>
      )
    default:
      return null
  }
}
```

## 10. Responsive Design

### Current Implementation

**Status: MINIMAL RESPONSIVE DESIGN**

The current implementation only handles header responsiveness:

```css
@media (max-width: 45rem) {
  div.right .github,
  div.right .search-container {
    display: none;
  }
}
```

**Limitations:**

- Table does NOT have horizontal scroll
- No column hiding on mobile
- All 27 columns remain visible
- Table overflow may cause layout issues on small screens

### Recommended Improvements

To make the table more responsive:

1. **Add horizontal scroll:**

   ```css
   @media (max-width: 1200px) {
     table-wrapper {
       overflow-x: auto;
       -webkit-overflow-scrolling: touch;
     }
     table {
       min-width: 100%;
     }
   }
   ```

2. **Hide less important columns on mobile:**
   ```css
   @media (max-width: 768px) {
     .column-provider-id,
     .column-family,
     .column-cache-read-cost,
     .column-cache-write-cost,
     /* ... etc ... */ {
       display: none;
     }
   }
   ```

## 11. Performance Considerations

### Build-Time Optimization

- **Provider logos pre-loaded:** All SVG logos loaded at build time into a `Map`
- **Static rendering:** Table is server-side rendered using Hono JSX
- **No client-side data fetching:** All data is baked into the HTML

### Client-Side Performance

- **Vanilla JavaScript:** No framework overhead
- **DOM manipulation:** Direct DOM access for sorting/filtering
- **Event delegation:** Minimal event listeners
- **CSS transitions:** Smooth hover effects on buttons

### Potential Bottlenecks

- **Large number of rows:** With many providers and models, client-side sorting could be slow
- **27 columns:** Wide table with many cells to manipulate
- **No virtualization:** All rows rendered in DOM

## 12. Summary Statistics

| Metric                          | Value                                                        |
| ------------------------------- | ------------------------------------------------------------ |
| Total Columns                   | 27                                                           |
| Text Columns                    | 9                                                            |
| Boolean Columns                 | 4                                                            |
| Number Columns                  | 9                                                            |
| Modality Columns                | 2                                                            |
| Sortable Columns                | 27 (100%)                                                    |
| Columns with Special Formatting | 5 (Provider, Model ID, Input, Output, Costs)                 |
| Columns with Icons              | 2 (Input, Output)                                            |
| Columns with Copy Button        | 1 (Model ID)                                                 |
| Columns with Logos              | 1 (Provider)                                                 |
| Columns with Tooltips           | 2 (Input, Output)                                            |
| Optional Columns (can show "-") | 4 (Structured Output, Input Limit, Knowledge, various costs) |
| Column Visibility Feature       | ❌ Not implemented                                           |
| Column Grouping                 | ❌ Not implemented                                           |

## 13. Verified Sources

- **Main Table Component:** https://github.com/sst/models.dev/blob/dev/packages/web/src/render.tsx
- **Client-Side Logic:** https://github.com/sst/models.dev/blob/dev/packages/web/src/index.ts
- **CSS Styling:** https://github.com/sst/models.dev/blob/dev/packages/web/src/index.css
- **Documentation:** https://github.com/sst/models.dev/blob/dev/README.md
- **Repository:** https://github.com/sst/models.dev/tree/dev/packages/web/src

## 14. Key Findings for Implementation

### What Works Well

1. **Comprehensive coverage:** 27 columns cover all important model metadata
2. **Consistent sorting:** All columns sortable with appropriate type handling
3. **Smart cell value extraction:** Handles undefined values, formats numbers/currency correctly
4. **URL state persistence:** Sort order and search query preserved in URL
5. **Special formatting:** Icons for modalities, logos for providers, copy button for Model ID
6. **Clean codebase:** Simple, maintainable vanilla JavaScript

### What Could Be Improved

1. **No column visibility:** Users cannot hide/show columns
2. **No column grouping:** Related columns (costs, limits) not grouped
3. **Limited responsiveness:** Table may be unusable on small screens
4. **No virtualization:** Performance may degrade with many rows
5. **No column pinning:** Important columns (Provider, Model) could be pinned on scroll
6. **No multi-column sort:** Only single column sorting supported
7. **No column reordering:** Users cannot reorder columns
8. **No column width controls:** Users cannot adjust column widths

### Recommended Implementation Priority

1. **High Priority:**
   - Column visibility feature (most requested)
   - Horizontal scroll for mobile (critical for usability)

2. **Medium Priority:**
   - Column grouping (improves scannability)
   - Column pinning (keeps key data visible)
   - Responsive column hiding (progressive disclosure)

3. **Low Priority:**
   - Multi-column sort (nice to have)
   - Column reordering (advanced feature)
   - Column width controls (rarely needed)

## 15. Code Snippets for Reference

### Complete Column Header Definition

```tsx
<thead>
  <tr>
    <th class="sortable" data-type="text">
      Provider <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="text">
      Model <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="text">
      Family <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="text">
      Provider ID <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="text">
      Model ID <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="boolean">
      Tool Call <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="boolean">
      Reasoning <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="modalities">
      Input <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="modalities">
      Output <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="number">
      <div class="header-container">
        <span class="header-text">
          Input Cost
          <br />
          <span class="desc">per 1M tokens</span>
        </span>
        <span class="sort-indicator"></span>
      </div>
    </th>
    <th class="sortable" data-type="number">
      <div class="header-container">
        <span class="header-text">
          Output Cost
          <br />
          <span class="desc">per 1M tokens</span>
        </span>
        <span class="sort-indicator"></span>
      </div>
    </th>
    <th class="sortable" data-type="number">
      <div class="header-container">
        <span class="header-text">
          Reasoning Cost
          <br />
          <span class="desc">per 1M tokens</span>
        </span>
        <span class="sort-indicator"></span>
      </div>
    </th>
    <th class="sortable" data-type="number">
      <div class="header-container">
        <span class="header-text">
          Cache Read Cost
          <br />
          <span class="desc">per 1M tokens</span>
        </span>
        <span class="sort-indicator"></span>
      </div>
    </th>
    <th class="sortable" data-type="number">
      <div class="header-container">
        <span class="header-text">
          Cache Write Cost
          <br />
          <span class="desc">per 1M tokens</span>
        </span>
        <span class="sort-indicator"></span>
      </div>
    </th>
    <th class="sortable" data-type="number">
      <div class="header-container">
        <span class="header-text">
          Audio Input Cost
          <br />
          <span class="desc">per 1M tokens</span>
        </span>
        <span class="sort-indicator"></span>
      </div>
    </th>
    <th class="sortable" data-type="number">
      <div class="header-container">
        <span class="header-text">
          Audio Output Cost
          <br />
          <span class="desc">per 1M tokens</span>
        </span>
        <span class="sort-indicator"></span>
      </div>
    </th>
    <th class="sortable" data-type="number">
      Context Limit <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="number">
      Input Limit <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="number">
      Output Limit <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="boolean">
      Structured Output <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="boolean">
      Temperature <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="text">
      Weights <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="text">
      Knowledge <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="text">
      Release Date <span class="sort-indicator"></span>
    </th>
    <th class="sortable" data-type="text">
      Last Updated <span class="sort-indicator"></span>
    </th>
  </tr>
</thead>
```

### Cell Value Extraction Logic

```typescript
function getCellValue(
  cell: HTMLTableCellElement,
  type: string,
): string | number | undefined {
  if (type === 'modalities')
    return cell.querySelectorAll('.modality-icon').length

  const text = cell.textContent?.trim() || ''
  if (text === '-') return
  if (type === 'number') return parseFloat(text.replace(/[$,]/g, '')) || 0
  return text
}
```

### URL Column Name Generation

```typescript
function getColumnNameForURL(headerEl: Element): string {
  const text = headerEl.textContent?.trim().toLowerCase() || ''
  return text.replace(/↑|↓/g, '').trim().split(/\s+/).slice(0, 2).join('-')
}

// Examples:
// "Provider" → "provider"
// "Input Cost" → "input-cost"
// "Cache Read Cost" → "cache-read"
```
