# Provider Testing Framework

## Overview

This testing framework provides a systematic way to test all LLM providers configured in the Resume Polisher App with identical job requirements, ensuring consistent comparison across providers.

## Directory Structure

```
tests/provider-tests/
├── README.md                    # This file
├── input/                       # Test input data
│   └── job-requirements.md      # Job posting for Senior Data Analyst role
├── output/                      # Generated resumes (created during testing)
├── logs/                        # Test logs and reports
└── scripts/                     # Test scripts
    └── test-all-providers.js    # Main test orchestration script
```

## Test Configuration

### Job Position
- **Title**: Senior Data Analyst
- **Company**: JD Ross Energy
- **Location**: Sydney NSW (Hybrid)
- **Salary**: AUD 900-1000 per day

### Resume Data
- **Template**: `/home/thunder/projects/resume/resume-ai-framework/polished-resume/angus-james-senior-data-analyst-aps6-monitoring.html`
- **Database**: `/home/thunder/projects/resume/resume-ai-framework/curator-output-master-reume`

### Providers Being Tested

| # | Provider | Model | API Key Source | Cost |
|---|----------|-------|----------------|------|
| 1 | Anthropic | claude-sonnet-4-5 | ANTHROPIC_API_KEY | $3/$15 per 1M |
| 2 | Anthropic | claude-3-5-haiku-20241022 | ANTHROPIC_API_KEY | $1/$5 per 1M |
| 3 | OpenAI | gpt-4o | OPENAI_APIKEY | $2.50/$10 per 1M |
| 4 | OpenRouter | moonshotai/kimi-k2:free | OPENROUTER_API_KEY | FREE |
| 5 | OpenRouter | openai/gpt-5-nano | OPENROUTER_API_KEY | $0.05/$0.20 per 1M |
| 6 | ZhipuAI | GLM-4.5-Flash | ZAI_API_KEY | $0.10/$0.10 per 1M |
| 7 | GitHub Models | gpt-4o | GITHUB_API_KEY | FREE (rate limited) |
| 8 | GitHub Models | claude-3-5-sonnet | GITHUB_API_KEY | FREE (rate limited) |
| 9 | MCP Server | claude-via-mcp | (none) | FREE (uses quota) |

## Quick Start

### 1. Run Test Framework Script

```bash
# From project root
cd tests/provider-tests
node scripts/test-all-providers.js
```

This will:
- Verify test data exists
- Load API keys from `.env`
- Generate test logs for each provider
- Create a comprehensive test report

### 2. Manual Testing (Recommended for Actual Resume Generation)

Since the test script only validates configuration, you need to run the actual app to generate resumes:

```bash
# Start the Electron app
npm start
```

Then for each provider:

1. **Configure Provider**
   - Select provider from Setup page
   - Choose the model specified in the test matrix
   - Enter API key (from .env file)
   - Initialize API

2. **Load Test Data**
   - Job Requirements: Copy from `tests/provider-tests/input/job-requirements.md`
   - Resume Template: `/home/thunder/projects/resume/resume-ai-framework/polished-resume/angus-james-senior-data-analyst-aps6-monitoring.html`
   - Resume Database: `/home/thunder/projects/resume/resume-ai-framework/curator-output-master-reume`

3. **Generate Resume**
   - Click "Extract Requirements" (or paste job requirements)
   - Load resume database
   - Load template
   - Generate tailored resume

4. **Save Output**
   - Export to: `tests/provider-tests/output/<provider>-<model>-<timestamp>.html`
   - Take screenshots of results
   - Note any errors or issues

## Testing Checklist

### Prerequisites
- [ ] All API keys configured in `.env`
- [ ] Resume template exists
- [ ] Resume database exists
- [ ] MCP server running (for MCP tests)
- [ ] Tailscale connected (for MCP tests)

### For Each Provider
- [ ] API initialization successful
- [ ] Job requirements extracted/loaded
- [ ] Resume database loaded
- [ ] Template loaded
- [ ] Resume generated without errors
- [ ] Streaming output displayed
- [ ] Token usage tracked
- [ ] Cost calculated correctly
- [ ] Output saved to file
- [ ] HTML validates

