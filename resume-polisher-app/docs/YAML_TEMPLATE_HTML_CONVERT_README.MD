### QUICKSTART GUIDE

"""
# Resume Template System - Quick Start

## What You Got

✓ **resume_content.yaml** - Your resume content extracted (Monitoring focus)  
✓ **resume_content_dataviz.yaml** - Example adapted for Data Viz role  
✓ **generate_resume.py** - Python script to generate HTML  
✓ **generated_resume.html** - Sample output  
✓ **README.md** - Complete user guide  
✓ **EXAMPLES.md** - Content adaptation examples  

## How It Works

```
┌─────────────────────┐
│  resume_content.yaml│  ← Edit this (plain text YAML)
│  - Header info      │
│  - Experience       │
│  - Skills           │
│  - Projects         │
└──────────┬──────────┘
           │
           │ python generate_resume.py
           ▼
┌─────────────────────┐
│ generated_resume.html│  ← Beautiful formatted output
│                     │
│  [Your Resume]      │
└─────────────────────┘
```

## Three-Step Usage

1. **Edit content**: Open `resume_content.yaml` in any text editor
2. **Generate HTML**: Run `python generate_resume.py`
3. **Review**: Open `generated_resume.html` in your browser

## Changing Sections

### Remove "Monitoring & Operations"
```yaml
# Just delete or comment out the section:
# - name: "Monitoring & Operations"
#   skills:
#     - "Enterprise Infrastructure Monitoring"
```

### Add "Data Visualisation"
```yaml
# Add a new category:
- name: "Data Visualisation"
  skills:
    - "Tableau Advanced Dashboards"
    - "Power BI Custom Visuals"
    - "D3.js Interactive Charts"
```

### Reorder Sections
Simply move them up or down in the YAML - they'll appear in that order!

## Benefits

✓ **Separation of concerns**: Content (YAML) vs Presentation (HTML/CSS)  
✓ **Easy editing**: No HTML knowledge needed  
✓ **Version control friendly**: Plain text, git-trackable  
✓ **Flexible sections**: Add/remove/reorder as needed  
✓ **Role-specific versions**: Multiple YAML files, same generator  
✓ **Consistent styling**: One template, many resumes  

## File Dependencies

```
generate_resume.py
    └─ reads: resume_content.yaml
    └─ creates: generated_resume.html

No external dependencies needed (just Python + PyYAML)
```

## Installation

```bash
# Install PyYAML if needed
pip install pyyaml

# Generate your resume
python generate_resume.py
```

## For Advanced Users

- **Multiple versions**: Create `resume_content_[role].yaml` for each target role
- **Custom sections**: Add new section types in `generate_resume.py`
- **Styling changes**: Modify CSS in `get_styles()` function
- **YAML anchors**: Reuse content blocks across sections

## Next Steps

1. Read **README.md** for comprehensive guide
2. Check **EXAMPLES.md** for content adaptation strategies
3. Compare `resume_content.yaml` vs `resume_content_dataviz.yaml` to see the difference
4. Experiment with your own content!

## Support

- YAML syntax issues? Use https://www.yamllint.com/
- Python errors? Check indentation and quotes
- Layout issues? Modify CSS in `generate_resume.py`

**Remember**: Content in YAML, presentation in Python!
"""

