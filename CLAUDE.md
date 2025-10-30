# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-agent AI framework for building comprehensive, evidence-based resumes using a systematic pipeline approach. The system transforms raw career materials (code, presentations, project docs) into structured resume databases, then generates tailored, polished resumes for specific job applications.

## Core Architecture

### Three-Stage Pipeline

The framework uses a sequential three-stage pipeline (see [Project-framework.mmd](Project-framework.mmd)):

1. **Stage 1: Content Aggregation** (`agents/1-resume-content-generator.md`)
   - **Input**: Raw project materials (code, PowerPoints, PDFs, workbooks, PRDs)
   - **Output**: Structured markdown summaries in `output-from-aggregator/`
   - **Purpose**: Extract skills, achievements, and context from diverse source materials
   - **Agent**: `content-generator`

2. **Stage 2: Database Curation** (`agents/2-Resume-database-curator.json`)
   - **Input**: Markdown files from aggregator
   - **Output**: Canonical database files in `curator-output-master-reume/`
     - `master_resume.yaml` - Authoritative data store (45 achievements, 12 projects, 7 roles)
     - `master_resume.index.json` - Fast lookup tables and query paths
     - `evidence_map.json` - Source validation and confidence tracking
     - `alias_map.json` - Terminology standardization
   - **Purpose**: Normalize, deduplicate, and enrich career data into single source of truth
   - **Agent**: `database-curator`
   - **Critical**: Uses Australian English throughout; maintains stable IDs for all roles/projects

3. **Stage 3: Master Resume Creation** (`agents/3- Master-Resume-Creator.md`)
   - **Input**: Database from curator
   - **Output**: HTML resume files
   - **Purpose**: Transform structured data into polished, tailored resumes
   - **Agent**: `master-resume`

### Resume Polisher (Two-Stage Extension)

An additional workflow for job-specific tailoring:

**Stage 1 - Extract Position Requirements**
- Input: Job URL (e.g., from seek.com.au)
- Output: `POSITION-REQUIREMENTS.md`
- Uses LLM to extract key position information

**Stage 2 - Generate Tailored Resume**
- Inputs: Position requirements, resume template (.html), resume database
- Output: Refined resume.html + recruiter message
- Agent: Resume Refinement Agent (`agents/4-Resume-Refinement-Agent`)

## Directory Structure

```
/
├── agents/                      # Agent definitions
│   ├── 1-resume-content-generator.md
│   ├── 2-Resume-database-curator.json
│   ├── 3- Master-Resume-Creator.md
│   └── 99- Resume-Writer-Agent.json
├── user-data-into-aggregator/  # Raw input materials (code, PDFs, notebooks)
├── output-from-aggregator/     # Structured markdown summaries by project
├── curator-output-master-reume/ # Canonical database outputs
├── polished-resume/            # Final HTML resume outputs
├── historical-roles/           # Archive of previous role data
├── resume-editor.html          # GrapesJS-based visual resume editor
├── Project-framework.mmd       # Mermaid diagram of workflow
└── workflow.drawio.xml         # Draw.io workflow diagram
```

## Key Data Files

### Master Resume Database (`curator-output-master-reume/`)

**master_resume.yaml**
- Authoritative career data store
- 45 achievements with comprehensive evidence links
- 12 projects with STAR structure
- 7 roles with stable IDs
- Australian English compliance enforced

**master_resume.index.json** (v1.3.0)
- Fast lookup tables by: skill, company, domain, technology, stakeholder
- Query paths for timeframe-based role retrieval
- Outcome metrics categorized by: performance_uplifts, scale_metrics, business_impact
- 36 primary skills, 20 secondary skills
- 46 technologies tracked
- 31 stakeholder types

**evidence_map.json**
- Source validation with confidence levels
- 30 achievements marked as "strong evidence"
- Links to source documents (slides, code, dashboards)

**alias_map.json**
- Resolves acronym collisions (e.g., "MMM" = Media Mix Modeling vs. unrelated algorithm)
- Canonical terminology mappings

### Data Quality Guarantees

- ✅ 100% Australian English (organised, analysed, optimised)
- ✅ Stable ID system (`role_<company>_<yyyymm>`, `proj_<slug>`)
- ✅ Timeline integrity verification
- ✅ ≥90% evidence coverage for bullets
- ✅ Zero unresolved acronym collisions

## Agent System

Each stage uses a specialized AI agent with defined:
- **Mission**: Core purpose and scope
- **Workflow**: Step-by-step process
- **Input/Output Contract**: Expected data formats
- **Style Rules**: Australian English, active voice, context→action→outcome structure
- **Decision Principles**: How to handle ambiguity, conflicts, and gaps

### Agent Philosophy

**Content Aggregator**: "Document not just what was built, but why it mattered and how it delivered tangible impact."

**Database Curator**: "Be comprehensive without being chaotic. Every item is canonical, deduplicated, cross-referenced, and evidence-linked."

**Master Resume Creator**: "Transform the comprehensive Master Resume Curator dataset into polished, tailored resumes that fully leverage the rich data architecture."

## Resume Editor

[resume-editor.html](resume-editor.html) - Browser-based visual resume editor
- Built with GrapesJS framework
- Features:
  - Load/save HTML resume files
  - Export to HTML
  - Print to PDF (browser print dialog)
  - Save to PDF (via FreeConvert API - API key embedded)
  - Page dimension display (toggle in/mm/px units)
  - Custom resume blocks (sections, job entries, skills)
