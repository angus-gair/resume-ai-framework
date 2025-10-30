# Resume Polisher - Electron Desktop App

AI-powered resume tailoring application built with Electron, React, and Claude AI.

## Features

- **🔍 Job Requirements Extraction**: Automatically scrapes and extracts key requirements from job postings
- **⚙️ Smart Configuration**: Easy setup with resume templates and database integration
- **✨ AI-Powered Generation**: Uses Claude AI to intelligently tailor resumes to specific jobs
- **📄 Export Options**: Save as HTML or export to PDF
- **🎯 Evidence-Based**: Leverages your comprehensive resume database for accurate, quantified achievements
- **🇦🇺 Australian English**: Maintains proper Australian spelling throughout

## Prerequisites

- Node.js 18+ and npm
- Anthropic Claude API key ([Get one here](https://console.anthropic.com))
- Resume database from curator (master_resume.yaml, master_resume.index.json)
- HTML resume template

## Installation

```bash
# Install dependencies
npm install

# For development (with hot reload)
npm run dev

# For production build
npm run build:all
```

## Development

```bash
# Start development server with Electron
npm run dev

# This will:
# 1. Start Vite dev server on port 5173
# 2. Launch Electron app
# 3. Enable hot reload for UI changes
```

## Building for Production

```bash
# Build the React app and package Electron
npm run build:all

# The distributable will be in the dist/ folder
```

### Platform-Specific Builds

The app can be built for multiple platforms:

- **macOS**: Creates a .dmg file
- **Windows**: Creates an .exe installer
- **Linux**: Creates an AppImage

## Usage

### 1. Initial Setup

On first launch, you'll be prompted to enter your Anthropic API key:

1. Enter your Claude API key
2. Click "Initialize API"
3. The app will verify the connection

### 2. Extract Job Requirements

1. Paste a job posting URL (Seek, LinkedIn, etc.)
2. Click "Extract"
3. The app will:
   - Scrape the job posting
   - Use Claude AI to extract key requirements
   - Present a structured analysis

### 3. Configure Settings

1. **Select Resume Template**: Choose your base HTML resume
2. **Select Database**: Point to your `curator-output-master-reume/` directory
3. **Select Output Directory**: Where to save the generated resume

The app will display:
- Number of skills in database
- Available technologies
- Total achievements
- Companies in your history

### 4. Generate Tailored Resume

1. Review the ready-to-generate summary
2. Click "Generate Tailored Resume"
3. Watch the progress as Claude:
   - Analyzes job requirements
   - Queries your database for matching achievements
   - Selects the most relevant experiences
   - Optimizes for ATS systems
   - Generates a personalized recruiter message

### 5. Review & Export

1. **Preview**: See your tailored resume in the preview pane
2. **Edit Message**: Customize the recruiter message if needed
3. **Export**:
   - Save as HTML
   - Export as PDF
   - Or save both formats

## Architecture

```
resume-polisher-app/
├── main.js                 # Electron main process
├── preload.js              # Electron preload script (security layer)
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
│
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main application component
│   ├── index.css           # Global styles
│   │
│   ├── components/         # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Button.jsx
│   │   └── ProgressBar.jsx
│   │
│   ├── pages/              # Main page components
│   │   ├── SetupPage.jsx        # API key setup
│   │   ├── ExtractPage.jsx      # Job URL extraction
│   │   ├── ConfigurePage.jsx    # Settings configuration
│   │   ├── GeneratePage.jsx     # Resume generation
│   │   └── ReviewPage.jsx       # Review and export
│   │
│   ├── store/              # State management
│   │   └── useStore.js          # Zustand store
│   │
│   └── services/           # Business logic (if needed)
│
└── assets/                 # Icons and images
```

## Technology Stack

### Frontend
- **React 18**: UI framework
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **Vite**: Build tool and dev server
- **Marked**: Markdown rendering

### Backend (Electron)
- **Electron 29**: Desktop framework
- **Node.js**: Runtime
- **Playwright**: Web scraping
- **Anthropic SDK**: Claude AI integration
- **js-yaml**: YAML parsing
- **Cheerio**: HTML parsing

## IPC Communication

The app uses Electron's IPC (Inter-Process Communication) for security:

```javascript
// Frontend calls (via preload.js)
const result = await window.electronAPI.extractRequirements({...});

// Backend handlers (in main.js)
ipcMain.handle('extract-requirements', async (event, data) => {...});
```

### Available IPC Channels

#### File System
- `select-directory`: Open directory picker
- `select-file`: Open file picker
- `read-file`: Read file contents
- `write-file`: Write file contents
- `read-yaml`: Parse and read YAML
- `read-json`: Parse and read JSON

#### Job Processing
- `scrape-job-url`: Scrape job posting
- `extract-requirements`: Extract requirements with AI
- `load-database`: Load resume database
- `generate-tailored-resume`: Generate customized resume

#### Export
- `save-resume`: Save HTML file
- `export-pdf`: Export to PDF

#### Progress Events
- `scraping-progress`: Scraping updates
- `extraction-progress`: Extraction updates
- `database-loading`: Database loading updates
- `generation-progress`: Generation updates

## Configuration

### Environment Variables

Create a `.env` file for development:

```env
NODE_ENV=development
```

### Database Structure

Expected database directory structure:

```
curator-output-master-reume/
├── master_resume.yaml           # Main resume data
├── master_resume.index.json     # Index for fast lookups
├── evidence_map.json            # Evidence validation
└── alias_map.json              # Terminology mappings
```

## Security

- **API Key Storage**: Stored in memory only, never written to disk
- **Context Isolation**: Enabled in Electron for security
- **No Node Integration**: Renderer process has no direct Node.js access
- **Preload Script**: All IPC communication goes through secure preload layer

## Troubleshooting

### API Connection Issues

```
Error: Failed to initialize API
```

**Solution**: Check your API key is valid and has sufficient credits

### Database Loading Errors

```
Error: Failed to load database
```

**Solution**: Ensure the directory contains:
- `master_resume.yaml`
- `master_resume.index.json`

### PDF Export Issues

```
Error: PDF export failed
```

**Solution**: Playwright may need to download browsers on first run:

```bash
npx playwright install chromium
```

## Performance

- **Resume Generation**: ~10-30 seconds depending on complexity
- **Job Extraction**: ~5-10 seconds
- **Database Loading**: <2 seconds for typical database
- **PDF Export**: ~3-5 seconds

## Roadmap

- [ ] Template library with pre-built designs
- [ ] Batch processing for multiple jobs
- [ ] Version history and comparisons
- [ ] A/B testing of resume variations
- [ ] Analytics dashboard (success tracking)
- [ ] Integration with job board APIs
- [ ] Custom agent instructions editor
- [ ] Export to DOCX format

## Contributing

This is a self-contained application within the resume-ai-framework project.

## License

MIT

## Support

For issues related to:
- **Electron/UI**: Check the app logs in DevTools
- **Claude API**: Verify API key and credits
- **Database**: Ensure curator output is valid
- **General**: See parent project documentation

## Credits

Built on the resume-ai-framework's multi-agent system for evidence-based resume generation.