### RESUME CONTENT TEMPLATE
``` yaml
# Resume Content Template
# Edit this file to update your resume content
# Sections can be added, removed, or reordered

header:
  name: "ANGUS JAMES"
  title: "Senior Data Analyst (APS6 Monitoring Analyst)"
  contact:
    - "Sydney, NSW"
    - "angus.james@ajinsights.com"
    - "0468 333 745"
    - "linkedin.com/in/angus-james"

# Left Column Content
left_column:
  - type: "professional_summary"
    title: "Professional Summary"
    content: |
      Senior Data Analyst with 8+ years' expertise in enterprise monitoring, analytics, and performance optimisation across government and private sectors. Proven track record designing and implementing comprehensive monitoring solutions that drive operational excellence and business insight. Skilled in translating complex technical data into actionable intelligence for stakeholders at all levels.
      
      Excels at building robust monitoring frameworks combining traditional analytics with modern observability practices. Demonstrated success implementing solutions that achieve 320-640% efficiency improvements while maintaining 99.9% system reliability. Strong background in processing large-scale datasets (100M+ records) with advanced SQL, building automated alerting systems, and creating executive-level dashboards.
      
      Recognised for rapid problem resolution through innovative agent-based troubleshooting methodologies and comprehensive root cause analysis. Adept at stakeholder management, regulatory compliance, and delivering monitoring solutions that balance technical rigour with business outcomes.

  - type: "professional_experience"
    title: "Professional Experience"
    entries:
      - company: "AJ Insights"
        location: "Sydney, NSW"
        period: "January 2023 – Present"
        role: "Founder & Lead Developer (Data Analytics & Architecture)"
        achievements:
          - "Built production-level data integration systems connecting AgriWebb, AgWorld, Gallagher, and Te Pari platforms to Microsoft Fabric"
          - "Engineered comprehensive agricultural analytics pipeline with multi-agent AI workflows including Quality Assurance and Final Analysis agents"
          - "Developed enterprise-grade solutions delivering real-time insights across 2,300+ livestock and land management operations"
          - "Implemented automated data quality validation and monitoring across multiple agricultural data sources with proactive alerting"
      
      - company: "WooliesX"
        location: "Sydney, NSW"
        period: "March 2022 – January 2023"
        role: "Senior Performance & Optimisation Analyst"
        achievements:
          - "Built Christmas 2022 campaign budget optimisation system processing 100M+ transactions driving $18.7M incremental revenue"
          - "Developed Marketing Mix Modeling (MMM) platform delivering $12.5M marketing optimisation gains through advanced SQL analytics"
          - "Created comprehensive BigW store performance monitoring framework with automated alerting and executive dashboard reporting"
          - "Implemented multi-dimensional performance analytics tracking 15+ business metrics with real-time visualisation and trend analysis"
      
      - company: "Sydney Trains"
        location: "Sydney, NSW"
        period: "May 2021 – March 2022"
        role: "Data Analyst (Contract)"
        achievements:
          - "Built machine learning monitoring system achieving 87% accuracy for passenger load predictions with continuous validation"
          - "Implemented comprehensive industrial action impact monitoring categorising 208.97K passengers with automated reporting"
          - "Developed regulatory compliance monitoring framework with audit trail generation and real-time alerting capabilities"
          - "Created executive analytics dashboards with automated report generation and performance trend tracking"
      
      - company: "Woolworths Group"
        location: "Sydney, NSW"
        period: "March 2020 – May 2021"
        role: "Senior Data Analyst"
        achievements:
          - "Built Points Cost Forecast monitoring achieving 97.8% accuracy managing $52.3M+ annual Woolworths Rewards program costs"
          - "Developed comprehensive monthly OKR/KPI reporting pipeline processing 170M+ customer transactions with automated validation"
          - "Created multi-dimensional monitoring dashboards tracking performance across 15+ business categories with drill-down analytics"
          - "Implemented automated variance analysis reducing manual monitoring overhead by 85% while improving accuracy"
      
      - company: "Mastercard"
        location: "Sydney, NSW"
        period: "June 2019 – March 2020"
        role: "Data Analyst"
        achievements:
          - "Developed comprehensive transaction monitoring framework processing 10M+ daily transactions with real-time alerting"
          - "Built automated fraud detection monitoring achieving 95% accuracy with minimal false positives"
          - "Created executive dashboards with payment network performance monitoring and trend analysis"
          - "Implemented data quality monitoring across payment systems ensuring 99.9% processing accuracy"
      
      - company: "Equifax"
        location: "Sydney, NSW"
        period: "September 2016 – August 2019"
        role: "Data Scientist (Client Analytics)"
        achievements:
          - "Developed comprehensive model monitoring system for 13 voter-prediction models achieving 3.9× performance uplift with continuous validation"
          - "Built Domino's location performance monitoring framework with 70–80% accuracy tracking across 4 international markets"
          - "Implemented automated model performance monitoring for AMEX Platinum propensity models with 1.8× uplift validation"
          - "Established comprehensive analytics pipeline monitoring with automated quality assurance and performance tracking"

  - type: "projects"
    title: "Major Monitoring & Analytics Projects"
    entries:
      - name: "Enterprise Infrastructure Monitoring Platform"
        impact: "23-min resolution • 100% fix rate • 320-640% improvement"
        description:
          - "Engineered comprehensive monitoring solution covering Windows, WSL, Docker, and multi-cloud environments with 13 custom dashboards"
          - "Implemented revolutionary 4-Agent-Fix methodology (Debugger, Deployment, Tester, Documenter) achieving 23-minute average resolution vs 4-8 hour industry standard"
          - "Built production-grade network monitoring with GlassWire integration, Wireshark deep packet inspection, and SNMP device monitoring"
          - "Created comprehensive security monitoring with dual-layer firewall intelligence and AI-powered rule suggestions"
          - "Established automated health checking with 99.9% uptime achievement and proactive issue detection"
      
      - name: "Enterprise Loyalty Program Monitoring"
        impact: "$52.3M cost tracking • 97.8% accuracy • 170M+ transactions"
        description:
          - "Built comprehensive monitoring system processing 170M+ customer transactions with real-time alerting and threshold management"
          - "Implemented advanced cost forecasting monitoring achieving 97.8% accuracy for $52.3M annual program costs"
          - "Created automated variance analysis with intelligent alerting reducing manual monitoring overhead by 85%"
          - "Designed multi-dimensional dashboard monitoring across 15+ business categories with drill-down capabilities"
          - "Established comprehensive audit trail monitoring ensuring regulatory compliance and data integrity validation"
      
      - name: "Transportation Analytics Monitoring System"
        impact: "87% ML accuracy • 208K passengers • Real-time dashboards"
        description:
          - "Developed machine learning model monitoring achieving 87% accuracy for passenger load predictions with continuous performance validation"
          - "Built comprehensive industrial action impact monitoring categorising 208.97K passengers with real-time alerting"
          - "Implemented automated regulatory compliance monitoring with audit trail generation and threshold management"
          - "Created executive dashboard monitoring with automated report generation and performance trend analysis"
          - "Established production ETL monitoring with comprehensive error handling and automated recovery procedures"

# Right Column Content
right_column:
  - type: "skills"
    title: "Monitoring & Technical Skills"
    categories:
      - name: "Monitoring & Operations"
        skills:
          - "Enterprise Infrastructure Monitoring"
          - "Prometheus, Grafana, Loki Observability Stack"
          - "System Health Monitoring & Alerting"
          - "Performance Monitoring & Optimisation"
          - "Root Cause Analysis & Troubleshooting"
          - "Dashboard Design & Implementation"
      
      - name: "Data Analysis & Processing"
        skills:
          - "Advanced SQL (processing 100M+ records)"
          - "PostgreSQL, MySQL, BigQuery"
          - "ETL/ELT Pipeline Development"
          - "Data Quality Monitoring & Validation"
          - "Statistical Analysis & Forecasting"
          - "Analytical Functions & Windowing"
      
      - name: "Log Data & Formats"
        skills:
          - "JSON, XML, CSV Processing"
          - "Plain Text Log Analysis"
          - "Structured & Unstructured Data"
          - "Real-time Log Streaming"
          - "Log Aggregation & Indexing"
          - "Pattern Recognition & Alerting"
      
      - name: "Infrastructure & DevOps"
        skills:
          - "Docker & Container Monitoring"
          - "Cloud Platform Monitoring (AWS, Azure, GCP)"
          - "CI/CD Pipeline Monitoring"
          - "Network & Security Monitoring"
          - "Automated Health Checks"
          - "Incident Response & Escalation"

  - type: "skills"
    title: "Programming & Automation"
    categories:
      - name: "Programming Languages"
        skills:
          - "Python (pandas, scikit-learn, automation)"
          - "R (statistical analysis, ggplot2)"
          - "PowerShell (Windows automation)"
          - "Bash (Linux scripting)"
          - "JavaScript/TypeScript (web applications)"
      
      - name: "Visualization & Reporting"
        skills:
          - "Tableau (Advanced) & Power BI"
          - "Interactive Dashboard Development"
          - "Real-time Data Visualization"
          - "Executive Reporting & KPI Design"
          - "Automated Report Generation"

  - type: "simple_list"
    title: "Security & Compliance"
    items:
      - "Baseline Security Clearance Eligible"
      - "Comprehensive Audit Trail Systems"
      - "Regulatory Compliance Monitoring"
      - "Security Event Detection & Response"
      - "Data Privacy & Protection"
      - "Risk Assessment & Mitigation"

  - type: "education"
    title: "Education"
    entries:
      - degree: "BACHELOR OF COMMERCE"
        institution: "Macquarie University"
        details: "Economics • Marketing • Statistics"
      
      - degree: "DIPLOMA OF BUSINESS"
        institution: "North Sydney Institute of TAFE"
        details: "Marketing"

  - type: "education"
    title: "Certifications"
    entries:
      - degree: "DATA MANIPULATION IN PYTHON"
        details: "Udemy • 2024"
      
      - degree: "COMPUTING IN PYTHON I & II"
        details: "Georgia Tech • 2020"
      
      - degree: "PREDICTIVE MODELLING (SAS)"
        details: "SAS Institute • 2017"

  - type: "strengths"
    title: "Key Strengths"
    items:
      - label: "Proven Track Record"
        description: "8+ years monitoring complex enterprise systems"
      
      - label: "Process Improvement"
        description: "320-640% troubleshooting efficiency gains"
      
      - label: "Technical Communication"
        description: "Translating complex technical concepts for stakeholders"
      
      - label: "Australian Context"
        description: "Extensive experience with Australian government and enterprise systems"
      
      - label: "Stakeholder Management"
        description: "C-level executive reporting and cross-functional collaboration"

  - type: "industry_experience"
    title: "Industry Experience"
    categories:
      - name: "Government & Public Sector"
        items:
          - "Sydney Trains (Transportation)"
          - "Regulatory Compliance Monitoring"
          - "Public Infrastructure Analytics"
      
      - name: "Retail & E-commerce"
        items:
          - "Woolworths Group, WooliesX, Big W"
          - "Enterprise System Monitoring"
          - "Loyalty Program Analytics"
      
      - name: "Financial Services"
        items:
          - "Equifax, Mastercard, Prospa"
          - "Risk Management Systems"
          - "Transaction Monitoring"
```
### GENERATE RESUME 
"""
#!/usr/bin/env python3
"""
Resume Content Injector
Injects content from YAML file into HTML template
"""

import yaml
from pathlib import Path


def generate_html_from_yaml(yaml_path: str, output_path: str):
    """
    Generate complete HTML resume from YAML content file
    
    Args:
        yaml_path: Path to YAML content file
        output_path: Path to output HTML file
    """
    # Load YAML content
    with open(yaml_path, 'r', encoding='utf-8') as f:
        content = yaml.safe_load(f)
    
    # Start building HTML
    html = generate_html_document(content)
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"✓ Generated HTML resume: {output_path}")


def generate_html_document(content: dict) -> str:
    """Generate complete HTML document with styles and content"""
    
    return f"""<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{content['header']['name']} - {content['header']['title']}</title>

  <style>
{get_styles()}
  </style>
