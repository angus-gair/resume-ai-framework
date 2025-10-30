# Architecture Overview

## System Design

The Resume Polisher app follows a **clean separation of concerns** with three main layers:

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│              (Renderer Process)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Pages     │  │  Components  │  │   Store    │ │
│  │  (Views)    │  │     (UI)     │  │  (State)   │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ IPC (via preload.js)
┌────────────────────────┴────────────────────────────┐
│              Electron Main Process                   │
│  ┌──────────────────────────────────────────────┐  │
│  │           IPC Handlers                        │  │
│  │  • File System Operations                     │  │
│  │  • Claude AI Integration                      │  │
│  │  • Web Scraping (Playwright)                  │  │
│  │  • Database Loading (YAML/JSON)               │  │
│  │  • PDF Generation                             │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────┐
│              External Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐│
│  │ Anthropic    │  │  Playwright  │  │ File      ││
│  │ Claude API   │  │  Chromium    │  │ System    ││
│  └──────────────┘  └──────────────┘  └───────────┘│
└─────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App (Root)
├── SetupPage (Initial API setup)
│   └── API key input + validation
│
└── Main App (After API initialized)
    ├── Header
    │   └── Page title + status indicator
    │
    ├── Sidebar
    │   └── Navigation steps + progress tracking
    │
    └── Content Area
        ├── ExtractPage (Stage 1)
        │   ├── URL input
        │   ├── Scraping progress
        │   ├── Requirements preview
        │   └── Action buttons
        │
        ├── ConfigurePage (Stage 2)
        │   ├── Template selector
        │   ├── Database loader
        │   ├── Output directory picker
        │   └── Database stats display
        │
        ├── GeneratePage (Stage 3)
        │   ├── Ready-to-generate checklist
        │   ├── Generation progress
        │   ├── Status messages
        │   └── Info panel
        │
        └── ReviewPage (Stage 4)
            ├── Resume preview (iframe)
            ├── Recruiter message editor
            ├── Export buttons
            └── Metadata display
```

## State Management (Zustand)

```javascript
Store Structure:
{
  // API State
  isAPIInitialized: boolean,
  apiKey: string,

  // Navigation
  currentPage: string,

  // Stage 1: Requirements
  jobUrl: string,
  requirements: string,
  requirementsMetadata: object,

  // Stage 2: Configuration
  templatePath: string,
  templateHtml: string,
  databasePath: string,
  database: object,
  outputDirectory: string,

  // Stage 3: Generation
  isGenerating: boolean,
  generationProgress: number,
  generationStage: string,

  // Stage 4: Results
  tailoredHtml: string,
  recruiterMessage: string,
  generatedAt: timestamp,

  // Progress tracking
  scrapingProgress: object,
  extractionProgress: object,
  databaseLoadingProgress: object,

  // Actions (methods)
  setAPIInitialized(),
  setCurrentPage(),
  setRequirements(),
  setDatabase(),
  setResults(),
  resetForNewJob(),
  canProceedToGenerate()
}
```

## Data Flow

### Stage 1: Extract Requirements

```
User Input (URL)
    ↓
Frontend: ExtractPage
    ↓
IPC: scrapeJobUrl(url)
    ↓
Main Process: Playwright
    ↓ (page content)
IPC: extractRequirements({url, content})
    ↓
Main Process: Claude API
    ↓ (structured requirements)
Frontend: Update store
    ↓
Display requirements (Markdown → HTML)
```

### Stage 2: Configure

```
User Actions (File/Directory Selection)
    ↓
Frontend: ConfigurePage
    ↓
IPC: selectFile() / selectDirectory()
    ↓
Main Process: Electron dialog
    ↓ (selected paths)
IPC: loadDatabase(path)
    ↓
Main Process: Read YAML/JSON
    ↓ (parsed database)
Frontend: Update store + display stats
```

### Stage 3: Generate

```
User Trigger (Generate button)
    ↓
Frontend: GeneratePage
    ↓
IPC: generateTailoredResume({requirements, template, database})
    ↓
Main Process:
  1. Load agent instructions
  2. Build context from database
  3. Call Claude API (resume)
  4. Call Claude API (message)
    ↓ (tailored HTML + message)
Frontend: Update store
    ↓
Navigate to ReviewPage
```

### Stage 4: Review & Export

```
User Actions (Save/Export)
    ↓
Frontend: ReviewPage
    ↓
IPC: saveResume(html, path)  OR  exportPDF(html, path)
    ↓
Main Process:
  HTML: Write file
  PDF: Playwright → PDF conversion
    ↓ (success/error)
Frontend: Display status
```

## Security Architecture

### Context Isolation

```
┌─────────────────────────────────────┐
│      Renderer Process                │
│   (No direct Node.js access)         │
│                                      │
│  Only accesses electronAPI via:      │
│  window.electronAPI.*                │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│      Preload Script                  │
│   (Controlled IPC bridge)            │
│                                      │
│  contextBridge.exposeInMainWorld()   │
│  → Exposes safe, specific methods    │
└───────────────┬─────────────────────┘
                │
┌───────────────▼─────────────────────┐
│      Main Process                    │
│   (Full Node.js + Electron access)   │
│                                      │
│  ipcMain.handle() handlers           │
│  → File system, API calls, etc.      │
└─────────────────────────────────────┘
```

### API Key Handling

1. **Input**: User enters API key in SetupPage
2. **Validation**: Sent to main process via IPC
3. **Storage**: Kept in memory only (never written to disk)
4. **Usage**: Main process uses for all Claude API calls
5. **Lifecycle**: Lost when app closes (must re-enter)

**Why?** Prevents accidental commits, logging, or exposure.

## File System Integration

### Reading Files

```javascript
// Frontend
const result = await window.electronAPI.readFile(path);