### Quality Checks
- [ ] Resume tailored to job requirements
- [ ] Power BI/DAX skills emphasized
- [ ] Data visualization experience highlighted
- [ ] SQL and database skills prominent
- [ ] Relevant technologies mentioned
- [ ] Australian English spelling
- [ ] Professional formatting
- [ ] No hallucinations or errors

## Expected Results

### Success Criteria
Each provider should generate a tailored resume that:
1. **Emphasizes relevant skills**:
   - Power BI, DAX, Power Query, SQL
   - Data visualization and reporting
   - SharePoint, Microsoft Lists integration
   - Cloud platforms and APIs

2. **Highlights matching experience**:
   - Data analysis and reporting
   - Dashboard development
   - Stakeholder collaboration
   - Data governance

3. **Maintains quality**:
   - Professional formatting
   - Australian English
   - No technical errors
   - Proper HTML structure

### Performance Benchmarks
- **Generation Time**: 30-120 seconds (varies by model)
- **Token Usage**: 3,000-8,000 total tokens (varies by model)
- **Cost**: $0.00-$0.30 per resume (varies by provider)

## Troubleshooting

### Common Issues

**"API key not initialized"**
- Check `.env` file exists
- Verify API key is valid
- Try reinitializing in Setup page

**"anthropicClient is not defined"**
- Fixed in latest version
- Rebuild app: `npm run build`

**"MCP server health check failed"**
- Ensure MCP server is running
- Check Tailscale connection
- Verify server at `http://100.64.204.61:8734`

**"Rate limit exceeded" (GitHub Models)**
- Wait 1 minute (15/minute limit)
- Or wait until next day (150/day limit)
- Try different model (separate quotas)

**Generation hangs/freezes**
- Check console for errors
- Verify streaming is working
- Try different provider
- Restart app

### Provider-Specific Notes

**Anthropic**:
- Most reliable for production
- Best quality resumes
- Higher cost
- Fast streaming

**OpenAI**:
- Good balance of quality/cost
- Reliable API
- Standard formatting

**OpenRouter**:
- Access to many models
- Free options available (Moonshot Kimi)
- Variable quality by model
- Some models may be slow

**ZhipuAI**:
- Chinese AI provider
- Cost-effective
- May have regional restrictions
- Good for multilingual resumes

**GitHub Models**:
- **FREE** tier!
- Perfect for testing
- Rate limits manageable for individual use
- Multiple model options

**MCP Server**:
- Advanced feature
- Requires Tailscale
- Free if Claude Pro subscriber
- Slower than direct API

## Automated Testing (Future Enhancement)

The current framework is a manual testing aid. Future enhancements could include:

1. **Headless Electron Testing**
   - Puppeteer integration
   - Automated resume generation
   - Screenshot capture
   - HTML validation

2. **Resume Quality Metrics**
   - Keyword matching score
   - Skill coverage analysis
   - Formatting validation
   - Readability metrics

3. **Performance Benchmarking**
   - Generation time tracking
   - Token usage analysis
   - Cost comparison
   - Error rate monitoring

4. **Regression Testing**
   - Compare outputs over time
   - Detect quality degradation
   - Track API changes
   - Version compatibility

## Test Reports

Test reports are generated in `logs/` directory with format:
```
test-report-YYYY-MM-DDTHH-MM-SS-SSSZ.md
```

Each report includes:
- Test configuration
- Results summary
- Per-provider details
- Job requirements
- Execution notes

## Contributing

To add a new provider to tests:

1. **Update `.env`**:
   ```bash
   NEW_PROVIDER_API_KEY=your-key-here
   ```

2. **Update `scripts/test-all-providers.js`**:
   ```javascript
   {
     name: 'newprovider',
     displayName: 'New Provider Name',
     model: 'model-name',
     apiKeyEnv: 'NEW_PROVIDER_API_KEY',
     baseURL: 'https://api.newprovider.com/v1'
   }
   ```

3. **Run tests**:
   ```bash
   node scripts/test-all-providers.js
   ```

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review test logs in `logs/` directory
3. Check main app documentation
4. Report issues with full log output

## Changelog

### v1.0.0 - 2025-10-30
- Initial test framework
- 9 provider configurations
- Manual testing guide
- Automated validation script
- Test report generation