</head>

<body>
  <div class="page">
    {generate_header(content['header'])}
    
    <div class="content">
      <!-- LEFT COLUMN -->
      <div class="col-main">
{generate_left_column(content['left_column'])}
      </div>

      <!-- RIGHT COLUMN -->
      <div class="col-aside">
{generate_right_column(content['right_column'])}
      </div>
    </div>
  </div>
</body>

</html>"""


def get_styles() -> str:
    """Return CSS styles"""
    return """    :root {
      --accent-color: #1565C0;
      --accent-light: #E3F2FD;
      --font-family: 'Segoe UI', 'Open Sans', Arial, sans-serif;
      --font-size-body: 10pt;
      --font-size-small: 9pt;
      --font-size-heading: 11pt;
      --font-size-name: 28pt;
      --font-weight-normal: 400;
      --font-weight-bold: 600;
      --line-height: 1.5;
      --padding: 0.5in;
      --spacing-xs: 2pt;
      --spacing-small: 4pt;
      --spacing-medium: 8pt;
      --spacing-large: 16pt;
      --bullet-char: '▸';
      --color-text: #212121;
      --color-secondary: #424242;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      color: var(--color-text);
      font-weight: var(--font-weight-normal);
      font-size: var(--font-size-body);
      font-family: var(--font-family);
      line-height: var(--line-height);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      padding: var(--padding);
      width: 10.5in;
      min-height: 11in;
      background-color: white;
      position: relative;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-medium);
      padding-bottom: var(--spacing-medium);
      border-bottom: 2px solid var(--accent-color);
    }

    .header-primary {
      flex: 1;
    }

    .header-content {
      display: flex;
      align-items: baseline;
      gap: 1em;
    }

    .full-name {
      color: var(--accent-color);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-name);
      line-height: 1;
    }

    .title {
      font-size: calc(var(--font-size-heading) + 2pt);
      color: var(--color-secondary);
      font-weight: var(--font-weight-normal);
    }

    .contact-details {
      display: flex;
      gap: 1em;
      font-size: var(--font-size-small);
      color: var(--color-secondary);
    }

    .contact-details span:not(:last-child)::after {
      content: '|';
      margin-left: 1em;
      color: #BDBDBD;
    }

    .content {
      display: flex;
      gap: 3%;
    }

    .col-main {
      flex: 0 0 67%;
    }

    .col-aside {
      flex: 0 0 30%;
    }

    .section {
      margin-bottom: var(--spacing-large);
    }

    .section-title {
      text-transform: uppercase;
      color: var(--accent-color);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-heading);
      border-bottom: 1px solid var(--accent-light);
      margin-bottom: var(--spacing-medium);
      padding-bottom: 2pt;
      letter-spacing: 0.5pt;
    }

    .block {
      margin-bottom: var(--spacing-large);
      margin-top: var(--spacing-medium);
    }

    .block-heading {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--spacing-xs);
    }

    .heading-primary {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-heading);
      color: var(--color-text);
    }

    .heading-secondary {
      font-size: var(--font-size-body);
      color: var(--color-secondary);
      font-style: italic;
    }

    .heading-minor {
      font-size: var(--font-size-small);
      color: var(--color-secondary);
    }

    .col-main .heading-minor {
      font-weight: var(--font-weight-bold);
    }

    .professional-summary {
      font-size: var(--font-size-body);
      color: var(--color-text);
      margin-bottom: var(--spacing-medium);
      line-height: 1.6;
    }

    ul {
      list-style: none;
      margin-left: 0;
    }

    li {
      position: relative;
      margin-bottom: var(--spacing-small);
      padding-left: 16pt;
      line-height: 1.4;
    }

    li:before {
      content: var(--bullet-char);
      position: absolute;
      left: 0;
      color: var(--accent-color);
    }

    .skills-category {
      margin-bottom: var(--spacing-large);
    }

    .skill-category-title {
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-small);
      color: var(--color-text);
      margin-bottom: var(--spacing-xs);
      text-transform: uppercase;
      letter-spacing: 0.3pt;
    }

    .skills-list {
      font-size: var(--font-size-small);
    }

    .skills-list li {
      margin-bottom: 2pt;
      padding-left: 12pt;
    }

    .col-aside .heading-primary {
      font-size: var(--font-size-small);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: var(--spacing-xs);
    }

    .project-impact {
      font-size: var(--font-size-small);
      color: var(--accent-color);
      font-weight: var(--font-weight-bold);
      white-space: nowrap;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }"""


def generate_header(header: dict) -> str:
    """Generate header section"""
    contact_spans = '\n          '.join(
        f'<span>{item}</span>' for item in header['contact']
    )
    
    return f"""    <div class="header">
      <div class="header-primary">
        <div class="header-content">
          <div class="full-name">{header['name']}</div>
          <div class="title">{header['title']}</div>
        </div>
        <div class="contact-details">
          {contact_spans}
        </div>
      </div>
    </div>"""


def generate_left_column(sections: list) -> str:
    """Generate left column content"""
    output = []
    
    for section in sections:
        if section['type'] == 'professional_summary':
            output.append(generate_professional_summary(section))
        elif section['type'] == 'professional_experience':
            output.append(generate_professional_experience(section))
        elif section['type'] == 'projects':
            output.append(generate_projects(section))
    
    return '\n'.join(output)


def generate_professional_summary(section: dict) -> str:
    """Generate professional summary section"""
    paragraphs = section['content'].strip().split('\n\n')
    para_html = '\n          '.join(f'<p>{p.strip()}</p>' for p in paragraphs)
    
    return f"""        <div class="section">
          <div class="section-title">{section['title']}</div>
          <div class="professional-summary">
            {para_html}
          </div>
        </div>"""


def generate_professional_experience(section: dict) -> str:
    """Generate professional experience section"""
    entries_html = []
    
    for entry in section['entries']:
        achievements = '\n              '.join(
            f'<li>{achievement}</li>' for achievement in entry['achievements']
        )
        
        # Check if location exists (some entries might not have it)
        location_html = f" ({entry['location']})" if 'location' in entry else ""
        
        entries_html.append(f"""          <div class="block">
            <div class="block-heading">
              <span class="heading-primary">{entry['company']}{location_html}</span>
              <span class="heading-minor">{entry['period']}</span>
            </div>
            <div class="heading-secondary">{entry['role']}</div>
            <ul>
              {achievements}
            </ul>
          </div>""")
    
    entries_str = '\n'.join(entries_html)
    
    return f"""        <div class="section">
          <div class="section-title">{section['title']}</div>
{entries_str}
        </div>"""


def generate_projects(section: dict) -> str:
    """Generate projects section"""
    entries_html = []
    
    for entry in section['entries']:
        descriptions = '\n              '.join(
            f'<li>{desc}</li>' for desc in entry['description']
        )
        
        entries_html.append(f"""          <div class="block">
            <div class="project-header">
              <span class="heading-primary">{entry['name']}</span>
              <span class="project-impact">{entry['impact']}</span>
            </div>
            <ul>
              {descriptions}
            </ul>
          </div>""")
    
    entries_str = '\n'.join(entries_html)
    
    return f"""        <div class="section">
          <div class="section-title">{section['title']}</div>
{entries_str}
        </div>"""


def generate_right_column(sections: list) -> str:
    """Generate right column content"""
    output = []
    
    for section in sections:
        if section['type'] == 'skills':
            output.append(generate_skills_section(section))
        elif section['type'] == 'simple_list':
            output.append(generate_simple_list(section))
        elif section['type'] == 'education':
            output.append(generate_education(section))
        elif section['type'] == 'strengths':
            output.append(generate_strengths(section))
        elif section['type'] == 'industry_experience':
            output.append(generate_industry_experience(section))
    
    return '\n'.join(output)


def generate_skills_section(section: dict) -> str:
    """Generate skills section with categories"""
    categories_html = []
    
    for category in section['categories']:
        skills = '\n              '.join(
            f'<li>{skill}</li>' for skill in category['skills']
        )
        
        categories_html.append(f"""          <div class="skills-category">
            <div class="skill-category-title">{category['name']}</div>
            <ul class="skills-list">
              {skills}
            </ul>
          </div>""")
    
    categories_str = '\n'.join(categories_html)
    
    return f"""        <div class="section">
          <div class="section-title">{section['title']}</div>
{categories_str}
        </div>"""


def generate_simple_list(section: dict) -> str:
    """Generate simple list section"""
    items = '\n            '.join(
        f'<li>{item}</li>' for item in section['items']
    )
    
    return f"""        <div class="section">
          <div class="section-title">{section['title']}</div>
          <ul class="skills-list">
            {items}
          </ul>
        </div>"""


def generate_education(section: dict) -> str:
    """Generate education/certifications section"""
    entries_html = []
    
    for entry in section['entries']:
        # Handle education with or without institution
        if 'institution' in entry:
            entries_html.append(f"""          <div class="block">
            <div class="heading-primary">{entry['degree']}</div>
            <div class="heading-secondary">{entry['institution']}</div>
            <div class="heading-minor">{entry['details']}</div>
          </div>""")
        else:
            entries_html.append(f"""          <div class="block">
            <div class="heading-primary">{entry['degree']}</div>
            <div class="heading-minor">{entry['details']}</div>
          </div>""")
    
    entries_str = '\n'.join(entries_html)
    
    return f"""        <div class="section">
          <div class="section-title">{section['title']}</div>
{entries_str}
        </div>"""


def generate_strengths(section: dict) -> str:
    """Generate strengths section"""
    items = '\n            '.join(
        f'<li><strong>{item["label"]}:</strong> {item["description"]}</li>' 
        for item in section['items']
    )
    
    return f"""        <div class="section">
          <div class="section-title">{section['title']}</div>
          <ul class="skills-list">
            {items}
          </ul>
        </div>"""


def generate_industry_experience(section: dict) -> str:
    """Generate industry experience section with categories"""
    categories_html = []
    
    for category in section['categories']:
        items = '\n              '.join(
            f'<li>{item}</li>' for item in category['items']
        )
        
        categories_html.append(f"""          <div class="skills-category">
            <div class="skill-category-title">{category['name']}</div>
            <ul class="skills-list">
              {items}
            </ul>
          </div>""")
    
    categories_str = '\n'.join(categories_html)
    
    return f"""        <div class="section">
          <div class="section-title">{section['title']}</div>
{categories_str}
        </div>"""


if __name__ == '__main__':
    # Generate HTML from YAML
    generate_html_from_yaml(
        yaml_path='resume_content.yaml',
        output_path='generated_resume.html'
    )
"""

