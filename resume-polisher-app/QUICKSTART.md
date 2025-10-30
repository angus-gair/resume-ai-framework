# Resume Polisher - Quick Start

Get up and running in 5 minutes! 🚀

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Anthropic API key ready
- [ ] Resume database from curator
- [ ] HTML resume template

## Installation (2 minutes)

```bash
cd resume-polisher-app
npm install
```

## First Run (1 minute)

```bash
npm run dev
```

## Setup API (30 seconds)

1. Enter your Anthropic API key when prompted
2. Click "Initialize API"
3. Wait for green checkmark

## Usage Flow (2 minutes per job)

### 1️⃣ Extract (30 seconds)
```
Paste job URL → Click "Extract" → Wait for analysis
```

### 2️⃣ Configure (30 seconds)
```
Select Template → Select Database → Select Output Folder
```

### 3️⃣ Generate (60 seconds)
```
Click "Generate" → Watch progress → Wait for completion
```

### 4️⃣ Export (30 seconds)
```
Review resume → Save HTML/PDF → Copy recruiter message
```

## Example Session

```bash
# Start app
npm run dev

# In app:
# 1. Enter API key: sk-ant-...
# 2. Paste URL: https://seek.com.au/job/12345
# 3. Click Extract
# 4. Select template: ../polished-resume/my-resume.html
# 5. Select database: ../curator-output-master-reume/
# 6. Select output: ./output/
# 7. Click Generate
# 8. Save HTML + PDF
# 9. Done! ✅
```

## Common Commands

```bash
# Development with hot reload
npm run dev

# Production mode
npm start

# Build for distribution
npm run build:all

# Clean install
rm -rf node_modules && npm install
```

## Keyboard Shortcuts

- `Ctrl+Shift+I` / `Cmd+Option+I` - Open DevTools
- `Enter` in URL field - Extract requirements
- `Ctrl+V` / `Cmd+V` - Paste (works in all inputs)

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| API key rejected | Check for spaces, verify in Anthropic console |
| Database won't load | Ensure all 4 JSON/YAML files exist |
| PDF export fails | Run `npx playwright install chromium` |
| App won't start | Delete `node_modules` and run `npm install` |

## File Locations

After first successful run:

```
resume-ai-framework/
├── resume-polisher-app/        # The app
├── curator-output-master-reume/  # Your database
├── polished-resume/            # Templates & outputs
└── agents/                     # Agent definitions
```

## Next Steps

- Read [README.md](README.md) for full documentation
- See [SETUP.md](SETUP.md) for detailed setup
- Check [../CLAUDE.md](../CLAUDE.md) for framework overview

## Tips for Best Results

1. **Use Recent Database**: Update your curator database regularly
2. **Quality Templates**: Start with a well-formatted HTML template
3. **Clear Job URLs**: Use direct links to job postings
4. **Review Output**: Always review before sending
5. **Edit Message**: Customize the recruiter message for each job

## Performance Expectations

- **Extraction**: 5-10 seconds
- **Database Load**: 1-2 seconds
- **Generation**: 10-30 seconds
- **PDF Export**: 3-5 seconds

**Total time per job**: 2-5 minutes

## Support

Questions? Check:
1. Console output for errors
2. README.md for details
3. CLAUDE.md for agent info

Happy tailoring! 🪄✨