- PDF export optimized for:
  - 8.5" width continuous page layout
  - Zero margins for API conversion
  - Color/background preservation
  - Print-friendly styling

### Editor Usage
1. Open `resume-editor.html` in browser
2. Load existing resume HTML
3. Edit using visual builder
4. Export or save to PDF

## Working with the Database

### Querying Resume Data

Use `master_resume.index.json` lookup tables:

```javascript
// Find roles by company
lookup_tables.role_by_company["AJ Insights"] → ["role_aj_insights_202412"]

// Find roles by skill
lookup_tables.role_by_skill["Machine Learning"] → ["role_sydney_trains_202106"]

// Get projects by domain
lookup_tables.project_by_domain["Campaign Optimization"] → ["proj_christmas_campaign_optimization"]

// Query achievements by metric type
lookup_tables.achievements_by_metric_type["performance_uplift"] → [list of relevant achievements]

// Get roles by timeframe
query_paths.get_roles_by_timeframe["2024"] → ["role_aj_insights_202412", "role_wooliesx_202404"]
```

### Key Metrics Available

**Performance Uplifts**:
- 3.9× voter prediction model performance
- 99%+ production platform uptime
- 87% passenger prediction accuracy
- 97.8% cost forecasting accuracy
- 320-640% troubleshooting time reduction

**Scale Metrics**:
- 170M+ customer transactions processed
- $52.3M annual cost management
- 2.7M customer segments analyzed
- 0.002s average API response times

**Business Impact**:
- 23-minute average resolution time (vs 4-8 hour industry standard)
- 300+ daily users across 1,000+ stores
- 10-20x customer ROI target
- 100% first-time fix rate

## Development Workflow

### Adding New Career Data

1. Place raw materials in `user-data-into-aggregator/`
   - Supported: code files, PDFs, presentations, notebooks, SQL, Python

2. Run Content Aggregator agent
   - Extract achievements, skills, context
   - Output markdown to `output-from-aggregator/`
   - Follow storytelling synthesis: ground-level details → strategic implications

3. Run Database Curator agent
   - Ingest markdown files
   - Deduplicate and normalize
   - Assign stable IDs
   - Update all database files in `curator-output-master-reume/`
   - Validate Australian English
   - Check evidence coverage ≥90%

4. Run Master Resume Creator agent
   - Query database for relevant achievements
   - Generate HTML resume
   - Output to `polished-resume/`

### Creating Job-Specific Resumes

1. Find target job posting URL
2. Extract requirements to `POSITION-REQUIREMENTS.md`
3. Run Resume Refinement Agent with:
   - Position requirements
   - Base resume template
   - Resume database for evidence
4. Output: Tailored resume + recruiter message

## Style Guidelines

### Australian English Requirements
- **Spelling**: organise, analyse, summarise, optimise, prioritise, behaviour
- **Never use**: organize, analyze, summarize, optimize, prioritize, behavior
- **Tone**: Professional, active voice, precise; no fluff
- **Bullet structure**: Context → Action → Outcome; one concept per bullet

### Achievement Writing Pattern

```
Context (scope/challenge) → Action (what was done) → Outcome (measurable impact)
```

Example:
"Engineered comprehensive ETL framework processing 170M+ customer transactions, delivering 97.8% cost forecasting accuracy for $52.3M annual budget management"

### Evidence Requirements
- Every bullet should reference `source_id` in database
- Prefer specific metrics; if unavailable, qualify with scale/scope
- No claims without evidence or explicit TODO/QUESTION flag

## Technologies in Resume Database

Primary stack (46 technologies tracked):
- **AI/ML**: LangChain, LangGraph, ChromaDB, scikit-learn, XGBoost
- **Backend**: Python, FastAPI, Node.js, Express.js, Flask
- **Frontend**: React, Next.js, TypeScript
- **Data**: PostgreSQL, Redis, BigQuery, Snowflake, Databricks
- **Infrastructure**: Kubernetes, Docker, Prometheus, Grafana, AWS, Azure
- **Analytics**: Tableau, Power BI, SQL, pandas, plotly

## File Formats

### Agent Files
- JSON format for structured agent definitions
- Markdown format for narrative-heavy agents

### Database Files
- YAML for master resume (human-readable, version-controllable)
- JSON for indices and maps (fast parsing)

### Output Files
- Markdown for aggregated content (reviewable, diffable)
- HTML for final resumes (editable, printable)

## Important Notes

- **Australian English is mandatory** - all content must use Australian spelling
- **Evidence-based approach** - 30/45 achievements have strong evidence validation
- **Stable IDs** - never change role/project IDs; maintains query consistency
- **Deduplication** - curator removes redundancy while preserving nuance
- **Canonical naming** - aliases stored but one canonical term used throughout
- **Timeline integrity** - no date overlaps without explicit "parallel" flag

## Success Metrics

- Zero unresolved acronym collisions
- ≥95% of bullets tagged with ≥1 primary skill and ≥1 tech
- ≥90% source coverage for all bullets
- No US spellings in lint pass
- Downstream query hit-rate ≥99% for top 50 role requirements