### READEME
"""
# Resume Template System - User Guide

## Overview

This system separates your resume **content** from its **presentation**, allowing you to:
- Edit resume content in a simple YAML file
- Automatically generate professionally formatted HTML
- Easily swap, add, or remove sections
- Maintain multiple resume versions for different roles

## Files in This System

```
resume_content.yaml       # Your resume content (EDIT THIS!)
generate_resume.py        # Generates HTML from YAML
generated_resume.html     # Output file (auto-generated)
```

## Quick Start

### 1. Edit Your Content
Edit `resume_content.yaml` with your information:

```yaml
header:
  name: "YOUR NAME"
  title: "Your Target Role"
  contact:
    - "Location"
    - "email@example.com"
```

### 2. Generate HTML
Run the Python script:

```bash
python generate_resume.py
```

This creates `generated_resume.html` - open it in your browser!

## Managing Dynamic Sections

### Understanding Section Types

The system supports these section types:

**Left Column:**
- `professional_summary` - Paragraph text
- `professional_experience` - Jobs with achievements
- `projects` - Projects with impact metrics

**Right Column:**
- `skills` - Categorized skill lists
- `simple_list` - Plain bullet lists
- `education` - Degrees and certifications
- `strengths` - Label + description pairs
- `industry_experience` - Categorized experience

### Example: Replacing "Monitoring & Operations" with "Data Visualisation"

**Before (in YAML):**
```yaml
right_column:
  - type: "skills"
    title: "Monitoring & Technical Skills"
    categories:
      - name: "Monitoring & Operations"
        skills:
          - "Enterprise Infrastructure Monitoring"
          - "Prometheus, Grafana, Loki Observability Stack"
```

**After (in YAML):**
```yaml
right_column:
  - type: "skills"
    title: "Data Visualisation & Technical Skills"
    categories:
      - name: "Data Visualisation"
        skills:
          - "Tableau Advanced Dashboards"
          - "Power BI Custom Visuals"
          - "D3.js Interactive Visualizations"
```

### Adding a New Section

Want to add a "Publications" section? Add it to `left_column` or `right_column`:

```yaml
left_column:
  # ... existing sections ...
  
  - type: "projects"  # Reuse existing type
    title: "Publications"
    entries:
      - name: "Data Analytics in Agriculture"
        impact: "Published 2024 • 500+ citations"
        description:
          - "Research paper on ML applications in livestock management"
          - "Presented at International Data Science Conference"
```

### Removing a Section

Simply delete or comment out the section in the YAML:

```yaml
# - type: "simple_list"
#   title: "Security & Compliance"
#   items:
#     - "Baseline Security Clearance Eligible"
```

### Reordering Sections

Change the order in the YAML file - sections appear in the order listed:

```yaml
right_column:
  - type: "education"        # This appears FIRST now
    title: "Education"
    # ...
    
  - type: "skills"           # This appears SECOND
    title: "Technical Skills"
    # ...
```

## Creating Role-Specific Versions

### Strategy 1: Multiple YAML Files

Create different content files for different roles:

```
resume_content_monitoring.yaml
resume_content_data_viz.yaml
resume_content_ml.yaml
```

Modify `generate_resume.py` to use the desired file:

```python
generate_html_from_yaml(
    yaml_path='resume_content_monitoring.yaml',
    output_path='resume_monitoring.html'
)
```

### Strategy 2: Conditional Sections

Use YAML anchors for reusable content:

```yaml
# Define reusable blocks
_shared_experience: &shared_exp
  - company: "AJ Insights"
    # ... details

# Use in different configurations
left_column:
  - type: "professional_experience"
    title: "Professional Experience"
    entries: *shared_exp  # Reference shared content
```

## Advanced: Adding New Section Types

If you need a completely new layout, add a new section type:

### 1. Define in YAML

```yaml
right_column:
  - type: "custom_timeline"  # New type!
    title: "Career Timeline"
    events:
      - year: 2023
        milestone: "Founded AJ Insights"
      - year: 2022
        milestone: "Senior Analyst at WooliesX"
```

### 2. Add Handler in Python

Edit `generate_resume.py`:

```python
def generate_right_column(sections: list) -> str:
    output = []
    for section in sections:
        # ... existing handlers ...
        elif section['type'] == 'custom_timeline':
            output.append(generate_timeline(section))
    return '\n'.join(output)

def generate_timeline(section: dict) -> str:
    """Generate timeline section"""
    events_html = []
    for event in section['events']:
        events_html.append(f"""
            <div class="timeline-event">
                <strong>{event['year']}</strong>: {event['milestone']}
            </div>
        """)
    
    events_str = '\n'.join(events_html)
    return f"""
        <div class="section">
            <div class="section-title">{section['title']}</div>
            {events_str}
        </div>
    """
```

## Tips for Content Management

### 1. Use Multiline Strings
For long text, use YAML's `|` operator:

```yaml
content: |
  This is a long paragraph that spans
  multiple lines in your editor but will
  be rendered as a single paragraph.
```

### 2. Keep Bullets Concise
Each bullet should be a complete sentence:

```yaml
achievements:
  - "Built system processing 100M+ transactions achieving 95% accuracy"  # ✓ Good
  - "Built system"  # ✗ Too short
```

### 3. Quantify Impact
Include metrics in project impacts:

```yaml
impact: "$52.3M cost tracking • 97.8% accuracy • 170M+ transactions"
```

### 4. Version Control
Use Git to track changes:

```bash
git add resume_content.yaml
git commit -m "Updated for Data Analyst role"
```

### 5. Test Locally
Always generate and review the HTML before sharing:

```bash
python generate_resume.py
# Open generated_resume.html in browser
```

## Troubleshooting

### YAML Parsing Errors
- Check indentation (use 2 spaces, not tabs)
- Ensure colons have spaces after them: `name: "Value"` not `name:"Value"`
- Quote strings with special characters: `title: "Data & Analytics"`

### Missing Sections
- Verify section type matches handler in Python
- Check YAML structure matches expected format
- Look for typos in field names

### Formatting Issues
- HTML/CSS is in `generate_resume.py` - modify styles there
- Content is in YAML - keep it presentation-free

✓ **Content Focus**: Edit plain text, not HTML  
✓ **Consistency**: All resumes use same styling  
✓ **Version Control**: Easy to track changes  
✓ **Flexibility**: Swap sections for different roles  
✓ **Maintainability**: Update once, apply everywhere  
✓ **Collaboration**: Others can review YAML easily  
"""

