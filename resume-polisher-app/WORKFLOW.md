# Resume Polisher - Visual Workflow

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     STAGE 0: SETUP                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Open App                                             │  │
│  │  2. Enter Anthropic API Key: sk-ant-...                 │  │
│  │  3. Click "Initialize API"                              │  │
│  │  4. ✓ Connection Verified                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  → ONE-TIME SETUP (Key stored in memory only)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              STAGE 1: EXTRACT JOB REQUIREMENTS                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  INPUT                                                   │  │
│  │  • Paste job URL: https://seek.com.au/job/12345        │  │
│  │  • Click "Extract"                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PROCESSING (10-15 seconds)                             │  │
│  │  ████████░░░░ 60% - Scraping job posting...           │  │
│  │                                                          │  │
│  │  ① Playwright opens browser (headless)                  │  │
│  │  ② Navigate to URL                                      │  │
│  │  ③ Extract page content                                 │  │
│  │  ④ Send to Claude AI                                    │  │
│  │  ⑤ AI extracts structured requirements                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  OUTPUT                                                  │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ # Job Requirements                                 │ │  │
│  │  │                                                    │ │  │
│  │  │ **Job Title**: Senior Data Analyst                │ │  │
│  │  │ **Company**: Acme Corp                            │ │  │
│  │  │ **Location**: Sydney, NSW (Hybrid)                │ │  │
│  │  │                                                    │ │  │
│  │  │ ## Key Responsibilities                           │ │  │
│  │  │ • Develop analytics solutions...                  │ │  │
│  │  │                                                    │ │  │
│  │  │ ## Required Skills                                │ │  │
│  │  │ • Python, SQL, Power BI...                        │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  [📋 Copy] [💾 Save] [→ Continue to Configure]         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STAGE 2: CONFIGURE                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 1: Select Resume Template                         │  │
│  │  [📄 Select Template]                                   │  │
│  │  ✓ /path/to/my-resume-template.html                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 2: Select Resume Database                         │  │
│  │  [🗄️ Select Database]                                   │  │
│  │  ✓ /path/to/curator-output-master-reume/               │  │
│  │                                                          │  │
│  │  Database Stats:                                         │  │
│  │  ┌─────────┬─────────┬─────────┬─────────┐            │  │
│  │  │   36    │   46    │   45    │    7    │            │  │
│  │  │ Skills  │  Tech   │ Achieve │ Companies│            │  │
│  │  └─────────┴─────────┴─────────┴─────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  STEP 3: Select Output Directory                        │  │
│  │  [📁 Select Directory]                                  │  │
│  │  ✓ /path/to/output/                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  [← Back] [→ Continue to Generate]                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               STAGE 3: GENERATE TAILORED RESUME                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Ready to Generate ✓                                    │  │
│  │  ✓ Job requirements extracted                           │  │
│  │  ✓ Resume template loaded                               │  │
│  │  ✓ Database loaded (45 achievements available)          │  │
│  │                                                          │  │
│  │  [✨ Generate Tailored Resume]                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PROCESSING (20-40 seconds)                             │  │
│  │  ████████████████░░░░ 75% - Generating resume...       │  │
│  │                                                          │  │
│  │  What's happening:                                       │  │
│  │  ✓ Analyzed job requirements                            │  │
│  │  ✓ Queried database for matching achievements           │  │
│  │  → Generating tailored HTML...                          │  │
│  │  ○ Creating recruiter message...                        │  │
│  │                                                          │  │
│  │  AI is:                                                  │  │
│  │  • Matching your skills to job requirements             │  │
│  │  • Selecting top 10-12 relevant achievements            │  │
│  │  • Optimizing for ATS systems                           │  │
│  │  • Maintaining Australian English                       │  │
│  │  • Ensuring evidence-backed claims                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  🎉 Generation Complete! → Navigating to Review...              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                STAGE 4: REVIEW & EXPORT                          │
│                                                                  │
│  ┌────────────────────────┬────────────────────────────────┐   │
│  │  RESUME PREVIEW        │  RECRUITER MESSAGE             │   │
│  │  ┌──────────────────┐  │  ┌──────────────────────────┐ │   │
│  │  │                  │  │  │ I'm excited to apply for │ │   │
│  │  │  [HTML Preview]  │  │  │ the Senior Data Analyst  │ │   │
│  │  │                  │  │  │ position. With 5+ years  │ │   │
│  │  │  • Name          │  │  │ of experience in...      │ │   │
│  │  │  • Contact       │  │  │                          │ │   │
│  │  │  • Summary       │  │  │ [Editable text area]     │ │   │
│  │  │  • Experience    │  │  │                          │ │   │
│  │  │  • Skills        │  │  │ [📋 Copy Message]        │ │   │
│  │  │  • Projects      │  │  └──────────────────────────┘ │   │
│  │  │                  │  │                                │   │
│  │  └──────────────────┘  │  Generation Info:              │   │
│  │                        │  • Generated: 2025-10-30      │   │
│  │  [💾 Save HTML]        │  • Output: /path/to/output/   │   │
│  │  [📄 Export PDF]       │  • Status: Ready to export    │   │
│  └────────────────────────┴────────────────────────────────┘   │
│                              ↓                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  EXPORT OPTIONS                                          │  │
│  │  [💾 Save HTML]    → resume-tailored-2025-10-30.html   │  │
│  │  [📄 Export PDF]   → resume-tailored-2025-10-30.pdf    │  │
│  │  [💾 Save Both]    → Both formats simultaneously        │  │
│  │  [🔄 Start New]    → Begin with different job          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              ↓                                   │
│  ✓ Files saved successfully!                                    │
│  📁 resume-tailored-2025-10-30.html                             │
│  📁 resume-tailored-2025-10-30.pdf                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT STEPS                                  │
│                                                                  │
│  ✓ Resume tailored to job requirements                          │
│  ✓ Recruiter message ready to send                              │
│  ✓ Files exported to output directory                           │
│                                                                  │
│  NOW:                                                            │
│  1. Review the resume one final time                            │
│  2. Customize recruiter message if needed                       │
│  3. Apply for the job!                                          │
│  4. Click "Start New Job" for next application                  │
└─────────────────────────────────────────────────────────────────┘
```

## Timing Breakdown

```
Total Time Per Job: 2-5 minutes