// Main process validates and reads
ipcMain.handle('read-file', async (event, filePath) => {
  // Security: Could add path validation here
  const content = await fs.readFile(filePath, 'utf-8');
  return { success: true, content };
});
```

### Writing Files

```javascript
// Frontend
await window.electronAPI.saveResume({
  html: tailoredHtml,
  outputPath: '/path/to/output.html'
});

// Main process writes atomically
ipcMain.handle('save-resume', async (event, { html, outputPath }) => {
  await fs.writeFile(outputPath, html, 'utf-8');
  return { success: true, path: outputPath };
});
```

## AI Integration

### Claude API Usage

```javascript
// Initialize once with API key
const anthropicClient = new Anthropic({ apiKey });

// Use for multiple operations
const message = await anthropicClient.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 8000,
  messages: [{ role: 'user', content: prompt }]
});
```

### Agent Integration

The app integrates with the resume-ai-framework agents:

1. **Reads agent instructions** from `../agents/3- Master-Resume-Creator.md`
2. **Builds context** from database (achievements, skills, technologies)
3. **Constructs prompt** combining agent instructions + job requirements + database
4. **Generates output** using Claude with full context

## Database Schema Integration

### Expected Structure

```javascript
{
  masterResume: {
    // Full YAML content
    roles: [...],
    projects: [...],
    achievements: [...]
  },
  index: {
    indices: {
      skills: { primary: [...], secondary: [...] },
      technologies: [...],
      domains: [...],
      companies: [...]
    },
    lookup_tables: {
      role_by_company: {...},
      role_by_skill: {...},
      project_by_domain: {...}
    },
    query_paths: {
      get_top_achievements_by_impact: [...],
      get_roles_by_timeframe: {...}
    }
  },
  evidenceMap: { ... },  // Optional
  path: string
}
```

### Query Patterns

```javascript
// Get top achievements
database.index.query_paths.get_top_achievements_by_impact.slice(0, 20)

// Get skills
database.index.indices.skills.primary

// Get roles for a company
database.index.lookup_tables.role_by_company["AJ Insights"]
```

## Progress Tracking

### Event-Based Updates

```javascript
// Main process sends progress
mainWindow.webContents.send('generation-progress', {
  stage: 'analyzing',
  progress: 30
});

// Frontend listens
window.electronAPI.onGenerationProgress((data) => {
  setProgress(data.progress);
  setStage(data.stage);
});
```

### Stages

1. **Scraping**: launching → navigating → extracting → complete
2. **Extraction**: analyzing → processing → complete
3. **Database Loading**: reading → indexing → validating → complete
4. **Generation**: preparing → analyzing → generating → finalizing → message → complete

## Error Handling

### Pattern

```javascript
try {
  // Operation
  const result = await window.electronAPI.someOperation(data);

  if (result.success) {
    // Handle success
  } else {
    // Handle API error
    setError(result.error);
  }
} catch (err) {
  // Handle exception
  setError(err.message);
}
```

### Types of Errors

1. **API Errors**: Invalid key, rate limits, network issues
2. **File Errors**: Not found, permissions, invalid format
3. **Validation Errors**: Missing required data, invalid structure
4. **Browser Errors**: Playwright failures, scraping blocks

## Performance Optimizations

### Lazy Loading

- Database loaded only when selected
- Template HTML loaded only when selected
- Preview iframe only renders when navigated to ReviewPage

### Progress Streaming

- Real-time progress updates during long operations
- Prevents UI freeze during AI generation

### Caching

- Store keeps all loaded data until reset
- No need to reload database/template between generates

## Build Process

### Development

```bash
npm run dev
→ Vite dev server (port 5173)
→ Electron loads localhost:5173
→ Hot reload enabled
```

### Production

```bash
npm run build
→ Vite builds React app to dist/
→ electron-builder packages Electron + dist/
→ Creates platform-specific installers
```

## Extension Points

Want to add features? Here's where to start:

1. **New Page**: Add to `src/pages/`, register in `App.jsx`
2. **New IPC Handler**: Add to `main.js`, expose in `preload.js`
3. **New State**: Extend `src/store/useStore.js`
4. **New Component**: Add to `src/components/`
5. **New Agent**: Integrate by updating prompt in `generateTailoredResume` handler

## Testing Considerations

### Unit Tests

- React components (Jest + React Testing Library)
- Store logic (Zustand test utilities)
- Utility functions

### Integration Tests

- IPC communication (mock electron)
- API integration (mock Anthropic SDK)
- File operations (temp directories)

### E2E Tests

- Playwright for Electron
- Full workflow testing
- Screenshot comparisons

## Deployment

### Signing (macOS)

```bash
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
npm run build:all
```

### Auto-Update

Future enhancement: Integrate `electron-updater` for automatic updates.

## Performance Metrics

- **Cold start**: ~2-3 seconds
- **API initialization**: <1 second
- **Database load**: 1-2 seconds (typical)
- **Resume generation**: 10-30 seconds (Claude API)
- **PDF export**: 3-5 seconds (Playwright)

## Memory Usage

- **Base Electron**: ~150MB
- **With React app**: ~200MB
- **During generation**: ~250MB
- **Peak (with preview)**: ~300MB

Reasonable for a desktop app with AI capabilities.