### EXAMPLES
"""
# Content Adaptation Examples

This document shows how to adapt your resume content for different roles using the YAML template system.

## Example: Same Experience, Different Focus

### Original (Monitoring Analyst Focus)
```yaml
- company: "WooliesX"
  period: "March 2022 – January 2023"
  role: "Senior Performance & Optimisation Analyst"
  achievements:
    - "Built Christmas 2022 campaign budget optimisation system processing 100M+ transactions driving $18.7M incremental revenue"
    - "Developed Marketing Mix Modeling (MMM) platform delivering $12.5M marketing optimisation gains through advanced SQL analytics"
```

### Adapted (Data Visualization Focus)
```yaml
- company: "WooliesX"
  period: "March 2022 – January 2023"
  role: "Senior Performance & Visualization Analyst"
  achievements:
    - "Designed Marketing Mix Modeling dashboard delivering $12.5M optimization insights through advanced visualization techniques"
    - "Built interactive Tableau dashboards for Christmas 2022 campaign tracking $18.7M incremental revenue with real-time updates"
```

**Key Changes:**
- Role title emphasizes "Visualization"
- Achievements reframed to highlight dashboard design and visual techniques
- Same metrics, different lens

## Swapping Section Order for Different Roles

### For Technical/Monitoring Role
Put technical skills first:
```yaml
right_column:
  - type: "skills"
    title: "Monitoring & Technical Skills"
    # Monitoring tools first
  
  - type: "skills"
    title: "Programming & Automation"
    # Code skills second
  
  - type: "education"
    # Education third
```

### For Analyst/Visualization Role
Put visualization skills first:
```yaml
right_column:
  - type: "skills"
    title: "Visualization & Design Skills"
    # Design tools first
  
  - type: "education"
    # Education second (credentials matter more)
  
  - type: "skills"
    title: "Technical Integration"
    # Tech skills last
```

## Creating Role-Specific Sections

### Adding a Section for ML Engineer Role
```yaml
left_column:
  # ... existing sections ...
  
  - type: "projects"
    title: "Machine Learning Projects"
    entries:
      - name: "Passenger Load Prediction System"
        impact: "87% accuracy • 208K predictions • Real-time"
        description:
          - "Engineered ML pipeline achieving 87% accuracy for passenger load forecasting"
          - "Implemented continuous model monitoring with automated retraining triggers"
          - "Deployed production system processing 208K+ predictions with sub-100ms latency"
```

### Adding a Section for Business Intelligence Role
```yaml
right_column:
  - type: "strengths"
    title: "Business Impact"
    items:
      - label: "Revenue Generation"
        description: "$18.7M incremental revenue through campaign optimization"
      
      - label: "Cost Reduction"
        description: "85% reduction in manual reporting overhead"
      
      - label: "Efficiency Gains"
        description: "320-640% improvement in troubleshooting resolution time"
```

## Professional Summary Variations

### For Junior/Mid-Level Role
```yaml
professional_summary:
  content: |
    Data Analyst with 4+ years' experience building dashboards and analytics 
    solutions in retail and financial services. Skilled in SQL, Tableau, and 
    Python for data processing and visualization.
    
    Successfully delivered projects processing millions of records while 
    maintaining high accuracy and performance. Comfortable working with 
    cross-functional teams to translate business requirements into technical solutions.
```

### For Senior/Lead Role
```yaml
professional_summary:
  content: |
    Senior Data Analyst with 8+ years' expertise leading enterprise analytics 
    initiatives across government and private sectors. Proven track record 
    delivering solutions that drive multi-million dollar business impact.
    
    Recognized for innovative approaches achieving 320-640% efficiency 
    improvements while maintaining 99.9% reliability. Expert at stakeholder 
    management, translating complex technical concepts for C-level executives, 
    and mentoring junior analysts.
```

## Skill Section Customization

### Generic Skills List
```yaml
- type: "skills"
  title: "Technical Skills"
  categories:
    - name: "Languages"
      skills:
        - "Python"
        - "SQL"
        - "R"
```

### Detailed with Context
```yaml
- type: "skills"
  title: "Technical Skills"
  categories:
    - name: "Programming Languages"
      skills:
        - "Python (pandas, scikit-learn, automation)"
        - "Advanced SQL (processing 100M+ records)"
        - "R (statistical analysis, ggplot2)"
```

### Tool-Specific Focus
```yaml
- type: "skills"
  title: "Data Stack Expertise"
  categories:
    - name: "Data Warehousing"
      skills:
        - "BigQuery - Petabyte-scale queries"
        - "Snowflake - Performance optimization"
        - "Redshift - Cost management"
    
    - name: "Orchestration"
      skills:
        - "Airflow - Complex DAG design"
        - "dbt - Data transformation pipelines"
        - "Prefect - Modern workflow management"
```

## Quick Reference: Section Type Use Cases

| Section Type | Best Used For | Example |
|--------------|---------------|---------|
| `professional_summary` | Opening statement, elevator pitch | Any role |
| `professional_experience` | Work history with achievements | All resumes |
| `projects` | Showcase specific accomplishments | Technical roles |
| `skills` (categorized) | Grouped technical abilities | Technical roles |
| `simple_list` | Flat lists (certifications, tools) | Supporting info |
| `education` | Degrees, certifications | Academic credentials |
| `strengths` | Soft skills with context | Leadership roles |
| `industry_experience` | Domain expertise | Consulting, specialist |

## Content Reuse Strategy

### 1. Create a Master YAML
Keep everything in one comprehensive file:
```yaml
# master_resume_content.yaml
all_experiences:
  - company: "AJ Insights"
    monitoring_focus: "..."
    dataviz_focus: "..."
    ml_focus: "..."
```

### 2. Extract for Specific Roles
Use Python to filter:
```python
# Create role-specific YAML from master
with open('master_resume_content.yaml') as f:
    master = yaml.safe_load(f)

monitoring_resume = {
    'header': master['header'],
    'left_column': master['all_experiences']['monitoring_focus'],
    # ...
}
```

### 3. Use YAML Anchors
Define once, reference everywhere:
```yaml
_base_contact: &contact
  - "Sydney, NSW"
  - "angus.james@ajinsights.com"

header:
  name: "ANGUS JAMES"
  title: "Data Analyst"
  contact: *contact  # Reuse

header_alt:
  name: "ANGUS JAMES"
  title: "ML Engineer"
  contact: *contact  # Same contact info
```

## Testing Different Versions

```bash
# Generate monitoring version
python generate_resume.py

# Generate data viz version
# Modify generate_resume.py to use resume_content_dataviz.yaml
python generate_resume.py

# Compare side by side
open generated_resume.html generated_resume_dataviz.html
```

## Tips for Maximum Flexibility

1. **Keep Metrics Portable**: Write achievements with metrics that work across roles
   ```yaml
   # Good (works for any role)
   - "Processing 100M+ records daily"
   
   # Too specific
   - "Used Prometheus to monitor 100M+ records"
   ```

2. **Separate Tools from Outcomes**: Lead with impact, mention tools secondarily
   ```yaml
   # Good
   - "Achieved 97.8% forecasting accuracy using advanced statistical modeling"
   
   # Tool-heavy
   - "Used Prophet and ARIMA models in Python"
   ```

3. **Use Layered Sections**: Create main + supplementary sections
   ```yaml
   # Main skills (always included)
   - type: "skills"
     title: "Core Competencies"
   
   # Optional add-on (include for senior roles)
   - type: "strengths"
     title: "Leadership Qualities"
   ```

4. **Version Control Your Content**: 
   ```bash
   git commit -m "Updated for Data Viz role - emphasized Tableau/PBI"
   git tag resume-dataviz-v1
   ```

## Conclusion

The YAML template system gives you maximum flexibility to:
- Maintain one source of truth for your experience
- Quickly generate role-specific versions
- Test different content arrangements
- Track changes over time
- Reuse successful patterns

Remember: The content is the same, only the **framing** and **emphasis** changes!
"""