┌─────────────────┬──────────────────┬────────────┐
│ Stage           │ Activity         │ Duration   │
├─────────────────┼──────────────────┼────────────┤
│ Setup (once)    │ Enter API key    │ 30s        │
├─────────────────┼──────────────────┼────────────┤
│ 1. Extract      │ Paste URL        │ 5s         │
│                 │ AI extraction    │ 10-15s     │
│                 │ Review output    │ 10s        │
│                 │ Subtotal         │ 25-30s     │
├─────────────────┼──────────────────┼────────────┤
│ 2. Configure    │ Select template  │ 5s         │
│                 │ Select database  │ 5s         │
│                 │ Select output    │ 5s         │
│                 │ Subtotal         │ 15s        │
├─────────────────┼──────────────────┼────────────┤
│ 3. Generate     │ Click button     │ 2s         │
│                 │ AI processing    │ 20-40s     │
│                 │ Subtotal         │ 22-42s     │
├─────────────────┼──────────────────┼────────────┤
│ 4. Review       │ Preview resume   │ 30s        │
│                 │ Edit message     │ 20s        │
│                 │ Export files     │ 10s        │
│                 │ Subtotal         │ 60s        │
├─────────────────┴──────────────────┼────────────┤
│ TOTAL                              │ 2-3 min    │
└────────────────────────────────────┴────────────┘

Note: Subsequent jobs after setup take 2-3 minutes each
```

## Navigation Flow

```
        SetupPage
            │
            ↓ (API initialized)
        ┌───────────────┐
        │  ExtractPage  │ ←─────────┐
        └───────────────┘            │
            │                        │
            ↓ (requirements ready)   │
        ┌───────────────┐            │
        │ ConfigurePage │            │
        └───────────────┘            │
            │ ↑                      │
            │ │ (can go back)        │
            ↓ │                      │
        ┌───────────────┐            │
        │ GeneratePage  │            │
        └───────────────┘            │
            │                        │
            ↓ (generation complete)  │
        ┌───────────────┐            │
        │  ReviewPage   │            │
        └───────────────┘            │
            │                        │
            ↓ (Start New Job)        │
            └────────────────────────┘

Sidebar allows jumping between stages (if data available)
```

## Error Handling Flow

```
Any Stage
    │
    ├─ API Error ──────→ Show error message
    │                    └→ Retry button
    │
    ├─ File Error ─────→ Show error message
    │                    └→ Re-select file
    │
    ├─ Network Error ──→ Show error message
    │                    └→ Check connection
    │
    ├─ Validation ─────→ Highlight invalid field
    │                    └→ Show requirement
    │
    └─ Unexpected ─────→ Show error + DevTools
                         └→ Report issue link
```

## State Persistence

```
During Session:
    All state stored in Zustand store
    ↓
    Persists across page navigation
    ↓
    Reset only on "Start New Job" or app restart

Between Sessions:
    API key: NOT PERSISTED (security)
    Settings: NOT PERSISTED (privacy)
    Outputs: Saved to disk (user choice)
```

## Keyboard Shortcuts

```
Global:
    Ctrl+Shift+I / Cmd+Option+I  → Open DevTools

Extract Page:
    Enter in URL field           → Extract

Configure Page:
    (Native file picker)

Generate Page:
    Enter                        → Generate

Review Page:
    Ctrl+S / Cmd+S              → Save HTML
    Ctrl+P / Cmd+P              → Export PDF
```

## Success Indicators

```
Each stage shows completion:

✓ Extract  → Requirements displayed
✓ Configure → Green checkmarks on all 3 items
✓ Generate  → 100% progress bar
✓ Review    → Files saved message

Sidebar shows:
    ✓ Completed steps (green check)
    → Current step (blue highlight)
    ○ Pending steps (gray)
    🔒 Locked steps (needs previous complete)
```

---

## Visual Reference

### Colors

- **Primary**: Blue (#0ea5e9) - Actions, links, progress
- **Success**: Green (#22c55e) - Completed, saved
- **Warning**: Yellow (#eab308) - Attention needed
- **Error**: Red (#ef4444) - Errors, failures
- **Background**: Slate (#1e293b) - Main BG
- **Surface**: Slate (#334155) - Cards, panels

### Icons

- 🪄 Resume Polisher (app logo)
- 📋 Extract/Copy
- ⚙️ Configure
- ✨ Generate
- 📄 Review/Export
- 💾 Save
- 🔄 Reset/Refresh
- ✓ Success/Complete
- ✗ Error/Failed
- → Navigation

---

This workflow ensures a smooth, intuitive experience from job discovery to tailored resume in under 3 minutes!
