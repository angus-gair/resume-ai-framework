# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd resume-polisher-app
npm install
```

This will install all required packages including:
- Electron
- React and related libraries
- Anthropic SDK
- Playwright (for scraping and PDF export)
- Tailwind CSS

## Step 2: Get Your Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

**Important**: Keep this key secure! Never commit it to version control.

## Step 3: Prepare Your Resume Database

Ensure you have completed the curator stage and have these files:

```
curator-output-master-reume/
├── master_resume.yaml
├── master_resume.index.json
├── evidence_map.json
└── alias_map.json
```

If you don't have these, run the Database Curator agent first:
```bash
cd ..
# Run curator process (see main README)
```

## Step 4: Prepare Resume Template

You need an HTML resume template. You can:

1. Use an existing resume from `polished-resume/` directory
2. Create one using the `resume-editor.html` tool
3. Use any HTML resume template

## Step 5: Run the App

### Development Mode (with hot reload)

```bash
npm run dev
```

This starts:
- Vite dev server on `localhost:5173`
- Electron window with DevTools

### Production Mode

```bash
npm start
```

## Step 6: First Use

1. **Enter API Key**: On first launch, paste your Anthropic API key
2. **Click Initialize**: The app will test the connection
3. **Start Using**: Once connected, you'll see the main workflow

## Common Issues

### Installation Problems

**Problem**: `npm install` fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules if it exists
rm -rf node_modules

# Try again
npm install
```

### Playwright Browser Download

**Problem**: PDF export fails

**Solution**: Playwright needs to download Chromium:
```bash
npx playwright install chromium
```

### API Key Invalid

**Problem**: "Failed to initialize API"

**Solution**:
- Check the key is copied correctly (no extra spaces)
- Verify the key is active in Anthropic console
- Ensure you have API credits available

### Database Not Loading

**Problem**: "Failed to load database"

**Solution**:
- Verify all required files exist in the directory
- Check file permissions (readable)
- Ensure YAML/JSON files are valid

## File Structure After Setup

```
resume-polisher-app/
├── node_modules/           # Installed packages
├── dist/                   # Production build (after npm run build)
├── src/                    # Source code
├── main.js                 # Electron main process
├── preload.js              # Security layer
├── package.json            # Dependencies
├── README.md               # Full documentation
└── SETUP.md               # This file
```

## Next Steps

After setup, see [README.md](README.md) for:
- Full usage instructions
- Architecture overview
- Development guidelines
- Troubleshooting

## Quick Start Workflow

1. **Extract**: Paste job URL → Click Extract
2. **Configure**: Select template, database, output folder
3. **Generate**: Click Generate → Wait for AI processing
4. **Review**: Preview resume → Export as HTML/PDF

The entire process takes 2-5 minutes depending on complexity.

## Development Tips

### Enable DevTools

Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to open DevTools.

### View Logs

Electron logs appear in the terminal where you ran `npm run dev`.

### Modify UI

All React components are in `src/`. Changes auto-reload in dev mode.

### Test API Calls

Check the Network tab in DevTools to see API requests/responses.

## Building for Distribution

```bash
# Build everything
npm run build:all

# Output will be in:
# - macOS: dist/Resume Polisher.dmg
# - Windows: dist/Resume Polisher Setup.exe
# - Linux: dist/Resume Polisher.AppImage
```

## Support

Need help? Check:
1. [README.md](README.md) - Full documentation
2. Parent project [CLAUDE.md](../CLAUDE.md) - Framework overview
3. Console output - Error messages and logs

Happy resume polishing! 🪄
